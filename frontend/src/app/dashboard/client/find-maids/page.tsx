"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import { MapPin, Search, Star, Clock, Filter, ChevronRight, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { motion } from "framer-motion";

// SSR disabled — Leaflet needs window
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });

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
  "bg-indigo-500", "bg-violet-500", "bg-pink-500", "bg-emerald-500",
  "bg-amber-500", "bg-cyan-500"
];

export default function FindMaidsPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | undefined>();
  const [activeFilter, setActiveFilter] = useState("All");
  const [showMap, setShowMap] = useState(true);
  const [searchRadius, setSearchRadius] = useState(5);
  
  const [maids, setMaids] = useState<Maid[]>([]);
  const [loading, setLoading] = useState(false);
  const tier = useDeviceTier();

  const fetchMaids = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (location) {
        params.append("lat", location.lat.toString());
        params.append("lng", location.lng.toString());
      }
      params.append("radius", searchRadius.toString());
      if (activeFilter !== "All") {
        params.append("skill", activeFilter);
      }
      
      const { data } = await api.get(`/maids?${params.toString()}`);
      setMaids(data.maids || []);
    } catch (err) {
      console.error("Error fetching maids:", err);
    } finally {
      setLoading(false);
    }
  }, [location, searchRadius, activeFilter]);

  useEffect(() => {
    fetchMaids();
  }, [fetchMaids]);

  const ItemWrapper = tier === "low" ? "div" : motion.div;
  const animProps = tier === "low" ? {} : {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2 }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Mobile-first sticky top bar */}
      <div className="sticky top-0 z-20 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between gap-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
            <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
              {location?.address ?? "Set your location to find maids nearby"}
            </p>
          </div>
          <button
            onClick={() => setShowMap(v => !v)}
            className="shrink-0 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1.5 rounded-lg"
          >
            {showMap ? "Hide map" : "Show map"}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* Map Section */}
        {showMap && (
          <div>
            <p className="text-xs text-zinc-500 mb-2">📍 Tap the map or drag the pin to set your location</p>
            <LocationPicker
              value={location}
              onChange={setLocation}
              height="240px"
              zoom={13}
            />
          </div>
        )}

        {/* Search radius */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Search radius</span>
            <span className="text-sm font-bold text-indigo-600">{searchRadius} km</span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            value={searchRadius}
            onChange={e => setSearchRadius(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>

        {/* Skill filters — horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
          {SKILL_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `${maids.length} maids available`}
          </p>
          <button className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <Filter className="w-3.5 h-3.5" />
            Sort by rating
          </button>
        </div>

        {/* Maid Cards */}
        <div className="space-y-3 pb-20">
          {!loading && maids.map((maid, i) => (
            <ItemWrapper
              key={maid.id}
              {...animProps}
              transition={tier !== "low" ? { delay: i * 0.05 } : undefined}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 active:scale-[0.99] transition-transform cursor-pointer"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-xl ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {maid.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">{maid.name}</h3>
                    {maid.isVerified && (
                      <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{maid.rating}</span>
                      <span className="text-xs text-zinc-400">({maid.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <MapPin className="w-3 h-3" />
                      {maid.distance}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {maid.skills.map(s => (
                      <span key={s} className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">₹{maid.hourlyRate}</p>
                  <p className="text-xs text-zinc-400">/hour</p>
                  <button className="mt-2 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium">
                    Book
                  </button>
                </div>
              </div>
            </ItemWrapper>
          ))}
        </div>
      </div>
    </div>
  );
}
