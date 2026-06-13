"use client";

const tones = {
  teal: "bg-brand-100 text-brand-600",
  green: "bg-green-100 text-green-600",
  amber: "bg-amber-100 text-amber-600",
  blue: "bg-steel-100 text-steel-600",
};

export default function StatCard({ title, value, sub, tone = "teal", icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${tones[tone]}`}>
          {Icon && <Icon size={22} />}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      {sub && <p className="mt-3 text-sm text-gray-400">{sub}</p>}
    </div>
  );
}
