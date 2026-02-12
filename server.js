require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
const port = 3000;

// ---- Middleware ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);

// ---- Serve public folder ----
app.use(express.static(path.join(__dirname, "public")));

// ---- Database pool ----
const pool = require("./db/pool");

// ---- Mount router files ----
const authRouter = require("./routes/auth");
const cartRouter = require("./routes/cart");
const checkoutRouter = require("./routes/checkout");

app.use("/auth", authRouter);
app.use("/cart", cartRouter);
app.use("/checkout", checkoutRouter);

// ---- Books routes ----
app.get("/books", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM books ORDER BY book_id");
    console.log(`✅ Fetched ${result.rows.length} books from database`);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching books:", error.message);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

app.get("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM books WHERE book_id = $1", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error fetching book:", error.message);
    res.status(500).json({ error: "Failed to fetch book" });
  }
});

// ---- Testing DB route ----
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.send(`Database connected! Current time: ${result.rows[0].now}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database connection error");
  }
});

// ---- Start Server ----
app.listen(port, () => {
  console.log("=".repeat(50));
  console.log("🚀 Library() Server Started");
  console.log("=".repeat(50));
  console.log(`📍 Server: http://127.0.0.1:${port}`);
  console.log(`💾 Database: ${process.env.DB_NAME}`);
  console.log("=".repeat(50));
});
