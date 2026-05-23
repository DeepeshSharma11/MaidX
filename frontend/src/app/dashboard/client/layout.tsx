"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileNav from "@/components/MobileNav";
import ChatBotButton from "@/components/ChatBotButton";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["client"]}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950 pb-16 md:pb-0 relative">
        <DashboardSidebar />
        <main className="flex-1 md:ml-64 min-w-0 overflow-x-hidden">{children}</main>
        <MobileNav />
        <ChatBotButton />
      </div>
    </ProtectedRoute>
  );
}
