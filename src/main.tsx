import { createRoot } from "react-dom/client";
import React from "react";
import App from "./App.tsx";
import "./index.css";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#03020d",
            color: "#e8f9ff",
            fontFamily: "monospace",
            padding: "40px 24px",
            overflow: "auto",
          }}
        >
          <div
            style={{
              maxWidth: 700,
              margin: "0 auto",
              border: "1px solid rgba(255,60,60,0.4)",
              borderRadius: 16,
              padding: 32,
              background: "rgba(255,40,40,0.06)",
            }}
          >
            <div style={{ color: "#FF4444", fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
              ⚠ BotBetter — Runtime Error
            </div>
            <div style={{ color: "#FF8888", fontWeight: 600, marginBottom: 8 }}>
              {err.name}: {err.message}
            </div>
            <pre
              style={{
                color: "#aaa",
                fontSize: 12,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                lineHeight: 1.6,
                maxHeight: 360,
                overflow: "auto",
                background: "rgba(0,0,0,0.3)",
                borderRadius: 8,
                padding: 16,
              }}
            >
              {err.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 20,
                padding: "10px 24px",
                background: "linear-gradient(135deg,#6C00FF,#FF3CAC)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
