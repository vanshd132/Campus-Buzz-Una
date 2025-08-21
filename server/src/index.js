import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import sessionMiddleware from "./middleware/session.js";
import aiRouter from "./routes/ai.js";
import postsRouter from "./routes/posts.js";
import commentsRouter from "./routes/comments.js";
import uploadRouter from "./routes/upload.js";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Core middlewares
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS (adjust origin for your client)
const ORIGIN = process.env.ORIGIN || "http://localhost:5173";
app.use(cors({
  origin: ORIGIN,
  credentials: true,
}));

// Assign cookie-based session (no-login)
app.use(sessionMiddleware);

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Routes
app.use("/api/ai", aiRouter);
app.use("/api/posts", postsRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/upload", uploadRouter);

// DB + server
const PORT = process.env.PORT || 4000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/iiituna_feed";

mongoose.connect(MONGO_URL).then(() => {
  console.log("Mongo connected");
  app.listen(PORT, () => console.log("Server listening on " + PORT));
}).catch((err) => {
  console.error("Mongo connection error:", err.message);
  process.exit(1);
});