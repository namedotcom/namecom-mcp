import { jest } from '@jest/globals';

describe('Config URL Validation', () => {
  const originalEnv = process.env;
  const originalExit = process.exit;
  const originalStderrWrite = process.stderr.write;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    
    // Mock process.exit to prevent tests from actually exiting
    process.exit = jest.fn() as never;
    
    // Mock stderr.write to capture error messages
    process.stderr.write = jest.fn().mockReturnValue(true) as any;
  });

  afterEach(() => {
    process.env = originalEnv;
    process.exit = originalExit;
    process.stderr.write = originalStderrWrite;
  });

  it('should accept valid MCP development URL', async () => {
    process.env.NAME_USERNAME = 'test-user';
    process.env.NAME_TOKEN = 'test-token';
    process.env.NAME_API_URL = 'https://mcp.dev.name.com';

    const config = await import('../src/config.js');
    expect(config.NAME_API_URL).toBe('https://mcp.dev.name.com');
    expect(process.exit).not.toHaveBeenCalled();
  });

  it('should accept valid MCP production URL', async () => {
    process.env.NAME_USERNAME = 'test-user';
    process.env.NAME_TOKEN = 'test-token';
    process.env.NAME_API_URL = 'https://mcp.name.com';

    const config = await import('../src/config.js');
    expect(config.NAME_API_URL).toBe('https://mcp.name.com');
    expect(process.exit).not.toHaveBeenCalled();
  });

  it('should default to development URL when none provided', async () => {
    process.env.NAME_USERNAME = 'test-user';
    process.env.NAME_TOKEN = 'test-token';
    delete process.env.NAME_API_URL;

    const config = await import('../src/config.js');
    expect(config.NAME_API_URL).toBe('https://mcp.dev.name.com');
    expect(process.exit).not.toHaveBeenCalled();
  });

  it('should reject old API dev URL', async () => {
    process.env.NAME_USERNAME = 'test-user';
    process.env.NAME_TOKEN = 'test-token';
    process.env.NAME_API_URL = 'https://api.dev.name.com';

    await import('../src/config.js');
    
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(process.stderr.write).toHaveBeenCalledWith(
      expect.stringContaining('Invalid NAME_API_URL provided: https://api.dev.name.com')
    );
    expect(process.stderr.write).toHaveBeenCalledWith(
      expect.stringContaining('Please use one of the supported endpoints')
    );
  });

  it('should reject old API production URL', async () => {
    process.env.NAME_USERNAME = 'test-user';
    process.env.NAME_TOKEN = 'test-token';
    process.env.NAME_API_URL = 'https://api.name.com';

    await import('../src/config.js');
    
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(process.stderr.write).toHaveBeenCalledWith(
      expect.stringContaining('Invalid NAME_API_URL provided: https://api.name.com')
    );
  });

  it('should reject arbitrary URLs', async () => {
    process.env.NAME_USERNAME = 'test-user';
    process.env.NAME_TOKEN = 'test-token';
    process.env.NAME_API_URL = 'https://example.com';

    await import('../src/config.js');
    
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(process.stderr.write).toHaveBeenCalledWith(
      expect.stringContaining('Invalid NAME_API_URL provided: https://example.com')
    );
  });

  it('should reject malicious URLs', async () => {
    process.env.NAME_USERNAME = 'test-user';
    process.env.NAME_TOKEN = 'test-token';
    process.env.NAME_API_URL = 'https://evil-site.com/mcp.dev.name.com';

    await import('../src/config.js');
    
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(process.stderr.write).toHaveBeenCalledWith(
      expect.stringContaining('Invalid NAME_API_URL provided: https://evil-site.com/mcp.dev.name.com')
    );
  });

  it('should provide helpful error message with allowed URLs', async () => {
    process.env.NAME_USERNAME = 'test-user';
    process.env.NAME_TOKEN = 'test-token';
    process.env.NAME_API_URL = 'https://wrong.com';

    await import('../src/config.js');
    
    expect(process.stderr.write).toHaveBeenCalledWith(
      expect.stringMatching(/https:\/\/mcp\.dev\.name\.com.*development/)
    );
    expect(process.stderr.write).toHaveBeenCalledWith(
      expect.stringMatching(/https:\/\/mcp\.name\.com.*production/)
    );
  });
}); 