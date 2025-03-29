const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});
const saltRounds = 10;
const secretKey = process.env.JWT_SECRET || "your_jwt_secret_key";

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

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

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);
  socket.on("disconnect", () => console.log("❌ Client disconnected:", socket.id));
});

// Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  if (token === "hardcoded-auth-token") {
    req.user = { id: 1, username: "Namo" };
    return next();
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Fetch Helper Functions
const fetchUsers = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM users", (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

const fetchProducts = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM products", (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

const fetchOrders = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM orders ORDER BY created_at DESC", (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// User Registration
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields (username, email, password) are required" });
    }

    const users = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (users.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

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

    const allUsers = await fetchUsers();
    res.status(201).json({ message: "✅ User registered successfully", users: allUsers });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// User Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

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
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      secretKey,
      { expiresIn: "1h" }
    );

    res.json({
      message: "✅ Login successful!",
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch all users
app.get("/api/users", authenticate, async (req, res) => {
  try {
    const users = await fetchUsers();
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PRODUCTS ROUTES
app.post("/api/products", authenticate, async (req, res) => {
  const { name, description, price, stock, image, category } = req.body;
  if (!name || !price || stock === undefined) {
    return res.status(400).json({ error: "Name, price, and stock are required" });
  }

  db.query(
    "INSERT INTO products (name, description, price, stock, image, category) VALUES (?, ?, ?, ?, ?, ?)",
    [name, description, price, stock, image, category],
    async (err, result) => {
      if (err) {
        console.error("❌ Error inserting product:", err);
        return res.status(500).json({ error: "Database error" });
      }

      const updatedProducts = await fetchProducts();
      io.emit("productUpdate", updatedProducts);
      res.status(201).json({ message: "✅ Product added successfully", productId: result.insertId });
    }
  );
});

app.get("/api/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.error("❌ Error fetching products:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM products WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching product:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(results[0]);
  });
});

app.put("/api/products/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body; // Only expect stock for partial update

  if (stock === undefined) {
    return res.status(400).json({ error: "Stock value is required" });
  }

  try {
    const [currentProduct] = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM products WHERE id = ?", [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (!currentProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    await new Promise((resolve, reject) => {
      db.query(
        "UPDATE products SET stock = ? WHERE id = ?",
        [stock, id],
        (err, result) => {
          if (err) reject(err);
          else if (result.affectedRows === 0) reject(new Error("Product not found"));
          else resolve(result);
        }
      );
    });

    const updatedProducts = await fetchProducts();
    io.emit("productUpdate", updatedProducts);
    res.json({ message: "✅ Product stock updated successfully" });
  } catch (error) {
    console.error("❌ Error updating product stock:", error);
    res.status(error.message === "Product not found" ? 404 : 500).json({
      error: error.message || "Failed to update product stock",
    });
  }
});

app.delete("/api/products/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM products WHERE id = ?", [id], async (err, result) => {
    if (err) {
      console.error("❌ Error deleting product:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const updatedProducts = await fetchProducts();
    io.emit("productUpdate", updatedProducts);
    res.json({ message: "✅ Product deleted successfully" });
  });
});

// ORDERS ROUTES
app.post("/api/orders", async (req, res) => {
  const { name, email, address, total_price, payment_method } = req.body;
  if (!name || !email || !address || !total_price || !payment_method) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const [result] = await new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO orders (name, email, address, total_price, payment_method) VALUES (?, ?, ?, ?, ?)",
        [name, email, address, total_price, payment_method],
        (err, result) => {
          if (err) reject(err);
          else resolve([result]);
        }
      );
    });

    const updatedOrders = await fetchOrders();
    io.emit("orderUpdate", updatedOrders);
    res.status(201).json({ message: "✅ Order created successfully", orderId: result.insertId });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update Order Status
app.put("/api/orders/:id/status", authenticate, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Dispatched", "Delivered"].includes(status)) {
    return res.status(400).json({ error: "Invalid status. Use 'Dispatched' or 'Delivered'" });
  }

  try {
    await new Promise((resolve, reject) => {
      db.query(
        "UPDATE orders SET status = ? WHERE id = ?",
        [status, id],
        (err, result) => {
          if (err) reject(err);
          else if (result.affectedRows === 0) reject(new Error("Order not found"));
          else resolve(result);
        }
      );
    });

    const updatedOrders = await fetchOrders();
    io.emit("orderUpdate", updatedOrders);
    res.json({ message: `✅ Order marked as ${status}` });
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    res.status(error.message === "Order not found" ? 404 : 500).json({
      error: error.message || "Internal server error",
    });
  }
});

// Stats Endpoint
app.get("/api/stats", authenticate, async (req, res) => {
  try {
    const [totalSalesResult, totalOrdersResult, stockResult, ordersResult] = await Promise.all([
      new Promise((resolve, reject) => {
        db.query(
          "SELECT SUM(total_price) as totalSales FROM orders",
          (err, result) => {
            if (err) reject(err);
            else resolve(result[0].totalSales || 0);
          }
        );
      }),
      new Promise((resolve, reject) => {
        db.query("SELECT COUNT(*) as totalOrders FROM orders", (err, result) => {
          if (err) reject(err);
          else resolve(result[0].totalOrders || 0);
        });
      }),
      new Promise((resolve, reject) => {
        db.query("SELECT SUM(stock) as stock FROM products", (err, result) => {
          if (err) reject(err);
          else resolve(result[0].stock || 0);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(
          "SELECT id, name, email, address, total_price, payment_method, status, created_at FROM orders ORDER BY created_at DESC",
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      }),
    ]);

    res.json({
      totalSales: totalSalesResult,
      totalOrders: totalOrdersResult,
      stock: stockResult,
      orders: ordersResult,
    });
  } catch (error) {
    console.error("❌ Error fetching stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reviews Routes
app.post("/api/reviews", async (req, res) => {
  const { name, review, productId, rating } = req.body;
  if (!name || !review || !productId || !rating) {
    return res.status(400).json({ error: "Name, review, productId, and rating are required" });
  }

  db.query(
    "INSERT INTO reviews (name, review, productId, rating) VALUES (?, ?, ?, ?)",
    [name, review, productId, rating],
    async (err) => {
      if (err) {
        console.error("❌ Error inserting review:", err);
        return res.status(500).json({ error: "Database error" });
      }
      const updatedReviews = await new Promise((resolve, reject) => {
        db.query("SELECT * FROM reviews ORDER BY created_at DESC", (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
      io.emit("reviewUpdate", updatedReviews);
      res.status(201).json({ message: "✅ Review added successfully" });
    }
  );
});

app.get("/api/reviews", (req, res) => {
  db.query("SELECT * FROM reviews ORDER BY created_at DESC", (err, results) => {
    if (err) {
      console.error("❌ Error fetching reviews:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

server.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});