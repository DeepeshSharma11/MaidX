"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { motion } from "framer-motion";
import { Calendar, Clock, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface Booking {
  id: string;
  client_name: string;
  booking_date: string;
  start_time: string;
  hours: number;
  total_amount: number;
  status: string;
  notes: string;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  pending:   { label: "Pending",   cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",   icon: AlertCircle },
  confirmed: { label: "Confirmed", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",       icon: CheckCircle2 },
  completed: { label: "Completed", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",           icon: XCircle },
};

const TAB_STATUSES = ["all", "pending", "confirmed", "completed", "cancelled"];

export default function MaidBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const tier = useDeviceTier();

  async function fetchBookings() {
    try {
      const { data } = await api.get("/bookings");
      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBookings(); }, []);

  const handleAction = async (id: string, action: "confirm" | "cancel" | "complete") => {
    setActionLoading(id + action);
    try {
      await api.patch(`/bookings/${id}/${action}`);
      await fetchBookings();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const ItemWrapper = tier === "low" ? "div" : motion.div;
  const animProps = tier === "low" ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 } };

  const filtered = activeTab === "all" ? bookings : bookings.filter(b => b.status === activeTab);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>;

  return (
    <div className="p-4 md:p-8 space-y-5 pb-24 md:pb-8 max-w-5xl mx-auto md:mx-0">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">My Jobs</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">View and manage booking requests from clients.</p>
      </header>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
        {TAB_STATUSES.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "bg-emerald-600 text-white"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
            }`}>{tab}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <Calendar className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">No jobs found</p>
          <p className="text-sm text-zinc-500">
            {activeTab === "all" ? "You have no booking requests yet." : `No ${activeTab} bookings.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((booking, idx) => {
            const s = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
            const StatusIcon = s.icon;
            return (
              <ItemWrapper key={booking.id} {...animProps} transition={tier !== "low" ? { delay: idx * 0.05 } : undefined}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col gap-4">

                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 mr-3">
                    <h3 className="font-semibold text-zinc-900 dark:text-white truncate">{booking.client_name || "—"}</h3>
                    <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${s.cls}`}>
                      <StatusIcon className="w-3 h-3" /> {s.label}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{booking.total_amount}</p>
                    <p className="text-xs text-zinc-400">{booking.hours}h</p>
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4 shrink-0 text-emerald-400" />
                    {new Date(booking.booking_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4 shrink-0 text-emerald-400" />
                    {booking.start_time} · {booking.hours} hrs
                  </span>
                </div>

                {/* Notes */}
                {booking.notes && (
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-sm">
                    <p className="text-zinc-400 text-xs mb-1">Notes</p>
                    <p className="text-zinc-700 dark:text-zinc-300 line-clamp-2">{booking.notes}</p>
                  </div>
                )}

                {/* Actions */}
                {booking.status === "pending" && (
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-2">
                    <button onClick={() => handleAction(booking.id, "confirm")} disabled={!!actionLoading}
                      className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                      {actionLoading === booking.id + "confirm" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Accept</>}
                    </button>
                    <button onClick={() => handleAction(booking.id, "cancel")} disabled={!!actionLoading}
                      className="flex items-center justify-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                      {actionLoading === booking.id + "cancel" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4" /> Decline</>}
                    </button>
                  </div>
                )}
                {booking.status === "confirmed" && (
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <button onClick={() => handleAction(booking.id, "complete")} disabled={!!actionLoading}
                      className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                      {actionLoading === booking.id + "complete" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Mark Complete</>}
                    </button>
                  </div>
                )}
              </ItemWrapper>
            );
          })}
        </div>
      )}
    </div>
  );
}
