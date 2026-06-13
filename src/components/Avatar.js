"use client";

// Illustrated (non-photo) avatar from DiceBear. Seeded by name/email so each
// owner gets a unique, consistent cartoon avatar — no real-person photos.
// Style "bottts" = friendly animated robots; swap `style` to taste, e.g.
// "fun-emoji", "adventurer", "thumbs", "shapes".
export default function Avatar({ name = "User", size = 40, className = "", style = "bottts" }) {
  const seed = encodeURIComponent(name || "User");
  const src = `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&backgroundColor=eef6fa,d4e9f1,d1fae5&radius=50`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`rounded-full object-cover bg-brand-50 ${className}`}
    />
  );
}
