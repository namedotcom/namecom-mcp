import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { OpenApiOperation, OpenApiSpec } from "./types.js";
import { loadOpenApiSpec, openApiSchemaToZod, resolveSchemaRef, getSchemaExample } from "./openapi-utils.js";
import { callNameApi } from "./api-client.js";
import { DEFAULT_VALUES, NAME_API_URL } from "./config.js";

/**
 * Helper functions to create the help and support tools
 */
function addHelpTools(server: McpServer): void {
  server.tool(
    "GetHelpResources",
    {},
    async () => ({
      content: [
        {
          type: 'text',
          text: 'name.com Help Resources:\n• Documentation: https://www.name.com/api-docs\n• Support: https://www.name.com/support\n• API Reference: https://api.name.com/docs'
        }
      ]
    })
  );

  server.tool(
    "GetFeedbackLinks",
    {},
    async () => ({
      content: [
        {
          type: 'text',
          text: 'Feedback Links:\n• Rate this MCP server: [GitHub Issues](https://github.com/namedotcom/namecom-mcp/issues)\n• Feature requests: [GitHub Discussions](https://github.com/namedotcom/namecom-mcp/discussions)\n• Bug reports: [GitHub Issues](https://github.com/namedotcom/namecom-mcp/issues/new)'
        }
      ]
    })
  );

  server.tool(
    "GetTroubleshootingInfo",
    {},
    async () => ({
      content: [
        {
          type: 'text',
          text: 'Troubleshooting:\n• Check API credentials in environment variables\n• Verify domain ownership for domain operations\n• Check account balance for purchases\n• Review API rate limits: https://www.name.com/api-docs/rate-limits'
        }
      ]
    })
  );
}

/**
 * Convert dot notation parameter names to valid MCP parameter names
 * e.g., "account.contacts.admin.firstName" becomes "account_contacts_admin_firstName"
 */
function sanitizeParameterName(name: string): string {
  return name.replace(/\./g, '_');
}

/**
 * Recursively flatten object properties into individual parameters with sanitized names
 */
function flattenObjectProperties(
  schema: any, 
  params: Record<string, z.ZodTypeAny>, 
  prefix: string, 
  requiredFields: string[],
  parameterTypes: Record<string, 'array' | 'object' | 'simple'> = {},
  originalPathMap: Record<string, string> = {}
): void {
  if (!schema.properties) return;
  
  for (const [propName, propSchema] of Object.entries(schema.properties)) {
    const fullPropName = prefix ? `${prefix}.${propName}` : propName;
    const sanitizedPropName = sanitizeParameterName(fullPropName);
    const isPropRequired = requiredFields.includes(propName);
    const resolvedPropSchema = resolveSchemaRef(propSchema as any);
    
    // Store mapping from sanitized name back to original dot notation
    originalPathMap[sanitizedPropName] = fullPropName;
    
    if (resolvedPropSchema.type === 'object' && resolvedPropSchema.properties) {
      // Recursively flatten nested objects
      flattenObjectProperties(
        resolvedPropSchema, 
        params, 
        fullPropName, 
        resolvedPropSchema.required || [],
        parameterTypes,
        originalPathMap
      );
    } else if (resolvedPropSchema.type === 'object' && resolvedPropSchema.additionalProperties) {
      // Handle objects with additionalProperties (like tldRequirements)
      // Treat as a simple string input that will be parsed as JSON
      const description = resolvedPropSchema.description || `Key-value object: ${fullPropName}`;
      params[sanitizedPropName] = z.string().optional()
        .describe(description + ' (JSON string: {"key1":"value1","key2":"value2"})');
      parameterTypes[sanitizedPropName] = 'object';
    } else if (resolvedPropSchema.type === 'array' && resolvedPropSchema.items) {
      const itemSchema = resolveSchemaRef(resolvedPropSchema.items);
      
      if (itemSchema.type === 'object' && itemSchema.properties) {
        // For arrays of objects, create a single parameter that accepts the array
        const description = resolvedPropSchema.description || `Array of objects: ${fullPropName}`;
        params[sanitizedPropName] = openApiSchemaToZod(resolvedPropSchema, isPropRequired)
          .describe(description);
        parameterTypes[sanitizedPropName] = 'array';
      } else {
        // For arrays of simple types (like string arrays for nameservers)
        // Treat as a simple string input that will be parsed as comma-separated values
        const description = resolvedPropSchema.description || `Array of ${itemSchema.type || 'values'}: ${fullPropName}`;
        params[sanitizedPropName] = z.string().optional()
          .describe(description + ' (comma-separated: ns1.example.com,ns2.example.com)');
        parameterTypes[sanitizedPropName] = 'array';
      }
    } else {
      // For simple properties (string, number, boolean)
      const description = resolvedPropSchema.description || `Parameter: ${fullPropName}`;
      params[sanitizedPropName] = openApiSchemaToZod(resolvedPropSchema, isPropRequired)
        .describe(description);
      parameterTypes[sanitizedPropName] = 'simple';
    }
  }
}

/**
 * Set a nested property using dot notation (e.g., "domain.contacts.registrant.firstName")
 */
function setNestedProperty(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

/**
 * Interface for consolidated operation
 */
interface ConsolidatedOperation {
  operationId: string;
  method: string;
  path: string;
  operation: OpenApiOperation;
  tag: string;
}

/**
 * Create consolidated MCP tools from OpenAPI specification
 */
export async function createToolsFromSpec(server: McpServer): Promise<boolean> {
  const spec = await loadOpenApiSpec();
  if (!spec || !spec.paths) {
    return false;
  }

  const operationsByTag: Record<string, ConsolidatedOperation[]> = {};

  // Extract all unique HTTP methods from the spec dynamically
  const supportedMethods = new Set<string>();
  for (const pathItem of Object.values(spec.paths)) {
    for (const method of Object.keys(pathItem)) {
      // Only include valid HTTP methods (exclude non-method properties like 'parameters', 'summary', etc.)
      if (typeof pathItem[method] === 'object' && pathItem[method]?.operationId) {
        supportedMethods.add(method.toLowerCase());
      }
    }
  }

  for (const [pathStr, pathItem] of Object.entries(spec.paths)) {
    // Process each HTTP method for the path using dynamically detected methods
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!supportedMethods.has(method.toLowerCase()) || !operation) continue;
      
      const typedOperation = operation as OpenApiOperation;
      const operationId = typedOperation.operationId || `${method}${pathStr.replace(/\//g, '_').replace(/[{}]/g, '')}`;
      
      // Skip deprecated operations
      if (typedOperation.deprecated === true || operationId === 'CreateAccount') {
        continue;
      }
      
      // Get the primary tag for this operation
      const tag = typedOperation.tags?.[0] || 'Other';
      
      if (!operationsByTag[tag]) {
        operationsByTag[tag] = [];
      }
      
      operationsByTag[tag].push({
        operationId,
        method,
        path: pathStr,
        operation: typedOperation,
        tag
      });
    }
  }

  // Create consolidated tools for each tag
  for (const [tag, operations] of Object.entries(operationsByTag)) {
    await createConsolidatedTool(server, tag, operations);
  }

  // Add help and support tools that are always available to users
  addHelpTools(server);

  return true;
}

/**
 * Analyze operation to determine operation type using OpenAPI spec data
 */
function analyzeOperation(method: string, path: string, operationId: string, operation: OpenApiOperation): string {
  const upperMethod = method.toUpperCase();
  
  // Check if this operation has path parameters (more reliable than string matching)
  const hasPathParams = operation.parameters?.some(param => param.in === 'path') || false;
  
  const opIdLower = operationId.toLowerCase();
  
  // Handle specific webhook operations (simple one-off fix)
  if (opIdLower === 'subscribetonotification') return 'create';
  if (opIdLower === 'getsubscribednotifications') return 'list';
  if (opIdLower === 'modifysubscription') return 'modify';
  if (opIdLower === 'deletesubscription') return 'delete';
  
  // Dynamic pattern-based inference from operationId (most reliable)
  if (opIdLower.startsWith('list')) return 'list';
  if (opIdLower.startsWith('get') && hasPathParams) return 'get';
  if (opIdLower.startsWith('get') && !hasPathParams) return 'list';
  if (opIdLower.startsWith('create')) return 'create';
  if (opIdLower.startsWith('update')) return 'update';
  if (opIdLower.startsWith('delete')) return 'delete';
  
  // Check for special colon-based operations in path (dynamic extraction)
  if (path.includes(':')) {
    const colonPart = path.split(':')[1];
    if (colonPart) {
      const colonOp = colonPart.toLowerCase();
      // Map colon operations to standard operations
      if (colonOp === 'checkavailability') return 'check';
      if (colonOp === 'search') return 'search';
      if (colonOp.includes('contact')) return 'setContacts';
      if (colonOp.includes('nameserver')) return 'setNameservers';
      // For other colon operations, use the colon part as the operation
      return colonOp;
    }
  }
  
  // Dynamic keyword-based analysis (checks operation summary and description too)
  const textToAnalyze = [
    opIdLower,
    operation.summary?.toLowerCase() || '',
    operation.description?.toLowerCase() || ''
  ].join(' ');
  

  
  // Check for domain-specific operations
  if (textToAnalyze.includes('availability') || textToAnalyze.includes('check')) return 'check';
  if (textToAnalyze.includes('search') || textToAnalyze.includes('suggest')) return 'search';
  if (textToAnalyze.includes('renew') || textToAnalyze.includes('renewal')) return 'renew';
  if (textToAnalyze.includes('transfer') && upperMethod === 'POST') return 'create';
  if (textToAnalyze.includes('cancel')) return 'cancel';
  if (textToAnalyze.includes('subscribe') || textToAnalyze.includes('notification')) return 'subscribe';
  if (textToAnalyze.includes('privacy') && upperMethod === 'POST') return 'purchasePrivacy';
  if (textToAnalyze.includes('lock') || textToAnalyze.includes('unlock') || textToAnalyze.includes('enable') || textToAnalyze.includes('disable')) return 'update';
  
  // Handle other modify operations
  if (textToAnalyze.includes('modify') || textToAnalyze.includes('update subscription')) return 'modify';
  
  // Fallback to HTTP method + path parameter analysis
  switch (upperMethod) {
    case 'GET':
      return hasPathParams ? 'get' : 'list';
    case 'POST':
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      // Final fallback: use operationId as-is but normalized
      return operationId.toLowerCase();
  }
}

/**
 * Create operation descriptions using OpenAPI metadata
 */
function createOperationDescriptions(tag: string, operations: ConsolidatedOperation[], uniqueOperations: string[]): string {
  const operationDetails: string[] = [];
  
  for (const opType of uniqueOperations) {
    const matchingOps = operations.filter(op => analyzeOperation(op.method, op.path, op.operationId, op.operation) === opType);
    
    if (matchingOps.length === 1) {
      const op = matchingOps[0];
      const summary = op.operation.summary || op.operationId;
      const description = op.operation.description ? 
        op.operation.description.split('.')[0] + '.' : '';
      
      // Add specific guidance for various domain functionality
      let guidance = '';
      if (tag.toLowerCase() === 'domains') {
        if (opType === 'search') {
          guidance = ' - PREFERRED for domain discovery: Finds creative domain suggestions and alternatives based on keywords. Use this when exploring domain options or when the user wants to see what\'s available. Only use TLDFilter param if the user asks for a specific TLD or TLD list. If they provide tlds with a ., ignore the . and just pass the tlds.';
        } else if (opType === 'check') {
          guidance = ' - Use ONLY for validating specific domains: Checks if exact domain names are available. Use this only when the user asks about specific domains they already have in mind.';
        } else if (opType === 'create') {
          guidance = ' - Creates a new domain. Use this only when the user asks to create a new domain. If the user has contact information from other owned domains, use that information. If not, get it from the user first and confirm with the user that the contact info they provided looks correct before purchasing. Do not autofill fake contact information.';
        }
      }
      
      operationDetails.push(`"${opType}": ${summary}${description ? ' - ' + description : ''}${guidance}`);
    } else if (matchingOps.length > 1) {
      // Use the first operation's summary as representative
      const op = matchingOps[0];
      const summary = op.operation.summary || `${opType} operations`;
      operationDetails.push(`"${opType}": ${summary}`);
    } else {
      // Fallback for operations without matches
      operationDetails.push(`"${opType}": ${opType} operations for ${tag.toLowerCase()}`);
    }
  }
  
  return `The operation to perform. Options:\n${operationDetails.join('\n')}`;
}

/**
 * Dynamically generate tool name from tag
 */
function generateToolName(tag: string, operations: ConsolidatedOperation[]): string {
  // Handle common acronyms that should stay uppercase
  const preserveAcronyms = (text: string): string => {
    return text
      .replace(/\bDns(?=[A-Z]|$)/g, 'DNS')
      .replace(/\bDnssecs?(?=[A-Z]|$)/g, 'DNSSECs')
      .replace(/\bUrl(?=[A-Z]|$)/g, 'URL')
      .replace(/\bApi(?=[A-Z]|$)/g, 'API')
      .replace(/\bHttp(?=[A-Z]|$)/g, 'HTTP')
      .replace(/\bSsl(?=[A-Z]|$)/g, 'SSL')
      .replace(/\bTls(?=[A-Z]|$)/g, 'TLS')
      .replace(/\bIp(?=[A-Z]|$)/g, 'IP')
      .replace(/\bTcp(?=[A-Z]|$)/g, 'TCP')
      .replace(/\bUdp(?=[A-Z]|$)/g, 'UDP');
  };

  // Clean the tag name: remove special characters, convert to PascalCase
  let cleanTag = tag
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
    .split(/\s+/) // Split on whitespace
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // PascalCase
    .join('');
  
  // Apply acronym preservation
  cleanTag = preserveAcronyms(cleanTag);
  
  // For single operations, use the operation name directly (like Hello, CheckAccountBalance)
  if (operations.length === 1) {
    const op = operations[0];
    // Try to use a clean version of the operationId
    if (op.operationId) {
      // Convert from camelCase to PascalCase
      return op.operationId.charAt(0).toUpperCase() + op.operationId.slice(1);
    }
    // Fallback to tag-based name
    return cleanTag;
  }
  
  // For multi-operation tags, prefix with "Manage"
  return `Manage${cleanTag}`;
}

/**
 * Create a consolidated tool for a specific tag category
 */
async function createConsolidatedTool(server: McpServer, tag: string, operations: ConsolidatedOperation[]): Promise<void> {
  const toolName = generateToolName(tag, operations);
  
  // For single-operation tags, keep the original behavior
  if (operations.length === 1) {
    const op = operations[0];
    await createSingleOperationTool(server, op);
    return;
  }
  
  // For multi-operation tags, create consolidated tool
  const operationEnum = operations.map(op => analyzeOperation(op.method, op.path, op.operationId, op.operation)).filter(Boolean) as string[];
  const uniqueOperations = [...new Set(operationEnum)];
  
  if (uniqueOperations.length === 0) {
    // Fallback to individual tools if we can't infer operations
    for (const op of operations) {
      await createSingleOperationTool(server, op);
    }
    return;
  }
  
  // Build operation descriptions with specific guidance
  const operationDescriptions = createOperationDescriptions(tag, operations, uniqueOperations);
  
  // Build consolidated parameter schema
  const params: Record<string, z.ZodTypeAny> = {
    operation: z.enum(uniqueOperations as [string, ...string[]])
      .describe(operationDescriptions)
  };
  
  // Collect all possible parameters from all operations
  const allParams: Record<string, z.ZodTypeAny> = {};
  const allParameterTypes: Record<string, 'array' | 'object' | 'simple'> = {};
  const allOriginalPathMap: Record<string, string> = {};
  
  for (const op of operations) {
    const opParams = await extractOperationParameters(op);
    Object.assign(allParams, opParams.params);
    Object.assign(allParameterTypes, opParams.parameterTypes);
    Object.assign(allOriginalPathMap, opParams.originalPathMap);
  }
  
  // Add all parameters as optional (they'll be validated per operation)
  for (const [paramName, paramSchema] of Object.entries(allParams)) {
    params[paramName] = paramSchema.optional();
  }
  
  // Create the consolidated tool
  server.tool(
    toolName,
    params,
    async (toolParams: Record<string, any>) => {
      const { operation: requestedOperation, ...otherParams } = toolParams;
      
      // Find the matching operation
      const matchingOp = operations.find(op => 
        analyzeOperation(op.method, op.path, op.operationId, op.operation) === requestedOperation
      );
      
      if (!matchingOp) {
        return {
          isError: true,
          content: [{
            type: "text",
            text: `Error: Operation '${requestedOperation}' not supported for ${tag}`
          }]
        };
      }
      
      // Execute the operation
      return await executeOperation(matchingOp, otherParams, allParameterTypes, allOriginalPathMap);
    }
  );
}

/**
 * Extract parameters from an operation
 */
async function extractOperationParameters(op: ConsolidatedOperation): Promise<{
  params: Record<string, z.ZodTypeAny>;
  parameterTypes: Record<string, 'array' | 'object' | 'simple'>;
  originalPathMap: Record<string, string>;
}> {
  const params: Record<string, z.ZodTypeAny> = {};
  const parameterTypes: Record<string, 'array' | 'object' | 'simple'> = {};
  const originalPathMap: Record<string, string> = {};
  
  // Process operation parameters
  if (op.operation.parameters) {
    for (const param of op.operation.parameters) {
      if (param.schema) {
        const isRequired = param.required === true || param.in === 'path';
        params[param.name] = openApiSchemaToZod(param.schema, isRequired)
          .describe(param.description || '');
        parameterTypes[param.name] = 'simple';
      }
    }
  }
  
  // Add request body parameters if applicable
  if (op.operation.requestBody?.content?.['application/json']?.schema) {
    const rawBodySchema = op.operation.requestBody.content['application/json'].schema;
    const resolvedBodySchema = resolveSchemaRef(rawBodySchema);
    
    if (resolvedBodySchema.properties) {
      flattenObjectProperties(
        resolvedBodySchema, 
        params, 
        '', 
        resolvedBodySchema.required || [], 
        parameterTypes, 
        originalPathMap
      );
    }
  }
  
  return { params, parameterTypes, originalPathMap };
}

/**
 * Execute a specific operation
 */
async function executeOperation(
  op: ConsolidatedOperation,
  params: Record<string, any>,
  parameterTypes: Record<string, 'array' | 'object' | 'simple'>,
  originalPathMap: Record<string, string>
): Promise<any> {
  try {
    let apiPath = op.path;
    const pathParams: Record<string, any> = {};
    const queryParams: Record<string, any> = {};
    const bodyParams: Record<string, any> = {};
    
    // Categorize parameters
    if (op.operation.parameters) {
      for (const param of op.operation.parameters) {
        if (params[param.name] !== undefined) {
          if (param.in === 'path') {
            pathParams[param.name] = params[param.name];
          } else if (param.in === 'query') {
            queryParams[param.name] = params[param.name];
          }
        }
      }
    }
    
    // Handle body parameters
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && !pathParams[key] && !queryParams[key]) {
        let processedValue = value;
        
        // Special handling for array and object string inputs
        if (typeof value === 'string' && value.trim()) {
          const paramType = parameterTypes[key];
          
          if (paramType === 'array') {
            processedValue = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
          } else if (paramType === 'object') {
            try {
              processedValue = JSON.parse(value);
            } catch (e) {
              processedValue = value;
            }
          }
        }
        
        const originalPath = originalPathMap[key] || key;
        setNestedProperty(bodyParams, originalPath, processedValue);
      }
    }
    
    // Apply defaults for query parameters
    for (const key of Object.keys(queryParams)) {
      if (queryParams[key] === undefined && DEFAULT_VALUES[key] !== undefined) {
        queryParams[key] = DEFAULT_VALUES[key];
      }
    }
    
    // Replace path parameters
    for (const [key, value] of Object.entries(pathParams)) {
      apiPath = apiPath.replace(`{${key}}`, String(value));
    }
    
    // Add query parameters
    if (Object.keys(queryParams).length > 0) {
      const queryString = Object.entries(queryParams)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
      
      if (queryString) {
        apiPath = `${apiPath}${apiPath.includes('?') ? '&' : '?'}${queryString}`;
      }
    }
    
    // Prepare request body
    let requestBody = null;
    if (['post', 'put', 'patch'].includes(op.method)) {
      if (Object.keys(bodyParams).length > 0) {
        const filteredBodyParams: Record<string, any> = {};
        for (const [key, value] of Object.entries(bodyParams)) {
          if (value !== undefined) {
            filteredBodyParams[key] = value;
          }
        }
        requestBody = filteredBodyParams;
      }
    }
    
    const result = await callNameApi(apiPath, op.method.toUpperCase(), requestBody);
    
    // Special formatting for CheckAccountBalance to display currency properly
    if (op.operationId === 'CheckAccountBalance' && result && typeof result.balance === 'number') {
      return {
        content: [{
          type: "text",
          text: `Account Balance: $${result.balance.toFixed(2)}`
        }]
      };
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      isError: true,
      content: [{
        type: "text",
        text: `Error: ${errorMessage}`
      }]
    };
  }
}

/**
 * Create a single operation tool (for tags with only one operation)
 */
async function createSingleOperationTool(server: McpServer, op: ConsolidatedOperation): Promise<void> {
  const { params, parameterTypes, originalPathMap } = await extractOperationParameters(op);
  
  server.tool(
    op.operationId,
    params,
    async (toolParams: Record<string, any>) => {
      return await executeOperation(op, toolParams, parameterTypes, originalPathMap);
    }
  );
}

/**
 * Create fallback tools when OpenAPI spec loading fails
 */
export function createFallbackTools(server: McpServer): void {
  server.tool(
    'Hello',
    {},
    async () => ({
      content: [{
        type: "text",
        text: "Hello from the name.com MCP Server! 🌐\n\nThis server provides AI assistants with access to name.com's domain management API.\n\nAvailable operations include:\n• Domain registration and management\n• DNS record management\n• Email forwarding setup\n• URL forwarding configuration\n• Account information retrieval\n\nTo get started, try asking about domain availability or listing your domains."
      }]
    })
  );
  
  server.tool(
    'CheckAccountBalance',
    {},
    async () => {
      try {
        const result = await callNameApi('/core/v1/accountinfo/balance', 'GET');
        return {
          content: [{
            type: "text",
            text: `Account Balance: $${result.balance || '0.00'}`
          }]
        };
      } catch (error) {
        return {
          isError: true,
          content: [{
            type: "text",
            text: `Error checking account balance: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );
} 
