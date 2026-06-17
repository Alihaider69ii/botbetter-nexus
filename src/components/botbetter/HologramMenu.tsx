import { useState, useEffect, useRef, useCallback } from "react";
import { HologramWindow } from "./HologramWindow";
import { GestureController, GestureType, GestureEvent } from "./GestureController";
import type { ScreenKey } from "./TopNav";

const MENU_ITEMS: { id: string; icon: string; label: string; screen: ScreenKey }[] = [
  { id: "chat",        icon: "⚡", label: "NEXUS CHAT",    screen: "chat" },
  { id: "dashboard",   icon: "📊", label: "DASHBOARD",     screen: "dashboard" },
  { id: "connections", icon: "🔗", label: "CONNECTORS",    screen: "connections" },
  { id: "usage",       icon: "📈", label: "HISTORY",       screen: "usage" },
  { id: "create",      icon: "⚙️", label: "SETTINGS",      screen: "create" },
  { id: "webhooks",    icon: "🪝", label: "WEBHOOKS",      screen: "webhooks" },
  { id: "plugins",     icon: "🧩", label: "PLUGINS",       screen: "plugins" },
  { id: "help",        icon: "❓", label: "GET HELP",      screen: "help" },
  { id: "gift",        icon: "🎁", label: "GIFT NEXUS",    screen: "gift" },
  { id: "learn-more",  icon: "🌟", label: "LEARN MORE",    screen: "learn-more" },
];

interface HologramMenuProps {
  gestureEnabled: boolean;
  onNavigate: (s: ScreenKey) => void;
  onToggleGesture: () => void;
}

export const HologramMenu = ({ gestureEnabled, onNavigate, onToggleGesture }: HologramMenuProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [currentGesture, setCurrentGesture] = useState<GestureType>("none");
  const [gestureLabel, setGestureLabel] = useState("");
  const [openWindows, setOpenWindows] = useState<string[]>([]);
  const [pointerX, setPointerX] = useState(0.5);
  const [pointerY, setPointerY] = useState(0.5);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Debounce gesture actions
  const lastAction = useRef(0);
  const canAct = (ms = 700) => {
    const now = Date.now();
    if (now - lastAction.current < ms) return false;
    lastAction.current = now;
    return true;
  };

  const GESTURE_LABELS: Record<GestureType, string> = {
    "open-palm":  "✋ OPEN PALM",
    "point":      "☝️ POINT",
    "swipe-left": "👈 SWIPE LEFT",
    "swipe-right":"👉 SWIPE RIGHT",
    "pinch":      "🤏 PINCH",
    "thumbs-up":  "👍 THUMBS UP",
    "fist":       "✊ FIST",
    "none":       "",
  };

  const handleGesture = useCallback((e: GestureEvent) => {
    setCurrentGesture(e.gesture);
    setGestureLabel(GESTURE_LABELS[e.gesture]);
    setPointerX(e.tipX);
    setPointerY(e.tipY);

    if (e.gesture === "open-palm" && canAct(1000)) {
      setMenuOpen(v => !v);
      return;
    }
    if (!menuOpen) return;

    if (e.gesture === "swipe-left" && canAct()) {
      setSelectedIdx(i => (i + 1) % MENU_ITEMS.length);
    }
    if (e.gesture === "swipe-right" && canAct()) {
      setSelectedIdx(i => (i - 1 + MENU_ITEMS.length) % MENU_ITEMS.length);
    }
    if (e.gesture === "thumbs-up" && canAct()) {
      const item = MENU_ITEMS[selectedIdx];
      setOpenWindows(w => w.includes(item.id) ? w : [...w, item.id]);
    }
    if (e.gesture === "point" && canAct(400)) {
      // Point selects item under finger
      const idx = Math.floor(e.tipY * MENU_ITEMS.length);
      setSelectedIdx(Math.min(idx, MENU_ITEMS.length - 1));
    }
    if (e.gesture === "pinch" && canAct()) {
      setOpenWindows(w => w.slice(0, -1));
    }
    if (e.gesture === "fist" && canAct()) {
      setMenuOpen(false);
    }
  }, [menuOpen, selectedIdx]);

  const closeWindow = (id: string) => setOpenWindows(w => w.filter(x => x !== id));

  const getWindowContent = (id: string) => {
    const item = MENU_ITEMS.find(m => m.id === id)!;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ color: "#00D4FF", fontSize: 12 }}>
          ▸ TAP TO OPEN IN APP
        </div>
        <button
          onClick={() => { onNavigate(item.screen); setMenuOpen(false); }}
          style={{
            background: "rgba(0,212,255,0.1)",
            border: "1px solid rgba(0,212,255,0.4)",
            borderRadius: 6,
            color: "#00D4FF",
            fontFamily: "monospace",
            fontSize: 13,
            padding: "8px 14px",
            cursor: "pointer",
            textAlign: "left",
            letterSpacing: "0.08em",
          }}
        >
          → LAUNCH {item.label}
        </button>
        <div style={{ fontSize: 11, color: "rgba(0,212,255,0.5)", marginTop: 4 }}>
          [ GESTURE: THUMBS UP TO CONFIRM ]
        </div>
      </div>
    );
  };

  // Gesture cursor dot
  const cursorStyle: React.CSSProperties = gestureEnabled && currentGesture !== "none" ? {
    position: "fixed",
    left: `${pointerX * 100}%`,
    top: `${pointerY * 100}%`,
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "rgba(0,212,255,0.7)",
    boxShadow: "0 0 16px #00D4FF",
    transform: "translate(-50%,-50%)",
    pointerEvents: "none",
    zIndex: 9999,
    transition: "left 0.08s, top 0.08s",
  } : { display: "none" };

  return (
    <>
      {/* Gesture engine */}
      <GestureController
        enabled={gestureEnabled}
        onGesture={handleGesture}
        previewCanvasRef={canvasRef}
        videoRef={videoRef}
      />

      {/* Gesture cursor */}
      <div style={cursorStyle} />

      {/* Camera preview pill — bottom right */}
      {gestureEnabled && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 9100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div style={{
            width: 100,
            height: 75,
            borderRadius: 50,
            overflow: "hidden",
            border: "2px solid #00D4FF",
            boxShadow: "0 0 16px rgba(0,212,255,0.5)",
            position: "relative",
            background: "#000510",
          }}>
            <video
              ref={videoRef}
              style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                transform: "scaleX(1)",
              }}
            />
          </div>
          {gestureLabel && (
            <div style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "#00D4FF",
              background: "rgba(0,5,16,0.85)",
              border: "1px solid rgba(0,212,255,0.3)",
              borderRadius: 4,
              padding: "2px 8px",
              letterSpacing: "0.1em",
              maxWidth: 120,
              textAlign: "center",
            }}>
              {gestureLabel}
            </div>
          )}
        </div>
      )}

      {/* Hologram menu overlay */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 8500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setMenuOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "rgba(0,5,16,0.92)",
              border: "2px solid #00D4FF",
              borderRadius: 16,
              boxShadow: "0 0 60px rgba(0,212,255,0.3), inset 0 0 40px rgba(0,212,255,0.04)",
              padding: "28px 32px",
              minWidth: 320,
              fontFamily: "monospace",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Scan lines */}
            <div style={{
              position: "absolute", inset: 0,
              background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,212,255,0.025) 3px, rgba(0,212,255,0.025) 4px)",
              pointerEvents: "none",
            }} />

            <div style={{ color: "#00D4FF", fontSize: 11, letterSpacing: "0.2em", marginBottom: 20, opacity: 0.7 }}>
              ◈ NEXUS HOLOGRAM INTERFACE ◈
            </div>
            <div style={{ color: "rgba(0,212,255,0.4)", fontSize: 10, marginBottom: 16, letterSpacing: "0.12em" }}>
              SWIPE ← → TO SELECT  ·  👍 TO OPEN  ·  ✊ TO CLOSE
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {MENU_ITEMS.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedIdx(idx);
                    setOpenWindows(w => w.includes(item.id) ? w : [...w, item.id]);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: 8,
                    cursor: "pointer",
                    border: idx === selectedIdx
                      ? "1px solid #00D4FF"
                      : "1px solid rgba(0,212,255,0.1)",
                    background: idx === selectedIdx
                      ? "rgba(0,212,255,0.12)"
                      : "rgba(0,212,255,0.02)",
                    transition: "all 0.2s",
                    position: "relative",
                  }}
                >
                  {idx === selectedIdx && (
                    <div style={{
                      position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                      width: 3, height: "70%", background: "#00D4FF",
                      borderRadius: "0 2px 2px 0",
                      boxShadow: "0 0 8px #00D4FF",
                    }} />
                  )}
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{
                    color: idx === selectedIdx ? "#00D4FF" : "rgba(0,212,255,0.6)",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                  }}>
                    {String(idx + 1).padStart(2, "0")} · {item.label}
                  </span>
                  {openWindows.includes(item.id) && (
                    <span style={{ marginLeft: "auto", color: "#00D4FF", fontSize: 10 }}>● OPEN</span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, borderTop: "1px solid rgba(0,212,255,0.15)", paddingTop: 14,
              display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "rgba(0,212,255,0.4)", fontSize: 10, letterSpacing: "0.1em" }}>
                ✋ PALM TO TOGGLE MENU
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                style={{
                  background: "rgba(0,212,255,0.08)",
                  border: "1px solid rgba(0,212,255,0.3)",
                  borderRadius: 6,
                  color: "#00D4FF",
                  fontFamily: "monospace",
                  fontSize: 11,
                  padding: "4px 10px",
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                }}
              >
                ✕ CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating hologram windows */}
      {openWindows.map((id, i) => {
        const item = MENU_ITEMS.find(m => m.id === id)!;
        return (
          <HologramWindow
            key={id}
            id={id}
            title={item.label}
            icon={item.icon}
            onClose={() => closeWindow(id)}
            initialX={80 + i * 40}
            initialY={80 + i * 40}
            pointerX={pointerX}
            pointerY={pointerY}
          >
            {getWindowContent(id)}
          </HologramWindow>
        );
      })}

      {/* Toggle button — always visible */}
      <button
        onClick={onToggleGesture}
        title={gestureEnabled ? "Disable gesture control" : "Enable gesture control"}
        style={{
          position: "fixed",
          bottom: gestureEnabled ? 110 : 20,
          right: 20,
          zIndex: 9200,
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "2px solid",
          borderColor: gestureEnabled ? "#00D4FF" : "rgba(0,212,255,0.3)",
          background: gestureEnabled ? "rgba(0,212,255,0.15)" : "rgba(0,5,16,0.7)",
          color: gestureEnabled ? "#00D4FF" : "rgba(0,212,255,0.5)",
          fontSize: 20,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: gestureEnabled ? "0 0 16px rgba(0,212,255,0.4)" : "none",
          transition: "all 0.3s",
        }}
      >
        ✋
      </button>
    </>
  );
};
