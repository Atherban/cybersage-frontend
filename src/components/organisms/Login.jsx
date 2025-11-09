import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppStore } from "../../stores/use.store.js";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const { auth, ui } = useAppStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // Redirect if already authenticated
    if (auth.isAuthenticated) {
      navigate("/");
    }
  }, [auth.isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      ui.addNotification("Please fill in all fields", "error");
      return;
    }

    const result = await auth.login(formData.email, formData.password);

    if (result.success) {
      ui.addNotification("Login successful!", "success");
      navigate("/");
    } else {
      ui.addNotification(result.error, "error");
    }
  };

  const handleDemoLogin = async () => {
    const result = await auth.login("demo@cybersage.com", "demo123");

    if (result.success) {
      ui.addNotification("Demo login successful!", "success");
      navigate("/");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="font-title">Cybersage</h1>
            <p className="font-hero">Sign in to your account</p>
          </div>

          {auth.error && <div className="auth-error">{auth.error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={auth.isLoading}
            >
              {auth.isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="auth-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/signup" className="auth-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
