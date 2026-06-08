import { useEffect, useRef, useState, useCallback } from "react";
import { ScreenKey } from "../TopNav";
import { ThemeSwitcher } from "@/components/botbetter/ThemeProvider";
import "./landing.css";

/* ─── Data ─── */

const BOOT_LINES = [
  "BOTBETTER OS v1.0",
  "Initializing core systems...",
  "Loading Nexus AI...",
  "All systems operational.",
  "Welcome.",
];

const CONNECTORS = [
  { name: "WhatsApp", icon: "📱", color: "#25D366" },
  { name: "Gmail", icon: "📧", color: "#EA4335" },
  { name: "Telegram", icon: "✈️", color: "#2AABEE" },
  { name: "Instagram", icon: "📸", color: "#E1306C" },
  { name: "YouTube", icon: "▶️", color: "#FF0000" },
  { name: "Google Calendar", icon: "📅", color: "#4285F4" },
  { name: "Slack", icon: "💬", color: "#4A154B" },
  { name: "Canva", icon: "🎨", color: "#00C4CC" },
  { name: "Notion", icon: "📝", color: "#FFFFFF" },
  { name: "GitHub", icon: "💻", color: "#8B949E", border: "#333", dark: true },
  { name: "Amazon", icon: "🛒", color: "#FF9900" },
  { name: "Meesho", icon: "🛍️", color: "#9B2D8E" },
  { name: "Zerodha", icon: "📈", color: "#387ED1" },
  { name: "Google Drive", icon: "💾", color: "#0F9D58" },
  { name: "Razorpay", icon: "💳", color: "#3395FF" },
];

const LANGS = [
  { t: "हिंदी", c: "#00D9FF", startX: "-200px", startY: "0", left: "10%", top: "20%" },
  { t: "मराठी", c: "#FF6B00", startX: "200px", startY: "0", left: "70%", top: "15%" },
  { t: "বাংলা", c: "#00FF00", startX: "0", startY: "-200px", left: "40%", top: "10%" },
  { t: "தமிழ்", c: "#FF00FF", startX: "0", startY: "200px", left: "20%", top: "60%" },
  { t: "తెలుగు", c: "#FFFF00", startX: "200px", startY: "200px", left: "60%", top: "70%" },
  { t: "ગુજરાતી", c: "#00D9FF", startX: "200px", startY: "-200px", left: "80%", top: "45%" },
  { t: "ਪੰਜਾਬੀ", c: "#FF6B00", startX: "-200px", startY: "-200px", left: "15%", top: "40%" },
  { t: "ಕನ್ನಡ", c: "#00FF00", startX: "200px", startY: "0", left: "75%", top: "65%" },
  { t: "മലയാളം", c: "#FF00FF", startX: "0", startY: "-200px", left: "45%", top: "80%" },
  { t: "English", c: "#FFFFFF", startX: "0", startY: "200px", left: "40%", top: "40%", lg: true },
];

const STORY_LINES = [
  { text: "BotBetter is India's first agentic AI platform.", highlight: false },
  { text: "", highlight: false },
  { text: "Most AI tools answer your questions.", highlight: false },
  { text: "Nexus executes your commands.", highlight: true },
  { text: "", highlight: false },
  { text: "You say: 'Schedule my week, send Raj a WhatsApp, find trending products on Meesho, and prepare me for my interview tomorrow.'", highlight: false },
  { text: "", highlight: false },
  { text: "Nexus does all 4. Simultaneously. In real time. While you do other things.", highlight: false },
  { text: "", highlight: false },
  { text: "This is not ChatGPT. This is not just a chatbot.", highlight: false },
  { text: "This is an AI that works FOR you.", highlight: true },
];

const CAPABILITIES = [
  { title: "Communication & Tasks", items: ["Send WhatsApp messages on your behalf", "Draft and send emails via Gmail", "Schedule meetings on Google Calendar", "Set reminders and track tasks", "Manage your daily schedule"] },
  { title: "Learning & Growth", items: ["NEET/JEE/UPSC exam preparation", "Personalized study plans", "Mock tests and weak area analysis", "Interview preparation (TCS, Infosys, startups, FAANG)", "Resume building and optimization"] },
  { title: "Business & Selling", items: ["Meesho/Amazon product listing optimization", "Pricing strategy based on competition", "Customer reply templates", "Trending product research", "Sales performance analysis"] },
  { title: "Content & Creativity", items: ["Instagram reel ideas and scripts", "YouTube video scripts and titles", "Viral caption and hashtag generation", "Content calendar planning", "Brand voice consistency"] },
  { title: "Finance & Investment", items: ["Monthly budget planning", "SIP and mutual fund calculations", "Tax saving strategies (Indian tax laws)", "EMI calculations and advice", "Zerodha/Groww investment guidance"] },
  { title: "Fitness & Health", items: ["Personalized workout plans", "Indian food-based diet charts", "Weight loss/gain tracking", "Daily motivation and reminders", "Progress analysis"] },
  { title: "Voice & Language", items: ["Speak in Hindi, Hinglish, or English", "AI responds in your language", "10 Indian regional languages supported", "Voice commands (speak → Nexus executes)", "Voice responses (Nexus speaks back)"] },
  { title: "Platform Intelligence", items: ["Works even when you close the app", "Connects to your favorite apps", "Remembers your preferences", "Learns from your usage patterns", "Multiple tasks simultaneously"] },
];

const COMPARE_ROWS = [
  { feature: "Answers questions", other: "yes", nexus: "yes" },
  { feature: "Executes tasks", other: "no", nexus: "yes" },
  { feature: "Works in Hindi", other: "no", nexus: "yes" },
  { feature: "Background execution", other: "no", nexus: "yes" },
  { feature: "WhatsApp native", other: "no", nexus: "yes" },
  { feature: "Indian context", other: "no", nexus: "yes" },
  { feature: "Multiple tasks at once", other: "no", nexus: "yes" },
  { feature: "Remembers you", other: "partial", nexus: "yes" },
] as const;

const COLS = 5;
const CARD_W = 130;
const CARD_H = 150;
const GAP_X = 24;
const GAP_Y = 20;

/* ─── Audio ─── */

function playBeep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    /* autoplay blocked */
  }
}

function typeText(el: HTMLElement, text: string) {
  let i = 0;
  const interval = setInterval(() => {
    if (i >= text.length) {
      clearInterval(interval);
      el.textContent = text;
      return;
    }
    el.textContent = text.slice(0, ++i) + "▋";
  }, 22);
}

/* ─── Particle canvas hook ─── */

function useParticleCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let mouse = { x: null as number | null, y: null as number | null };
    let raf = 0;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 1.5;
      }
      update() {
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 150) {
            this.x -= dx * 0.01;
            this.y -= dy * 0.01;
          }
        }
        this.x += this.vx;
        this.y += this.vy;
      }
      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(0, 217, 255, 0.5)";
        ctx!.fill();
      }
    }

    const particles: Particle[] = [];

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      if (particles.length === 0) {
        for (let i = 0; i < 100; i++) particles.push(new Particle());
      }
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 217, 255, ${0.2 - dist / 500})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [canvasRef]);
}

/* ─── Draggable connectors ─── */

interface DragState {
  el: HTMLDivElement;
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  dragging: boolean;
  offsetX: number;
  offsetY: number;
  lastX: number;
  lastY: number;
  lastT: number;
}

function ConnectorSpace() {
  const spaceRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<DragState[]>([]);
  const [cards, setCards] = useState(() =>
    CONNECTORS.map((c, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      return {
        ...c,
        homeX: col * (CARD_W + GAP_X) + 20,
        homeY: row * (CARD_H + GAP_Y) + 20,
        tz: Math.random() * 50 - 25,
        delay: Math.random() * 2,
      };
    })
  );

  const rows = Math.ceil(CONNECTORS.length / COLS);
  const spaceW = COLS * (CARD_W + GAP_X) + 20;
  const spaceH = rows * (CARD_H + GAP_Y) + 20;

  const cardRefs = useCallback((el: HTMLDivElement | null, index: number) => {
    if (!el) return;
    const c = cards[index];
    const existing = cardsRef.current[index];
    if (existing?.el === el) return;
    cardsRef.current[index] = {
      el,
      homeX: c.homeX,
      homeY: c.homeY,
      x: c.homeX,
      y: c.homeY,
      vx: 0,
      vy: 0,
      dragging: false,
      offsetX: 0,
      offsetY: 0,
      lastX: 0,
      lastY: 0,
      lastT: 0,
    };
  }, [cards]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const space = spaceRef.current;
      if (!space) return;
      const rect = space.getBoundingClientRect();
      cardsRef.current.forEach((s) => {
        if (!s?.dragging) return;
        const now = Date.now();
        const dt = Math.max(now - s.lastT, 1);
        s.x = e.clientX - rect.left - s.offsetX;
        s.y = e.clientY - rect.top - s.offsetY;
        s.vx = ((e.clientX - s.lastX) / dt) * 16;
        s.vy = ((e.clientY - s.lastY) / dt) * 16;
        s.lastX = e.clientX;
        s.lastY = e.clientY;
        s.lastT = now;
        s.el.style.left = `${s.x}px`;
        s.el.style.top = `${s.y}px`;
      });
    };

    const onUp = () => {
      cardsRef.current.forEach((s) => {
        if (!s?.dragging) return;
        s.dragging = false;
        s.el.classList.remove("dragging");
      });
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);

    let raf = 0;
    const loop = () => {
      cardsRef.current.forEach((s) => {
        if (!s || s.dragging) return;
        if (Math.abs(s.vx) > 0.1 || Math.abs(s.vy) > 0.1) {
          s.x += s.vx;
          s.y += s.vy;
          s.vx *= 0.92;
          s.vy *= 0.92;
          s.el.style.left = `${s.x}px`;
          s.el.style.top = `${s.y}px`;
          s.el.classList.remove("floating");
        } else if (!s.el.classList.contains("floating") && !s.el.classList.contains("snapping")) {
          s.el.classList.add("floating");
        }
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  const onMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    const s = cardsRef.current[index];
    const space = spaceRef.current;
    if (!s || !space) return;
    s.dragging = true;
    s.vx = s.vy = 0;
    s.el.classList.add("dragging");
    s.el.classList.remove("floating", "snapping");
    const rect = space.getBoundingClientRect();
    s.offsetX = e.clientX - rect.left - s.x;
    s.offsetY = e.clientY - rect.top - s.y;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.lastT = Date.now();
  };

  const onDoubleClick = (index: number) => {
    const s = cardsRef.current[index];
    if (!s) return;
    s.dragging = false;
    s.el.classList.remove("dragging");
    s.el.classList.add("snapping");
    s.x = s.homeX;
    s.y = s.homeY;
    s.vx = s.vy = 0;
    s.el.style.left = `${s.homeX}px`;
    s.el.style.top = `${s.homeY}px`;
    setTimeout(() => {
      s.el.classList.remove("snapping");
      s.el.classList.add("floating");
    }, 600);
  };

  return (
    <div className="nl-drone-view">
      <div
        ref={spaceRef}
        className="nl-connector-space"
        style={{ width: spaceW, height: spaceH, margin: "0 auto" }}
      >
        {cards.map((c, i) => (
          <div
            key={c.name}
            ref={(el) => cardRefs(el, i)}
            className="nl-connector-card floating"
            style={{
              left: c.homeX,
              top: c.homeY,
              borderColor: c.border || c.color,
              color: c.color,
              background: c.dark ? "rgba(24,23,23,0.9)" : undefined,
              ["--tz" as string]: `${c.tz}px`,
              animationDelay: `${c.delay}s`,
            }}
            onMouseDown={(e) => onMouseDown(e, i)}
            onDoubleClick={() => onDoubleClick(i)}
          >
            <div className="nl-icon">{c.icon}</div>
            <div className="nl-name">{c.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Landing ─── */

type VoiceState = "idle" | "loading" | "playing";

export function Landing({
  onNavigate: _onNavigate,
  onShowAuth,
}: {
  onNavigate: (s: ScreenKey) => void;
  onShowAuth: (tab: "login" | "signup") => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const platformRef = useRef<HTMLElement>(null);
  const langSectionRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [bootDone, setBootDone] = useState(false);
  const [bootHidden, setBootHidden] = useState(false);
  const [visibleBootLines, setVisibleBootLines] = useState(0);
  const [mainVisible, setMainVisible] = useState(false);
  const [clock, setClock] = useState("IST 00:00:00");
  const [langAnimated, setLangAnimated] = useState(false);
  const [capVisible, setCapVisible] = useState<boolean[]>(() => CAPABILITIES.map(() => false));
  const [voiceState, setVoiceState] = useState<Record<"maya"|"kabir", VoiceState>>({ maya: "idle", kabir: "idle" });
  const [voiceError, setVoiceError] = useState("");

  useParticleCanvas(canvasRef);

  const stopCurrentAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.cancel();
    }
  };

  const playVoiceIntro = useCallback(async (personality: "maya" | "kabir") => {
    stopCurrentAudio();
    setVoiceState((s) => ({ ...s, [personality]: "loading" }));
    setVoiceError("");
    const other = personality === "maya" ? "kabir" : "maya";
    setVoiceState((s) => ({ ...s, [other]: "idle" }));

    try {
      const base = (import.meta.env.VITE_API_URL as string) ?? "";
      const res = await fetch(`${base}/api/voice/intro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personality }),
      });
      const data = await res.json() as { success: boolean; audioBase64?: string; message?: string };
      if (!data.success || !data.audioBase64) throw new Error(data.message || "No audio");

      // Try multiple MIME types — Sarvam may return WAV or MP3
      let audio: HTMLAudioElement | null = null;
      for (const mime of ["audio/wav", "audio/mpeg", "audio/ogg"]) {
        try {
          const a = new Audio(`data:${mime};base64,${data.audioBase64}`);
          await a.play();
          audio = a;
          break;
        } catch {
          /* try next mime */
        }
      }
      if (!audio) throw new Error("Audio playback failed for all MIME types");
      audioRef.current = audio;
      setVoiceState((s) => ({ ...s, [personality]: "playing" }));
      audio.onended = () => setVoiceState((s) => ({ ...s, [personality]: "idle" }));
    } catch (err) {
      console.error("[Landing] Voice intro failed:", err);
      setVoiceState((s) => ({ ...s, [personality]: "idle" }));
      // Fallback to browser TTS
      try {
        if (window.speechSynthesis) {
          const MAYA_TEXT = "Hi! I am Maya, your personal AI from BotBetter. I can manage your schedule, send messages, and much more. Click Login to get started.";
          const KABIR_TEXT = "Kabir here. BotBetter's execution engine. Give me a command and I'll get it done. Login to begin.";
          const utt = new SpeechSynthesisUtterance(personality === "kabir" ? KABIR_TEXT : MAYA_TEXT);
          utt.lang = "en-IN";
          utt.rate = 0.95;
          utt.pitch = personality === "maya" ? 1.2 : 0.85;
          setVoiceState((s) => ({ ...s, [personality]: "playing" }));
          utt.onend = () => setVoiceState((s) => ({ ...s, [personality]: "idle" }));
          window.speechSynthesis.speak(utt);
        } else {
          setVoiceError("Voice unavailable right now. Try again!");
        }
      } catch {
        setVoiceError("Voice unavailable right now. Try again!");
      }
    }
  }, []);

  const stopVoice = (personality: "maya" | "kabir") => {
    stopCurrentAudio();
    setVoiceState((s) => ({ ...s, [personality]: "idle" }));
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  /* Boot sequence */
  useEffect(() => {
    let delay = 500;
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach((_, index) => {
      timers.push(
        setTimeout(() => {
          setVisibleBootLines(index + 1);
          playBeep();
        }, delay)
      );
      delay += 600;
    });

    timers.push(
      setTimeout(() => {
        setBootDone(true);
        setTimeout(() => {
          setBootHidden(true);
          setMainVisible(true);
          // Auto-play Maya intro after boot
          setTimeout(() => playVoiceIntro("maya"), 1200);
        }, 500);
      }, delay + 500)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  /* IST clock */
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(
        "IST " +
          d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: false })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* Intersection observers */
  useEffect(() => {
    const langObs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setLangAnimated(true);
          langObs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (langSectionRef.current) langObs.observe(langSectionRef.current);

    const platObs = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        STORY_LINES.forEach((line, i) => {
          if (!line.text) return;
          setTimeout(() => {
            const el = storyRef.current?.children[i] as HTMLElement | undefined;
            if (el) typeText(el, line.text);
          }, i * 350);
        });
        CAPABILITIES.forEach((_, i) => {
          setTimeout(() => {
            setCapVisible((prev) => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
          }, i * 120);
        });
        platObs.disconnect();
      },
      { threshold: 0.2 }
    );
    if (platformRef.current) platObs.observe(platformRef.current);

    return () => {
      langObs.disconnect();
      platObs.disconnect();
    };
  }, [mainVisible]);

  return (
    <div className="nexus-landing">
      {/* Boot */}
      <div
        className={`nl-boot-screen${bootDone ? " hide" : ""}`}
        style={bootHidden ? { display: "none" } : undefined}
        aria-hidden={bootHidden}
      >
        {BOOT_LINES.map((line, i) => (
          <div
            key={line}
            className={`nl-boot-line${i < visibleBootLines ? " show" : ""}`}
          >
            {line}
          </div>
        ))}
      </div>

      <div className={`nl-main${mainVisible ? " show" : ""}`}>
        <canvas ref={canvasRef} className="nl-bg-canvas" aria-hidden />
        <div className="nl-grid-overlay" aria-hidden />
        <div className="nl-scan-line" aria-hidden />

        {/* Landing top bar — login + theme toggle */}
        <div style={{
          position:"fixed", top:0, left:0, right:0, zIndex:200,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 24px", height:52,
          background:"rgba(2,5,16,0.7)", backdropFilter:"blur(10px)",
          borderBottom:"1px solid rgba(0,212,255,0.1)",
        }}>
          <span style={{ fontSize:13, fontWeight:700, letterSpacing:3, color:"var(--bb-accent,#00D4FF)", fontFamily:"Orbitron,sans-serif" }}>
            BOTBETTER
          </span>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <ThemeSwitcher />
            <button
              onClick={() => onShowAuth("login")}
              style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, padding:"6px 14px", borderRadius:6,
                border:"1px solid rgba(0,212,255,0.35)", background:"rgba(0,212,255,0.06)",
                color:"var(--bb-accent,#00D4FF)", cursor:"pointer", fontFamily:"Share Tech Mono,monospace" }}>
              LOGIN
            </button>
            <button
              onClick={() => onShowAuth("signup")}
              style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, padding:"6px 14px", borderRadius:6,
                background:"linear-gradient(135deg,#00D4FF,#FF007F)", border:"none",
                color:"#fff", cursor:"pointer", fontFamily:"Share Tech Mono,monospace" }}>
              SIGN UP
            </button>
          </div>
        </div>

        {/* HUD */}
        <div className="nl-hud nl-hud-tl">
          <div>SYSTEM STATUS</div>
          <div><span className="nl-dot" />NEXUS ONLINE</div>
          <div><span className="nl-dot" />VOICE ACTIVE</div>
          <div><span className="nl-dot" />API CONNECTED</div>
        </div>
        <div className="nl-hud nl-hud-tr">
          <div>{clock}</div>
          <div>UPTIME: 99.99%</div>
          <div>USERS: 500+</div>
        </div>
        <div className="nl-hud nl-hud-bl">
          <div className="nl-radar" />
        </div>
        <div className="nl-hud nl-hud-br">
          <div>SYSTEM LOAD</div>
          <div className="nl-chart-container">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="nl-chart-bar" />
            ))}
          </div>
        </div>

        {/* Hero */}
        <section>
          <div className="nl-hero-pretitle">B O T B E T T E R</div>
          <div className="nl-arc-reactor">
            <div className="nl-arc-ring nl-arc-ring-1" />
            <div className="nl-arc-ring nl-arc-ring-2" />
            <div className="nl-arc-ring nl-arc-ring-3" />
            <div className="nl-arc-ring nl-arc-ring-4" />
            <div className="nl-arc-ring nl-arc-ring-5" />
            <div className="nl-arc-core" />
          </div>
          <h1 className="nl-hero-title">Meet Nexus.</h1>
          <h2 className="nl-hero-subtitle">Your AI. Your commands. Executed.</h2>
          <div className="nl-status-row">
            <div className="nl-status-pill">● ONLINE</div>
            <div className="nl-status-pill">⚡ 8 CAPABILITIES</div>
            <div className="nl-status-pill">🇮🇳 INDIA FIRST</div>
            <div className="nl-status-pill">🔊 VOICE READY</div>
          </div>
          <div className="nl-cta-group">
            <button type="button" className="nl-btn nl-btn-primary" onClick={() => onShowAuth("signup")}>
              INITIALIZE NEXUS →
            </button>
            <button type="button" className="nl-btn nl-btn-secondary" onClick={() => scrollTo("nl-platform")}>
              SYSTEM OVERVIEW
            </button>
          </div>
        </section>

        {/* Maya & Kabir */}
        <section id="nl-personalities">
          <div className="nl-personality-split">
            <div className="nl-persona-divider" />
            <div className="nl-or-badge">OR</div>

            <div className="nl-persona-side nl-persona-maya">
              <div
                className="nl-persona-avatar-wrap"
                style={{ cursor:"pointer" }}
                onClick={() => voiceState.maya === "playing" ? stopVoice("maya") : playVoiceIntro("maya")}
                title={voiceState.maya === "playing" ? "Pause Maya" : "Hear Maya"}
              >
                <div className="nl-persona-ring nl-maya-ring-1"
                  style={voiceState.maya === "playing" ? { animationDuration:"3s", borderColor:"rgba(155,89,255,0.9)" } : undefined} />
                <div className="nl-persona-ring nl-maya-ring-2"
                  style={voiceState.maya === "playing" ? { animationDuration:"4s" } : undefined} />
                <div className="nl-persona-avatar nl-maya-avatar"
                  style={voiceState.maya === "playing" ? { boxShadow:"0 0 70px rgba(155,89,255,0.9)" } : undefined}>
                  {voiceState.maya === "loading" ? "⏳" : voiceState.maya === "playing" ? "⏸" : "M"}
                </div>
              </div>
              <h2 className="nl-persona-name">MAYA</h2>
              <p className="nl-persona-tagline">Gentle. Intuitive. Always listening.</p>
              <p className="nl-persona-desc">
                MAYA speaks your language — literally. Hindi, Hinglish, or English.
                She remembers everything about you and gets things done before you ask.
              </p>
              <div style={{ display:"flex", gap:10, marginBottom:16 }}>
                <button type="button" className="nl-btn nl-btn-maya"
                  style={{ padding:"8px 18px", fontSize:12 }}
                  onClick={() => voiceState.maya === "playing" ? stopVoice("maya") : playVoiceIntro("maya")}>
                  {voiceState.maya === "loading" ? "⏳ Loading..." : voiceState.maya === "playing" ? "⏸ Pause" : "🔊 Hear Maya"}
                </button>
                <button type="button" className="nl-btn nl-btn-maya" onClick={() => onShowAuth("signup")}
                  style={{ padding:"8px 18px", fontSize:12 }}>
                  Choose Maya →
                </button>
              </div>
            </div>

            <div className="nl-persona-side nl-persona-kabir">
              <div
                className="nl-persona-avatar-wrap"
                style={{ cursor:"pointer" }}
                onClick={() => voiceState.kabir === "playing" ? stopVoice("kabir") : playVoiceIntro("kabir")}
                title={voiceState.kabir === "playing" ? "Pause Kabir" : "Hear Kabir"}
              >
                <div className="nl-persona-ring nl-kabir-ring-1"
                  style={voiceState.kabir === "playing" ? { animationDuration:"1s", borderColor:"rgba(0,217,255,0.9)" } : undefined} />
                <div className="nl-persona-ring nl-kabir-ring-2"
                  style={voiceState.kabir === "playing" ? { animationDuration:"1.5s" } : undefined} />
                <div className="nl-persona-avatar nl-kabir-avatar"
                  style={voiceState.kabir === "playing" ? { boxShadow:"0 0 70px rgba(0,217,255,0.9)" } : undefined}>
                  {voiceState.kabir === "loading" ? "⏳" : voiceState.kabir === "playing" ? "⏸" : "K"}
                </div>
              </div>
              <h2 className="nl-persona-name">KABIR</h2>
              <p className="nl-persona-tagline">Precise. Powerful. Execution-first.</p>
              <p className="nl-persona-desc">
                KABIR doesn&apos;t wait. He executes simultaneously, tracks every task,
                and reports back when done.
              </p>
              <div style={{ display:"flex", gap:10, marginBottom:16 }}>
                <button type="button" className="nl-btn nl-btn-kabir"
                  style={{ padding:"8px 18px", fontSize:12 }}
                  onClick={() => voiceState.kabir === "playing" ? stopVoice("kabir") : playVoiceIntro("kabir")}>
                  {voiceState.kabir === "loading" ? "⏳ Loading..." : voiceState.kabir === "playing" ? "⏸ Pause" : "🔊 Hear Kabir"}
                </button>
                <button type="button" className="nl-btn nl-btn-kabir" onClick={() => onShowAuth("signup")}
                  style={{ padding:"8px 18px", fontSize:12 }}>
                  Choose Kabir →
                </button>
              </div>
            </div>

            <p className="nl-persona-footer">
              Both powered by Nexus Core. Same intelligence. Different personality.
              {voiceError && <span style={{ color:"#ff007f", display:"block", marginTop:4, fontSize:11 }}>{voiceError}</span>}
            </p>
          </div>
        </section>

        {/* Connectors */}
        <section>
          <h2 className="nl-section-title">CONNECT EVERYTHING</h2>
          <p className="nl-section-subtitle">Drone view active. 50+ integrations online.</p>
          <ConnectorSpace />
        </section>

        {/* Languages */}
        <section id="nl-language-section" ref={langSectionRef}>
          <h2 className="nl-section-title">SPEAKS YOUR LANGUAGE</h2>
          <div className="nl-lang-canvas">
            {LANGS.map((l, i) => (
              <div
                key={l.t}
                className={`nl-lang-word${langAnimated ? " animate" : ""}`}
                style={{
                  color: l.c,
                  left: l.left,
                  top: l.top,
                  fontSize: l.lg ? "48px" : undefined,
                  ["--startX" as string]: l.startX,
                  ["--startY" as string]: l.startY,
                  animationDelay: langAnimated ? `${i * 0.15}s` : undefined,
                }}
              >
                {l.t}
              </div>
            ))}
          </div>
        </section>

        {/* Platform */}
        <section id="nl-platform" ref={platformRef}>
          <div className="nl-platform-headlines">
            <h2>This isn&apos;t just an AI assistant.</h2>
            <h2 className="nl-accent">This is your execution engine.</h2>
          </div>

          <div className="nl-platform-columns">
            <div className="nl-platform-story" ref={storyRef}>
              {STORY_LINES.map((line, i) => (
                <div
                  key={i}
                  className={`nl-typed-line${line.highlight ? " nl-highlight-line" : ""}`}
                />
              ))}
            </div>

            <div className="nl-cap-grid">
              {CAPABILITIES.map((cap, i) => (
                <div key={cap.title} className={`nl-cap-card${capVisible[i] ? " visible" : ""}`}>
                  <h4>{cap.title}</h4>
                  <ul>
                    {cap.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="nl-compare-statement">
            <p>Other AIs answer questions.</p>
            <p className="nl-accent">Nexus takes action.</p>
          </div>

          <table className="nl-compare-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Other AI Tools</th>
                <th>Nexus (BotBetter)</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.feature}>
                  <td>{row.feature}</td>
                  <td className={row.other === "yes" ? "nl-yes" : row.other === "partial" ? "nl-partial" : "nl-no"}>
                    {row.other === "yes" ? "✓" : row.other === "partial" ? "Partial" : "✗"}
                  </td>
                  <td className="nl-yes">✓</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Final CTA */}
        <section className="nl-final-cta">
          <div className="nl-arc-mini" />
          <h2>READY TO INITIALIZE?</h2>
          <button type="button" className="nl-btn-launch" onClick={() => onShowAuth("signup")}>
            LAUNCH NEXUS →
          </button>
          <div className="nl-cta-footer">
            Free beta • No credit card • India&apos;s first agentic AI
          </div>
        </section>
      </div>
    </div>
  );
}

export default Landing;
