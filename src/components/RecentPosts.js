"use client";

import Link from "next/link";
import { recentPosts } from "@/data/inquiries";

const statusStyles = {
  Published: "bg-brand-100 text-brand-700",
  Draft: "bg-amber-100 text-amber-700",
};

function initials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function RecentPosts() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900">Recent Blog Posts</h2>
        <Link
          href="/blog"
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700"
        >
          View All
        </Link>
      </div>

      {/* Horizontal card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {recentPosts.map((post) => (
          <article
            key={post.id}
            className="group rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-brand-200 transition-all cursor-pointer flex flex-col"
          >
            {/* Cover */}
            <div className="aspect-[16/10] bg-gradient-to-br from-brand-100 to-steel-100 overflow-hidden">
              {post.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.cover}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : null}
            </div>

            {/* Body */}
            <div className="p-3.5 flex flex-col flex-1">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                  {post.category}
                </span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusStyles[post.status]}`}>
                  {post.status}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-2 flex-1">
                {post.title}
              </h3>

              <div className="flex items-center gap-2 text-xs text-gray-400 mt-auto">
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[9px] font-semibold shrink-0">
                  {initials(post.author)}
                </span>
                <span className="text-gray-600 truncate">{post.author}</span>
                <span>·</span>
                <span className="whitespace-nowrap">{post.readTime}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
