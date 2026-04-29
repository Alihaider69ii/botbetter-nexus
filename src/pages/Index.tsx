import { useState } from "react";
import { ThemeProvider } from "@/components/botbetter/ThemeProvider";
import { TopNav, ScreenKey } from "@/components/botbetter/TopNav";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Landing } from "@/components/botbetter/screens/Landing";
import { Dashboard } from "@/components/botbetter/screens/Dashboard";
import { NexusChat } from "@/components/botbetter/screens/NexusChat";
import { AgentDetail } from "@/components/botbetter/screens/AgentDetail";
import { AgentChat } from "@/components/botbetter/screens/AgentChat";
import { Connections } from "@/components/botbetter/screens/Connections";
import { CreateAgent } from "@/components/botbetter/screens/CreateAgent";
import { AuthModal } from "@/components/botbetter/screens/AuthModal";

// Protected screens that require a login
const PROTECTED: ScreenKey[] = ["dashboard", "chat", "agent", "agent-chat", "connections", "create"];

const App = () => {
  const { user, initializing, logout } = useAuth();
  const [screen, setScreen] = useState<ScreenKey>("landing");
  const [chatAgentIdx, setChatAgentIdx] = useState(1);
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: "login" | "signup" }>({
    open: false,
    tab: "login",
  });

  const showAuth = (tab: "login" | "signup" = "login") =>
    setAuthModal({ open: true, tab });

  // Navigate, guarding protected screens
  const navigate = (s: ScreenKey) => {
    if (PROTECTED.includes(s) && !user) {
      showAuth("login");
      return;
    }
    setScreen(s);
  };

  const openAgentChat = (agentIdx: number) => {
    if (!user) { showAuth("login"); return; }
    setChatAgentIdx(agentIdx);
    setScreen("agent-chat");
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav active={screen} onChange={navigate} />
      <div key={screen} className="fade-in">
        {screen === "landing" && (
          <Landing onNavigate={navigate} onShowAuth={showAuth} />
        )}
        {screen === "dashboard" && (
          <Dashboard active={screen} onNavigate={navigate} onLogout={logout} />
        )}
        {screen === "chat" && (
          <NexusChat active={screen} onNavigate={navigate} />
        )}
        {screen === "agent" && (
          <AgentDetail
            active={screen}
            onNavigate={navigate}
            onChatWithAgent={openAgentChat}
          />
        )}
        {screen === "agent-chat" && (
          <AgentChat active={screen} onNavigate={navigate} agentIdx={chatAgentIdx} />
        )}
        {screen === "connections" && (
          <Connections active={screen} onNavigate={navigate} />
        )}
        {screen === "create" && (
          <CreateAgent active={screen} onNavigate={navigate} />
        )}
      </div>

      <AuthModal
        open={authModal.open}
        defaultTab={authModal.tab}
        onClose={() => setAuthModal((s) => ({ ...s, open: false }))}
        onSuccess={() => {
          // Bypass the auth guard — we know the user just authenticated.
          // Cannot call navigate("dashboard") here because React hasn't
          // flushed setUser() yet, so `user` is still null and the guard
          // would re-open the login modal.
          setScreen("dashboard");
        }}
      />
    </div>
  );
};

const Index = () => (
  <ThemeProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
);

export default Index;
