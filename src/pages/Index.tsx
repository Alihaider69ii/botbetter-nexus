import { useState } from "react";
import { ThemeProvider } from "@/components/botbetter/ThemeProvider";
import { TopNav, ScreenKey } from "@/components/botbetter/TopNav";
import { Landing } from "@/components/botbetter/screens/Landing";
import { Dashboard } from "@/components/botbetter/screens/Dashboard";
import { NexusChat } from "@/components/botbetter/screens/NexusChat";
import { AgentDetail } from "@/components/botbetter/screens/AgentDetail";
import { Connections } from "@/components/botbetter/screens/Connections";
import { CreateAgent } from "@/components/botbetter/screens/CreateAgent";

const Index = () => {
  const [screen, setScreen] = useState<ScreenKey>("landing");

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <TopNav active={screen} onChange={setScreen} />
        <div key={screen} className="fade-in">
          {screen === "landing" && <Landing onNavigate={setScreen} />}
          {screen === "dashboard" && <Dashboard active={screen} onNavigate={setScreen} />}
          {screen === "chat" && <NexusChat active={screen} onNavigate={setScreen} />}
          {screen === "agent" && <AgentDetail active={screen} onNavigate={setScreen} />}
          {screen === "connections" && <Connections active={screen} onNavigate={setScreen} />}
          {screen === "create" && <CreateAgent active={screen} onNavigate={setScreen} />}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
