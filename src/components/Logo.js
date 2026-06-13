"use client";

// CLANS Machina wordmark. On the dark sidebar we render it pure white using
// the same `brightness(0) invert(1)` filter the main site uses (--logo-filter),
// so it blends in with no white background box.
export default function Logo({ onDark = true }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo/clans_logo.png"
      alt="Clans Machina"
      className={`h-9 w-auto ${onDark ? "logo-on-dark" : ""}`}
    />
  );
}
