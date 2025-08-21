import { Router } from "express";
import { classifyPrompt, checkToxicity, softenRewrite } from "../services/ai.js";

const router = Router();

router.post("/parse", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "prompt required" });
    const draft = await classifyPrompt(prompt);
    res.json({ draft });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "AI parse failed", details: e.message });
  }
});

router.post("/toxicity", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text required" });
    const result = await checkToxicity(text);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "AI toxicity check failed", details: e.message });
  }
});

router.post("/rewrite", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text required" });
    const rewritten = await softenRewrite(text);
    res.json({ rewritten });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "AI rewrite failed", details: e.message });
  }
});

export default router;