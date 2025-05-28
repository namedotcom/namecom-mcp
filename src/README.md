# Name.com MCP Server - Source Code Structure

This directory contains the refactored and modularized source code for the Name.com MCP (Model Context Protocol) server.

## File Structure

### `index.ts` (Main Entry Point)
- **Purpose**: Server initialization and startup logic
- **Responsibilities**: 
  - Creates the MCP server instance
  - Orchestrates tool creation from OpenAPI spec
  - Handles fallback scenarios
  - Starts the server transport
- **Size**: ~33 lines (down from 511 lines!)

### `types.ts` (Type Definitions)
- **Purpose**: All TypeScript interfaces and type definitions
- **Contains**:
  - `NameApiResponse` - API response structure
  - `FetchOptions` - HTTP request options
  - `OpenApiSchema` - OpenAPI schema definitions
  - `OpenApiParameter`, `OpenApiOperation`, etc. - OpenAPI spec types

### `config.ts` (Configuration & Constants)
- **Purpose**: Environment variables, configuration, and default values
- **Contains**:
  - Environment variable loading
  - API credentials and URLs
  - Default parameter values
  - Server configuration

### `api-client.ts` (API Communication)
- **Purpose**: Name.com API client functionality
- **Responsibilities**:
  - Authenticated HTTP requests to Name.com API
  - Request/response handling
  - Error handling for API calls

### `openapi-utils.ts` (OpenAPI Processing)
- **Purpose**: OpenAPI specification parsing and schema utilities
- **Responsibilities**:
  - Loading and parsing YAML OpenAPI specs
  - Resolving schema references (`$ref`)
  - Handling schema composition (`allOf`, `oneOf`, `anyOf`)
  - Converting OpenAPI schemas to Zod schemas

### `tool-generator.ts` (MCP Tool Generation)
- **Purpose**: Dynamic MCP tool creation from OpenAPI specifications
- **Responsibilities**:
  - Processing OpenAPI paths and operations
  - Creating MCP tools with proper parameter schemas
  - Handling path/query/body parameter routing
  - Fallback tool creation when spec loading fails

## Benefits of This Structure

1. **Separation of Concerns**: Each file has a single, well-defined responsibility
2. **Maintainability**: Much easier to find and modify specific functionality
3. **Testability**: Individual modules can be tested in isolation
4. **Readability**: The main entry point is now very clean and easy to understand
5. **Reusability**: Modules can be reused or replaced independently
6. **Type Safety**: All types are centralized and properly exported

## Import Dependencies

```
index.ts
├── config.js (SERVER_CONFIG)
└── tool-generator.js (createToolsFromSpec, createFallbackTools)
    ├── types.js (OpenApiOperation, OpenApiSpec)
    ├── openapi-utils.js (loadOpenApiSpec, openApiSchemaToZod, resolveSchemaRef)
    ├── api-client.js (callNameApi)
    └── config.js (DEFAULT_VALUES, NAME_API_URL)

api-client.ts
├── types.js (NameApiResponse, FetchOptions)
└── config.js (NAME_USERNAME, NAME_TOKEN, NAME_API_URL)

openapi-utils.ts
└── types.js (OpenApiSchema, OpenApiSpec)
```

## Future Improvements

- Add unit tests for each module
- Consider adding a logger utility
- Add input validation utilities
- Consider adding a cache layer for OpenAPI spec loading
- Add more comprehensive error handling and recovery 