import React from "react";
import { act } from "react";
import { render as rtlRender } from "@testing-library/react";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
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
  store?: ReturnType<typeof configureStore>;
}

async function render(
  ui: React.ReactElement,
  {
    preloadedState,
    store = configureStore({
      reducer: rootReducer,
      preloadedState: preloadedState as any,
    }),
    ...renderOptions
  }: RenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </Provider>
    );
  }

  let result: ReturnType<typeof rtlRender> & { store: typeof store };

  await act(async () => {
    result = {
      ...rtlRender(ui, {
        wrapper: Wrapper,
        ...renderOptions,
      }),
      store,
    };
  });

  return result!;
}

// Re-export everything
export * from "@testing-library/react";

// Override render method
export { render };
