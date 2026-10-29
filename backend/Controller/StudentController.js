import express from "express";
import bcrypt from "bcryptjs";
import Student from "../Model/Student.js";
import multer from "multer";

import Field from "../Model/Field.js";

const router = express.Router();

// Multer memory storage (for base64 conversion)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ----------------------
// Get currently logged-in user (SESSION-BASED)
// ----------------------
router.get("/logged-in-user", async (req, res) => {
  try {
    if (!req.session.studentId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const student = await Student.findById(req.session.studentId).select("-password -__v");
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// Register
// ----------------------
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const student = new Student({ name, email, password: hashed });
    await student.save();

    return res.status(201).json({ message: "Student registered successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------
// Login (SESSION-BASED)
// ----------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, student.password);
    if (!ok) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Store session user id
    req.session.studentId = student._id;

    return res.json({
      message: "Login successful",
      student: { name: student.name, email: student.email },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------
// Profile (SESSION-BASED)
// ----------------------
router.get("/profile", async (req, res) => {
  try {
    if (!req.session.studentId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const student = await Student.findById(req.session.studentId).select("-password -__v");
    if (!student) return res.status(404).json({ error: "Student not found" });
    return res.json(student);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------
// Upload / Update Photo (SESSION-BASED)
// ----------------------
router.post("/upload-photo", upload.single("photo"), async (req, res) => {
  try {
    if (!req.session.studentId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const student = await Student.findById(req.session.studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Save as base64
    student.photo = req.file.buffer.toString("base64");
    await student.save();

    return res.json({ message: "Photo uploaded successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------
// Get ALL students (admin/host view)
// ----------------------
router.get("/getallstudents", async (req, res) => {
  try {
    const students = await Student.find().select("-password -__v");
    return res.json(students);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------
// Delete student by email (admin/host)
// ----------------------
router.delete("/delete/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const deleted = await Student.findOneAndDelete({ email });
    if (!deleted) {
      return res.status(404).json({ message: "❌ Student not found" });
    }
    return res.json({ message: "✅ Student deleted successfully", deletedStudent: deleted });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//bookmark






// ============================
// Bookmark entire field
// ============================
router.post("/bookmark", async (req, res) => {
  try {
    const { fieldId } = req.body;

    // Check if user is logged in
    if (!req.session.studentId) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const student = await Student.findById(req.session.studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Avoid duplicate bookmarks
    if (!student.bookmarks.includes(fieldId)) {
      student.bookmarks.push(fieldId);
      await student.save();
    }

    res.status(200).json({ message: "Field bookmarked successfully" });
  } catch (err) {
    console.error("Bookmark error:", err);
    res.status(500).json({ error: "Failed to bookmark field" });
  }
});

// ============================
// Get all bookmarked fields
// ============================
router.get("/getbookmark", async (req, res) => {
  try {
    if (!req.session.studentId) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const student = await Student.findById(req.session.studentId).populate("bookmarks");
    if (!student) return res.status(404).json({ error: "Student not found" });

    res.status(200).json(student.bookmarks);
  } catch (err) {
    console.error("Fetch bookmarks error:", err);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});
// REMOVE BOOKMARK ROUTE
router.post("/removebookmark", async (req, res) => {
  try {
    const { fieldId } = req.body;

    if (!fieldId) {
      return res.status(400).json({ error: "fieldId is required" });
    }

    const student = await Student.findById(req.session.studentId);
    if (!student) {
      return res.status(401).json({ error: "Not logged in" });
    }

    // Check if bookmark exists
    if (!student.bookmarkedFields || !student.bookmarkedFields.includes(fieldId)) {
      return res.status(404).json({ error: "Bookmark not found" });
    }

    // Remove bookmark safely
    student.bookmarkedFields = student.bookmarkedFields.filter(
      (id) => id.toString() !== fieldId.toString()
    );

    await student.save();
    return res.status(200).json({ message: "Bookmark removed successfully" });
  } catch (err) {
    console.error("❌ Remove bookmark error:", err);
    return res.status(500).json({ error: "Failed to remove bookmark" });
  }
});




// ----------------------
// Logout (SESSION-BASED)
// ----------------------
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Could not log out" });
    res.clearCookie("sid"); // clear session cookie
    return res.json({ message: "Logged out successfully" });
  });
});

export default router;
