import authReducer, { login, logout, clearError } from "../authSlice";

describe("auth reducer", () => {
  const initialState = {
    isAuthenticated: false,
    error: null,
  };

  beforeEach(() => {
    process.env.REACT_APP_AUTH_USERNAME = "guest";
    process.env.REACT_APP_AUTH_PASSWORD = "impulse";
  });

  it("should handle initial state", () => {
    expect(authReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should handle successful login", () => {
    const actual = authReducer(
      initialState,
      login({ username: "guest", password: "impulse" })
    );
    expect(actual.isAuthenticated).toEqual(true);
    expect(actual.error).toBeNull();
  });

  it("should handle failed login", () => {
    const actual = authReducer(
      initialState,
      login({ username: "wrong", password: "wrong" })
    );
    expect(actual.isAuthenticated).toEqual(false);
    expect(actual.error).toEqual("Invalid credentials");
  });

  it("should handle logout", () => {
    const loggedInState = {
      isAuthenticated: true,
      error: null,
    };
    const actual = authReducer(loggedInState, logout());
    expect(actual.isAuthenticated).toEqual(false);
    expect(actual.error).toBeNull();
  });

  it("should handle clear error", () => {
    const stateWithError = {
      isAuthenticated: false,
      error: "Some error",
    };
    const actual = authReducer(stateWithError, clearError());
    expect(actual.error).toBeNull();
  });
});
