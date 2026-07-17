"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoadingBar from "@/components/LoadingBar";

interface Props {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "";
      const query = currentPath ? `?redirect=${encodeURIComponent(currentPath)}` : "";
      router.replace(`/login${query}`);
      return;
    }


    if (user && !allowedRoles.includes(user.role)) {
      // Redirect to their own dashboard
      const routes: Record<string, string> = {
        admin: "/dashboard/admin",
        maid: "/dashboard/maid",
        client: "/dashboard/client",
      };
      router.replace(routes[user.role] ?? "/login");
    }
  }, [user, loading, isAuthenticated, allowedRoles, router]);

  if (loading) {
    return <LoadingBar />;
  }

  if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
