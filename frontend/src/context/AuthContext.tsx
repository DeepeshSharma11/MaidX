"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";

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

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("maidx-auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.user && parsed?.state?.accessToken) {
          setUser(parsed.state.user);
          localStorage.setItem("access_token", parsed.state.accessToken);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const persistAuth = (user: User, accessToken: string, refreshToken: string) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem(
      "maidx-auth",
      JSON.stringify({ state: { user, accessToken, refreshToken } })
    );
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    const u: User = data.user;
    setUser(u);
    persistAuth(u, data.access_token, data.refresh_token);

    const routes: Record<string, string> = {
      admin: "/dashboard/admin",
      maid: "/dashboard/maid",
      client: "/dashboard/client",
    };
    router.push(routes[u.role] ?? "/dashboard/client");
  };

  const signup = async (email: string, password: string, full_name: string, role: string) => {
    await api.post("/auth/signup", { email, password, full_name, role });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("maidx-auth");
    api.post("/auth/logout").catch(() => {});
    router.push("/login");
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
