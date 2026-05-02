"use client";

import { Users, BookOpen, AlertCircle, TrendingUp, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminOverviewPage() {
  const { user } = useAuth();

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin Overview</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Welcome back, {user?.full_name || 'Admin'}</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: "1,245", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Active Maids", value: "342", icon: User, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Bookings", value: "89", icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: "Open Tickets", value: "12", icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0" />
              <div>
                <p className="text-sm text-zinc-900 dark:text-white">New booking created by <strong>John Doe</strong></p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Ensure User is imported if used (we need to import it since I missed it above)
// I will quickly patch it in the file.
