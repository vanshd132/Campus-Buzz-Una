import { Router } from "express";
import Post from "../models/Post.js";
import { seedPosts } from "../seedData.js";

const router = Router();

router.get("/", async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const posts = await Post.find({}).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  const total = await Post.countDocuments({});
  res.json({ items: posts, total });
});

router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "Not found" });
  res.json(post);
});

router.post("/", async (req, res) => {
  try {
    const body = req.body;
    const post = await Post.create({
      ...body,
      authorSid: req.sid,
    });
    res.status(201).json(post);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Seed route for demo data
router.post("/seed", async (req, res) => {
  try {
    const posts = await seedPosts();
    res.json({ message: `Seeded ${posts.length} example posts`, posts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/:id/reactions", async (req, res) => {
  const { emoji } = req.body;
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "Not found" });
  const current = post.reactions.get(emoji) || 0;
  post.reactions.set(emoji, current + 1);
  await post.save();
  res.json({ ok: true, reactions: post.reactions });
});

router.post("/:id/rsvp", async (req, res) => {
  const { status } = req.body; // "going" | "interested" | "notGoing"
  const post = await Post.findById(req.params.id);
  if (!post || post.type !== "event") return res.status(400).json({ error: "Invalid event" });
  if (!["going", "interested", "notGoing"].includes(status)) {
    return res.status(400).json({ error: "Invalid RSVP" });
  }
  post.rsvp[status] = (post.rsvp[status] || 0) + 1;
  await post.save();
  res.json({ ok: true, rsvp: post.rsvp });
});

export default router;