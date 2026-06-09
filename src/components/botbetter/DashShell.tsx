import type { ReactNode } from "react";
import { BotBetterShell } from "./BotBetterSidebar";
import type { ScreenKey } from "./TopNav";
import { useAuth } from "@/context/AuthContext";

export const DashShell = ({
  active,
  onNavigate,
  title,
  children,
}: {
  active: ScreenKey;
  onNavigate: (s: ScreenKey) => void;
  title: string;
  children: ReactNode;
}) => {
  const { logout } = useAuth();
  return (
    <BotBetterShell active={active} onNavigate={onNavigate} onLogout={logout} title={title}>
      {children}
    </BotBetterShell>
  );
};
