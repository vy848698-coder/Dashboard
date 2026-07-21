// Shared secret sent with every admin API request as the "X-Admin-Key" header so
// the PHP endpoints can reject unauthenticated/drive-by access (see api_guard.php
// in the ClansMachina site). Configured in .env.local as NEXT_PUBLIC_ADMIN_KEY.
//
// NOTE: because NEXT_PUBLIC_ vars ship in the client bundle, this key is only
// truly private while the dashboard is run locally (not deployed publicly). It
// stops URL-scraping, bots, and casual access — not a determined attacker who
// downloads the bundle. Add real per-owner login before hosting the dashboard.
export const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "";

// Merge the auth headers into an existing headers object: the logged-in owner's
// bearer token (real per-owner auth) plus the shared admin key as a fallback.
// The PHP guard accepts either (see api_guard.php).
export function withKey(headers = {}) {
  const h = { ...headers };
  if (ADMIN_KEY) h["X-Admin-Key"] = ADMIN_KEY;
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("cm_admin_token");
    if (token) h["Authorization"] = `Bearer ${token}`;
  }
  return h;
}
