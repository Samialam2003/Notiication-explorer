import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { BACKEND_URL, SOCKET_URL } from "../config";

export default function Notifications() {
  const [fields, setFields] = useState([]);
  const [popup, setPopup] = useState(null);
  const [view, setView] = useState("list"); // list | details | all
  const [selectedNotification, setSelectedNotification] = useState(null);

  // --- New Search State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFields, setFilteredFields] = useState([]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    axios
      .get(`${BACKEND_URL}/host`)
      .then((res) => setFields(res.data))
      .catch((err) => console.error("❌ Failed to fetch fields:", err.message));

    socket.on("field-update", (updatedField) => {
      setFields((prev) =>
        prev.map((f) => (f._id === updatedField._id ? updatedField : f))
      );

      if (updatedField.latestNotifications?.length > 0) {
        const latest = updatedField.latestNotifications[0];
        setPopup({
          fieldName: updatedField.fieldName,
          notification: latest,
        });
      }
    });

    socket.on("initial-fields", (initialFields) => {
      setFields(initialFields);
    });

    return () => {
      socket.off("field-update");
      socket.off("initial-fields");
      socket.disconnect();
    };
  }, []);

  // --- Handle Bookmark ---
  const handleBookmarkField = async (field) => {
    try {
      await axios.post(
        `${BACKEND_URL}/student/bookmark`,
        { fieldId: field._id },
        { withCredentials: true }
      );
      alert("Field bookmarked!");
    } catch (err) {
      console.error("❌ Field bookmark failed:", err.message);
      alert("Failed to bookmark field");
    }
  };

  // --- YouTube Embed Helper ---
  const getEmbedUrl = (url) => {
    if (!url) return null;
    let videoId = null;
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1];
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&showinfo=0&cc_load_policy=0`;
    }
    return url;
  };

  // --- Notification Subcomponents ---
  const NotificationDetails = ({ notification, onBack }) => (
    <div style={styles.details}>
      <h2>{notification.title}</h2>
      <a href={notification.link} target="_blank" rel="noreferrer">
        🔗 Open Link
      </a>
      <p>Date: {new Date(notification.date).toLocaleString()}</p>
      <button style={styles.button} onClick={onBack}>
        ⬅ Back
      </button>
    </div>
  );

  const AllNotifications = ({ notifications, onBack }) => (
    <div style={styles.details}>
      <h2>📜 All Notifications</h2>
      {notifications.length > 0 ? (
        notifications.map((n, i) => (
          <div key={i} style={styles.notification}>
            <a href={n.link} target="_blank" rel="noreferrer">
              {n.title}
            </a>
            <span style={{ fontSize: "12px" }}>
              {new Date(n.date).toLocaleString()}
            </span>
          </div>
        ))
      ) : (
        <p>No notifications yet.</p>
      )}
      <button style={styles.button} onClick={onBack}>
        ⬅ Back
      </button>
    </div>
  );

  // --- Filter Fields for Search ---
  useEffect(() => {
    if (!searchTerm) {
      setFilteredFields([]);
      return;
    }
    const filtered = fields
      .filter((f) =>
        f.fieldName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.fieldName.localeCompare(b.fieldName));
    setFilteredFields(filtered);
  }, [searchTerm, fields]);

  // --- Main Render ---
  if (view === "details" && selectedNotification) {
    return (
      <NotificationDetails
        notification={selectedNotification}
        onBack={() => setView("list")}
      />
    );
  }

  if (view === "all" && selectedNotification) {
    return (
      <AllNotifications
        notifications={selectedNotification}
        onBack={() => setView("list")}
      />
    );
  }

  return (
    <div style={styles.container}>
      {/* ================= Search Bar ================= */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search fields..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        {searchTerm && filteredFields.length > 0 && (
          <div style={styles.dropdown}>
            {filteredFields.map((field) => (
              <div
                key={field._id}
                style={styles.dropdownItem}
                onClick={() => {
                  document
                    .getElementById(field._id)
                    ?.scrollIntoView({ behavior: "smooth" });
                  setSearchTerm("");
                }}
              >
                {field.fieldName}
              </div>
            ))}
          </div>
        )}
        {searchTerm && filteredFields.length === 0 && (
          <div style={styles.dropdown}>
            <div style={styles.noResult}>No fields found</div>
          </div>
        )}
      </div>

      {/* ================= Field Grid ================= */}
      <div style={styles.grid}>
        {fields.map((field) => (
          <div key={field._id} id={field._id} style={styles.fieldCard}>
            {field.youtubeVideo && (
              <div style={styles.videoWrapper}>
                <iframe
                  src={getEmbedUrl(field.youtubeVideo)}
                  style={styles.video}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title={field.fieldName}
                />
              </div>
            )}

            <div style={styles.fieldContent}>
              <h2 style={styles.heading}>{field.fieldName}</h2>
              <button
                style={{ ...styles.button, marginBottom: "10px" }}
                onClick={() => handleBookmarkField(field)}
              >
                ⭐ Bookmark Entire Field
              </button>

              {/* Latest Notifications */}
              <div style={styles.section}>
                <h3>Latest Notifications</h3>
                {field.latestNotifications?.length > 0 ? (
                  field.latestNotifications.map((n, i) => (
                    <div key={i} style={styles.notification}>
                      <span>{n.title}</span>
                      <div>
                        <button
                          style={styles.button}
                          onClick={() => {
                            setSelectedNotification(n);
                            setView("details");
                          }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No latest notifications.</p>
                )}
              </div>

              {/* Previous Notifications */}
              <div style={styles.section}>
                <h3>Previous Notifications</h3>
                {field.notifications?.length > 0 ? (
                  <>
                    {field.notifications.slice(0, 3).map((n, i) => (
                      <div key={i} style={styles.notification}>
                        <span>{n.title}</span>
                      </div>
                    ))}
                    <button
                      style={styles.button}
                      onClick={() => {
                        setSelectedNotification(field.notifications);
                        setView("all");
                      }}
                    >
                      See All Notifications
                    </button>
                  </>
                ) : (
                  <p>No older notifications.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Popup Toast */}
      {popup && (
        <div style={styles.popup}>
          <p>
            🆕 New Notification from <b>{popup.fieldName}</b>:{" "}
            {popup.notification.title}
          </p>
          <button
            style={styles.button}
            onClick={() => {
              setSelectedNotification(popup.notification);
              setView("details");
              setPopup(null);
            }}
          >
            View
          </button>
        </div>
      )}
    </div>
  );
}

// ================= Styles =================
const styles = {
  container: {
    padding: "20px",
    background: "#121212",
    minHeight: "100vh",
    color: "#E0E0E0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(500px, 1fr))",
    gap: "20px",
  },
  fieldCard: {
    background: "#1E1E1E",
    borderRadius: "12px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  videoWrapper: {
    width: "100%",
    height: "200px",
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid #333",
    marginBottom: "15px",
  },
  video: { width: "100%", height: "100%", border: "none" },
  fieldContent: { flex: 1 },
  heading: { color: "#90CAF9" },
  section: { marginTop: "15px" },
  notification: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px",
    marginBottom: "8px",
    borderRadius: "8px",
    background: "#2C2C2C",
  },
  button: {
    marginLeft: "10px",
    padding: "5px 10px",
    borderRadius: "5px",
    border: "none",
    background: "#1976D2",
    color: "#fff",
    cursor: "pointer",
  },
  popup: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#1976D2",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
  },
  details: {
    padding: "20px",
    background: "#1E1E1E",
    minHeight: "100vh",
    color: "#E0E0E0",
  },
  // ======= Search Bar Styles =======
  searchContainer: {
    position: "relative",
    width: "100%",
    maxWidth: "500px",
    margin: "20px 500px 20px 0",
  },
  searchInput: {
    width: "100%",
    padding: "10px 15px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "#1E1E1E",
    color: "#E0E0E0",
    outline: "none",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#2C2C2C",
    borderRadius: "0 0 8px 8px",
    maxHeight: "200px",
    overflowY: "auto",
    zIndex: 100,
    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
  },
  dropdownItem: {
    padding: "10px 15px",
    cursor: "pointer",
    borderBottom: "1px solid #333",
    color: "#E0E0E0",
  },
  noResult: {
    padding: "10px 15px",
    color: "#aaa",
    fontStyle: "italic",
  },
};
