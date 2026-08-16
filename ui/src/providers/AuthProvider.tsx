"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signInWithGoogle: async () => {},
  signInAsGuest: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>({
    id: "guest-demo-user",
    email: "guest@dhanmitr.ai",
    name: "Aarav Sharma",
  });
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : "",
        },
      });
    } catch (err) {
      console.warn("Supabase auth not configured yet, using demo guest account:", err);
    }
  };

  const signInAsGuest = () => {
    setUser({
      id: "guest-demo-user",
      email: "guest@dhanmitr.ai",
      name: "Aarav Sharma",
    });
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signInWithGoogle,
        signInAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
