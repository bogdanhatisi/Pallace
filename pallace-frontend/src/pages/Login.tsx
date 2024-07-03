import React, { useState, useEffect } from "react";
import { loginUser } from "../services/userService";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Form.css"; // Shared styles for both forms

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setMessage({ text: location.state.message, type: "error" });
    }
  }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginUser(formData);
      console.log(response);
      setMessage({ text: "Login successful", type: "success" });
      console.log(response);

      setTimeout(() => {
        navigate("/home");
      }, 500);
    } catch (error) {
      console.error("Error logging in", error);
      setMessage({ text: "Error logging in", type: "error" });
    }
  };

  return (
    <div className="form-container">
      <img
        src={`${process.env.PUBLIC_URL}/logo.png`}
        alt="Pallace Logo"
        className="form-logo"
      />
      <h2>Login</h2>
      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p className="register-prompt">
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;
