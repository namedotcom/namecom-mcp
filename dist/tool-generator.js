import { z } from "zod";
import { loadOpenApiSpec, openApiSchemaToZod, resolveSchemaRef } from "./openapi-utils.js";
import { callNameApi } from "./api-client.js";
import { DEFAULT_VALUES, NAME_API_URL } from "./config.js";
/**
 * Helper functions to create the help and support tools
 */
function addHelpTools(server) {
    server.tool("GetHelpResources", {}, async () => {
        return {
            content: [{
                    type: "text",
                    text: `# Name.com Help Resources

## Documentation & Guides
- **Knowledge Base**: https://www.name.com/support
- **API Documentation**: https://docs.name.com

## Getting Support
- **Contact Support**: https://www.name.com/contact

## Community & Resources
- **Blog**: https://www.name.com/blog`
                }]
        };
    });
    server.tool("GetFeedbackLinks", {}, async () => {
        return {
            content: [{
                    type: "text",
                    text: `# Provide Feedback

## For MCP Server Issues:
- **GitHub Issues**: https://github.com/namedotcom/namecom-mcp/issues

## For Name.com API or Service Issues:
- **Contact Support**: https://www.name.com/contact

## For Feature Requests:
- **GitHub Discussions**: https://github.com/namedotcom/namecom-mcp/discussions`
                }]
        };
    });
    server.tool("GetTroubleshootingInfo", {}, async () => {
        // Determine environment based on the API URL
        const environment = NAME_API_URL.includes('dev') ? 'Development (mcp.dev.name.com)' : 'Production (mcp.name.com)';
        return {
            content: [{
                    type: "text",
                    text: `# Troubleshooting Information

## Current Environment:
- **Environment**: ${environment}

## Common Issues & Quick Tips:

**Authentication Issues**: Verify your NAME_USERNAME and NAME_TOKEN are correct

**Connection Issues**: Check your internet connection and try the HelloFunc tool first

**Domain Issues**: Confirm the domain exists in your account and check ownership

**DNS Issues**: Allow time for DNS propagation (up to 48 hours)

## Get More Help:
- **Support Center**: https://www.name.com/support
- **Contact Support**: https://www.name.com/contact
- **MCP Server Issues**: https://github.com/namedotcom/namecom-mcp/issues`
                }]
        };
    });
}
/**
 * Recursively flatten object properties into individual parameters with dot notation
 */
function flattenObjectProperties(schema, params, prefix, requiredFields, parameterTypes = {}) {
    if (!schema.properties)
        return;
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const fullPropName = prefix ? `${prefix}.${propName}` : propName;
        const isPropRequired = requiredFields.includes(propName);
        const resolvedPropSchema = resolveSchemaRef(propSchema);
        if (resolvedPropSchema.type === 'object' && resolvedPropSchema.properties) {
            // Recursively flatten nested objects
            flattenObjectProperties(resolvedPropSchema, params, fullPropName, resolvedPropSchema.required || [], parameterTypes);
        }
        else if (resolvedPropSchema.type === 'object' && resolvedPropSchema.additionalProperties) {
            // Handle objects with additionalProperties (like tldRequirements)
            // Treat as a simple string input that will be parsed as JSON
            const description = resolvedPropSchema.description || `Key-value object: ${fullPropName}`;
            params[fullPropName] = z.string().optional()
                .describe(description + ' (JSON string: {"key1":"value1","key2":"value2"})');
            parameterTypes[fullPropName] = 'object';
        }
        else if (resolvedPropSchema.type === 'array' && resolvedPropSchema.items) {
            const itemSchema = resolveSchemaRef(resolvedPropSchema.items);
            if (itemSchema.type === 'object' && itemSchema.properties) {
                // For arrays of objects, create a single parameter that accepts the array
                const description = resolvedPropSchema.description || `Array of objects: ${fullPropName}`;
                params[fullPropName] = openApiSchemaToZod(resolvedPropSchema, isPropRequired)
                    .describe(description);
                parameterTypes[fullPropName] = 'array';
            }
            else {
                // For arrays of simple types (like string arrays for nameservers)
                // Treat as a simple string input that will be parsed as comma-separated values
                const description = resolvedPropSchema.description || `Array of ${itemSchema.type || 'values'}: ${fullPropName}`;
                params[fullPropName] = z.string().optional()
                    .describe(description + ' (comma-separated: ns1.example.com,ns2.example.com)');
                parameterTypes[fullPropName] = 'array';
            }
        }
        else {
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
 * Create MCP tools from OpenAPI specification
 */
export async function createToolsFromSpec(server) {
    const spec = await loadOpenApiSpec();
    if (!spec) {
        // Don't use console.error as it interferes with MCP protocol
        return false;
    }
    // Process each path in the spec
    for (const [pathStr, pathItem] of Object.entries(spec.paths)) {
        // Process each HTTP method for the path
        for (const [method, operation] of Object.entries(pathItem)) {
            if (!['get', 'post', 'put', 'patch', 'delete'].includes(method) || !operation)
                continue;
            const typedOperation = operation;
            const operationId = typedOperation.operationId || `${method}${pathStr.replace(/\//g, '_').replace(/[{}]/g, '')}`;
            // Build parameter schema from OpenAPI spec
            const params = {};
            const pathParams = [];
            const queryParams = [];
            const parameterTypes = {};
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
                        }
                        else if (param.in === 'query') {
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
                }
                else if (resolvedBodySchema.type === 'object' && !resolvedBodySchema.properties) {
                    // Handle case where schema is an object without explicit properties
                    params['body'] = z.object({}).optional().describe('Request body object');
                }
                else if (resolvedBodySchema.type) {
                    // Handle case where schema is a primitive type
                    params['body'] = openApiSchemaToZod(resolvedBodySchema, isBodyRequired)
                        .describe('Request body');
                }
            }
            // Create the MCP tool
            server.tool(operationId, params, async (toolParams) => {
                try {
                    // Start with the base path
                    let apiPath = pathStr;
                    // The new Core API paths already include /core/v1/ prefix
                    // No need to modify the path since it comes directly from the OpenAPI spec
                    // Extract path parameters, query parameters, and body parameters
                    const pathParamValues = {};
                    const queryParamValues = {};
                    const bodyParams = {};
                    // Process provided parameters
                    for (const [key, value] of Object.entries(toolParams)) {
                        if (value !== undefined) { // Only process defined values
                            if (pathParams.includes(key)) {
                                pathParamValues[key] = value;
                            }
                            else if (queryParams.includes(key)) {
                                queryParamValues[key] = value;
                            }
                            else {
                                // Handle flattened dot notation parameters for body
                                let processedValue = value;
                                // Special handling for array and object string inputs based on schema type
                                if (typeof value === 'string' && value.trim()) {
                                    const paramType = parameterTypes[key];
                                    if (paramType === 'array') {
                                        // Parse comma-separated values into array
                                        processedValue = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
                                    }
                                    else if (paramType === 'object') {
                                        // Parse JSON string into object
                                        try {
                                            processedValue = JSON.parse(value);
                                        }
                                        catch (e) {
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
                            const filteredBodyParams = {};
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
            });
        }
    }
    // Add help and support tools that are always available to users
    addHelpTools(server);
    return true;
}
/**
 * Create fallback tools when OpenAPI spec loading fails
 */
export function createFallbackTools(server) {
    // Add basic hello tool as fallback using the new Core API endpoint
    server.tool("HelloFunc", {}, async () => {
        try {
            const data = await callNameApi('/core/v1/hello');
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify(data, null, 2)
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
    });
    // Add help and support tools that are always available to users (even in fallback mode)
    addHelpTools(server);
}
