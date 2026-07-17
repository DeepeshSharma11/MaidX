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

  // On mount, try to restore session instantly from localStorage cache before verifying
  useEffect(() => {
    const refresh_token = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
    const cachedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (!refresh_token) {
      setUser(null);
      setLoading(false);
    } else if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
        setLoading(false);
      } catch {
        // Leave loading = true and let restoreSession fetch
      }
    }

    const restoreSession = async () => {
      try {
        const { data } = await api.post("/auth/refresh", { refresh_token });
        setAccessToken(data.access_token);
        if (data.refresh_token && typeof window !== "undefined") {
          localStorage.setItem("refresh_token", data.refresh_token);
        }
        if (data.user && typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        setUser(data.user);
      } catch {
        // If refresh fails, user is not logged in.
        if (typeof window !== "undefined") {
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (refresh_token) {
      restoreSession();
    }

    // Listen for unauthorized events from api interceptor
    const handleUnauthorized = () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
      }
      setUser(null);
      router.push("/login");
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [router]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    
    if (data.requires_otp) {
      router.push(`/signup?email=${encodeURIComponent(email)}&step=otp`);
      return;
    }

    setAccessToken(data.access_token);
    if (data.refresh_token && typeof window !== "undefined") {
      localStorage.setItem("refresh_token", data.refresh_token);
    }
    if (data.user && typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    setUser(data.user);

    const routes: Record<string, string> = {
      admin: "/dashboard/admin",
      maid: "/dashboard/maid",
      client: "/dashboard/client",
    };
    
    let target = routes[data.user.role] ?? "/dashboard/client";
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      // Prevent open-redirect vulnerability: must start with / and not //
      if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
        const role = data.user.role;
        if (redirect.startsWith(`/dashboard/${role}`) || !redirect.startsWith("/dashboard/")) {
          target = redirect;
        }
      }
    }
    router.replace(target);
  };


  const signup = async (email: string, password: string, full_name: string, role: string) => {
    await api.post("/auth/signup", { email, password, full_name, role });
  };

  const logout = async () => {
    try {
      const refresh_token = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
      await api.post("/auth/logout", { refresh_token });
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
      }
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
