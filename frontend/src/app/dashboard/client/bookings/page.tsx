"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { motion } from "framer-motion";
import { Calendar, Clock, Loader2 } from "lucide-react";

interface Booking {
  id: string;
  maid_name: string;
  booking_date: string;
  start_time: string;
  hours: number;
  total_amount: number;
  status: string;
  notes: string;
}

export default function ClientBookingsPage() {
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
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":   return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "confirmed": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "completed": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "cancelled": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:          return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400";
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">My Bookings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your past and upcoming maid services.</p>
      </header>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <Calendar className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 dark:text-zinc-400">You have no bookings yet.</p>
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
                  <h3 className="font-semibold text-zinc-900 dark:text-white">{booking.maid_name}</h3>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">₹{booking.total_amount}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <p className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(booking.booking_date).toLocaleDateString()}</p>
                <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> {booking.start_time} ({booking.hours} hours)</p>
              </div>

              {booking.notes && (
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-sm">
                  <p className="text-zinc-500 dark:text-zinc-500 text-xs mb-1">Notes</p>
                  <p className="text-zinc-700 dark:text-zinc-300">{booking.notes}</p>
                </div>
              )}
            </ItemWrapper>
          ))}
        </div>
      )}
    </div>
  );
}
