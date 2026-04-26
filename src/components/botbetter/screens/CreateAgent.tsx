import { useState } from "react";
import { ScreenKey } from "../TopNav";
import { DashShell } from "../DashShell";
import { Bot, Check, ArrowLeft, ArrowRight, GraduationCap, ShoppingBag, Heart, Wallet, Briefcase, Sparkles, Globe, Bell, StickyNote, Calculator, Mail, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { name: "Education", icon: GraduationCap },
  { name: "E-commerce", icon: ShoppingBag },
  { name: "Health", icon: Heart },
  { name: "Finance", icon: Wallet },
  { name: "Business", icon: Briefcase },
  { name: "Creative", icon: Sparkles },
];
const personalities = ["Friendly", "Professional", "Strict", "Funny"];
const langs = ["Hindi", "English", "Hinglish"];
const tools = [
  { name: "Web search", icon: Globe },
  { name: "Notes", icon: StickyNote },
  { name: "Reminders", icon: Bell },
  { name: "Calculator", icon: Calculator },
  { name: "Email", icon: Mail },
  { name: "Calendar", icon: Calendar },
];

export const CreateAgent = ({ active, onNavigate }: { active: ScreenKey; onNavigate: (s: ScreenKey) => void }) => {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("E-commerce");
  const [name, setName] = useState("Mera Agent");
  const [personality, setPersonality] = useState("Friendly");
  const [lang, setLang] = useState("Hinglish");
  const [instructions, setInstructions] = useState("Tum ek helpful assistant ho jo customers ke sawal ka jawab dete ho.");
  const [activeTools, setActiveTools] = useState<string[]>(["Web search", "Notes"]);
  const [visibility, setVisibility] = useState<"private" | "public">("private");

  const toggleTool = (t: string) =>
    setActiveTools((a) => (a.includes(t) ? a.filter((x) => x !== t) : [...a, t]));

  const steps = ["Category", "Identity", "Voice", "Tools", "Publish"];

  return (
    <DashShell active={active} onNavigate={onNavigate} title="Create Agent">
      <div className="p-4 sm:p-6 max-w-4xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => {
              const idx = i + 1;
              const done = step > idx;
              const current = step === idx;
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={cn(
                      "h-7 w-7 rounded-full grid place-items-center text-[12px] shrink-0 transition",
                      done && "bg-primary text-primary-foreground",
                      current && "bg-primary/20 text-primary border border-primary",
                      !done && !current && "border border-border text-muted-foreground"
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : idx}
                  </div>
                  <span
                    className={cn(
                      "label-xs hidden sm:inline",
                      current ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {s.toUpperCase()}
                  </span>
                  {i < steps.length - 1 && (
                    <div className={cn("h-px flex-1", done ? "bg-primary" : "bg-border")} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Steps */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 fade-in">
          {step === 1 && (
            <>
              <div className="label-xs text-muted-foreground">STEP 1</div>
              <h3 className="text-xl mt-1 mb-5">Choose a category</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((c) => {
                  const sel = c.name === category;
                  return (
                    <button
                      key={c.name}
                      onClick={() => setCategory(c.name)}
                      className={cn(
                        "rounded-xl border p-5 text-left transition",
                        sel ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      )}
                    >
                      <c.icon className="h-5 w-5" style={{ color: sel ? "hsl(var(--primary))" : undefined }} />
                      <div className="text-[14px] font-medium mt-3">{c.name}</div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="label-xs text-muted-foreground">STEP 2</div>
              <h3 className="text-xl mt-1 mb-5">Name + personality</h3>
              <div className="space-y-4">
                <div>
                  <div className="label-xs text-muted-foreground mb-1.5">AGENT NAME</div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-[14px] outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <div className="label-xs text-muted-foreground mb-1.5">PERSONALITY</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {personalities.map((p) => (
                      <button
                        key={p}
                        onClick={() => setPersonality(p)}
                        className={cn(
                          "py-2 rounded-lg border text-[13px] transition",
                          personality === p
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/40"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="label-xs text-muted-foreground">STEP 3</div>
              <h3 className="text-xl mt-1 mb-5">Language + instructions</h3>
              <div className="space-y-4">
                <div>
                  <div className="label-xs text-muted-foreground mb-1.5">LANGUAGE</div>
                  <div className="flex gap-2">
                    {langs.map((l) => (
                      <button
                        key={l}
                        onClick={() => setLang(l)}
                        className={cn(
                          "px-4 py-2 rounded-full border text-[13px] transition",
                          lang === l
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/40"
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="label-xs text-muted-foreground mb-1.5">SYSTEM INSTRUCTIONS</div>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={5}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-[14px] outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="label-xs text-muted-foreground">STEP 4</div>
              <h3 className="text-xl mt-1 mb-5">Pick tools</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {tools.map((t) => {
                  const on = activeTools.includes(t.name);
                  return (
                    <button
                      key={t.name}
                      onClick={() => toggleTool(t.name)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-lg border text-[13px] transition",
                        on ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      )}
                    >
                      <div
                        className={cn(
                          "h-5 w-5 rounded grid place-items-center border",
                          on ? "bg-primary border-primary text-primary-foreground" : "border-border"
                        )}
                      >
                        {on && <Check className="h-3 w-3" />}
                      </div>
                      <t.icon className="h-4 w-4 text-muted-foreground" />
                      <span>{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <div className="label-xs text-muted-foreground">STEP 5</div>
              <h3 className="text-xl mt-1 mb-5">Publish</h3>
              <div className="grid md:grid-cols-2 gap-3 mb-5">
                {(["private", "public"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setVisibility(v)}
                    className={cn(
                      "rounded-xl border p-5 text-left transition",
                      visibility === v ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    )}
                  >
                    <div className="font-medium capitalize">{v}</div>
                    <p className="text-[12px] text-muted-foreground mt-1">
                      {v === "private"
                        ? "Only you can use this agent."
                        : "List on marketplace, earn 30% commission."}
                    </p>
                  </button>
                ))}
              </div>

              {/* Preview */}
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="label-xs text-muted-foreground mb-2">PREVIEW</div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 border border-primary/40 grid place-items-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-[14px]">{name}</div>
                    <div className="label-xs text-muted-foreground">
                      {category.toUpperCase()} · {personality.toUpperCase()} · {lang.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {activeTools.map((t) => (
                    <span key={t} className="label-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Nav */}
          <div className="flex items-center justify-between mt-7 pt-5 border-t border-border">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="inline-flex items-center gap-1.5 text-[13px] px-3 py-2 rounded-full border border-border disabled:opacity-40 hover:bg-secondary"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <span className="text-[12px] text-muted-foreground">
              Step {step} of {steps.length}
            </span>
            {step < 5 ? (
              <button
                onClick={() => setStep((s) => Math.min(5, s + 1))}
                className="inline-flex items-center gap-1.5 text-[13px] px-4 py-2 rounded-full bg-primary text-primary-foreground"
              >
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate("dashboard")}
                className="inline-flex items-center gap-1.5 text-[13px] px-4 py-2 rounded-full bg-primary text-primary-foreground"
              >
                Publish agent <Check className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </DashShell>
  );
};
