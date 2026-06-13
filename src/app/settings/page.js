"use client";

import DashboardShell from "@/components/DashboardShell";

export default function SettingsPage() {
  return (
    <DashboardShell>
      <div className="pt-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your admin panel.</p>
      </div>

      <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl">
        <p className="text-sm text-gray-400">
          Settings will be available once account integration is wired up.
        </p>
      </div>
    </DashboardShell>
  );
}
