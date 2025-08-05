import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // prevent page reload
    setError("");       // reset error

    try {
      const response = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add CSRF token here if needed for session auth
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();
      console.log("Login successful:", data);
      // TODO: save token or update auth context here

      navigate("/chatbot"); // redirect after login success
    } catch (err: any) {
      setError(err.message || "Server error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-pink-400 mb-6 text-center">
          Login
        </h2>
        {error && (
          <div className="bg-red-500 text-white p-2 mb-4 rounded">{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            className="w-full mb-4 p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 ring-pink-400"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 ring-pink-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white p-3 rounded transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
