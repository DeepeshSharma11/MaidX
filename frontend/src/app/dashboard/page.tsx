"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoadingBar from "@/components/LoadingBar";

export default function DashboardRootPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user) {
      const routes: Record<string, string> = {
        admin: "/dashboard/admin",
        maid: "/dashboard/maid",
        client: "/dashboard/client",
      };
      router.replace(routes[user.role] ?? "/dashboard/client");
    }
  }, [user, loading, isAuthenticated, router]);

  return <LoadingBar />;
}
