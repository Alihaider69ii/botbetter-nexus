import { useEffect, useRef, useState, useCallback } from "react";

interface FloatingMicButtonProps {
  onActivate: () => void;
  disabled?: boolean;
  recording?: boolean;
  processing?: boolean;
}

const CSS = `
@keyframes fmb-pulse-ring {
  0% { transform:scale(1); opacity:0.6; }
  100% { transform:scale(1.8); opacity:0; }
}
@keyframes fmb-spin {
  from { transform:rotate(0deg); }
  to   { transform:rotate(360deg); }
}
@keyframes fmb-clap-flash {
  0%,100% { opacity:1; }
  50%  { opacity:0.3; }
}
@keyframes fmb-float {
  0%,100% { transform:translateY(0px); }
  50% { transform:translateY(-4px); }
}
.fmb-root {
  display:none;
  position:fixed;
  bottom:96px;
  right:20px;
  z-index:150;
  flex-direction:column;
  align-items:center;
  gap:6px;
}
@media (max-width:767px) {
  .fmb-root { display:flex; }
}
.fmb-outer {
  position:relative;
  width:60px;
  height:60px;
}
.fmb-ring {
  position:absolute;
  inset:-6px;
  border-radius:50%;
  border:2px solid rgba(0,212,255,0.6);
  animation:fmb-pulse-ring 1.4s ease-out infinite;
  pointer-events:none;
}
.fmb-ring-2 { animation-delay:0.7s; }
.fmb-btn {
  width:60px;
  height:60px;
  border-radius:50%;
  border:none;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  transition:all 0.2s;
  position:relative;
  z-index:2;
  box-shadow:0 4px 20px rgba(0,212,255,0.35);
}
.fmb-btn--idle {
  background:linear-gradient(135deg,rgba(0,212,255,0.15),rgba(0,140,170,0.12));
  border:1.5px solid rgba(0,212,255,0.4);
  color:#00D4FF;
  animation:fmb-float 3s ease-in-out infinite;
}
.fmb-btn--rec {
  background:rgba(255,59,48,0.18);
  border:1.5px solid rgba(255,59,48,0.7);
  color:#FF3B30;
  box-shadow:0 0 20px rgba(255,59,48,0.4);
}
.fmb-btn--proc {
  background:rgba(0,212,255,0.12);
  border:1.5px solid rgba(0,212,255,0.5);
  color:#00D4FF;
}
.fmb-btn--proc svg { animation:fmb-spin 1s linear infinite; }
.fmb-clap-hint {
  font-size:10px;
  font-weight:700;
  letter-spacing:1.5px;
  color:rgba(0,212,255,0.7);
  font-family:'Space Grotesk',sans-serif;
  text-align:center;
  white-space:nowrap;
  background:rgba(2,5,16,0.85);
  padding:3px 10px;
  border-radius:10px;
  border:1px solid rgba(0,212,255,0.15);
}
.fmb-clap-flash {
  animation:fmb-clap-flash 0.25s ease-in-out;
}
`;

export default function FloatingMicButton({
  onActivate,
  disabled = false,
  recording = false,
  processing = false,
}: FloatingMicButtonProps) {
  const [clapCount, setClapCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [clapFlash, setClapFlash] = useState(false);
  const clapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastClapRef = useRef<number>(0);
  const clapCountRef = useRef(0);
  const clapActiveRef = useRef(false);

  // Show hint periodically
  useEffect(() => {
    const show = () => {
      setShowHint(true);
      hintTimerRef.current = setTimeout(() => setShowHint(false), 2200);
    };
    show();
    const interval = setInterval(show, 18000);
    return () => { clearInterval(interval); if (hintTimerRef.current) clearTimeout(hintTimerRef.current); };
  }, []);

  const triggerFlash = useCallback(() => {
    setClapFlash(true);
    setTimeout(() => setClapFlash(false), 280);
  }, []);

  // Double-clap detection via Web Audio API
  useEffect(() => {
    if (disabled || recording || processing) return;

    let stopped = false;

    const startListening = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (stopped) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;

        const ctx = new AudioContext();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.1;
        source.connect(analyser);
        analyserRef.current = analyser;

        const buf = new Uint8Array(analyser.frequencyBinCount);
        let clapInProgress = false;

        const detectClap = () => {
          if (stopped) return;
          rafRef.current = requestAnimationFrame(detectClap);
          analyser.getByteFrequencyData(buf);
          const energy = buf.reduce((s, v) => s + v, 0) / buf.length;

          if (energy > 60 && !clapInProgress) {
            clapInProgress = true;
            const now = Date.now();
            const gap = now - lastClapRef.current;

            if (gap < 800 && gap > 60 && clapCountRef.current >= 1) {
              // Second clap detected!
              clapCountRef.current = 0;
              lastClapRef.current = 0;
              if (clapTimerRef.current) { clearTimeout(clapTimerRef.current); clapTimerRef.current = null; }
              setClapCount(0);
              triggerFlash();
              onActivate();
            } else {
              // First clap
              clapCountRef.current = 1;
              lastClapRef.current = now;
              triggerFlash();
              setClapCount(1);
              if (clapTimerRef.current) clearTimeout(clapTimerRef.current);
              clapTimerRef.current = setTimeout(() => {
                clapCountRef.current = 0;
                setClapCount(0);
                clapTimerRef.current = null;
              }, 800);
            }
          } else if (energy < 30) {
            clapInProgress = false;
          }
        };
        rafRef.current = requestAnimationFrame(detectClap);
      } catch { /* microphone not available or permission denied */ }
    };

    startListening();

    return () => {
      stopped = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (clapTimerRef.current) clearTimeout(clapTimerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close().catch(() => {});
    };
  }, [disabled, recording, processing, onActivate, triggerFlash]);

  const btnClass = processing ? "fmb-btn fmb-btn--proc"
    : recording ? "fmb-btn fmb-btn--rec"
    : `fmb-btn fmb-btn--idle${clapFlash ? " fmb-clap-flash" : ""}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="fmb-root" aria-label="Voice control">
        <div className="fmb-outer">
          {!recording && !processing && (
            <>
              <div className="fmb-ring" />
              <div className="fmb-ring fmb-ring-2" />
            </>
          )}
          <button
            className={btnClass}
            onClick={onActivate}
            disabled={disabled}
            aria-label={recording ? "Stop recording" : "Start voice input"}
          >
            {processing ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="26" height="26">
                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeOpacity="0.3"/>
                <path d="M21 12a9 9 0 0 1-4.5 7.8" strokeLinecap="round"/>
              </svg>
            ) : recording ? (
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            )}
          </button>
        </div>

        {showHint && !recording && !processing && (
          <div className="fmb-clap-hint">
            {clapCount === 1 ? "👏 Clap again!" : "👏👏 CLAP TWICE"}
          </div>
        )}
        {recording && (
          <div className="fmb-clap-hint" style={{ color:"#FF3B30", borderColor:"rgba(255,59,48,0.3)" }}>
            LISTENING...
          </div>
        )}
        {processing && (
          <div className="fmb-clap-hint">PROCESSING...</div>
        )}
      </div>
    </>
  );
}
