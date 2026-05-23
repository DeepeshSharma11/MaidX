"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Calendar, ClipboardList, Star, ArrowRight, Loader2, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface Booking {
  id: string;
  client_name: string;
  booking_date: string;
  start_time: string;
  total_hours: number;
  total_price: number;
  status: string;
}

const colorMap: Record<string, { bg: string; iconColor: string }> = {
  indigo: {
    bg: "bg-indigo-100 dark:bg-indigo-500/20",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    bg: "bg-amber-100 dark:bg-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
};

export default function MaidDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initDashboard() {
      try {
        const profileRes = await api.get("/profile");
        if (!profileRes.data.phone) {
          router.push("/dashboard/maid/profile?onboard=true");
          return;
        }

        const bookingsRes = await api.get("/bookings");
        const list = bookingsRes.data.bookings || [];
        const upcomingJobs = list.filter(
          (b: Booking) => b.status === "pending" || b.status === "confirmed"
        ).slice(0, 3); // show up to 3 latest
        setUpcoming(upcomingJobs);
      } catch (err) {
        console.error("Dashboard init error:", err);
      } finally {
        setLoading(false);
      }
    }
    initDashboard();
  }, [router]);

  return (
    <div className="max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
          Welcome, {user?.full_name || "Professional"} 💼
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">Manage your schedule and bookings</p>

        <div className="grid sm:grid-cols-3 gap-5 mb-10">
          {[
            { icon: Calendar, title: "My Schedule", desc: "Set your availability", href: "/dashboard/maid/schedule", color: "indigo" },
            { icon: ClipboardList, title: "Bookings", desc: "View & manage requests", href: "/dashboard/maid/bookings", color: "emerald" },
            { icon: Star, title: "My Reviews", desc: "See client feedback", href: "/dashboard/maid/profile", color: "amber" },
          ].map((card, i) => {
            const styles = colorMap[card.color] || colorMap.indigo;
            return (
              <Link
                key={i}
                href={card.href}
                className="group p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl ${styles.bg} flex items-center justify-center mb-4`}>
                  <card.icon className={`w-5 h-5 ${styles.iconColor}`} />
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">{card.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{card.desc}</p>
                <ArrowRight className="w-4 h-4 mt-3 text-zinc-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </Link>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Upcoming Bookings</h2>
              {loading ? (
                <div className="flex py-4"><Loader2 className="w-5 h-5 animate-spin text-emerald-500" /></div>
              ) : upcoming.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No upcoming bookings.</p>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((booking) => (
                    <div key={booking.id} className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/60">
                      <div className="min-w-0 mr-3">
                        <p className="font-semibold text-zinc-900 dark:text-white text-sm truncate">{booking.client_name}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-emerald-500" /> {new Date(booking.booking_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-500" /> {booking.start_time}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        booking.status === "confirmed" 
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Link href="/dashboard/maid/bookings" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-4 flex items-center gap-1 hover:underline">
              View all bookings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Rating</h2>
            <p className="text-3xl font-bold text-zinc-900 dark:text-white">—</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">No reviews yet</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
