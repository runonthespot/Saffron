import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "./authSlice";
import { AppState } from "../../types/store";
import "./Login.scss";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const error = useSelector((state: AppState) => state.auth?.error);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ username, password }));
  };

  const handleInputChange = () => {
    if (error) {
      dispatch(clearError());
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <div className="warning-banner">
          ⚠️ Test Environment Only
          <p>
            This is a demonstration prototype built with Cursor AI. Not for real
            investment use.
          </p>
        </div>
        <h2>Saffron</h2>
        <div className="subtitle">Portfolio Management Demo</div>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              handleInputChange();
            }}
            placeholder="Username"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              handleInputChange();
            }}
            placeholder="Password"
            required
          />
        </div>
        <button type="submit">Login</button>
        <div className="login-info">
          Demo credentials:
          <br />
          Username: {process.env.REACT_APP_AUTH_USERNAME || "guest"}
          <br />
          Password: {process.env.REACT_APP_AUTH_PASSWORD || "impulse"}
        </div>
      </form>
    </div>
  );
};

export default Login;
