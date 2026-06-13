"use client";

import { useState, useRef, useEffect } from "react";
import { X, ImagePlus, Loader2 } from "lucide-react";
import { getCategoryNames } from "@/data/categories";

const empty = {
  title: "",
  category: "",
  author: "",
  readTime: "",
  excerpt: "",
  content: "",
};

// Estimate reading time from the post content (~200 words per minute, min 1).
function estimateReadTime(content) {
  const words = (content || "").trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return "";
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

export default function AddBlogPanel({ open, onClose, onSubmit, post }) {
  const isEdit = Boolean(post);
  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [coverPreview, setCoverPreview] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  // When the panel opens: load owner-managed categories (from the shared DB),
  // and prefill the form from `post` when editing (otherwise start blank).
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const list = await getCategoryNames();
      if (cancelled) return;
      setCategories(list);
      if (post) {
        setForm({
          title: post.title || "",
          category: post.category || list[0] || "",
          author: post.author || "",
          readTime: post.readTime || "",
          excerpt: post.excerpt || "",
          content: post.content || "",
        });
        setCoverPreview(post.cover || "");
        setCoverFile(null);
      } else {
        setForm({ ...empty, category: list[0] || "" });
        setCoverPreview("");
        setCoverFile(null);
      }
      setErrors({});
    })();
    return () => { cancelled = true; };
  }, [open, post]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function handleCover(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.author.trim()) errs.author = "Author is required";
    if (!form.content.trim()) errs.content = "Content is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submit(status) {
    if (!validate()) return;
    setSaving(true);
    // When we integrate, POST this payload (cover as multipart) to the API.
    // When editing, keep the post's existing status unless a new one is given.
    const finalStatus = status || post?.status || "Draft";
    // Read time is auto-derived from the content, not typed by the owner.
    const payload = {
      ...form,
      readTime: estimateReadTime(form.content),
      status: finalStatus,
      cover: coverFile,
      coverPreview,
    };
    await new Promise((r) => setTimeout(r, 600)); // simulate request
    onSubmit?.(payload);
    setSaving(false);
    reset();
    onClose();
  }

  function reset() {
    setForm(empty);
    setCoverPreview("");
    setCoverFile(null);
    setErrors({});
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-gray-900/40 z-40 transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-xl bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEdit ? "Edit Blog Post" : "Add New Blog Post"}
            </h2>
            <p className="text-sm text-gray-500">
              {isEdit ? "Update the details and save your changes." : "Fill in the details and publish."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Cover image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleCover}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-[16/7] rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-300 hover:bg-brand-50/30 transition-colors flex flex-col items-center justify-center text-gray-400 overflow-hidden"
            >
              {coverPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverPreview} alt="cover preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImagePlus size={28} />
                  <span className="mt-2 text-sm">Click to upload cover image</span>
                  <span className="text-xs text-gray-300">PNG, JPG up to 5MB</span>
                </>
              )}
            </button>
          </div>

          {/* Title */}
          <Field label="Title" error={errors.title} required>
            <input
              value={form.title}
              onChange={set("title")}
              placeholder="How the ₹78,000 Rooftop Solar Subsidy Actually Works"
              className={inputCls(errors.title)}
            />
          </Field>

          {/* Category + Read time */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select value={form.category} onChange={set("category")} className={inputCls()}>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Read Time" hint="auto from content">
              <input
                value={estimateReadTime(form.content) || ""}
                placeholder="Calculated automatically"
                readOnly
                tabIndex={-1}
                className={inputCls() + " bg-gray-50 text-gray-500 cursor-default"}
              />
            </Field>
          </div>

          {/* Author */}
          <Field label="Author" error={errors.author} required>
            <input
              value={form.author}
              onChange={set("author")}
              placeholder="Arjun Mehta"
              className={inputCls(errors.author)}
            />
          </Field>

          {/* Excerpt */}
          <Field label="Excerpt" hint="Short summary shown on cards">
            <textarea
              value={form.excerpt}
              onChange={set("excerpt")}
              rows={2}
              placeholder="₹30,000/kW for the first 2 kW..."
              className={inputCls() + " resize-none"}
            />
          </Field>

          {/* Content */}
          <Field label="Content" error={errors.content} required>
            <textarea
              value={form.content}
              onChange={set("content")}
              rows={8}
              placeholder="Write your blog post here..."
              className={inputCls(errors.content) + " resize-y"}
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => submit("Published")}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {isEdit ? "Save Changes" : "Publish to Website"}
          </button>
        </div>
      </aside>
    </>
  );
}

function Field({ label, children, error, hint, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
        {hint && <span className="text-gray-400 font-normal"> — {hint}</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inputCls(error) {
  return `w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors ${
    error
      ? "border-red-300 focus:ring-red-100"
      : "border-gray-200 focus:border-brand-400 focus:ring-brand-100"
  }`;
}
