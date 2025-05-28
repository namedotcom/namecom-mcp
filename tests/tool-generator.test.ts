// Mock the dependencies
jest.mock('../src/openapi-utils.js', () => ({
  loadOpenApiSpec: jest.fn(),
  openApiSchemaToZod: jest.fn(),
  resolveSchemaRef: jest.fn(),
  getSchemaExample: jest.fn()
}));

jest.mock('../src/api-client.js', () => ({
  callNameApi: jest.fn()
}));

jest.mock('../src/config.js', () => ({
  NAME_USERNAME: 'test-username',
  NAME_TOKEN: 'test-token',
  NAME_API_URL: 'https://api.dev.name.com'
}));

import { createToolsFromSpec, createFallbackTools } from '../src/tool-generator.js';
import { loadOpenApiSpec, openApiSchemaToZod, resolveSchemaRef } from '../src/openapi-utils.js';
import { callNameApi } from '../src/api-client.js';
import { z } from 'zod';

const mockLoadOpenApiSpec = loadOpenApiSpec as jest.MockedFunction<typeof loadOpenApiSpec>;
const mockOpenApiSchemaToZod = openApiSchemaToZod as jest.MockedFunction<typeof openApiSchemaToZod>;
const mockResolveSchemaRef = resolveSchemaRef as jest.MockedFunction<typeof resolveSchemaRef>;
const mockCallNameApi = callNameApi as jest.MockedFunction<typeof callNameApi>;

// Mock MCP Server
const mockServer = {
  tool: jest.fn(),
  listTools: jest.fn(),
  callTool: jest.fn()
};

describe('Tool Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCallNameApi.mockClear();
    
    // Set up default mock behavior for resolveSchemaRef
    mockResolveSchemaRef.mockImplementation((schema) => {
      if (schema && typeof schema === 'object' && !schema.$ref) {
        return schema;
      }
      // Return a default schema for any $ref
      return {
        type: 'object',
        properties: {
          domain: {
            type: 'object',
            properties: {
              domainName: {
                type: 'string',
                description: 'The domain name to create'
              }
            },
            required: ['domainName']
          }
        },
        required: ['domain']
      };
    });
  });

  describe('createToolsFromSpec', () => {
    it('should return false when OpenAPI spec cannot be loaded', async () => {
      mockLoadOpenApiSpec.mockResolvedValue(null);

      const result = await createToolsFromSpec(mockServer as any);

      expect(result).toBe(false);
      expect(mockServer.tool).not.toHaveBeenCalled();
    });

    it('should create tools from valid OpenAPI spec', async () => {
      const mockSpec = {
        paths: {
          '/core/v1/domains': {
            get: {
              operationId: 'ListDomains',
              summary: 'List Domains',
              description: 'Lists all domains in your account',
              parameters: [
                {
                  name: 'perPage',
                  in: 'query',
                  description: 'Number of records per page',
                  schema: { type: 'number' }
                },
                {
                  name: 'page',
                  in: 'query',
                  description: 'Page number',
                  schema: { type: 'number' }
                }
              ],
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          domains: {
                            type: 'array',
                            items: { type: 'object' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            post: {
              operationId: 'CreateDomain',
              summary: 'Create Domain',
              description: 'Creates a new domain',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        domain: {
                          type: 'object',
                          properties: {
                            domainName: {
                              type: 'string',
                              description: 'The domain name to create'
                            }
                          },
                          required: ['domainName']
                        }
                      },
                      required: ['domain']
                    }
                  }
                }
              },
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { type: 'object' }
                    }
                  }
                }
              }
            }
          },
          '/core/v1/hello': {
            get: {
              operationId: 'Hello',
              summary: 'Hello endpoint',
              description: 'Simple hello endpoint',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { type: 'object' }
                    }
                  }
                }
              }
            }
          }
        }
      };

      mockLoadOpenApiSpec.mockResolvedValue(mockSpec);
      mockOpenApiSchemaToZod.mockImplementation((schema, required) => {
        if (schema?.type === 'string') {
          return required ? z.string() : z.string().optional();
        }
        if (schema?.type === 'integer') {
          return required ? z.number() : z.number().optional();
        }
        return z.any();
      });

      const result = await createToolsFromSpec(mockServer as any);

      expect(result).toBe(true);
      expect(mockServer.tool).toHaveBeenCalledTimes(3); // GET domains, POST domains, GET hello
      
      // Verify GET endpoint tool creation
      expect(mockServer.tool).toHaveBeenCalledWith(
        'ListDomains',
        expect.objectContaining({
          page: expect.any(Object),
          perPage: expect.any(Object)
        }),
        expect.any(Function)
      );

      // Verify POST endpoint tool creation
      expect(mockServer.tool).toHaveBeenCalledWith(
        'CreateDomain',
        expect.objectContaining({
          'domain.domainName': expect.any(Object)
        }),
        expect.any(Function)
      );

      // Verify Hello endpoint tool creation
      expect(mockServer.tool).toHaveBeenCalledWith(
        'Hello',
        expect.objectContaining({}),
        expect.any(Function)
      );
    });

    it('should handle path parameters correctly', async () => {
      const mockSpec = {
        paths: {
          '/core/v1/domains/{domainName}': {
            get: {
              operationId: 'GetDomain',
              summary: 'Get Domain',
              description: 'Get details for a specific domain',
              parameters: [
                {
                  name: 'domainName',
                  in: 'path',
                  required: true,
                  schema: { type: 'string' },
                  description: 'Domain name to retrieve'
                }
              ]
            }
          }
        }
      };

      mockLoadOpenApiSpec.mockResolvedValue(mockSpec);

      const result = await createToolsFromSpec(mockServer as any);

      expect(result).toBe(true);
      expect(mockServer.tool).toHaveBeenCalledWith(
        'GetDomain',
        expect.objectContaining({
          domainName: expect.any(Object)
        }),
        expect.any(Function)
      );
    });

    it('should handle complex nested request body schemas', async () => {
      const mockSpec = {
        paths: {
          '/core/v1/domains': {
            post: {
              operationId: 'CreateDomainWithContacts',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        domain: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            years: { type: 'integer' }
                          }
                        },
                        contacts: {
                          type: 'object',
                          properties: {
                            registrant: {
                              type: 'object',
                              properties: {
                                firstName: { type: 'string' },
                                lastName: { type: 'string' }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };

      mockLoadOpenApiSpec.mockResolvedValue(mockSpec);
      mockResolveSchemaRef.mockImplementation((schema) => schema);

      const result = await createToolsFromSpec(mockServer as any);

      expect(result).toBe(true);
      
      // Should flatten nested properties with dot notation
      const toolCall = mockServer.tool.mock.calls[0];
      const parameters = toolCall[1];
      
      // Check that the parameters object has the expected flattened keys
      const parameterKeys = Object.keys(parameters);
      expect(parameterKeys).toContain('domain.name');
      expect(parameterKeys).toContain('domain.years');
      expect(parameterKeys).toContain('contacts.registrant.firstName');
      expect(parameterKeys).toContain('contacts.registrant.lastName');
    });

    it('should execute tool function correctly', async () => {
      const mockSpec = {
        paths: {
          '/core/v1/domains': {
            get: {
              operationId: 'ListDomains',
              parameters: [
                {
                  name: 'perPage',
                  in: 'query',
                  schema: { type: 'integer' }
                }
              ]
            }
          }
        }
      };

      mockLoadOpenApiSpec.mockResolvedValue(mockSpec);
      mockCallNameApi.mockResolvedValue({ domains: ['example.com'] });

      await createToolsFromSpec(mockServer as any);

      // Get the tool function that was registered
      const toolCall = mockServer.tool.mock.calls[0];
      const toolFunction = toolCall[2];

      // Execute the tool function
      const result = await toolFunction({ perPage: 10 });

      // The implementation adds query params to the URL
      expect(mockCallNameApi).toHaveBeenCalledWith('/core/v1/domains?perPage=10', 'GET', null);
      
      // The result is wrapped in content format
      expect(result).toEqual({
        content: [{
          type: "text",
          text: JSON.stringify({ domains: ['example.com'] }, null, 2)
        }]
      });
    });

    it('should handle tool execution with request body', async () => {
      const mockSpec = {
        paths: {
          '/core/v1/domains': {
            post: {
              operationId: 'CreateDomain',
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        domainName: { type: 'string' },
                        years: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };

      mockLoadOpenApiSpec.mockResolvedValue(mockSpec);
      mockResolveSchemaRef.mockImplementation((schema) => schema);
      mockCallNameApi.mockResolvedValue({ success: true, domainId: '123' });

      await createToolsFromSpec(mockServer as any);

      const toolCall = mockServer.tool.mock.calls[0];
      const toolFunction = toolCall[2];

      const result = await toolFunction({
        domainName: 'example.com',
        years: 1
      });

      expect(mockCallNameApi).toHaveBeenCalledWith(
        '/core/v1/domains',
        'POST',
        {
          domainName: 'example.com',
          years: 1
        }
      );
      
      // The result is wrapped in content format
      expect(result).toEqual({
        content: [{
          type: "text",
          text: JSON.stringify({ success: true, domainId: '123' }, null, 2)
        }]
      });
    });

    it('should handle array and object parameter types', async () => {
      const mockSpec = {
        paths: {
          '/core/v1/domains': {
            post: {
              operationId: 'CreateDomainWithNameservers',
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        domainName: { type: 'string' },
                        nameservers: {
                          type: 'array',
                          items: { type: 'string' }
                        },
                        metadata: {
                          type: 'object',
                          additionalProperties: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };

      mockLoadOpenApiSpec.mockResolvedValue(mockSpec);
      mockResolveSchemaRef.mockImplementation((schema) => schema);

      await createToolsFromSpec(mockServer as any);

      const toolCall = mockServer.tool.mock.calls[0];
      const toolFunction = toolCall[2];

      const result = await toolFunction({
        domainName: 'example.com',
        nameservers: 'ns1.example.com,ns2.example.com',
        metadata: '{"key":"value"}'
      });

      expect(mockCallNameApi).toHaveBeenCalledWith(
        '/core/v1/domains',
        'POST',
        {
          domainName: 'example.com',
          nameservers: ['ns1.example.com', 'ns2.example.com'],
          metadata: { key: 'value' }
        }
      );
    });
  });

  describe('createFallbackTools', () => {
    it('should create fallback HelloFunc tool when OpenAPI spec is not available', () => {
      createFallbackTools(mockServer as any);

      expect(mockServer.tool).toHaveBeenCalledWith(
        'HelloFunc',
        {},
        expect.any(Function)
      );
    });

    it('should execute fallback tool function', async () => {
      mockCallNameApi.mockResolvedValue({ message: 'Hello from Name.com API' });

      createFallbackTools(mockServer as any);

      // Get the HelloFunc tool
      const helloFuncCall = mockServer.tool.mock.calls.find(
        call => call[0] === 'HelloFunc'
      );
      const helloFuncFunction = helloFuncCall[2];

      const result = await helloFuncFunction({});

      expect(mockCallNameApi).toHaveBeenCalledWith('/core/v1/hello');
      expect(result).toEqual({
        content: [{
          type: "text",
          text: JSON.stringify({ message: 'Hello from Name.com API' }, null, 2)
        }]
      });
    });
  });
}); 