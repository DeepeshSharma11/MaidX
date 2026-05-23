"use client";

import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/LanguageContext";
import { Home, User, Calendar, Settings, Users, BookOpen, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  client: [
    { label: "Home",     href: "/dashboard/client",            icon: Home },
    { label: "Search",   href: "/dashboard/client/find-maids", icon: Search },
    { label: "Bookings", href: "/dashboard/client/bookings",   icon: Calendar },
    { label: "Profile",  href: "/dashboard/client/profile",    icon: User },
    { label: "Settings", href: "/dashboard/client/settings",   icon: Settings },
  ],
  maid: [
    { label: "Home",     href: "/dashboard/maid",          icon: Home },
    { label: "Bookings", href: "/dashboard/maid/bookings", icon: BookOpen },
    { label: "Schedule", href: "/dashboard/maid/schedule", icon: Calendar },
    { label: "Profile",  href: "/dashboard/maid/profile",  icon: User },
    { label: "Settings", href: "/dashboard/maid/settings", icon: Settings },
  ],
  admin: [
    { label: "Home",     href: "/dashboard/admin",          icon: Home },
    { label: "Users",    href: "/dashboard/admin/users",    icon: Users },
    { label: "Bookings", href: "/dashboard/admin/bookings", icon: BookOpen },
    { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ],
};

export default function MobileNav() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const pathname = usePathname();
  const role = user?.role ?? "client";
  const items = NAV_ITEMS[role] ?? [];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 z-50 md:hidden">
      <nav className="flex items-center px-2 py-1">
        <div className="flex w-full justify-between">
          {items.map((item) => {
            const isHome = item.href === "/dashboard/client" || item.href === "/dashboard/maid" || item.href === "/dashboard/admin";
            const active = isHome
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center flex-1 h-14 gap-0.5 rounded-xl active:opacity-70 ${
                  active
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                <item.icon className={`w-5 h-5 ${active ? "stroke-[2.5px]" : "stroke-[1.75px]"}`} />
                <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>
                  {t(item.label.toLowerCase().replace(" ", "_"))}
                </span>
                {/* Pure CSS dot — no framer-motion layoutId, no JS animation */}
                <span
                  className={`absolute bottom-1 w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 transition-opacity duration-150 ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
