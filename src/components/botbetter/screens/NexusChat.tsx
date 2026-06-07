import type { ScreenKey } from "../TopNav";

export const NexusChat = ({
  onNavigate: _onNavigate,
}: {
  active: ScreenKey;
  onNavigate: (s: ScreenKey) => void;
}) => {
  return (
    <iframe
      src="/nexus-chat.html"
      title="NEXUS"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        border: "none",
        zIndex: 40,
      }}
    />
  );
};
