"use client";

import { useState } from "react";
import {
  Phone, Mail, MapPin, X, CheckCircle2, CalendarCheck, Flame, Users, Inbox, MessageCircle, RefreshCw,
} from "lucide-react";
import DashboardShell, { useGlobalSearch } from "@/components/DashboardShell";
import { useSaathi } from "@/components/SaathiProvider";
import { useToast } from "@/components/Toast";
import { STATUSES, timeAgo } from "@/data/inquiries";

const statusStyles = {
  New: "bg-brand-100 text-brand-700",
  Read: "bg-steel-100 text-steel-600",
  Replied: "bg-amber-100 text-amber-700",
};

const tempStyles = {
  Hot: "bg-red-100 text-red-700",
  Warm: "bg-amber-100 text-amber-700",
  Cold: "bg-steel-100 text-steel-600",
};

// Chatbot journey stage. Unknown stages fall back to a neutral pill.
const stageStyles = {
  booked: "bg-brand-100 text-brand-700",
  plan: "bg-steel-100 text-steel-600",
};

const TEMPERATURES = ["Hot", "Warm", "Cold"];

const inr = (n) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDate(ymd) {
  if (!ymd) return "";
  return new Date(`${ymd}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function initials(name = "") {
  return name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

const titleCase = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");
const place = (l) => [l.area, l.district, l.state].filter(Boolean).join(", ");

function SaathiContent() {
  const { leads, loading, source, error, lastUpdated, freshIds, refresh, updateStatus } = useSaathi();
  const toast = useToast();
  const { query } = useGlobalSearch();
  const [statusFilter, setStatusFilter] = useState("All");
  const [tempFilter, setTempFilter] = useState("All");
  // Track by id so the drawer shows live data as the chatbot updates the row.
  const [selectedId, setSelectedId] = useState(null);
  const selected = leads.find((l) => l.id === selectedId) || null;

  async function handleStatus(id, status) {
    const res = await updateStatus(id, status);
    if (res.ok) toast(`Marked as ${status}.`, "success");
    else toast("Couldn't save status to the server.", "error");
  }

  const q = query.trim().toLowerCase();
  const filtered = leads.filter((l) => {
    if (statusFilter !== "All" && l.status !== statusFilter) return false;
    if (tempFilter !== "All" && l.temperature !== tempFilter) return false;
    if (!q) return true;
    return [l.name, l.mobile, l.email, l.area, l.district, l.state, l.pinCode, l.bookingId]
      .some((v) => (v || "").toLowerCase().includes(q));
  });

  const stats = [
    { label: "Total Leads", value: leads.length, icon: Users, cls: "bg-steel-100 text-steel-600" },
    { label: "New", value: leads.filter((l) => l.status === "New").length, icon: Inbox, cls: "bg-brand-100 text-brand-700" },
    { label: "Hot Leads", value: leads.filter((l) => l.temperature === "Hot").length, icon: Flame, cls: "bg-red-100 text-red-700" },
    { label: "Consultations Booked", value: leads.filter((l) => l.bookingId).length, icon: CalendarCheck, cls: "bg-amber-100 text-amber-700" },
  ];

  return (
    <>
      <div className="pt-6 pb-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">Solar Saathi Leads</h1>
          {!loading && (
            <span
              title={error || undefined}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                source === "live" ? "bg-brand-100 text-brand-700" : "bg-red-100 text-red-700"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${source === "live" ? "bg-brand-500 animate-pulse" : "bg-red-500"}`} />
              {source === "live" ? "Live (MySQL)" : "Can't reach server"}
            </span>
          )}
          {lastUpdated && (
            <button
              onClick={refresh}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
              title="Refresh now"
            >
              <RefreshCw size={12} />
              Updated {timeAgo(lastUpdated)}
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Leads captured by the Solar Saathi AI chatbot. New submissions appear here automatically.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {stats.map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cls}`}>
              <Icon size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 truncate">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters (search is the global topbar bar) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-6 mb-4">
        <FilterChips options={["All", ...STATUSES]} value={statusFilter} onChange={setStatusFilter} />
        <span className="hidden sm:block w-px h-6 bg-gray-200" />
        <FilterChips options={["All", ...TEMPERATURES]} value={tempFilter} onChange={setTempFilter} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[960px]">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="font-medium py-3 px-4">Lead</th>
                <th className="font-medium py-3 px-4">Location</th>
                <th className="font-medium py-3 px-4 whitespace-nowrap">Monthly Bill</th>
                <th className="font-medium py-3 px-4">System</th>
                <th className="font-medium py-3 px-4">Score</th>
                <th className="font-medium py-3 px-4">Stage</th>
                <th className="font-medium py-3 px-4">Received</th>
                <th className="font-medium py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr
                  key={l.id}
                  onClick={() => setSelectedId(l.id)}
                  className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/60 cursor-pointer ${
                    freshIds.has(l.id) ? "bg-brand-50/60" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0">
                        {initials(l.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 flex items-center gap-1.5">
                          {l.name}
                          {freshIds.has(l.id) && (
                            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-brand-600 text-white">
                              New
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          {l.mobile}
                          {l.mobileVerified && <CheckCircle2 size={12} className="text-brand-600" />}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <p className="whitespace-nowrap">{[l.district, l.state].filter(Boolean).join(", ") || "—"}</p>
                    <p className="text-xs text-gray-400">{l.pinCode}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{inr(l.monthlyBill)}</td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                    <p>{l.systemKw != null ? `${l.systemKw} kW` : "—"}</p>
                    <p className="text-xs text-gray-400">{l.totalCost != null ? inr(l.totalCost) : ""}</p>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900 mr-2">{l.score}</span>
                    {l.temperature && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tempStyles[l.temperature] || "bg-gray-100 text-gray-600"}`}>
                        {l.temperature}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stageStyles[l.stage] || "bg-gray-100 text-gray-600"}`}>
                      {titleCase(l.stage)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap" title={fmt(l.createdAt)}>
                    {timeAgo(l.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[l.status] || "bg-gray-100 text-gray-600"}`}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-400">
                    {loading
                      ? "Loading leads…"
                      : leads.length === 0
                      ? source === "live"
                        ? "No Solar Saathi leads yet."
                        : `Couldn't load leads${error ? ` (${error})` : ""}.`
                      : "No leads match your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <LeadDetail lead={selected} onClose={() => setSelectedId(null)} onStatusChange={handleStatus} />
      )}
    </>
  );
}

export default function SaathiPage() {
  return (
    <DashboardShell searchPlaceholder="Search by name, mobile, district, PIN, booking ID...">
      <SaathiContent />
    </DashboardShell>
  );
}

function FilterChips({ options, value, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            value === s ? "bg-brand-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

function LeadDetail({ lead: l, onClose, onStatusChange }) {
  const waNumber = l.mobile && l.mobile.length === 10 ? `91${l.mobile}` : l.mobile;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-gray-900/40 z-40" />
      <aside className="fixed top-0 right-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Lead Details</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold">
              {initials(l.name)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">{l.name}</p>
              <div className="flex gap-1.5 flex-wrap mt-0.5">
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[l.status] || "bg-gray-100 text-gray-600"}`}>{l.status}</span>
                {l.temperature && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${tempStyles[l.temperature] || "bg-gray-100 text-gray-600"}`}>
                    {l.temperature} · {l.score}
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${stageStyles[l.stage] || "bg-gray-100 text-gray-600"}`}>
                  Stage: {titleCase(l.stage)}
                </span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <DetailRow icon={Phone} label="Mobile" value={l.mobile} verified={l.mobileVerified} />
            {l.email && <DetailRow icon={Mail} label="Email" value={l.email} verified={l.emailVerified} />}
            <DetailRow icon={MapPin} label="Location" value={`${place(l) || "—"}${l.pinCode ? ` – ${l.pinCode}` : ""}`} />
          </div>

          {/* Consultation */}
          {(l.consultation || l.bookingId) && (
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
              <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <CalendarCheck size={14} /> Consultation booked
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Info label="Type" value={l.consultation} />
                <Info label="Booking ID" value={l.bookingId} />
                <Info label="Date" value={fmtDate(l.consultDate)} />
                <Info label="Time" value={l.consultTime} />
              </div>
            </div>
          )}

          <Section title="Property">
            <Info label="Ownership" value={l.ownership} />
            <Info label="Owner permission" value={l.ownerPermission} />
            <Info label="Property type" value={l.propertyType} />
            <Info label="Panels on" value={l.panelsOn} />
            <Info label="Roof space" value={l.roofSpace} />
          </Section>

          <Section title="Requirement">
            <Info label="Monthly bill" value={inr(l.monthlyBill)} />
            <Info label="Main goal" value={l.mainGoal} />
            <Info label="Power cuts" value={l.powerCuts} />
            <Info label="Install when" value={l.installWhen} />
            <Info label="Payment" value={l.payment} />
            <Info label="Language" value={l.language} />
          </Section>

          <Section title="Recommended Plan">
            <Info label="System size" value={l.systemKw != null ? `${l.systemKw} kW` : ""} />
            <Info label="Panels" value={l.panels} />
            <Info label="Total cost" value={l.totalCost != null ? inr(l.totalCost) : ""} />
            <Info label="Subsidy" value={l.subsidy != null ? inr(l.subsidy) : ""} />
            <Info label="Net investment" value={l.investment != null ? inr(l.investment) : ""} />
            <Info label="Monthly saving" value={l.monthlySaving != null ? inr(l.monthlySaving) : ""} />
            <Info label="25-year savings" value={l.savings25y != null ? inr(l.savings25y) : ""} />
            <Info label="Payback" value={l.paybackYears != null ? `${l.paybackYears} years` : ""} />
          </Section>

          <Section title="Activity">
            <Info label="First contact" value={fmt(l.createdAt)} />
            <Info label="Last update" value={fmt(l.updatedAt)} />
          </Section>

          {/* Status selector */}
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Mark as</p>
            <div className="flex gap-2">
              {STATUSES.map((s) => {
                const active = l.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => onStatusChange?.(l.id, s)}
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
            href={`tel:${l.mobile}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
          >
            <Phone size={16} /> Call
          </a>
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700"
          >
            <MessageCircle size={16} /> WhatsApp
          </a>
          {l.email && (
            <a
              href={`mailto:${l.email}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700"
            >
              <Mail size={16} /> Email
            </a>
          )}
        </div>
      </aside>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">{children}</div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, verified }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-9 h-9 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
        <Icon size={16} />
      </span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-800 flex items-center gap-1.5">
          {value}
          {verified && (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-brand-700">
              <CheckCircle2 size={12} /> Verified
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  const empty = value === null || value === undefined || value === "";
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-sm mt-0.5 ${empty ? "text-gray-300" : "text-gray-800"}`}>{empty ? "—" : value}</p>
    </div>
  );
}
