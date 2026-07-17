"use client";

import Image from "next/image";
import Link from "next/link";

interface FooterProps {
  compact?: boolean;
}

export default function Footer({ compact = false }: FooterProps) {
  const currentYear = new Date().getFullYear();

  if (compact) {
    return (
      <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-xs text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {currentYear} MaidX. All rights reserved.</p>
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
    );
  }

  return (
    <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="MaidX Logo"
              width={100}
              height={35}
              className="h-6 w-auto object-contain dark:bg-white/90 dark:px-2 dark:py-0.5 dark:rounded-md"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/privacy" className="text-zinc-500 hover:text-indigo-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-zinc-500 hover:text-indigo-600 transition-colors">
              Terms of Service
            </Link>
            <Link href="/refund" className="text-zinc-500 hover:text-indigo-600 transition-colors">
              Refund Policy
            </Link>
            <Link href="/cancellation" className="text-zinc-500 hover:text-indigo-600 transition-colors">
              Cancellation Policy
            </Link>
          </div>
        </div>
        <div className="pt-8 text-xs text-zinc-400 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {currentYear} MaidX. All rights reserved.</p>
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
      </div>
    </footer>
  );
}
