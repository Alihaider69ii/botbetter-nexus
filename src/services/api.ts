const BASE_URL = (import.meta.env.VITE_API_URL as string) ?? "";

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("bb_token");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  let data: { success?: boolean; message?: string } & Record<string, unknown>;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server error (${res.status})`);
  }

  if (!res.ok) {
    throw new Error(data.message ?? `Request failed (${res.status})`);
  }

  return data as T;
}

// ── Response shapes ───────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  activeAgents?: string[];
  connectedApps?: string[];
  tokensUsed?: number;
  messagesCount?: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}

export interface MeResponse {
  success: boolean;
  user: AuthUser;
}

export interface ChatMessage {
  agent: string;
  role: "user" | "assistant";
  content: string;
  tokens: number;
  createdAt: string;
}

export interface ChatResponse {
  success: boolean;
  agent: string;
  reply: string;
  messagesLeft: number | string;
}

export interface HistoryResponse {
  success: boolean;
  agent: string;
  history: ChatMessage[];
}

export interface StatsResponse {
  success: boolean;
  stats: {
    plan: string;
    messagesUsed: number;
    messagesLeft: number | string;
    tokensUsed: number;
    activeAgents: string[];
    connectedApps: string[];
    totalChats: number;
  };
}

// ── Auth API ──────────────────────────────────────────────────────────────────

export const authAPI = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signup: (name: string, email: string, password: string) =>
    request<AuthResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  getMe: () => request<MeResponse>("/api/auth/me"),
};

// ── Chat API ──────────────────────────────────────────────────────────────────

export const chatAPI = {
  sendMessage: (agentName: string, message: string) =>
    request<ChatResponse>(`/api/chat/${agentName}`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  getHistory: (agentName: string) =>
    request<HistoryResponse>(`/api/history/${agentName}`),
};

// ── Stats API ─────────────────────────────────────────────────────────────────

export const statsAPI = {
  getStats: () => request<StatsResponse>("/api/stats"),
};
