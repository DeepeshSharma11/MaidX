"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Search, CalendarDays, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ClientDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
          Welcome back, {user?.full_name || "there"} 👋
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">Find and book trusted domestic help</p>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-5 mb-10">
          {[
            { icon: Search, title: "Find a Maid", desc: "Search by skills & location", href: "/dashboard/client/search", color: "indigo" },
            { icon: CalendarDays, title: "My Bookings", desc: "View upcoming sessions", href: "/dashboard/client/bookings", color: "emerald" },
            { icon: Star, title: "My Reviews", desc: "Rate past services", href: "/dashboard/client/bookings", color: "amber" },
          ].map((card, i) => (
            <Link
              key={i}
              href={card.href}
              className="group p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl bg-${card.color}-100 dark:bg-${card.color}-500/20 flex items-center justify-center mb-4`}>
                <card.icon className={`w-5 h-5 text-${card.color}-600 dark:text-${card.color}-400`} />
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">{card.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{card.desc}</p>
              <ArrowRight className="w-4 h-4 mt-3 text-zinc-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>

        {/* Placeholder stats */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Recent Activity</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No bookings yet. Start by searching for a maid!</p>
        </div>
      </motion.div>
    </div>
  );
}
