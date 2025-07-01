// Mock undici fetch before importing any modules
const mockFetchGlobal = jest.fn();
jest.mock('undici', () => ({
  fetch: mockFetchGlobal
}));

// Mock config
jest.mock('../src/config.js', () => ({
  NAME_USERNAME: 'test-username',
  NAME_TOKEN: 'test-token',
  NAME_API_URL: 'https://mcp.dev.name.com'
}));

import { callNameApi } from '../src/api-client.js';

describe('name.com API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchGlobal.mockClear();
  });

  describe('Domain Management', () => {
    it('should list domains with proper authentication', async () => {
      mockFetchGlobal.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          domains: [
            { domainName: 'example.com', expireDate: '2024-12-31' },
            { domainName: 'test.com', expireDate: '2025-01-15' }
          ]
        }),
        headers: new Map([['content-type', 'application/json']])
      });

      const result = await callNameApi('/core/v1/domains');

      expect(mockFetchGlobal).toHaveBeenCalledWith(
        'https://mcp.dev.name.com/core/v1/domains',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': expect.stringMatching(/^Basic /),
            'Content-Type': 'application/json'
          })
        })
      );

      expect(result).toEqual({
        domains: [
          { domainName: 'example.com', expireDate: '2024-12-31' },
          { domainName: 'test.com', expireDate: '2025-01-15' }
        ]
      });
    });

    it('should search for domains', async () => {
      mockFetchGlobal.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          results: [
            { domainName: 'available-domain.com', purchasable: true, premium: false }
          ]
        }),
        headers: new Map([['content-type', 'application/json']])
      });

      const result = await callNameApi('/core/v1/domains:search', 'POST', {
        keyword: 'available-domain'
      });

      expect(mockFetchGlobal).toHaveBeenCalledWith(
        'https://mcp.dev.name.com/core/v1/domains:search',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ keyword: 'available-domain' }),
          headers: expect.objectContaining({
            'Authorization': expect.stringMatching(/^Basic /),
            'Content-Type': 'application/json'
          })
        })
      );

      expect(result).toEqual({
        results: [
          { domainName: 'available-domain.com', purchasable: true, premium: false }
        ]
      });
    });

    it('should get domain details', async () => {
      mockFetchGlobal.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          domainName: 'example.com',
          expireDate: '2024-12-31',
          autorenewEnabled: true,
          locked: false
        }),
        headers: new Map([['content-type', 'application/json']])
      });

      const result = await callNameApi('/core/v1/domains/example.com');

      expect(mockFetchGlobal).toHaveBeenCalledWith(
        'https://mcp.dev.name.com/core/v1/domains/example.com',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': expect.stringMatching(/^Basic /),
            'Content-Type': 'application/json'
          })
        })
      );

      expect(result).toEqual({
        domainName: 'example.com',
        expireDate: '2024-12-31',
        autorenewEnabled: true,
        locked: false
      });
    });
  });

  describe('DNS Management', () => {
    it('should list DNS records for a domain', async () => {
      mockFetchGlobal.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          records: [
            {
              id: 1,
              host: 'www',
              type: 'A',
              answer: '192.168.1.1',
              ttl: 300
            },
            {
              id: 2,
              host: '',
              type: 'MX',
              answer: 'mail.example.com',
              priority: 10,
              ttl: 300
            }
          ]
        }),
        headers: new Map([['content-type', 'application/json']])
      });

      const result = await callNameApi('/core/v1/domains/example.com/records');

      expect(result).toEqual({
        records: [
          {
            id: 1,
            host: 'www',
            type: 'A',
            answer: '192.168.1.1',
            ttl: 300
          },
          {
            id: 2,
            host: '',
            type: 'MX',
            answer: 'mail.example.com',
            priority: 10,
            ttl: 300
          }
        ]
      });
    });

    it('should create a DNS record', async () => {
      mockFetchGlobal.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: 3,
          host: 'api',
          type: 'A',
          answer: '192.168.1.2',
          ttl: 300
        }),
        headers: new Map([['content-type', 'application/json']])
      });

      const result = await callNameApi('/core/v1/domains/example.com/records', 'POST', {
        host: 'api',
        type: 'A',
        answer: '192.168.1.2',
        ttl: 300
      });

      expect(mockFetchGlobal).toHaveBeenCalledWith(
        'https://mcp.dev.name.com/core/v1/domains/example.com/records',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            host: 'api',
            type: 'A',
            answer: '192.168.1.2',
            ttl: 300
          }),
          headers: expect.objectContaining({
            'Authorization': expect.stringMatching(/^Basic /),
            'Content-Type': 'application/json'
          })
        })
      );

      expect(result).toEqual({
        id: 3,
        host: 'api',
        type: 'A',
        answer: '192.168.1.2',
        ttl: 300
      });
    });

    it('should update a DNS record', async () => {
      mockFetchGlobal.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: 1,
          host: 'www',
          type: 'A',
          answer: '192.168.1.100',
          ttl: 600
        }),
        headers: new Map([['content-type', 'application/json']])
      });

      const result = await callNameApi('/core/v1/domains/example.com/records/1', 'PUT', {
        host: 'www',
        type: 'A',
        answer: '192.168.1.100',
        ttl: 600
      });

      expect(result).toEqual({
        id: 1,
        host: 'www',
        type: 'A',
        answer: '192.168.1.100',
        ttl: 600
      });
    });

    it('should delete a DNS record', async () => {
      mockFetchGlobal.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Map()
      });

      const result = await callNameApi('/core/v1/domains/example.com/records/1', 'DELETE');

      expect(mockFetchGlobal).toHaveBeenCalledWith(
        'https://mcp.dev.name.com/core/v1/domains/example.com/records/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': expect.stringMatching(/^Basic /),
            'Content-Type': 'application/json'
          })
        })
      );

      expect(result).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      mockFetchGlobal.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Domain not found'
      });

      await expect(callNameApi('/core/v1/domains/nonexistent.com')).rejects.toThrow(
        'name.com API error: 404 Not Found - Domain not found'
      );
    });

    it('should handle 401 authentication errors', async () => {
      mockFetchGlobal.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Invalid credentials'
      });

      await expect(callNameApi('/core/v1/domains')).rejects.toThrow(
        'name.com API error: 401 Unauthorized - Invalid credentials'
      );
    });

    it('should handle 429 rate limit errors', async () => {
      mockFetchGlobal.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: async () => 'Rate limit exceeded'
      });

      await expect(callNameApi('/core/v1/domains')).rejects.toThrow(
        'name.com API error: 429 Too Many Requests - Rate limit exceeded'
      );
    });

    it('should handle 500 server errors', async () => {
      mockFetchGlobal.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error occurred'
      });

      await expect(callNameApi('/core/v1/domains')).rejects.toThrow(
        'name.com API error: 500 Internal Server Error - Server error occurred'
      );
    });
  });

  describe('Pagination', () => {
    it('should handle paginated responses', async () => {
      mockFetchGlobal.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          domains: [
            { domainName: 'domain1.com', expireDate: '2024-12-31' },
            { domainName: 'domain2.com', expireDate: '2025-01-15' }
          ],
          nextPage: 2,
          totalCount: 100
        }),
        headers: new Map([
          ['content-type', 'application/json'],
          ['Link', '<https://mcp.dev.name.com/core/v1/domains?page=2>; rel="next"']
        ])
      });

      const result = await callNameApi('/core/v1/domains?page=1&perPage=2');

      expect(result).toEqual({
        domains: [
          { domainName: 'domain1.com', expireDate: '2024-12-31' },
          { domainName: 'domain2.com', expireDate: '2025-01-15' }
        ],
        nextPage: 2,
        totalCount: 100
      });
    });

    it('should handle query parameters correctly', async () => {
      mockFetchGlobal.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ domains: [] }),
        headers: new Map([['content-type', 'application/json']])
      });

      await callNameApi('/core/v1/domains?sort=expireDate&dir=asc&filter=example');

      expect(mockFetchGlobal).toHaveBeenCalledWith(
        'https://mcp.dev.name.com/core/v1/domains?sort=expireDate&dir=asc&filter=example',
        expect.any(Object)
      );
    });
  });
}); 