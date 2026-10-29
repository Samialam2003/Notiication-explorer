import React from "react";

export default function HeroHeader() {
  return (
    <div style={styles.heroContainer}>
      <h1 style={styles.title}>Notifications Explorer</h1>
      <p style={styles.subtitle}>
        Discover fields, notifications, and bookmark your favorites effortlessly.
      </p>

      {/* Floating dots for animation */}
      <div style={styles.floatingDots}>
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} style={{ ...styles.dot, animationDelay: `${i * 0.5}s` }} />
        ))}
      </div>
    </div>
  );
}

// ==================== Styles ====================
const styles = {
  heroContainer: {
    position: "relative",
    width: "100%",
    minHeight: "250px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#121212",
    overflow: "hidden",
    textAlign: "center",
    marginBottom: "-70px",
  },
  title: {
    fontSize: "3rem",
    color: "#90CAF9",
    fontWeight: "bold",
    margin: 0,
    textShadow: "0 0 15px rgba(144,202,249,0.6), 0 0 30px rgba(144,202,249,0.4)",
    animation: "float 4s ease-in-out infinite alternate",
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#E0E0E0",
    marginTop: "10px",
    maxWidth: "600px",
    lineHeight: "1.5",
    opacity: 0.9,
  },
  
 

  // keyframes for animation (you can add this in a global style or CSS-in-JS solution)
  "@keyframes float": {
    "0%": { transform: "translateY(0px)" },
    "100%": { transform: "translateY(-15px)" },
  },
  "@keyframes floatDots": {
    "0%": { transform: "translateY(0px)" },
    "50%": { transform: "translateY(-20px)" },
    "100%": { transform: "translateY(0px)" },
  },
};
