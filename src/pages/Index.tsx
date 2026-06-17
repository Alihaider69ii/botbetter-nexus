import { useState, useEffect } from "react";
import { ThemeProvider, useTheme, type NexusTheme } from "@/components/botbetter/ThemeProvider";
import { TopNav, ScreenKey } from "@/components/botbetter/TopNav";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { VoiceModeProvider } from "@/context/VoiceModeContext";
import { HologramMenu } from "@/components/botbetter/HologramMenu";
import { Landing } from "@/components/botbetter/screens/Landing";
import { Dashboard } from "@/components/botbetter/screens/Dashboard";
import { NexusChat } from "@/components/botbetter/screens/NexusChat";
import { AgentDetail } from "@/components/botbetter/screens/AgentDetail";
import { AgentChat } from "@/components/botbetter/screens/AgentChat";
import { Connections } from "@/components/botbetter/screens/Connections";
import { CreateAgent } from "@/components/botbetter/screens/CreateAgent";
import { Usage } from "@/components/botbetter/screens/Usage";
import { GetHelp } from "@/components/botbetter/screens/GetHelp";
import { LearnMore } from "@/components/botbetter/screens/LearnMore";
import { GiftNexus } from "@/components/botbetter/screens/GiftNexus";
import { Plugins } from "@/components/botbetter/screens/Plugins";
import { Webhooks } from "@/components/botbetter/screens/Webhooks";
import { AuthModal } from "@/components/botbetter/screens/AuthModal";
import { OnboardingModal } from "@/components/botbetter/screens/OnboardingModal";
import TaskWindow from "@/components/botbetter/TaskWindow";

// Protected screens that require a login
const PROTECTED: ScreenKey[] = ["dashboard", "chat", "agent", "agent-chat", "connections", "create", "usage", "webhooks", "plugins"];

const App = () => {
  const { user, initializing, logout } = useAuth();
  const { setTheme } = useTheme();

  // Sync theme from user profile when they log in
  useEffect(() => {
    if (user?.theme && ["nexus","void","genz"].includes(user.theme)) {
      setTheme(user.theme as NexusTheme);
    }
  }, [user?.id, user?.theme, setTheme]);
  const [screen, setScreen] = useState<ScreenKey>("landing");
  const [chatAgentIdx, setChatAgentIdx] = useState(1);
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: "login" | "signup" }>({
    open: false,
    tab: "login",
  });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [gestureEnabled, setGestureEnabled] = useState(false);

  // After Google OAuth redirect: token is in localStorage, navigate to chat
  useEffect(() => {
    if (!initializing && user && sessionStorage.getItem("bb_post_oauth")) {
      sessionStorage.removeItem("bb_post_oauth");
      setScreen("chat");
    }
  }, [initializing, user]);

  // Auto-navigate to chat when user logs in or session is restored
  useEffect(() => {
    if (!initializing && user && screen === "landing") {
      setScreen("chat");
    }
  }, [initializing, user, screen]);

  // Show onboarding for new users who haven't completed it yet
  useEffect(() => {
    if (!initializing && user && !user.onboardingComplete) {
      setShowOnboarding(true);
    }
  }, [initializing, user]);

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
      {!["chat","landing","dashboard","connections","usage","help","learn-more","gift","plugins","webhooks"].includes(screen) && (
        <TopNav active={screen} onChange={navigate} />
      )}
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
        {screen === "usage" && (
          <Usage active={screen} onNavigate={navigate} />
        )}
        {screen === "tasks" && (
          <TaskWindow />
        )}
        {screen === "help" && (
          <GetHelp active={screen} onNavigate={navigate} />
        )}
        {screen === "learn-more" && (
          <LearnMore active={screen} onNavigate={navigate} />
        )}
        {screen === "gift" && (
          <GiftNexus active={screen} onNavigate={navigate} />
        )}
        {screen === "plugins" && (
          <Plugins active={screen} onNavigate={navigate} />
        )}
        {screen === "webhooks" && (
          <Webhooks active={screen} onNavigate={navigate} />
        )}
      </div>

      <HologramMenu
        gestureEnabled={gestureEnabled}
        onNavigate={navigate}
        onToggleGesture={() => setGestureEnabled(v => !v)}
      />

      <AuthModal
        open={authModal.open}
        defaultTab={authModal.tab}
        onClose={() => setAuthModal((s) => ({ ...s, open: false }))}
        onSuccess={() => {
          setScreen("chat");
        }}
      />

      <OnboardingModal
        open={showOnboarding}
        onComplete={() => {
          setShowOnboarding(false);
          setScreen("dashboard");
        }}
      />
    </div>
  );
};

const Index = () => (
  <ThemeProvider>
    <AuthProvider>
      <VoiceModeProvider>
        <App />
      </VoiceModeProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default Index;
