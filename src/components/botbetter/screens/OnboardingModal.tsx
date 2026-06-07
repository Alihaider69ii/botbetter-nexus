import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, ChevronLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { userAPI } from "@/services/api";

const USER_TYPES = [
  { value: "student",      label: "Student",      emoji: "🎓" },
  { value: "professional", label: "Professional",  emoji: "💼" },
  { value: "seller",       label: "Seller",        emoji: "🛍️" },
  { value: "creator",      label: "Creator",       emoji: "🎬" },
  { value: "fitness",      label: "Fitness",       emoji: "💪" },
  { value: "other",        label: "Exploring",     emoji: "✨" },
];

const LANGUAGES = [
  { code: "en-IN", label: "English",    flag: "🇬🇧", native: "English"    },
  { code: "hi-IN", label: "Hindi",      flag: "🇮🇳", native: "हिंदी"       },
  { code: "mr-IN", label: "Marathi",    flag: "🇮🇳", native: "मराठी"      },
  { code: "bn-IN", label: "Bengali",    flag: "🇮🇳", native: "বাংলা"      },
  { code: "ta-IN", label: "Tamil",      flag: "🇮🇳", native: "தமிழ்"      },
  { code: "te-IN", label: "Telugu",     flag: "🇮🇳", native: "తెలుగు"     },
  { code: "gu-IN", label: "Gujarati",   flag: "🇮🇳", native: "ગુજરાતી"   },
  { code: "pa-IN", label: "Punjabi",    flag: "🇮🇳", native: "ਪੰਜਾਬੀ"    },
  { code: "kn-IN", label: "Kannada",    flag: "🇮🇳", native: "ಕನ್ನಡ"     },
  { code: "ml-IN", label: "Malayalam",  flag: "🇮🇳", native: "മലയാളം"    },
];

const CONFETTI_COLORS = ["#7C6BFF","#FF3CAC","#10b981","#f59e0b","#3b82f6","#ef4444","#8b5cf6","#ec4899"];

const CSS = `
@keyframes ob-ring-spin { to { transform: rotate(360deg); } }
@keyframes ob-ring-spin-r { to { transform: rotate(-360deg); } }
@keyframes ob-pulse-glow  { 0%,100% { opacity:.7; transform:scale(1); } 50% { opacity:1; transform:scale(1.08); } }
@keyframes confetti-fall  { to { transform: translateY(110vh) rotate(720deg); opacity:0; } }
@keyframes ob-fade-in     { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

.ob-card { animation: ob-fade-in .25s ease both; }

.ob-persona-card {
  position:relative; border-radius:20px; padding:28px 20px; cursor:pointer;
  border:2px solid transparent; transition:all .22s cubic-bezier(.16,1,.3,1);
  display:flex; flex-direction:column; align-items:center; gap:12px; text-align:center;
  overflow:hidden;
}
.ob-persona-card:hover { transform:translateY(-3px); }
.ob-persona-maya { background:linear-gradient(145deg,#f3f0ff,#fdf4ff); border-color:#d8b4fe; }
.ob-persona-maya.ob-selected { border-color:#7C6BFF; box-shadow:0 0 0 3px rgba(124,107,255,.18); }
.ob-persona-kabir { background:linear-gradient(145deg,#e0f7ff,#f0fbff); border-color:#93c5fd; }
.ob-persona-kabir.ob-selected { border-color:#0ea5e9; box-shadow:0 0 0 3px rgba(14,165,233,.18); }

.ob-avatar { position:relative; width:80px; height:80px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
.ob-avatar-maya  { background:linear-gradient(135deg,#7C6BFF,#FF3CAC); box-shadow:0 0 20px rgba(124,107,255,.4); animation:ob-pulse-glow 2.5s ease-in-out infinite; }
.ob-avatar-kabir { background:linear-gradient(135deg,#0ea5e9,#00f0ff); box-shadow:0 0 20px rgba(14,165,233,.4); animation:ob-pulse-glow 2.5s ease-in-out infinite .5s; }
.ob-ring { position:absolute; border-radius:50%; border:2px solid transparent; }
.ob-ring-maya-1 { width:96px; height:96px; border-color:rgba(124,107,255,.35); animation:ob-ring-spin 4s linear infinite; top:-8px; left:-8px; }
.ob-ring-maya-2 { width:108px; height:108px; border-color:rgba(255,60,172,.2); animation:ob-ring-spin-r 6s linear infinite; top:-14px; left:-14px; border-style:dashed; }
.ob-ring-kabir-1 { width:96px; height:96px; border-color:rgba(14,165,233,.35); animation:ob-ring-spin 3s linear infinite; top:-8px; left:-8px; }
.ob-ring-kabir-2 { width:108px; height:108px; border-color:rgba(0,240,255,.2); animation:ob-ring-spin-r 5s linear infinite; top:-14px; left:-14px; border-style:dashed; }
.ob-avatar-icon { font-size:32px; z-index:1; position:relative; }

.ob-select-btn { margin-top:4px; width:100%; padding:8px; border-radius:10px; font-size:12px; font-weight:700; letter-spacing:.5px; text-transform:uppercase; transition:all .18s; border:none; cursor:pointer; }
.ob-select-maya  { background:rgba(124,107,255,.12); color:#7C6BFF; }
.ob-select-maya.ob-selected-btn  { background:#7C6BFF; color:#fff; }
.ob-select-kabir { background:rgba(14,165,233,.12); color:#0ea5e9; }
.ob-select-kabir.ob-selected-btn { background:#0ea5e9; color:#fff; }
`;

const Confetti = () => {
  const pieces = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: `${Math.random() * 100}%`,
      delay: `${(Math.random() * 1.5).toFixed(2)}s`,
      duration: `${(2 + Math.random() * 1.5).toFixed(2)}s`,
      size: `${4 + Math.floor(Math.random() * 6)}px`,
      borderRadius: i % 3 === 0 ? "50%" : "2px",
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {pieces.map((p) => (
        <div key={p.id} style={{
          position:"absolute", top:0, left:p.left,
          width:p.size, height:p.size,
          backgroundColor:p.color, borderRadius:p.borderRadius,
          animation:`confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
        }} />
      ))}
    </div>
  );
};

const Progress = ({ step, total }: { step: number; total: number }) => (
  <div className="flex gap-1.5 mb-6">
    {Array.from({ length: total }, (_, i) => (
      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
        style={{ background: i < step ? "#7C6BFF" : "#e2e8f0" }} />
    ))}
  </div>
);

interface Props {
  open: boolean;
  onComplete: () => void;
}

export const OnboardingModal = ({ open, onComplete }: Props) => {
  const { user, updateUser } = useAuth();

  const [step,        setStep]        = useState(1);
  const [userType,    setUserType]    = useState("");
  const [language,    setLanguage]    = useState("en-IN");
  const [personality, setPersonality] = useState<"maya" | "kabir" | "">("");
  const [saving,      setSaving]      = useState(false);

  const canNext =
    (step === 1 && userType !== "") ||
    (step === 2 && language !== "") ||
    (step === 3 && personality !== "") ||
    step === 4;

  const handleNext = async () => {
    if (step < 3) { setStep((s) => s + 1); return; }
    if (step === 3) {
      setSaving(true);
      try {
        const voice = personality === "maya" ? "female" : "male";
        const name = user?.name ?? "";
        await userAPI.updateOnboarding({ name, userType, language, personality, voice });
        updateUser({ userType, language, personality: personality as "maya" | "kabir", voice, onboardingComplete: true });
        setStep(4);
      } catch {
        setStep(4);
      } finally {
        setSaving(false);
      }
    }
  };

  const langLabel = LANGUAGES.find((l) => l.code === language)?.label ?? "";
  const typeLabel = USER_TYPES.find((t) => t.value === userType)?.label ?? "";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Dialog open={open}>
        <DialogContent
          className="max-w-lg p-0 gap-0 overflow-hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">Set up your BotBetter profile</DialogTitle>
          <DialogDescription className="sr-only">Personalise your NEXUS experience in 3 quick steps.</DialogDescription>

          <div className="px-8 pt-8 pb-8 relative">

            {/* ── Step 1: User type ── */}
            {step === 1 && (
              <div className="ob-card">
                <Progress step={1} total={3} />
                <div className="text-3xl mb-2">🎯</div>
                <h2 className="text-xl font-bold mb-1">What describes you best?</h2>
                <p className="text-[13px] text-muted-foreground mb-5">
                  We'll tailor NEXUS to fit your life.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {USER_TYPES.map((t) => (
                    <button key={t.value} onClick={() => setUserType(t.value)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition font-medium text-[14px]"
                      style={{
                        borderColor: userType === t.value ? "#7C6BFF" : "#e2e8f0",
                        background:  userType === t.value ? "#f3f0ff" : "white",
                        color:       userType === t.value ? "#6C00FF" : "#374151",
                      }}
                    >
                      <span className="text-xl">{t.emoji}</span> {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 2: Language ── */}
            {step === 2 && (
              <div className="ob-card">
                <Progress step={2} total={3} />
                <div className="text-3xl mb-2">🌐</div>
                <h2 className="text-xl font-bold mb-1">Choose your language</h2>
                <p className="text-[13px] text-muted-foreground mb-5">
                  NEXUS will respond and speak in this language.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {LANGUAGES.map((l) => (
                    <button key={l.code} onClick={() => setLanguage(l.code)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-left transition"
                      style={{
                        borderColor: language === l.code ? "#7C6BFF" : "#e2e8f0",
                        background:  language === l.code ? "#f3f0ff" : "white",
                      }}
                    >
                      <span className="text-lg">{l.flag}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-semibold leading-none"
                          style={{ color: language === l.code ? "#6C00FF" : "#374151" }}>
                          {l.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground leading-none mt-0.5">{l.native}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 3: Personality ── */}
            {step === 3 && (
              <div className="ob-card">
                <Progress step={3} total={3} />
                <div className="text-3xl mb-2">🤖</div>
                <h2 className="text-xl font-bold mb-1">Choose your personality</h2>
                <p className="text-[13px] text-muted-foreground mb-6">
                  This shapes how NEXUS thinks, speaks, and sounds.
                </p>
                <div className="grid grid-cols-2 gap-4">

                  {/* MAYA */}
                  <div
                    className={`ob-persona-card ob-persona-maya ${personality === "maya" ? "ob-selected" : ""}`}
                    onClick={() => setPersonality("maya")}
                  >
                    <div style={{ position:"relative", marginBottom:8, paddingTop:14, paddingBottom:14 }}>
                      <div className="ob-ring ob-ring-maya-1" />
                      <div className="ob-ring ob-ring-maya-2" />
                      <div className="ob-avatar ob-avatar-maya">
                        <span className="ob-avatar-icon">🌸</span>
                      </div>
                    </div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:"#7C6BFF", letterSpacing:2 }}>MAYA</div>
                    <div style={{ fontSize:12, color:"#6b21a8", fontWeight:600, lineHeight:1.4 }}>Gentle. Intuitive. Always listening.</div>
                    <p style={{ fontSize:11, color:"#9333ea", lineHeight:1.5, margin:0 }}>
                      Warm and emotionally intelligent. Maya listens first, then guides.
                    </p>
                    <div style={{ fontSize:10, color:"#7C6BFF", fontWeight:600 }}>👩 Female voice</div>
                    <button
                      className={`ob-select-btn ob-select-maya ${personality === "maya" ? "ob-selected-btn" : ""}`}
                      onClick={(e) => { e.stopPropagation(); setPersonality("maya"); }}
                    >
                      {personality === "maya" ? "✓ Selected" : "Select Maya"}
                    </button>
                  </div>

                  {/* KABIR */}
                  <div
                    className={`ob-persona-card ob-persona-kabir ${personality === "kabir" ? "ob-selected" : ""}`}
                    onClick={() => setPersonality("kabir")}
                  >
                    <div style={{ position:"relative", marginBottom:8, paddingTop:14, paddingBottom:14 }}>
                      <div className="ob-ring ob-ring-kabir-1" />
                      <div className="ob-ring ob-ring-kabir-2" />
                      <div className="ob-avatar ob-avatar-kabir">
                        <span className="ob-avatar-icon">⚡</span>
                      </div>
                    </div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:"#0ea5e9", letterSpacing:2 }}>KABIR</div>
                    <div style={{ fontSize:12, color:"#0c4a6e", fontWeight:600, lineHeight:1.4 }}>Precise. Powerful. Execution-first.</div>
                    <p style={{ fontSize:11, color:"#0284c7", lineHeight:1.5, margin:0 }}>
                      Sharp and structured. Kabir delivers answers, not conversations.
                    </p>
                    <div style={{ fontSize:10, color:"#0ea5e9", fontWeight:600 }}>👨 Male voice</div>
                    <button
                      className={`ob-select-btn ob-select-kabir ${personality === "kabir" ? "ob-selected-btn" : ""}`}
                      onClick={(e) => { e.stopPropagation(); setPersonality("kabir"); }}
                    >
                      {personality === "kabir" ? "✓ Selected" : "Select Kabir"}
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* ── Step 4: Done ── */}
            {step === 4 && (
              <>
                <Confetti />
                <div className="relative z-20 text-center py-4 ob-card">
                  <div className="text-5xl mb-4">🎉</div>
                  <h2 className="text-2xl font-bold mb-2">You're all set!</h2>
                  <p className="text-[14px] text-muted-foreground mb-6">
                    Welcome to BotBetter, <span className="font-semibold text-foreground">{user?.name}</span>! Your NEXUS is ready.
                  </p>
                  <div className="inline-flex flex-col items-center gap-2 px-5 py-3 rounded-xl bg-muted/60 text-[13px] mb-6 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">You are:</span>
                      <span className="font-semibold">{typeLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Language:</span>
                      <span className="font-semibold">{langLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Personality:</span>
                      <span className="font-semibold capitalize">{personality}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Navigation ── */}
            <div className="flex items-center gap-3 mt-6">
              {step > 1 && step < 4 && (
                <button onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-full border border-border text-[13px] font-medium text-muted-foreground hover:text-foreground transition">
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
              )}
              <button
                disabled={!canNext || saving}
                onClick={step === 4 ? onComplete : handleNext}
                className="flex-1 py-3 rounded-full text-[14px] font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: "#7C6BFF", color: "white" }}
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {step === 3 ? "Finish Setup ✓" : step === 4 ? "Open NEXUS →" : "Continue →"}
              </button>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
