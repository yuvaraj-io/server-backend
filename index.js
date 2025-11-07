import express from "express";
import dotenv from "dotenv";
import pool from "./db.js";
import cors from "cors";


dotenv.config();
const app = express();

// ✅ Proper CORS setup (place this at the very top, before routes)
app.use(cors());

// ✅ Handle preflight requests globally
// app.options("(.*)", cors());

// ✅ Full CORS Fix (Allow everything for dev)
// ✅ Allow ALL origins, handle OPTIONS preflight explicitly

app.use((req, res, next) => {
    console.log('logging');
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // ✅ preflight success response
  }

  next();
});

const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "10mb" })); // to handle base64 images

// ✅ CREATE (POST)
app.post("/api/announcements", async (req, res) => {
  try {
    const { title, subheading, content, link, image_base64 } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO announcements (title, subheading, content, link, image_base64)
       VALUES (?, ?, ?, ?, ?)`,
      [title, subheading, content, link, image_base64]
    );

    res.status(201).json({ id: result.insertId, message: "Announcement created successfully" });
  } catch (error) {
    console.error("❌ POST Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ READ ALL (GET)
app.get("/api/announcements", async (req, res) => {
  try {
    console.log("started");
    const [rows] = await pool.query("SELECT * FROM announcements ORDER BY created_at DESC");
       console.log("started");
    res.json(rows);
  } catch (error) {
    console.error("❌ GET Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ READ ONE (GET by ID)
app.get("/api/announcements/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM announcements WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("❌ GET by ID Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ UPDATE (PUT)
app.put("/api/announcements/:id", async (req, res) => {
  try {
    const { title, subheading, content, link, image_base64 } = req.body;

    const [result] = await pool.query(
      `UPDATE announcements
       SET title=?, subheading=?, content=?, link=?, image_base64=?
       WHERE id=?`,
      [title, subheading, content, link, image_base64, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.json({ message: "Announcement updated successfully" });
  } catch (error) {
    console.error("❌ PUT Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ DELETE
app.delete("/api/announcements/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM announcements WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("🚀 Announcement API is running!");
});

// Start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
