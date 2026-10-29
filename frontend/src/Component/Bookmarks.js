import React, { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);

  const fetchBookmarks = () => {
    axios
      .get(`${BACKEND_URL}/student/getbookmark`, { withCredentials: true })
      .then((res) => setBookmarks(res.data))
      .catch((err) => console.error("❌ Fetch bookmarks error:", err));
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const videoIdMatch = url.match(/(?:\?v=|\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3`;
  };

  // --- Remove Bookmark ---
  const handleRemoveBookmark = async (fieldId) => {
    try {
      await axios.post(
        `${BACKEND_URL}/student/removebookmark`,
        { fieldId },
        { withCredentials: true }
      );
      fetchBookmarks(); // refresh bookmarks after removal
      alert("Bookmark removed!");
    } catch (err) {
      console.error("❌ Remove bookmark failed:", err);
      alert("Failed to remove bookmark");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📌 My Bookmarked Fields</h2>
      <div style={styles.list}>
        {bookmarks.length === 0 ? (
          <p>No bookmarks yet.</p>
        ) : (
          bookmarks.map((field) => (
            <div key={field._id} style={styles.fieldCard}>
              {/* Video on the left */}
             

              {/* Field Info on the right */}
              <div style={styles.infoSection}>
                <h2 style={styles.heading}>{field.fieldName}</h2>
                {field.officialWebsiteURL && (
                  <a
                    href={field.officialWebsiteURL}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.link}
                  >
                    🌐 Official Website
                  </a>
                )}

                {/* Remove Bookmark Button */}
                
                <div style={styles.section}>
                  <h3>Latest Notifications</h3>
                  {field.latestNotifications?.length > 0 ? (
                    field.latestNotifications.map((n, i) => (
                      <div key={i} style={styles.notification}>
                        <a
                          href={n.link}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.link}
                        >
                          {n.title}
                        </a>
                        <span style={{ fontSize: "12px" }}>
                          {new Date(n.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p>No latest notifications.</p>
                  )}
                </div>

                <div style={styles.section}>
                  <h3>Previous Notifications</h3>
                  {field.notifications?.length > 0 ? (
                    field.notifications.slice(0, 3).map((n, i) => (
                      <div key={i} style={styles.notification}>
                        <a
                          href={n.link}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.link}
                        >
                          {n.title}
                        </a>
                        <span style={{ fontSize: "12px" }}>
                          {new Date(n.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p>No older notifications.</p>
                  )}
                 

                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============== Styles ==============
const styles = {
  container: { padding: "20px", background: "#121212", minHeight: "100vh", color: "#E0E0E0" },
  title: { fontSize: "26px", marginBottom: "20px", borderBottom: "2px solid #90CAF9", paddingBottom: "10px" },

  list: { display: "flex", flexDirection: "column", gap: "20px" },

  fieldCard: {
    display: "flex",
    flexDirection: "row",
    background: "#1E1E1E",
    borderRadius: "12px",
    overflow: "hidden",
    minHeight: "200px",
  },

  videoSection: { flex: "0 0 350px", height: "100%", borderRight: "1px solid #333" },
  video: { width: "100%", height: "100%", border: "none" },
  noVideo: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#333",
    color: "#aaa",
    fontSize: "16px",
  },

  infoSection: { flex: 1, padding: "15px", display: "flex", flexDirection: "column" },
  heading: { color: "#90CAF9", marginBottom: "10px" },
  link: { color: "#64B5F6", textDecoration: "none", marginBottom: "10px", display: "inline-block" },

  removeButton: {
      padding: "6px 10px",
  background: "#D32F2F",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  alignSelf: "flex-end",    // aligns button to right
  marginTop: "auto",         // pushes button to bottom
   
  },

  section: { marginTop: "10px" },
  notification: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 10px",
    marginBottom: "6px",
    borderRadius: "6px",
    background: "#2C2C2C",
  },
};
