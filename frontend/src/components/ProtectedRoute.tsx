"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

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
      router.replace("/login");
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
