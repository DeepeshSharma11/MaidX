"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, CalendarDays, ShieldCheck, Star, ArrowRight, Shield, ChevronDown, ChevronUp, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/Card";
import PriceCalculator from "@/components/PriceCalculator";
import api from "@/lib/api";

const FAQ_ITEMS = [
  {
    q: "How does MaidX screen helpers?",
    a: "Every helper undergoes a rigorous verification process, background check, and reference verification before joining our platform."
  },
  {
    q: "How do I pay my helper?",
    a: "Payments are processed securely through the website. You can pay using UPI, card, or net banking once the booking is completed."
  },
  {
    q: "Can I reschedule or cancel a booking?",
    a: "Yes! Bookings can be canceled or rescheduled up to 2 hours before the start time directly from your dashboard."
  },
  {
    q: "Are the helpers experienced?",
    a: "Yes, we focus on listing helpers with solid experience and a history of positive community reviews in your neighborhood."
  }
];

export default function Home() {
  const { user } = useAuth();
  const tier = useDeviceTier();
  const isHighTier = tier === "high";
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const [topHelpers, setTopHelpers] = useState<any[]>([]);
  const [helpersLoading, setHelpersLoading] = useState(true);

  useEffect(() => {
    async function fetchTopHelpers(lat?: number, lng?: number) {
      setHelpersLoading(true);
      try {
        const url = lat && lng ? `/maids/public?lat=${lat}&lng=${lng}&limit=3` : "/maids/public?limit=3";
        const { data } = await api.get(url);
        setTopHelpers(data.maids || []);
      } catch (err) {
        console.error("Failed to fetch top helpers", err);
      } finally {
        setHelpersLoading(false);
      }
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchTopHelpers(position.coords.latitude, position.coords.longitude);
        },
        () => {
          fetchTopHelpers();
        },
        { timeout: 8000 }
      );
    } else {
      fetchTopHelpers();
    }
  }, []);

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

      {/* Trust Metrics Bar */}
      <section className="py-8 bg-zinc-100/50 dark:bg-zinc-900/30 border-y border-zinc-200/40 dark:border-zinc-800/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { val: "5,000+", label: "Happy Households" },
              { val: "500+", label: "Verified Helpers" },
              { val: "4.9/5", label: "Average Rating" },
              { val: "100%", label: "Safe & Insured" }
            ].map((m, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{m.val}</p>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-zinc-900/50">
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

      {/* Top Rated Helpers Showcase */}
      <section className="py-20 bg-zinc-50/50 dark:bg-zinc-950 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight sm:text-4xl mb-4">
              Top Rated Helpers in Your Area
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
              Compare profiles and choose from our most requested professionals.
            </p>
          </div>

          {helpersLoading ? (
            <div className="grid md:grid-cols-3 gap-8 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 h-64 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800"></div>
                    <div className="w-20 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3"></div>
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
                  </div>
                  <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full"></div>
                </div>
              ))}
            </div>
          ) : topHelpers.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No helpers registered in this region yet. Be the first to join!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {topHelpers.map((m, idx) => (
                <Card key={idx} hoverEffect className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-2xl">
                      {m.avatar}
                    </div>
                    {m.isVerified && (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{m.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1 mb-3">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{m.rating.toFixed(1)}</span>
                    <span className="text-xs text-zinc-400">({m.reviews} reviews)</span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">{m.bio || "No professional bio provided yet."}</p>
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {m.skills.slice(0, 3).map((skill: string, sIdx: number) => (
                      <span key={sIdx} className="text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase tracking-wider font-semibold">Hourly Rate</span>
                      <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                        {m.hourlyRate ? `₹${m.hourlyRate}/hr` : "Negot."}
                      </span>
                    </div>
                    <Link href={user ? "/dashboard/client/find-maids" : "/signup?role=client"} className="text-xs font-bold bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-850 dark:hover:bg-zinc-700 text-white px-4 py-2 rounded-xl transition-all">
                      Book Helper
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Interactive Estimator */}
      <section className="py-20 bg-white dark:bg-zinc-900/50 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Estimate Your Cost</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm mx-auto">Adjust details to get an instant cost estimate for services.</p>
          </div>
          <PriceCalculator />
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

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-zinc-900/50 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">Have questions? We've got answers.</p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-zinc-200/60 dark:border-zinc-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-zinc-950/40">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4.5 flex justify-between items-center text-left text-zinc-900 dark:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <span className="font-semibold text-sm md:text-base">{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4.5 pt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-white dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-12 md:p-16 text-center shadow-xl">
            <div className="relative z-10 max-w-xl mx-auto space-y-6">
              <h2 className="text-3xl font-extrabold text-white md:text-4xl leading-tight">Ready to find your perfect household help?</h2>
              <p className="text-indigo-100 text-sm md:text-base">Join thousands of households using MaidX to manage their cleaning, cooking, and chores effortlessly.</p>
              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                <Link href={user ? (user.role === 'client' ? "/dashboard/client/find-maids" : `/dashboard/${user.role}`) : "/signup?role=client"} className="bg-white text-indigo-600 font-bold px-8 py-3.5 rounded-full shadow-md hover:bg-zinc-50 hover:scale-105 active:scale-95 transition-all">
                  Get Started Now
                </Link>
                {!user && (
                  <Link href="/signup?role=maid" className="bg-indigo-700/40 hover:bg-indigo-700/60 border border-indigo-400/40 text-white font-bold px-8 py-3.5 rounded-full hover:scale-105 active:scale-95 transition-all">
                    Register as Helper
                  </Link>
                )}
              </div>
            </div>
            {/* Background elements */}
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-8 left-12 w-32 h-32 bg-indigo-400/30 rounded-full blur-xl"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}
