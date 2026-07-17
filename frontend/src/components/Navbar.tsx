"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft } from "lucide-react";

interface NavbarProps {
  showHomeLink?: boolean;
  showSignup?: boolean;
}

export default function Navbar({ showHomeLink = false, showSignup = true }: NavbarProps) {
  const { user, loading: authLoading } = useAuth();

  return (
    <nav className="fixed w-full top-0 z-50 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/95 dark:bg-zinc-950/95">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showHomeLink && (
            <Link href="/" className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mr-4">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
          )}
          <Link href="/" className="flex items-center">
            {showHomeLink ? (
              <Image
                src="/logo.png"
                alt="MaidX Logo"
                width={100}
                height={35}
                className="h-6 w-auto object-contain dark:bg-white/90 dark:px-2 dark:py-0.5 dark:rounded-md"
                priority
                loading="eager"
              />
            ) : (
              <Image
                src="/logo.png"
                alt="MaidX Logo"
                width={120}
                height={40}
                className="h-8 w-auto object-contain dark:bg-white/90 dark:px-2 dark:py-1 dark:rounded-lg"
                priority
                loading="eager"
              />
            )}
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {authLoading ? (
            <div className="w-20 h-8 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-full"></div>
          ) : user ? (
            <Link
              href={`/dashboard/${user.role}`}
              className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full transition-colors flex items-center gap-2"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Log in
              </Link>
              {showSignup && (
                <Link
                  href="/signup"
                  className="text-sm font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
                >
                  Sign up
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
