"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import Avatar from "@/components/Avatar";
import { getCurrentOwner } from "@/data/auth";

export default function ProfilePage() {
  const [owner, setOwner] = useState({ name: "Owner", email: "" });

  useEffect(() => {
    const current = getCurrentOwner();
    if (current) setOwner(current);
  }, []);

  return (
    <DashboardShell>
      <div className="pt-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account details.</p>
      </div>

      <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <span className="p-1 rounded-full bg-gradient-to-br from-brand-400 to-steel-500">
            <Avatar name={owner.name} size={80} className="ring-2 ring-white" />
          </span>
          <div>
            <p className="text-lg font-semibold text-gray-900">{owner.name}</p>
            <p className="text-sm text-brand-600">Owner</p>
            <p className="text-sm text-gray-400">{owner.email}</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-400">
          To manage owners, go to <span className="font-medium text-gray-600">Settings → Owners</span>.
        </p>
      </div>
    </DashboardShell>
  );
}
