import { useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, ChevronLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { userAPI } from "@/services/api";

// ── Constants ─────────────────────────────────────────────────────────────────

const USER_TYPES = [
  { value: "student",       label: "Student",       emoji: "🎓" },
  { value: "professional",  label: "Working Pro",   emoji: "💼" },
  { value: "entrepreneur",  label: "Entrepreneur",  emoji: "🚀" },
  { value: "freelancer",    label: "Freelancer",    emoji: "💻" },
  { value: "homemaker",     label: "Homemaker",     emoji: "🏡" },
  { value: "other",         label: "Other",         emoji: "✨" },
];

const LANGUAGES = [
  { code: "en-IN", label: "English",    native: "English" },
  { code: "hi-IN", label: "Hindi",      native: "हिंदी" },
  { code: "mr-IN", label: "Marathi",    native: "मराठी" },
  { code: "bn-IN", label: "Bengali",    native: "বাংলা" },
  { code: "ta-IN", label: "Tamil",      native: "தமிழ்" },
  { code: "te-IN", label: "Telugu",     native: "తెలుగు" },
  { code: "gu-IN", label: "Gujarati",   native: "ગુજરાતી" },
  { code: "pa-IN", label: "Punjabi",    native: "ਪੰਜਾਬੀ" },
  { code: "kn-IN", label: "Kannada",    native: "ಕನ್ನಡ" },
  { code: "ml-IN", label: "Malayalam",  native: "മലയാളം" },
];

const VOICES = [
  { value: "female", label: "Female", emoji: "👩" },
  { value: "male",   label: "Male",   emoji: "👨" },
  { value: "off",    label: "No voice", emoji: "🔇" },
];

const CONFETTI_COLORS = ["#7C6BFF", "#FF3CAC", "#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899"];

// ── Confetti ──────────────────────────────────────────────────────────────────

const Confetti = () => {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        left: `${Math.random() * 100}%`,
        delay: `${(Math.random() * 1.5).toFixed(2)}s`,
        duration: `${(2 + Math.random() * 1.5).toFixed(2)}s`,
        size: `${4 + Math.floor(Math.random() * 6)}px`,
        borderRadius: i % 3 === 0 ? "50%" : "2px",
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            top: 0,
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.borderRadius,
            animation: `confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
};

// ── Progress bar ──────────────────────────────────────────────────────────────

const Progress = ({ step, total }: { step: number; total: number }) => (
  <div className="flex gap-1.5 mb-6">
    {Array.from({ length: total }, (_, i) => (
      <div
        key={i}
        className="h-1 flex-1 rounded-full transition-all duration-300"
        style={{ background: i < step ? "#7C6BFF" : "#e2e8f0" }}
      />
    ))}
  </div>
);

// ── Main modal ────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onComplete: () => void;
}

export const OnboardingModal = ({ open, onComplete }: Props) => {
  const { user, updateUser } = useAuth();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.name ?? "");
  const [userType, setUserType] = useState("");
  const [language, setLanguage] = useState("en-IN");
  const [voice, setVoice] = useState("off");
  const [saving, setSaving] = useState(false);

  const canNext =
    (step === 1 && name.trim().length > 0) ||
    (step === 2 && userType !== "") ||
    (step === 3 && language !== "") ||
    (step === 4 && voice !== "") ||
    step === 5;

  const handleNext = async () => {
    if (step < 4) { setStep((s) => s + 1); return; }
    if (step === 4) {
      setSaving(true);
      try {
        await userAPI.updateOnboarding({ name: name.trim(), userType, language, voice });
        updateUser({ name: name.trim(), userType, language, voice, onboardingComplete: true });
        setStep(5);
      } catch {
        // proceed anyway — we'll retry on next login
        setStep(5);
      } finally {
        setSaving(false);
      }
    }
  };

  const langLabel = LANGUAGES.find((l) => l.code === language)?.label ?? "";
  const typeLabel = USER_TYPES.find((t) => t.value === userType)?.label ?? "";

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-lg p-0 gap-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="px-8 pt-8 pb-8 relative">
          {/* ── Step 1: Name ─────────────────────────────────── */}
          {step === 1 && (
            <>
              <Progress step={1} total={4} />
              <div className="text-3xl mb-2">👋</div>
              <h2 className="text-xl font-bold mb-1">Welcome to BotBetter!</h2>
              <p className="text-[13px] text-muted-foreground mb-6">
                Let's personalise your experience. What should we call you?
              </p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-[15px] font-medium outline-none focus:border-[#7C6BFF] transition"
                onKeyDown={(e) => e.key === "Enter" && canNext && handleNext()}
              />
            </>
          )}

          {/* ── Step 2: User type ────────────────────────────── */}
          {step === 2 && (
            <>
              <Progress step={2} total={4} />
              <div className="text-3xl mb-2">🎯</div>
              <h2 className="text-xl font-bold mb-1">What describes you best?</h2>
              <p className="text-[13px] text-muted-foreground mb-5">
                We'll tailor your agents to fit your life.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {USER_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setUserType(t.value)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition font-medium text-[14px]"
                    style={{
                      borderColor: userType === t.value ? "#7C6BFF" : "#e2e8f0",
                      background: userType === t.value ? "#f3f0ff" : "white",
                      color: userType === t.value ? "#6C00FF" : "#374151",
                    }}
                  >
                    <span className="text-xl">{t.emoji}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Step 3: Language ─────────────────────────────── */}
          {step === 3 && (
            <>
              <Progress step={3} total={4} />
              <div className="text-3xl mb-2">🌐</div>
              <h2 className="text-xl font-bold mb-1">Which language do you prefer?</h2>
              <p className="text-[13px] text-muted-foreground mb-5">
                Your agents will respond in this language.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition"
                    style={{
                      borderColor: language === l.code ? "#7C6BFF" : "#e2e8f0",
                      background: language === l.code ? "#f3f0ff" : "white",
                    }}
                  >
                    <span
                      className="text-[13px] font-semibold"
                      style={{ color: language === l.code ? "#6C00FF" : "#374151" }}
                    >
                      {l.label}
                    </span>
                    <span className="text-[12px] text-muted-foreground">{l.native}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Step 4: Voice ────────────────────────────────── */}
          {step === 4 && (
            <>
              <Progress step={4} total={4} />
              <div className="text-3xl mb-2">🔊</div>
              <h2 className="text-xl font-bold mb-1">Voice preference?</h2>
              <p className="text-[13px] text-muted-foreground mb-6">
                Choose how your agents sound when reading responses aloud.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {VOICES.map((v) => (
                  <button
                    key={v.value}
                    onClick={() => setVoice(v.value)}
                    className="flex flex-col items-center gap-2 py-5 rounded-xl border-2 transition"
                    style={{
                      borderColor: voice === v.value ? "#7C6BFF" : "#e2e8f0",
                      background: voice === v.value ? "#f3f0ff" : "white",
                    }}
                  >
                    <span className="text-3xl">{v.emoji}</span>
                    <span
                      className="text-[13px] font-semibold"
                      style={{ color: voice === v.value ? "#6C00FF" : "#374151" }}
                    >
                      {v.label}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Step 5: Done ─────────────────────────────────── */}
          {step === 5 && (
            <>
              <Confetti />
              <div className="relative z-20 text-center py-4">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-2">You're all set!</h2>
                <p className="text-[14px] text-muted-foreground mb-6">
                  Welcome to BotBetter, <span className="font-semibold text-foreground">{name}</span>! Your agents are ready.
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
                    <span className="text-muted-foreground">Voice:</span>
                    <span className="font-semibold capitalize">{voice}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Navigation ───────────────────────────────────── */}
          <div className="flex items-center gap-3 mt-6">
            {step > 1 && step < 5 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1 px-4 py-2.5 rounded-full border border-border text-[13px] font-medium text-muted-foreground hover:text-foreground transition"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            )}
            <button
              disabled={!canNext || saving}
              onClick={step === 5 ? onComplete : handleNext}
              className="flex-1 py-3 rounded-full text-[14px] font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "#7C6BFF", color: "white" }}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {step === 4 ? "Finish setup!" : step === 5 ? "Open Dashboard →" : "Continue →"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
