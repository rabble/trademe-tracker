// Mock environment variables to support testing
import { vi } from 'vitest';

// Create a test environment for environment variables
const mockEnv = {
  VITE_FIRECRAWL_API_KEY: 'test-api-key',
  VITE_WORKER_URL: 'http://localhost:8787',
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  MODE: 'test',
};

// Mock Vite's import.meta.env
vi.stubGlobal('import.meta', {
  env: mockEnv,
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to silence specific console methods during tests
  // log: vi.fn(),
  // error: vi.fn(),
  // warn: vi.fn(),
};