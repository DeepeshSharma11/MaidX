"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileNav from "@/components/MobileNav";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["client"]}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950 pb-16 md:pb-0">
        <DashboardSidebar />
        <main className="flex-1 md:ml-64">{children}</main>
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}
