"use client";

import { motion } from "framer-motion";
import { Search, CalendarDays, ShieldCheck, Star, ArrowRight, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/Card";

export default function Home() {
  const { user } = useAuth();
  const tier = useDeviceTier();
  const isHighTier = tier === "high";

  // Use standard elements if tier is not high to avoid framer motion overhead
  const MotionH1 = isHighTier ? motion.h1 : "h1";
  const MotionP = isHighTier ? motion.p : "p";
  const MotionDiv = isHighTier ? motion.div : "div";

  const heroAnim = isHighTier ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: 0.1 }
  } : {};

  const subHeroAnim = isHighTier ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: 0.2 }
  } : {};

  const ctaAnim = isHighTier ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: 0.3 }
  } : {};

  const getFeatureAnim = (i: number) => isHighTier ? {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, delay: i * 0.1 }
  } : {};

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans selection:bg-indigo-500/30 flex flex-col justify-between">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex-1">
        {/* Background Gradients - Replaced heavy blur filter with CSS radial-gradient */}
        <div className="absolute top-0 -translate-y-12 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/15 dark:from-indigo-500/5 to-transparent rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center">
            <MotionH1
              {...heroAnim}
              className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white max-w-4xl mb-6"
            >
              Find trusted household help, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">instantly.</span>
            </MotionH1>

            <MotionP
              {...subHeroAnim}
              className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mb-10"
            >
              Easily hire local helpers for cleaning, cooking, laundry, and daily chores. Clear pricing, easy booking, and total safety.
            </MotionP>

            <MotionDiv
              {...ctaAnim}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <Link href={user ? (user.role === 'client' ? "/dashboard/client/find-maids" : `/dashboard/${user.role}`) : "/signup?role=client"} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full font-medium hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/25">
                <Search className="w-5 h-5" />
                Find a Helper
              </Link>
              {!user && (
                <Link href="/signup?role=maid" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-8 py-4 rounded-full font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all shadow-sm">
                  Join as Helper
                </Link>
              )}
            </MotionDiv>
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
                title: "Safety First",
                desc: "Every helper goes through a background check and skills check so you feel safe."
              },
              {
                icon: CalendarDays,
                title: "Easy Schedules",
                desc: "Book a helper whenever you need—for one time, or setup a regular daily/weekly plan."
              },
              {
                icon: Star,
                title: "Honest Feedback",
                desc: "See ratings and reviews written by other households in your neighborhood before you book."
              }
            ].map((feature, i) => (
              <MotionDiv
                key={i}
                {...getFeatureAnim(i)}
              >
                <Card variant="muted" hoverEffect roundedSize="3xl" className="h-full">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </Card>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">How it works</h2>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">Get help at home in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Select Location", desc: "Choose where you need help and set your distance radius." },
              { step: "2", title: "Choose a Helper", desc: "Compare profiles, services offered, rates, and customer reviews." },
              { step: "3", title: "Book & Relax", desc: "Schedule the date and time, verify details, and let us handle the rest." }
            ].map((item, idx) => (
              <Card key={idx} roundedSize="2xl" className="relative">
                <span className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">{item.step}</span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 mt-2">{item.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
