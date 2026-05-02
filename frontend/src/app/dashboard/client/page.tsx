"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { motion } from "framer-motion";
import { Search, Calendar, Star, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ClientHomePage() {
  const { user } = useAuth();
  const tier = useDeviceTier();

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
    </div>
  );
}
