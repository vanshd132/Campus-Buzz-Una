import React, { useEffect, useMemo, useState } from "react";
import PostCard from "../components/PostCard.jsx";

async function fetchJSON(url, opts) {
  const res = await fetch(url, { credentials: "include", ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function Home({ refresh = 0 }) {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchJSON("/api/posts").then((data) => setPosts(data.items || []));
  }, [refresh]);

  const filtered = useMemo(() => {
    if (!query.trim()) return posts;
    const q = query.toLowerCase();
    return posts.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q) ||
        p.department?.toLowerCase().includes(q) ||
        p.item?.toLowerCase().includes(q)
    );
  }, [posts, query]);

  const events = filtered.filter((p) => p.type === "event");
  const lostfound = filtered.filter((p) => p.type === "lostfound");
  const announcements = filtered.filter((p) => p.type === "announcement");

  return (
    <div className="space-y-8">
      {/* Search + quick stats */}
      <section className="grid grid-cols-1 gap-4">
        <div className="flex items-center gap-2">
          <input
            className="w-72 border rounded-xl p-2"
            placeholder="Search title, description, location…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="border rounded-2xl p-4">
            <div className="text-sm text-gray-500">Events</div>
            <div className="text-2xl font-semibold">{events.length}</div>
          </div>
          <div className="border rounded-2xl p-4">
            <div className="text-sm text-gray-500">Lost &amp; Found</div>
            <div className="text-2xl font-semibold">{lostfound.length}</div>
          </div>
          <div className="border rounded-2xl p-4">
            <div className="text-sm text-gray-500">Announcements</div>
            <div className="text-2xl font-semibold">{announcements.length}</div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="space-y-8">
        {/* Events */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Events</h2>
            <span className="text-xs text-gray-500">Latest first</span>
          </div>
          {events.length === 0 ? (
            <div className="text-sm text-gray-500 border rounded-xl p-4">No events found.</div>
          ) : (
            <div className="space-y-4">
              {events.map((p) => (
                <PostCard key={p._id} post={p} />
              ))}
            </div>
          )}
        </div>

        {/* Lost & Found */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Lost &amp; Found</h2>
            <span className="text-xs text-gray-500">Latest first</span>
          </div>
          {lostfound.length === 0 ? (
            <div className="text-sm text-gray-500 border rounded-xl p-4">
              No lost &amp; found posts found.
            </div>
          ) : (
            <div className="space-y-4">
              {lostfound.map((p) => (
                <PostCard key={p._id} post={p} />
              ))}
            </div>
          )}
        </div>

        {/* Announcements */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Announcements</h2>
            <span className="text-xs text-gray-500">Latest first</span>
          </div>
          {announcements.length === 0 ? (
            <div className="text-sm text-gray-500 border rounded-xl p-4">No announcements found.</div>
          ) : (
            <div className="space-y-4">
              {announcements.map((p) => (
                <PostCard key={p._id} post={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
