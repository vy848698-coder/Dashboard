"use client";

import Link from "next/link";
import { FilePlus, UploadCloud, ChevronRight } from "lucide-react";

// Items with `href` navigate; items with `key` trigger an in-page action.
const actions = [
  { key: "new-post", label: "Add New Blog Post", desc: "Write & publish an article", icon: FilePlus, tone: "teal" },
  { href: "/media", label: "Upload Media", desc: "Add images to the library", icon: UploadCloud, tone: "green" },
];

const tones = {
  teal: "bg-brand-100 text-brand-600",
  green: "bg-green-100 text-green-600",
  blue: "bg-steel-100 text-steel-600",
  amber: "bg-amber-100 text-amber-600",
};

function Row({ icon: Icon, label, desc, tone }) {
  return (
    <>
      <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-gray-800">{label}</span>
        <span className="block text-xs text-gray-400">{desc}</span>
      </span>
      <ChevronRight size={16} className="text-gray-300 group-hover:text-brand-500 transition-colors" />
    </>
  );
}

const rowCls =
  "group w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/50 transition-colors text-left";

export default function QuickActions({ onAction }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="space-y-2">
        {actions.map((a) => {
          const row = <Row icon={a.icon} label={a.label} desc={a.desc} tone={a.tone} />;
          return a.href ? (
            <Link key={a.label} href={a.href} className={rowCls}>
              {row}
            </Link>
          ) : (
            <button key={a.label} onClick={() => onAction?.(a.key)} className={rowCls}>
              {row}
            </button>
          );
        })}
      </div>
    </div>
  );
}
