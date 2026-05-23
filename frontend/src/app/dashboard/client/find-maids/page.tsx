"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import { MapPin, Star, Filter, Loader2, Map, List, X, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { motion } from "framer-motion";


const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[220px] bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
    </div>
  ),
});

interface Maid {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  hourlyRate: number;
  skills: string[];
  avatar: string;
  isVerified: boolean;
}

const SKILL_FILTERS = ["All", "Cleaning", "Cooking", "Laundry", "Baby Care", "Elderly Care"];
const AVATAR_COLORS = [
  "bg-indigo-500", "bg-violet-500", "bg-pink-500",
  "bg-emerald-500", "bg-amber-500", "bg-cyan-500",
];

export default function FindMaidsPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | undefined>();
  const [activeFilter, setActiveFilter] = useState("All");
  const [showMap, setShowMap] = useState(true);
  const [searchRadius, setSearchRadius] = useState(5);
  const [maids, setMaids] = useState<Maid[]>([]);
  const [loading, setLoading] = useState(false);
  const tier = useDeviceTier();

  // Booking states
  const [selectedMaid, setSelectedMaid] = useState<Maid | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("09:00");
  const [bookingHours, setBookingHours] = useState(2);
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const todayStr = typeof window !== "undefined" ? new Date().toISOString().split("T")[0] : "";

  // Initialize booking date to tomorrow
  useEffect(() => {
    if (selectedMaid) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setBookingDate(tomorrow.toISOString().split("T")[0]);
    }
  }, [selectedMaid]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaid) return;
    if (!bookingDate) {
      setBookingError("Please select a booking date.");
      return;
    }
    setSubmittingBooking(true);
    setBookingError("");
    try {
      const totalAmount = selectedMaid.hourlyRate * bookingHours;
      await api.post("/bookings", {
        maid_id: selectedMaid.id,
        booking_date: bookingDate,
        start_time: bookingTime,
        hours: bookingHours,
        total_amount: totalAmount,
        notes: bookingNotes || ""
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setSelectedMaid(null);
        setBookingSuccess(false);
        setBookingDate("");
        setBookingTime("09:00");
        setBookingHours(2);
        setBookingNotes("");
      }, 2200);
    } catch (err: any) {
      setBookingError(err.response?.data?.detail ?? "Failed to create booking. Please try again.");
    } finally {
      setSubmittingBooking(false);
    }
  };


  const fetchMaids = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (location) {
        params.append("lat", location.lat.toString());
        params.append("lng", location.lng.toString());
      }
      params.append("radius", searchRadius.toString());
      if (activeFilter !== "All") params.append("skill", activeFilter);
      const { data } = await api.get(`/maids?${params.toString()}`);
      setMaids(data.maids || []);
    } catch (err) {
      console.error("Error fetching maids:", err);
    } finally {
      setLoading(false);
    }
  }, [location, searchRadius, activeFilter]);

  useEffect(() => { fetchMaids(); }, [fetchMaids]);

  const ItemWrapper = tier === "low" ? "div" : motion.div;
  const animProps = tier === "low" ? {} : {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2 },
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-x-hidden">
      {/* ── Page Header ── */}
      <div className="px-4 pt-5 pb-3 bg-zinc-50 dark:bg-zinc-950">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Find Maids</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {location?.address
                ? <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-indigo-500" />{location.address}</span>
                : "Set location to search nearby"}
            </p>
          </div>
          {/* Map toggle button */}
          <button
            onClick={() => setShowMap(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              showMap
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
            }`}
          >
            {showMap ? <><List className="w-3.5 h-3.5" /> List only</> : <><Map className="w-3.5 h-3.5" /> Show map</>}
          </button>
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 space-y-4 pb-24 md:pb-6">

        {/* Map */}
        {showMap && (
          <div className="w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm" style={{ maxWidth: "100%" }}>
            <LocationPicker value={location} onChange={setLocation} height="220px" zoom={13} />
          </div>
        )}

        {/* Radius Slider */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Search radius</span>
            <span className="text-sm font-bold text-indigo-600">{searchRadius} km</span>
          </div>
          <input
            type="range" min={1} max={20} value={searchRadius}
            onChange={e => setSearchRadius(Number(e.target.value))}
            className="w-full h-1.5 rounded-full accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
            <span>1 km</span><span>20 km</span>
          </div>
        </div>

        {/* Skill Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          {SKILL_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === f
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
              }`}
            >{f}</button>
          ))}
        </div>

        {/* Results Count + Sort */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {loading
              ? <span className="flex items-center gap-2 text-zinc-500"><Loader2 className="w-4 h-4 animate-spin" />Searching...</span>
              : <><span className="text-indigo-600">{maids.length}</span> maids available</>}
          </p>
          <button className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 transition-colors">
            <Filter className="w-3.5 h-3.5" /> Sort by rating
          </button>
        </div>

        {/* Empty State */}
        {!loading && maids.length === 0 && (
          <div className="text-center py-14 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-7 h-7 text-zinc-400" />
            </div>
            <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">No maids found nearby</p>
            <p className="text-sm text-zinc-500 max-w-xs mx-auto">
              Try increasing the search radius or changing the skill filter.
            </p>
          </div>
        )}

        {/* Maid Cards */}
        <div className="space-y-3">
          {!loading && maids.map((maid, i) => (
            <ItemWrapper
              key={maid.id}
              {...animProps}
              transition={tier !== "low" ? { delay: i * 0.04 } : undefined}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 active:scale-[0.985] transition-transform cursor-pointer"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-xl ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-base shrink-0`}>
                  {maid.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-zinc-900 dark:text-white text-sm leading-tight">{maid.name}</h3>
                    {maid.isVerified && (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {/* Rating + Distance */}
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{maid.rating}</span>
                      <span className="text-xs text-zinc-400">({maid.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <MapPin className="w-3 h-3" />{maid.distance}
                    </div>
                  </div>

                  {/* Skill Tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {maid.skills.map(s => (
                      <span key={s} className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price + Book */}
                <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                  <div>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">₹{maid.hourlyRate}</p>
                    <p className="text-[10px] text-zinc-400">/hour</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMaid(maid);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    Book
                  </button>
                </div>
              </div>
            </ItemWrapper>
          ))}
        </div>
      </div>

      {/* ── Booking Modal ── */}
      {selectedMaid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-6 relative"
          >
            {bookingSuccess ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Booking Requested! 🎉</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Your request has been sent to {selectedMaid.name}. They will review and accept shortly.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Book {selectedMaid.name}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Rate: ₹{selectedMaid.hourlyRate}/hour</p>
                  </div>
                  <button
                    onClick={() => setSelectedMaid(null)}
                    className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Error */}
                {bookingError && (
                  <div className="mt-4 px-4 py-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs">
                    {bookingError}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleCreateBooking} className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Date</label>
                      <input
                        type="date"
                        min={todayStr}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Start Time</label>
                      <input
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Duration (Hours)</label>
                    <select
                      value={bookingHours}
                      onChange={(e) => setBookingHours(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                        <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Notes / Special Instructions</label>
                    <textarea
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder="e.g. please bring cleaning supplies, wash kitchen area first..."
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none focus:border-transparent"
                    />
                  </div>

                  {/* Summary & Submit */}
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Total Price</p>
                      <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">₹{selectedMaid.hourlyRate * bookingHours}</p>
                    </div>
                    <button
                      type="submit"
                      disabled={submittingBooking}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {submittingBooking && <Loader2 className="w-4 h-4 animate-spin" />}
                      {submittingBooking ? "Booking..." : "Confirm Booking"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

