// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock the process.env variables
process.env.REACT_APP_AUTH_USERNAME = "guest";
process.env.REACT_APP_AUTH_PASSWORD = "impulse";
process.env.REACT_APP_OPENAI_API_KEY = "test-api-key";

// Mock the window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock the ResizeObserver
class ResizeObserverMock {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

window.ResizeObserver = ResizeObserverMock;
global.ResizeObserver = ResizeObserverMock;

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Silence specific console warnings
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // Silence all console.error messages in tests
  console.error = (...args) => {
    if (
      /Warning: ReactDOM.render is no longer supported/.test(args[0]) ||
      /Warning: `ReactDOMTestUtils.act` is deprecated/.test(args[0]) ||
      /Warning: ReactMarkdown: Support for defaultProps/.test(args[0]) ||
      /Warning: An update to .* inside a test was not wrapped in act/.test(
        args[0]
      ) ||
      /Warning: You seem to have overlapping act/.test(args[0]) ||
      /Warning: Cannot update a component/.test(args[0]) ||
      /Warning: React has detected a change in the order of Hooks/.test(
        args[0]
      ) ||
      /Error generating portfolio commentary/.test(args[0])
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  // Silence all console.warn messages in tests
  console.warn = (...args) => {
    if (
      /The width\(0\) and height\(0\) of chart should be greater than 0/.test(
        args[0]
      ) ||
      /\[DEP0040\] DeprecationWarning: The `punycode` module is deprecated/.test(
        args[0]
      ) ||
      /babel-preset-react-app/.test(args[0]) ||
      /No license field/.test(args[0]) ||
      /Warning: findDOMNode is deprecated in StrictMode/.test(args[0])
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
