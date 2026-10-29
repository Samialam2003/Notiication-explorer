// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import http from "http";
import { Server } from "socket.io";

import fieldRoutes from "./Controller/FieldController.js";
import studentRoutes from "./Controller/StudentController.js";
import { runScraper } from "./utils/scraper.js"; 
import Field from "./Model/Field.js";

// load environment variables at start
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4444;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || FRONTEND_URL;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/webscraping';
const SESSION_SECRET = process.env.SESSION_SECRET || 'sandesh';
const SCRAPER_USER_AGENT = process.env.SCRAPER_USER_AGENT || 'Mozilla/5.0';
const SCRAPER_TIMEOUT = Number(process.env.SCRAPER_TIMEOUT) || 15000;

// ---------- HTTP & Socket.IO ----------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// ---------- Middleware ----------
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));
app.use(express.json());
app.use(
  session({
    name: "sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60,
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// ---------- Mongo ----------
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ---------- Routes ----------
app.use("/host", fieldRoutes);
app.use("/student", studentRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Server is running...");
});

// ---------- Socket.IO ----------
io.on("connection", (socket) => {
  console.log("🔗 New client connected:", socket.id);

  // Send initial fields
  Field.find().then((fields) => socket.emit("initial-fields", fields));

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ---------- Real-time Scraper ----------
runScraper(io); // Run immediately
setInterval(() => runScraper(io), 60 * 1000); // Run every 1 minute

// Expose scraper settings to modules that need them
app.locals.SCRAPER_USER_AGENT = SCRAPER_USER_AGENT;
app.locals.SCRAPER_TIMEOUT = SCRAPER_TIMEOUT;

// ---------- Start Server ----------
server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
