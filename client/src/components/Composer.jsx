import React, { useState } from "react";
import { generateImage, generateCampusImage } from '../utils/imageGenerator.js';

async function fetchJSON(url, opts) {
  const res = await fetch(url, { credentials: "include", ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Enhanced AI text generation for posts
async function generatePostText(prompt, postType) {
  try {
    const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found');
    }

    const systemPrompt = `You are an expert at creating engaging social media posts for a university campus feed. 

Create a well-structured post based on the user's input. The post should be:
- Engaging and informative
- Appropriate for the post type
- Well-formatted with clear sections
- Professional yet friendly in tone

Post types:
- event: Workshops, meetings, parties, festivals, competitions, hackathons
- lostfound: Lost or found items, missing belongings
- announcement: Official notices, academic updates, department announcements

Format the response as JSON:
{
  "title": "Engaging title",
  "description": "Detailed description with all relevant information",
  "location": "Specific location if mentioned",
  "date": "Date if mentioned",
  "additionalInfo": "Any other relevant details"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a ${postType} post for: "${prompt}"` }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate text');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch {
      // Fallback if JSON parsing fails
      return {
        title: prompt.split('.')[0].slice(0, 60),
        description: prompt,
        location: '',
        date: '',
        additionalInfo: ''
      };
    }
  } catch (error) {
    console.error('Text generation failed:', error);
    return null;
  }
}

// Simple local classifier so we don't depend on AI or API keys
function buildDraftFromText(prompt = "") {
  const p = (prompt || "").trim();
  const lower = p.toLowerCase();

  // Heuristics to guess type
  const isEvent = /\b(event|meet|meeting|workshop|seminar|talk|session|webinar|orientation|hackathon|today|tomorrow|\b\d{1,2}\s*(am|pm)\b|\b\d{1,2}:\d{2}\b)\b/.test(
    lower
  );
  const isLostFound = /\b(lost|found|misplaced|wallet|id card|id-card|phone|bag|keys|earbuds|watch)\b/.test(lower);

  const type = isEvent ? "event" : isLostFound ? "lostfound" : "announcement";

  // Try to extract some light fields
  let lostFoundType = null;
  if (type === "lostfound") {
    if (/\bfound\b/.test(lower)) lostFoundType = "found";
    else lostFoundType = "lost";
  }

  // Extremely light location guess
  // e.g., "at CSE lab", "in auditorium", "near library"
  let location = "";
  const locMatch = lower.match(/\b(at|in|near)\s+([a-z0-9 \-_/]+)/i);
  if (locMatch && locMatch[2]) {
    // keep it simple; stop at end or a punctuation
    location = locMatch[2].split(/[.,;!?\n]/)[0].trim();
  }

  // Title: first ~60 chars or first sentence
  let title =
    p.split(/[.\n]/)[0].slice(0, 60) ||
    (type === "event" ? "New Event" : type === "lostfound" ? "Lost & Found" : "Announcement");

  return {
    type,                         // "event" | "lostfound" | "announcement"
    title,
    description: p,
    eventDate: type === "event" ? null : null,
    location: type !== "announcement" ? location : null,
    lostFoundType: type === "lostfound" ? lostFoundType : null,
    item: type === "lostfound" ? "" : null,
    department: type === "announcement" ? "" : null,
    attachmentType: null,
  };
}

export default function Composer({ onPosted }) {
  const [text, setText] = useState("");
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [posting, setPosting] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingText, setGeneratingText] = useState(false);

  const [file, setFile] = useState(null);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");

  // Generate AI image for the post
  async function generateAIImage() {
    if (!text.trim()) {
      alert('Please enter some text first to generate an image');
      return;
    }

    setGeneratingImage(true);
    try {
      const result = await generateCampusImage(text, {
        size: '1024x1024',
        enhancePrompt: true
      });

      if (result.success) {
        setGeneratedImageUrl(result.imageUrl);
        // Convert base64 to blob and upload
        if (result.imageUrl.startsWith('data:')) {
          const response = await fetch(result.imageUrl);
          const blob = await response.blob();
          const file = new File([blob], 'generated-image.png', { type: 'image/png' });
          setFile(file);
        }
      } else {
        alert('Failed to generate image: ' + result.error);
      }
    } catch (error) {
      console.error('Image generation error:', error);
      alert('Failed to generate image');
    } finally {
      setGeneratingImage(false);
    }
  }

  // Generate AI text for the post
  async function generateAIText() {
    if (!text.trim()) {
      alert('Please enter some text first');
      return;
    }

    setGeneratingText(true);
    try {
      const postType = buildDraftFromText(text).type;
      const aiText = await generatePostText(text, postType);
      
      if (aiText) {
        const enhancedDraft = {
          ...buildDraftFromText(text),
          title: aiText.title || buildDraftFromText(text).title,
          description: aiText.description || text,
          location: aiText.location || buildDraftFromText(text).location,
          eventDate: aiText.date || buildDraftFromText(text).eventDate,
        };
        setDraft(enhancedDraft);
      }
    } catch (error) {
      console.error('Text generation error:', error);
      alert('Failed to generate enhanced text');
    } finally {
      setGeneratingText(false);
    }
  }

  // (Still available) AI parse button for when a real key is configured
  async function parseWithAI() {
    setBusy(true);
    try {
      const data = await fetchJSON("/api/ai/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      setDraft(data.draft);
    } finally {
      setBusy(false);
    }
  }

  async function uploadFile() {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
    const data = await res.json();
    setAttachmentUrl(data.url);
  }

  async function publish(d = draft) {
    if (!d) return;
    const body = { ...d };

    // Attach uploaded file depending on type
    if (attachmentUrl) {
      if (d.type === "announcement") {
        body.attachmentUrl = attachmentUrl;
        body.attachmentType = attachmentUrl.endsWith(".pdf") ? "pdf" : "image";
      } else if (d.type === "lostfound") {
        body.imageUrl = attachmentUrl;
      }
    }

    const res = await fetchJSON("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setText("");
    setDraft(null);
    setFile(null);
    setAttachmentUrl("");
    setGeneratedImageUrl("");
    onPosted?.(res);
  }

  // Upload Post: now 100% independent of AI / API key
  // If no draft exists yet, we build one locally and publish.
  async function uploadPostNow() {
    if (!text && !draft) return; // nothing to post
    setPosting(true);
    try {
      let d = draft;
      if (!d) {
        d = buildDraftFromText(text);
        setDraft(d); // sync UI so preview shows up next time
      }
      await publish(d);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="border rounded-2xl p-4 space-y-3">
      <textarea
        className="w-full border rounded-xl p-3"
        rows={3}
        placeholder='Type here… e.g., "Lost my black wallet near the library" or "Workshop on Docker tomorrow 5pm CSE Lab"'
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      
      {/* AI Generation Buttons */}
      <div className="flex items-center gap-3">
        <button
          className="px-3 py-2 rounded-lg bg-purple-600 text-white disabled:opacity-50"
          onClick={generateAIText}
          disabled={!text.trim() || generatingText}
        >
          {generatingText ? "🤖 Generating Text..." : "🤖 AI Text"}
        </button>
        <button
          className="px-3 py-2 rounded-lg bg-pink-600 text-white disabled:opacity-50"
          onClick={generateAIImage}
          disabled={!text.trim() || generatingImage}
        >
          {generatingImage ? "🎨 Generating Image..." : "🎨 AI Image"}
        </button>
      </div>

      {/* File Upload */}
      <div className="flex items-center gap-3">
        <input type="file" onChange={(e) => setFile(e.target.files?.[0])} />
        <button
          className="px-3 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
          disabled={!file}
          onClick={uploadFile}
        >
          Attach
        </button>
        
        {/* Generated Image Preview */}
        {generatedImageUrl && (
          <div className="flex items-center gap-2">
            <img 
              src={generatedImageUrl} 
              alt="Generated" 
              className="w-12 h-12 object-cover rounded"
            />
            <span className="text-sm text-green-600">✓ AI Image Ready</span>
          </div>
        )}

        <div className="ml-auto flex gap-2">
          {/* Independent Upload Post button (no AI, no key) */}
          <button
            className="px-3 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50"
            disabled={(!text && !draft) || posting}
            onClick={uploadPostNow}
            title="Publish directly without AI"
          >
            {posting ? "Uploading…" : "Upload Post"}
          </button>

          {/* Optional: AI draft (works only if server has a valid key) */}
          <button
            className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            onClick={() => setDraft(null)}
          >
            Reset
          </button>
          <button
            className="px-3 py-2 rounded-lg bg-black text-white disabled:opacity-50"
            onClick={parseWithAI}
            disabled={!text || busy}
            title="Generate a structured draft using AI (optional)"
          >
            {busy ? "Thinking…" : "AI Draft"}
          </button>
        </div>
      </div>

      {draft && (
        <div className="border rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <strong>Preview</strong>
            <span className="text-xs text-gray-500 uppercase">{draft.type}</span>
          </div>

          <label className="text-sm">Title</label>
          <input
            className="w-full border rounded-lg p-2"
            value={draft.title || ""}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />

          <label className="text-sm">Description</label>
          <textarea
            className="w-full border rounded-lg p-2"
            rows={2}
            value={draft.description || ""}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />

          {draft.type !== "announcement" && (
            <>
              <label className="text-sm">Location</label>
              <input
                className="w-full border rounded-lg p-2"
                value={draft.location || ""}
                onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              />
            </>
          )}

          {draft.type === "event" && (
            <>
              <label className="text-sm">Event Date (ISO or human)</label>
              <input
                className="w-full border rounded-lg p-2"
                value={draft.eventDate || ""}
                onChange={(e) => setDraft({ ...draft, eventDate: e.target.value })}
              />
            </>
          )}

          {draft.type === "lostfound" && (
            <>
              <label className="text-sm">Lost/Found</label>
              <select
                className="w-full border rounded-lg p-2"
                value={draft.lostFoundType || "lost"}
                onChange={(e) => setDraft({ ...draft, lostFoundType: e.target.value })}
              >
                <option value="lost">lost</option>
                <option value="found">found</option>
              </select>

              <label className="text-sm">Item</label>
              <input
                className="w-full border rounded-lg p-2"
                value={draft.item || ""}
                onChange={(e) => setDraft({ ...draft, item: e.target.value })}
              />
            </>
          )}

          {draft.type === "announcement" && (
            <>
              <label className="text-sm">Department</label>
              <input
                className="w-full border rounded-lg p-2"
                value={draft.department || ""}
                onChange={(e) => setDraft({ ...draft, department: e.target.value })}
              />
              <p className="text-xs text-gray-500">Attach an image or PDF (optional) using the Attach button.</p>
            </>
          )}

          <div className="flex justify-end">
            <button
              className="px-4 py-2 rounded-lg bg-green-600 text-white"
              onClick={() => publish()}
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
