"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, X } from "lucide-react";
import DashboardShell, { useGlobalSearch } from "@/components/DashboardShell";
import { useInquiries } from "@/components/InquiriesProvider";
import { useToast } from "@/components/Toast";
import { STATUSES } from "@/data/inquiries";

const statusStyles = {
  New: "bg-brand-100 text-brand-700",
  Read: "bg-steel-100 text-steel-600",
  Replied: "bg-amber-100 text-amber-700",
};

const serviceStyles = {
  "Residential (Home)": "bg-brand-50 text-brand-700",
  Commercial: "bg-steel-100 text-steel-600",
};

function fmt(iso) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function InquiriesContent() {
  const { inquiries, loading, source, updateStatus } = useInquiries();
  const toast = useToast();
  const { query } = useGlobalSearch();
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  async function handleStatus(id, status) {
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
    const res = await updateStatus(id, status);
    if (res.ok) {
      toast(`Marked as ${status}.`, "success");
    } else {
      toast("Couldn't save status to the server.", "error");
    }
  }

  const filtered = inquiries.filter((inq) => {
    const matchesFilter = filter === "All" || inq.status === filter;
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      inq.fullName.toLowerCase().includes(q) ||
      inq.email.toLowerCase().includes(q) ||
      inq.city.toLowerCase().includes(q) ||
      inq.phone.includes(q);
    return matchesFilter && matchesQuery;
  });

  return (
    <>
      <div className="pt-6 pb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Users / Inquiries</h1>
          {!loading && (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                source === "live"
                  ? "bg-brand-100 text-brand-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${source === "live" ? "bg-brand-500" : "bg-amber-500"}`} />
              {source === "live" ? "Live (MySQL)" : "Offline (demo data)"}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Every lead submitted through the website consultation form.
        </p>
      </div>

      {/* Toolbar — status filters (search is the global topbar bar) */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4 mb-4">
        <div className="flex gap-1.5 flex-wrap">
          {["All", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === s
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="font-medium py-3 px-4">Name</th>
                <th className="font-medium py-3 px-4">Contact</th>
                <th className="font-medium py-3 px-4">City</th>
                <th className="font-medium py-3 px-4">Service</th>
                <th className="font-medium py-3 px-4 whitespace-nowrap">Monthly Bill</th>
                <th className="font-medium py-3 px-4">Date</th>
                <th className="font-medium py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inq) => (
                <tr
                  key={inq.id}
                  onClick={() => setSelected(inq)}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0">
                        {initials(inq.fullName)}
                      </div>
                      <span className="font-medium text-gray-900">{inq.fullName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    <p className="text-gray-700">{inq.email}</p>
                    <p className="text-xs text-gray-400">{inq.phone}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{inq.city}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${serviceStyles[inq.serviceType] || "bg-gray-100 text-gray-600"}`}>
                      {inq.serviceType.replace(" (Home)", "")}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{inq.monthlyBill}</td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{fmt(inq.date)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[inq.status]}`}>
                      {inq.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    No inquiries match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <InquiryDetail
          inquiry={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatus}
        />
      )}
    </>
  );
}

export default function InquiriesPage() {
  return (
    <DashboardShell searchPlaceholder="Search by name, email, city, phone...">
      <InquiriesContent />
    </DashboardShell>
  );
}

function InquiryDetail({ inquiry, onClose, onStatusChange }) {
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-gray-900/40 z-40" />
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Inquiry Details</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold">
              {initials(inquiry.fullName)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{inquiry.fullName}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[inquiry.status]}`}>
                {inquiry.status}
              </span>
            </div>
          </div>

          <DetailRow icon={Mail} label="Email" value={inquiry.email} />
          <DetailRow icon={Phone} label="Phone" value={inquiry.phone} />
          <DetailRow icon={MapPin} label="City" value={inquiry.city} />

          <div className="grid grid-cols-2 gap-4">
            <Info label="Service Type" value={inquiry.serviceType} />
            <Info label="Monthly Bill" value={inquiry.monthlyBill} />
          </div>

          <Info label="Submitted" value={fmt(inquiry.date)} />

          {inquiry.message && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Message</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{inquiry.message}</p>
            </div>
          )}

          {/* Status selector */}
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Mark as</p>
            <div className="flex gap-2">
              {STATUSES.map((s) => {
                const active = inquiry.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => onStatusChange?.(inquiry.id, s)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      active
                        ? "bg-brand-600 border-brand-600 text-white"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <a
            href={`mailto:${inquiry.email}`}
            className="flex-1 text-center px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
          >
            Reply by Email
          </a>
          <a
            href={`tel:${inquiry.phone}`}
            className="px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700"
          >
            Call
          </a>
        </div>
      </aside>
    </>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-9 h-9 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
        <Icon size={16} />
      </span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm text-gray-800 mt-0.5">{value}</p>
    </div>
  );
}
