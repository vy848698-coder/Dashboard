"use client";

import DashboardShell from "@/components/DashboardShell";

export default function ProfilePage() {
  return (
    <DashboardShell>
      <div className="pt-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account details.</p>
      </div>

      <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://i.pravatar.cc/120?img=12"
            alt="Admin"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <p className="text-lg font-semibold text-gray-900">Admin Owner</p>
            <p className="text-sm text-brand-600">Super Admin</p>
            <p className="text-sm text-gray-400">admin@clansmachina.com</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-400">
          Profile editing will be available once account integration is wired up.
        </p>
      </div>
    </DashboardShell>
  );
}
