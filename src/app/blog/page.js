"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import AddBlogPanel from "@/components/AddBlogPanel";
import { useToast } from "@/components/Toast";
import { recentPosts, POST_STATUSES } from "@/data/inquiries";

const statusStyles = {
  Published: "bg-brand-100 text-brand-700",
  Draft: "bg-amber-100 text-amber-700",
};

function initials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function BlogPage() {
  const toast = useToast();
  const [panelOpen, setPanelOpen] = useState(false);
  const [posts, setPosts] = useState(recentPosts);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  function handleCreate(payload) {
    const newPost = {
      id: Date.now(),
      title: payload.title,
      excerpt: payload.excerpt,
      category: payload.category,
      author: payload.author,
      readTime: payload.readTime || "1 min read",
      cover: payload.coverPreview || "",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: payload.status,
    };
    setPosts((p) => [newPost, ...p]);
    toast(
      payload.status === "Published" ? "Blog post published!" : "Draft saved.",
      "success"
    );
  }

  const filtered = posts.filter((p) => {
    const matchesFilter = filter === "All" || p.status === filter;
    const matchesQuery = !query || p.title.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <DashboardShell>
      <div className="flex items-center justify-between pt-6 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage your blog posts.</p>
        </div>
        <button
          onClick={() => setPanelOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
        >
          <Plus size={18} />
          Add New Post
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400"
          />
        </div>
        <div className="flex gap-1.5">
          {["All", ...POST_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === s
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Post grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((post) => (
          <article
            key={post.id}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-brand-200 transition-all flex flex-col"
          >
            <div className="aspect-[16/10] bg-gradient-to-br from-brand-100 to-steel-100 overflow-hidden">
              {post.cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.cover} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              )}
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                  {post.category}
                </span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusStyles[post.status]}`}>
                  {post.status}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-2 flex-1">
                {post.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-auto pt-2 border-t border-gray-50">
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[9px] font-semibold shrink-0">
                  {initials(post.author)}
                </span>
                <span className="text-gray-600 truncate">{post.author}</span>
                <span>·</span>
                <span className="whitespace-nowrap">{post.date}</span>
              </div>
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400">
            No posts found. Click “Add New Post” to create one.
          </div>
        )}
      </div>

      <AddBlogPanel open={panelOpen} onClose={() => setPanelOpen(false)} onSubmit={handleCreate} />
    </DashboardShell>
  );
}
