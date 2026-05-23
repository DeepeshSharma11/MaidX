"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Loader2, Star, X, CheckCircle2, MessageSquare } from "lucide-react";

interface Booking {
  id: string;
  maid_id: string;
  maid_name: string;
  booking_date: string;
  start_time: string;
  total_hours: number;
  total_price: number;
  status: string;
  notes: string;
}

interface ReviewState {
  bookingId: string;
  maidName: string;
  rating: number;
  comment: string;
  submitting: boolean;
  success: boolean;
  error: string;
}

const AVATAR_COLORS = [
  "bg-indigo-500", "bg-violet-500", "bg-pink-500",
  "bg-emerald-500", "bg-amber-500", "bg-cyan-500",
];

export default function ClientBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [review, setReview] = useState<ReviewState | null>(null);
  const tier = useDeviceTier();

  async function fetchBookings() {
    try {
      const { data } = await api.get("/bookings");
      const bks: Booking[] = data.bookings || [];
      setBookings(bks);

      // Check reviewed status for completed bookings
      const completed = bks.filter(b => b.status === "completed");
      const checks = await Promise.all(
        completed.map(b => api.get(`/reviews/check/${b.id}`).then(r => ({ id: b.id, reviewed: r.data.reviewed })))
      );
      const reviewed = new Set(checks.filter(c => c.reviewed).map(c => c.id));
      setReviewedIds(reviewed);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
    const handleUpdate = () => fetchBookings();
    window.addEventListener("bookings:updated", handleUpdate);
    return () => window.removeEventListener("bookings:updated", handleUpdate);
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setActionLoading(id);
    try {
      await api.patch(`/bookings/${id}/cancel`);
      await fetchBookings();
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const openReview = (b: Booking) => {
    setReview({
      bookingId: b.id,
      maidName: b.maid_name,
      rating: 5,
      comment: "",
      submitting: false,
      success: false,
      error: "",
    });
  };

  const submitReview = async () => {
    if (!review) return;
    setReview(r => r ? { ...r, submitting: true, error: "" } : r);
    try {
      await api.post("/reviews", {
        booking_id: review.bookingId,
        rating: review.rating,
        comment: review.comment,
      });
      setReview(r => r ? { ...r, success: true, submitting: false } : r);
      setReviewedIds(s => new Set([...s, review.bookingId]));
      setTimeout(() => setReview(null), 2000);
    } catch (err: any) {
      setReview(r => r ? { ...r, submitting: false, error: err.response?.data?.detail || "Failed to submit review." } : r);
    }
  };

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
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your past and upcoming helper services.</p>
      </header>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <Calendar className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 dark:text-zinc-400">You have no bookings yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((booking, idx) => {
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const initials = booking.maid_name?.slice(0, 2).toUpperCase() || "MD";
            const alreadyReviewed = reviewedIds.has(booking.id);

            return (
              <ItemWrapper
                key={booking.id}
                {...animProps}
                transition={tier !== "low" ? { delay: idx * 0.05 } : undefined}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${avatarColor} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 dark:text-white leading-tight">{booking.maid_name}</h3>
                    <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 shrink-0">₹{booking.total_price}</p>
                </div>

                {/* Info */}
                <div className="space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 shrink-0" />
                    {new Date(booking.booking_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" />
                    {booking.start_time} · {booking.total_hours}h
                  </p>
                </div>

                {booking.notes && (
                  <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {booking.notes}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-2 justify-end">
                  {/* Cancel */}
                  {(booking.status === "pending" || booking.status === "confirmed") && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={!!actionLoading}
                      className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === booking.id ? "Cancelling..." : "Cancel"}
                    </button>
                  )}

                  {/* Review */}
                  {booking.status === "completed" && !alreadyReviewed && (
                    <button
                      onClick={() => openReview(booking)}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Star className="w-3.5 h-3.5" /> Rate & Review
                    </button>
                  )}
                  {booking.status === "completed" && alreadyReviewed && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                    </span>
                  )}
                </div>
              </ItemWrapper>
            );
          })}
        </div>
      )}

      {/* ── Review Modal ── */}
      <AnimatePresence>
        {review && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6"
            >
              {review.success ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Review Submitted!</h3>
                  <p className="text-sm text-zinc-500">Thank you for your feedback.</p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Rate {review.maidName}</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">Your feedback helps others choose the right helper</p>
                    </div>
                    <button
                      onClick={() => setReview(null)}
                      className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Star Rating */}
                  <div className="flex justify-center gap-2 mb-5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setReview(r => r ? { ...r, rating: star } : r)}
                        className="transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          className={`w-9 h-9 transition-colors ${
                            star <= review.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-zinc-300 dark:text-zinc-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Rating Label */}
                  <p className="text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-4">
                    {["", "Poor", "Fair", "Good", "Very Good", "Excellent!"][review.rating]}
                  </p>

                  {/* Comment */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">
                      Comment (optional)
                    </label>
                    <textarea
                      value={review.comment}
                      onChange={e => setReview(r => r ? { ...r, comment: e.target.value } : r)}
                      placeholder="How was the service? Any feedback for the helper..."
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                    />
                  </div>

                  {/* Error */}
                  {review.error && (
                    <p className="text-xs text-red-500 mb-3">{review.error}</p>
                  )}

                  {/* Submit */}
                  <button
                    onClick={submitReview}
                    disabled={review.submitting}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {review.submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                    {review.submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
