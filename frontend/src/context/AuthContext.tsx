"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import api, { setAccessToken } from "@/lib/api";

interface User {
  id: string;
  email: string;
  role: "client" | "maid" | "admin";
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, full_name: string, role: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // On mount, try to refresh token via httpOnly cookie to restore session
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await api.post("/auth/refresh");
        setAccessToken(data.access_token);
        setUser(data.user);
      } catch {
        // If refresh fails, user is not logged in.
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();

    // Listen for unauthorized events from api interceptor
    const handleUnauthorized = () => {
      setUser(null);
      router.push("/login");
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [router]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    setAccessToken(data.access_token);
    setUser(data.user);

    const routes: Record<string, string> = {
      admin: "/dashboard/admin",
      maid: "/dashboard/maid",
      client: "/dashboard/client",
    };
    router.push(routes[data.user.role] ?? "/dashboard/client");
  };

  const signup = async (email: string, password: string, full_name: string, role: string) => {
    await api.post("/auth/signup", { email, password, full_name, role });
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
      setAccessToken(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
