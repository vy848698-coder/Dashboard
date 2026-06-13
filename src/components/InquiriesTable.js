"use client";

import Link from "next/link";
import { inquiries } from "@/data/inquiries";

const statusStyles = {
  New: "bg-brand-100 text-brand-700",
  Read: "bg-steel-100 text-steel-600",
  Replied: "bg-amber-100 text-amber-700",
};

const serviceStyles = {
  "Residential (Home)": "bg-brand-50 text-brand-700",
  Commercial: "bg-steel-100 text-steel-600",
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function initials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function InquiriesTable({ query = "" }) {
  const q = query.trim().toLowerCase();
  const rows = q
    ? inquiries.filter(
        (inq) =>
          inq.fullName.toLowerCase().includes(q) ||
          inq.email.toLowerCase().includes(q) ||
          inq.city.toLowerCase().includes(q) ||
          inq.phone.includes(q)
      )
    : inquiries;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Latest Inquiries / Users</h2>
        <Link
          href="/inquiries"
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700"
        >
          View All
        </Link>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="font-medium pb-3 px-2 w-10">#</th>
              <th className="font-medium pb-3 px-2">Name</th>
              <th className="font-medium pb-3 px-2">City</th>
              <th className="font-medium pb-3 px-2">Service</th>
              <th className="font-medium pb-3 px-2 whitespace-nowrap">Monthly Bill</th>
              <th className="font-medium pb-3 px-2">Date</th>
              <th className="font-medium pb-3 px-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((inq, i) => (
              <tr key={inq.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                <td className="py-3 px-2 text-gray-400">{i + 1}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0">
                      {initials(inq.fullName)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 leading-tight truncate">{inq.fullName}</p>
                      <p className="text-gray-400 text-xs truncate">{inq.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 text-gray-600 whitespace-nowrap">{inq.city}</td>
                <td className="py-3 px-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${serviceStyles[inq.serviceType] || "bg-gray-100 text-gray-600"}`}>
                    {inq.serviceType.replace(" (Home)", "")}
                  </span>
                </td>
                <td className="py-3 px-2 text-gray-600 whitespace-nowrap">{inq.monthlyBill}</td>
                <td className="py-3 px-2 text-gray-500 whitespace-nowrap">{formatDate(inq.date)}</td>
                <td className="py-3 px-2 text-right">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[inq.status]}`}>
                    {inq.status}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-400">
                  No inquiries match “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
