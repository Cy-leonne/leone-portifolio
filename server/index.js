// Express backend for the Leone Wekesa portfolio.
// Run with:  node server/index.js   (from the project root)
// Or in dev: npx nodemon server/index.js
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
const resend = new Resend(process.env.RESEND_API_KEY);

const allowedOrigins = CLIENT_ORIGIN.split(",").map(origin => origin.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes("*")) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
}));
app.use(express.json());

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Health check — confirms the API and the database connection are both alive.
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, db: "connected" });
  } catch (err) {
    console.error("Health check failed:", err.message);
    res.status(500).json({ ok: false, db: "disconnected" });
  }
});

// Contact form submission — validates input, then inserts into Postgres.
app.post("/api/contact", async (req, res) => {
  const name = (req.body?.name || "").trim();
  const email = (req.body?.email || "").trim();
  const subject = (req.body?.subject || "").trim();
  const message = (req.body?.message || "").trim();

  const errors = {};
  if (name.length < 2) errors.name = "Name is too short.";
  if (!isValidEmail(email)) errors.email = "A valid email is required.";
  if (subject.length < 3) errors.subject = "Subject is too short.";
  if (message.length < 10) errors.message = "Message is too short.";
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ ok: false, errors });
  }

  try {
    const result = await pool.query(
      `INSERT INTO messages (name, email, subject, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [name, email, subject, message]
    );
    res.status(201).json({ ok: true, id: result.rows[0].id });

    // Optional: Send email notification
    if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) {
      resend.emails.send({
        from: 'Portfolio <onboarding@resend.dev>',
        to: process.env.NOTIFY_EMAIL,
        subject: `New Contact: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`
      }).catch(e => console.error("Email notification failed:", e.message));
    }
  } catch (err) {
    console.error("DB insert error:", err.message);
    res.status(500).json({ ok: false, error: "Could not save your message. Please try again." });
  }
});

// Protected route to view submitted messages: /api/messages?key=YOUR_ADMIN_KEY
app.get("/api/messages", async (req, res) => {
  if (!ADMIN_KEY || req.query.key !== ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  try {
    const result = await pool.query(
      "SELECT * FROM messages ORDER BY created_at DESC LIMIT 100"
    );
    res.json({ ok: true, messages: result.rows });
  } catch (err) {
    console.error("DB fetch error:", err.message);
    res.status(500).json({ ok: false, error: "Could not fetch messages." });
  }
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Backend running at http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to PostgreSQL:", err.message);
    console.error("   Check that PostgreSQL is running and your server/.env credentials are correct.");
    process.exit(1);
  });
