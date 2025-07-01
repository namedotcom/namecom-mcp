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
  NAME_API_URL: 'https://mcp.dev.name.com'
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
              tags: ['Domains'],
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
              tags: ['Domains'],
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
              tags: ['Hello'],
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
      expect(mockServer.tool).toHaveBeenCalledTimes(5); // ManageDomains, Hello + 3 help tools
      
      // Verify consolidated ManageDomains tool creation
      expect(mockServer.tool).toHaveBeenCalledWith(
        'ManageDomains',
        expect.objectContaining({
          operation: expect.any(Object),
          page: expect.any(Object),
          perPage: expect.any(Object)
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
              tags: ['Domains'],
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
      // Since it's a single-operation tag, it should create individual tool
      expect(mockServer.tool).toHaveBeenCalledWith(
        'GetDomain',
        expect.objectContaining({
          domainName: expect.any(Object)
        }),
        expect.any(Function)
      );
    });

    it('should create consolidated tools for multiple operations with same tag', async () => {
      const mockSpec = {
        paths: {
          '/core/v1/domains': {
            get: {
              operationId: 'ListDomains',
              tags: ['Domains'],
              parameters: [
                {
                  name: 'perPage',
                  in: 'query',
                  schema: { type: 'integer' }
                }
              ]
            },
            post: {
              operationId: 'CreateDomain',
              tags: ['Domains'],
              requestBody: {
                required: true,
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

      const result = await createToolsFromSpec(mockServer as any);

      expect(result).toBe(true);
      
      // Should create one consolidated tool for Domains
      const domainsToolCall = mockServer.tool.mock.calls.find(call => call[0] === 'ManageDomains');
      expect(domainsToolCall).toBeDefined();
      
      const parameters = domainsToolCall[1];
      const parameterKeys = Object.keys(parameters);
      
      // Should have operation parameter and all operation-specific parameters
      expect(parameterKeys).toContain('operation');
      expect(parameterKeys).toContain('perPage');
      expect(parameterKeys).toContain('domainName');
      expect(parameterKeys).toContain('years');
    });

    it('should handle complex nested request body schemas', async () => {
      const mockSpec = {
        paths: {
          '/core/v1/domains': {
            post: {
              operationId: 'CreateDomainWithContacts',
              tags: ['Domains'],
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
      
      // Should flatten nested properties with dot notation in the single operation tool
      const toolCall = mockServer.tool.mock.calls[0];
      const parameters = toolCall[1];
      
      // Check that the parameters object has the expected flattened keys
      const parameterKeys = Object.keys(parameters);
      expect(parameterKeys).toContain('domain_name');
      expect(parameterKeys).toContain('domain_years');
      expect(parameterKeys).toContain('contacts_registrant_firstName');
      expect(parameterKeys).toContain('contacts_registrant_lastName');
    });

    it('should execute consolidated tool function correctly', async () => {
      const mockSpec = {
        paths: {
          '/core/v1/domains': {
            get: {
              operationId: 'ListDomains',
              tags: ['Domains'],
              parameters: [
                {
                  name: 'perPage',
                  in: 'query',
                  schema: { type: 'integer' }
                }
              ]
            },
            post: {
              operationId: 'CreateDomain',
              tags: ['Domains'],
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        domainName: { type: 'string' }
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
      mockCallNameApi.mockResolvedValue({ domains: ['example.com'] });

      await createToolsFromSpec(mockServer as any);

      // Get the ManageDomains tool function
      const domainsToolCall = mockServer.tool.mock.calls.find(call => call[0] === 'ManageDomains');
      const toolFunction = domainsToolCall[2];

      // Execute the tool function with list operation
      const result = await toolFunction({ operation: 'list', perPage: 10 });

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

    it('should handle consolidated tool execution with request body', async () => {
      const mockSpec = {
        paths: {
          '/core/v1/domains': {
            get: {
              operationId: 'ListDomains',
              tags: ['Domains']
            },
            post: {
              operationId: 'CreateDomain',
              tags: ['Domains'],
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

      const domainsToolCall = mockServer.tool.mock.calls.find(call => call[0] === 'ManageDomains');
      const toolFunction = domainsToolCall[2];

      const result = await toolFunction({
        operation: 'create',
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

    it('should handle array and object parameter types in single operation tool', async () => {
      const mockSpec = {
        paths: {
          '/core/v1/domains': {
            post: {
              operationId: 'CreateDomainWithNameservers',
              tags: ['Domains'],
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

      // Single operation gets individual tool
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

    it('should exclude deprecated operations from tool generation', async () => {
      const mockSpec = {
        paths: {
          '/core/v1/domains/{domainName}/enable_autorenew': {
            post: {
              operationId: 'EnableAutorenew',
              tags: ['Domains'],
              deprecated: true, // Should be excluded
              parameters: [{ name: 'domainName', in: 'path', required: true, schema: { type: 'string' } }]
            }
          },
          '/core/v1/domains': {
            get: {
              operationId: 'ListDomains',
              tags: ['Domains'],
              parameters: [{ name: 'perPage', in: 'query', schema: { type: 'integer' } }]
            }
          }
        }
      };

      mockLoadOpenApiSpec.mockResolvedValue(mockSpec);
      await createToolsFromSpec(mockServer as any);

      // Should create some tool for the non-deprecated operation (could be individual or consolidated)
      const allCalls = mockServer.tool.mock.calls.map((call: any) => call[0]);
      expect(allCalls).toContain('ListDomains'); // Individual tool since only one operation

      // Should not create tools for deprecated operations
      const deprecatedCalls = mockServer.tool.mock.calls.filter((call: any) => call[0] === 'EnableAutorenew');
      expect(deprecatedCalls).toHaveLength(0);
    });
  });

  describe('createFallbackTools', () => {
    it('should create fallback Hello tool when OpenAPI spec is not available', () => {
      createFallbackTools(mockServer as any);

      expect(mockServer.tool).toHaveBeenCalledWith(
        'Hello',
        {},
        expect.any(Function)
      );
    });

    it('should execute fallback tool function', async () => {
      createFallbackTools(mockServer as any);

      // Get the Hello tool
      const helloCall = mockServer.tool.mock.calls.find(
        call => call[0] === 'Hello'
      );
      const helloFunction = helloCall[2];

      const result = await helloFunction({});

      // New Hello tool doesn't call API, just returns static content
      expect(mockCallNameApi).not.toHaveBeenCalled();
      expect(result).toEqual({
        content: [{
          type: "text",
          text: "Hello from the name.com MCP Server! 🌐\n\nThis server provides AI assistants with access to name.com's domain management API.\n\nAvailable operations include:\n• Domain registration and management\n• DNS record management\n• Email forwarding setup\n• URL forwarding configuration\n• Account information retrieval\n\nTo get started, try asking about domain availability or listing your domains."
        }]
      });
    });
  });
}); 