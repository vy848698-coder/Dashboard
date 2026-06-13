"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, UserPlus, CheckCheck } from "lucide-react";
import { timeAgo } from "@/data/inquiries";
import { useInquiries } from "./InquiriesProvider";

function initials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function NotificationBell() {
  const router = useRouter();
  const { inquiries } = useInquiries();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(new Set());
  const ref = useRef(null);

  // Recent inquiries, newest first.
  const items = [...inquiries]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  // Which ones were already read this session.
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(sessionStorage.getItem("cm_read_notifs") || "[]");
        setReadIds(new Set(saved));
      } catch {
        /* ignore */
      }
    }
  }, []);

  // An inquiry is "unread" if its status is New and we haven't opened it here.
  const unread = items.filter((i) => i.status === "New" && !readIds.has(i.id));
  const unreadCount = unread.length;

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function onPointer(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    const id = setTimeout(() => {
      document.addEventListener("pointerdown", onPointer);
      document.addEventListener("keydown", onKey);
    }, 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function markAllRead() {
    const all = new Set([...readIds, ...items.map((i) => i.id)]);
    setReadIds(all);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("cm_read_notifs", JSON.stringify([...all]));
    }
  }

  function openInquiries() {
    markAllRead();
    setOpen(false);
    router.push("/inquiries");
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-300/40 z-50 origin-top-right overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-900">Notifications</p>
              <p className="text-xs text-gray-400">
                {unreadCount > 0 ? `${unreadCount} new inquir${unreadCount === 1 ? "y" : "ies"}` : "You're all caught up"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-gray-400">No inquiries yet.</p>
            )}
            {items.map((inq) => {
              const isUnread = inq.status === "New" && !readIds.has(inq.id);
              return (
                <button
                  key={inq.id}
                  onClick={openInquiries}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                    isUnread ? "bg-brand-50/40" : ""
                  }`}
                >
                  <span className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0">
                    {initials(inq.fullName)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-sm text-gray-800">
                      <UserPlus size={13} className="text-brand-500 shrink-0" />
                      <span className="font-medium truncate">{inq.fullName}</span>
                    </span>
                    <span className="block text-xs text-gray-500 truncate">
                      New inquiry · {inq.city} · {inq.serviceType.replace(" (Home)", "")}
                    </span>
                    <span className="block text-[11px] text-gray-400 mt-0.5">{timeAgo(inq.date)}</span>
                  </span>
                  {isUnread && <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <button
            onClick={openInquiries}
            className="w-full py-2.5 text-sm font-medium text-brand-600 hover:bg-gray-50 border-t border-gray-100"
          >
            View all inquiries
          </button>
        </div>
      )}
    </div>
  );
}
