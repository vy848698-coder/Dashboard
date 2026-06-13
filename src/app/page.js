"use client";

import { useEffect, useState } from "react";
import { Users, FileText, MessageSquare, BadgeCheck } from "lucide-react";
import DashboardShell, { useGlobalSearch } from "@/components/DashboardShell";
import StatCard from "@/components/StatCard";
import InquiriesTable from "@/components/InquiriesTable";
import InquiriesChart from "@/components/InquiriesChart";
import RecentPosts from "@/components/RecentPosts";
import { useInquiries } from "@/components/InquiriesProvider";
import { getPosts } from "@/data/posts";

function DashboardContent() {
  const { query } = useGlobalSearch();
  const { inquiries } = useInquiries();
  const [posts, setPosts] = useState([]);

  // Real blog posts from the DB for the stat card.
  useEffect(() => {
    let cancelled = false;
    getPosts()
      .then((list) => !cancelled && setPosts(list))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Live stats derived from the actual data.
  const newCount = inquiries.filter((i) => i.status === "New").length;
  const liveCount = posts.filter((p) => !p.hidden).length;
  const stats = [
    { title: "Total Inquiries", value: String(inquiries.length), sub: `${newCount} new`, tone: "teal", icon: Users },
    { title: "Blog Posts", value: String(posts.length), sub: `${liveCount} live on site`, tone: "green", icon: FileText },
    { title: "New Leads", value: String(newCount), sub: "awaiting reply", tone: "amber", icon: MessageSquare },
    { title: "Replied", value: String(inquiries.filter((i) => i.status === "Replied").length), sub: "this period", tone: "blue", icon: BadgeCheck },
  ];

  return (
    <>
      {/* Heading */}
      <div className="pt-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard 👋</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, Admin! Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* Inquiries table — full width, filtered by global search */}
      <div className="mt-6">
        <InquiriesTable query={query} />
      </div>

      {/* Chart — full width */}
      <div className="mt-6">
        <InquiriesChart />
      </div>

      {/* Recent Blog Posts */}
      <div className="mt-6">
        <RecentPosts />
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <DashboardShell searchPlaceholder="Search inquiries by name, city, email...">
      <DashboardContent />
    </DashboardShell>
  );
}

