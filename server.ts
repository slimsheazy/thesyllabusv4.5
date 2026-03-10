import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("syllabus.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS shared_insights (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    author TEXT NOT NULL,
    date TEXT NOT NULL
  )
`);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/insights", (req, res) => {
    const insights = db.prepare("SELECT * FROM shared_insights ORDER BY date DESC LIMIT 50").all();
    res.json(insights);
  });

  app.post("/api/insights", (req, res) => {
    const { text, author } = req.body;
    if (!text || !author) {
      return res.status(400).json({ error: "Missing text or author" });
    }

    const insight = {
      id: crypto.randomUUID(),
      text,
      author,
      date: new Date().toISOString(),
    };

    db.prepare("INSERT INTO shared_insights (id, text, author, date) VALUES (?, ?, ?, ?)").run(
      insight.id,
      insight.text,
      insight.author,
      insight.date
    );

    // Broadcast to all connected clients
    const message = JSON.stringify({ type: "NEW_INSIGHT", payload: insight });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    res.status(201).json(insight);
  });

  // WebSocket handling
  wss.on("connection", (ws) => {
    console.log("New client connected");
    
    ws.on("close", () => {
      console.log("Client disconnected");
    });
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

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
