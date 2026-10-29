import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String },
  date: { type: Date, default: Date.now },
});

const fieldSchema = new mongoose.Schema(
  {
    fieldName: { type: String, required: true, trim: true },
    officialWebsiteURL: { type: String, required: true, trim: true },
    fieldSelector: { type: String, required: true, trim: true },

    notifications: [notificationSchema], // previous notifications

    latestNotifications: [notificationSchema], // ✅ changed: array instead of single

    youtubeVideo: { type: String, trim: true },
  },
  { timestamps: true }
);

const Field = mongoose.model("Field", fieldSchema);
export default Field;
