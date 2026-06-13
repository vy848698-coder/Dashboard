// Blog categories — managed by the owner in Settings, stored in localStorage so
// additions persist and show up in the "Add New Blog Post" category dropdown.
//
// ⚠️ UI-PHASE: localStorage is per-browser. Moves to the shared Supabase DB
// during integration so all owners see the same categories.

const CATEGORIES_KEY = "cm_blog_categories";

export const DEFAULT_CATEGORIES = [
  "PM Surya Ghar",
  "Solar Basics",
  "Subsidy & Finance",
  "Case Studies",
  "Maintenance",
  "Company News",
];

export function getCategories() {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (!raw) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.length ? list : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

function save(list) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list));
  }
}

// Returns { ok: true } or { ok: false, error }.
export function addCategory(name) {
  const clean = name.trim();
  if (!clean) return { ok: false, error: "Category name is required." };
  const list = getCategories();
  if (list.some((c) => c.toLowerCase() === clean.toLowerCase())) {
    return { ok: false, error: "That category already exists." };
  }
  save([...list, clean]);
  return { ok: true };
}

export function removeCategory(name) {
  const list = getCategories();
  if (list.length <= 1) {
    return { ok: false, error: "At least one category is required." };
  }
  save(list.filter((c) => c.toLowerCase() !== name.toLowerCase()));
  return { ok: true };
}
