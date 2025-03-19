const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root", 
  password: "smitesh2812", 
  database: "namo",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL");
});


module.exports = db;