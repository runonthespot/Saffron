import React from "react";
import { render as rtlRender, RenderResult } from "@testing-library/react";
import { configureStore, combineReducers, Store } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../styles/theme";
import authReducer from "../features/auth/authSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  // Add other reducers here
});

interface RenderOptions {
  preloadedState?: Partial<RootState>;
  store?: Store;
}

type CustomRenderResult = Omit<RenderResult, "store"> & {
  store: Store;
};

function render(
  ui: React.ReactElement,
  {
    preloadedState,
    store = configureStore({
      reducer: rootReducer,
      preloadedState: preloadedState as any,
    }),
    ...renderOptions
  }: RenderOptions = {}
): CustomRenderResult {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </Provider>
    );
  }

  const renderResult = rtlRender(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });

  return {
    ...renderResult,
    store,
  };
}

// Re-export everything
export * from "@testing-library/react";

// Override render method
export { render };
