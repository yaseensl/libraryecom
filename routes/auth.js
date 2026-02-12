const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db/pool");

// --- REGISTER ---
router.post("/register", async (req, res) => {
  console.log("📝 REGISTER REQUEST RECEIVED");
  console.log("Request body:", req.body);
  
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    console.log("❌ Missing fields");
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Inserting into database...");
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, username, email",
      [username, email, hashedPassword]
    );

    console.log("✅ User created:", result.rows[0]);

    req.session.user = {
      id: result.rows[0].user_id,
      username: result.rows[0].username,
      email: result.rows[0].email,
    };

    console.log("✅ Session created");
    res.json({ message: "Registered successfully", user: req.session.user });
  } catch (err) {
    if (err.code === "23505") {
      console.log("❌ Duplicate username/email");
      return res.status(400).json({ error: "Username or email already exists" });
    }

    console.error("❌ Registration error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- LOGIN ---
router.post("/login", async (req, res) => {
  console.log("🔐 LOGIN REQUEST RECEIVED");
  console.log("Request body:", req.body);
  
  const { email, password } = req.body;

  if (!email || !password) {
    console.log("Missing credentials");
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    console.log("Querying database for:", email);
    const result = await pool.query(
      "SELECT user_id, username, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    console.log("Query returned", result.rows.length, "rows");

    const user = result.rows[0];
    
    if (!user) {
      console.log("User not found");
      return res.status(400).json({ error: "Invalid credentials" });
    }

    console.log("User found:", user.username);
    console.log("Hash length:", user.password_hash.length);
    
    console.log("Comparing passwords...");
    const valid = await bcrypt.compare(password, user.password_hash);
    console.log("Password valid:", valid);
    
    if (!valid) {
      console.log("Invalid password");
      return res.status(400).json({ error: "Invalid credentials" });
    }

    req.session.user = {
      id: user.user_id,
      username: user.username,
      email: user.email,
    };

    console.log("Login successful!");
    res.json({ message: "Logged in successfully", user: req.session.user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- LOGOUT ---
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

// --- CURRENT USER ---
router.get("/current-user", (req, res) => {
  res.json({ user: req.session.user || null });
});

// --- CHANGE PASSWORD ---
router.post("/change-password", async (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Not logged in" });

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: "All fields are required" });

  try {
    const result = await pool.query(
      "SELECT password_hash FROM users WHERE user_id = $1",
      [req.session.user.id]
    );
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid)
      return res.status(400).json({ error: "Current password is incorrect" });

    const hashedNew = await bcrypt.hash(newPassword, 10);
    
    await pool.query("UPDATE users SET password_hash = $1 WHERE user_id = $2", [
      hashedNew,
      req.session.user.id,
    ]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- DELETE ACCOUNT ---
router.delete("/delete-account", async (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Not logged in" });

  try {
    await pool.query("DELETE FROM users WHERE user_id = $1", [req.session.user.id]);
    req.session.destroy(() => {
      res.json({ message: "Account deleted successfully" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
