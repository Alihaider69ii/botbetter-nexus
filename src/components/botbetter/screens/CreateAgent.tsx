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
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => {
              const idx = i + 1;
              const done = step > idx;
              const current = step === idx;
              return (
                <div key={s} className="flex items-center gap-3 flex-1">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full grid place-items-center text-xs font-bold shrink-0 transition-all shadow-sm",
                      done && "bg-gradient-to-r from-[#6C00FF] to-[#FF3CAC] text-white",
                      current && "bg-purple-100 text-[#6C00FF] border-2 border-[#6C00FF]",
                      !done && !current && "border-2 border-slate-200 bg-white text-slate-400"
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : idx}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-bold uppercase tracking-widest hidden sm:inline",
                      current ? "text-slate-900" : "text-slate-400"
                    )}
                  >
                    {s}
                  </span>
                  {i < steps.length - 1 && (
                    <div className={cn("h-1 flex-1 rounded-full", done ? "bg-gradient-to-r from-[#6C00FF] to-[#FF3CAC]" : "bg-slate-200")} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Steps */}
        <div className="bento-card p-6 sm:p-10 animate-fade-in">
          {step === 1 && (
            <>
              <div className="text-xs font-bold tracking-wider text-purple-600 uppercase mb-2">STEP 1</div>
              <h3 className="text-3xl font-bold text-slate-900 mb-8">Choose a Category</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {categories.map((c) => {
                  const sel = c.name === category;
                  return (
                    <button
                      key={c.name}
                      onClick={() => setCategory(c.name)}
                      className={cn(
                        "rounded-2xl border-2 p-6 text-left transition-all hover:-translate-y-1 flex flex-col items-start gap-4",
                        sel ? "border-purple-400 bg-purple-50 shadow-md" : "border-slate-100 bg-white hover:border-purple-200 hover:shadow-sm"
                      )}
                    >
                      <div className={cn("h-12 w-12 rounded-xl grid place-items-center", sel ? "bg-[#6C00FF] text-white" : "bg-slate-100 text-slate-500")}>
                        <c.icon className="h-6 w-6" />
                      </div>
                      <div className={cn("text-lg font-bold", sel ? "text-[#6C00FF]" : "text-slate-700")}>{c.name}</div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-xs font-bold tracking-wider text-purple-600 uppercase mb-2">STEP 2</div>
              <h3 className="text-3xl font-bold text-slate-900 mb-8">Name & Personality</h3>
              <div className="space-y-8">
                <div>
                  <div className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-3">AGENT NAME</div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-lg font-bold text-slate-900 outline-none focus:border-purple-500 transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-3">PERSONALITY</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {personalities.map((p) => (
                      <button
                        key={p}
                        onClick={() => setPersonality(p)}
                        className={cn(
                          "py-3 rounded-xl border-2 text-sm font-bold transition-all",
                          personality === p
                            ? "border-purple-500 bg-purple-50 text-purple-700 shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-purple-300"
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
              <div className="text-xs font-bold tracking-wider text-purple-600 uppercase mb-2">STEP 3</div>
              <h3 className="text-3xl font-bold text-slate-900 mb-8">Language & Instructions</h3>
              <div className="space-y-8">
                <div>
                  <div className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-3">LANGUAGE</div>
                  <div className="flex gap-3">
                    {langs.map((l) => (
                      <button
                        key={l}
                        onClick={() => setLang(l)}
                        className={cn(
                          "px-6 py-3 rounded-xl border-2 text-sm font-bold transition-all",
                          lang === l
                            ? "border-purple-500 bg-purple-50 text-purple-700 shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-purple-300"
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-3">SYSTEM INSTRUCTIONS</div>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-base font-medium text-slate-700 outline-none focus:border-purple-500 transition-colors resize-none shadow-sm"
                  />
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="text-xs font-bold tracking-wider text-purple-600 uppercase mb-2">STEP 4</div>
              <h3 className="text-3xl font-bold text-slate-900 mb-8">Pick Tools</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {tools.map((t) => {
                  const on = activeTools.includes(t.name);
                  return (
                    <button
                      key={t.name}
                      onClick={() => toggleTool(t.name)}
                      className={cn(
                        "flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all",
                        on ? "border-purple-400 bg-purple-50 shadow-sm" : "border-slate-100 bg-white hover:border-purple-200"
                      )}
                    >
                      <div
                        className={cn(
                          "h-6 w-6 rounded-md grid place-items-center border-2 transition-colors",
                          on ? "bg-[#6C00FF] border-[#6C00FF] text-white" : "border-slate-300 bg-white"
                        )}
                      >
                        {on && <Check className="h-4 w-4" />}
                      </div>
                      <t.icon className={cn("h-5 w-5", on ? "text-purple-600" : "text-slate-400")} />
                      <span className={cn("text-base font-bold", on ? "text-slate-900" : "text-slate-600")}>{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <div className="text-xs font-bold tracking-wider text-purple-600 uppercase mb-2">STEP 5</div>
              <h3 className="text-3xl font-bold text-slate-900 mb-8">Publish</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {(["private", "public"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setVisibility(v)}
                    className={cn(
                      "rounded-2xl border-2 p-6 text-left transition-all",
                      visibility === v ? "border-purple-400 bg-purple-50 shadow-md" : "border-slate-100 bg-white hover:border-purple-200"
                    )}
                  >
                    <div className={cn("text-lg font-bold capitalize", visibility === v ? "text-[#6C00FF]" : "text-slate-800")}>{v}</div>
                    <p className="text-sm font-medium text-slate-500 mt-2">
                      {v === "private"
                        ? "Only you can use this agent."
                        : "List on marketplace, earn 30% commission."}
                    </p>
                  </button>
                ))}
              </div>

              {/* Preview */}
              <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-6">
                <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4">PREVIEW</div>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#6C00FF] to-[#FF3CAC] grid place-items-center shadow-lg shadow-purple-500/20">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-slate-900">{name}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                      {category} · {personality} · {lang}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-5">
                  {activeTools.map((t) => (
                    <span key={t} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border-2 border-slate-200 bg-white text-slate-600">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Nav */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t-2 border-slate-100">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest px-6 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
              Step {step} of {steps.length}
            </span>
            {step < 5 ? (
              <button
                onClick={() => setStep((s) => Math.min(5, s + 1))}
                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest px-6 py-3 rounded-xl bg-gradient-to-r from-[#6C00FF] to-[#FF3CAC] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate("dashboard")}
                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest px-6 py-3 rounded-xl bg-emerald-500 text-white shadow-md hover:bg-emerald-600 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Publish Agent <Check className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </DashShell>
  );
};
