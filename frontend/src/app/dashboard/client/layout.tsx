"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["client"]}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950">
        <DashboardSidebar />
        <main className="flex-1 ml-64 p-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
