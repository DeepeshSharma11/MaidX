"use client";

import { useAuth } from "@/context/AuthContext";
import { Home, User, Calendar, Settings, HelpCircle, Users, BookOpen, LogOut, Search, MapPin } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center min-w-[60px] h-12 gap-1 rounded-xl transition-colors ${
                  active
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <item.icon className={`w-5 h-5 ${active ? "stroke-[2.5px]" : "stroke-2"}`} />
                <span className={`text-[10px] font-medium ${active ? "font-bold" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          <button
            onClick={logout}
            className="flex flex-col items-center justify-center min-w-[60px] h-12 gap-1 rounded-xl transition-colors text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
          >
            <LogOut className="w-5 h-5 stroke-2" />
            <span className="text-[10px] font-medium">Log out</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
