// Mock the config module to avoid import.meta issues
vi.mock('../src/config.js', () => ({
  NAME_USERNAME: 'test-username',
  NAME_TOKEN: 'test-token',
  NAME_API_URL: 'https://mcp.dev.name.com'
}));

// Mock undici fetch before importing any modules
const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }));
vi.mock('undici', () => ({
  fetch: mockFetch
}));

import { callNameApi } from '../src/api-client.js';

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    it('adds operation headers without letting them replace the credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
        headers: new Map([['content-type', 'application/json']])
      });

      await callNameApi('/core/v1/domains', 'POST', {}, {
        'X-Idempotency-Key': 'key-123',
        'Authorization': 'Bearer not-the-caller'
      });

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['X-Idempotency-Key']).toBe('key-123');
      expect(headers['Authorization']).toMatch(/^Basic /);
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

describe('API Client TLS', () => {
  test('never turns off certificate checks for a request', async () => {
    // Up to 1.2.1 every request to mcp.dev.name.com and mcp.name.com ran with
    // NODE_TLS_REJECT_UNAUTHORIZED=0, so a forged certificate was accepted and the account's
    // API token went to whoever presented it. Both hosts have valid public certificates.
    let seen: string | undefined = 'not called';
    mockFetch.mockImplementationOnce(async () => {
      seen = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      return { ok: true, status: 200, json: async () => ({}) };
    });

    await callNameApi('/core/v1/hello');

    expect(seen).not.toBe('not called');
    expect(seen).not.toBe('0');
  });
});
