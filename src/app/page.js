"use client";

import { useState } from "react";
import { Users, FileText, MessageSquare, BadgeCheck } from "lucide-react";
import DashboardShell, { useGlobalSearch } from "@/components/DashboardShell";
import StatCard from "@/components/StatCard";
import InquiriesTable from "@/components/InquiriesTable";
import QuickActions from "@/components/QuickActions";
import InquiriesChart from "@/components/InquiriesChart";
import RecentPosts from "@/components/RecentPosts";
import AddBlogPanel from "@/components/AddBlogPanel";
import { useToast } from "@/components/Toast";
import { inquiries, recentPosts } from "@/data/inquiries";

function DashboardContent() {
  const { query } = useGlobalSearch();
  const toast = useToast();
  const [blogPanelOpen, setBlogPanelOpen] = useState(false);

  // Live stats derived from the actual data.
  const newCount = inquiries.filter((i) => i.status === "New").length;
  const publishedCount = recentPosts.filter((p) => p.status === "Published").length;
  const stats = [
    { title: "Total Inquiries", value: String(inquiries.length), sub: `${newCount} new`, tone: "teal", icon: Users },
    { title: "Blog Posts", value: String(recentPosts.length), sub: `${publishedCount} published`, tone: "green", icon: FileText },
    { title: "New Leads", value: String(newCount), sub: "awaiting reply", tone: "amber", icon: MessageSquare },
    { title: "Replied", value: String(inquiries.filter((i) => i.status === "Replied").length), sub: "this period", tone: "blue", icon: BadgeCheck },
  ];

  function handleQuickAction(key) {
    if (key === "new-post") setBlogPanelOpen(true);
  }

  function handleCreatePost(payload) {
    // Integration point: send `payload` to the blog API.
    console.log("New blog post:", payload);
    toast(
      payload.status === "Published" ? "Blog post published!" : "Draft saved.",
      "success"
    );
  }

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

      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
        <div className="xl:col-span-8">
          <InquiriesChart />
        </div>
        <div className="xl:col-span-4">
          <QuickActions onAction={handleQuickAction} />
        </div>
      </div>

      {/* Recent Blog Posts */}
      <div className="mt-6">
        <RecentPosts />
      </div>

      <AddBlogPanel
        open={blogPanelOpen}
        onClose={() => setBlogPanelOpen(false)}
        onSubmit={handleCreatePost}
      />
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
