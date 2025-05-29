import { resolveSchemaRef, openApiSchemaToZod, setGlobalSpec, getGlobalSpec } from '../src/openapi-utils';
import { OpenApiSchema } from '../src/types';
import { z } from 'zod';

// Mock schemas for testing
const mockContactSchema: OpenApiSchema = {
  type: 'object',
  properties: {
    firstName: { type: 'string', description: 'First name' },
    lastName: { type: 'string', description: 'Last name' },
    email: { type: 'string', format: 'email', description: 'Email address' },
    phone: { type: 'string', description: 'Phone number' },
    address1: { type: 'string', description: 'Address line 1' },
    city: { type: 'string', description: 'City' },
    state: { type: 'string', description: 'State' },
    zip: { type: 'string', description: 'ZIP code' },
    country: { type: 'string', description: 'Country code' }
  },
  required: ['firstName', 'lastName', 'email', 'phone', 'address1', 'city', 'state', 'zip', 'country']
};

const mockContactsSchema: OpenApiSchema = {
  type: 'object',
  properties: {
    registrant: { $ref: '#/components/schemas/Contact' },
    admin: { $ref: '#/components/schemas/Contact' },
    tech: { $ref: '#/components/schemas/Contact' },
    billing: { $ref: '#/components/schemas/Contact' }
  }
};

const mockDomainSchema: OpenApiSchema = {
  type: 'object',
  properties: {
    domainName: { 
      type: 'string', 
      description: 'The domain name' 
    },
    contacts: { $ref: '#/components/schemas/Contacts' },
    autorenewEnabled: { type: 'boolean' },
    locked: { type: 'boolean' },
    privacyEnabled: { type: 'boolean' },
    nameservers: {
      type: 'array',
      items: { type: 'string' }
    }
  }
};

const mockCreateDomainRequestSchema: OpenApiSchema = {
  type: 'object',
  properties: {
    domain: { $ref: '#/components/schemas/Domain' },
    purchasePrice: { type: 'number' },
    years: { type: 'integer' },
    purchaseType: { type: 'string' }
  }
};

const mockGlobalSpec = {
  openapi: '3.1.0',
  info: { title: 'Test API', version: '1.0.0' },
  paths: {},
  components: {
    schemas: {
      Contact: mockContactSchema,
      Contacts: mockContactsSchema,
      Domain: mockDomainSchema,
      CreateDomainRequest: mockCreateDomainRequestSchema,
      RecursiveNode: {
        type: 'object',
        properties: {
          value: { type: 'string' },
          children: {
            type: 'array',
            items: { $ref: '#/components/schemas/RecursiveNode' }
          }
        }
      }
    }
  }
};

describe('OpenAPI Schema Resolution and Conversion', () => {
  
  beforeEach(() => {
    // Set up the global spec for reference resolution using our new helper function
    setGlobalSpec(mockGlobalSpec);
  });

  afterEach(() => {
    // Clean up after each test
    setGlobalSpec(null);
  });

  describe('resolveSchemaRef', () => {
    it('should return empty object for null/undefined schema', () => {
      expect(resolveSchemaRef(null as any)).toEqual({});
      expect(resolveSchemaRef(undefined as any)).toEqual({});
    });

    it('should return schema as-is when no references', () => {
      const simpleSchema: OpenApiSchema = {
        type: 'string',
        description: 'Simple string'
      };
      
      expect(resolveSchemaRef(simpleSchema)).toEqual(simpleSchema);
    });

    it('should resolve simple $ref references', () => {
      const schemaWithRef: OpenApiSchema = {
        $ref: '#/components/schemas/Contact'
      };
      
      const resolved = resolveSchemaRef(schemaWithRef);
      expect(resolved).toEqual(mockContactSchema);
      expect(resolved.properties?.firstName).toBeDefined();
      expect(resolved.required).toContain('firstName');
    });

    it('should resolve nested $ref references', () => {
      const schemaWithNestedRef: OpenApiSchema = {
        $ref: '#/components/schemas/Contacts'
      };
      
      const resolved = resolveSchemaRef(schemaWithNestedRef);
      expect(resolved.properties?.registrant).toEqual(mockContactSchema);
      expect(resolved.properties?.admin).toEqual(mockContactSchema);
    });

    it('should handle deeply nested references in Domain schema', () => {
      const domainRef: OpenApiSchema = {
        $ref: '#/components/schemas/Domain'
      };
      
      const resolved = resolveSchemaRef(domainRef);
      expect(resolved.properties?.domainName).toEqual({
        type: 'string',
        description: 'The domain name'
      });
      expect(resolved.properties?.contacts).toEqual({
        type: 'object',
        properties: {
          registrant: mockContactSchema,
          admin: mockContactSchema,
          tech: mockContactSchema,
          billing: mockContactSchema
        }
      });
    });

    it('should handle allOf merging schemas', () => {
      const allOfSchema: OpenApiSchema = {
        allOf: [
          {
            type: 'object',
            properties: {
              name: { type: 'string' }
            },
            required: ['name']
          },
          {
            type: 'object',
            properties: {
              age: { type: 'integer' }
            },
            required: ['age']
          }
        ]
      };

      const resolved = resolveSchemaRef(allOfSchema);
      expect(resolved.properties?.name).toEqual({ type: 'string' });
      expect(resolved.properties?.age).toEqual({ type: 'integer' });
      expect(resolved.required).toEqual(['name', 'age']);
    });

    it('should handle allOf with $ref schemas', () => {
      const allOfWithRef: OpenApiSchema = {
        allOf: [
          { $ref: '#/components/schemas/Contact' },
          {
            type: 'object',
            properties: {
              customField: { type: 'string' }
            }
          }
        ]
      };

      const resolved = resolveSchemaRef(allOfWithRef);
      expect(resolved.properties?.firstName).toBeDefined(); // From Contact
      expect(resolved.properties?.customField).toEqual({ type: 'string' });
    });

    it('should handle oneOf by taking first schema', () => {
      const oneOfSchema: OpenApiSchema = {
        oneOf: [
          {
            type: 'object',
            properties: {
              option1: { type: 'string' }
            }
          },
          {
            type: 'object',
            properties: {
              option2: { type: 'integer' }
            }
          }
        ]
      };

      const resolved = resolveSchemaRef(oneOfSchema);
      expect(resolved.properties?.option1).toEqual({ type: 'string' });
      expect(resolved.properties?.option2).toBeUndefined();
    });

    it('should handle anyOf by merging all schemas', () => {
      const anyOfSchema: OpenApiSchema = {
        anyOf: [
          {
            type: 'object',
            properties: {
              field1: { type: 'string' }
            }
          },
          {
            type: 'object',
            properties: {
              field2: { type: 'integer' }
            }
          }
        ]
      };

      const resolved = resolveSchemaRef(anyOfSchema);
      expect(resolved.properties?.field1).toEqual({ type: 'string' });
      expect(resolved.properties?.field2).toEqual({ type: 'integer' });
    });
  });

  describe('openApiSchemaToZod', () => {
    it('should convert simple string schema', () => {
      const schema: OpenApiSchema = { type: 'string', description: 'Test string' };
      const zodSchema = openApiSchemaToZod(schema, false);
      
      expect(zodSchema).toBeInstanceOf(z.ZodOptional);
      expect(zodSchema._def.innerType).toBeInstanceOf(z.ZodString);
    });

    it('should convert required string schema', () => {
      const schema: OpenApiSchema = { type: 'string' };
      const zodSchema = openApiSchemaToZod(schema, true);
      
      expect(zodSchema).toBeInstanceOf(z.ZodString);
    });

    it('should handle union types with null', () => {
      const schema: OpenApiSchema = { 
        type: ['string', 'null'],
        description: 'Nullable string'
      };
      const zodSchema = openApiSchemaToZod(schema, false);
      
      expect(zodSchema).toBeInstanceOf(z.ZodOptional);
    });

    it('should convert object schema with nested properties', () => {
      const schema: OpenApiSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'integer' }
        },
        required: ['name']
      };
      
      const zodSchema = openApiSchemaToZod(schema, false);
      expect(zodSchema).toBeInstanceOf(z.ZodOptional);
      expect(zodSchema._def.innerType).toBeInstanceOf(z.ZodObject);
    });

    it('should convert array schema', () => {
      const schema: OpenApiSchema = {
        type: 'array',
        items: { type: 'string' }
      };
      
      const zodSchema = openApiSchemaToZod(schema, false);
      expect(zodSchema).toBeInstanceOf(z.ZodOptional);
      expect(zodSchema._def.innerType).toBeInstanceOf(z.ZodArray);
    });

    it('should resolve $ref before converting to Zod', () => {
      const schema: OpenApiSchema = {
        $ref: '#/components/schemas/Contact'
      };
      
      const zodSchema = openApiSchemaToZod(schema, false);
      expect(zodSchema).toBeInstanceOf(z.ZodOptional);
      expect(zodSchema._def.innerType).toBeInstanceOf(z.ZodObject);
    });

    it('should handle enum schemas', () => {
      const schema: OpenApiSchema = {
        type: 'string',
        enum: ['option1', 'option2', 'option3']
      };
      
      const zodSchema = openApiSchemaToZod(schema, false);
      expect(zodSchema).toBeInstanceOf(z.ZodOptional);
      expect(zodSchema._def.innerType).toBeInstanceOf(z.ZodEnum);
    });
  });

  describe('Real-world nested schema scenarios', () => {
    it('should correctly flatten CreateDomainRequest schema', () => {
      const createDomainSchema = resolveSchemaRef({
        $ref: '#/components/schemas/CreateDomainRequest'
      });

      // Should have flattened the domain reference
      expect(createDomainSchema.properties?.domain).toEqual({
        type: 'object',
        properties: {
          domainName: { 
            type: 'string', 
            description: 'The domain name' 
          },
          contacts: {
            type: 'object',
            properties: {
              registrant: mockContactSchema,
              admin: mockContactSchema,
              tech: mockContactSchema,
              billing: mockContactSchema
            }
          },
          autorenewEnabled: { type: 'boolean' },
          locked: { type: 'boolean' },
          privacyEnabled: { type: 'boolean' },
          nameservers: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      });
      expect(createDomainSchema.properties?.purchasePrice).toBeDefined();
      expect(createDomainSchema.properties?.years).toBeDefined();
    });

    it('should handle deeply nested Contact within Domain within CreateDomainRequest', () => {
      const createDomainSchema = resolveSchemaRef({
        $ref: '#/components/schemas/CreateDomainRequest'
      });

      // Navigate through the nested structure
      const domainSchema = resolveSchemaRef(createDomainSchema.properties!.domain);
      const contactsSchema = resolveSchemaRef(domainSchema.properties!.contacts);
      const registrantContact = resolveSchemaRef(contactsSchema.properties!.registrant);

      expect(registrantContact.properties?.firstName).toBeDefined();
      expect(registrantContact.properties?.email).toBeDefined();
      expect(registrantContact.required).toContain('firstName');
      expect(registrantContact.required).toContain('email');
    });

    it('should handle array of objects with nested references', () => {
      const arraySchema: OpenApiSchema = {
        type: 'array',
        items: { $ref: '#/components/schemas/Domain' }
      };

      const resolved = resolveSchemaRef(arraySchema);
      expect(resolved.type).toBe('array');
      expect(resolved.items).toBeDefined();

      const itemSchema = resolveSchemaRef(resolved.items!);
      expect(itemSchema).toEqual({
        type: 'object',
        properties: {
          domainName: { 
            type: 'string', 
            description: 'The domain name' 
          },
          contacts: {
            type: 'object',
            properties: {
              registrant: mockContactSchema,
              admin: mockContactSchema,
              tech: mockContactSchema,
              billing: mockContactSchema
            }
          },
          autorenewEnabled: { type: 'boolean' },
          locked: { type: 'boolean' },
          privacyEnabled: { type: 'boolean' },
          nameservers: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      });
    });

    it('should convert complex nested schema to Zod correctly', () => {
      const complexSchema: OpenApiSchema = {
        type: 'object',
        properties: {
          domains: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Domain'
            }
          },
          totalCount: { type: 'integer' },
          metadata: {
            type: 'object',
            additionalProperties: { type: 'string' }
          }
        },
        required: ['domains']
      };

      const zodSchema = openApiSchemaToZod(complexSchema, true);
      expect(zodSchema).toBeInstanceOf(z.ZodObject);
    });

    it('should handle schema with missing $ref gracefully', () => {
      const invalidRefSchema: OpenApiSchema = {
        $ref: '#/components/schemas/NonExistentSchema'
      };

      const resolved = resolveSchemaRef(invalidRefSchema);
      // Should return the original schema when reference cannot be resolved
      expect(resolved).toEqual(invalidRefSchema);
    });

    it('should handle recursive schema references', () => {
      const recursiveSchema: OpenApiSchema = {
        $ref: '#/components/schemas/RecursiveNode'
      };

      // This should not cause infinite recursion
      const resolved = resolveSchemaRef(recursiveSchema);
      expect(resolved.properties?.value).toEqual({ type: 'string' });
      expect(resolved.properties?.children).toBeDefined();
      expect(resolved.properties?.children.type).toEqual('array');
      // The items should preserve the reference to prevent infinite expansion
      expect(resolved.properties?.children.items).toEqual({ $ref: '#/components/schemas/RecursiveNode' });
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle schema without type but with properties', () => {
      const schema: OpenApiSchema = {
        properties: {
          field1: { type: 'string' },
          field2: { type: 'integer' }
        }
      };

      const zodSchema = openApiSchemaToZod(schema, false);
      expect(zodSchema).toBeInstanceOf(z.ZodOptional);
      expect(zodSchema._def.innerType).toBeInstanceOf(z.ZodObject);
    });

    it('should handle schema with additionalProperties', () => {
      const schema: OpenApiSchema = {
        type: 'object',
        additionalProperties: { type: 'string' }
      };

      const zodSchema = openApiSchemaToZod(schema, false);
      expect(zodSchema).toBeInstanceOf(z.ZodOptional);
      expect(zodSchema._def.innerType).toBeInstanceOf(z.ZodObject);
    });

    it('should handle empty allOf array', () => {
      const schema: OpenApiSchema = {
        allOf: []
      };

      const resolved = resolveSchemaRef(schema);
      expect(resolved.properties).toEqual({});
      expect(resolved.required).toEqual([]);
    });

    it('should handle empty oneOf array', () => {
      const schema: OpenApiSchema = {
        oneOf: []
      };

      const resolved = resolveSchemaRef(schema);
      expect(resolved).toEqual(schema);
    });

    it('should handle OpenAPI 3.0 nullable fields', () => {
      const schema: OpenApiSchema = {
        type: 'string',
        nullable: true
      };

      const zodSchema = openApiSchemaToZod(schema, false);
      expect(zodSchema).toBeInstanceOf(z.ZodOptional);
    });
  });
}); 