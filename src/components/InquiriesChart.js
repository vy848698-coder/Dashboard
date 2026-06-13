"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { inquiriesOverview } from "@/data/inquiries";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-white shadow-lg border border-gray-100 px-3 py-2 text-sm">
      <p className="font-semibold text-gray-900">
        {payload[0].value} <span className="font-normal text-gray-500">Inquiries</span>
      </p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

export default function InquiriesChart() {
  const [range, setRange] = useState("Last 30 Days");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-900">Inquiries Overview</h2>
        <div className="relative">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="appearance-none text-sm border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
          >
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Last 90 Days</option>
          </select>
          <ChevronDown
            size={15}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      <div style={{ width: "100%", height: 288 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={inquiriesOverview} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="inqFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3ecf8e" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#3ecf8e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              interval={1}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="inquiries"
              stroke="#3ecf8e"
              strokeWidth={2.5}
              fill="url(#inqFill)"
              dot={{ r: 3, fill: "#fff", stroke: "#3ecf8e", strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
