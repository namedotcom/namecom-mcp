// Test setup file

// Set up test environment variables
process.env.NAME_USERNAME = 'test-username';
process.env.NAME_TOKEN = 'test-token';
process.env.NAME_API_URL = 'https://mcp.dev.name.com';


// Mock console methods to avoid noise in test output
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  // Keep error and warn for debugging
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
}; 