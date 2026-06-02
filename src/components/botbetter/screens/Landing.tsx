import { useRef, useState, useEffect, useMemo } from "react";
import { ScreenKey } from "../TopNav";
import {
  ArrowRight, Zap, MessageSquare, CheckCircle2, Sparkles,
  Mic, Lock, Users, TrendingUp, Bot, GraduationCap,
  ShoppingCart, Video, DollarSign, BookOpen, Activity,
  ChevronRight, Globe, Smartphone, Monitor, Plus,
} from "lucide-react";

/* ═══════════════════════════ HOOKS ═══════════════════════════ */

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, v] as const;
}

function useCounter(target: number, ms = 2000, on = false) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) return;
    const t0 = performance.now();
    const f = (now: number) => {
      const p = Math.min((now - t0) / ms, 1);
      setN(Math.round((1 - (1 - p) ** 3) * target));
      if (p < 1) requestAnimationFrame(f); else setN(target);
    };
    requestAnimationFrame(f);
  }, [on, target, ms]);
  return n;
}

/* ═══════════════════════════ DATA ═══════════════════════════ */

const AGENTS = [
  { emoji: "⚡", name: "Nexus", role: "AI Orchestrator", color: "#6C00FF", bg: "rgba(108,0,255,0.08)", border: "rgba(108,0,255,0.25)", tags: ["Routes all tasks", "Understands you", "Works 24/7"] },
  { emoji: "🤖", name: "Buddy", role: "WhatsApp & Chat", color: "#3B82F6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)", tags: ["WhatsApp", "Telegram", "Quick replies"] },
  { emoji: "🎤", name: "Prepify", role: "Interview & Learning", color: "#10B981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", tags: ["Mock interviews", "Study plans", "NEET/JEE"] },
  { emoji: "🛒", name: "Sellio", role: "Shopping & Commerce", color: "#F97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.25)", tags: ["Find deals", "Track prices", "Amazon"] },
  { emoji: "🎬", name: "Creato", role: "Content Creation", color: "#FF3CAC", bg: "rgba(255,60,172,0.08)", border: "rgba(255,60,172,0.25)", tags: ["Captions", "Reel scripts", "Canva help"] },
  { emoji: "💰", name: "Finio", role: "Finance & Investing", color: "#14B8A6", bg: "rgba(20,184,166,0.08)", border: "rgba(20,184,166,0.25)", tags: ["Budget tracking", "Stock alerts", "Zerodha"] },
  { emoji: "📚", name: "Cracky", role: "Exams & Coaching", color: "#F59E0B", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", tags: ["UPSC prep", "CA prep", "Daily quizzes"] },
  { emoji: "💪", name: "FlexAI", role: "Health & Fitness", color: "#EF4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", tags: ["Workout plans", "Diet tracking", "Progress"] },
];

const CONNECTORS_ROW1 = [
  { name: "WhatsApp", color: "#25D366", emoji: "💬" },
  { name: "Gmail", color: "#EA4335", emoji: "📧" },
  { name: "Telegram", color: "#2CA5E0", emoji: "✈️" },
  { name: "Canva", color: "#00C4CC", emoji: "🎨" },
  { name: "Slack", color: "#4A154B", emoji: "💼" },
  { name: "Notion", color: "#374151", emoji: "📝" },
  { name: "Drive", color: "#4285F4", emoji: "📁" },
  { name: "Calendar", color: "#1A73E8", emoji: "📅" },
];
const CONNECTORS_ROW2 = [
  { name: "Instagram", color: "#E1306C", emoji: "📸" },
  { name: "YouTube", color: "#FF0000", emoji: "▶️" },
  { name: "Meesho", color: "#FF5655", emoji: "🛍️" },
  { name: "Amazon", color: "#FF9900", emoji: "📦" },
  { name: "Zerodha", color: "#387ED1", emoji: "📈" },
  { name: "Razorpay", color: "#2D85FF", emoji: "💳" },
  { name: "GitHub", color: "#333333", emoji: "🔧" },
  { name: "Sheets", color: "#0F9D58", emoji: "📊" },
];

const HINGLISH_COMMANDS = [
  { cmd: "Raj ko WhatsApp karo — aaj 4 baje milte hain", agent: "Buddy", agentEmoji: "🤖", color: "#3B82F6", result: "WhatsApp sent to Raj ✓" },
  { cmd: "Mera NEET schedule banao — exam 60 din mein hai", agent: "Prepify", agentEmoji: "🎤", color: "#10B981", result: "60-day NEET plan created ✓" },
  { cmd: "Amazon pe ₹500 se kam sneakers dikhao", agent: "Sellio", agentEmoji: "🛒", color: "#F97316", result: "12 deals found under ₹500 ✓" },
  { cmd: "Aaj ka news summarize karo", agent: "Nexus", agentEmoji: "⚡", color: "#6C00FF", result: "Top 5 stories ready ✓" },
  { cmd: "Is hafte ka budget check karo", agent: "Finio", agentEmoji: "💰", color: "#14B8A6", result: "₹3,200 remaining this week ✓" },
];

const VOICE_LANGS = ["हिंदी", "English", "मराठी", "ਪੰਜਾਬੀ", "বাংলা", "தமிழ்", " తెలుగు", "ಕನ್ನಡ"];

type LangKey = "en"|"hi"|"mr"|"bn"|"ta"|"te"|"gu"|"pa"|"kn"|"ml";
const STORY_LANGS: Record<LangKey, { flag: string; label: string; text: string[] }> = {
  en: { flag: "🌐", label: "English", text: [
    "We were lazy. We delayed tasks. We made avoidable mistakes.",
    "Every day — 10 different AI tools, copy-pasting between them,",
    "still doing everything manually.",
    "So we asked: What if AI could just DO it for us?",
    "Not answer. Not suggest. Actually DO it.",
    "That's why we built Nexus.",
    "India's first AI that works FOR you — not the other way around.",
  ]},
  hi: { flag: "🇮🇳", label: "हिंदी", text: [
    "हम आलसी थे। काम टालते थे। गलतियाँ करते थे।",
    "हर दिन 10 अलग AI tools, सब में copy-paste,",
    "फिर भी सब manually करना पड़ता था।",
    "तो हमने सोचा — क्या AI बस कर नहीं सकता?",
    "जवाब नहीं, सुझाव नहीं — बस कर दो।",
    "इसीलिए हमने Nexus बनाया।",
    "India का पहला AI जो आपके लिए काम करता है।",
  ]},
  mr: { flag: "🇮🇳", label: "मराठी", text: [
    "आम्ही आळशी होतो. काम पुढे ढकलत होतो.",
    "रोज 10 वेगळी AI tools, सगळ्यात copy-paste,",
    "तरीही सगळं manually करावं लागत होतं.",
    "म्हणून विचार केला — AI फक्त करू शकत नाही का?",
    "म्हणूनच आम्ही Nexus बनवला.",
    "India चा पहिला AI जो तुमच्यासाठी काम करतो.",
  ]},
  bn: { flag: "🇮🇳", label: "বাংলা", text: [
    "আমরা অলস ছিলাম। কাজ পিছিয়ে দিতাম।",
    "প্রতিদিন ১০টা AI tool, সব জায়গায় copy-paste,",
    "তবুও সব manually করতে হতো।",
    "তাই ভাবলাম — AI কি শুধু করতে পারে না?",
    "সেজন্যই আমরা Nexus বানিয়েছি।",
    "India-র প্রথম AI যা আপনার জন্য কাজ করে।",
  ]},
  ta: { flag: "🇮🇳", label: "தமிழ்", text: [
    "நாங்கள் சோம்பேறிகளாக இருந்தோம்.",
    "தினமும் 10 AI கருவிகள், எல்லாவற்றிலும் copy-paste,",
    "இருந்தும் எல்லாவற்றையும் manually செய்ய வேண்டும்.",
    "அதனால் யோசித்தோம் — AI செய்து விட முடியாதா?",
    "அதனால்தான் Nexus உருவாக்கினோம்.",
    "உங்களுக்காக வேலை செய்யும் India-வின் முதல் AI.",
  ]},
  te: { flag: "🇮🇳", label: "తెలుగు", text: [
    "మేము సోమరిగా ఉన్నాము. పని వాయిదా వేసేవాళ్ళము.",
    "రోజూ 10 AI tools, అన్నింటిలో copy-paste,",
    "అయినా అన్నీ manually చేయాల్సి వచ్చేది.",
    "అందుకే అనుకున్నాము — AI చేయలేదా?",
    "అందుకే Nexus తయారు చేశాము.",
    "మీ కోసం పని చేసే India మొదటి AI.",
  ]},
  gu: { flag: "🇮🇳", label: "ગુજરાતી", text: [
    "અમે આળસુ હતા. કામ ટાળતા હતા.",
    "રોજ 10 AI tools, બધામાં copy-paste,",
    "છતાં બધું manually કરવું પડતું.",
    "એટલે વિચાર્યું — AI ફક્ત કરી શકે નહીં?",
    "એટલે જ Nexus બનાવ્યું.",
    "તમારા માટે કામ કરતું India નું પ્રથમ AI.",
  ]},
  pa: { flag: "🇮🇳", label: "ਪੰਜਾਬੀ", text: [
    "ਅਸੀਂ ਆਲਸੀ ਸੀ। ਕੰਮ ਟਾਲਦੇ ਸੀ।",
    "ਹਰ ਰੋਜ਼ 10 AI tools, ਸਭ ਵਿੱਚ copy-paste,",
    "ਫਿਰ ਵੀ ਸਭ manually ਕਰਨਾ ਪੈਂਦਾ ਸੀ।",
    "ਇਸ ਲਈ ਸੋਚਿਆ — AI ਬੱਸ ਕਰ ਨਹੀਂ ਸਕਦਾ?",
    "ਇਸ ਲਈ ਹੀ Nexus ਬਣਾਇਆ।",
    "ਤੁਹਾਡੇ ਲਈ ਕੰਮ ਕਰਨ ਵਾਲਾ India ਦਾ ਪਹਿਲਾ AI।",
  ]},
  kn: { flag: "🇮🇳", label: "ಕನ್ನಡ", text: [
    "ನಾವು ಸೋಮಾರಿಗಳಾಗಿದ್ದೆವು. ಕೆಲಸ ಮುಂದೂಡುತ್ತಿದ್ದೆವು.",
    "ಪ್ರತಿದಿನ 10 AI tools, ಎಲ್ಲದರಲ್ಲೂ copy-paste,",
    "ಆದರೂ ಎಲ್ಲವನ್ನೂ manually ಮಾಡಬೇಕಿತ್ತು.",
    "ಹಾಗಾಗಿ ಯೋಚಿಸಿದೆವು — AI ಮಾಡಬಾರದೇ?",
    "ಅದಕ್ಕಾಗಿಯೇ Nexus ಮಾಡಿದೆವು.",
    "ನಿಮಗಾಗಿ ಕೆಲಸ ಮಾಡುವ India ದ ಮೊದಲ AI.",
  ]},
  ml: { flag: "🇮🇳", label: "മലയാളം", text: [
    "ഞങ്ങൾ മടിയന്മാരായിരുന്നു. ജോലി നീട്ടിവെക്കുമായിരുന്നു.",
    "എല്ലാ ദിവസവും 10 AI tools, എല്ലാത്തിലും copy-paste,",
    "എന്നിട്ടും എല്ലാം manually ചെയ്യേണ്ടി വന്നു.",
    "അതുകൊണ്ട് ചിന്തിച്ചു — AI ചെയ്താൽ പോരേ?",
    "അതുകൊണ്ടാണ് Nexus ഉണ്ടാക്കിയത്.",
    "നിങ്ങൾക്കായി പ്രവർത്തിക്കുന്ന India-യുടെ ആദ്യ AI.",
  ]},
};

const LANG_ORDER: LangKey[] = ["en","hi","mr","bn","ta","te","gu","pa","kn","ml"];

/* ═══════════════════════════ CSS ═══════════════════════════ */

const CSS = `
.bb3 { font-family: 'Space Grotesk', sans-serif; background: #ffffff; color: #0A0A0F; }
.bb3 * { font-family: inherit; box-sizing: border-box; }

@keyframes bb3-fade-up   { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:translateY(0) } }
@keyframes bb3-fade-in   { from { opacity:0 } to { opacity:1 } }
@keyframes bb3-float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
@keyframes bb3-float-sm  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
@keyframes bb3-pulse-ring { 0%{transform:translate(-50%,-50%) scale(0.85);opacity:0.65} 100%{transform:translate(-50%,-50%) scale(2.6);opacity:0} }
@keyframes bb3-orb-breathe { 0%,100%{filter:blur(44px);opacity:0.75} 50%{filter:blur(56px);opacity:1} }
@keyframes bb3-spin       { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes bb3-spin-r     { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
@keyframes bb3-marquee    { from{transform:translateX(0)} to{transform:translateX(-50%)} }
@keyframes bb3-marquee-r  { from{transform:translateX(-50%)} to{transform:translateX(0)} }
@keyframes bb3-cursor-blink { 0%,100%{opacity:1} 50%{opacity:0} }
@keyframes bb3-bar-wave   { 0%,100%{height:5px} 50%{height:22px} }
@keyframes bb3-chaos-a    { 0%,100%{transform:translate(0,0) rotate(0deg)} 33%{transform:translate(-10px,-14px) rotate(-6deg)} 66%{transform:translate(8px,6px) rotate(4deg)} }
@keyframes bb3-chaos-b    { 0%,100%{transform:translate(0,0) rotate(0deg)} 25%{transform:translate(12px,-9px) rotate(8deg)} 75%{transform:translate(-7px,11px) rotate(-5deg)} }
@keyframes bb3-chaos-c    { 0%,100%{transform:translate(0,0) rotate(0deg)} 40%{transform:translate(-14px,9px) rotate(-9deg)} 80%{transform:translate(7px,-11px) rotate(6deg)} }
@keyframes bb3-chaos-d    { 0%,100%{transform:translate(0,0) rotate(0deg)} 20%{transform:translate(9px,13px) rotate(7deg)} 70%{transform:translate(-11px,-7px) rotate(-4deg)} }
@keyframes bb3-bounce-in  { 0%{transform:scale(0.2);opacity:0} 60%{transform:scale(1.08);opacity:1} 80%{transform:scale(0.96)} 100%{transform:scale(1)} }
@keyframes bb3-step-in    { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
@keyframes bb3-confetti   { 0%{transform:translate(0,0) rotate(0deg);opacity:1} 100%{transform:translate(var(--cx),80px) rotate(var(--cr));opacity:0} }
@keyframes bb3-ping       { 0%{transform:scale(1);opacity:0.7} 75%,100%{transform:scale(1.9);opacity:0} }
@keyframes bb3-gradient-bg { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes bb3-twinkle    { 0%,100%{opacity:0.7;transform:scale(1)} 50%{opacity:0.1;transform:scale(0.4)} }
@keyframes bb3-slide-l    { from{opacity:0;transform:translateX(-36px)} to{opacity:1;transform:translateX(0)} }
@keyframes bb3-slide-r    { from{opacity:0;transform:translateX(36px)} to{opacity:1;transform:translateX(0)} }
@keyframes bb3-scale-in   { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
@keyframes bb3-count-up   { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }

.bb3-gradient-text {
  background: linear-gradient(135deg, #6C00FF 0%, #FF3CAC 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.bb3-gradient-text-gold {
  background: linear-gradient(135deg, #FFD700 0%, #FF8C00 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.bb3-card {
  background: #F8F5FF; border: 1px solid #E9E0FF; border-radius: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.bb3-card:hover { transform: translateY(-4px); box-shadow: 0 24px 60px rgba(108,0,255,0.1); }

.bb3-card-gb {
  background: #F8F5FF; border-radius: 20px; position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.bb3-card-gb::before {
  content:''; position:absolute; inset:-1.5px; border-radius:21.5px;
  background: linear-gradient(135deg, #6C00FF, #FF3CAC); z-index:-1;
}
.bb3-card-gb:hover { transform: translateY(-4px); box-shadow: 0 24px 60px rgba(108,0,255,0.18); }

.bb3-btn {
  background: #6C00FF; color: #fff; border: none; border-radius: 100px;
  padding: 14px 32px; font-size: 15px; font-weight: 700; cursor: pointer;
  transition: all 0.22s ease; font-family: 'Space Grotesk', sans-serif; display:inline-flex; align-items:center; gap:8px;
}
.bb3-btn:hover { background: #5500CC; transform: scale(1.04); box-shadow: 0 14px 40px rgba(108,0,255,0.38); }

.bb3-btn-outline {
  background: transparent; color: #0A0A0F; border: 2px solid #E9E0FF; border-radius: 100px;
  padding: 14px 32px; font-size: 15px; font-weight: 600; cursor: pointer;
  transition: all 0.22s ease; font-family: 'Space Grotesk', sans-serif; display:inline-flex; align-items:center; gap:8px;
}
.bb3-btn-outline:hover { border-color: #6C00FF; color: #6C00FF; transform: scale(1.02); }

.bb3-tag {
  background: rgba(108,0,255,0.08); color: #6C00FF; border-radius: 100px;
  padding: 4px 12px; font-size: 12px; font-weight: 600; display:inline-block;
}

.bb3-noise-overlay {
  position: fixed; inset: 0; pointer-events: none; z-index: 9999; opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.bb3-marquee-wrap { overflow: hidden; }
.bb3-marquee-t    { display:flex; gap:16px; width:max-content; animation: bb3-marquee 26s linear infinite; }
.bb3-marquee-t-r  { display:flex; gap:16px; width:max-content; animation: bb3-marquee-r 26s linear infinite; }
.bb3-marquee-wrap:hover .bb3-marquee-t,
.bb3-marquee-wrap:hover .bb3-marquee-t-r { animation-play-state: paused; }

.bb3-phone {
  background:#1A1A2E; border-radius:36px; padding:10px;
  box-shadow: 0 40px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.08);
}
.bb3-phone-screen { background:#0D0D1A; border-radius:28px; overflow:hidden; }
.bb3-laptop {
  background:#E5E5E5; border-radius:16px 16px 0 0; padding:8px;
  box-shadow: 0 40px 80px rgba(0,0,0,0.12);
}
.bb3-laptop-screen { background:#0A0A0F; border-radius:10px; overflow:hidden; }
.bb3-laptop-base { background:linear-gradient(#D0D0D0,#B8B8B8); height:14px; border-radius:0 0 8px 8px; }

.bb3-device-tilt-l { transform: perspective(1200px) rotateY(16deg) rotateX(3deg); transition: transform 0.5s ease; }
.bb3-device-tilt-r { transform: perspective(1200px) rotateY(-16deg) rotateX(3deg); transition: transform 0.5s ease; }
.bb3-device-tilt-l:hover, .bb3-device-tilt-r:hover { transform: perspective(1200px) rotateY(0deg) rotateX(0deg); }

.bb3-lang-btn {
  background: #F8F5FF; border: 1.5px solid #E9E0FF; border-radius: 12px;
  padding: 10px 16px; cursor: pointer; font-family:'Space Grotesk',sans-serif;
  font-size:13px; font-weight:600; color:#0A0A0F; transition: all 0.2s ease;
  display:flex; align-items:center; gap:8px; white-space:nowrap;
}
.bb3-lang-btn:hover { border-color:#6C00FF; color:#6C00FF; background:rgba(108,0,255,0.05); }
.bb3-lang-btn.active { border-color:#6C00FF; background:rgba(108,0,255,0.08); color:#6C00FF; }
`;

/* ═══════════════════════════ SUB-COMPONENTS ═══════════════════════════ */

const GlowOrb = ({ size = 220, rings = true }: { size?: number; rings?: boolean }) => (
  <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
    <div style={{
      position: "absolute", inset: "-40%",
      background: "radial-gradient(circle, rgba(108,0,255,0.32) 0%, rgba(255,60,172,0.14) 55%, transparent 72%)",
      animation: "bb3-orb-breathe 3.5s ease-in-out infinite", borderRadius: "50%",
    }} />
    {rings && [1.5, 1.9, 2.4].map((s, i) => (
      <div key={i} style={{
        position: "absolute", top: "50%", left: "50%", width: size * s, height: size * s,
        borderRadius: "50%",
        border: i === 0 ? "1.5px solid rgba(108,0,255,0.3)" : "1px solid rgba(255,60,172,0.18)",
        animation: `bb3-pulse-ring ${2.8 + i * 0.9}s ease-out ${i * 0.9}s infinite`,
      }} />
    ))}
    <div style={{
      position: "absolute", inset: 0, borderRadius: "50%",
      background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, #6C00FF 45%, #FF3CAC 80%)",
      boxShadow: "0 0 80px rgba(108,0,255,0.55), 0 0 30px rgba(255,60,172,0.25), inset 0 0 20px rgba(255,255,255,0.2)",
    }} />
  </div>
);

const FloatParticle = ({ color, size, x, y, delay, duration }: {
  color: string; size: number; x: number; y: number; delay: number; duration: number;
}) => (
  <div style={{
    position: "absolute", left: `${x}%`, top: `${y}%`,
    width: size, height: size, borderRadius: "50%", background: color,
    opacity: 0.7, animation: `bb3-float ${duration}s ${delay}s ease-in-out infinite`,
    filter: "blur(1px)",
  }} />
);

/* ═══════════════════════════ SECTION: HOW IT WORKS ═══════════════════════════ */

function HowItWorks() {
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "thinking" | "done">("typing");
  const cmd = HINGLISH_COMMANDS[idx];

  useEffect(() => {
    setCharIdx(0);
    setPhase("typing");
  }, [idx]);

  useEffect(() => {
    if (phase === "typing") {
      if (charIdx < cmd.cmd.length) {
        const t = setTimeout(() => setCharIdx(c => c + 1), 38);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase("thinking"), 500);
        return () => clearTimeout(t);
      }
    }
    if (phase === "thinking") {
      const t = setTimeout(() => setPhase("done"), 1400);
      return () => clearTimeout(t);
    }
    if (phase === "done") {
      const t = setTimeout(() => {
        setIdx(i => (i + 1) % HINGLISH_COMMANDS.length);
      }, 2800);
      return () => clearTimeout(t);
    }
  }, [phase, charIdx, cmd.cmd.length]);

  const [ref, inView] = useInView(0.15);

  return (
    <section ref={ref} style={{ padding: "100px 24px", background: "#ffffff" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56, opacity: inView ? 1 : 0, animation: inView ? "bb3-fade-up 0.7s ease both" : "none" }}>
          <div className="bb3-tag" style={{ marginBottom: 16 }}>How it works</div>
          <h2 style={{ fontSize: "clamp(36px,5vw,56px)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 16px" }}>
            You talk. <span className="bb3-gradient-text">Nexus acts.</span>
          </h2>
          <p style={{ fontSize: 18, color: "#6B7280", margin: 0 }}>Real commands. Real results. In your language.</p>
        </div>

        <div style={{
          background: "#0A0A0F", borderRadius: 24, padding: "32px",
          boxShadow: "0 40px 80px rgba(0,0,0,0.12)",
          opacity: inView ? 1 : 0, animation: inView ? "bb3-fade-up 0.7s 0.2s ease both" : "none",
        }}>
          {/* Terminal header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            {["#FF5F57","#FFBD2E","#28CA41"].map(c => (
              <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
            ))}
            <span style={{ color: "#4B5563", fontSize: 12, fontFamily: "monospace", marginLeft: 8 }}>nexus — terminal</span>
          </div>

          {/* Command area */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ color: "#6B7280", fontSize: 12, fontFamily: "monospace", marginBottom: 8 }}>you@nexus ~ $</div>
            <div style={{ fontSize: "clamp(16px,2.5vw,22px)", fontWeight: 600, color: "#ffffff", fontFamily: "monospace", minHeight: 56, lineHeight: 1.5 }}>
              {cmd.cmd.slice(0, charIdx)}
              <span style={{ animation: "bb3-cursor-blink 1s step-end infinite", borderRight: "2px solid #6C00FF" }}>&nbsp;</span>
            </div>
          </div>

          {/* Processing */}
          {phase !== "typing" && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, animation: "bb3-step-in 0.4s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", background: cmd.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, boxShadow: `0 0 20px ${cmd.color}66`,
                  animation: "bb3-bounce-in 0.4s ease",
                }}>
                  {cmd.agentEmoji}
                </div>
                <div>
                  <div style={{ color: "#ffffff", fontSize: 14, fontWeight: 700 }}>{cmd.agent} activated</div>
                  <div style={{ color: "#6B7280", fontSize: 12, fontFamily: "monospace" }}>Processing your request…</div>
                </div>
                {phase === "thinking" && (
                  <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: "50%", background: cmd.color,
                        animation: `bb3-bounce-in 0.6s ${i * 0.18}s ease-in-out infinite alternate`,
                      }} />
                    ))}
                  </div>
                )}
              </div>
              {phase === "done" && (
                <div style={{
                  background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                  borderRadius: 12, padding: "12px 16px",
                  display: "flex", alignItems: "center", gap: 10,
                  animation: "bb3-step-in 0.4s ease",
                }}>
                  <CheckCircle2 size={18} color="#10B981" />
                  <span style={{ color: "#10B981", fontSize: 14, fontWeight: 600, fontFamily: "monospace" }}>{cmd.result}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nav dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {HINGLISH_COMMANDS.map((c, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{
              width: idx === i ? 24 : 8, height: 8, borderRadius: 100, border: "none", cursor: "pointer",
              background: idx === i ? "#6C00FF" : "#E9E0FF", transition: "all 0.3s ease",
            }} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ SECTION: AGENTS ═══════════════════════════ */

function AgentsSection({ onNavigate }: { onNavigate: (s: ScreenKey) => void }) {
  const [ref, inView] = useInView(0.08);
  return (
    <section ref={ref} style={{ padding: "100px 0", background: "#FAFAFA", overflow: "hidden" }}>
      <div style={{ padding: "0 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56, opacity: inView ? 1 : 0, animation: inView ? "bb3-fade-up 0.7s ease both" : "none" }}>
          <div className="bb3-tag" style={{ marginBottom: 16 }}>Meet the team</div>
          <h2 style={{ fontSize: "clamp(36px,5vw,56px)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 12px" }}>
            8 minds.<span className="bb3-gradient-text"> One platform.</span>
          </h2>
          <p style={{ fontSize: 18, color: "#6B7280", margin: 0 }}>Specialist AIs for every part of your life.</p>
        </div>
      </div>

      <div style={{
        display: "flex", gap: 16, padding: "12px 24px 24px",
        overflowX: "auto", scrollSnapType: "x mandatory",
        scrollbarWidth: "none",
        opacity: inView ? 1 : 0, animation: inView ? "bb3-fade-up 0.7s 0.15s ease both" : "none",
      }}>
        {AGENTS.map((a, i) => (
          <div key={a.name} style={{
            minWidth: 240, scrollSnapAlign: "start",
            background: "#ffffff", borderRadius: 20,
            border: `1.5px solid ${a.border}`,
            padding: "28px 24px", flexShrink: 0,
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            animationDelay: `${i * 0.06}s`,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 24px 60px ${a.bg}`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: a.bg,
              border: `1.5px solid ${a.border}`, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, marginBottom: 16,
            }}>{a.emoji}</div>
            <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{a.name}</div>
            <div style={{ color: "#6B7280", fontSize: 13, marginBottom: 16 }}>{a.role}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
              {a.tags.map(t => (
                <span key={t} style={{
                  background: a.bg, color: a.color, borderRadius: 100,
                  padding: "4px 10px", fontSize: 11, fontWeight: 600,
                }}>{t}</span>
              ))}
            </div>
            <button className="bb3-btn" style={{ background: a.color, width: "100%", justifyContent: "center", padding: "10px 0", fontSize: 13 }}
              onClick={() => onNavigate("agent")}>
              Chat now <ArrowRight size={14} />
            </button>
          </div>
        ))}

        {/* Coming soon cards */}
        {[1,2,3].map(i => (
          <div key={`soon-${i}`} style={{
            minWidth: 240, scrollSnapAlign: "start",
            background: "#F8F8F8", borderRadius: 20,
            border: "1.5px dashed #E5E7EB",
            padding: "28px 24px", flexShrink: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            filter: "blur(2px)", pointerEvents: "none",
          }}>
            <Lock size={24} color="#D1D5DB" style={{ marginBottom: 12 }} />
            <div style={{ fontWeight: 700, color: "#9CA3AF", fontSize: 15 }}>Coming soon</div>
            <div style={{ color: "#D1D5DB", fontSize: 12, marginTop: 4 }}>Drop {i} expected</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 32, padding: "0 24px" }}>
        <span style={{ color: "#6B7280", fontSize: 15, fontWeight: 500 }}>
          + More agents dropping every month 🔥
        </span>
      </div>
    </section>
  );
}

/* ═══════════════════════════ SECTION: ACCESS ANYWHERE ═══════════════════════════ */

function AccessAnywhere() {
  const [ref, inView] = useInView(0.1);
  return (
    <section ref={ref} style={{ padding: "100px 24px", background: "#ffffff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64, opacity: inView ? 1 : 0, animation: inView ? "bb3-fade-up 0.7s ease both" : "none" }}>
          <div className="bb3-tag" style={{ marginBottom: 16 }}>Access Anywhere</div>
          <h2 style={{ fontSize: "clamp(36px,5vw,56px)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 12px" }}>
            Nexus lives <span className="bb3-gradient-text">where you live.</span>
          </h2>
          <p style={{ fontSize: 18, color: "#6B7280" }}>No app download needed. Just message.</p>
        </div>

        <div style={{ display: "flex", gap: 32, alignItems: "flex-end", justifyContent: "center", flexWrap: "wrap" }}>
          {/* Left phone - WhatsApp */}
          <div className="bb3-device-tilt-l" style={{ opacity: inView ? 1 : 0, animation: inView ? "bb3-slide-l 0.7s 0.1s ease both" : "none" }}>
            <div className="bb3-phone" style={{ width: 200 }}>
              <div className="bb3-phone-screen" style={{ height: 360 }}>
                <div style={{ background: "#128C7E", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#6C00FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
                  <div>
                    <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>Nexus</div>
                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }}>online</div>
                  </div>
                </div>
                <div style={{ padding: "12px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ background: "#E2FFC7", borderRadius: "12px 12px 4px 12px", padding: "8px 10px", alignSelf: "flex-end", fontSize: 11, color: "#0A0A0F", maxWidth: "85%" }}>
                    Bhai aaj schedule kya hai?
                  </div>
                  <div style={{ background: "#fff", borderRadius: "12px 12px 12px 4px", padding: "8px 10px", alignSelf: "flex-start", fontSize: 11, color: "#0A0A0F", maxWidth: "90%" }}>
                    <div>📅 10am — Standup call</div>
                    <div>📊 2pm — Client deck</div>
                    <div>💪 7pm — Gym (FlexAI ✓)</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#6B7280" }}>💬 WhatsApp</span>
            </div>
          </div>

          {/* Center laptop */}
          <div style={{ opacity: inView ? 1 : 0, animation: inView ? "bb3-fade-up 0.7s 0.2s ease both" : "none" }}>
            <div className="bb3-laptop" style={{ width: 320 }}>
              <div className="bb3-laptop-screen" style={{ height: 200 }}>
                <div style={{ background: "rgba(108,0,255,0.15)", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  <Sparkles size={14} color="#6C00FF" />
                  <span style={{ color: "#6C00FF", fontSize: 12, fontWeight: 700 }}>BotBetter Dashboard</span>
                </div>
                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {["⚡ Nexus — 24 tasks today","🤖 Buddy — 8 messages sent","💰 Finio — Budget saved ₹2,100"].map((t, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(108,0,255,0.06)", borderRadius: 8, padding: "6px 10px" }}>
                      <span style={{ color: "#6C00FF", fontSize: 11, flex: 1 }}>{t}</span>
                      <CheckCircle2 size={12} color="#10B981" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bb3-laptop-base" />
            </div>
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#6B7280" }}>🌐 Web Dashboard</span>
            </div>
          </div>

          {/* Right phone - Telegram */}
          <div className="bb3-device-tilt-r" style={{ opacity: inView ? 1 : 0, animation: inView ? "bb3-slide-r 0.7s 0.1s ease both" : "none" }}>
            <div className="bb3-phone" style={{ width: 200 }}>
              <div className="bb3-phone-screen" style={{ height: 360 }}>
                <div style={{ background: "#2CA5E0", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#6C00FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
                  <div>
                    <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>Nexus</div>
                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }}>bot</div>
                  </div>
                </div>
                <div style={{ padding: "12px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ background: "#EFEBFF", borderRadius: "12px 12px 4px 12px", padding: "8px 10px", alignSelf: "flex-end", fontSize: 11, color: "#0A0A0F", maxWidth: "85%" }}>
                    Amazon pe earphones show karo
                  </div>
                  <div style={{ background: "#fff", borderRadius: "12px 12px 12px 4px", padding: "8px 10px", alignSelf: "flex-start", fontSize: 11, color: "#0A0A0F", maxWidth: "90%" }}>
                    Found 8 options! 🎧<br />Top pick: ₹799<br /><span style={{ color: "#6C00FF" }}>Link sent ✓</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#6B7280" }}>✈️ Telegram</span>
            </div>
          </div>
        </div>

        {/* Platform chips */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 48, flexWrap: "wrap" }}>
          {["💬 WhatsApp", "✈️ Telegram", "🌐 Web App", "📱 Mobile (soon)"].map(p => (
            <span key={p} style={{
              background: "#F8F5FF", border: "1.5px solid #E9E0FF", borderRadius: 100,
              padding: "8px 18px", fontSize: 14, fontWeight: 600, color: "#374151",
            }}>{p}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ SECTION: CREATE AGENT ═══════════════════════════ */

function CreateAgentSection({ onNavigate }: { onNavigate: (s: ScreenKey) => void }) {
  const [ref, inView] = useInView(0.1);
  const [step, setStep] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [agentName, setAgentName] = useState("");
  const earns = useCounter(12400, 2400, step === 3);
  const subs = useCounter(47, 2000, step === 3);

  useEffect(() => {
    if (!inView) return;
    const timers = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 1600),
      setTimeout(() => setStep(3), 2600),
      setTimeout(() => { setConfetti(true); }, 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  const confettiPieces = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    color: ["#6C00FF","#FF3CAC","#FFD700","#10B981","#3B82F6"][i % 5],
    cx: `${(Math.random() - 0.5) * 200}px`,
    cr: `${(Math.random() - 0.5) * 360}deg`,
    left: `${10 + Math.random() * 80}%`,
    delay: `${Math.random() * 0.5}s`,
  })), []);

  return (
    <section ref={ref} style={{ padding: "100px 24px", background: "#FAFAFA" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64, opacity: inView ? 1 : 0, animation: inView ? "bb3-fade-up 0.7s ease both" : "none" }}>
          <div className="bb3-tag" style={{ marginBottom: 16 }}>Creator Economy</div>
          <h2 style={{ fontSize: "clamp(36px,5vw,56px)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 12px" }}>
            BUILD <span className="bb3-gradient-text">YOUR AI.</span>
          </h2>
          <p style={{ fontSize: 18, color: "#6B7280" }}>Earn 30% while you sleep. 💸</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, alignItems: "start" }}>
          {/* Steps */}
          <div style={{ opacity: inView ? 1 : 0, animation: inView ? "bb3-slide-l 0.7s 0.1s ease both" : "none" }}>
            {[
              { n: 1, label: "Pick a category", done: step >= 1 },
              { n: 2, label: "Name your agent", done: step >= 2 },
              { n: 3, label: "Set personality", done: step >= 3 },
              { n: 4, label: "Publish & earn 🎉", done: step >= 3 },
            ].map((s, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 16, marginBottom: 20,
                opacity: step >= s.n ? 1 : 0.3,
                animation: step >= s.n ? `bb3-step-in 0.4s ease both` : "none",
                transition: "opacity 0.4s ease",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: s.done ? "#6C00FF" : "#E9E0FF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.4s ease",
                }}>
                  {s.done ? <CheckCircle2 size={16} color="#fff" /> : <span style={{ fontSize: 14, fontWeight: 700, color: "#9CA3AF" }}>{s.n}</span>}
                </div>
                <span style={{ fontSize: 16, fontWeight: s.done ? 700 : 500, color: s.done ? "#0A0A0F" : "#9CA3AF", transition: "color 0.4s ease" }}>{s.label}</span>
              </div>
            ))}

            <div style={{ marginTop: 24 }}>
              <input
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
                placeholder="Name your agent…"
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 12,
                  border: "1.5px solid #E9E0FF", background: "#fff", fontSize: 15,
                  fontFamily: "'Space Grotesk', sans-serif", outline: "none",
                  color: "#0A0A0F",
                }}
              />
            </div>
            <button className="bb3-btn" style={{ marginTop: 16, width: "100%", justifyContent: "center" }}
              onClick={() => onNavigate("create")}>
              Start Building <ArrowRight size={16} />
            </button>
          </div>

          {/* Earnings */}
          <div style={{ position: "relative", opacity: inView ? 1 : 0, animation: inView ? "bb3-slide-r 0.7s 0.15s ease both" : "none" }}>
            {confetti && confettiPieces.map(p => (
              <div key={p.id} style={{
                position: "absolute", top: 0, left: p.left,
                width: 8, height: 8, borderRadius: 2, background: p.color,
                animation: `bb3-confetti 1.2s ${p.delay} ease-out both`,
                "--cx": p.cx, "--cr": p.cr,
              } as React.CSSProperties} />
            ))}
            <div className="bb3-card-gb" style={{ padding: "32px" }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 500, marginBottom: 8 }}>Monthly earnings</div>
                <div style={{
                  fontSize: "clamp(36px,6vw,52px)", fontWeight: 800, lineHeight: 1,
                  animation: step >= 3 ? "bb3-count-up 0.6s ease both" : "none",
                }}>
                  <span className="bb3-gradient-text-gold">₹{earns.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ fontSize: 14, color: "#6B7280", marginTop: 8 }}>/ month passive income</div>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ background: "#F0FDF4", borderRadius: 12, padding: "12px 16px", flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#10B981" }}>{subs}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>Subscribers</div>
                </div>
                <div style={{ background: "#F0F0FF", borderRadius: 12, padding: "12px 16px", flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#6C00FF" }}>30%</div>
                  <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>Commission</div>
                </div>
              </div>
              <div style={{
                marginTop: 20, display: "inline-flex", alignItems: "center", gap: 8,
                background: "#FFF9E6", border: "1.5px solid #FFD700", borderRadius: 100,
                padding: "6px 16px", fontSize: 13, fontWeight: 700, color: "#B45309",
              }}>
                <span>🏆</span> Passive income badge
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ SECTION: STATS ═══════════════════════════ */

function StatsSection() {
  const [ref, inView] = useInView(0.15);
  const v1 = useCounter(8, 1200, inView);
  const v2 = useCounter(15, 1400, inView);
  const v3 = useCounter(50, 1600, inView);

  const stats = [
    { value: `${v1}`, suffix: "", label: "Specialist Agents", color: "#6C00FF", bg: "rgba(108,0,255,0.06)" },
    { value: `${v2}+`, suffix: "", label: "App Connectors", color: "#FF3CAC", bg: "rgba(255,60,172,0.06)" },
    { value: `${v3}`, suffix: "", label: "Free msgs/day", color: "#FFD700", bg: "rgba(255,215,0,0.1)" },
    { value: "🇮🇳", suffix: "", label: "India First", color: "#F97316", bg: "rgba(249,115,22,0.06)" },
  ];

  return (
    <section ref={ref} style={{ padding: "80px 24px", background: "#ffffff" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: s.bg, borderRadius: 20, padding: "28px 24px", textAlign: "center",
              border: `1.5px solid ${s.color}22`,
              opacity: inView ? 1 : 0, animation: inView ? `bb3-bounce-in 0.6s ${i * 0.12}s ease both` : "none",
            }}>
              <div style={{ fontSize: "clamp(36px,5vw,48px)", fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 8 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#6B7280" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ SECTION: OUR STORY ═══════════════════════════ */

function OurStory() {
  const [ref, inView] = useInView(0.08);
  const [lang, setLang] = useState<LangKey>("en");
  const [visible, setVisible] = useState(true);

  const changeLang = (l: LangKey) => {
    if (l === lang) return;
    setVisible(false);
    setTimeout(() => { setLang(l); setVisible(true); }, 250);
  };

  const story = STORY_LANGS[lang];

  return (
    <section ref={ref} style={{ padding: "100px 24px", background: "#FAFAFA" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64, opacity: inView ? 1 : 0, animation: inView ? "bb3-fade-up 0.7s ease both" : "none" }}>
          <div className="bb3-tag" style={{ marginBottom: 16 }}>The Story</div>
          <h2 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 12px" }}>
            Why we built <span className="bb3-gradient-text">BotBetter</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 48, alignItems: "start" }}>
          {/* Story text */}
          <div style={{ opacity: inView ? 1 : 0, animation: inView ? "bb3-slide-l 0.7s 0.1s ease both" : "none" }}>
            <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.25s ease" }}>
              {story.text.map((line, i) => (
                <p key={`${lang}-${i}`} style={{
                  fontSize: "clamp(15px,2vw,18px)", lineHeight: 1.8, color: i === story.text.length - 1 ? "#6C00FF" : "#374151",
                  fontWeight: i === story.text.length - 1 ? 700 : 400, margin: "0 0 8px",
                }}>
                  {i === story.text.length - 1 && <span style={{ marginRight: 8 }}>⚡</span>}
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div style={{ opacity: inView ? 1 : 0, animation: inView ? "bb3-slide-r 0.7s 0.15s ease both" : "none" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Old way */}
              <div className="bb3-card" style={{ padding: "20px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>😵</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", marginBottom: 12 }}>OLD WAY</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {["ChatGPT", "Notion AI", "Zapier", "10 tabs…"].map((app, i) => (
                    <div key={app} style={{
                      background: "#FEF2F2", borderRadius: 8, padding: "5px 10px",
                      fontSize: 11, color: "#EF4444", fontWeight: 600,
                      animation: `bb3-chaos-${["a","b","c","d"][i]} ${2.5 + i * 0.3}s ease-in-out infinite`,
                    }}>❌ {app}</div>
                  ))}
                </div>
              </div>
              {/* New way */}
              <div className="bb3-card-gb" style={{ padding: "20px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>😌</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#10B981", marginBottom: 12 }}>BOTBETTER WAY</div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: "50%", margin: "0 auto",
                    background: "linear-gradient(135deg, #6C00FF, #FF3CAC)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, boxShadow: "0 0 24px rgba(108,0,255,0.4)",
                  }}>⚡</div>
                </div>
                {["WhatsApp ✓", "Gmail ✓", "Tasks ✓", "Done. 🎉"].map(item => (
                  <div key={item} style={{
                    background: "rgba(16,185,129,0.08)", borderRadius: 8, padding: "5px 10px",
                    fontSize: 11, color: "#10B981", fontWeight: 600, marginBottom: 6,
                  }}>{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Language selector */}
        <div style={{ marginTop: 64, opacity: inView ? 1 : 0, animation: inView ? "bb3-fade-up 0.7s 0.3s ease both" : "none" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>
              Understand in your language 🌐
            </h3>
            <p style={{ color: "#6B7280", fontSize: 15, margin: 0 }}>Tap any language to read our story in it</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {LANG_ORDER.map(l => (
              <button key={l} className={`bb3-lang-btn${lang === l ? " active" : ""}`} onClick={() => changeLang(l)}>
                <span>{STORY_LANGS[l].flag}</span>
                <span>{STORY_LANGS[l].label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ MAIN COMPONENT ═══════════════════════════ */

export function Landing({ onNavigate, onShowAuth }: {
  onNavigate: (s: ScreenKey) => void;
  onShowAuth: (tab: "login" | "signup") => void;
}) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const [magPos, setMagPos] = useState({ x: 0, y: 0 });
  const [cmdPhase, setCmdPhase] = useState(0);
  const [voiceLangIdx, setVoiceLangIdx] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Magnetic CTA button
  const onMagMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setMagPos({ x: (e.clientX - r.left - r.width / 2) * 0.22, y: (e.clientY - r.top - r.height / 2) * 0.22 });
  };

  // Voice language cycling in bento card
  useEffect(() => {
    const t = setInterval(() => setVoiceLangIdx(i => (i + 1) % VOICE_LANGS.length), 1800);
    return () => clearInterval(t);
  }, []);

  // Hero command phase cycling
  useEffect(() => {
    const t = setInterval(() => setCmdPhase(p => (p + 1) % 3), 3200);
    return () => clearInterval(t);
  }, []);

  const particles = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    color: i % 3 === 0 ? "rgba(108,0,255,0.5)" : i % 3 === 1 ? "rgba(255,60,172,0.45)" : "rgba(255,215,0,0.4)",
    size: 4 + Math.random() * 8,
    x: 5 + Math.random() * 90,
    y: 5 + Math.random() * 90,
    delay: Math.random() * 4,
    duration: 3 + Math.random() * 4,
  })), []);

  const [diffRef, diffInView] = useInView(0.1);
  const [bentoRef, bentoInView] = useInView(0.06);
  const [connRef, connInView] = useInView(0.1);

  return (
    <div className="bb3" style={{ minHeight: "100vh", overflowX: "hidden" }}>
      <style>{CSS}</style>
      <div className="bb3-noise-overlay" />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh", position: "relative", display: "flex", alignItems: "center",
        justifyContent: "center", padding: "80px 24px", overflow: "hidden",
        background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(108,0,255,0.07) 0%, transparent 65%)",
      }}>
        {/* Floating particles */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {particles.map(p => <FloatParticle key={p.id} {...p} />)}
        </div>

        {/* Background orb glow */}
        <div style={{
          position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
          width: 600, height: 600, borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(108,0,255,0.08) 0%, transparent 70%)",
          animation: "bb3-orb-breathe 6s ease-in-out infinite",
        }} />

        <div style={{ maxWidth: 860, width: "100%", textAlign: "center", position: "relative", zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28,
            background: "rgba(108,0,255,0.08)", border: "1.5px solid rgba(108,0,255,0.2)",
            borderRadius: 100, padding: "8px 18px", fontSize: 13, fontWeight: 600, color: "#6C00FF",
            opacity: heroVisible ? 1 : 0, animation: heroVisible ? "bb3-bounce-in 0.6s ease both" : "none",
          }}>
            <Sparkles size={14} /> India's first agentic AI platform
          </div>

          {/* Headline */}
          <div style={{ opacity: heroVisible ? 1 : 0, animation: heroVisible ? "bb3-fade-up 0.7s 0.1s ease both" : "none" }}>
            <div style={{ fontSize: "clamp(16px,2.5vw,20px)", color: "#9CA3AF", fontWeight: 500, marginBottom: 8 }}>Meet</div>
            <h1 style={{
              fontSize: "clamp(72px,12vw,120px)", fontWeight: 800, lineHeight: 0.92,
              letterSpacing: "-0.03em", margin: "0 0 16px", color: "#0A0A0F",
            }}>NEXUS.</h1>
            <div style={{
              fontSize: "clamp(22px,4vw,36px)", fontWeight: 700, lineHeight: 1.2,
              marginBottom: 32,
            }}>
              <span className="bb3-gradient-text">Your AI that actually works.</span>
            </div>
          </div>

          {/* Orb */}
          <div style={{
            margin: "0 auto 40px", opacity: heroVisible ? 1 : 0,
            animation: heroVisible ? "bb3-fade-up 0.7s 0.2s ease both" : "none",
          }}>
            <GlowOrb size={180} rings />
          </div>

          {/* Subtext */}
          <p style={{
            fontSize: "clamp(16px,2.5vw,20px)", color: "#6B7280", maxWidth: 560, margin: "0 auto 40px",
            lineHeight: 1.6, opacity: heroVisible ? 1 : 0,
            animation: heroVisible ? "bb3-fade-up 0.7s 0.3s ease both" : "none",
          }}>
            One command. Nexus routes it to the right agent, executes, and reports back.
            No switching. No copy-pasting. Just results.
          </p>

          {/* CTAs */}
          <div style={{
            display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap",
            opacity: heroVisible ? 1 : 0, animation: heroVisible ? "bb3-fade-up 0.7s 0.4s ease both" : "none",
          }}>
            <button className="bb3-btn"
              style={{ transform: `translate(${magPos.x}px, ${magPos.y}px)`, padding: "16px 36px", fontSize: 16 }}
              onMouseMove={onMagMove}
              onMouseLeave={() => setMagPos({ x: 0, y: 0 })}
              onClick={() => onShowAuth("signup")}>
              Try Free <ArrowRight size={16} />
            </button>
            <button className="bb3-btn-outline" style={{ padding: "16px 36px", fontSize: 16 }}
              onClick={() => document.getElementById("bb3-demo")?.scrollIntoView({ behavior: "smooth" })}>
              See how it works
            </button>
          </div>

          {/* Social proof */}
          <div style={{
            marginTop: 32, fontSize: 14, color: "#9CA3AF", fontWeight: 500,
            opacity: heroVisible ? 1 : 0, animation: heroVisible ? "bb3-fade-up 0.7s 0.5s ease both" : "none",
          }}>
            <Users size={14} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
            Join 500+ users already on beta
          </div>

          {/* Language pills */}
          <div style={{
            display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 28,
            opacity: heroVisible ? 1 : 0, animation: heroVisible ? "bb3-fade-in 0.7s 0.6s ease both" : "none",
          }}>
            {["हिंदी","English","मराठी","বাংলা","தமிழ்","తెలుగు","ਪੰਜਾਬੀ","ಕನ್ನಡ"].map(l => (
              <span key={l} style={{
                background: "#F8F5FF", border: "1px solid #E9E0FF", borderRadius: 100,
                padding: "5px 14px", fontSize: 12, fontWeight: 600, color: "#7C3AED",
              }}>{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENTO GRID ─────────────────────────────────────────── */}
      <section ref={bentoRef} style={{ padding: "80px 24px", background: "#ffffff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48, opacity: bentoInView ? 1 : 0, animation: bentoInView ? "bb3-fade-up 0.7s ease both" : "none" }}>
            <div className="bb3-tag" style={{ marginBottom: 16 }}>Everything you need</div>
            <h2 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 800, margin: 0 }}>
              One AI. <span className="bb3-gradient-text">Infinite actions.</span>
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "auto",
            gap: 16,
            opacity: bentoInView ? 1 : 0,
            animation: bentoInView ? "bb3-fade-up 0.7s 0.15s ease both" : "none",
          }}>
            {/* Card 1: Big Nexus orb — 2×2 */}
            <div className="bb3-card-gb" style={{
              gridColumn: "span 2", gridRow: "span 2", padding: "40px 32px",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center",
            }}>
              <div style={{ marginBottom: 24 }}><GlowOrb size={120} rings /></div>
              <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>One AI. Infinite actions.</div>
              <div style={{ fontSize: 15, color: "#6B7280" }}>Nexus orchestrates 8 specialist agents — automatically.</div>
            </div>

            {/* Card 2: 8 Agents */}
            <div className="bb3-card" style={{ padding: "24px 20px" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#FFD700", marginBottom: 4 }}>8</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Specialist Agents</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 22 }}>
                {["⚡","🤖","🎤","🛒","🎬","💰","📚","💪"].map(e => (
                  <span key={e} style={{ animation: `bb3-float-sm ${2.5 + Math.random() * 2}s ease-in-out infinite` }}>{e}</span>
                ))}
              </div>
            </div>

            {/* Card 3: Made for India */}
            <div className="bb3-card" style={{ padding: "24px 20px" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🇮🇳</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Made for India</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 12 }}>All 22 official languages + Hinglish</div>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ background: "#FF9933", borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#fff" }}>हिंदी</span>
                <span style={{ background: "#138808", borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#fff" }}>தமிழ்</span>
                <span style={{ background: "#000080", borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#fff" }}>বাংলা</span>
              </div>
            </div>

            {/* Card 4: Live chat preview — tall */}
            <div className="bb3-card" style={{ gridRow: "span 2", padding: 0, overflow: "hidden" }}>
              <div style={{ background: "#6C00FF", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
                <div>
                  <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>Nexus</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }}>Replies in ~2s</div>
                </div>
              </div>
              <div style={{ padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { user: true, text: "Mujhe kal ki meeting remind karna" },
                  { user: false, text: "Done! Reminder set for tomorrow 10am 🔔" },
                  { user: true, text: "Aur Gmail me unread dekh" },
                  { user: false, text: "3 unread: 2 from clients, 1 invoice 📧" },
                ].map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.user ? "flex-end" : "flex-start" }}>
                    <div style={{
                      background: m.user ? "#6C00FF" : "#F8F5FF",
                      color: m.user ? "#fff" : "#0A0A0F",
                      borderRadius: m.user ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      padding: "8px 12px", fontSize: 12, maxWidth: "82%", fontWeight: m.user ? 500 : 400,
                    }}>{m.text}</div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center", padding: "0 14px 16px" }}>
                <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 600 }}>Nexus replies in ~2 seconds ⚡</span>
              </div>
            </div>

            {/* Card 5: Connectors */}
            <div className="bb3-card" style={{ gridColumn: "span 2", padding: "24px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Works with 15+ apps</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[...CONNECTORS_ROW1.slice(0, 4), ...CONNECTORS_ROW2.slice(0, 4)].map(c => (
                  <div key={c.name} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "#F8F5FF", borderRadius: 100, padding: "5px 12px",
                    fontSize: 12, fontWeight: 600, border: "1px solid #E9E0FF",
                  }}>
                    <span>{c.emoji}</span><span>{c.name}</span>
                  </div>
                ))}
                <div style={{
                  background: "rgba(108,0,255,0.08)", borderRadius: 100, padding: "5px 12px",
                  fontSize: 12, fontWeight: 700, color: "#6C00FF", border: "1px solid rgba(108,0,255,0.2)",
                }}>+50 more</div>
              </div>
            </div>

            {/* Card 6: 50 free msgs */}
            <div className="bb3-card" style={{ padding: "24px 20px" }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#6C00FF", lineHeight: 1 }}>50</div>
              <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 500, marginBottom: 14 }}>free messages/day</div>
              <div style={{ background: "#E9E0FF", borderRadius: 100, height: 6, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 100, width: "72%",
                  background: "linear-gradient(90deg, #6C00FF, #FF3CAC)",
                  animation: "bb3-gradient-bg 3s ease infinite",
                  backgroundSize: "200% 100%",
                }} />
              </div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 8 }}>36/50 used today</div>
            </div>

            {/* Card 7: WhatsApp — wide */}
            <div className="bb3-card" style={{ gridColumn: "span 3", padding: "28px 28px", display: "flex", alignItems: "center", gap: 24 }}>
              <div>
                <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Use on WhatsApp.</div>
                <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 16 }}>No app download needed. Just message Nexus on WhatsApp.</div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: 100,
                  padding: "6px 14px", fontSize: 12, fontWeight: 700, color: "#16A34A",
                }}>
                  <span>✓</span> No app needed
                </div>
              </div>
              <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                <div style={{ background: "#0A0A0F", borderRadius: 20, padding: 8, width: 130 }}>
                  <div style={{ background: "#128C7E", padding: "7px 10px", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#6C00FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>⚡</div>
                    <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>Nexus</span>
                  </div>
                  <div style={{ background: "#0B141A", borderRadius: "0 0 12px 12px", padding: "8px 8px" }}>
                    {[{ u: true, t: "Kal meeting set karo" }, { u: false, t: "Done! 9am ✓ 🗓" }].map((m, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: m.u ? "flex-end" : "flex-start", marginBottom: 6 }}>
                        <div style={{ background: m.u ? "#005C4B" : "#202C33", borderRadius: 8, padding: "5px 8px", fontSize: 10, color: "#E9EDEF", maxWidth: "85%" }}>{m.t}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 8: Voice recognition */}
            <div className="bb3-card" style={{ padding: "24px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", background: "rgba(255,60,172,0.1)",
                  border: "1.5px solid rgba(255,60,172,0.3)", display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                }}>
                  <Mic size={18} color="#FF3CAC" />
                  <div style={{
                    position: "absolute", inset: -4, borderRadius: "50%",
                    border: "1.5px solid rgba(255,60,172,0.3)",
                    animation: "bb3-ping 1.5s ease-out infinite",
                  }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Voice Recognition</div>
                  <div style={{ fontSize: 11, color: "#6B7280" }}>Speak in any language</div>
                </div>
              </div>
              {/* Waveform */}
              <div style={{ display: "flex", alignItems: "center", gap: 3, height: 32, marginBottom: 14 }}>
                {Array.from({ length: 16 }, (_, i) => (
                  <div key={i} style={{
                    flex: 1, background: "linear-gradient(180deg,#FF3CAC,#6C00FF)", borderRadius: 2, minHeight: 3,
                    animation: `bb3-bar-wave ${0.6 + (i % 4) * 0.15}s ${i * 0.05}s ease-in-out infinite`,
                  }} />
                ))}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#FF3CAC", textAlign: "center", animation: "bb3-fade-in 0.4s ease" }}>
                {VOICE_LANGS[voiceLangIdx]}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE DIFFERENCE ────────────────────────────────────── */}
      <section ref={diffRef} style={{ padding: "100px 24px", background: "#FAFAFA" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56, opacity: diffInView ? 1 : 0, animation: diffInView ? "bb3-fade-up 0.7s ease both" : "none" }}>
            <div className="bb3-tag" style={{ marginBottom: 16 }}>The difference</div>
            <h2 style={{ fontSize: "clamp(36px,6vw,64px)", fontWeight: 800, lineHeight: 1, margin: "0 0 12px" }}>
              STOP <span className="bb3-gradient-text">SWITCHING.</span>
            </h2>
            <p style={{ fontSize: 18, color: "#6B7280" }}>You juggle 10 AI tools. We give you one.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Old way */}
            <div style={{
              background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 24, padding: "32px",
              opacity: diffInView ? 1 : 0, animation: diffInView ? "bb3-slide-l 0.7s 0.1s ease both" : "none",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#EF4444", marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                😩 The old way
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { emoji: "💬", name: "ChatGPT", anim: "bb3-chaos-a" },
                  { emoji: "🔔", name: "Zapier", anim: "bb3-chaos-b" },
                  { emoji: "📊", name: "Notion AI", anim: "bb3-chaos-c" },
                  { emoji: "📧", name: "Copy-paste to Gmail", anim: "bb3-chaos-d" },
                ].map(a => (
                  <div key={a.name} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "#fff", borderRadius: 12, padding: "12px 16px",
                    border: "1.5px solid #FECACA",
                    animation: `${a.anim} 2.8s ease-in-out infinite`,
                  }}>
                    <span style={{ fontSize: 20 }}>{a.emoji}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#EF4444" }}>{a.name}</span>
                    <span style={{ marginLeft: "auto", color: "#EF4444", fontSize: 16 }}>❌</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, textAlign: "center", fontSize: 28 }}>😵 10 tabs open</div>
            </div>

            {/* BotBetter way */}
            <div style={{
              background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: 24, padding: "32px",
              opacity: diffInView ? 1 : 0, animation: diffInView ? "bb3-slide-r 0.7s 0.1s ease both" : "none",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#10B981", marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                😌 BotBetter way
              </div>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <GlowOrb size={80} rings={false} />
              </div>
              {["WhatsApp sent ✓", "Calendar updated ✓", "Email drafted ✓", "Budget checked ✓"].map(t => (
                <div key={t} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "#fff", borderRadius: 12, padding: "12px 16px",
                  border: "1.5px solid #BBF7D0", marginBottom: 10,
                }}>
                  <CheckCircle2 size={18} color="#10B981" />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#10B981" }}>{t}</span>
                </div>
              ))}
              <div style={{ textAlign: "center", fontWeight: 800, fontSize: 16, color: "#10B981", marginTop: 8 }}>
                One command. Done. ⚡
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <div id="bb3-demo"><HowItWorks /></div>

      {/* ── AGENTS ─────────────────────────────────────────────── */}
      <AgentsSection onNavigate={onNavigate} />

      {/* ── ACCESS ANYWHERE ────────────────────────────────────── */}
      <AccessAnywhere />

      {/* ── CONNECTORS MARQUEE ─────────────────────────────────── */}
      <section ref={connRef} style={{ padding: "80px 0", background: "#FAFAFA" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px", textAlign: "center", marginBottom: 48, opacity: connInView ? 1 : 0, animation: connInView ? "bb3-fade-up 0.7s ease both" : "none" }}>
          <div className="bb3-tag" style={{ marginBottom: 16 }}>Integrations</div>
          <h2 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 800, margin: "0 0 8px" }}>
            Connect <span className="bb3-gradient-text">everything.</span>
          </h2>
          <p style={{ fontSize: 16, color: "#6B7280", margin: 0 }}>15+ apps today. 50+ coming soon.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[CONNECTORS_ROW1, CONNECTORS_ROW2].map((row, ri) => (
            <div key={ri} className="bb3-marquee-wrap">
              <div className={ri === 0 ? "bb3-marquee-t" : "bb3-marquee-t-r"}>
                {[...row, ...row].map((c, i) => (
                  <div key={`${c.name}-${i}`} style={{
                    display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
                    background: "#fff", border: "1.5px solid #E9E0FF", borderRadius: 100,
                    padding: "10px 20px", whiteSpace: "nowrap",
                  }}>
                    <span style={{ fontSize: 20 }}>{c.emoji}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CREATE YOUR AGENT ────────────────────────────────── */}
      <CreateAgentSection onNavigate={onNavigate} />

      {/* ── STATS ───────────────────────────────────────────── */}
      <StatsSection />

      {/* ── OUR STORY ───────────────────────────────────────── */}
      <OurStory />

      {/* ── FINAL CTA ───────────────────────────────────────── */}
      <FinalCTA onShowAuth={onShowAuth} />
    </div>
  );
}

/* ═══════════════════════════ FINAL CTA ═══════════════════════════ */

function FinalCTA({ onShowAuth }: { onShowAuth: (tab: "login" | "signup") => void }) {
  const [ref, inView] = useInView(0.15);
  const [magPos, setMagPos] = useState({ x: 0, y: 0 });
  const onMagMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setMagPos({ x: (e.clientX - r.left - r.width / 2) * 0.22, y: (e.clientY - r.top - r.height / 2) * 0.22 });
  };

  return (
    <section ref={ref} style={{
      padding: "120px 24px",
      background: "radial-gradient(ellipse 90% 80% at 50% 50%, rgba(108,0,255,0.07) 0%, rgba(255,60,172,0.04) 50%, #ffffff 80%)",
      textAlign: "center", position: "relative", overflow: "hidden",
    }}>
      {/* Background orb */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 700, height: 700, borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(108,0,255,0.06) 0%, transparent 70%)",
        animation: "bb3-orb-breathe 5s ease-in-out infinite",
      }} />

      {/* Floating agent emojis */}
      {["⚡","🤖","🎤","🛒","🎬","💰","📚","💪"].map((e, i) => (
        <div key={i} style={{
          position: "absolute", fontSize: 28, opacity: 0.12,
          top: `${10 + (i % 4) * 20}%`,
          left: i < 4 ? `${5 + i * 7}%` : `${70 + (i - 4) * 7}%`,
          animation: `bb3-float ${3 + (i % 3)}s ${i * 0.4}s ease-in-out infinite`,
        }}>{e}</div>
      ))}

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ opacity: inView ? 1 : 0, animation: inView ? "bb3-fade-up 0.7s ease both" : "none" }}>
          <div style={{ fontSize: "clamp(44px,8vw,80px)", fontWeight: 800, lineHeight: 1.05, marginBottom: 16 }}>
            <div style={{ color: "#0A0A0F" }}>Your AI team</div>
            <div className="bb3-gradient-text">is ready.</div>
          </div>
          <p style={{ fontSize: "clamp(16px,2.5vw,20px)", color: "#6B7280", maxWidth: 480, margin: "0 auto 48px", lineHeight: 1.6 }}>
            Start free. No credit card. Just Nexus.
          </p>
        </div>

        <div style={{ opacity: inView ? 1 : 0, animation: inView ? "bb3-fade-up 0.7s 0.15s ease both" : "none" }}>
          <button className="bb3-btn"
            style={{
              padding: "18px 48px", fontSize: 18,
              transform: `translate(${magPos.x}px, ${magPos.y}px)`,
              boxShadow: "0 20px 60px rgba(108,0,255,0.35)",
            }}
            onMouseMove={onMagMove}
            onMouseLeave={() => setMagPos({ x: 0, y: 0 })}
            onClick={() => onShowAuth("signup")}>
            Get Started Free <ArrowRight size={18} />
          </button>
        </div>

        <div style={{ marginTop: 24, fontSize: 14, color: "#9CA3AF", fontWeight: 500, opacity: inView ? 1 : 0, animation: inView ? "bb3-fade-in 0.7s 0.3s ease both" : "none" }}>
          <Users size={14} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
          Join 500+ users already on beta
        </div>
      </div>
    </section>
  );
}

export default Landing;
