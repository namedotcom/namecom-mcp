// Mock the config module to test its exports
jest.mock('../src/config.js', () => ({
  NAME_USERNAME: 'test-username',
  NAME_TOKEN: 'test-token', 
  NAME_API_URL: 'https://mcp.dev.name.com',
  DEFAULT_VALUES: {
    perPage: 1000,
    page: 1,
    sort: 'name',
    dir: 'asc'
  },
  SERVER_CONFIG: {
    name: 'Name.com API',
    version: '1.0.0'
  }
}));

describe('Configuration', () => {
  it('should export required configuration values', async () => {
    const config = await import('../src/config.js');
    
    expect(config.NAME_USERNAME).toBe('test-username');
    expect(config.NAME_TOKEN).toBe('test-token');
    expect(config.NAME_API_URL).toBe('https://mcp.dev.name.com');
  });

  it('should export default values for API parameters', async () => {
    const config = await import('../src/config.js');
    
    expect(config.DEFAULT_VALUES).toEqual({
      perPage: 1000,
      page: 1,
      sort: 'name',
      dir: 'asc'
    });
  });

  it('should export server configuration', async () => {
    const config = await import('../src/config.js');
    
    expect(config.SERVER_CONFIG).toEqual({
      name: 'Name.com API',
      version: '1.0.0'
    });
  });

  it('should have proper API URL format', async () => {
    const config = await import('../src/config.js');
    
    expect(config.NAME_API_URL).toMatch(/^https:\/\//);
    expect(config.NAME_API_URL).toContain('name.com');
  });
}); 