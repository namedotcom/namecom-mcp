// Mock the config module to avoid import.meta issues
jest.mock('../src/config.js', () => ({
  NAME_USERNAME: 'test-username',
  NAME_TOKEN: 'test-token',
  NAME_API_URL: 'https://mcp.dev.name.com'
}));

// Mock undici fetch before importing any modules
const mockFetch = jest.fn();
jest.mock('undici', () => ({
  fetch: mockFetch
}));

import { callNameApi } from '../src/api-client.js';

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('callNameApi', () => {
    it('should make GET request with correct headers and URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ domains: [] }),
        headers: new Map([['content-type', 'application/json']])
      });

      const result = await callNameApi('/core/v1/domains');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://mcp.dev.name.com/core/v1/domains',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': expect.stringMatching(/^Basic /),
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual({ domains: [] });
    });

    it('should make POST request with body', async () => {
      const requestBody = { keyword: 'test' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ results: [] }),
        headers: new Map([['content-type', 'application/json']])
      });

      const result = await callNameApi('/core/v1/domains', 'POST', requestBody);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://mcp.dev.name.com/core/v1/domains',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: expect.objectContaining({
            'Authorization': expect.stringMatching(/^Basic /),
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual({ results: [] });
    });

    it('should include authorization header with base64 encoded credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
        headers: new Map([['content-type', 'application/json']])
      });

      await callNameApi('/core/v1/domains');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/core/v1/domains'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringMatching(/^Basic [A-Za-z0-9+/]+=*$/)
          })
        })
      );
    });

    it('should handle different HTTP methods', async () => {
      const requestBody = { test: 'data' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
        headers: new Map([['content-type', 'application/json']])
      });

      await callNameApi('/core/v1/domains', 'POST', requestBody);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://mcp.dev.name.com/core/v1/domains',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody)
        })
      );
    });

    it('should handle GET requests without body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
        headers: new Map([['content-type', 'application/json']])
      });

      await callNameApi('/core/v1/domains', 'GET');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://mcp.dev.name.com/core/v1/domains',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': expect.stringMatching(/^Basic /),
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should throw error for non-ok responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Domain not found'
      });

      await expect(callNameApi('/core/v1/error')).rejects.toThrow(
        'name.com API error: 404 Not Found - Domain not found'
      );
    });

    it('should support all HTTP methods', async () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
      
      for (const method of methods) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({}),
          headers: new Map([['content-type', 'application/json']])
        });

        await callNameApi('/core/v1/domains', method);

        expect(mockFetch).toHaveBeenLastCalledWith(
          'https://mcp.dev.name.com/core/v1/domains',
          expect.objectContaining({ method })
        );
      }
    });

    it('should construct URLs correctly with path parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
        headers: new Map([['content-type', 'application/json']])
      });

      await callNameApi('/core/v1/domains/test.com');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://mcp.dev.name.com/core/v1/domains/test.com',
        expect.any(Object)
      );
    });

    it('should handle 204 No Content responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Map()
      });

      const result = await callNameApi('/core/v1/domains/example.com/records/1', 'DELETE');

      expect(result).toBeUndefined();
    });

    it('should include User-Agent header with version number', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
        headers: new Map([['content-type', 'application/json']])
      });

      await callNameApi('/core/v1/domains');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/core/v1/domains'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.stringMatching(/^namecom-mcp\/\d+\.\d+\.\d+.*$/)
          })
        })
      );
    });
  });
});

describe('API Client Configuration', () => {
  // Add test to ensure only MCP URLs are in trusted list
  test('TRUSTED_MCP_URLS should only contain official MCP URLs', () => {
    // Read the source file to extract TRUSTED_MCP_URLS
    const fs = require('fs');
    const path = require('path');
    const apiClientPath = path.join(__dirname, '..', 'src', 'api-client.ts');
    const sourceCode = fs.readFileSync(apiClientPath, 'utf8');
    
    // Extract the TRUSTED_MCP_URLS array using regex
    const trustedUrlsMatch = sourceCode.match(/const TRUSTED_MCP_URLS = \[([\s\S]*?)\];/);
    expect(trustedUrlsMatch).toBeTruthy();
    
    const urlsString = trustedUrlsMatch[1];
    const urls = urlsString
      .split(',')
      .map((line: string) => line.trim())
      .filter((line: string) => line.startsWith("'") || line.startsWith('"'))
      .map((line: string) => line.replace(/['"]/g, '').trim());
    
    // Define allowed MCP URLs
    const allowedMcpUrls = [
      'https://mcp.dev.name.com',
      'https://mcp.name.com'
    ];
    
    // Check that only allowed URLs are present
    urls.forEach((url: string) => {
      expect(allowedMcpUrls).toContain(url);
    });
    
    // Ensure we have exactly the expected URLs
    expect(urls.sort()).toEqual(allowedMcpUrls.sort());
  });
}); 