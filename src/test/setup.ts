import '@testing-library/jest-dom';
import matchers from '@testing-library/jest-dom/matchers';
import { afterEach, expect } from 'vitest';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  // Reset any mocks or test state
});
