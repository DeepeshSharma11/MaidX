"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { motion } from "framer-motion";
import { Calendar, Clock, Loader2 } from "lucide-react";

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

export default function MaidBookingsPage() {
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
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
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
    return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">My Jobs</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">View your upcoming and past bookings from clients.</p>
      </header>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <Calendar className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 dark:text-zinc-400">You have no booking requests yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((booking, idx) => (
            <ItemWrapper
              key={booking.id}
              {...animProps}
              transition={tier !== "low" ? { delay: idx * 0.05 } : undefined}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white">{booking.client_name}</h3>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{booking.total_amount}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <p className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(booking.booking_date).toLocaleDateString()}</p>
                <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> {booking.start_time} ({booking.hours} hours)</p>
              </div>

              {booking.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
                  <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-sm font-medium transition-colors">Accept</button>
                  <button className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 py-2 rounded-xl text-sm font-medium transition-colors">Decline</button>
                </div>
              )}
            </ItemWrapper>
          ))}
        </div>
      )}
    </div>
  );
}
