import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { render } from "../../../utils/test-utils";
import Login from "../Login";

describe("Login Component", () => {
  const renderLogin = () => {
    render(<Login />);
  };

  it("renders login form with all elements", () => {
    renderLogin();

    expect(screen.getByText("Saffron")).toBeInTheDocument();
    expect(screen.getByText("Portfolio Management Demo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("shows warning banner", () => {
    renderLogin();

    expect(screen.getByText("⚠️ Test Environment Only")).toBeInTheDocument();
    expect(
      screen.getByText(/This is a demonstration prototype/)
    ).toBeInTheDocument();
  });

  it("shows demo credentials", () => {
    renderLogin();

    expect(screen.getByText("Demo credentials:")).toBeInTheDocument();
    expect(screen.getByText(/Username:/)).toBeInTheDocument();
    expect(screen.getByText(/Password:/)).toBeInTheDocument();
  });

  it("handles input changes", () => {
    renderLogin();

    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "testpass" } });

    expect(usernameInput).toHaveValue("testuser");
    expect(passwordInput).toHaveValue("testpass");
  });

  it("handles form submission with wrong credentials", () => {
    renderLogin();

    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: "wrong" } });
    fireEvent.change(passwordInput, { target: { value: "wrong" } });
    fireEvent.click(submitButton);

    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("handles successful login", () => {
    renderLogin();

    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: "guest" } });
    fireEvent.change(passwordInput, { target: { value: "impulse" } });
    fireEvent.click(submitButton);

    // Error message should not be present
    expect(screen.queryByText("Invalid credentials")).not.toBeInTheDocument();
  });
});
