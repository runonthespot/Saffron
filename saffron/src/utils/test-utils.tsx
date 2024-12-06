import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../styles/theme";
import authReducer from "../features/auth/authSlice";
// Import other reducers as needed

function render(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        auth: authReducer,
        // Add other reducers here
      },
      preloadedState,
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </Provider>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything
export * from "@testing-library/react";

// Override render method
export { render };
