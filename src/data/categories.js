// Blog categories — managed by the owner in Settings, stored in the shared MySQL
// `categories` table via the PHP API so the dashboard's category dropdown and the
// public website's "Browse by Category" sidebar stay in sync from one source.
//
// Configure the endpoint in .env.local:
//   NEXT_PUBLIC_CATEGORIES_API=http://localhost/ClansMachina/categories_api.php
//
// Each category is { id, name, slug, sort_order }. Most of the UI only needs the
// display `name`, so getCategoryNames() returns a plain string[] for convenience.

const API = process.env.NEXT_PUBLIC_CATEGORIES_API;

// Fallback names shown if the API isn't configured/reachable (matches the DB seed).
export const DEFAULT_CATEGORIES = [
  "PM Surya Ghar",
  "Solar Basics",
  "Subsidy & Finance",
  "Case Studies",
  "Maintenance",
  "Company News",
];

async function call(url, options) {
  const res = await fetch(url, { cache: "no-store", ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: data.error || `HTTP ${res.status}`, data };
  }
  return { ok: true, data };
}

// Full category objects ({ id, name, slug, sort_order }).
export async function getCategories() {
  if (!API) return DEFAULT_CATEGORIES.map((name, i) => ({ name, slug: name, sort_order: i }));
  const res = await call(API);
  return res.ok && Array.isArray(res.data) ? res.data : [];
}

// Convenience: just the display names as a string[].
export async function getCategoryNames() {
  const list = await getCategories();
  return list.map((c) => c.name);
}

// Returns { ok: true } or { ok: false, error }.
export async function addCategory(name) {
  const clean = (name || "").trim();
  if (!clean) return { ok: false, error: "Category name is required." };
  if (!API) return { ok: false, error: "Categories API not configured." };
  const res = await call(`${API}?action=add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: clean }),
  });
  return res.ok ? { ok: true } : { ok: false, error: res.error };
}

export async function removeCategory(name) {
  if (!API) return { ok: false, error: "Categories API not configured." };
  const res = await call(`${API}?action=remove`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.ok ? { ok: true } : { ok: false, error: res.error };
}
