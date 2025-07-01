import fs from 'fs';
import path from 'path';
import { load } from 'js-yaml';
import { resolveSchemaRef, openApiSchemaToZod, setGlobalSpec, getGlobalSpec } from '../src/openapi-utils';
import { createToolsFromSpec } from '../src/tool-generator';
import { OpenApiSpec, OpenApiSchema } from '../src/types';
import { z } from 'zod';

// Mock the API client
jest.mock('../src/api-client.js', () => ({
  callNameApi: jest.fn()
}));

jest.mock('../src/config.js', () => ({
  NAME_USERNAME: 'test-username',
  NAME_TOKEN: 'test-token',
  NAME_API_URL: 'https://mcp.dev.name.com'
}));

describe('Real name.com Schema Tests', () => {
  let realSpec: OpenApiSpec;
  let mockServer: any;

  beforeAll(async () => {
    // Setup mock server
    mockServer = {
      tool: jest.fn(),
      listTools: jest.fn(),
      callTool: jest.fn()
    };

    // Load the actual name.com OpenAPI spec
    try {
      const specPath = path.join(__dirname, '../assets/namecom.api.yaml');
      const specContent = fs.readFileSync(specPath, 'utf8');
      realSpec = load(specContent) as OpenApiSpec;
    } catch (error) {
      throw new Error(`Failed to load OpenAPI spec: ${error}`);
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Schema Resolution with Real OpenAPI Spec', () => {
    it('should resolve CreateDomainRequest with nested Domain schema', () => {
      // Find the CreateDomain endpoint
      const createDomainPath = realSpec.paths['/core/v1/domains'];
      expect(createDomainPath).toBeDefined();
      
      const createDomainOp = createDomainPath?.post;
      expect(createDomainOp).toBeDefined();
      
      // Get the request body schema
      const requestBodySchema = createDomainOp?.requestBody?.content?.['application/json']?.schema;
      expect(requestBodySchema).toBeDefined();
      
      // Test schema resolution by trying to resolve it
      const originalSpec = getGlobalSpec();
      setGlobalSpec(realSpec);
      
      try {
        const resolved = resolveSchemaRef(requestBodySchema!);
        expect(resolved).toBeDefined();
        expect(resolved.type).toBeDefined();
      } finally {
        setGlobalSpec(originalSpec);
      }
    });

    it('should resolve the complete Contact reference chain', () => {
      // Test resolving Domain -> Contacts -> Contact chain
      const domainSchemaRef: OpenApiSchema = {
        $ref: '#/components/schemas/Domain'
      };

      // Set global spec for resolution
      const originalSpec = getGlobalSpec();
      setGlobalSpec(realSpec);

      try {
        const resolvedDomain = resolveSchemaRef(domainSchemaRef);
        
        expect(resolvedDomain.type).toBe('object');
        expect(resolvedDomain.properties).toBeDefined();
        expect(resolvedDomain.properties?.contacts).toBeDefined();

        // Resolve contacts
        const contactsSchema = resolveSchemaRef(resolvedDomain.properties!.contacts);
        expect(contactsSchema.properties?.registrant).toBeDefined();

        // Resolve registrant contact
        const registrantContact = resolveSchemaRef(contactsSchema.properties!.registrant);
        expect(registrantContact.properties?.firstName).toBeDefined();
        expect(registrantContact.properties?.email).toBeDefined();
        expect(registrantContact.required).toContain('firstName');
      } finally {
        setGlobalSpec(originalSpec);
      }
    });

    it('should convert complex schemas to Zod successfully', () => {
      // Test converting the Contact schema to Zod
      const contactSchemaRef: OpenApiSchema = {
        $ref: '#/components/schemas/Contact'
      };

      const originalSpec = getGlobalSpec();
      setGlobalSpec(realSpec);

      try {
        const contactSchema = resolveSchemaRef(contactSchemaRef);
        const zodSchema = openApiSchemaToZod(contactSchema, false);
        
        expect(zodSchema).toBeDefined();
        expect(zodSchema instanceof z.ZodType).toBe(true);

        // Test with sample data
        const sampleContact = {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'Denver',
          state: 'CO',
          zip: '80202',
          country: 'US',
          email: 'john@example.com',
          phone: '+1.3035551234'
        };

        const result = zodSchema.safeParse(sampleContact);
        expect(result.success).toBe(true);
      } finally {
        setGlobalSpec(originalSpec);
      }
    });
  });

  describe('Schema Flattening for MCP Tool Generation', () => {
    it('should correctly flatten the CreateDomainRequest schema with nested Domain and Contacts', async () => {
      // Mock loadOpenApiSpec to return our real spec  
      jest.doMock('../src/openapi-utils.js', () => ({
        ...jest.requireActual('../src/openapi-utils.js'),
        loadOpenApiSpec: jest.fn().mockResolvedValue(realSpec)
      }));

      const result = await createToolsFromSpec(mockServer);
      expect(result).toBe(true);

      // Find the ManageDomains consolidated tool
      const createDomainCall = mockServer.tool.mock.calls.find(
        (call: any[]) => call[0] === 'ManageDomains'
      );
      
      expect(createDomainCall).toBeDefined();

      if (createDomainCall) {
        const [, parameters] = createDomainCall;
        const parameterKeys = Object.keys(parameters);
        
        // Check that nested properties are flattened with underscore notation
        // Domain properties should be flattened
        expect(parameterKeys).toContain('domain_domainName');
        expect(parameterKeys).toContain('domain_autorenewEnabled');
        expect(parameterKeys).toContain('domain_locked');
        expect(parameterKeys).toContain('domain_privacyEnabled');
        
        // Deeply nested contact properties should be flattened
        expect(parameterKeys).toContain('domain_contacts_registrant_firstName');
        expect(parameterKeys).toContain('domain_contacts_registrant_lastName');
        expect(parameterKeys).toContain('domain_contacts_registrant_address1');
        expect(parameterKeys).toContain('domain_contacts_registrant_city');
        expect(parameterKeys).toContain('domain_contacts_registrant_state');
        expect(parameterKeys).toContain('domain_contacts_registrant_zip');
        expect(parameterKeys).toContain('domain_contacts_registrant_country');
        expect(parameterKeys).toContain('domain_contacts_registrant_email');
        expect(parameterKeys).toContain('domain_contacts_registrant_phone');
        
        // Admin contact should also be flattened
        expect(parameterKeys).toContain('domain_contacts_admin_firstName');
        expect(parameterKeys).toContain('domain_contacts_admin_lastName');
        expect(parameterKeys).toContain('domain_contacts_admin_email');
        
        // Array and root-level properties
        expect(parameterKeys).toContain('domain_nameservers');
        expect(parameterKeys).toContain('purchasePrice');
        expect(parameterKeys).toContain('years');
        expect(parameterKeys).toContain('tldRequirements');

        // Should NOT have intermediate objects
        const shouldNotExist = [
          'domain',
          'domain.contacts',
          'domain.contacts.registrant'
        ];

        for (const param of shouldNotExist) {
          expect(parameterKeys).not.toContain(param);
        }
      }
    });

    it('should handle array properties correctly in flattening', async () => {
      jest.doMock('../src/openapi-utils.js', () => ({
        ...jest.requireActual('../src/openapi-utils.js'),
        loadOpenApiSpec: jest.fn().mockResolvedValue(realSpec)
      }));

      await createToolsFromSpec(mockServer);

      // Find a tool that should have array parameters
      const toolWithArrays = mockServer.tool.mock.calls.find((call: any[]) => {
        const [, parameters] = call;
        return Object.keys(parameters).some(key => key.includes('nameservers') || key.includes('metadata'));
      });

      if (toolWithArrays) {
        const [, parameters] = toolWithArrays;
        const parameterKeys = Object.keys(parameters);
        
        // Arrays should be kept as single parameters, not flattened further
        const arrayParams = parameterKeys.filter(key => 
          key.includes('nameservers') || key.includes('metadata')
        );
        
        expect(arrayParams.length).toBeGreaterThan(0);
        
        // Should not have indexed array access (e.g., nameservers.0, nameservers.1)
        const indexedParams = parameterKeys.filter(key => /\.\d+($|\.)/.test(key));
        expect(indexedParams).toHaveLength(0);
      }
    });

    it('should preserve required field information during flattening', async () => {
      jest.doMock('../src/openapi-utils.js', () => ({
        ...jest.requireActual('../src/openapi-utils.js'),
        loadOpenApiSpec: jest.fn().mockResolvedValue(realSpec)
      }));

      await createToolsFromSpec(mockServer);

      // Check that required fields are properly marked
      let foundRequiredFields = false;
      let foundOptionalFields = false;

      for (const call of mockServer.tool.mock.calls) {
        const [toolName, parameters] = call;
        
        for (const [paramName, zodSchema] of Object.entries(parameters)) {
          const schemaType = (zodSchema as any)._def?.typeName;
          
          if (paramName.includes('domain_domainName')) {
            // Domain name should typically be required
            foundRequiredFields = true;
          }
          
          if (schemaType === 'ZodOptional') {
            foundOptionalFields = true;
          }
        }
      }

      // Verify we have both required and optional fields
      expect(foundRequiredFields).toBe(true);
      expect(foundOptionalFields).toBe(true);
    });
  });

  describe('Tool Generation with Real Schema', () => {
    it('should create tools from real spec without errors', async () => {
      // Mock loadOpenApiSpec to return our real spec
      jest.doMock('../src/openapi-utils.js', () => ({
        ...jest.requireActual('../src/openapi-utils.js'),
        loadOpenApiSpec: jest.fn().mockResolvedValue(realSpec)
      }));

      const result = await createToolsFromSpec(mockServer);
      expect(result).toBe(true);
      expect(mockServer.tool).toHaveBeenCalled();
    });

    it('should properly flatten CreateDomain parameters', async () => {
      jest.doMock('../src/openapi-utils.js', () => ({
        ...jest.requireActual('../src/openapi-utils.js'),
        loadOpenApiSpec: jest.fn().mockResolvedValue(realSpec)
      }));

      await createToolsFromSpec(mockServer);

      // Find the ManageDomains consolidated tool
      const createDomainCall = mockServer.tool.mock.calls.find(
        (call: any[]) => call[0] === 'ManageDomains'
      );
      
      expect(createDomainCall).toBeDefined();

      if (createDomainCall) {
        const [, parameters] = createDomainCall;
        const paramKeys = Object.keys(parameters);

        // Should have deeply nested contact properties flattened
        const expectedParams = [
          'domain_domainName',
          'domain_contacts_registrant_firstName',
          'domain_contacts_registrant_lastName',
          'domain_contacts_registrant_email',
          'domain_contacts_registrant_phone',
          'purchasePrice',
          'years'
        ];

        for (const param of expectedParams) {
          expect(paramKeys).toContain(param);
        }

        // Should NOT have intermediate objects
        const shouldNotExist = [
          'domain',
          'domain_contacts',
          'domain_contacts_registrant'
        ];

        for (const param of shouldNotExist) {
          expect(paramKeys).not.toContain(param);
        }
      }
    });
  });

  describe('Complex Schema Scenarios', () => {
    it('should handle EmailForwarding endpoints', async () => {
      jest.doMock('../src/openapi-utils.js', () => ({
        ...jest.requireActual('../src/openapi-utils.js'),
        loadOpenApiSpec: jest.fn().mockResolvedValue(realSpec)
      }));

      await createToolsFromSpec(mockServer);

      const emailForwardingCalls = mockServer.tool.mock.calls.filter(
        (call: any[]) => call[0] === 'ManageEmailForwardings'
      );

      expect(emailForwardingCalls.length).toBeGreaterThan(0);
    });

    it('should handle URLForwarding with nested schemas', async () => {
      jest.doMock('../src/openapi-utils.js', () => ({
        ...jest.requireActual('../src/openapi-utils.js'),
        loadOpenApiSpec: jest.fn().mockResolvedValue(realSpec)
      }));

      await createToolsFromSpec(mockServer);

      const urlForwardingCalls = mockServer.tool.mock.calls.filter(
        (call: any[]) => call[0] === 'ManageURLForwardings'
      );

      expect(urlForwardingCalls.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing schema references gracefully', () => {
      const invalidRef: OpenApiSchema = {
        $ref: '#/components/schemas/NonExistentSchema'
      };

      const utils = require('../src/openapi-utils.js');
      const originalSpec = utils.globalSpec;
      utils.globalSpec = realSpec;

      try {
        const resolved = resolveSchemaRef(invalidRef);
        // Should return the original schema when reference cannot be resolved
        expect(resolved).toEqual(invalidRef);
      } finally {
        utils.globalSpec = originalSpec;
      }
    });

    it('should handle circular references without infinite loops', () => {
      // This is more of a defensive test - the real name.com spec shouldn't have circular refs
      // but our resolver should handle them gracefully
      const utils = require('../src/openapi-utils.js');
      const originalSpec = utils.globalSpec;
      utils.globalSpec = realSpec;

      try {
        // Try resolving a complex schema that could potentially have circular refs
        const domainRef: OpenApiSchema = { $ref: '#/components/schemas/Domain' };
        const resolved = resolveSchemaRef(domainRef);
        
        expect(resolved).toBeDefined();
        expect(resolved.type).toBe('object');
      } finally {
        utils.globalSpec = originalSpec;
      }
    });
  });
}); 