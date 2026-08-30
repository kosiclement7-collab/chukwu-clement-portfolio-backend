const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// ==============================
// MIDDLEWARE
// ==============================

app.use(cors());
app.use(express.json());
// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not configured.");
}


// ==========================================
// ADMIN LOGIN
// ==========================================

app.post("/api/admin/login", (req, res) => {

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required."
    });
  }

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid login details."
    });
  }

  if (!JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: "Authentication is not configured."
    });
  }

  const token = jwt.sign(
    {
      username: username,
      role: "admin"
    },
    JWT_SECRET,
    {
      expiresIn: "2h"
    }
  );

  res.json({
    success: true,
    message: "Login successful.",
    token: token
  });

});


// ==============================
// POSTGRESQL
// ==============================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


// ==============================
// CREATE CONTACTS TABLE
// ==============================

async function initializeDatabase() {

  try {

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("PostgreSQL database connected.");
    console.log("Contacts table ready.");

  } catch (error) {

    console.error(
      "Database initialization error:",
      error
    );

  }

}


// ==============================
// HOME ROUTE
// ==============================

app.get("/", (req, res) => {

  res.json({
    success: true,
    message: "Chukwu Clement Portfolio Backend is running",
    database: "PostgreSQL"
  });

});


// ==============================
// CONTACT FORM API
// ==============================

app.post("/api/contact", async (req, res) => {

  const {
    name,
    email,
    message
  } = req.body;


  // Validation
  if (!name || !email || !message) {

    return res.status(400).json({

      success: false,

      message:
        "Please fill in your name, email and message."

    });

  }


  try {

    await pool.query(
      `
      INSERT INTO contacts
      (name, email, message)
      VALUES ($1, $2, $3)
      `,
      [
        name,
        email,
        message
      ]
    );


    res.status(201).json({

      success: true,

      message:
        "Your message has been received successfully."

    });


  } catch (error) {

    console.error(
      "Contact database error:",
      error
    );


    res.status(500).json({

      success: false,

      message:
        "Unable to save your message."

    });

  }

});


// ==============================
// START SERVER
// ==============================
// ==========================================
// PROTECTED ADMIN MESSAGES API
// ==========================================

app.get("/api/messages", async (req, res) => {

  const apiKey = req.headers["x-api-key"];

  // Check API key
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {

    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });

  }

  try {

    const result = await pool.query(`
      SELECT
        id,
        name,
        email,
        message,
        created_at
      FROM contacts
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      messages: result.rows
    });

  } catch (error) {

    console.error("Messages error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve messages."
    });

  }

});
app.listen(PORT, async () => {

  console.log(
    `Server running on port ${PORT}`
  );

  await initializeDatabase();

});