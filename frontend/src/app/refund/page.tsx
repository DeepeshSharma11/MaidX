"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/Card";
import { HandCoins } from "lucide-react";

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans selection:bg-indigo-500/30 flex flex-col justify-between">
      {/* Navigation */}
      <Navbar showHomeLink showSignup={false} />

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20 flex-1 w-full">
        <Card roundedSize="3xl" paddingSize="large" className="space-y-8">
          <header className="border-b border-zinc-100 dark:border-zinc-800 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-4">
              <HandCoins className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Refund Policy</h1>
            <p className="text-sm text-zinc-500 mt-2">Last Updated: May 2026</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">1. When you get a full refund</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              We want payments to be fair and transparent. You will receive a full refund or will not be charged if:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>The helper cancels the booking request or is unable to make it.</li>
              <li>You cancel the booking before it is accepted by the helper.</li>
              <li>You cancel the booking at least 2 hours before the scheduled start time.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">2. Quality concerns & issues</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              If you are not satisfied with the work done, please reach out to us:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>Submit a support ticket through your dashboard within 24 hours of the booking completion.</li>
              <li>Describe the issue clearly. Our support team will check the details with both you and the helper.</li>
              <li>Based on the case, we will offer a partial refund, full refund, or coordinate a free re-booking.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">3. How long does a refund take?</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Once a refund is approved by our team, it is automatically processed and sent back to your original payment method (bank account, card, or wallet) within 5 to 7 working days.
            </p>
          </section>

          <section className="space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Questions?</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              If you have any questions or need to dispute a payment, please create a ticket in the Support page of your dashboard.
            </p>
          </section>
        </Card>
      </main>

      {/* Footer */}
      <Footer compact />
    </div>
  );
}
