import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { render } from "../../../utils/test-utils";
import Login from "../Login";

describe("Login Component", () => {
  const renderLogin = async () => {
    await render(<Login />);
  };

  it("renders login form with all elements", async () => {
    await renderLogin();

    expect(screen.getByText("Saffron")).toBeInTheDocument();
    expect(screen.getByText("Portfolio Management Demo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("shows warning banner", async () => {
    await renderLogin();

    expect(screen.getByText("⚠️ Test Environment Only")).toBeInTheDocument();
    expect(
      screen.getByText(/This is a demonstration prototype/)
    ).toBeInTheDocument();
  });

  it("shows demo credentials", async () => {
    await renderLogin();

    const loginInfo = screen.getByText((content, element) => {
      return (
        element?.className === "login-info" &&
        content.includes("Demo credentials:")
      );
    });
    expect(loginInfo).toBeInTheDocument();

    expect(
      screen.getByText((content) => content.includes("guest"))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes("impulse"))
    ).toBeInTheDocument();
  });

  it("handles input changes", async () => {
    await renderLogin();

    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "testpass" } });

    expect(usernameInput).toHaveValue("testuser");
    expect(passwordInput).toHaveValue("testpass");
  });

  it("handles form submission with wrong credentials", async () => {
    await renderLogin();

    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: "wrong" } });
    fireEvent.change(passwordInput, { target: { value: "wrong" } });
    fireEvent.click(submitButton);

    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("handles successful login", async () => {
    await renderLogin();

    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: "guest" } });
    fireEvent.change(passwordInput, { target: { value: "impulse" } });
    fireEvent.click(submitButton);

    expect(screen.queryByText("Invalid credentials")).not.toBeInTheDocument();
  });
});
