// src/pages/Signup.tsx
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
    backgroundColor: "rgba(24, 24, 27, 0.9)",
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
    color: "#d1d5db",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#1f2937",
    color: "white",
    fontSize: "16px",
    marginBottom: "20px",
    outline: "none",
  },
  button: {
    width: "100%",
    backgroundColor: "#8b5cf6",
    color: "white",
    fontWeight: "700",
    padding: "14px",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "18px",
    boxShadow: "0 4px 14px rgba(139, 92, 246, 0.6)",
    transition: "background-color 0.3s ease",
  },
  buttonHover: {
    backgroundColor: "#7c3aed",
  },
  footerText: {
    marginTop: "24px",
    fontSize: "14px",
    color: "#9ca3af",
    textAlign: "center",
  },
  footerLink: {
    color: "#8b5cf6",
    fontWeight: "600",
    textDecoration: "none",
    cursor: "pointer",
  },
};

const SignUp: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [btnHover, setBtnHover] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password1: password, password2: confirm })
      });

      if (!response.ok) {
      const errorData = await response.json();

      // Parse and flatten all error messages into a single string
      let messages = "";

      if (errorData.errors) {
        for (const [field, errors] of Object.entries(errorData.errors)) {
          messages += `${(errors as string[]).join(", ")}\n`;
        }
      } else if (errorData.detail) {
        messages = errorData.detail;
      } else {
        messages = "Signup failed";
      }

      throw new Error(messages);
    }

      const data = await response.json();
      console.log("Signup successful:", data);
      navigate("/Login");
    } catch (err: any) {
      setError(err.message || "Server error");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>Create Account</h2>

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

          <label htmlFor="email" style={styles.label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            autoComplete="email"
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
            autoComplete="new-password"
          />

          <label htmlFor="confirm" style={styles.label}>
            Confirm Password
          </label>
          <input
            id="confirm"
            type="password"
            placeholder="Confirm your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            style={styles.input}
            autoComplete="new-password"
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
            Sign Up
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{" "}
          <a href="/login" style={styles.footerLink}>
            Log in here
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
