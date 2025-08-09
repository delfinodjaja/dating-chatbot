// src/pages/Login.tsx
import React, { useState, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";

const styles: { [key: string]: CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #6366f1 100%)",
    padding: "16px",
  },
  box: {
    backgroundColor: "rgba(24, 24, 27, 0.9)", // dark with opacity
    backdropFilter: "blur(10px)",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7)",
    width: "100%",
    maxWidth: "400px",
    color: "white",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "800",
    textAlign: "center",
    marginBottom: "32px",
    letterSpacing: "1.2px",
  },
  error: {
    backgroundColor: "#dc2626",
    color: "white",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "24px",
    fontWeight: "600",
    textAlign: "center",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    fontSize: "14px",
    color: "#d1d5db", // gray-300
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#1f2937", // gray-800
    color: "white",
    fontSize: "16px",
    marginBottom: "20px",
    outline: "none",
  },
  inputFocus: {
    boxShadow: "0 0 0 3px #ec4899", // pink ring
  },
  button: {
    width: "100%",
    backgroundColor: "#ec4899", // pink-500
    color: "white",
    fontWeight: "700",
    padding: "14px",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "18px",
    boxShadow: "0 4px 14px rgba(236, 72, 153, 0.6)",
    transition: "background-color 0.3s ease",
  },
  buttonHover: {
    backgroundColor: "#db2777", // pink-600
  },
  footerText: {
    marginTop: "24px",
    fontSize: "14px",
    color: "#9ca3af", // gray-400
    textAlign: "center",
  },
  footerLink: {
    color: "#ec4899",
    fontWeight: "600",
    textDecoration: "none",
    cursor: "pointer",
  },
};

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [btnHover, setBtnHover] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();
      console.log("Login successful:", data);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      navigate("/ChatBotForm");
    } catch (err: any) {
      setError(err.message || "Server error");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>Welcome Back</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="username" style={styles.label}>
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
            autoComplete="username"
          />

          <label htmlFor="password" style={styles.label}>
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            autoComplete="current-password"
          />

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(btnHover ? styles.buttonHover : {}),
            }}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
          >
            Login
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account?{" "}
          <a href="/signup" style={styles.footerLink}>
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
