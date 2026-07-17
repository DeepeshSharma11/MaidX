"use client";

import Navbar from "@/components/Navbar";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans selection:bg-indigo-500/30 flex flex-col justify-between">
      {/* Navigation */}
      <Navbar showHomeLink showSignup={false} />

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
