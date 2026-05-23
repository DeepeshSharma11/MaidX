"use client";

import { useAuth } from "@/context/AuthContext";
import { Home, User, Calendar, Settings, HelpCircle, Users, BookOpen, LogOut, Search, MapPin } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";


interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  client: [
    { label: "Home", href: "/dashboard/client", icon: Home },
    { label: "Search", href: "/dashboard/client/find-maids", icon: Search },
    { label: "Bookings", href: "/dashboard/client/bookings", icon: Calendar },
    { label: "Profile", href: "/dashboard/client/profile", icon: User },
    { label: "Settings", href: "/dashboard/client/settings", icon: Settings },
  ],
  maid: [
    { label: "Home", href: "/dashboard/maid", icon: Home },
    { label: "Bookings", href: "/dashboard/maid/bookings", icon: BookOpen },
    { label: "Schedule", href: "/dashboard/maid/schedule", icon: Calendar },
    { label: "Profile", href: "/dashboard/maid/profile", icon: User },
    { label: "Settings", href: "/dashboard/maid/settings", icon: Settings },
  ],
  admin: [
    { label: "Home", href: "/dashboard/admin", icon: Home },
    { label: "Users", href: "/dashboard/admin/users", icon: Users },
    { label: "Bookings", href: "/dashboard/admin/bookings", icon: BookOpen },
    { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ],
};

export default function MobileNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const role = user?.role ?? "client";
  const items = NAV_ITEMS[role] ?? [];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 z-50 md:hidden pb-safe">
      <nav className="flex items-center overflow-x-auto scrollbar-none px-2 py-2">
        <div className="flex w-full justify-between sm:justify-around min-w-max gap-2 px-2">
          {items.map((item) => {
            const isHome = item.href === "/dashboard/client" || item.href === "/dashboard/maid" || item.href === "/dashboard/admin";
            const active = isHome ? pathname === item.href : (pathname === item.href || pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center min-w-[60px] h-12 gap-1 rounded-xl transition-all duration-200 active:scale-95 ${
                  active
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-500 dark:text-zinc-400 active:text-zinc-900 dark:active:text-zinc-200"
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-200 ${active ? "stroke-[2.5px] scale-110" : "stroke-2"}`} />
                <span className={`text-[10px] transition-all duration-200 ${active ? "font-bold scale-105" : "font-medium"}`}>
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="mobile-active-dot"
                    className="absolute -bottom-1 w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}

        </div>
      </nav>
    </div>
  );
}
