import { Router } from "express";
import Comment from "../models/Comment.js";
import { generateMemeImage } from "../services/ai.js";

const router = Router();

router.get("/post/:postId", async (req, res) => {
  const { postId } = req.params;
  const comments = await Comment.find({ postId }).sort({ createdAt: 1 });
  res.json({ items: comments });
});

router.post("/", async (req, res) => {
  const { postId, content, parentId } = req.body;
  if (!postId) return res.status(400).json({ error: "postId required" });

  let payload = { postId, content, parentId: parentId || null, authorSid: req.sid, memeUrl: null };

  // /meme <prompt>
  if (typeof content === "string" && content.trim().startsWith("/meme ")) {
    const memePrompt = content.trim().slice(6).trim();
    const url = await generateMemeImage(memePrompt);
    payload.content = "";
    payload.memeUrl = url;
  }

  const comment = await Comment.create(payload);
  res.status(201).json(comment);
});

router.post("/:id/reactions", async (req, res) => {
  const { emoji } = req.body;
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ error: "Not found" });
  const current = comment.reactions.get(emoji) || 0;
  comment.reactions.set(emoji, current + 1);
  await comment.save();
  res.json({ ok: true, reactions: comment.reactions });
});

export default router;