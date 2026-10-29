import React, { useEffect, useState } from "react";
import axios from "axios";
import Notifications from "./Notifications";
import Bookmarks from "./Bookmarks";
import { BACKEND_URL } from "../config";

export default function Home() {
  const [student, setStudent] = useState(null);
  const [file, setFile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState("notifications"); // 🔹 new state

  // Fetch logged-in student data
  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/student/logged-in-user`, { withCredentials: true })
      .then((res) => setStudent(res.data))
      .catch(() => setStudent(null));
  }, []);

  // Upload profile photo
  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("photo", file);

    try {
      await axios.post(`${BACKEND_URL}/student/upload-photo`, formData, {
        withCredentials: true,
      });
      alert("Photo updated!");

      // Refresh student data
      const res = await axios.get(`${BACKEND_URL}/student/logged-in-user`, {
        withCredentials: true,
      });
      setStudent(res.data);
      setFile(null);
    } catch (err) {
      alert("Failed to upload photo");
    }
  };

  const photoSrc = student?.photo
    ? `data:image/jpeg;base64,${student.photo}`
    : "https://via.placeholder.com/50";

  const styles = {
    container: {
      background: "#121212",
      minHeight: "100vh",
      color: "#E0E0E0",
      padding: "40px",
      fontFamily: "Arial",
      position: "relative",
    },
    profileContainer: {
      position: "absolute",
      top: "20px",
      right: "40px",
      cursor: "pointer",
    },
    profileImage: {
      width: "100px",
      height: "100px",
      borderRadius: "50%",
      border: "2px solid #90CAF9",
      objectFit: "cover",
    },
    dropdown: {
      position: "absolute",
      right: 0,
      top: "60px",
      background: "#1E1E1E",
      borderRadius: "10px",
      padding: "15px",
      boxShadow: "0px 5px 12px rgba(0,0,0,0.5)",
      display: showDropdown ? "block" : "none",
      minWidth: 240,
      zIndex: 2,
    },
    button: {
      marginTop: "10px",
      padding: "8px 12px",
      background: "#1976D2",
      border: "none",
      color: "#fff",
      borderRadius: "5px",
      cursor: "pointer",
    },
    fileInput: {
      marginTop: "10px",
    },
    tabContainer: {
      display: "flex",
      gap: "20px",
      marginBottom: "20px",
      borderBottom: "1px solid #333",
      paddingBottom: "10px",
    },
    tab: (isActive) => ({
      cursor: "pointer",
      fontWeight: isActive ? "bold" : "normal",
      color: isActive ? "#90CAF9" : "#E0E0E0",
      borderBottom: isActive ? "2px solid #90CAF9" : "none",
      paddingBottom: "4px",
    }),
  };

  return (
    <div style={styles.container}>
      <h1>Hello {student?.name || "Student"} 👋</h1>

      {/* Profile dropdown */}
      <div
        style={styles.profileContainer}
        onClick={() => setShowDropdown((prev) => !prev)}
      >
        <img src={photoSrc} alt="profile" style={styles.profileImage} />

        <div style={styles.dropdown}>
          <p style={{ margin: 0, marginBottom: 6 }}>{student?.name}</p>
          <p style={{ margin: 0, opacity: 0.8 }}>{student?.email}</p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={styles.fileInput}
          />
          <button style={styles.button} onClick={handleUpload}>
            Upload
          </button>
        </div>
      </div>

      {/* 🔹 Tabs for Notifications / Bookmarks */}
      <div style={styles.tabContainer}>
        <span
          style={styles.tab(activeTab === "notifications")}
          onClick={() => setActiveTab("notifications")}
        >
          Notifications
        </span>
        <span
          style={styles.tab(activeTab === "bookmarks")}
          onClick={() => setActiveTab("bookmarks")}
        >
          My Bookmarks
        </span>
      </div>

      {/* 🔹 Conditional rendering */}
      {activeTab === "notifications" ? <Notifications /> : <Bookmarks />}
    </div>
  );
}
