const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
const saltRounds = 10; // Security for hashing passwords

// CORS Configuration (Allow frontend requests)
app.use(
  cors({
    origin: "http://localhost:3000", // Ensure it matches frontend
    methods: ["POST", "GET"],
    credentials: true,
  })
);

app.use(express.json()); // Enable JSON parsing

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "smitesh2812",
  database: "namo",
});

db.connect((err) => {
    if (err) {
      console.error("❌ Database connection error:", err);
    } else {
      console.log("✅ Connected to MySQL database");
    }
  });

db.query(sql, [name, email, hashedPassword], (err, result) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: err.sqlMessage || "Internal server error" });
    }
    console.log("✅ Inserted User:", result); // Log this
    res.status(201).json({ message: "✅ User registered successfully!" });
  });
  