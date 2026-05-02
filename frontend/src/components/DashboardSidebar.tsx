"use client";

import { useAuth } from "@/context/AuthContext";
import { Star, LogOut, Home, User, Calendar, Settings, HelpCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  client: [
    { label: "Home", href: "/dashboard/client", icon: Home },
    { label: "Search Maids", href: "/dashboard/client/find-maids", icon: User },
    { label: "My Bookings", href: "/dashboard/client/bookings", icon: Calendar },
    { label: "Support", href: "/dashboard/client/support", icon: HelpCircle },
    { label: "Profile", href: "/dashboard/client/profile", icon: Settings },
  ],
  maid: [
    { label: "Home", href: "/dashboard/maid", icon: Home },
    { label: "My Schedule", href: "/dashboard/maid/schedule", icon: Calendar },
    { label: "Bookings", href: "/dashboard/maid/bookings", icon: Calendar },
    { label: "Profile", href: "/dashboard/maid/profile", icon: Settings },
    { label: "Support", href: "/dashboard/maid/support", icon: HelpCircle },
  ],
  admin: [
    { label: "Overview", href: "/dashboard/admin", icon: Home },
    { label: "Users", href: "/dashboard/admin/users", icon: User },
    { label: "Bookings", href: "/dashboard/admin/bookings", icon: Calendar },
    { label: "Tickets", href: "/dashboard/admin/tickets", icon: HelpCircle },
    { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ],
};

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  client: { label: "Client", color: "bg-blue-500/10 text-blue-500" },
  maid: { label: "Professional", color: "bg-emerald-500/10 text-emerald-500" },
  admin: { label: "Admin", color: "bg-amber-500/10 text-amber-500" },
};

export default function DashboardSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const role = user?.role ?? "client";
  const items = NAV_ITEMS[role] ?? [];
  const badge = ROLE_BADGE[role];

  return (
    <aside className="hidden md:flex w-64 h-screen fixed left-0 top-0 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex-col z-40">
      {/* Logo */}
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="MaidX Logo" width={100} height={32} className="h-7 w-auto object-contain" />
        </Link>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
          {user?.full_name || user?.email}
        </p>
        <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
