import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, Eye, EyeOff, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  defaultTab?: "login" | "signup";
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal = ({ open, defaultTab = "login", onClose, onSuccess }: Props) => {
  const { login, signup } = useAuth();

  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync tab and clear form whenever the modal is (re-)opened
  useEffect(() => {
    if (open) {
      setTab(defaultTab);
      setError("");
      setName("");
      setEmail("");
      setPassword("");
    }
  }, [open, defaultTab]);

  const switchTab = (t: "login" | "signup") => {
    setTab(t);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    if (tab === "signup" && !name.trim()) {
      setError("Name is required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (tab === "login") {
        await login(email.trim(), password);
      } else {
        await signup(name.trim(), email.trim(), password);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-border">
          <div
            className="h-10 w-10 rounded-xl grid place-items-center mx-auto mb-3"
            style={{ background: "#7C6BFF" }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold">
            {tab === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-[13px] text-muted-foreground mt-1">
            {tab === "login"
              ? "Log in to access your agents and automations."
              : "Start free — no credit card required."}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-border">
          {(["login", "signup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 py-3 text-[13px] font-medium transition ${
                tab === t
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        {/* Google OAuth */}
        <div className="px-8 pt-6 pb-2">
          <a
            href={`${import.meta.env.VITE_API_URL || ""}/api/auth/google`}
            className="flex items-center justify-center gap-3 w-full py-2.5 rounded-full border border-border bg-background hover:bg-muted transition text-[14px] font-medium"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>

          <div className="flex items-center gap-3 mt-5 mb-1">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground">or continue with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-6 pt-2 space-y-4">
          {tab === "signup" && (
            <div>
              <label className="text-[12px] font-medium text-muted-foreground">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Sharma"
                className="mt-1.5 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-[14px] outline-none focus:border-primary/60 transition"
                disabled={loading}
                autoFocus
              />
            </div>
          )}

          <div>
            <label className="text-[12px] font-medium text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              className="mt-1.5 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-[14px] outline-none focus:border-primary/60 transition"
              disabled={loading}
              autoFocus={tab === "login"}
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-muted-foreground">Password</label>
            <div className="relative mt-1.5">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === "signup" ? "Min. 6 characters" : "Your password"}
                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-border bg-background text-[14px] outline-none focus:border-primary/60 transition"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[13px] text-red-400">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-full text-[14px] font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "#7C6BFF", color: "white" }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {tab === "login" ? "Log in" : "Create account"}
          </button>

          <p className="text-center text-[12px] text-muted-foreground">
            {tab === "login" ? "No account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => switchTab(tab === "login" ? "signup" : "login")}
              className="text-primary hover:underline font-medium"
            >
              {tab === "login" ? "Sign up free" : "Log in"}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
