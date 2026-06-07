const BASE_URL = (import.meta.env.VITE_API_URL as string) ?? "";

export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;
  constructor(message: string, status: number, data: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

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
    throw new ApiError(`Server error (${res.status})`, res.status, {});
  }

  if (!res.ok) {
    const msg = typeof data.message === "string" ? data.message : `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, data);
  }

  return data as T;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  activeAgents?: string[];
  connectedApps?: string[];
  tokensUsed?: number;
  messagesCount?: number;
  referralCode?: string;
  referralCount?: number;
  bonusMessages?: number;
  dailyMessageLimit?: number;
  dailyMessageCount?: number;
  language?: string;
  voice?: string;
  personality?: "maya" | "kabir";
  userType?: string;
  onboardingComplete?: boolean;
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
  audioBase64?: string;
  messagesLeft: number | string;
  resetTime?: string;
}

export interface VoiceChatResponse {
  success: boolean;
  audioBase64: string;
  transcript: string;
  reply: string;
  messagesLeft: number | string;
  resetTime?: string;
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

export interface LimitStatusResponse {
  success: boolean;
  messagesUsed: number;
  messagesLeft: number;
  totalLimit: number;
  resetTime: string;
  referralCode: string;
  referralCount: number;
  bonusMessages: number;
}

export interface ApplyReferralResponse {
  success: boolean;
  message: string;
  bonusMessages: number;
  totalDailyLimit: number;
}

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

export const chatAPI = {
  sendMessage: (agentName: string, message: string) =>
    request<ChatResponse>(`/api/chat/${agentName}`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  getHistory: (agentName: string) =>
    request<HistoryResponse>(`/api/history/${agentName}`),

  clearHistory: (agentName: string) =>
    request<{ success: boolean; message: string }>(`/api/history/${agentName}`, {
      method: "DELETE",
    }),
};

export const voiceAPI = {
  sendVoiceChat: async (audio: Blob, language: string, personality = "maya") => {
    const token = localStorage.getItem("bb_token");
    const form = new FormData();
    form.append("audio", audio, "voice.webm");
    form.append("language", language);
    form.append("personality", personality);

    const res = await fetch(`${BASE_URL}/api/voice/chat`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: form,
    });

    let data: { success?: boolean; message?: string } & Record<string, unknown>;
    try {
      data = await res.json();
    } catch {
      throw new ApiError(`Server error (${res.status})`, res.status, {});
    }

    if (!res.ok) {
      const msg = typeof data.message === "string" ? data.message : `Request failed (${res.status})`;
      throw new ApiError(msg, res.status, data);
    }

    return data as VoiceChatResponse;
  },
};

export const statsAPI = {
  getStats: () => request<StatsResponse>("/api/stats"),
};

export const userAPI = {
  getLimitStatus: () => request<LimitStatusResponse>("/api/user/limit-status"),

  applyReferral: (code: string) =>
    request<ApplyReferralResponse>("/api/user/apply-referral", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  updateOnboarding: (data: {
    name?: string;
    userType?: string;
    language?: string;
    voice?: string;
    personality?: string;
  }) =>
    request<{ success: boolean; message: string; user: Partial<AuthUser> }>("/api/user/onboarding", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  updateProfile: (data: { language?: string; voice?: string; personality?: string }) =>
    request<{ success: boolean; user: Partial<AuthUser> }>("/api/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
