import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const stored = localStorage.getItem("finance_auth");
  const parsed = stored ? JSON.parse(stored) : null;

  return {
    user: parsed?.user ?? null,
    token: parsed?.token ?? null,
    isAuthenticated: !!parsed?.token,
    login: (user, token) => {
      localStorage.setItem("finance_auth", JSON.stringify({ user, token }));
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem("finance_auth");
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});
