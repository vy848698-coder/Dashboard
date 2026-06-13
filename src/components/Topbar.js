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
    <header className="flex items-center gap-3 sm:gap-4 px-6 lg:px-8 pt-6">
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md ml-auto">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange?.(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
        />
      </div>

      {/* Notifications */}
      <button className="relative p-2.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50">
        <Bell size={20} className="text-gray-600" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
          3
        </span>
      </button>

      {/* Profile + dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          className={`flex items-center gap-3 pl-1 pr-3 py-1 rounded-full border transition-colors ${
            open ? "bg-white border-gray-200" : "border-transparent hover:bg-white"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://i.pravatar.cc/80?img=12"
            alt="Admin"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-gray-900 leading-tight">Admin Owner</p>
            <p className="text-xs text-brand-600">Super Admin</p>
          </div>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-60 bg-white rounded-xl border border-gray-100 shadow-lg shadow-gray-200/60 py-2 z-50 origin-top-right"
          >
            {/* Header */}
            <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://i.pravatar.cc/80?img=12"
                alt="Admin"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">Admin Owner</p>
                <p className="text-xs text-gray-400 truncate">admin@clansmachina.com</p>
              </div>
            </div>

            {/* Items */}
            <div className="py-1">
              <MenuItem href="/profile" icon={User} label="My Profile" onClick={() => setOpen(false)} />
              <MenuItem href="/settings" icon={Settings} label="Settings" onClick={() => setOpen(false)} />
            </div>

            <div className="border-t border-gray-100 pt-1">
              <button
                onClick={handleLogout}
                role="menuitem"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function MenuItem({ href, icon: Icon, label, onClick }) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <Icon size={16} className="text-gray-400" />
      {label}
    </Link>
  );
}
