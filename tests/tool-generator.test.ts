// Mock the dependencies
jest.mock('../src/openapi-utils.js', () => ({
  loadOpenApiSpec: jest.fn(),
  openApiSchemaToZod: jest.fn(),
  resolveSchemaRef: jest.fn()
}));

jest.mock('../src/api-client.js', () => ({
  callNameApi: jest.fn()
}));

jest.mock('../src/config.js', () => ({
  NAME_USERNAME: 'test-username',
  NAME_TOKEN: 'test-token',
  NAME_API_URL: 'https://mcp.dev.name.com'
}));

import { createToolsFromSpec, createFallbackTools, flattenObjectProperties } from '../src/tool-generator.js';
import { loadOpenApiSpec, openApiSchemaToZod, resolveSchemaRef } from '../src/openapi-utils.js';
import { callNameApi } from '../src/api-client.js';
import { z } from 'zod';

const mockLoadOpenApiSpec = loadOpenApiSpec as jest.MockedFunction<typeof loadOpenApiSpec>;
const mockOpenApiSchemaToZod = openApiSchemaToZod as jest.MockedFunction<typeof openApiSchemaToZod>;
const mockResolveSchemaRef = resolveSchemaRef as jest.MockedFunction<typeof resolveSchemaRef>;
const mockCallNameApi = callNameApi as jest.MockedFunction<typeof callNameApi>;

// Mock MCP Server
const mockServer = {
  tool: jest.fn()
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
    it('should create error guidance tools when OpenAPI spec is not available', () => {
      createFallbackTools(mockServer as any);

      // Should create both tools
      expect(mockServer.tool).toHaveBeenCalledWith(
        'GetSetupHelp',
        {},
        expect.any(Function)
      );
      expect(mockServer.tool).toHaveBeenCalledWith(
        'CheckConfiguration',
        {},
        expect.any(Function)
      );
    });

    it('should provide setup help content', async () => {
      createFallbackTools(mockServer as any);

      // Get the GetSetupHelp tool
      const helpCall = mockServer.tool.mock.calls.find(
        call => call[0] === 'GetSetupHelp'
      );
      const helpFunction = helpCall[2];

      const result = await helpFunction({});

      // Verify content includes key elements
      expect(result.content[0].text).toContain('⚠️ The name.com MCP server is not configured correctly');
      expect(result.content[0].text).toContain('NAME_USERNAME');
      expect(result.content[0].text).toContain('NAME_TOKEN');
      expect(result.content[0].text).toContain('https://docs.name.com');
      expect(result.content[0].text).toContain('https://www.name.com/support');
    });

    it('should handle successful API check but failed spec load', async () => {
      mockCallNameApi.mockResolvedValueOnce({ status: 'ok' });
      createFallbackTools(mockServer as any);

      const checkCall = mockServer.tool.mock.calls.find(
        call => call[0] === 'CheckConfiguration'
      );
      const checkFunction = checkCall[2];

      const result = await checkFunction({});

      expect(result.content[0].text).toContain('✅ API credentials are valid');
      expect(result.content[0].text).toContain('OpenAPI spec failed to load');
      expect(result.isError).toBeUndefined();
    });

    it('should handle failed API check', async () => {
      mockCallNameApi.mockRejectedValueOnce(new Error('Invalid credentials'));
      createFallbackTools(mockServer as any);

      const checkCall = mockServer.tool.mock.calls.find(
        call => call[0] === 'CheckConfiguration'
      );
      const checkFunction = checkCall[2];

      const result = await checkFunction({});

      expect(result.content[0].text).toContain('❌ API credentials are invalid');
      expect(result.content[0].text).toContain('Error: Invalid credentials');
      expect(result.isError).toBe(true);
    });
  });
});

describe('Parameter Description Generation', () => {
  it('should include nullable status in parameter description', async () => {
    const mockSchema = {
      type: 'string',
      description: 'A test parameter',
      nullable: true
    };
    
    const params: Record<string, z.ZodTypeAny> = {};
    
    flattenObjectProperties(
      { properties: { testParam: mockSchema } },
      params,
      '',
      [],
      {},
      {}
    );
    
    expect(params.testParam.description).toContain('null values allowed');
  });

  it('should include validation combinations in description', async () => {
    const mockSchema = {
      type: 'string',
      description: 'A test parameter',
      allOf: [{ type: 'string' }],
      oneOf: [{ type: 'string' }],
      anyOf: [{ type: 'string' }]
    };
    
    const params: Record<string, z.ZodTypeAny> = {};
    
    flattenObjectProperties(
      { properties: { testParam: mockSchema } },
      params,
      '',
      [],
      {},
      {}
    );
    
    expect(params.testParam.description).toContain('must satisfy all conditions');
    expect(params.testParam.description).toContain('must satisfy exactly one condition');
    expect(params.testParam.description).toContain('must satisfy at least one condition');
  });

  it('should use title over description when available', async () => {
    const mockSchema = {
      type: 'string',
      title: 'Test Title',
      description: 'Test Description'
    };
    
    const params: Record<string, z.ZodTypeAny> = {};
    
    flattenObjectProperties(
      { properties: { testParam: mockSchema } },
      params,
      '',
      [],
      {},
      {}
    );
    
    expect(params.testParam.description).toContain('Test Title');
  });

  it('should handle purchasePrice parameter correctly', async () => {
    const mockSchema = {
      type: 'number',
      description: 'Purchase price for domain'
    };
    
    const params: Record<string, z.ZodTypeAny> = {};
    
    flattenObjectProperties(
      { properties: { purchasePrice: mockSchema } },
      params,
      '',
      [],
      {},
      {}
    );
    
    const desc = params.purchasePrice.description;
    expect(desc).toContain('premium: true');
    expect(desc).toContain('premium: false');
    expect(desc).toContain('ALWAYS OMIT');
    expect(desc).toContain('auto-calculate');
  });

  it('should include default values from schema', async () => {
    const mockSchema = {
      type: 'string',
      description: 'A test parameter',
      default: 'default value'
    };
    
    const params: Record<string, z.ZodTypeAny> = {};
    
    flattenObjectProperties(
      { properties: { testParam: mockSchema } },
      params,
      '',
      [],
      {},
      {}
    );
    
    expect(params.testParam.description).toContain('defaults to: default value');
  });
}); 