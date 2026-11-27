"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SessionUser, UserRole, normalizeRole } from "@/lib/auth/rbac";

interface AuthContextType {
  user: SessionUser | null;
  role: UserRole;
  loading: boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const defaultUser: SessionUser = {
  id: "8e668d46-5c04-4a49-8795-d8c8fa71f40c",
  email: "aravindh@aarga.org",
  name: "Aravindh Murugesan",
  role: "ADMIN",
  provider: "google",
};

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  role: "ADMIN",
  loading: true,
  logout: async () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(defaultUser);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser({
            ...data.user,
            role: normalizeRole(data.user.role),
          });
        } else {
          // If unauthenticated, keep null
          setUser(null);
        }
      }
    } catch {
      // keep fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  };

  const role: UserRole = user ? user.role : "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        logout,
        refreshSession: fetchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
