import express from "express";
import Field from "../Model/Field.js";

const router = express.Router();

// ✅ Get all fields
router.get("/", async (req, res) => {
  try {
    const fields = await Field.find().select("-__v"); // exclude __v
    res.json(fields);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all fields with latestNotification and notifications
router.get("/allnotifications", async (req, res) => {
  try {
    const fields = await Field.find().select("fieldName latestNotifications notifications");

    // Transform result → flatten latestNotifications[0] to latestNotification
    const result = fields.map((field) => ({
      _id: field._id,
      fieldName: field.fieldName,
      latestNotification: field.latestNotifications?.[0] || null, // just first one
      notifications: field.notifications || [],
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new field
router.post("/createfield", async (req, res) => {
  try {
    const { fieldName, officialWebsiteURL, youtubeVideo, fieldSelector } = req.body;

    const newField = new Field({
      fieldName,
      officialWebsiteURL,
      youtubeVideo,
      fieldSelector, // ✅ include this
    });

    await newField.save();
    res.status(201).json(newField);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit/Update field
router.put("/editfield/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fieldName, officialWebsiteURL, youtubeVideo, fieldSelector } = req.body;

    const updatedField = await Field.findByIdAndUpdate(
      id,
      { fieldName, officialWebsiteURL, youtubeVideo, fieldSelector }, // ✅ include
      { new: true }
    );

    if (!updatedField) return res.status(404).json({ error: "Field not found" });

    res.json(updatedField);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Delete field
router.delete("/deletefield/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedField = await Field.findByIdAndDelete(id);
    if (!deletedField) return res.status(404).json({ error: "Field not found" });

    res.json({ message: "Field deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//get all filed attributes 
router.get("/getallfieldattributes", async (req, res) => {
  try {
    const fields = await Field.find().select("fieldName officialWebsiteURL youtubeVideo fieldSelector");
    res.json(fields);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
