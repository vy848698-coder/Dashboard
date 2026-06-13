"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { getPosts } from "@/data/posts";

// Cover images are stored as paths relative to the public site folder. Resolve
// them against the site's base URL (the posts API URL up to its last "/") so the
// dashboard can render them. Absolute URLs / data URLs pass through unchanged.
const SITE_BASE = (() => {
  try {
    const u = new URL(process.env.NEXT_PUBLIC_POSTS_API);
    return u.origin + u.pathname.replace(/[^/]*$/, "");
  } catch {
    return "";
  }
})();

function coverSrc(cover) {
  if (!cover) return "";
  if (/^(https?:|data:|\/)/.test(cover)) return cover;
  return `${SITE_BASE}${cover}`;
}

function initials(name) {
  return (name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function RecentPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getPosts();
        if (!cancelled) setPosts(list);
      } catch {
        // Leave the list empty on failure — the empty state covers it.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Show the 4 most recent posts (API already returns newest first).
  const recent = posts.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900">Recent Blog Posts</h2>
        <Link
          href="/blog"
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-400 flex items-center justify-center gap-2">
          <Loader2 size={18} className="animate-spin" /> Loading posts…
        </div>
      ) : recent.length === 0 ? (
        <div className="py-10 text-center text-gray-400">
          No blog posts yet.{" "}
          <Link href="/blog" className="text-brand-600 hover:underline">
            Add your first post
          </Link>
          .
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {recent.map((post) => (
            <Link
              key={post.id}
              href="/blog"
              className="group rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-brand-200 transition-all flex flex-col"
            >
              {/* Cover */}
              <div className="aspect-[16/10] bg-gradient-to-br from-brand-100 to-steel-100 overflow-hidden">
                {post.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverSrc(post.cover)}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : null}
              </div>

              {/* Body */}
              <div className="p-3.5 flex flex-col flex-1">
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  {post.category && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                      {post.category}
                    </span>
                  )}
                  {post.hidden ? (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 flex items-center gap-1">
                      <EyeOff size={10} /> Hidden
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 flex items-center gap-1">
                      <Eye size={10} /> Live
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-2 flex-1">
                  {post.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-gray-400 mt-auto">
                  <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[9px] font-semibold shrink-0">
                    {initials(post.author)}
                  </span>
                  <span className="text-gray-600 truncate">{post.author}</span>
                  {post.readTime && (
                    <>
                      <span>·</span>
                      <span className="whitespace-nowrap">{post.readTime}</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
