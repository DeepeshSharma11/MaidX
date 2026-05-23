"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { motion } from "framer-motion";
import { Search, Calendar, Star, ArrowRight, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ClientHomePage() {
  const { user } = useAuth();
  const tier = useDeviceTier();
  const router = useRouter();

  const [recommended, setRecommended] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(true);

  const AVATAR_COLORS = [
    "bg-indigo-500", "bg-violet-500", "bg-pink-500",
    "bg-emerald-500", "bg-amber-500", "bg-cyan-500",
  ];

  const ItemWrapper = tier === "low" ? "div" : motion.div;
  const animProps = tier === "low" ? {} : {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  const router = useRouter();

  useEffect(() => {
    async function checkProfile() {
      try {
        const { data } = await api.get("/profile");
        if (!data.phone) {
          router.push("/dashboard/client/profile?onboard=true");
        }
      } catch (err) {
        console.error(err);
      }
    }
    checkProfile();

    // Fetch recommended maids
    api.get("/reviews/recommended?limit=6")
      .then(r => setRecommended(r.data.recommended || []))
      .catch(() => {})
      .finally(() => setRecLoading(false));
  }, [router]);

  return (
    <div className="p-4 md:p-8 space-y-8 pb-24 md:pb-8 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
            Welcome, {user?.full_name?.split(' ')[0] || 'Guest'} 👋
          </h1>
          <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 mt-1">
            Find the best domestic help near you.
          </p>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ItemWrapper
          {...animProps}
          className="relative overflow-hidden bg-indigo-600 rounded-2xl p-6 md:p-8 text-white group hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="relative z-10">
            <Search className="w-8 h-8 mb-4 opacity-80" />
            <h2 className="text-xl font-bold mb-2">Find a Maid</h2>
            <p className="text-indigo-100 text-sm mb-6 max-w-xs">
              Search top-rated professionals for cleaning, cooking, and more.
            </p>
            <Link href="/dashboard/client/find-maids" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold group-hover:gap-3 transition-all">
              Search Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-8 right-12 w-32 h-32 bg-indigo-400/30 rounded-full blur-xl"></div>
        </ItemWrapper>

        <ItemWrapper
          {...animProps}
          transition={tier !== "low" ? { delay: 0.1 } : undefined}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between"
        >
          <div>
            <Calendar className="w-8 h-8 mb-4 text-emerald-500" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">My Bookings</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 max-w-xs">
              View your upcoming appointments and past service history.
            </p>
          </div>
          <Link href="/dashboard/client/bookings" className="inline-flex items-center gap-2 text-zinc-900 dark:text-white font-semibold hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
            View Bookings <ArrowRight className="w-4 h-4" />
          </Link>
        </ItemWrapper>
      </div>

      {/* Trust & Safety Banner */}
      <ItemWrapper
        {...animProps}
        transition={tier !== "low" ? { delay: 0.2 } : undefined}
        className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">Verified Professionals</h3>
          <p className="text-emerald-700 dark:text-emerald-300 text-xs mt-0.5">All our maids undergo strict background checks to ensure your safety and security.</p>
        </div>
      </ItemWrapper>

      {/* Recommended Helpers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Top Helpers</h2>
          </div>
          <Link href="/dashboard/client/find-maids" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            See all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : recommended.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No helpers available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommended.map((m, idx) => (
              <Link
                href="/dashboard/client/find-maids"
                key={m.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-start gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group"
              >
                <div className={`w-11 h-11 rounded-xl ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {m.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{m.name}</h3>
                    {m.isVerified && <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-semibold">✓</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{m.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">({m.reviews})</span>
                    {m.hourlyRate && <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 ml-auto">₹{m.hourlyRate}/hr</span>}
                  </div>
                  {m.skills.length > 0 && (
                    <p className="text-[10px] text-zinc-400 mt-1 truncate">{m.skills.slice(0, 3).join(" · ")}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
