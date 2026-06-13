"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, MoreVertical, Pencil, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";
import DashboardShell, { useGlobalSearch } from "@/components/DashboardShell";
import AddBlogPanel from "@/components/AddBlogPanel";
import { useToast } from "@/components/Toast";
import { getPosts, addPost, updatePost, deletePost, togglePostHidden } from "@/data/posts";

// A stored post is either live on the website ("Visible") or pulled ("Hidden").
const FILTERS = ["All", "Visible", "Hidden"];

// Cover images are stored as paths relative to the public site folder (e.g.
// "image/blog/uploads/x.jpg"). Resolve them against the site's base URL — the
// API URL up to its last "/", e.g. "http://localhost/ClansMachina/" — so the
// dashboard can render them. Absolute URLs / data URLs pass through unchanged.
const SITE_BASE = (() => {
  try {
    const u = new URL(process.env.NEXT_PUBLIC_POSTS_API);
    return u.origin + u.pathname.replace(/[^/]*$/, ""); // strip the filename
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
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function BlogContent() {
  const toast = useToast();
  const { query } = useGlobalSearch();
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState(null); // post being edited, or null for "create"
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  // Load posts from the MySQL-backed API.
  async function reload() {
    try {
      const list = await getPosts();
      setPosts(list);
    } catch (e) {
      toast("Couldn't load posts from the server.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setPanelOpen(true);
  }

  function openEdit(post) {
    setEditing(post);
    setPanelOpen(true);
  }

  async function handleSubmit(payload) {
    try {
      if (editing) {
        await updatePost(editing.id, payload);
        toast("Blog post updated — live on the website.", "success");
      } else {
        await addPost(payload);
        toast("Blog post published — now live on the website!", "success");
      }
      await reload();
    } catch (e) {
      toast("Couldn't save the post to the server.", "error");
    }
    setEditing(null);
  }

  async function handleDelete(post) {
    try {
      await deletePost(post.id);
      await reload();
      toast("Blog post deleted.", "info");
    } catch (e) {
      toast("Couldn't delete the post.", "error");
    }
  }

  async function handleToggleHidden(post) {
    try {
      await togglePostHidden(post.id);
      await reload();
      toast(post.hidden ? "Post is now visible on the website." : "Post hidden from the website.", "info");
    } catch (e) {
      toast("Couldn't update visibility.", "error");
    }
  }

  const filtered = posts.filter((p) => {
    const matchesFilter =
      filter === "All" ? true : filter === "Hidden" ? p.hidden : !p.hidden; // "Visible"
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      (p.title || "").toLowerCase().includes(q) ||
      (p.author || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });

  return (
    <>
      <div className="flex items-center justify-between pt-6 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="text-sm text-gray-500 mt-1">Create, edit, hide, and delete your blog posts.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
        >
          <Plus size={18} />
          Add New Post
        </button>
      </div>

      {/* Toolbar — visibility filters (search is the global topbar bar) */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4 mb-4">
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((s) => (
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
      {loading ? (
        <div className="py-16 text-center text-gray-400 flex items-center justify-center gap-2">
          <Loader2 size={18} className="animate-spin" /> Loading posts…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onEdit={() => openEdit(post)}
              onToggleHidden={() => handleToggleHidden(post)}
              onDelete={() => handleDelete(post)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-gray-400">
              No posts found. Click “Add New Post” to create one.
            </div>
          )}
        </div>
      )}

      <AddBlogPanel
        open={panelOpen}
        post={editing}
        onClose={() => {
          setPanelOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />
    </>
  );
}

export default function BlogPage() {
  return (
    <DashboardShell searchPlaceholder="Search posts by title, author, category...">
      <BlogContent />
    </DashboardShell>
  );
}

function PostCard({ post, onEdit, onToggleHidden, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the menu when clicking outside it.
  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  return (
    <article
      className={`group relative bg-white rounded-2xl border overflow-hidden transition-all flex flex-col ${
        post.hidden
          ? "border-gray-200 opacity-60"
          : "border-gray-100 hover:shadow-md hover:border-brand-200"
      }`}
    >
      {/* Actions menu */}
      <div ref={menuRef} className="absolute top-2 right-2 z-10">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="p-1.5 rounded-lg bg-white/90 backdrop-blur text-gray-600 hover:bg-white shadow-sm border border-gray-100"
          title="Actions"
        >
          <MoreVertical size={16} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl border border-gray-100 shadow-lg py-1 text-sm">
            <button
              onClick={() => { setMenuOpen(false); onEdit(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50"
            >
              <Pencil size={15} /> Edit
            </button>
            <button
              onClick={() => { setMenuOpen(false); onToggleHidden(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50"
            >
              {post.hidden ? <Eye size={15} /> : <EyeOff size={15} />}
              {post.hidden ? "Show" : "Hide"}
            </button>
            <button
              onClick={() => { setMenuOpen(false); onDelete(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50"
            >
              <Trash2 size={15} /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="aspect-[16/10] bg-gradient-to-br from-brand-100 to-steel-100 overflow-hidden">
        {post.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverSrc(post.cover)} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
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
  );
}

