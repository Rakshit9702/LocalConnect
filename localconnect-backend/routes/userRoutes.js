const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db"); // Your database connection
const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    // Check if user already exists
    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the database
    await db.query("INSERT INTO users (email, password, name) VALUES (?, ?, ?)", [
      email,
      hashedPassword,
      name,
    ]);

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const [userRows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (userRows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = userRows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user.user_id, email: user.email }, "your_jwt_secret", {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
