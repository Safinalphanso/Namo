const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const saltRounds = 10;
const secretKey = process.env.JWT_SECRET || "your_jwt_secret_key";

// ✅ Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json()); // ✅ Fix for `req.body` being undefined

// ✅ MySQL Connection
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

// 🔹 **Fetch all users**
const fetchUsers = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM users", (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// 🔹 **User Registration Route**
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // ✅ Check if the email is already registered
    const users = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (users.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // ✅ Hash password & insert user
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    // ✅ Fetch all users after registration
    const allUsers = await fetchUsers();
    console.log("📜 Users Table after Registration:", allUsers);

    res.status(201).json({ message: "✅ User registered successfully", users: allUsers });

  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 **User Login Route**
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // ✅ Find user in the database
    const users = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = users[0];

    // ✅ Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // ✅ Generate JWT Token
    const token = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: "1h" });

    // ✅ Fetch all users after login
    const allUsers = await fetchUsers();
    console.log("📜 Users Table after Login:", allUsers);

    res.json({
      message: "✅ Login successful!",
      token,
      user: { id: user.id, username: user.username, email: user.email },
      users: allUsers, // Returning all users
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 **Route to Fetch All Users Separately**
app.get("/api/users", async (req, res) => {
  try {
    const users = await fetchUsers();
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ **Server Start**
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
