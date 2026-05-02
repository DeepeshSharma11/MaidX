"use client";

import { useEffect, useState } from "react";
import { Users, BookOpen, AlertCircle, User, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { motion } from "framer-motion";

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const tier = useDeviceTier();
  const [stats, setStats] = useState({ total_users: 0, active_maids: 0, total_bookings: 0, open_tickets: 0, recent_activity: [] as any[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await api.get("/admin/stats");
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Users", value: stats.total_users, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Active Maids", value: stats.active_maids, icon: User, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Bookings", value: stats.total_bookings, icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Open Tickets", value: stats.open_tickets, icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  // Disable animations for low tier devices
  const CardWrapper = tier === "low" ? "div" : motion.div;
  const animProps = tier === "low" ? {} : {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin Overview</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Welcome back, {user?.full_name || 'Admin'}</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <CardWrapper
            key={stat.label}
            {...animProps}
            transition={tier !== "low" ? { delay: idx * 0.1 } : undefined}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</p>
            </div>
          </CardWrapper>
        ))}
      </div>
      {/* Recent Activity */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {stats.recent_activity && stats.recent_activity.length > 0 ? (
            stats.recent_activity.map((act: any) => {
              const date = new Date(act.created_at);
              const now = new Date();
              const diffMs = now.getTime() - date.getTime();
              const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
              const diffMins = Math.floor(diffMs / (1000 * 60));
              const timeStr = diffHours > 24 ? `${Math.floor(diffHours/24)} days ago` : diffHours > 0 ? `${diffHours} hours ago` : `${diffMins} mins ago`;

              return (
                <div key={act.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0" />
                  <div>
                    <p className="text-sm text-zinc-900 dark:text-white" dangerouslySetInnerHTML={{__html: act.text.replace(/by (.*)/, 'by <strong>$1</strong>')}}></p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{timeStr}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-zinc-500">No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Ensure User is imported if used (we need to import it since I missed it above)
// I will quickly patch it in the file.
