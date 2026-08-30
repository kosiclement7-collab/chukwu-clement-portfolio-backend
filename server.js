const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// ==============================
// MIDDLEWARE
// ==============================

app.use(cors());
app.use(express.json());


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

app.listen(PORT, async () => {

  console.log(
    `Server running on port ${PORT}`
  );

  await initializeDatabase();

});