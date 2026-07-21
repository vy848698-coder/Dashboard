// Owner auth — backed by the PHP server (auth_api.php) with bcrypt password
// hashes in the `admin_users` table. Login returns a signed bearer token that is
// kept in sessionStorage and sent on every API request (see apiConfig.js).
//
// Configure the endpoint in .env.local:
//   NEXT_PUBLIC_AUTH_API=http://localhost/Clans/auth_api.php

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API;

const TOKEN_KEY = "cm_admin_token";
const CURRENT_KEY = "cm_admin_current";
const OWNER_EVENT = "cm-owner-updated";

// --- token + session storage ----------------------------------------------

export function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function isAuthed() {
  return !!getToken();
}

export function getCurrentOwner() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem(CURRENT_KEY) || "null");
  } catch {
    return null;
  }
}

function setSession(token, user) {
  if (typeof window === "undefined") return;
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  if (user) {
    const light = { name: user.name, email: user.email };
    sessionStorage.setItem(CURRENT_KEY, JSON.stringify(light));
    window.dispatchEvent(new CustomEvent(OWNER_EVENT, { detail: light }));
  }
}

export function signOut() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(CURRENT_KEY);
}

// Subscribe to owner-identity changes so cached chrome (topbar) can refresh.
// Returns an unsubscribe function.
export function onOwnerUpdated(handler) {
  if (typeof window === "undefined") return () => {};
  const fn = (e) => handler(e.detail);
  window.addEventListener(OWNER_EVENT, fn);
  return () => window.removeEventListener(OWNER_EVENT, fn);
}

// --- server calls ----------------------------------------------------------

// POST/GET the auth API. Attaches the bearer token; returns { ok, data } where
// `ok` reflects the HTTP status and `data` is the parsed JSON (or {}).
async function authCall(action, { method = "GET", body } = {}) {
  if (!AUTH_API) return { ok: false, data: { error: "Auth API not configured." } };
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  try {
    const res = await fetch(`${AUTH_API}?action=${action}`, {
      method,
      cache: "no-store",
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  } catch (e) {
    return { ok: false, data: { error: "Can't reach the server." } };
  }
}

// Sign in with email + password. Returns { ok } or { ok:false, error }.
export async function signIn({ email, password }) {
  const { ok, data } = await authCall("login", {
    method: "POST",
    body: { email: (email || "").trim(), password: password || "" },
  });
  if (ok && data.token) {
    setSession(data.token, data.user);
    return { ok: true };
  }
  return { ok: false, error: data.error || "Invalid email or password." };
}

// --- owner management (Settings) -------------------------------------------

// Returns an array of owners: { name, email, seed }.  (seed = the primary owner)
export async function getOwners() {
  const { ok, data } = await authCall("list_users");
  if (ok && Array.isArray(data.users)) {
    return data.users.map((u) => ({ name: u.name, email: u.email, seed: !!u.primary }));
  }
  return [];
}

// Returns { ok: true } or { ok: false, error }.
export async function addOwner({ email, password }) {
  const { ok, data } = await authCall("add_user", {
    method: "POST",
    body: { email: (email || "").trim(), password },
  });
  return ok ? { ok: true } : { ok: false, error: data.error || "Couldn't add owner." };
}

export async function removeOwner(email) {
  const { ok, data } = await authCall("remove_user", {
    method: "POST",
    body: { email },
  });
  return ok ? { ok: true } : { ok: false, error: data.error || "Couldn't remove owner." };
}

// --- profile ---------------------------------------------------------------

// Edit the logged-in owner's name + email. Returns { ok, owner } or { ok:false, error }.
export async function updateOwnerProfile({ name, email }) {
  const { ok, data } = await authCall("update_profile", {
    method: "POST",
    body: { name: (name || "").trim(), email: (email || "").trim() },
  });
  if (ok && data.user) {
    // Email/name changed → server re-issued the token; refresh the session.
    setSession(data.token, data.user);
    return { ok: true, owner: data.user };
  }
  return { ok: false, error: data.error || "Couldn't update profile." };
}

// Change the logged-in owner's password. Returns { ok } or { ok:false, error }.
export async function changeOwnerPassword(currentPassword, newPassword) {
  const { ok, data } = await authCall("change_password", {
    method: "POST",
    body: { currentPassword, newPassword },
  });
  return ok ? { ok: true } : { ok: false, error: data.error || "Couldn't change password." };
}
