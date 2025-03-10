const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();

router.post("/register", async (req, res) => {
  console.log("Received request:", req.body);
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (typeof password !== "string") {
    return res.status(400).json({ message: "Password must be a string" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const hashedPassword = await bcrypt.hash(String(password), 10);

    const query =
      "INSERT INTO users (email, username, password) VALUES (?, ?, ?)";
    db.query(query, [email, username, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      if (result.length === 0) {
        console.log("Invalid email or password for:", email);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const user = result[0];

      const isPasswordValid = await bcrypt.compare(
        String(password),
        user.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        "secret_key",
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        username: user.username,
        userId: user.id,
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
