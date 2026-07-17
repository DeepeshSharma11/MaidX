"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
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
              <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Privacy Policy</h1>
            <p className="text-sm text-zinc-500 mt-2">Last Updated: May 2026</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">1. What information we collect</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              We collect information that helps us connect you with daily help or household work. This includes:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
              <li><strong>Your Profile Details:</strong> Your name, email address, phone number, and city.</li>
              <li><strong>Location:</strong> Your home location or service area on the map to find nearby matches.</li>
              <li><strong>Service Choices:</strong> Skills offered (for helpers) or specific work preferences (for clients).</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">2. How we use your information</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              We keep your information safe and use it strictly for:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>Finding and matching helpers with homeowners nearby.</li>
              <li>Sending alerts about schedule confirmation or booking updates.</li>
              <li>Helping our team resolve support tickets and answer questions.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">3. When we share information</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              We do not sell your personal information. We only share details like your name, phone number, and booking notes with the homeowner or helper you choose to book with so they can coordinate and complete the work.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">4. Keeping your details safe</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Your passwords and account details are encrypted. We regularly check our systems to make sure everything is safe and secure. You can update or delete your profile information anytime through your settings.
            </p>
          </section>

          <section className="space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Questions?</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              If you have any questions about how we handle your details, please reach out to us through our Support section.
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
