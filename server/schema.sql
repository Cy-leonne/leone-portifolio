-- This runs automatically on server startup (see server/db.js -> initDb()).
-- Kept here for reference / manual setup if you ever need to run it yourself
-- via psql or a GUI tool like pgAdmin / TablePlus.

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
