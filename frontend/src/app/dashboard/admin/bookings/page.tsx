"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { motion } from "framer-motion";
import { BookOpen, Calendar, Clock, Loader2 } from "lucide-react";

interface Booking {
  id: string;
  client_name: string;
  maid_name: string;
  booking_date: string;
  start_time: string;
  hours: number;
  total_amount: number;
  status: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const tier = useDeviceTier();

  useEffect(() => {
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
    fetchBookings();
  }, []);

  const ItemWrapper = tier === "low" ? "div" : motion.div;
  const animProps = tier === "low" ? {} : {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.2 }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "confirmed": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "completed": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "cancelled": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400";
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6 pb-20 md:pb-8">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">All Bookings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">System-wide booking overview.</p>
      </header>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          <div className="col-span-3">Client</div>
          <div className="col-span-3">Maid</div>
          <div className="col-span-3">Schedule</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Amt</div>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {bookings.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No bookings found.</div>
          ) : (
            bookings.map((booking, idx) => (
              <ItemWrapper
                key={booking.id}
                {...animProps}
                transition={tier !== "low" ? { delay: idx * 0.05 } : undefined}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center"
              >
                <div className="col-span-1 md:col-span-3">
                  <p className="text-xs text-zinc-500 md:hidden mb-1">Client:</p>
                  <p className="font-medium text-sm text-zinc-900 dark:text-white">{booking.client_name}</p>
                </div>
                
                <div className="col-span-1 md:col-span-3">
                  <p className="text-xs text-zinc-500 md:hidden mb-1">Maid:</p>
                  <p className="font-medium text-sm text-zinc-900 dark:text-white">{booking.maid_name}</p>
                </div>
                
                <div className="col-span-1 md:col-span-3 text-sm text-zinc-600 dark:text-zinc-400">
                   <p className="text-xs text-zinc-500 md:hidden mb-1">Schedule:</p>
                  <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(booking.booking_date).toLocaleDateString()}</div>
                  <div className="flex items-center gap-1.5 mt-0.5"><Clock className="w-3.5 h-3.5" /> {booking.start_time} ({booking.hours}h)</div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <p className="text-xs text-zinc-500 md:hidden mb-1">Status:</p>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="col-span-1 md:col-span-1 md:text-right">
                  <p className="text-xs text-zinc-500 md:hidden mb-1">Amount:</p>
                  <p className="font-bold text-indigo-600 dark:text-indigo-400">₹{booking.total_amount}</p>
                </div>
              </ItemWrapper>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
