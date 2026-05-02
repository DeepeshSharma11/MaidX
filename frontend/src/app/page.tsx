"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Search, CalendarDays, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="MaidX Logo" width={120} height={40} className="h-8 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-4">
            {authLoading ? (
              <div className="w-20 h-8 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-full"></div>
            ) : user ? (
              <Link href={`/dashboard/${user.role}`} className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full transition-colors flex items-center gap-2">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Log in
                </Link>
                <Link href="/signup" className="text-sm font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 -translate-y-12 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/20 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8 border border-indigo-200 dark:border-indigo-500/20"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Platform is live in your area
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white max-w-4xl mb-6"
            >
              Find trusted domestic help, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">instantly.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mb-10"
            >
              Connect with verified professionals for cleaning, cooking, and household chores. Transparent pricing, secure booking, and peace of mind.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <Link href={user ? (user.role === 'client' ? "/dashboard/client/find-maids" : `/dashboard/${user.role}`) : "/signup?role=client"} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full font-medium hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/25">
                <Search className="w-5 h-5" />
                Find a Maid
              </Link>
              {!user && (
                <Link href="/signup?role=maid" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-8 py-4 rounded-full font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all shadow-sm">
                  Join as Professional
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-zinc-900/50 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Verified Professionals",
                desc: "Every maid undergoes a strict background check and skills verification process."
              },
              {
                icon: CalendarDays,
                title: "Flexible Scheduling",
                desc: "Book instantly for a one-time clean or set up a recurring schedule that fits your life."
              },
              {
                icon: Star,
                title: "Transparent Ratings",
                desc: "Read honest reviews from real clients in your neighborhood before booking."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
