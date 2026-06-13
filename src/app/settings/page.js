"use client";

import { useEffect, useState } from "react";
import { UserPlus, Trash2, ShieldCheck, Loader2, Tag, Plus } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import Avatar from "@/components/Avatar";
import { useToast } from "@/components/Toast";
import { getOwners, addOwner, removeOwner, getCurrentOwner, SEED_OWNER } from "@/data/auth";
import { getCategories, addCategory, removeCategory } from "@/data/categories";

export default function SettingsPage() {
  const toast = useToast();
  const [owners, setOwners] = useState([]);
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Blog categories
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  const refresh = () => setOwners(getOwners());
  const refreshCategories = () => setCategories(getCategories());

  useEffect(() => {
    refresh();
    refreshCategories();
    setCurrent(getCurrentOwner());
  }, []);

  function handleAddCategory(e) {
    e.preventDefault();
    const res = addCategory(newCategory);
    if (res.ok) {
      toast(`Category “${newCategory.trim()}” added.`, "success");
      setNewCategory("");
      refreshCategories();
    } else {
      toast(res.error, "error");
    }
  }

  function handleRemoveCategory(name) {
    const res = removeCategory(name);
    if (res.ok) {
      toast(`Category “${name}” removed.`, "info");
      refreshCategories();
    } else {
      toast(res.error, "error");
    }
  }

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((x) => ({ ...x, [key]: undefined }));
  };

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 4) errs.password = "At least 4 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    const res = addOwner(form);
    if (res.ok) {
      toast(`${form.name} can now log in as an owner.`, "success");
      setForm({ name: "", email: "", password: "" });
      refresh();
    } else {
      setErrors({ email: res.error });
      toast(res.error, "error");
    }
    setSaving(false);
  }

  function handleRemove(owner) {
    const res = removeOwner(owner.email);
    if (res.ok) {
      toast(`${owner.name} removed.`, "info");
      refresh();
    } else {
      toast(res.error, "error");
    }
  }

  const isSeed = (o) => o.email.toLowerCase() === SEED_OWNER.email.toLowerCase();

  return (
    <DashboardShell>
      <div className="pt-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage who can access the admin panel.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Owners list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-brand-600" />
            Owners ({owners.length})
          </h2>

          <div className="space-y-2">
            {owners.map((o) => {
              const me = current && o.email.toLowerCase() === current.email.toLowerCase();
              return (
                <div
                  key={o.email}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100"
                >
                  <Avatar name={o.name} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {o.name}
                      {me && <span className="ml-2 text-[10px] font-semibold text-brand-600">YOU</span>}
                      {isSeed(o) && (
                        <span className="ml-2 text-[10px] font-semibold text-amber-600">PRIMARY</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{o.email}</p>
                  </div>
                  {!isSeed(o) && (
                    <button
                      onClick={() => handleRemove(o)}
                      className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Remove owner"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add owner */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <UserPlus size={18} className="text-brand-600" />
            Add New Owner
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            They&apos;ll be able to log in with these credentials.
          </p>

          <form onSubmit={handleAdd} className="space-y-4">
            <Field label="Name" error={errors.name}>
              <input value={form.name} onChange={set("name")} placeholder="Full name" className={inputCls(errors.name)} />
            </Field>
            <Field label="Email" error={errors.email}>
              <input type="email" value={form.email} onChange={set("email")} placeholder="owner@example.com" className={inputCls(errors.email)} />
            </Field>
            <Field label="Password" error={errors.password}>
              <input type="text" value={form.password} onChange={set("password")} placeholder="Set a password" className={inputCls(errors.password)} />
            </Field>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium disabled:opacity-60"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              Add Owner
            </button>
          </form>
        </div>
      </div>

      {/* Blog Categories */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">
        <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Tag size={18} className="text-brand-600" />
          Blog Categories ({categories.length})
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          These appear in the category dropdown when creating a blog post.
        </p>

        {/* Add form */}
        <form onSubmit={handleAddCategory} className="flex gap-2 mb-5 max-w-md">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium whitespace-nowrap"
          >
            <Plus size={16} />
            Add
          </button>
        </form>

        {/* Chips */}
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c}
              className="group inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100 text-sm font-medium"
            >
              {c}
              <button
                onClick={() => handleRemoveCategory(c)}
                className="w-5 h-5 rounded-full flex items-center justify-center text-brand-400 hover:bg-brand-200 hover:text-brand-700 transition-colors"
                title={`Remove ${c}`}
              >
                <Trash2 size={12} />
              </button>
            </span>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inputCls(error) {
  return `w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors ${
    error ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-brand-400 focus:ring-brand-100"
  }`;
}
