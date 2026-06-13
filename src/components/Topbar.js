"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "./Toast";
import { Bell, Search, ChevronDown, User, Settings, LogOut, Menu } from "lucide-react";

export default function Topbar({ onMenuClick, query = "", onQueryChange, searchPlaceholder = "Search anything..." }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click or Escape. Listener is attached on the next tick
  // so the same click that opens the menu can't immediately close it.
  useEffect(() => {
    if (!open) return;
    function onPointer(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
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

  function handleLogout() {
    setOpen(false);
    toast("You've been logged out.", "info");
    // UI-only for now: real session teardown comes with auth integration.
    router.push("/signin");
  }

  return (
    <div className="px-4 lg:px-6 pt-4 sticky top-0 z-30">
      <header className="flex items-center gap-3 sm:gap-4 bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl shadow-sm shadow-gray-200/50 px-3 sm:px-4 py-2.5">
        {/* Hamburger (mobile) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 text-gray-600"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Greeting (desktop) */}
        <div className="hidden md:block shrink-0">
          <p className="text-sm font-semibold text-gray-900 leading-tight">Welcome back 👋</p>
          <p className="text-xs text-gray-400">Here&apos;s your overview</p>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md ml-auto group">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-11 pr-14 py-2.5 rounded-xl bg-gray-50 border border-transparent text-sm placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-brand-300 focus:ring-4 focus:ring-brand-100 transition-all"
          />
          <kbd className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-brand-500 rounded-full ring-2 ring-white animate-pulse" />
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-gray-200" />

        {/* Profile + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={open}
            className={`flex items-center gap-2.5 p-1 sm:pr-2.5 rounded-xl transition-colors ${
              open ? "bg-gray-100" : "hover:bg-gray-100"
            }`}
          >
            <span className="relative">
              <span className="block p-0.5 rounded-full bg-gradient-to-br from-brand-400 to-steel-500">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://i.pravatar.cc/80?img=12"
                  alt="Admin"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white"
                />
              </span>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-brand-500 rounded-full ring-2 ring-white" />
            </span>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-900 leading-tight">Admin Owner</p>
              <p className="text-xs text-brand-600">Super Admin</p>
            </div>
            <ChevronDown
              size={16}
              className={`hidden sm:block text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-300/40 p-2 z-50 origin-top-right"
            >
              {/* Header */}
              <div className="px-3 py-3 rounded-xl bg-gradient-to-br from-brand-50 to-steel-100/60 flex items-center gap-3 mb-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://i.pravatar.cc/80?img=12"
                  alt="Admin"
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-white"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">Admin Owner</p>
                  <p className="text-xs text-gray-500 truncate">admin@clansmachina.com</p>
                </div>
              </div>

              {/* Items */}
              <div className="py-1">
                <MenuItem href="/profile" icon={User} label="My Profile" onClick={() => setOpen(false)} />
                <MenuItem href="/settings" icon={Settings} label="Settings" onClick={() => setOpen(false)} />
              </div>

              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  role="menuitem"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

function MenuItem({ href, icon: Icon, label, onClick }) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <Icon size={16} className="text-gray-400" />
      {label}
    </Link>
  );
}
