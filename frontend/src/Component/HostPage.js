import React, { useState, useEffect } from "react";
import { BACKEND_URL } from "../config";

const SECRET_ID = "sandesh";
const SECRET_PASS = "1234";

// Dark Theme Styles
const styles = {
  container: {
    backgroundColor: "#121212",
    color: "#E0E0E0",
    minHeight: "100vh",
    padding: "40px",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    backgroundColor: "#1E1E1E",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 4px 8px rgba(0,0,0,0.5)",
    maxWidth: "900px",
    margin: "auto",
  },
  heading: {
    textAlign: "center",
    color: "#90CAF9",
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #333",
    backgroundColor: "#2C2C2C",
    color: "#E0E0E0",
  },
  button: {
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#1976D2",
    color: "#fff",
    cursor: "pointer",
    transition: "0.3s",
  },
  list: {
    listStyle: "none",
    padding: "0",
    marginTop: "20px",
  },
  listItem: {
    backgroundColor: "#2C2C2C",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  smallButton: {
    padding: "6px 10px",
    marginLeft: "10px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
  },
  deleteBtn: {
    backgroundColor: "#E53935",
    color: "#fff",
  },
  editBtn: {
    backgroundColor: "#43A047",
    color: "#fff",
  },
  video: {
    width: "100%",
    borderRadius: "8px",
    border: "1px solid #444",
  },
  table: {
    width: "100%",
    marginTop: "20px",
    borderCollapse: "collapse",
    border: "1px solid #333",
  },
  th: {
    backgroundColor: "#1976D2",
    color: "#fff",
    padding: "10px",
    textAlign: "left",
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #333",
    backgroundColor: "#2C2C2C",
  },
  deleteStudentWrap: {
    marginTop: 16,
    display: "flex",
    gap: 8,
  },
};

export default function HostPage() {



  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ id: "", password: "" });
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({
    fieldName: "", officialWebsiteURL: "", youtubeVideo: "",
    fieldSelector: ""
  });
  const [students, setStudents] = useState([]);
  const [deleteEmail, setDeleteEmail] = useState("");

  // Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.id === SECRET_ID && loginData.password === SECRET_PASS) {
      setIsAuthenticated(true);
    } else {
      alert("Invalid credentials!");
    }
  };

  // Fetch fields
  const fetchFields = async () => {
    const res = await fetch(`${BACKEND_URL}/host`);
    const data = await res.json();
    setFields(data);
  };

  // Fetch students
  const fetchStudents = async () => {
    const res = await fetch(`${BACKEND_URL}/student/getallstudents`, { credentials: "include" });
    const data = await res.json();
    setStudents(data);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFields();
      fetchStudents();
    }
  }, [isAuthenticated]);

  // Create field
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${BACKEND_URL}/host/createfield`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setFormData({ fieldName: "", officialWebsiteURL: "", youtubeVideo: "" });
      fetchFields();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to create field");
    }
  };

  // Delete field
  const handleDelete = async (id) => {
    await fetch(`${BACKEND_URL}/host/deletefield/${id}`, { method: "DELETE" });
    fetchFields();
  };

  // Edit field
  const handleEdit = async (id) => {
    const newName = prompt("Enter new field name:");
    if (!newName) return;
    await fetch(`${BACKEND_URL}/host/editfield/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fieldName: newName }),
    });
    fetchFields();
  };

  // Delete student by email
  const handleDeleteStudent = async () => {
    if (!deleteEmail.trim()) return;
    const res = await fetch(`${BACKEND_URL}/student/delete/${encodeURIComponent(deleteEmail)}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message || "Deleted");
      setDeleteEmail("");
      fetchStudents();
    } else {
      alert(data.error || data.message || "Failed to delete");
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.heading}>🔑 Host Login</h2>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input
              type="text"
              placeholder="ID"
              value={loginData.id}
              onChange={(e) => setLoginData({ ...loginData, id: e.target.value })}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              style={styles.input}
            />
            <button type="submit" style={styles.button}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  // Host dashboard
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>📌 Add New Field</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="text"
            placeholder="Field Name"
            value={formData.fieldName}
            onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
            required
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Official Website URL"
            value={formData.officialWebsiteURL}
            onChange={(e) => setFormData({ ...formData, officialWebsiteURL: e.target.value })}
            required
            style={styles.input}
          />
          <input
            type="text"
            placeholder="YouTube Video Link"
            value={formData.youtubeVideo}
            onChange={(e) => setFormData({ ...formData, youtubeVideo: e.target.value })}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="CSS Selector (for scraping)"
            value={formData.fieldSelector}
            onChange={(e) => setFormData({ ...formData, fieldSelector: e.target.value })}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Add Field</button>
        </form>

        <h3 style={{ marginTop: "30px", color: "#90CAF9" }}>📋 Existing Fields</h3>
        <ul style={styles.list}>
  {fields.map((field) => (
    <li key={field._id} style={styles.listItem}>
      <div style={styles.fieldInfo}>
        <strong>{field.fieldName}</strong> —{" "}
        <a
          href={field.officialWebsiteURL}
          target="_blank"
          rel="noreferrer"
          style={{ color: "#90CAF9" }}
        >
          {field.officialWebsiteURL}
        </a>
      </div>
      <div style={styles.actions}>
        <button
          onClick={() => handleEdit(field._id)}
          style={{ ...styles.smallButton, ...styles.editBtn }}
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(field._id)}
          style={{ ...styles.smallButton, ...styles.deleteBtn }}
        >
          Delete
        </button>
      </div>
    </li>
  ))}
</ul>

        <h3 style={{ marginTop: "30px", color: "#90CAF9" }}>👨‍🎓 Students</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Photo</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Bookmarks</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((stu) => (
                <tr key={stu._id}>
                  <td style={styles.td}>
                    {stu.photo ? (
                      <img
                        src={`data:image/jpeg;base64,${stu.photo}`}
                        alt="avatar"
                        style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          border: "1px solid #444",
                          display: "inline-block",
                          background: "#222",
                        }}
                      />
                    )}
                  </td>
                  <td style={styles.td}>{stu.name}</td>
                  <td style={styles.td}>{stu.email}</td>
                  <td style={styles.td}>{Array.isArray(stu.bookmarks) ? stu.bookmarks.length : 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td style={styles.td} colSpan="4" align="center">
                  No students yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={styles.deleteStudentWrap}>
          <input
            style={styles.input}
            type="email"
            placeholder="Enter student email to delete"
            value={deleteEmail}
            onChange={(e) => setDeleteEmail(e.target.value)}
          />
          <button style={styles.button} onClick={handleDeleteStudent}>
            Delete Student
          </button>
        </div>
      </div>
    </div>
  );
}
