// Mock inquiry data. Each object matches the public consultation form fields:
// fullName, phone, email, city, serviceType, monthlyBill, message
// When we integrate the live form/DB, replace this array with a fetch and
// keep the same shape so the UI needs no changes.

export const SERVICE_TYPES = ["Residential (Home)", "Commercial"];

export const BILL_RANGES = [
  "₹0 – ₹1,500",
  "₹1,500 – ₹3,000",
  "₹3,000 – ₹5,000",
  "₹5,000 – ₹10,000",
  "₹10,000+",
];

export const STATUSES = ["New", "Read", "Replied"];

export const inquiries = [
  {
    id: 1,
    fullName: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "9876543210",
    city: "Pune",
    serviceType: "Residential (Home)",
    monthlyBill: "₹3,000 – ₹5,000",
    message: "Interested in rooftop solar for a 3BHK.",
    date: "2024-05-20T10:30:00",
    status: "New",
  },
  {
    id: 2,
    fullName: "Michael Brown",
    email: "michael.b@example.com",
    phone: "9876501234",
    city: "Mumbai",
    serviceType: "Commercial",
    monthlyBill: "₹10,000+",
    message: "Warehouse rooftop, ~50kW requirement.",
    date: "2024-05-20T09:15:00",
    status: "Read",
  },
  {
    id: 3,
    fullName: "Emily Davis",
    email: "emily.d@example.com",
    phone: "9988776655",
    city: "Bengaluru",
    serviceType: "Residential (Home)",
    monthlyBill: "₹1,500 – ₹3,000",
    message: "Do you handle net-metering paperwork?",
    date: "2024-05-19T16:45:00",
    status: "Replied",
  },
  {
    id: 4,
    fullName: "David Wilson",
    email: "david.w@example.com",
    phone: "9123456780",
    city: "Hyderabad",
    serviceType: "Residential (Home)",
    monthlyBill: "₹5,000 – ₹10,000",
    message: "Existing panels, need maintenance quote.",
    date: "2024-05-19T14:20:00",
    status: "Read",
  },
  {
    id: 5,
    fullName: "Jessica Taylor",
    email: "jessica.t@example.com",
    phone: "9001122334",
    city: "Chennai",
    serviceType: "Commercial",
    monthlyBill: "₹10,000+",
    message: "Multi-site rollout across 4 branches.",
    date: "2024-05-18T11:05:00",
    status: "New",
  },
];

// Recent inquiries, newest first — used by the notification bell.
export function getRecentInquiries(limit = 6, rows = inquiries) {
  return [...rows]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

// Short relative time, e.g. "2h ago", "3d ago".
export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

// Builds the "Inquiries Overview" series straight from the real inquiries:
// counts how many came in on each day over the last `days` days.
// When the live DB is wired, pass the fetched rows in as `rows`.
export function buildOverview(days = 30, rows = inquiries) {
  // Count inquiries per calendar day (YYYY-MM-DD key).
  const counts = {};
  for (const inq of rows) {
    const key = new Date(inq.date).toISOString().slice(0, 10);
    counts[key] = (counts[key] || 0) + 1;
  }

  // Anchor the window on the most recent inquiry so demo data is visible;
  // with live data, swap `anchor` for `new Date()` (today).
  const latest = rows.reduce(
    (max, inq) => (new Date(inq.date) > max ? new Date(inq.date) : max),
    new Date(0)
  );
  const anchor = latest > new Date(0) ? latest : new Date();

  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(anchor);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    series.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      inquiries: counts[key] || 0,
    });
  }
  return series;
}

// Blog categories are managed by the owner — see src/data/categories.js.

export const POST_STATUSES = ["Published", "Draft"];

// Recent blog posts. Shape matches the public blog card:
// cover, category, title, excerpt, author, readTime, date, status
export const recentPosts = [
  {
    id: 1,
    title: "How the ₹78,000 Rooftop Solar Subsidy Actually Works",
    excerpt:
      "₹30,000/kW for the first 2 kW, ₹18,000 for the 3rd — capped at ₹78,000 and paid straight to your bank account after commissioning.",
    category: "PM Surya Ghar",
    author: "Arjun Mehta",
    readTime: "9 min read",
    cover: "/blog/blog-cost.jpg",
    date: "Jun 2, 2026",
    status: "Published",
  },
  {
    id: 2,
    title: "Is Rooftop Solar Worth It for a ₹3,000/month Bill?",
    excerpt:
      "Payback maths for a typical 3 kW residential system, including subsidy and net-metering savings.",
    category: "Solar Basics",
    author: "Priya Nair",
    readTime: "6 min read",
    cover: "",
    date: "May 28, 2026",
    status: "Published",
  },
  {
    id: 3,
    title: "Net Metering Explained: Selling Power Back to the Grid",
    excerpt:
      "How export credits are calculated and what paperwork your DISCOM needs.",
    category: "Subsidy & Finance",
    author: "Arjun Mehta",
    readTime: "7 min read",
    cover: "",
    date: "May 22, 2026",
    status: "Published",
  },
  {
    id: 4,
    title: "Monsoon Maintenance Checklist for Solar Panels",
    excerpt: "Five quick checks to keep generation high through the rainy season.",
    category: "Maintenance",
    author: "Priya Nair",
    readTime: "4 min read",
    cover: "",
    date: "May 18, 2026",
    status: "Draft",
  },
];
