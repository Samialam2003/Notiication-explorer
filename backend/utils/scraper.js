// utils/scraper.js
import axios from "axios";
import * as cheerio from "cheerio";
import Field from "../Model/Field.js";

// in-memory debounce cache { fieldId: { title, timestamp } }
const lastEmitted = {};

/**
 * Scrape notifications for a single field
 */
export async function scrapeFieldNotifications(field) {
  const { fieldName, officialWebsiteURL, fieldSelector } = field;
  const selector = fieldSelector || "a"; // default to 'a' tags

  try {
    const response = await axios.get(officialWebsiteURL, {
      headers: { "User-Agent": process.env.SCRAPER_USER_AGENT || "Mozilla/5.0" },
      timeout: Number(process.env.SCRAPER_TIMEOUT) || 15000,
    });
    const $ = cheerio.load(response.data);

    const scraped = [];

    $(selector).each((i, el) => {
      const title = $(el).text().trim();
      let link = $(el).attr("href");

      if (!title) return;

      if (!link) link = officialWebsiteURL; // fallback if href missing
      if (!link.startsWith("http")) {
        link = new URL(link, officialWebsiteURL).href;
      }

      const date = new Date();
      scraped.push({ title, link, date });
    });

    if (!scraped.length) {
      console.log(`⚠️ No notifications found for ${fieldName}`);
      return;
    }

    // Process each scraped notification sequentially
    for (const latest of scraped) {
      const prevLatest = field.latestNotifications?.[0];

      // Skip duplicate
      if (prevLatest && prevLatest.title === latest.title && prevLatest.link === latest.link) {
        continue;
      }

      // Move previous latest to notifications array
      if (prevLatest) {
        const exists = field.notifications.some(
          (n) => n.title === prevLatest.title && n.link === prevLatest.link
        );
        if (!exists) field.notifications.unshift(prevLatest);
      }

      // Update latestNotifications
      field.latestNotifications = [latest];

      // Keep notifications only for last 3 days
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      field.notifications = field.notifications.filter((n) => new Date(n.date) > threeDaysAgo);

      await field.save();
      console.log(`💾 Updated notifications for ${fieldName}: ${latest.title}`);
    }
  } catch (err) {
    console.error(`❌ Failed to scrape ${fieldName}: ${err.message}`);
  }
}

/**
 * Scrape all fields in DB sequentially
 */
export async function scrapeAllFields() {
  const fields = await Field.find({});
  for (const field of fields) {
    await scrapeFieldNotifications(field);
  }
}

/**
 * Run scraper and emit updates if new notifications are found
 */
export const runScraper = async (io) => {
  try {
    const prevFields = await Field.find({});
    await scrapeAllFields(); // update DB

    for (const field of prevFields) {
      const updatedField = await Field.findById(field._id);
      const latestTitle = updatedField.latestNotifications?.[0]?.title;
      if (!latestTitle) continue;

      const last = lastEmitted[field._id];
      const now = Date.now();

      // debounce: avoid emitting same notification within 2 mins
      if (last && last.title === latestTitle && now - last.timestamp < 2 * 60 * 1000) continue;

      if (updatedField.latestNotifications?.[0]?.title !== field.latestNotifications?.[0]?.title) {
        io.emit("field-update", {
          _id: updatedField._id,
          fieldName: updatedField.fieldName,
          latestNotification: updatedField.latestNotifications[0],
          notifications: updatedField.notifications,
        });
        lastEmitted[field._id] = { title: latestTitle, timestamp: now };
        console.log(`📢 Notification emitted for ${updatedField.fieldName}`);
      }
    }
  } catch (err) {
    console.error("❌ Scraper error:", err.message);
  }
};
