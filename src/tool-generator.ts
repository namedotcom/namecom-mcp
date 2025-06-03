import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { OpenApiOperation, OpenApiSpec } from "./types.js";
import { loadOpenApiSpec, openApiSchemaToZod, resolveSchemaRef, getSchemaExample } from "./openapi-utils.js";

/**
 * Recursively flatten object properties into individual parameters with dot notation
 */
function flattenObjectProperties(
  schema: any, 
  params: Record<string, z.ZodTypeAny>, 
  prefix: string, 
  requiredFields: string[],
  parameterTypes: Record<string, 'array' | 'object' | 'simple'> = {}
): void {
  if (!schema.properties) return;
  
  for (const [propName, propSchema] of Object.entries(schema.properties)) {
    const fullPropName = prefix ? `${prefix}.${propName}` : propName;
    const isPropRequired = requiredFields.includes(propName);
    const resolvedPropSchema = resolveSchemaRef(propSchema as any);
    
    if (resolvedPropSchema.type === 'object' && resolvedPropSchema.properties) {
      // Recursively flatten nested objects
      flattenObjectProperties(
        resolvedPropSchema, 
        params, 
        fullPropName, 
        resolvedPropSchema.required || [],
        parameterTypes
      );
    } else if (resolvedPropSchema.type === 'object' && resolvedPropSchema.additionalProperties) {
      // Handle objects with additionalProperties (like tldRequirements)
      // Treat as a simple string input that will be parsed as JSON
      const description = resolvedPropSchema.description || `Key-value object: ${fullPropName}`;
      params[fullPropName] = z.string().optional()
        .describe(description + ' (JSON string: {"key1":"value1","key2":"value2"})');
      parameterTypes[fullPropName] = 'object';
    } else if (resolvedPropSchema.type === 'array' && resolvedPropSchema.items) {
      const itemSchema = resolveSchemaRef(resolvedPropSchema.items);
      
      if (itemSchema.type === 'object' && itemSchema.properties) {
        // For arrays of objects, create a single parameter that accepts the array
        const description = resolvedPropSchema.description || `Array of objects: ${fullPropName}`;
        params[fullPropName] = openApiSchemaToZod(resolvedPropSchema, isPropRequired)
          .describe(description);
        parameterTypes[fullPropName] = 'array';
      } else {
        // For arrays of simple types (like string arrays for nameservers)
        // Treat as a simple string input that will be parsed as comma-separated values
        const description = resolvedPropSchema.description || `Array of ${itemSchema.type || 'values'}: ${fullPropName}`;
        params[fullPropName] = z.string().optional()
          .describe(description + ' (comma-separated: ns1.example.com,ns2.example.com)');
        parameterTypes[fullPropName] = 'array';
      }
    } else {
      // For simple properties (string, number, boolean)
      const description = resolvedPropSchema.description || `Parameter: ${fullPropName}`;
      params[fullPropName] = openApiSchemaToZod(resolvedPropSchema, isPropRequired)
        .describe(description);
      parameterTypes[fullPropName] = 'simple';
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
import { callNameApi } from "./api-client.js";
import { DEFAULT_VALUES, NAME_API_URL } from "./config.js";

/**
 * Create MCP tools from OpenAPI specification
 */
export async function createToolsFromSpec(server: McpServer): Promise<boolean> {
  const spec = await loadOpenApiSpec();
  if (!spec) {
    // Don't use console.error as it interferes with MCP protocol
    return false;
  }
  
  // Process each path in the spec
  for (const [pathStr, pathItem] of Object.entries(spec.paths)) {
    // Process each HTTP method for the path
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(method) || !operation) continue;
      
      const typedOperation = operation as OpenApiOperation;
      const operationId = typedOperation.operationId || `${method}${pathStr.replace(/\//g, '_').replace(/[{}]/g, '')}`;
      
      // Build parameter schema from OpenAPI spec
      const params: Record<string, z.ZodTypeAny> = {};
      const pathParams: string[] = [];
      const queryParams: string[] = [];
      const parameterTypes: Record<string, 'array' | 'object' | 'simple'> = {};
      
      // Process operation parameters
      if (typedOperation.parameters) {
        for (const param of typedOperation.parameters) {
          if (param.schema) {
            // Check if the parameter is required (path parameters are always required)
            const isRequired = param.required === true || param.in === 'path';
            
            // Create Zod schema
            params[param.name] = openApiSchemaToZod(param.schema, isRequired)
              .describe(param.description || '');
            
            // Keep track of path and query parameters
            if (param.in === 'path') {
              pathParams.push(param.name);
            } else if (param.in === 'query') {
              queryParams.push(param.name);
            }
          }
        }
      }
      
      // Add request body parameters if applicable
      if (typedOperation.requestBody?.content?.['application/json']?.schema) {
        const rawBodySchema = typedOperation.requestBody.content['application/json'].schema;
        const isBodyRequired = typedOperation.requestBody.required === true;
        
        // Fully resolve the schema including all references and composition constructs (allOf, oneOf, anyOf)
        const resolvedBodySchema = resolveSchemaRef(rawBodySchema);
        
        // Handle request body properties - flatten ALL nested objects to individual parameters
        if (resolvedBodySchema.properties) {
          flattenObjectProperties(resolvedBodySchema, params, '', resolvedBodySchema.required || [], parameterTypes);
        } else if (resolvedBodySchema.type === 'object' && !resolvedBodySchema.properties) {
          // Handle case where schema is an object without explicit properties
          params['body'] = z.object({}).optional().describe('Request body object');
        } else if (resolvedBodySchema.type) {
          // Handle case where schema is a primitive type
          params['body'] = openApiSchemaToZod(resolvedBodySchema, isBodyRequired)
            .describe('Request body');
        }
      }
      
      // Create the MCP tool
      server.tool(
        operationId,
        params,
        async (toolParams: Record<string, any>) => {
          try {
            // Start with the base path
            let apiPath = pathStr;
            
            // The new Core API paths already include /core/v1/ prefix
            // No need to modify the path since it comes directly from the OpenAPI spec
            
            // Extract path parameters, query parameters, and body parameters
            const pathParamValues: Record<string, any> = {};
            const queryParamValues: Record<string, any> = {};
            const bodyParams: Record<string, any> = {};
            
            // Process provided parameters
            for (const [key, value] of Object.entries(toolParams)) {
              if (value !== undefined) {  // Only process defined values
                if (pathParams.includes(key)) {
                  pathParamValues[key] = value;
                } else if (queryParams.includes(key)) {
                  queryParamValues[key] = value;
                } else {
                  // Handle flattened dot notation parameters for body
                  let processedValue = value;
                  
                  // Special handling for array and object string inputs based on schema type
                  if (typeof value === 'string' && value.trim()) {
                    const paramType = parameterTypes[key];
                    
                    if (paramType === 'array') {
                      // Parse comma-separated values into array
                      processedValue = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
                    } else if (paramType === 'object') {
                      // Parse JSON string into object
                      try {
                        processedValue = JSON.parse(value);
                      } catch (e) {
                        // If JSON parsing fails, keep as string - the API will handle the error
                        processedValue = value;
                      }
                    }
                    // For 'simple' type, keep as string (no processing needed)
                  }
                  
                  setNestedProperty(bodyParams, key, processedValue);
                }
              }
            }
            
            // Apply defaults for query parameters if they're not provided
            for (const key of queryParams) {
              if (queryParamValues[key] === undefined && DEFAULT_VALUES[key] !== undefined) {
                queryParamValues[key] = DEFAULT_VALUES[key];
              }
            }
            
            // Replace path parameters - handle both {param} and :param formats
            for (const [key, value] of Object.entries(pathParamValues)) {
              apiPath = apiPath.replace(`{${key}}`, String(value));
              apiPath = apiPath.replace(`:${key}`, String(value));
            }
            
            // Add query parameters if needed
            if (Object.keys(queryParamValues).length > 0) {
              const queryString = Object.entries(queryParamValues)
                .filter(([_, value]) => value !== undefined) // Skip undefined values
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
                .join('&');
              
              if (queryString) {
                apiPath = `${apiPath}${apiPath.includes('?') ? '&' : '?'}${queryString}`;
              }
            }
            
            // Make the API call with the right parameters
            let requestBody = null;
            
            // Only include body for POST, PUT, PATCH methods
            if (method === 'post' || method === 'put' || method === 'patch') {
              // If there are body parameters, include them
              if (Object.keys(bodyParams).length > 0) {
                // Filter out undefined values from body params
                const filteredBodyParams: Record<string, any> = {};
                for (const [key, value] of Object.entries(bodyParams)) {
                  if (value !== undefined) {
                    filteredBodyParams[key] = value;
                  }
                }
                
                requestBody = filteredBodyParams;
              }
            }
            
            const result = await callNameApi(apiPath, method.toUpperCase(), requestBody);
            
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
      );
    }
  }

  // Add static help tools
  addHelpTools(server);
  
  return true;
}

/**
 * Add help and support tools to the server
 */
function addHelpTools(server: McpServer): void {
  // General help tool
  server.tool(
    'namecom_help',
    {
      topic: z.string().optional().describe('Specific help topic (leave empty for general help)')
    },
    async (args) => {
      const { topic } = args;
      
      if (!topic || topic.toLowerCase() === 'general') {
        const helpText = `# Name.com MCP Server Help

This is an experimental MCP server that provides access to Name.com's domain management API.

## Key Information:
- **Environment**: Currently using ${NAME_API_URL.includes('dev') ? 'TEST/DEV' : 'PRODUCTION'} environment
- **Safe to experiment**: ${NAME_API_URL.includes('dev') ? 'Yes! You\'re in the safe test environment.' : 'CAUTION: You\'re in production mode!'}

## Common Operations:
- **Domain Search**: "Search for available domains with name X"
- **List Domains**: "List my domains" or "Show my domains"
- **DNS Records**: "Show DNS records for domain X"
- **Domain Registration**: "Register domain X" (test environment only)

## Getting More Help:
- **Troubleshooting**: Say "I'm having trouble with Name.com" or "Help me troubleshoot issues"
- **Examples**: Ask "Show me some examples" or "What can I do with this?"  
- **Support**: Ask "How do I report an issue?" or "Where can I get support?"

## Available Operations:
This server automatically generates capabilities from Name.com's API. You can ask me about domain management in natural language - I'll handle the technical details behind the scenes.

**Just talk to me naturally!** You don't need to know specific command names.

Environment: ${NAME_API_URL.includes('dev') ? 'test' : 'production'}
Safe to experiment: ${NAME_API_URL.includes('dev')}`;

        return {
          content: [{
            type: "text",
            text: helpText
          }]
        };
      }
      
      if (topic.toLowerCase() === 'troubleshooting') {
        const troubleshootingText = `# Troubleshooting Name.com MCP Server

## Common Issues:

### Authentication Errors:
- **Problem**: "Authentication failed" or "Invalid credentials"
- **What to say**: "I'm getting authentication errors" or "My credentials aren't working"
- **Solution**: 
  1. Verify your NAME_USERNAME and NAME_TOKEN environment variables
  2. Check that your API token is active in your Name.com account
  3. Ensure you're using the correct environment (test vs production)

### API Rate Limits:
- **Problem**: "Rate limit exceeded" or "Too many requests"
- **What to say**: "I'm hitting rate limits" or "Getting too many requests errors"
- **Solution**: Wait a few minutes before retrying. Name.com has rate limits to protect their API.

### Permission Errors:
- **Problem**: "Access denied" or "Insufficient permissions"
- **What to say**: "I'm getting permission denied errors"
- **Solution**: Check that your API token has the necessary permissions in your Name.com account settings.

### Operations Not Working:
- **Problem**: Specific operation isn't working
- **What to say**: "This isn't working" or "I can't do X" - be specific about what you're trying to do
- **Solution**: Try describing what you want in natural language. I'll figure out the right way to do it.

### Environment Confusion:
- **Problem**: "My real domains don't show up"
- **What to say**: "What environment am I using?" or "Am I in test mode?"
- **Solution**: Ask me to check your environment status - you might be in test mode.

## Still Having Issues?
Just say: "How do I report this issue?" or "Where can I get support?" and I'll help you find the right channels.

Current environment: ${NAME_API_URL.includes('dev') ? 'test/development' : 'production'}`;

        return {
          content: [{
            type: "text",
            text: troubleshootingText
          }]
        };
      }
      
      if (topic.toLowerCase() === 'examples') {
        const examplesText = `# Name.com MCP Server Examples

## What You Can Say:

### Domain Search Examples:
- "Search for available domains with the name 'mycompany'"
- "Check if example123.com is available"
- "Find available .dev domains with 'startup' in the name"
- "Show me .com alternatives for 'mybusiness'"

### Domain Management Examples:
- "List all my domains"
- "Show me details for example.com"
- "When does my domain expire?"
- "What domains do I own?"

### DNS Examples:
- "Show me the DNS records for example.com"
- "List the nameservers for my domain"
- "What A records exist for example.com?"
- "Add a CNAME record for www pointing to example.com"

### Account & Billing Examples:
- "Show my account information"
- "What's the pricing for .com domains?"
- "How much does it cost to renew example.com?"

## How to Talk to Me:
- **Be conversational**: "Can you help me find available domains?"
- **Be specific**: Include domain names, record types, or other details
- **Ask follow-ups**: "Now show me the DNS records for that domain"
- **Express intent clearly**: "I want to register a domain" vs "I want to check if it's available"

## Test Environment Safety:
${NAME_API_URL.includes('dev') ? 
  '✅ You\'re in the safe test environment - feel free to experiment!' : 
  '⚠️  You\'re in production mode - be careful with destructive operations!'}

💡 **Pro tip**: Just describe what you want to do in plain English. I'll translate that into the right API calls automatically!`;

        return {
          content: [{
            type: "text",
            text: examplesText
          }]
        };
      }
      
      return {
        content: [{
          type: "text",
          text: `Unknown help topic: ${topic}\n\nAvailable topics: general, troubleshooting, examples`
        }]
      };
    }
  );

  // Support and issue reporting tool
  server.tool(
    'namecom_support_links',
    {},
    async () => {
      const supportText = `# Name.com MCP Server Support

## 🐛 Report Issues or Request Features:
**GitHub Issues**: https://github.com/namedotcom/namecom-mcp/issues

## ✨ Share Feedback:
We want your feedback! This is an experimental tool and your input helps us improve it.
**GitHub Issues**: https://github.com/namedotcom/namecom-mcp/issues

## 📚 Documentation:
**README**: https://github.com/namedotcom/namecom-mcp#readme

## 🔧 Name.com API Documentation:
**API Docs**: https://docs.name.com

## 💬 Community:
- Check existing issues before creating new ones
- Include error messages and steps to reproduce issues
- Mention your environment (test vs production)
- Share your use case - it helps us prioritize features!

## Quick Links:
- **Report Bug**: https://github.com/namedotcom/namecom-mcp/issues/new?template=bug_report.md
- **Request Feature**: https://github.com/namedotcom/namecom-mcp/issues/new?template=feature_request.md
- **General Feedback**: https://github.com/namedotcom/namecom-mcp/issues/new
- **Documentation**: https://github.com/namedotcom/namecom-mcp#readme

Current environment: ${NAME_API_URL.includes('dev') ? 'test/development' : 'production'}

## Getting Support - Just Ask Me:
- **"How do I report a bug?"** - I'll give you the bug report link
- **"I want to request a feature"** - I'll show you how to request features  
- **"Where's the documentation?"** - I'll point you to the docs
- **"I need help with the Name.com API"** - I'll give you API documentation
- **"Who can I contact for support?"** - I'll help you find the right channels

## Tips for Reporting Issues:
- Include error messages and steps to reproduce when reporting bugs
- Check existing issues first - your question might already be answered
- Mention if you're using test or production environment
- No feedback is too small - we appreciate all input!`;

      return {
        content: [{
          type: "text",
          text: supportText
        }]
      };
    }
  );

  // Environment status tool
  server.tool(
    'namecom_environment_status', 
    {},
    async () => {
      const statusText = `# Name.com MCP Server Environment Status

**Environment**: ${NAME_API_URL.includes('dev') ? 'test/development' : 'production'}
**API URL**: ${NAME_API_URL}
**Safe to experiment**: ${NAME_API_URL.includes('dev') ? 'Yes' : 'No'}

## Current Status:
${NAME_API_URL.includes('dev') ? 
  '✅ You are in the safe test environment. Feel free to experiment!' :
  '⚠️  CAUTION: You are in production mode. Real operations will affect your actual domains and account.'}

## Recommendation:
${NAME_API_URL.includes('dev') ?
  'Perfect for learning and testing the MCP server capabilities.' :
  'Double-check all operations before confirming. Consider switching to test environment for experimentation.'}`;

      return {
        content: [{
          type: "text",
          text: statusText
        }]
      };
    }
  );
}

/**
 * Create fallback tools when OpenAPI spec loading fails
 */
export function createFallbackTools(server: McpServer): void {
  // Add basic hello tool as fallback using the new Core API endpoint
  server.tool(
    "HelloFunc",
    {},
    async () => {
      try {
        const data = await callNameApi('/core/v1/hello');
        return {
          content: [{
            type: "text",
            text: JSON.stringify(data, null, 2)
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
  );

  // Add help tools even in fallback mode
  addHelpTools(server);
} 