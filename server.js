const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Home / API test
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Chukwu Clement Portfolio Backend is running"
  });
});

// Contact form API
app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;

  // Validate form
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Please fill in all fields."
    });
  }

  // For now, display the message in the server logs
  console.log("New Contact Message:");
  console.log({
    name,
    email,
    message
  });

  res.status(200).json({
    success: true,
    message: "Your message has been received successfully."
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});