import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("ai_vault.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS ai_tools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    url TEXT,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/tools", (req, res) => {
    const tools = db.prepare("SELECT * FROM ai_tools ORDER BY created_at DESC").all();
    res.json(tools);
  });

  app.post("/api/tools", (req, res) => {
    const { name, category, description, url, tags } = req.body;
    console.log(`[POST] Adding new tool: ${name}`);
    try {
      const info = db.prepare(
        "INSERT INTO ai_tools (name, category, description, url, tags) VALUES (?, ?, ?, ?, ?)"
      ).run(name, category, description, url, tags);
      console.log(`[POST] Success. New ID: ${info.lastInsertRowid}`);
      res.json({ id: Number(info.lastInsertRowid) });
    } catch (error) {
      console.error(`[POST] Error adding tool:`, error);
      res.status(500).json({ error: "Failed to add tool" });
    }
  });

  app.delete("/api/tools/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    console.log(`[DELETE] Attempting to delete tool with ID: ${id}`);
    if (isNaN(id)) {
      console.error(`[DELETE] Invalid ID received: ${req.params.id}`);
      return res.status(400).json({ error: "Invalid ID" });
    }
    const result = db.prepare("DELETE FROM ai_tools WHERE id = ?").run(id);
    console.log(`[DELETE] Result:`, result);
    if (result.changes === 0) {
      console.warn(`[DELETE] No tool found with ID: ${id}`);
      return res.status(404).json({ error: "Tool not found" });
    }
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
