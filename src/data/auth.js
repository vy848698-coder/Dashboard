// Owner accounts + session helpers.
//
// ⚠️ TEMPORARY / UI-PHASE ONLY: owner accounts (including passwords) live in the
// browser's localStorage, so they are NOT secure. Fine for local development;
// MUST be replaced with real server-side auth (Supabase) before going live.
// During integration, replace these helpers with Supabase user management.

const OWNERS_KEY = "cm_admin_owners";
const SESSION_KEY = "cm_admin_authed";
const CURRENT_KEY = "cm_admin_current";

// The first/seed owner. Always present and cannot be removed.
export const SEED_OWNER = {
  name: "Vivek",
  email: "vk3630932@gmail.com",
  password: "asdfg",
  seed: true,
};

// --- Owner storage ---------------------------------------------------------

export function getOwners() {
  if (typeof window === "undefined") return [SEED_OWNER];
  try {
    const raw = localStorage.getItem(OWNERS_KEY);
    if (!raw) {
      localStorage.setItem(OWNERS_KEY, JSON.stringify([SEED_OWNER]));
      return [SEED_OWNER];
    }
    const list = JSON.parse(raw);
    // Make sure the seed owner is always there.
    if (!list.some((o) => o.email.toLowerCase() === SEED_OWNER.email.toLowerCase())) {
      list.unshift(SEED_OWNER);
    }
    return list;
  } catch {
    return [SEED_OWNER];
  }
}

function saveOwners(list) {
  if (typeof window !== "undefined") {
    localStorage.setItem(OWNERS_KEY, JSON.stringify(list));
  }
}

// Returns { ok: true } or { ok: false, error }.
export function addOwner({ name, email, password }) {
  const owners = getOwners();
  const cleanEmail = email.trim().toLowerCase();
  if (owners.some((o) => o.email.toLowerCase() === cleanEmail)) {
    return { ok: false, error: "An owner with this email already exists." };
  }
  owners.push({ name: name.trim(), email: email.trim(), password });
  saveOwners(owners);
  return { ok: true };
}

export function removeOwner(email) {
  const target = email.toLowerCase();
  if (target === SEED_OWNER.email.toLowerCase()) {
    return { ok: false, error: "The primary owner cannot be removed." };
  }
  saveOwners(getOwners().filter((o) => o.email.toLowerCase() !== target));
  return { ok: true };
}

// --- Credentials check -----------------------------------------------------

export function checkCredentials({ name, email, password }) {
  const cleanName = name.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();
  return (
    getOwners().find(
      (o) =>
        o.name.toLowerCase() === cleanName &&
        o.email.toLowerCase() === cleanEmail &&
        o.password === password
    ) || null
  );
}

// --- Session ---------------------------------------------------------------

export function setAuthed(owner) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, "1");
  if (owner) {
    sessionStorage.setItem(
      CURRENT_KEY,
      JSON.stringify({ name: owner.name, email: owner.email })
    );
  }
}

export function clearAuthed() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(CURRENT_KEY);
}

export function isAuthed() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function getCurrentOwner() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem(CURRENT_KEY) || "null");
  } catch {
    return null;
  }
}
