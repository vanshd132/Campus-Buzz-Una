import React, { useEffect, useState } from "react";
import { getPostImage } from "../utils/imageMapper.js";

async function fetchJSON(url, opts) {
  const res = await fetch(`http://localhost:4000${url}`, { credentials: "include", ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ---------- UI bits ---------- */

function Chip({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}

function IconText({ label, children }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm">
      <span className="opacity-70">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}

/* ---------- Reactions ---------- */

function ReactionBar({ reactions, onReact }) {
  const emojis = ["👍", "❤️", "😂", "🎉", "😮"];
  return (
    <div className="flex gap-1.5">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          className="px-2.5 py-1 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition active:scale-[0.98] focus:outline-none focus-visible:ring ring-gray-300/60"
          onClick={() => onReact(emoji)}
          aria-label={`React ${emoji}`}
        >
          {emoji} {reactions[emoji] > 0 && <span className="text-xs">{reactions[emoji]}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------- Comments ---------- */

function CommentBox({ postId, onAdded }) {
  const [text, setText] = useState("");

  function onChange(e) {
    setText(e.target.value);
  }

  function submit() {
    if (!text.trim()) return;
    
    const newComment = {
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      postId: postId,
      content: text,
      parentId: null,
      authorSid: "user-" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      reactions: new Map(),
      children: []
    };
    
    setText("");
    onAdded?.(newComment);
  }

  return (
    <div className="space-y-2">
      <textarea
        className="w-full border rounded-2xl p-3 bg-white dark:bg-neutral-900 border-gray-200 dark:border-gray-800 focus:outline-none focus-visible:ring ring-gray-300/70"
        rows={2}
        placeholder='Write a comment…'
        value={text}
        onChange={onChange}
      />
      <div className="flex justify-end">
        <button
          className="px-3.5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99] transition focus:outline-none focus-visible:ring ring-blue-300/70"
          onClick={submit}
        >
          Comment
        </button>
      </div>
    </div>
  );
}

function CommentThread({ postId }) {
  const [items, setItems] = useState([]);

  const addComment = (newComment) => {
    setItems(prev => [...prev, newComment]);
  };

  const tree = buildTree(items);

  return (
    <div className="space-y-4">
      <CommentBox postId={postId} onAdded={addComment} />
      <div className="space-y-3">
        {tree.map((node) => (
          <CommentNode
            key={node._id}
            node={node}
            level={0}
            onRefresh={() => {}}
          />
        ))}
      </div>
    </div>
  );
}

function buildTree(items) {
  const byId = new Map(items.map((i) => [i._id, { ...i, children: [] }]));
  const roots = [];
  for (const c of byId.values()) {
    if (c.parentId && byId.has(c.parentId)) byId.get(c.parentId).children.push(c);
    else roots.push(c);
  }
  return roots;
}

function CommentNode({ node, level, onRefresh }) {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");
  const [reactions, setReactions] = useState(new Map());

  function react(emoji) {
    setReactions(prev => {
      const newReactions = new Map(prev);
      newReactions.set(emoji, (newReactions.get(emoji) || 0) + 1);
      return newReactions;
    });
  }

  function submitReply() {
    if (!text.trim()) return;
    
    const newReply = {
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      postId: node.postId,
      content: text,
      parentId: node._id,
      authorSid: "user-" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      reactions: new Map(),
      children: []
    };
    
    // Add reply to parent's children
    node.children = node.children || [];
    node.children.push(newReply);
    
    setText("");
    setReplying(false);
  }

  return (
    <div className="relative">
      {/* thread guide line */}
      {level > 0 && (
        <div
          className="absolute left-2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800"
          aria-hidden
        />
      )}
      <div
        style={{ marginLeft: level * 16 }}
        className="border border-gray-200 dark:border-gray-800 rounded-2xl p-3 bg-white dark:bg-neutral-900 shadow-sm"
      >
        <div className="text-[13.5px] leading-relaxed text-gray-800 dark:text-gray-200">
          {node.content ||
            (node.memeUrl ? (
              <img
                src={node.memeUrl}
                className="rounded-lg shadow-sm max-h-72 object-contain"
                alt="meme"
              />
            ) : null)}
        </div>
        <div className="mt-2 flex items-center gap-3">
          <ReactionBar reactions={reactions} onReact={react} />
          <button
            className="text-sm text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            onClick={() => setReplying((v) => !v)}
          >
            Reply
          </button>
        </div>
        {replying && (
          <div className="mt-2 space-y-2">
            <textarea
              className="w-full border rounded-xl p-2 bg-white dark:bg-neutral-900 border-gray-200 dark:border-gray-800 focus:outline-none focus-visible:ring ring-gray-300/60"
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                className="px-3 py-1.5 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-black hover:opacity-90 transition"
                onClick={submitReply}
              >
                Send
              </button>
            </div>
          </div>
        )}
        {node.children?.length > 0 && (
          <div className="mt-2 space-y-2">
            {node.children.map((c) => (
              <CommentNode
                key={c._id}
                node={c}
                level={level + 1}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Post Card ---------- */

export default function PostCard({ post }) {
  // Store reactions in local state instead of MongoDB
  const [reactions, setReactions] = useState({
    "👍": Math.floor(Math.random() * 20) + 5,
    "❤️": Math.floor(Math.random() * 15) + 3,
    "😂": Math.floor(Math.random() * 10) + 1,
    "🎉": Math.floor(Math.random() * 8) + 1,
    "😮": Math.floor(Math.random() * 5) + 1
  });
  
  // Store RSVP in local state
  const [rsvp, setRsvp] = useState({
    going: post.rsvp?.going || Math.floor(Math.random() * 50) + 10,
    interested: post.rsvp?.interested || Math.floor(Math.random() * 30) + 5,
    notGoing: post.rsvp?.notGoing || Math.floor(Math.random() * 10) + 1
  });

  // Handle reactions locally
  function handleReact(emoji) {
    setReactions(prev => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1
    }));
  }

  // Handle RSVP locally
  function handleRsvp(status) {
    setRsvp(prev => ({
      ...prev,
      [status]: (prev[status] || 0) + 1
    }));
  }

  const tone =
    post.type === "event"
      ? "indigo"
      : post.type === "lostfound"
      ? "amber"
      : post.type === "announcement"
      ? "emerald"
      : "gray";

  return (
    <article className="group border border-gray-200 dark:border-gray-800 rounded-3xl p-5 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start gap-3">
        <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100 leading-snug">
          {post.title}
        </h2>
        <Chip tone={tone}>{post.type}</Chip>
      </div>

      {post.description && (
        <p className="mt-2 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
          {post.description}
        </p>
      )}

      {/* Post Image */}
      <div className="mt-4">
        <img
          src={getPostImage(post)}
          alt="Post attachment"
          className="w-full rounded-2xl max-h-96 object-cover shadow-sm border border-gray-200 dark:border-gray-800"
        />
      </div>

      {/* Event */}
      {post.type === "event" && (
        <div className="mt-3 text-sm bg-gray-50 dark:bg-neutral-800/60 border border-gray-200 dark:border-gray-800 rounded-2xl p-3">
          <div className="flex flex-wrap items-center gap-4">
            <IconText label="📅 When:">
              {post.eventDate ? new Date(post.eventDate).toLocaleString() : "TBD"}
            </IconText>
            <IconText label="📍 Where:">{post.location || "TBD"}</IconText>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
              onClick={() => handleRsvp("going")}
            >
              Going ({rsvp.going})
            </button>
            <button
              className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
              onClick={() => handleRsvp("interested")}
            >
              Interested ({rsvp.interested})
            </button>
            <button
              className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
              onClick={() => handleRsvp("notGoing")}
            >
              Not Going ({rsvp.notGoing})
            </button>
          </div>
        </div>
      )}

      {/* Lost & Found */}
      {post.type === "lostfound" && (
        <div className="mt-3 text-sm bg-gray-50 dark:bg-neutral-800/60 border border-gray-200 dark:border-gray-800 rounded-2xl p-3">
          <div className="grid sm:grid-cols-3 gap-2">
            <IconText label="🧩 Status:">{post.lostFoundType || "-"}</IconText>
            <IconText label="🎒 Item:">{post.item || "-"}</IconText>
            <IconText label="📍 Location:">
              {post.lfLocation || post.location || "-"}
            </IconText>
          </div>
        </div>
      )}

      {/* Announcement */}
      {post.type === "announcement" && (
        <div className="mt-3 text-sm bg-gray-50 dark:bg-neutral-800/60 border border-gray-200 dark:border-gray-800 rounded-2xl p-3">
          <IconText label="🏛️ Department:">{post.department || "-"}</IconText>
          {post.attachmentUrl && (
            <div className="mt-2">
              {post.attachmentType === "pdf" ? (
                <a
                  href={post.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 hover:opacity-80"
                >
                  Open PDF
                </a>
              ) : (
                <img
                  src={post.attachmentUrl}
                  className="mt-2 rounded-xl max-h-64 object-contain shadow-sm border border-gray-200 dark:border-gray-800"
                  alt="attachment"
                />
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <ReactionBar reactions={reactions} onReact={handleReact} />
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {Object.entries(reactions).map(([k, v]) => (
            <span key={k} className="mr-2 inline-flex items-center gap-1">
              <span>{k}</span>
              <span className="font-medium">{v}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <CommentThread postId={post._id} />
      </div>
    </article>
  );
}
