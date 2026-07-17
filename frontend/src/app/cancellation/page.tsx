"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, CalendarX } from "lucide-react";

export default function CancellationPage() {
  const { user, loading: authLoading } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans selection:bg-indigo-500/30 flex flex-col justify-between">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/95 dark:bg-zinc-950/95">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mr-4">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <Image src="/logo.png" alt="MaidX Logo" width={100} height={35} className="h-6 w-auto object-contain dark:bg-white/90 dark:px-2 dark:py-0.5 dark:rounded-md" />
          </div>
          <div className="flex items-center gap-4">
            {authLoading ? (
              <div className="w-20 h-8 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-full"></div>
            ) : user ? (
              <Link href={`/dashboard/${user.role}`} className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full transition-colors">
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/login" className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
                Log in
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20 flex-1 w-full">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 md:p-10 shadow-sm space-y-8">
          <header className="border-b border-zinc-100 dark:border-zinc-800 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-4">
              <CalendarX className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Cancellation Policy</h1>
            <p className="text-sm text-zinc-500 mt-2">Last Updated: May 2026</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">1. Cancellation by Clients</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              We know plans can change. Here is how cancellations work for homeowners:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
              <li><strong>Before Acceptance:</strong> You can cancel any pending booking request at any time for free.</li>
              <li><strong>More than 2 hours before:</strong> If the booking is confirmed, you can cancel it for free up to 2 hours before the start time.</li>
              <li><strong>Late Cancellation:</strong> If you cancel less than 2 hours before the start time, a small fee of ₹100 may be charged to compensate the helper for travel planning and missed slots.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">2. Cancellation by Helpers</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Helpers are requested to keep their availability schedules up-to-date. If a helper cancels a confirmed booking:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>You will receive an instant, full refund.</li>
              <li>Our team will notify you immediately and help you find another helper in your area.</li>
              <li>Helpers who cancel frequently may have their schedules reviewed by our team.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">3. How to cancel a booking</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              You can cancel a booking directly from your dashboard:
            </p>
            <ol className="list-decimal pl-5 text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>Go to the **Bookings** page on your dashboard.</li>
              <li>Find the active booking card you wish to cancel.</li>
              <li>Click the **Cancel Booking** button at the bottom of the card and confirm.</li>
            </ol>
          </section>

          <section className="space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Questions?</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              If you have any questions or need to dispute a cancellation charge, please reach out to us by opening a support request in your dashboard.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-zinc-400">
          <p>&copy; {new Date().getFullYear()} MaidX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
