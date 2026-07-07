// Express backend for the Leone Wekesa portfolio.
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";
import { pool, initDb } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const ADMIN_KEY = process.env.ADMIN_KEY || "";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "*";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, db: "connected" });
  } catch (err) {
    console.error("Health check failed:", err.message);
    res.status(500).json({ ok: false, db: "disconnected" });
  }
});

// Contact form submission
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    // 1. Save to Database (Main Task)
    const result = await pool.query(
      `INSERT INTO messages (name, email, subject, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [name?.trim(), email?.trim(), subject?.trim(), message?.trim()]
    );

    // 2. Send Email (Background Task - won't block the response)
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && apiKey.startsWith('re_')) {
      const resend = new Resend(apiKey);
      resend.emails.send({
        from: 'Portfolio <onboarding@resend.dev>',
        to: process.env.NOTIFY_EMAIL || 'wekesaleone27@gmail.com',
        subject: `New Message: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`
      }).catch(e => console.error("Email failed:", e.message));
    } else {
      console.log("Skipping email: No valid RESEND_API_KEY found.");
    }

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Submission error:", err.message);
    res.status(500).json({ ok: false, error: "Database error." });
  }
});

// Admin view
app.get("/api/messages", async (req, res) => {
  if (!ADMIN_KEY || req.query.key !== ADMIN_KEY) return res.status(401).json({ ok: false });
  try {
    const result = await pool.query("SELECT * FROM messages ORDER BY created_at DESC LIMIT 100");
    res.json({ ok: true, messages: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
});

initDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server on port ${PORT}`);
  });
}).catch(err => {
  console.error("DB Init failed:", err.message);
});
