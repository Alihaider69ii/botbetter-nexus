import { useEffect, useRef, useState, useCallback } from "react";
import { X } from "lucide-react";

export interface HologramWindowProps {
  id: string;
  title: string;
  icon: string;
  children?: React.ReactNode;
  onClose: () => void;
  initialX?: number;
  initialY?: number;
  width?: number;
  height?: number;
  /** Normalized pointer coords (0-1) from gesture controller */
  pointerX?: number;
  pointerY?: number;
}

export const HologramWindow = ({
  title,
  icon,
  children,
  onClose,
  initialX = 100,
  initialY = 100,
  width = 360,
  height = 260,
  pointerX,
  pointerY,
}: HologramWindowProps) => {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [visible, setVisible] = useState(false);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const winRef = useRef<HTMLDivElement>(null);

  // Mount animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  // Mouse drag
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  // Touch drag
  useEffect(() => {
    const el = winRef.current;
    if (!el) return;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      dragging.current = true;
      dragOffset.current = { x: t.clientX - pos.x, y: t.clientY - pos.y };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      const t = e.touches[0];
      setPos({ x: t.clientX - dragOffset.current.x, y: t.clientY - dragOffset.current.y });
    };
    const onTouchEnd = () => { dragging.current = false; };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [pos]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      ref={winRef}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width,
        minHeight: height,
        zIndex: 9000,
        transform: visible
          ? "perspective(800px) rotateX(2deg) scale(1)"
          : "perspective(800px) rotateX(15deg) scale(0.7)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
        pointerEvents: "auto",
      }}
    >
      {/* Scan-line overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,212,255,0.03) 3px, rgba(0,212,255,0.03) 4px)",
          pointerEvents: "none",
          zIndex: 1,
          borderRadius: 12,
        }}
      />

      {/* Window body */}
      <div
        style={{
          background: "rgba(0,5,16,0.88)",
          border: "1.5px solid #00D4FF",
          borderRadius: 12,
          boxShadow: "0 0 30px rgba(0,212,255,0.35), inset 0 0 20px rgba(0,212,255,0.04)",
          backdropFilter: "blur(18px)",
          overflow: "hidden",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Header / drag handle */}
        <div
          onMouseDown={onMouseDown}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            borderBottom: "1px solid rgba(0,212,255,0.18)",
            background: "rgba(0,212,255,0.06)",
            cursor: "grab",
            userSelect: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span style={{
              fontFamily: "monospace",
              color: "#00D4FF",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}>
              {title}
            </span>
          </div>
          {/* Corner accent */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00D4FF", boxShadow: "0 0 6px #00D4FF" }} />
            <button
              onClick={handleClose}
              style={{
                background: "none",
                border: "1px solid rgba(0,212,255,0.3)",
                borderRadius: 4,
                color: "#00D4FF",
                cursor: "pointer",
                padding: "2px 4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "16px 16px", color: "#A0F0FF", fontFamily: "monospace", fontSize: 13 }}>
          {children}
        </div>

        {/* Bottom bar */}
        <div style={{
          height: 2,
          background: "linear-gradient(90deg, transparent, #00D4FF, transparent)",
          opacity: 0.6,
        }} />
      </div>

      {/* Corner brackets */}
      {[
        { top: 0, left: 0, borderTop: "2px solid #00D4FF", borderLeft: "2px solid #00D4FF" },
        { top: 0, right: 0, borderTop: "2px solid #00D4FF", borderRight: "2px solid #00D4FF" },
        { bottom: 0, left: 0, borderBottom: "2px solid #00D4FF", borderLeft: "2px solid #00D4FF" },
        { bottom: 0, right: 0, borderBottom: "2px solid #00D4FF", borderRight: "2px solid #00D4FF" },
      ].map((style, i) => (
        <div key={i} style={{ position: "absolute", width: 14, height: 14, zIndex: 3, ...style }} />
      ))}
    </div>
  );
};
