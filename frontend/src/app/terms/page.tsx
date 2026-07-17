"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function TermsPage() {
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
              <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Terms of Service</h1>
            <p className="text-sm text-zinc-500 mt-2">Last Updated: May 2026</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">1. Using our service</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Our service helps you find local helpers or find domestic work. By creating an account, you agree to:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>Provide true and accurate information on your profile.</li>
              <li>Treat other users with respect and kindness.</li>
              <li>Keep your login details and password confidential.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">2. Bookings and Payments</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              When a client books a helper, they agree to pay the stated hourly rate for the total hours worked. Helpers agree to complete the work specified in the booking notes to the best of their ability.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">3. Safety and Respect</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Everyone deserves a safe environment. Homeowners must provide a clean and safe workspace for helpers. Helpers must follow home rules and treat personal property with care. Any safety concerns should be reported to our support team immediately.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">4. Account Closures</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              We want MaidX to be safe for everyone. If any user breaks these rules, treats others poorly, or shares false details, we reserve the right to close their account.
            </p>
          </section>

          <section className="space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Need help?</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              If you have any questions or run into issues using the site, you can contact us anytime through the Support link in your dashboard.
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
