// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock environment variables
beforeEach(() => {
  process.env = {
    ...process.env,
    REACT_APP_AUTH_USERNAME: "guest",
    REACT_APP_AUTH_PASSWORD: "impulse",
    REACT_APP_OPENAI_API_KEY: "test-key",
    REACT_APP_VERCEL_ANALYTICS_ID: "test-analytics",
  };
});

// Clean up environment variables after each test
afterEach(() => {
  process.env = {
    ...process.env,
    REACT_APP_AUTH_USERNAME: undefined,
    REACT_APP_AUTH_PASSWORD: undefined,
    REACT_APP_OPENAI_API_KEY: undefined,
    REACT_APP_VERCEL_ANALYTICS_ID: undefined,
  };
});
