import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function classifyPrompt(prompt) {
  const system = `You turn a student's one-line prompt into a structured post draft.
Output STRICT JSON with this shape:
{
  "type": "event" | "lostfound" | "announcement",
  "title": string,
  "description": string,
  "eventDate": string | null,        // ISO when type=event
  "location": string | null,         // for event/lostfound
  "lostFoundType": "lost" | "found" | null,
  "item": string | null,
  "department": string | null,
  "attachmentType": "image" | "pdf" | null
}
If ambiguous, make your best guess and keep missing fields as null. Keep title concise.
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt }
    ],
    temperature: 0.2,
  });

  const json = JSON.parse(res.choices[0].message.content);
  return json;
}

export async function checkToxicity(text) {
  // Using OpenAI Moderation (text-moderation-latest). Returns boolean + categories.
  const result = await openai.moderations.create({
    model: "omni-moderation-latest",
    input: text,
  });
  const outcome = result.results?.[0];
  const flagged = Boolean(outcome?.flagged);
  return { flagged, categories: outcome?.categories || {} };
}

export async function softenRewrite(text) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Rewrite the text to be friendly, respectful, and non-toxic while keeping the meaning." },
      { role: "user", content: text }
    ],
    temperature: 0.3,
  });
  return res.choices[0].message.content.trim();
}

export async function generateMemeImage(prompt) {
  // Simple passthrough to OpenAI image generation. Frontend will display returned URL.
  const res = await openai.images.generate({
    model: "gpt-image-1",
    prompt: `Create a meme image for this idea. Use classic meme style when appropriate. Idea: ${prompt}`,
    size: "1024x1024"
  });
  // OpenAI returns base64 or URL depending on config; here we'll return base64 data URL for simplicity.
  const b64 = res.data[0].b64_json;
  return `data:image/png;base64,${b64}`;
}