const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ==============================
// DATABASE
// ==============================

const db = new Database("contacts.db");

// Create contacts table
db.prepare(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();


// ==============================
// HOME ROUTE
// ==============================

app.get("/", (req, res) => {

  res.json({
    success: true,
    message: "Chukwu Clement Portfolio Backend is running",
    database: "Connected"
  });

});


// ==============================
// CONTACT FORM
// ==============================

app.post("/api/contact", (req, res) => {

  const { name, email, message } = req.body;


  // Validation
  if (!name || !email || !message) {

    return res.status(400).json({

      success: false,

      message: "Please fill in all fields."

    });

  }


  try {

    // Save contact message
    const statement = db.prepare(`
      INSERT INTO contacts
      (name, email, message)
      VALUES (?, ?, ?)
    `);


    statement.run(
      name,
      email,
      message
    );


    console.log("New contact message saved.");



    res.status(200).json({

      success: true,

      message: "Your message has been received successfully."

    });


  } catch (error) {

    console.error(
      "Database error:",
      error
    );


    res.status(500).json({

      success: false,

      message: "Unable to save your message."

    });

  }

});


// ==============================
// START SERVER
// ==============================

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});