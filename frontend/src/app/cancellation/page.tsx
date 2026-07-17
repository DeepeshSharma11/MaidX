"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/Card";
import { CalendarX } from "lucide-react";

export default function CancellationPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans selection:bg-indigo-500/30 flex flex-col justify-between">
      {/* Navigation */}
      <Navbar showHomeLink showSignup={false} />

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20 flex-1 w-full">
        <Card roundedSize="3xl" paddingSize="large" className="space-y-8">
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
        </Card>
      </main>

      {/* Footer */}
      <Footer compact />
    </div>
  );
}
