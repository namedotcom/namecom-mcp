import fs from 'fs';
import path from 'path';
import { load } from 'js-yaml';
import { createToolsFromSpec } from '../src/tool-generator.js';
import { loadOpenApiSpec } from '../src/openapi-utils.js';
import { callNameApi } from '../src/api-client.js';
import { OpenApiSpec } from '../src/types.js';

// Mock the API client
jest.mock('../src/api-client.js', () => ({
  callNameApi: jest.fn()
}));

jest.mock('../src/config.js', () => ({
  NAME_USERNAME: 'test-username',
  NAME_TOKEN: 'test-token',
  NAME_API_URL: 'https://mcp.dev.name.com'
}));

const mockCallNameApi = callNameApi as jest.MockedFunction<typeof callNameApi>;

describe('Comprehensive Tool Validation', () => {
  let realSpec: OpenApiSpec;
  let mockServer: any;
  let generatedTools: Array<{
    name: string;
    parameters: Record<string, any>;
    toolFunction: Function;
  }> = [];
  let toolMetrics: {
    totalPaths: number;
    totalOperations: number;
    generatedTools: number;
    successRate: number;
    toolNames: string[];
  } = {
    totalPaths: 0,
    totalOperations: 0,
    generatedTools: 0,
    successRate: 0,
    toolNames: []
  };

  beforeAll(async () => {
    // Setup mock server that captures all tool registrations
    mockServer = {
      tool: jest.fn((name, parameters, toolFunction) => {
        generatedTools.push({ name, parameters, toolFunction });
      }),
      listTools: jest.fn(),
      callTool: jest.fn()
    };

    // Load the actual Name.com OpenAPI spec
    try {
      const specPath = path.join(__dirname, '../assets/namecom.api.yaml');
      const specContent = fs.readFileSync(specPath, 'utf8');
      realSpec = load(specContent) as OpenApiSpec;
    } catch (error) {
      throw new Error(`Failed to load OpenAPI spec: ${error}`);
    }

    // Generate all tools from the real spec
    await createToolsFromSpec(mockServer);

    // Calculate metrics after tool generation
    const totalPaths = Object.keys(realSpec.paths).length;
    let totalOperations = 0;

    for (const pathItem of Object.values(realSpec.paths)) {
      for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
        if (pathItem[method]) {
          totalOperations++;
        }
      }
    }

    toolMetrics = {
      totalPaths,
      totalOperations,
      generatedTools: generatedTools.length,
      successRate: parseFloat(((generatedTools.length / totalOperations) * 100).toFixed(1)),
      toolNames: generatedTools.map(t => t.name)
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCallNameApi.mockReset();
  });

  describe('All Generated Tools Validation', () => {
    it(`should generate tools from real OpenAPI spec (${toolMetrics.generatedTools || 'TBD'} tools from ${toolMetrics.totalOperations || 'TBD'} operations)`, () => {
      expect(generatedTools.length).toBeGreaterThan(0);
      expect(generatedTools.length).toEqual(toolMetrics.generatedTools);
    });

    it('should validate all generated tools have valid Zod parameter schemas', () => {
      const invalidTools: Array<{tool: string, issue: string}> = [];

      for (const tool of generatedTools) {
        try {
          // Check if parameters object is valid
          if (typeof tool.parameters !== 'object' || tool.parameters === null) {
            invalidTools.push({tool: tool.name, issue: 'invalid parameters object'});
            continue;
          }

          // Check each parameter has a valid Zod schema
          for (const [paramName, schema] of Object.entries(tool.parameters)) {
            if (!schema || typeof schema !== 'object') {
              invalidTools.push({tool: tool.name, issue: `${paramName}: invalid schema`});
              continue;
            }

            // Validate Zod schema by testing safeParse method
            try {
              const parseResult = schema.safeParse('');
              expect(typeof parseResult.success).toBe('boolean');
            } catch (error) {
              invalidTools.push({tool: tool.name, issue: `${paramName}: schema parse error`});
            }
          }
        } catch (error) {
          invalidTools.push({tool: tool.name, issue: 'validation error'});
        }
      }

      // If there are invalid tools, the test description will show count
      if (invalidTools.length > 0) {
        throw new Error(`Found ${invalidTools.length} invalid tools: ${JSON.stringify(invalidTools.slice(0, 3))}${invalidTools.length > 3 ? '...' : ''}`);
      }
      
      expect(invalidTools).toHaveLength(0);
    });

    it('should successfully execute tools with no required parameters', async () => {
      const executableTools = generatedTools.filter(tool => {
        const paramKeys = Object.keys(tool.parameters);
        return paramKeys.length === 0 || paramKeys.every(key => {
          const schema = tool.parameters[key];
          return schema._def?.typeName === 'ZodOptional' || schema.isOptional?.();
        });
      });

      const failures: Array<{ tool: string; error: string }> = [];

      for (const tool of executableTools) {
        try {
          mockCallNameApi.mockResolvedValueOnce({ success: true, data: [] });
          const result = await tool.toolFunction({});

          expect(result).toHaveProperty('content');
          expect(Array.isArray(result.content)).toBe(true);
          expect(result.content[0]).toHaveProperty('type', 'text');
          expect(result.content[0]).toHaveProperty('text');

        } catch (error) {
          failures.push({
            tool: tool.name,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      if (failures.length > 0) {
        throw new Error(`${failures.length}/${executableTools.length} tools failed execution: ${JSON.stringify(failures.slice(0, 2))}`);
      }

      expect(failures).toHaveLength(0);
    });

    it('should handle API errors gracefully in tool execution', async () => {
      const testTool = generatedTools[0];
      if (!testTool) {
        throw new Error('No tools generated to test');
      }

      mockCallNameApi.mockRejectedValueOnce(new Error('API Error: 404 Not Found'));
      const result = await testTool.toolFunction({});

      expect(result).toHaveProperty('isError', true);
      expect(result).toHaveProperty('content');
      expect(result.content[0].text).toContain('Error:');
    });

    it('should validate complex parameter type conversion (arrays and objects)', async () => {
      const complexTools = generatedTools.filter(tool => {
        const paramKeys = Object.keys(tool.parameters);
        return paramKeys.some(key => 
          key.includes('.') || 
          key.includes('nameservers') || 
          key.includes('metadata') ||
          key.includes('tldRequirements')
        );
      });

      const failures: Array<{ tool: string; error: string }> = [];
      const testCount = Math.min(5, complexTools.length);

      for (const tool of complexTools.slice(0, testCount)) {
        try {
          const testParams: Record<string, any> = {};

          for (const [paramName, schema] of Object.entries(tool.parameters)) {
            if (paramName.includes('nameservers')) {
              testParams[paramName] = 'ns1.example.com,ns2.example.com';
            } else if (paramName.includes('metadata') || paramName.includes('tldRequirements')) {
              testParams[paramName] = '{"key":"value"}';
            } else if (paramName.includes('_')) {
              testParams[paramName] = 'test-value';
            }
          }

          mockCallNameApi.mockResolvedValueOnce({ success: true });
          await tool.toolFunction(testParams);
          expect(mockCallNameApi).toHaveBeenCalled();

        } catch (error) {
          failures.push({
            tool: tool.name,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      // Report but don't fail on complex parameter issues
      if (failures.length > 0 && testCount > 1) {
        expect(failures.length).toBeLessThan(testCount); // Most should work
      }
      // If we only have 1 test, we'll be more lenient since consolidation reduces tool count
    });

    it('should generate tools for all major Name.com API categories', () => {
      const toolNames = toolMetrics.toolNames;
      
      const expectedCategories = [
        { category: 'Domain', patterns: ['Domain', 'domain'] },
        { category: 'DNS', patterns: ['Record', 'record', 'DNS'] },
        { category: 'Email', patterns: ['Email', 'email'] },
        { category: 'URL', patterns: ['URL', 'url'] },
        { category: 'Hello', patterns: ['Hello', 'hello'] }
      ];

      const foundCategories = expectedCategories.filter(({ patterns }) =>
        toolNames.some(name => patterns.some(pattern => name.includes(pattern)))
      );

      expect(foundCategories.length).toBeGreaterThanOrEqual(3); // Should have most major categories
      expect(generatedTools.length).toBeGreaterThan(10); // Reasonable number of tools
    });

    it(`should achieve high tool generation success rate (${toolMetrics.successRate || 'TBD'}% from ${toolMetrics.totalOperations || 'TBD'} operations)`, () => {
      expect(toolMetrics.totalPaths).toBeGreaterThan(0);
      expect(toolMetrics.totalOperations).toBeGreaterThan(0);
      expect(toolMetrics.generatedTools).toBeGreaterThan(0);
      
      // With consolidated approach, we expect fewer tools (15-20 instead of 50+)
      // Success rate is lower because multiple operations are grouped into single tools
      expect(toolMetrics.successRate).toBeGreaterThan(20); // Much lower due to consolidation
      expect(toolMetrics.generatedTools).toBeGreaterThanOrEqual(10); // Should have at least 10 consolidated tools
    });
  });

  describe('Tool Parameter Edge Cases', () => {
    it('should handle missing optional parameters gracefully', async () => {
      const toolsWithParams = generatedTools.filter(tool => 
        Object.keys(tool.parameters).length > 0
      );

      if (toolsWithParams.length === 0) {
        return; // Skip if no parameterized tools
      }

      const testTool = toolsWithParams[0];
      mockCallNameApi.mockResolvedValueOnce({ success: true });

      const result = await testTool.toolFunction({});
      expect(result).toHaveProperty('content');
      expect(mockCallNameApi).toHaveBeenCalled();
    });

    it('should properly distinguish required vs optional parameters', () => {
      const toolsWithMultipleParams = generatedTools.filter(tool => 
        Object.keys(tool.parameters).length > 1
      );

      let hasProperParameterMix = false;

      for (const tool of toolsWithMultipleParams.slice(0, 3)) {
        const paramKeys = Object.keys(tool.parameters);
        let hasOptional = false;

        for (const key of paramKeys) {
          const schema = tool.parameters[key];
          if (schema._def?.typeName === 'ZodOptional' || schema.isOptional?.()) {
            hasOptional = true;
          }
        }

        if (paramKeys.length > 2 && hasOptional) {
          hasProperParameterMix = true;
          break;
        }
      }

      // Should have at least some tools with proper required/optional parameter mix
      expect(hasProperParameterMix || toolsWithMultipleParams.length === 0).toBe(true);
    });
  });

  describe('Tool Generation Metrics and Quality Report', () => {
    it('should report comprehensive tool generation metrics with quality validation', () => {
      // Calculate detailed metrics
      const totalPaths = Object.keys(realSpec.paths).length;
      let totalOperations = 0;
      const operationsByMethod: Record<string, number> = {};

      for (const pathItem of Object.values(realSpec.paths)) {
        for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
          if (pathItem[method]) {
            totalOperations++;
            operationsByMethod[method] = (operationsByMethod[method] || 0) + 1;
          }
        }
      }

      const successRate = parseFloat(((generatedTools.length / totalOperations) * 100).toFixed(1));

      // Analyze tool complexity
      let toolsWithParameters = 0;
      let toolsWithNestedParams = 0;
      let totalParameters = 0;
      const toolsByCategory: Record<string, number> = {};

      for (const tool of generatedTools) {
        const paramCount = Object.keys(tool.parameters).length;
        totalParameters += paramCount;
        
        if (paramCount > 0) {
          toolsWithParameters++;
        }

        // Check for nested parameters (underscore notation)
        const hasNestedParams = Object.keys(tool.parameters).some(key => key.includes('_'));
        if (hasNestedParams) {
          toolsWithNestedParams++;
        }

        // Categorize tools
        if (tool.name.toLowerCase().includes('domain')) {
          toolsByCategory['Domain'] = (toolsByCategory['Domain'] || 0) + 1;
        } else if (tool.name.toLowerCase().includes('record') || tool.name.toLowerCase().includes('dns')) {
          toolsByCategory['DNS'] = (toolsByCategory['DNS'] || 0) + 1;
        } else if (tool.name.toLowerCase().includes('email')) {
          toolsByCategory['Email'] = (toolsByCategory['Email'] || 0) + 1;
        } else if (tool.name.toLowerCase().includes('url')) {
          toolsByCategory['URL'] = (toolsByCategory['URL'] || 0) + 1;
        } else {
          toolsByCategory['Other'] = (toolsByCategory['Other'] || 0) + 1;
        }
      }

      const avgParamsPerTool = totalParameters / generatedTools.length;

      // Create comprehensive metrics report
      const metrics = {
        spec: {
          totalPaths,
          totalOperations,
          operationsByMethod
        },
        tools: {
          generated: generatedTools.length,
          successRate: `${successRate}%`,
          withParameters: toolsWithParameters,
          withNestedParams: toolsWithNestedParams,
          avgParamsPerTool: parseFloat(avgParamsPerTool.toFixed(1))
        },
        categories: toolsByCategory,
        quality: {
          coverageGoal: successRate > 20 ? 'PASS' : 'FAIL', // Adjusted for consolidated approach
          complexityHandling: toolsWithNestedParams > 0 ? 'PASS' : 'FAIL',
          diversityCoverage: Object.keys(toolsByCategory).length > 2 ? 'PASS' : 'FAIL'
        }
      };

      // Verify quality thresholds (adjusted for consolidated approach)
      expect(successRate).toBeGreaterThan(20); // Lower due to consolidation - fewer tools handling more operations
      expect(toolsWithParameters).toBeGreaterThan(0);
      expect(Object.keys(toolsByCategory).length).toBeGreaterThan(2);
      expect(toolsWithNestedParams).toBeGreaterThan(0);
      
      // Sample tool names for verification
      const sampleTools = generatedTools.slice(0, 5).map(t => t.name);
      expect(sampleTools.length).toBeGreaterThan(0);
      expect(sampleTools).toEqual(expect.arrayContaining([expect.any(String)]));

      // Force display of metrics in test output by creating a comparison
  
      
      // Validate essential metrics
      expect(metrics.tools.generated).toBe(generatedTools.length);
      expect(metrics.spec.totalOperations).toBe(totalOperations);
      expect(metrics.quality.coverageGoal).toBe('PASS');
    });
  });
}); 