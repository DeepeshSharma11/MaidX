"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/Card";
import { BookOpen } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans selection:bg-indigo-500/30 flex flex-col justify-between">
      {/* Navigation */}
      <Navbar showHomeLink showSignup={false} />

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20 flex-1 w-full">
        <Card roundedSize="3xl" paddingSize="large" className="space-y-8">
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
        </Card>
      </main>

      {/* Footer */}
      <Footer compact />
    </div>
  );
}
