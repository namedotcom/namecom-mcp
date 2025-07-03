import { z } from "zod";
import { loadOpenApiSpec, openApiSchemaToZod, resolveSchemaRef } from "./openapi-utils.js";
import { callNameApi } from "./api-client.js";
import { DEFAULT_VALUES } from "./config.js";
/**
 * Helper functions to create the help and support tools
 */
function addHelpTools(server) {
    server.tool("GetHelpResources", {}, async () => ({
        content: [
            {
                type: 'text',
                text: 'name.com Help Resources:\n• Documentation: https://www.name.com/api-docs\n• Support: https://www.name.com/support\n• API Reference: https://api.name.com/docs'
            }
        ]
    }));
    server.tool("GetFeedbackLinks", {}, async () => ({
        content: [
            {
                type: 'text',
                text: 'Feedback Links:\n• Rate this MCP server: [GitHub Issues](https://github.com/namedotcom/namecom-mcp/issues)\n• Feature requests: [GitHub Discussions](https://github.com/namedotcom/namecom-mcp/discussions)\n• Bug reports: [GitHub Issues](https://github.com/namedotcom/namecom-mcp/issues/new)'
            }
        ]
    }));
    server.tool("GetTroubleshootingInfo", {}, async () => ({
        content: [
            {
                type: 'text',
                text: 'Troubleshooting:\n• Check API credentials in environment variables\n• Verify domain ownership for domain operations\n• Check account balance for purchases\n• Review API rate limits: https://www.name.com/api-docs/rate-limits'
            }
        ]
    }));
}
/**
 * Convert dot notation parameter names to valid MCP parameter names
 * e.g., "account.contacts.admin.firstName" becomes "account_contacts_admin_firstName"
 */
function sanitizeParameterName(name) {
    return name.replace(/\./g, '_');
}
/**
 * Convert underscore notation back to dot notation for API requests
 * e.g., "account_contacts_admin_firstName" becomes "account.contacts.admin.firstName"
 */
function desanitizeParameterName(name) {
    return name.replace(/_/g, '.');
}
/**
 * Convert camelCase or snake_case to readable text
 */
function humanizePropertyName(name) {
    const lastPart = name.split(/[._]/).pop() || name;
    return lastPart
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}
/**
 * Recursively flatten object properties into individual parameters with sanitized names
 */
export function flattenObjectProperties(schema, params, prefix, requiredFields, parameterTypes = {}, originalPathMap = {}) {
    if (!schema.properties)
        return;
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const fullPropName = prefix ? `${prefix}.${propName}` : propName;
        const sanitizedPropName = sanitizeParameterName(fullPropName);
        const isPropRequired = requiredFields.includes(propName);
        const resolvedPropSchema = resolveSchemaRef(propSchema);
        // Store mapping from sanitized name back to original dot notation
        originalPathMap[sanitizedPropName] = fullPropName;
        if (resolvedPropSchema.type === 'object' && resolvedPropSchema.properties) {
            // Recursively flatten nested objects
            flattenObjectProperties(resolvedPropSchema, params, fullPropName, resolvedPropSchema.required || [], parameterTypes, originalPathMap);
        }
        else if (resolvedPropSchema.type === 'object' && resolvedPropSchema.additionalProperties) {
            // Handle objects with additionalProperties (like tldRequirements)
            const description = `${isPropRequired ? 'REQUIRED' : 'OPTIONAL'} - ${resolvedPropSchema.description?.split('.')[0] || 'Key-value object'}`;
            params[sanitizedPropName] = z.string().optional()
                .describe(description);
            parameterTypes[sanitizedPropName] = 'object';
        }
        else if (resolvedPropSchema.type === 'array' && resolvedPropSchema.items) {
            const itemSchema = resolveSchemaRef(resolvedPropSchema.items);
            if (itemSchema.type === 'object' && itemSchema.properties) {
                const description = `${isPropRequired ? 'REQUIRED' : 'OPTIONAL'} - ${resolvedPropSchema.description?.split('.')[0] || 'Array of objects'}`;
                params[sanitizedPropName] = openApiSchemaToZod(resolvedPropSchema, isPropRequired)
                    .describe(description);
                parameterTypes[sanitizedPropName] = 'array';
            }
            else {
                const description = `${isPropRequired ? 'REQUIRED' : 'OPTIONAL'} - ${resolvedPropSchema.description?.split('.')[0] || `Array of ${itemSchema.type || 'values'}`}`;
                params[sanitizedPropName] = z.string().optional()
                    .describe(description);
                parameterTypes[sanitizedPropName] = 'array';
            }
        }
        else {
            // For simple properties (string, number, boolean)
            let baseDescription = resolvedPropSchema.title ||
                resolvedPropSchema.description?.split('.')[0] ||
                humanizePropertyName(fullPropName);
            // Special handling for purchasePrice based on schema requirements
            if (propName === 'purchasePrice') {
                baseDescription = 'Required ONLY for premium domains (where domain search/check shows premium: true). For standard domains (premium: false): ALWAYS OMIT this parameter - registration will auto-calculate total cost (including multi-year), renewal will use standard pricing, and transfer will use standard pricing';
            }
            let description = `${isPropRequired ? 'REQUIRED' : 'OPTIONAL'} - ${baseDescription}`;
            // Add example if present
            if (resolvedPropSchema.example) {
                description += ` (e.g., ${resolvedPropSchema.example})`;
            }
            // Add pattern information if present
            if (resolvedPropSchema.pattern) {
                description += ` (must match pattern: ${resolvedPropSchema.pattern})`;
            }
            // Add enum information if present
            if (resolvedPropSchema.enum) {
                description += ` (valid values: ${resolvedPropSchema.enum.join(', ')})`;
            }
            // Add min/max information if present
            if (resolvedPropSchema.minLength !== undefined) {
                description += ` (min length: ${resolvedPropSchema.minLength})`;
            }
            if (resolvedPropSchema.maxLength !== undefined) {
                description += ` (max length: ${resolvedPropSchema.maxLength})`;
            }
            if (resolvedPropSchema.minimum !== undefined) {
                description += ` (min value: ${resolvedPropSchema.minimum})`;
            }
            if (resolvedPropSchema.maximum !== undefined) {
                description += ` (max value: ${resolvedPropSchema.maximum})`;
            }
            // Add nullable information if explicitly set
            if (resolvedPropSchema.nullable === true) {
                description += ' (null values allowed)';
            }
            // Add validation combinations if present
            if (resolvedPropSchema.allOf) {
                description += ' (must satisfy all conditions)';
            }
            if (resolvedPropSchema.oneOf) {
                description += ' (must satisfy exactly one condition)';
            }
            if (resolvedPropSchema.anyOf) {
                description += ' (must satisfy at least one condition)';
            }
            // For optional parameters, add default value if specified in schema
            if (!isPropRequired && resolvedPropSchema.default !== undefined) {
                description += ` (defaults to: ${resolvedPropSchema.default})`;
            }
            params[sanitizedPropName] = openApiSchemaToZod(resolvedPropSchema, isPropRequired)
                .describe(description);
            parameterTypes[sanitizedPropName] = 'simple';
        }
    }
}
/**
 * Set a nested property using dot notation
 * e.g., "domain.contacts.registrant.firstName" sets obj.domain.contacts.registrant.firstName
 */
function setNestedProperty(obj, path, value) {
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
 * Create consolidated MCP tools from OpenAPI specification
 */
export async function createToolsFromSpec(server) {
    const spec = await loadOpenApiSpec();
    if (!spec || !spec.paths) {
        return false;
    }
    const operationsByTag = {};
    // Extract all unique HTTP methods from the spec dynamically
    const supportedMethods = new Set();
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
            if (!supportedMethods.has(method.toLowerCase()) || !operation)
                continue;
            const typedOperation = operation;
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
function analyzeOperation(method, path, operationId, operation) {
    const upperMethod = method.toUpperCase();
    // Check if this operation has path parameters (more reliable than string matching)
    const hasPathParams = operation.parameters?.some(param => param.in === 'path') || false;
    const opIdLower = operationId.toLowerCase();
    // Handle specific webhook operations (simple one-off fix)
    if (opIdLower === 'subscribetonotification')
        return 'create';
    if (opIdLower === 'getsubscribednotifications')
        return 'list';
    if (opIdLower === 'modifysubscription')
        return 'modify';
    if (opIdLower === 'deletesubscription')
        return 'delete';
    // Dynamic pattern-based inference from operationId (most reliable)
    if (opIdLower.startsWith('list'))
        return 'list';
    if (opIdLower.startsWith('get') && hasPathParams)
        return 'get';
    if (opIdLower.startsWith('get') && !hasPathParams)
        return 'list';
    if (opIdLower.startsWith('create'))
        return 'create';
    if (opIdLower.startsWith('update'))
        return 'update';
    if (opIdLower.startsWith('delete'))
        return 'delete';
    // Check for special colon-based operations in path (dynamic extraction)
    if (path.includes(':')) {
        const colonPart = path.split(':')[1];
        if (colonPart) {
            const colonOp = colonPart.toLowerCase();
            // Map colon operations to standard operations
            if (colonOp === 'checkavailability')
                return 'check';
            if (colonOp === 'search')
                return 'search';
            if (colonOp.includes('contact'))
                return 'setContacts';
            if (colonOp.includes('nameserver'))
                return 'setNameservers';
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
    if (textToAnalyze.includes('availability') || textToAnalyze.includes('check'))
        return 'check';
    if (textToAnalyze.includes('search') || textToAnalyze.includes('suggest'))
        return 'search';
    if (textToAnalyze.includes('renew') || textToAnalyze.includes('renewal'))
        return 'renew';
    if (textToAnalyze.includes('transfer') && upperMethod === 'POST')
        return 'create';
    if (textToAnalyze.includes('cancel'))
        return 'cancel';
    if (textToAnalyze.includes('subscribe') || textToAnalyze.includes('notification'))
        return 'subscribe';
    if (textToAnalyze.includes('privacy') && upperMethod === 'POST')
        return 'purchasePrivacy';
    if (textToAnalyze.includes('lock') || textToAnalyze.includes('unlock') || textToAnalyze.includes('enable') || textToAnalyze.includes('disable'))
        return 'update';
    // Handle other modify operations
    if (textToAnalyze.includes('modify') || textToAnalyze.includes('update subscription'))
        return 'modify';
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
function createOperationDescriptions(tag, operations, uniqueOperations) {
    const operationDetails = [];
    for (const opType of uniqueOperations) {
        const matchingOps = operations.filter(op => analyzeOperation(op.method, op.path, op.operationId, op.operation) === opType);
        if (matchingOps.length === 1) {
            const op = matchingOps[0];
            const summary = op.operation.summary || op.operationId;
            const description = op.operation.description ?
                op.operation.description.split('.')[0] + '.' : '';
            // Add specific guidance for various domain functionality
            let guidance = ' - Parameter names must be used exactly as listed (e.g., `domain_domainName`). Do not modify or simplify.';
            if (tag.toLowerCase() === 'domains') {
                if (opType === 'search') {
                    guidance += ' For domain discovery: finds creative suggestions. Use TLDFilter only if a specific TLD/list is requested; ignore \`.\` in TLDs.';
                }
                else if (opType === 'check') {
                    guidance += ' Use ONLY for validating specific domains: checks exact domain availability. Use only when user asks about specific domains.';
                }
                else if (opType === 'create') {
                    guidance += ' Creates a new domain. Use only when user asks to create. If contact info from other domains exists, use it. Otherwise, get and confirm contact info from user before purchasing; do not autofill fake contact information.';
                }
            }
            operationDetails.push(`${opType}: ${summary}${description ? ' - ' + description : ''}${guidance}`);
        }
        else if (matchingOps.length > 0) {
            // Use the first operation's summary as representative
            const op = matchingOps[0];
            const summary = op.operation.summary || `${opType} operations`;
            operationDetails.push(`${opType}: ${summary}`);
        }
        else {
            // Fallback for operations without matches
            operationDetails.push(`${opType}: ${opType} operations for ${tag.toLowerCase()}`);
        }
    }
    return `The operation to perform. Options:\n${operationDetails.join('\n')}`;
}
/**
 * Dynamically generate tool name from tag
 */
function generateToolName(tag, operations) {
    // Handle common acronyms that should stay uppercase
    const preserveAcronyms = (text) => {
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
async function createConsolidatedTool(server, tag, operations) {
    const toolName = generateToolName(tag, operations);
    // For single-operation tags, keep the original behavior
    if (operations.length === 1) {
        const op = operations[0];
        await createSingleOperationTool(server, op);
        return;
    }
    // For multi-operation tags, create consolidated tool
    const operationEnum = operations.map(op => analyzeOperation(op.method, op.path, op.operationId, op.operation)).filter(Boolean);
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
    const params = {
        operation: z.enum([uniqueOperations[0], ...uniqueOperations.slice(1)])
            .describe(operationDescriptions)
    };
    // Track parameters and their requirements per operation
    const operationParams = {};
    // Initialize operation parameter tracking
    for (const opType of uniqueOperations) {
        operationParams[opType] = {
            required: new Set(),
            optional: new Set()
        };
    }
    // Collect operation-specific parameters
    for (const op of operations) {
        const opType = analyzeOperation(op.method, op.path, op.operationId, op.operation);
        const { params: opParams } = await extractOperationParameters(op);
        // Check each parameter's requirements for this operation
        for (const [paramName, paramSchema] of Object.entries(opParams)) {
            if (!paramSchema.isOptional()) {
                operationParams[opType].required.add(paramName);
            }
            else {
                operationParams[opType].optional.add(paramName);
            }
        }
    }
    // Collect all unique parameters
    const allParams = {};
    const allParameterTypes = {};
    const allOriginalPathMap = {};
    for (const op of operations) {
        const { params: opParams, parameterTypes, originalPathMap } = await extractOperationParameters(op);
        Object.assign(allParams, opParams);
        Object.assign(allParameterTypes, parameterTypes);
        Object.assign(allOriginalPathMap, originalPathMap);
    }
    // Add parameters with operation-specific requirements
    for (const [paramName, paramSchema] of Object.entries(allParams)) {
        // Find which operations use this parameter
        const requiredBy = uniqueOperations.filter(opType => operationParams[opType].required.has(paramName));
        const optionalFor = uniqueOperations.filter(opType => operationParams[opType].optional.has(paramName));
        // Get the original description without the REQUIRED/OPTIONAL prefix
        const baseDescription = (paramSchema.description || '').replace(/^(REQUIRED|OPTIONAL) - /, '');
        // Build the new description
        let newDescription = '';
        if (requiredBy.length > 0) {
            newDescription = `REQUIRED for: ${requiredBy.join(', ')}`;
            if (optionalFor.length > 0) {
                newDescription += `, OPTIONAL for: ${optionalFor.join(', ')}`;
            }
            newDescription += ` - ${baseDescription}`;
            // Make it required if it's required for all operations
            params[paramName] = requiredBy.length === uniqueOperations.length ?
                paramSchema.describe(newDescription) :
                paramSchema.optional().describe(newDescription);
        }
        else if (optionalFor.length > 0) {
            newDescription = `OPTIONAL for: ${optionalFor.join(', ')} - ${baseDescription}`;
            params[paramName] = paramSchema.optional().describe(newDescription);
        }
    }
    // Create the consolidated tool
    server.tool(toolName, params, async (toolParams) => {
        const { operation: requestedOperation, ...otherParams } = toolParams;
        // Find the matching operation
        const matchingOp = operations.find(op => analyzeOperation(op.method, op.path, op.operationId, op.operation) === requestedOperation);
        if (!matchingOp) {
            return {
                isError: true,
                content: [{
                        type: "text",
                        text: `Error: Operation '${requestedOperation}' not supported for ${tag}`
                    }]
            };
        }
        // Get valid parameters for this operation
        const opParamInfo = operationParams[requestedOperation];
        const validParams = new Set([...opParamInfo.required, ...opParamInfo.optional]);
        // Check for invalid parameters
        const invalidParams = Object.keys(otherParams).filter(param => !validParams.has(param));
        if (invalidParams.length > 0) {
            const validParamsList = [...validParams].sort().join(', ');
            const requiredParamsList = [...opParamInfo.required].sort().join(', ');
            return {
                isError: true,
                content: [{
                        type: "text",
                        text: `Error: Invalid parameters for operation '${requestedOperation}': ${invalidParams.join(', ')}\n\nValid parameters:\nRequired: ${requiredParamsList || 'none'}\nOptional: ${validParamsList}`
                    }]
            };
        }
        // Check for missing required parameters
        const missingRequired = [...opParamInfo.required].filter(param => !(param in otherParams));
        if (missingRequired.length > 0) {
            return {
                isError: true,
                content: [{
                        type: "text",
                        text: `Error: Missing required parameters for operation '${requestedOperation}':\n${missingRequired.map(param => `- ${param}: ${params[param].description}`).join('\n')}`
                    }]
            };
        }
        // Execute the operation
        return await executeOperation(matchingOp, otherParams, allParameterTypes, allOriginalPathMap);
    });
}
/**
 * Extract parameters from an operation
 */
async function extractOperationParameters(op) {
    const params = {};
    const parameterTypes = {};
    const originalPathMap = {};
    // Process operation parameters
    if (op.operation.parameters) {
        for (const param of op.operation.parameters) {
            if (param.schema) {
                const isRequired = param.required === true || param.in === 'path';
                const description = (param.description || '') +
                    ` (${isRequired ? 'Required' : 'Optional'}${param.in === 'path' ? ', path parameter' : ''})`;
                params[param.name] = openApiSchemaToZod(param.schema, isRequired)
                    .describe(description);
                parameterTypes[param.name] = 'simple';
            }
        }
    }
    // Add request body parameters if applicable
    if (op.operation.requestBody?.content?.['application/json']?.schema) {
        const rawBodySchema = op.operation.requestBody.content['application/json'].schema;
        const resolvedBodySchema = resolveSchemaRef(rawBodySchema);
        if (resolvedBodySchema.properties) {
            flattenObjectProperties(resolvedBodySchema, params, '', resolvedBodySchema.required || [], parameterTypes, originalPathMap);
        }
    }
    return { params, parameterTypes, originalPathMap };
}
/**
 * Execute a specific operation
 */
async function executeOperation(op, params, parameterTypes, originalPathMap) {
    try {
        let apiPath = op.path;
        const pathParams = {};
        const queryParams = {};
        const bodyParams = {};
        // Categorize parameters
        if (op.operation.parameters) {
            for (const param of op.operation.parameters) {
                if (params[param.name] !== undefined) {
                    if (param.in === 'path') {
                        pathParams[param.name] = params[param.name];
                    }
                    else if (param.in === 'query') {
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
                    }
                    else if (paramType === 'object') {
                        try {
                            processedValue = JSON.parse(value);
                        }
                        catch (e) {
                            processedValue = value;
                        }
                    }
                }
                // Convert underscore parameter name back to dot notation for the API
                const originalPath = originalPathMap[key] || desanitizeParameterName(key);
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
                const filteredBodyParams = {};
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
    }
    catch (error) {
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
async function createSingleOperationTool(server, op) {
    const { params, parameterTypes, originalPathMap } = await extractOperationParameters(op);
    server.tool(op.operationId, params, async (toolParams) => {
        return await executeOperation(op, toolParams, parameterTypes, originalPathMap);
    });
}
/**
 * Create error guidance tools when OpenAPI spec loading fails
 */
export function createFallbackTools(server) {
    server.tool('GetSetupHelp', {}, async () => ({
        content: [{
                type: "text",
                text: "⚠️ The name.com MCP server is not configured correctly.\n\n" +
                    "To fix this:\n" +
                    "1. Check environment variables:\n" +
                    "   NAME_USERNAME, NAME_TOKEN\n\n" +
                    "2. Verify API credentials at name.com\n\n" +
                    "3. Resources:\n" +
                    "   • API Docs: https://docs.name.com\n" +
                    "   • Support: https://www.name.com/support\n" +
                    "   • Issues: https://github.com/namedotcom/namecom-mcp/issues"
            }]
    }));
    server.tool('CheckConfiguration', {}, async () => {
        try {
            await callNameApi('/core/v1/hello', 'GET');
            return {
                content: [{
                        type: "text",
                        text: "✅ API credentials are valid but the OpenAPI spec failed to load.\n\n" +
                            "Try: restart server, check connection, or report issue"
                    }]
            };
        }
        catch (error) {
            return {
                isError: true,
                content: [{
                        type: "text",
                        text: "❌ API credentials are invalid or the API is unreachable.\n\n" +
                            "Error: " + (error instanceof Error ? error.message : String(error))
                    }]
            };
        }
    });
}
