import { z } from "zod";
import { EMBEDDED_SPEC } from "./embedded-spec.js";
// Global variable to store the loaded spec for reference resolution
let globalSpec = null;
/**
 * Set the global spec for testing purposes
 */
export function setGlobalSpec(spec) {
    globalSpec = spec;
}
/**
 * Get the current global spec (for testing purposes)
 */
export function getGlobalSpec() {
    return globalSpec;
}
/**
 * Load and parse OpenAPI spec (now using embedded spec)
 */
export async function loadOpenApiSpec() {
    try {
        const loadedSpec = EMBEDDED_SPEC;
        // Store the loaded spec to resolve references later
        globalSpec = loadedSpec;
        return loadedSpec;
    }
    catch (error) {
        globalSpec = null;
        return null;
    }
}
/**
 * Resolve $ref in OpenAPI schema and handle allOf, oneOf, anyOf
 */
export function resolveSchemaRef(schema, visitedRefs = new Set()) {
    // Base case: no schema provided
    if (!schema) {
        return {};
    }
    // Handle direct references
    if (schema.$ref && globalSpec?.components?.schemas) {
        // Check for cycles to prevent infinite recursion
        if (visitedRefs.has(schema.$ref)) {
            // Return the original ref for recursive schemas to avoid infinite expansion
            return schema;
        }
        // Extract the component name from the $ref
        const refParts = schema.$ref.split('/');
        const refName = refParts[refParts.length - 1];
        const resolvedSchema = globalSpec.components.schemas[refName];
        if (resolvedSchema) {
            // Add this ref to visited set before recursing
            const newVisited = new Set(visitedRefs);
            newVisited.add(schema.$ref);
            // Recursively resolve if the referenced schema has its own references
            return resolveSchemaRef(resolvedSchema, newVisited);
        }
        return schema; // Return original if reference can't be resolved
    }
    // Handle allOf (merge all schemas)
    if (schema.allOf) {
        // Start with an empty result schema
        const result = {
            properties: {},
            required: []
        };
        // If allOf is empty, return the base schema structure
        if (schema.allOf.length === 0) {
            return result;
        }
        // Merge all schemas in the allOf array
        for (const subSchema of schema.allOf) {
            const resolved = resolveSchemaRef(subSchema, visitedRefs);
            // Merge properties
            if (resolved.properties) {
                result.properties = {
                    ...result.properties,
                    ...resolved.properties
                };
            }
            // Merge required fields
            if (resolved.required && resolved.required.length > 0) {
                result.required = [
                    ...(result.required || []),
                    ...resolved.required
                ];
            }
            // Copy other fields if not already present
            Object.entries(resolved).forEach(([key, value]) => {
                if (key !== 'properties' && key !== 'required' && !result[key]) {
                    result[key] = value;
                }
            });
        }
        return result;
    }
    // Handle oneOf/anyOf 
    if ((schema.oneOf && schema.oneOf.length > 0) || (schema.anyOf && schema.anyOf.length > 0)) {
        const subSchemas = schema.oneOf || schema.anyOf;
        if (subSchemas && subSchemas.length > 0) {
            // For anyOf, we want to merge all properties from all schemas
            // For oneOf, we'll still just use the first one for simplicity
            if (schema.anyOf) {
                // Merge all schemas in the anyOf array
                const result = {
                    type: schema.type || 'object',
                    properties: { ...schema.properties },
                    required: [...(schema.required || [])]
                };
                for (const subSchema of subSchemas) {
                    const resolved = resolveSchemaRef(subSchema, visitedRefs);
                    // Merge properties
                    if (resolved.properties) {
                        result.properties = {
                            ...result.properties,
                            ...resolved.properties
                        };
                    }
                    // For anyOf, we don't merge required fields since anyOf means "at least one"
                    // Instead, we'll make all properties optional
                }
                return result;
            }
            else {
                // For oneOf, just use the first schema
                return resolveSchemaRef(subSchemas[0], visitedRefs);
            }
        }
    }
    // For object types, recursively resolve any $ref properties
    if (schema.type === 'object' && schema.properties) {
        const result = {
            ...schema,
            properties: {}
        };
        // Recursively resolve each property
        Object.entries(schema.properties).forEach(([propName, propSchema]) => {
            result.properties[propName] = resolveSchemaRef(propSchema, visitedRefs);
        });
        return result;
    }
    // For array types, recursively resolve the items schema
    if (schema.type === 'array' && schema.items) {
        return {
            ...schema,
            items: resolveSchemaRef(schema.items, visitedRefs)
        };
    }
    return schema;
}
/**
 * Convert OpenAPI schema to Zod schema, respecting the required flag
 */
export function openApiSchemaToZod(schema, isRequired = false) {
    if (!schema)
        return z.any();
    // Fully resolve the schema (handle references and composition)
    const resolvedSchema = resolveSchemaRef(schema);
    let zodSchema;
    // Handle union types (OpenAPI 3.1 style: type: ['string', 'null'])
    if (Array.isArray(resolvedSchema.type)) {
        // Filter out null values and normalize the types
        const types = resolvedSchema.type.filter(t => t !== 'null');
        const hasNull = resolvedSchema.type.includes('null');
        if (types.length === 1) {
            // Single type + null (e.g., ['string', 'null'])
            const singleType = types[0];
            if (singleType === 'string') {
                zodSchema = resolvedSchema.enum && resolvedSchema.enum.length > 0
                    ? z.enum(resolvedSchema.enum)
                    : z.string();
            }
            else if (singleType === 'integer' || singleType === 'number') {
                zodSchema = z.number();
            }
            else if (singleType === 'boolean') {
                zodSchema = z.boolean();
            }
            else {
                zodSchema = z.any();
            }
            // Make nullable if null is in the union - treat as optional for MCP compatibility
            if (hasNull) {
                // For MCP compatibility, treat nullable fields as optional strings
                // rather than complex union types
                zodSchema = zodSchema.optional();
            }
        }
        else if (types.length === 0 && hasNull) {
            // Only null type - treat as optional string
            zodSchema = z.string().nullable();
        }
        else {
            // Multiple non-null types - use z.any() for now
            zodSchema = z.any();
        }
        // Add description if available
        if (resolvedSchema.description) {
            zodSchema = zodSchema.describe(resolvedSchema.description);
        }
    }
    else if (resolvedSchema.type === 'string') {
        zodSchema = resolvedSchema.enum && resolvedSchema.enum.length > 0
            ? z.enum(resolvedSchema.enum)
            : z.string();
        // Handle OpenAPI 3.0 style nullable
        if (resolvedSchema.nullable) {
            zodSchema = zodSchema.nullable();
        }
        // Add description if available
        if (resolvedSchema.description) {
            zodSchema = zodSchema.describe(resolvedSchema.description);
        }
    }
    else if (resolvedSchema.type === 'integer' || resolvedSchema.type === 'number') {
        zodSchema = z.number();
        // Handle OpenAPI 3.0 style nullable
        if (resolvedSchema.nullable) {
            zodSchema = zodSchema.nullable();
        }
    }
    else if (resolvedSchema.type === 'boolean') {
        zodSchema = z.boolean();
        // Handle OpenAPI 3.0 style nullable
        if (resolvedSchema.nullable) {
            zodSchema = zodSchema.nullable();
        }
    }
    else if (resolvedSchema.type === 'object') {
        const shape = {};
        if (resolvedSchema.properties) {
            Object.entries(resolvedSchema.properties).forEach(([propName, propSchema]) => {
                const propIsRequired = resolvedSchema.required?.includes(propName) || false;
                shape[propName] = openApiSchemaToZod(propSchema, propIsRequired);
                if (!propIsRequired) {
                    shape[propName] = shape[propName].optional();
                }
            });
        }
        zodSchema = z.object(shape);
        // Add description if available
        if (resolvedSchema.description) {
            zodSchema = zodSchema.describe(resolvedSchema.description);
        }
    }
    else if (resolvedSchema.type === 'array') {
        zodSchema = z.array(openApiSchemaToZod(resolvedSchema.items));
        // Handle OpenAPI 3.0 style nullable
        if (resolvedSchema.nullable) {
            zodSchema = zodSchema.nullable();
        }
    }
    else {
        // Handle schemas without a specified type (could be references or complex schemas)
        // Check if it has properties, which would make it an object
        if (resolvedSchema.properties) {
            const shape = {};
            Object.entries(resolvedSchema.properties).forEach(([propName, propSchema]) => {
                const propIsRequired = resolvedSchema.required?.includes(propName) || false;
                shape[propName] = openApiSchemaToZod(propSchema, propIsRequired);
                if (!propIsRequired) {
                    shape[propName] = shape[propName].optional();
                }
            });
            zodSchema = z.object(shape);
        }
        else {
            // No type and no properties - this might be a field that's just defined without a type
            // In OpenAPI, this often means it can be any value, but for practical purposes,
            // let's treat it as a nullable string since that's the most common case
            zodSchema = z.string().nullable();
        }
    }
    // Make it optional if not required
    if (!isRequired) {
        zodSchema = zodSchema.optional();
    }
    return zodSchema;
}
/**
 * Generate an example object from an OpenAPI schema
 */
export function getSchemaExample(schema) {
    const resolvedSchema = resolveSchemaRef(schema);
    if (resolvedSchema.type === 'string') {
        return resolvedSchema.example || 'string';
    }
    else if (resolvedSchema.type === 'integer' || resolvedSchema.type === 'number') {
        return resolvedSchema.example || 0;
    }
    else if (resolvedSchema.type === 'boolean') {
        return resolvedSchema.example || false;
    }
    else if (resolvedSchema.type === 'array') {
        return [getSchemaExample(resolvedSchema.items || {})];
    }
    else if (resolvedSchema.type === 'object' || resolvedSchema.properties) {
        const example = {};
        if (resolvedSchema.properties) {
            Object.entries(resolvedSchema.properties).forEach(([propName, propSchema]) => {
                example[propName] = getSchemaExample(propSchema);
            });
        }
        return example;
    }
    return null;
}
