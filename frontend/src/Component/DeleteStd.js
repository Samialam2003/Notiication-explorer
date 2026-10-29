import React, { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

const DeleteStudent = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleDelete = async () => {
    try {
      const res = await axios.delete(`${BACKEND_URL}/student/delete/${email}`);
      setMessage(res.data.message);
      setEmail(""); // Clear input
    } catch (err) {
      setMessage(err.response?.data?.message || "Error deleting student");
    }
  };

  // Dark theme CSS (same as your existing style)
  const styles = {
    container: {
      marginTop: "20px",
      backgroundColor: "#1E1E1E",
      padding: "20px",
      borderRadius: "10px",
      textAlign: "center",
    },
    input: {
      padding: "10px",
      borderRadius: "5px",
      border: "1px solid #333",
      backgroundColor: "#2C2C2C",
      color: "#E0E0E0",
      marginRight: "10px",
    },
    button: {
      padding: "10px 15px",
      borderRadius: "5px",
      border: "none",
      backgroundColor: "#E53935",
      color: "#fff",
      cursor: "pointer",
      transition: "0.3s",
    },
    message: {
      marginTop: "15px",
      color: "#90CAF9",
    },
  };

  return (
    <div style={styles.container}>
      <h3>Delete Student</h3>
      <input
        type="email"
        placeholder="Enter student email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />
      <button onClick={handleDelete} style={styles.button}>
        Delete
      </button>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

export default DeleteStudent;
