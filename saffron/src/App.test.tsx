import React from "react";
import { render, screen } from "./utils/test-utils";
import App from "./App";

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("./assets/illustrations/growing_analytics.svg", () => "svg");

describe("App Component", () => {
  it("renders login form when not authenticated", async () => {
    await render(<App />);
    expect(screen.getByText("Saffron")).toBeInTheDocument();
    expect(screen.getByText("Portfolio Management Demo")).toBeInTheDocument();
  });
});
