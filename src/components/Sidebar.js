"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, LogOut, X } from "lucide-react";
import Logo from "./Logo";

const groups = [
  {
    title: null,
    items: [{ label: "Dashboard", icon: LayoutDashboard, href: "/" }],
  },
  {
    title: "Management",
    items: [
      { label: "Users / Inquiries", icon: Users, href: "/inquiries" },
      { label: "Blog", icon: FileText, href: "/blog" },
    ],
  },
  {
    title: "Account",
    items: [{ label: "Logout", icon: LogOut, href: "/signin" }],
  },
];

function NavContent({ pathname, onNavigate }) {
  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2 space-y-4">
      {groups.map((group, gi) => (
        <div key={gi}>
          {group.title && (
            <p className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-sidebar-muted uppercase">
              {group.title}
            </p>
          )}
          <div className="space-y-1">
            {group.items.map(({ label, icon: Icon, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={label}
                  href={href}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                      : "text-gray-400 hover:bg-sidebar-hover hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function Sidebar({ mobileOpen = false, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 shrink-0 flex-col bg-sidebar text-gray-300 h-screen sticky top-0">
        <div className="h-16 flex items-center px-6">
          <Logo />
        </div>
        <NavContent pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      <div className={`lg:hidden ${mobileOpen ? "" : "pointer-events-none"}`}>
        {/* Backdrop */}
        <div
          onClick={onClose}
          className={`fixed inset-0 bg-gray-900/50 z-40 transition-opacity ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Panel */}
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-sidebar text-gray-300 z-50 flex flex-col transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-16 flex items-center justify-between px-6">
            <Logo />
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-sidebar-hover hover:text-white">
              <X size={20} />
            </button>
          </div>
          <NavContent pathname={pathname} onNavigate={onClose} />
        </aside>
      </div>
    </>
  );
}
