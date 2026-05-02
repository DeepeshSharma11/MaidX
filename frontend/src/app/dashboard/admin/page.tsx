"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Users, CalendarDays, AlertCircle, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();

  const stats = [
    { icon: Users, label: "Total Users", value: "—", color: "indigo" },
    { icon: CalendarDays, label: "Total Bookings", value: "—", color: "emerald" },
    { icon: AlertCircle, label: "Open Tickets", value: "—", color: "amber" },
    { icon: BarChart3, label: "Revenue", value: "—", color: "rose" },
  ];

  return (
    <div className="max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">Admin Panel 🛡️</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">Platform overview and management</p>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
            >
              <div className={`w-10 h-10 rounded-xl bg-${s.color}-100 dark:bg-${s.color}-500/20 flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 text-${s.color}-600 dark:text-${s.color}-400`} />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{s.label}</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Placeholder sections */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Recent Registrations</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Connect Supabase to see live data.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Recent Tickets</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No open tickets.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
