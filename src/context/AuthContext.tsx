import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { authAPI, type AuthUser } from "@/services/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("bb_token");
    if (!stored) {
      setInitializing(false);
      return;
    }
    setToken(stored);
    authAPI
      .getMe()
      .then((data) => setUser(data.user))
      .catch(() => {
        // Token expired or invalid — clear it
        localStorage.removeItem("bb_token");
        setToken(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  const persist = (tok: string, u: AuthUser) => {
    localStorage.setItem("bb_token", tok);
    setToken(tok);
    setUser(u);
  };

  const login = useCallback(async (email: string, password: string) => {
    const data = await authAPI.login(email, password);
    persist(data.token, data.user);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const data = await authAPI.signup(name, email, password);
    persist(data.token, data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("bb_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, initializing, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
