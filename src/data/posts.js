// Blog posts — created/edited/deleted/hidden by the owner in the admin Blog page,
// stored in the shared MySQL `posts` table via the PHP API so the public
// ClansMachina website (blog.php / post.php) shows the same posts.
//
// Configure the endpoint in .env.local:
//   NEXT_PUBLIC_POSTS_API=http://localhost/ClansMachina/posts_api.php
//
// Post shape (what the dashboard works with):
//   { id, title, excerpt, content, category, author, readTime,
//     cover, date, hidden }
// Note: the public site treats every stored post as published; "hidden" controls
// whether it appears on the website. (Draft is a dashboard-only concept now and
// is mapped to hidden=true when saving — see addPost/updatePost in the page.)

const API = process.env.NEXT_PUBLIC_POSTS_API;

// Read a File into a base64 data URL so it can be sent as JSON to PHP.
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Build the JSON payload the API expects from a dashboard form payload.
async function toPayload(data) {
  // Prefer a freshly chosen File; otherwise keep the existing cover path/preview.
  let cover = data.cover;
  if (cover instanceof File) cover = await fileToDataUrl(cover);
  else cover = data.coverPreview || data.cover || "";
  return {
    title: data.title,
    excerpt: data.excerpt || "",
    content: data.content || "",
    category: data.category || "",
    author: data.author || "",
    readTime: data.readTime || "",
    cover,
  };
}

async function call(url, options) {
  const res = await fetch(url, { cache: "no-store", ...options });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Fetch all posts (admin view — includes hidden ones).
export async function getPosts() {
  if (!API) return [];
  const data = await call(API);
  return Array.isArray(data) ? data : [];
}

export async function addPost(data) {
  if (!API) throw new Error("Posts API not configured");
  const body = JSON.stringify(await toPayload(data));
  const res = await call(`${API}?action=create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  return res.post;
}

export async function updatePost(id, data) {
  if (!API) throw new Error("Posts API not configured");
  const body = JSON.stringify(await toPayload(data));
  const res = await call(`${API}?action=update&id=${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  return res.post;
}

export async function deletePost(id) {
  if (!API) throw new Error("Posts API not configured");
  await call(`${API}?action=delete&id=${id}`, { method: "POST" });
  return id;
}

export async function togglePostHidden(id) {
  if (!API) throw new Error("Posts API not configured");
  const res = await call(`${API}?action=toggle&id=${id}`, { method: "POST" });
  return res.post;
}
