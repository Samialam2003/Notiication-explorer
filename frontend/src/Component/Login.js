import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { BACKEND_URL } from "../config";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/student/login`, formData, {
        withCredentials: true,
      });
      navigate("/home");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  const styles = {
    container: {
      background: "#121212",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "#E0E0E0",
    },
    form: {
      background: "#1E1E1E",
      padding: "30px",
      borderRadius: "15px",
      boxShadow: "0px 5px 12px rgba(0,0,0,0.5)",
      width: 320,
    },
    input: {
      display: "block",
      width: "92%",
      marginBottom: "15px",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #333",
      background: "#2C2C2C",
      color: "#fff",
    },
    button: {
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "none",
      background: "#1976D2",
      color: "#fff",
      cursor: "pointer",
      marginBottom: "10px",
    },
    hint: { marginTop: 10, fontSize: 14 },
    link: { color: "#90CAF9", textDecoration: "none", marginLeft: 6 },
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2>Student Login</h2>
        <input
          style={styles.input}
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          style={styles.input}
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button style={styles.button} type="submit">
          Login
        </button>

        {/* ✅ Extra Host Login button */}
        <button
          style={{ ...styles.button, background: "#0D47A1",textAlign: "center" }}
          type="button"
          onClick={() => navigate("/hostpage")}
        >
          Host Login
        </button>

        <div style={styles.hint}>
          New here?
          <Link to="/register" style={styles.link}>
            Register
          </Link>
        </div>
      </form>
    </div>
  );
}
