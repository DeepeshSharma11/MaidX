"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, HandCoins } from "lucide-react";

export default function RefundPage() {
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
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-xs text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} MaidX. All rights reserved.</p>
          <p className="text-zinc-500">
            Designed & Developed by{" "}
            <a
              href="https://github.com/DeepeshSharma11"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors underline decoration-dotted underline-offset-4"
            >
              Deepesh Sharma
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
