import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { chatAPI, userAPI, type LimitStatusResponse, type ChatMessage } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useVoiceChat } from "@/hooks/use-voice-chat";
import { AuthModal } from "./AuthModal";
import type { ScreenKey } from "../TopNav";

type Msg = { from: "user"; text: string } | { from: "nexus"; text: string };
type Lang = "en-IN" | "hi-IN" | "hinglish";
type Personality = "maya" | "kabir";

const SEED: Msg[] = [
  {
    from: "nexus",
    text: "Hey! I'm NEXUS ⚡ — your master AI agent. Tell me anything and I'll handle it.\n\nTry:\n• \"Help me lose weight\"\n• \"Prepare me for interviews\"\n• \"Explain quantum computing\"\n• \"Calculate my SIP returns\"",
  },
];

const ALL_APPS = [
  { name: "WhatsApp", icon: "💬" },
  { name: "Gmail", icon: "📧" },
  { name: "Calendar", icon: "📅" },
  { name: "Notion", icon: "📝" },
];

/* ── Injected CSS (holographic design — DO NOT modify layout/animations) ── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&family=Share+Tech+Mono&display=swap');

.nx-root {
  position:fixed; inset:0;
  font-family:'Space Grotesk',sans-serif;
  background:#03020d; color:#e8f9ff;
  overflow:hidden; z-index:40;
  display:flex; flex-direction:column;
}
.nx-hf  { font-family:'Syne',sans-serif; font-weight:800; }
.nx-mono{ font-family:'Share Tech Mono',monospace; }

@keyframes nx-blink      { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.9)} }
@keyframes nx-scan       { 0%{top:0%} 100%{top:100%} }
@keyframes nx-voice-bar  { 0%,100%{height:4px;background:#00f0ff} 50%{height:20px;background:#ff007f} }
@keyframes nx-orb-float  { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(60px,-60px) scale(1.15)} 100%{transform:translate(-40px,40px) scale(.9)} }
@keyframes nx-prog-shift { 0%,100%{filter:hue-rotate(0deg)} 50%{filter:hue-rotate(30deg)} }
@keyframes nx-fade-up    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes nx-bounce-dot { 0%,100%{transform:scale(.6);opacity:.3} 50%{transform:scale(1);opacity:1} }
@keyframes nx-rec-pulse  { 0%,100%{box-shadow:0 0 0 0 rgba(255,0,127,.4)} 50%{box-shadow:0 0 0 8px rgba(255,0,127,0)} }

/* HEADER */
.nx-header {
  height:64px; min-height:64px;
  display:flex; align-items:center; justify-content:space-between;
  padding:0 24px;
  border-bottom:1px dashed rgba(0,240,255,.3);
  background:rgba(3,2,13,.9); backdrop-filter:blur(12px);
  z-index:20; position:relative; flex-shrink:0;
}
.nx-brand        { display:flex; align-items:center; gap:10px; }
.nx-logo         { width:32px; height:32px; border-radius:8px; background:linear-gradient(45deg,#00f0ff,#ff007f); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:16px; color:#fff; box-shadow:0 0 15px rgba(0,240,255,.4); flex-shrink:0; }
.nx-brand-name   { font-size:18px; letter-spacing:2px; color:#fff; }
.nx-telemetry    { display:flex; align-items:center; gap:18px; font-size:12px; }
.nx-status-pill  { display:flex; align-items:center; gap:7px; background:rgba(0,240,255,.07); border:1px solid rgba(0,240,255,.22); padding:4px 12px; border-radius:30px; }
.nx-pulse-dot    { width:6px; height:6px; border-radius:50%; background:#39ff14; box-shadow:0 0 8px #39ff14; animation:nx-blink 1.5s infinite; }
.nx-clock        { font-variant-numeric:tabular-nums; font-weight:bold; color:#00f0ff; }
.nx-hdr-actions  { display:flex; align-items:center; gap:8px; }
.nx-hdr-btn      { height:34px; padding:0 14px; border-radius:9px; border:1px solid rgba(0,240,255,.2); background:rgba(0,240,255,.04); color:#00f0ff; cursor:pointer; display:flex; align-items:center; gap:6px; font-size:11px; font-weight:700; letter-spacing:1px; transition:all .25s; white-space:nowrap; font-family:'Space Grotesk',sans-serif; }
.nx-hdr-btn:hover{ background:linear-gradient(135deg,#00f0ff,#ff007f); color:#fff; box-shadow:0 0 14px rgba(255,0,127,.4); transform:scale(1.04); }
.nx-hdr-btn--pink{ background:rgba(255,0,127,.08); border-color:rgba(255,0,127,.35); color:#ff007f; }
.nx-hdr-btn--icon{ width:36px; padding:0; justify-content:center; font-size:18px; border-radius:9px; }
.nx-avatar       { width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,#00f0ff,#ff007f); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:13px; color:#fff; box-shadow:0 0 10px rgba(0,240,255,.35); cursor:pointer; flex-shrink:0; transition:transform .2s; position:relative; }
.nx-avatar:hover { transform:scale(1.08); }
.nx-av-drop      { position:absolute; top:calc(100% + 8px); right:0; background:rgba(5,3,18,.98); border:1px solid rgba(0,240,255,.4); border-radius:11px; padding:5px 0; z-index:60; box-shadow:0 8px 28px rgba(0,0,0,.7); animation:nx-fade-up .18s ease; min-width:180px; }
.nx-drop-row     { display:flex; align-items:center; gap:9px; padding:9px 15px; font-size:12px; font-weight:600; color:rgba(232,249,255,.65); cursor:pointer; transition:all .15s; font-family:'Space Grotesk',sans-serif; white-space:nowrap; }
.nx-drop-row:hover     { background:rgba(0,240,255,.07); color:#00f0ff; }
.nx-drop-row--red      { color:#ff007f; }
.nx-drop-row--red:hover{ background:rgba(255,0,127,.07); color:#ff3385; }

/* COCKPIT */
.nx-cockpit { display:flex; flex:1; overflow:hidden; position:relative; z-index:5; }
.nx-canvas  { position:absolute; inset:0; width:100%; height:100%; z-index:0; pointer-events:none; }
.nx-aurora  { position:absolute; inset:0; filter:blur(100px); opacity:.55; z-index:1; mix-blend-mode:screen; pointer-events:none; overflow:hidden; }
.nx-orb     { position:absolute; border-radius:50%; filter:blur(50px); mix-blend-mode:screen; animation:nx-orb-float 14s ease-in-out infinite alternate; }
.nx-orb-1   { width:450px; height:450px; background:radial-gradient(circle,#00f0ff 0%,transparent 70%); top:10%; left:15%; animation-duration:18s; }
.nx-orb-2   { width:500px; height:500px; background:radial-gradient(circle,#ff007f 0%,transparent 70%); bottom:10%; right:15%; animation-duration:22s; }
.nx-orb-3   { width:350px; height:350px; background:radial-gradient(circle,#7f00ff 0%,transparent 70%); top:35%; left:45%; animation-duration:16s; }
.nx-sweep   { position:absolute; left:0; width:100%; height:3px; background:linear-gradient(90deg,transparent,#00f0ff,#ff007f,transparent); animation:nx-scan 7s linear infinite; z-index:2; pointer-events:none; }

/* LEFT PANEL */
.nx-left {
  width:248px; flex-shrink:0;
  background:rgba(10,4,30,.45); border-right:1px dashed rgba(0,240,255,.2);
  backdrop-filter:blur(20px);
  display:flex; flex-direction:column;
  padding:16px; z-index:10; overflow-y:auto;
  transition:width .35s cubic-bezier(.16,1,.3,1), padding .35s, min-width .35s;
  min-width:248px;
}
.nx-left--closed { width:0; min-width:0; padding:0; overflow:hidden; }
.nx-left::-webkit-scrollbar { width:3px; }
.nx-left::-webkit-scrollbar-thumb { background:rgba(0,240,255,.12); border-radius:2px; }

.nx-section { margin-bottom:20px; }
.nx-stitle  { font-size:10px; font-weight:700; letter-spacing:3px; color:rgba(232,249,255,.38); margin-bottom:10px; text-transform:uppercase; font-family:'Syne',sans-serif; flex-shrink:0; }

.nx-hist-row { padding:7px 10px; border-radius:8px; margin-bottom:4px; font-size:11px; color:rgba(232,249,255,.6); background:rgba(0,240,255,.015); border:1px solid transparent; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:pointer; transition:all .15s; }
.nx-hist-row:hover { background:rgba(0,240,255,.07); color:#e8f9ff; border-color:rgba(0,240,255,.2); }
.nx-hist-pfx { color:#00f0ff; font-weight:bold; margin-right:4px; }

.nx-stat-pair  { display:flex; justify-content:space-between; align-items:center; font-size:11px; margin-bottom:7px; color:rgba(232,249,255,.65); }
.nx-stat-pink  { color:#ff007f; font-weight:700; font-size:10px; padding:1px 7px; border-radius:4px; background:rgba(255,0,127,.12); border:1px solid rgba(255,0,127,.3); }
.nx-stat-green { color:#39ff14; font-weight:700; }
.nx-prog-bar   { width:100%; height:5px; background:rgba(255,255,255,.05); border-radius:3px; overflow:hidden; margin-bottom:8px; }
.nx-prog-fill  { height:100%; background:linear-gradient(90deg,#00f0ff,#ff007f); border-radius:3px; animation:nx-prog-shift 4s linear infinite; transition:width .5s ease; }

.nx-ref-box  { display:flex; align-items:center; gap:6px; background:rgba(0,240,255,.03); border:1px dashed rgba(0,240,255,.28); border-radius:10px; padding:9px 12px; margin-bottom:6px; }
.nx-ref-code { font-size:13px; font-weight:700; letter-spacing:3px; color:#00f0ff; flex:1; }
.nx-ref-copy { font-size:9px; font-weight:700; padding:3px 8px; border-radius:5px; border:1px solid rgba(0,240,255,.28); background:rgba(0,240,255,.07); color:#00f0ff; cursor:pointer; transition:all .15s; font-family:'Space Grotesk',sans-serif; flex-shrink:0; }
.nx-ref-copy:hover { background:rgba(0,240,255,.14); }
.nx-ref-copy--done { color:#39ff14; border-color:rgba(57,255,20,.35); background:rgba(57,255,20,.08); }

.nx-app-row     { display:flex; align-items:center; gap:8px; padding:7px 10px; border-radius:8px; margin-bottom:4px; font-size:11px; font-weight:600; color:rgba(232,249,255,.65); background:rgba(0,240,255,.02); border:1px solid rgba(0,240,255,.1); }
.nx-app-dot     { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
.nx-app-dot--on { background:#39ff14; box-shadow:0 0 6px #39ff14; animation:nx-blink 2s infinite; }
.nx-app-dot--off{ background:rgba(255,255,255,.2); }

.nx-empty { font-size:10px; color:rgba(232,249,255,.28); text-align:center; padding:10px 4px; line-height:1.7; font-family:'Share Tech Mono',monospace; }

/* RIGHT PANEL */
.nx-right {
  width:244px; flex-shrink:0;
  background:rgba(10,4,30,.45); border-left:1px dashed rgba(0,240,255,.2);
  backdrop-filter:blur(20px);
  display:flex; flex-direction:column;
  padding:16px; z-index:10; overflow-y:auto;
}
.nx-right::-webkit-scrollbar { width:3px; }
.nx-right::-webkit-scrollbar-thumb { background:rgba(0,240,255,.12); border-radius:2px; }

.nx-prof-card { background:rgba(0,240,255,.03); border:1px solid rgba(0,240,255,.15); border-radius:14px; padding:14px; margin-bottom:18px; display:flex; flex-direction:column; align-items:center; gap:4px; text-align:center; }
.nx-prof-av   { width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg,#00f0ff,#ff007f); box-shadow:0 0 15px rgba(0,240,255,.4); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:18px; color:#fff; margin-bottom:4px; }
.nx-prof-name { font-weight:700; font-size:13px; color:#fff; }
.nx-prof-mail { font-size:10px; color:rgba(232,249,255,.4); margin-bottom:4px; }
.nx-plan-tag  { font-size:8px; font-weight:900; padding:2px 8px; border-radius:20px; border:1px solid #00f0ff; color:#00f0ff; text-transform:uppercase; letter-spacing:1px; }
.nx-plan-tag--admin { border-color:#ff007f; color:#ff007f; }

.nx-qa-btn      { width:100%; padding:9px 12px; margin-bottom:7px; border-radius:10px; border:1px solid rgba(0,240,255,.2); background:rgba(0,240,255,.03); color:rgba(232,249,255,.7); font-size:11px; font-weight:700; letter-spacing:.5px; cursor:pointer; display:flex; align-items:center; gap:8px; transition:all .2s; font-family:'Space Grotesk',sans-serif; text-transform:uppercase; }
.nx-qa-btn:hover      { background:rgba(0,240,255,.09); color:#00f0ff; border-color:rgba(0,240,255,.4); }
.nx-qa-btn--active    { background:rgba(255,0,127,.1); border-color:rgba(255,0,127,.4); color:#ff007f; box-shadow:0 0 12px rgba(255,0,127,.15); }
.nx-qa-btn--new       { background:rgba(57,255,20,.04); border-color:rgba(57,255,20,.25); color:rgba(57,255,20,.85); }
.nx-qa-btn--new:hover { background:rgba(57,255,20,.1); color:#39ff14; border-color:rgba(57,255,20,.45); }
.nx-qa-btn:disabled   { opacity:.45; cursor:not-allowed; transform:none !important; }

.nx-tgl-group  { display:flex; gap:4px; width:100%; margin-bottom:12px; }
.nx-tgl-opt    { flex:1; padding:7px 2px; border-radius:8px; font-size:9px; font-weight:700; letter-spacing:1px; border:1px solid rgba(0,240,255,.15); background:transparent; color:rgba(232,249,255,.35); cursor:pointer; transition:all .18s; text-align:center; font-family:'Space Grotesk',sans-serif; text-transform:uppercase; }
.nx-tgl-opt:hover     { color:rgba(232,249,255,.8); border-color:rgba(0,240,255,.3); }
.nx-tgl-opt--on       { background:rgba(0,240,255,.12); border-color:rgba(0,240,255,.45); color:#00f0ff; box-shadow:0 0 8px rgba(0,240,255,.12); }
.nx-tgl-opt--pink-on  { background:rgba(255,0,127,.1); border-color:rgba(255,0,127,.4); color:#ff007f; box-shadow:0 0 8px rgba(255,0,127,.12); }

.nx-login-card { background:rgba(0,240,255,.03); border:1px dashed rgba(0,240,255,.2); border-radius:12px; padding:16px; text-align:center; font-size:11px; color:rgba(232,249,255,.45); line-height:1.7; margin-bottom:14px; }
.nx-login-card button { margin-top:8px; padding:7px 16px; border-radius:8px; border:1px solid rgba(0,240,255,.35); background:rgba(0,240,255,.07); color:#00f0ff; font-size:11px; font-weight:700; cursor:pointer; font-family:'Space Grotesk',sans-serif; width:100%; transition:all .2s; }
.nx-login-card button:hover { background:rgba(0,240,255,.14); }

/* CHAT CENTER */
.nx-chat { flex:1; display:flex; flex-direction:column; position:relative; overflow:hidden; min-width:0; }
.nx-msgs { flex:1; display:flex; flex-direction:column; gap:16px; padding:24px 28px; overflow-y:auto; z-index:5; }
.nx-msgs::-webkit-scrollbar { width:4px; }
.nx-msgs::-webkit-scrollbar-thumb { background:rgba(0,240,255,.14); border-radius:2px; }

.nx-bbl-row       { display:flex; gap:11px; max-width:640px; animation:nx-fade-up .28s ease both; }
.nx-bbl-row--right{ align-self:flex-end; justify-content:flex-end; }
.nx-bbl-av        { width:32px; height:32px; border-radius:10px; flex-shrink:0; background:linear-gradient(135deg,#00f0ff,#ff007f); box-shadow:0 0 12px rgba(0,240,255,.45); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:13px; color:#fff; margin-top:2px; }
.nx-bbl-av--user  { background:#ff007f; box-shadow:0 0 12px rgba(255,0,127,.45); }
.nx-bbl           { background:rgba(8,3,28,.55); border:1px solid rgba(0,240,255,.22); border-radius:0 14px 14px 14px; padding:14px 18px; font-size:13.5px; line-height:1.65; color:#e8f9ff; backdrop-filter:blur(14px); box-shadow:0 8px 32px rgba(0,0,0,.28); white-space:pre-line; }
.nx-bbl--user     { background:rgba(255,0,127,.055); border-color:rgba(255,0,127,.32); border-radius:14px 0 14px 14px; }
.nx-bbl-name      { font-size:10px; font-weight:700; letter-spacing:2px; color:#00f0ff; margin-bottom:7px; text-transform:uppercase; font-family:'Syne',sans-serif; }
.nx-bbl-name--user{ color:#ff007f; }
.nx-vibe          { display:inline-flex; align-items:center; gap:6px; font-size:9px; letter-spacing:2px; color:rgba(232,249,255,.38); margin-top:9px; font-weight:bold; font-family:'Share Tech Mono',monospace; }
.nx-vibe-dot      { width:5px; height:5px; border-radius:50%; background:#39ff14; animation:nx-blink 1.5s infinite; flex-shrink:0; }

.nx-typing { display:flex; gap:5px; align-items:center; padding:6px 2px; }
.nx-dot    { width:7px; height:7px; border-radius:50%; background:rgba(0,240,255,.45); animation:nx-bounce-dot 1.2s ease-in-out infinite; }
.nx-dot:nth-child(2){ animation-delay:.2s; }
.nx-dot:nth-child(3){ animation-delay:.4s; }

.nx-err-bar     { margin:0 20px 8px; padding:10px 14px; border-radius:10px; background:rgba(255,0,127,.07); border:1px solid rgba(255,0,127,.3); color:#ff007f; font-size:12px; font-weight:600; display:flex; align-items:center; gap:8px; z-index:10; flex-shrink:0; }
.nx-err-dismiss { margin-left:auto; font-size:10px; text-decoration:underline; cursor:pointer; background:none; border:none; color:#ff007f; padding:0; font-weight:bold; font-family:'Space Grotesk',sans-serif; }

/* INPUT DOCK */
.nx-dock     { border-top:1px dashed rgba(0,240,255,.2); background:rgba(3,2,13,.88); padding:14px 24px 16px; z-index:10; backdrop-filter:blur(12px); flex-shrink:0; }
.nx-capsule  { display:flex; align-items:center; gap:9px; max-width:860px; margin:0 auto; }
.nx-input    { flex:1; background:rgba(0,240,255,.02); border:1px solid rgba(0,240,255,.28); border-radius:30px; padding:11px 20px; font-family:'Space Grotesk',sans-serif; font-size:14px; color:#e8f9ff; outline:none; box-shadow:inset 0 0 10px rgba(0,240,255,.04); transition:all .25s; }
.nx-input:focus      { border-color:#ff007f; box-shadow:0 0 15px rgba(255,0,127,.22); }
.nx-input::placeholder{ color:rgba(0,240,255,.32); font-size:12px; letter-spacing:.5px; }
.nx-input:disabled   { opacity:.45; }

.nx-ibtn          { width:42px; height:42px; min-width:42px; border-radius:50%; border:1px solid rgba(0,240,255,.28); background:rgba(0,240,255,.025); color:#00f0ff; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:16px; transition:all .28s cubic-bezier(.175,.885,.32,1.275); }
.nx-ibtn:hover    { box-shadow:0 0 15px #00f0ff; transform:scale(1.08); background:rgba(0,240,255,.09); }
.nx-ibtn:disabled { opacity:.45; cursor:not-allowed; transform:none !important; box-shadow:none !important; }
.nx-ibtn--mic     { background:rgba(255,0,127,.08); border-color:rgba(255,0,127,.38); color:#ff007f; box-shadow:0 0 10px rgba(255,0,127,.28); }
.nx-ibtn--mic:hover     { box-shadow:0 0 20px #ff007f; background:rgba(255,0,127,.16); }
.nx-ibtn--mic.nx-rec    { background:rgba(255,0,127,.22); animation:nx-rec-pulse 1s ease-in-out infinite; }
.nx-ibtn--send    { background:linear-gradient(135deg,#00f0ff,#ff007f); border:none; color:#fff; font-weight:bold; font-size:18px; }
.nx-ibtn--send:hover    { box-shadow:0 0 20px rgba(255,0,127,.55); }
.nx-ibtn--send:disabled { opacity:.45; }

.nx-freqs   { display:flex; align-items:flex-end; justify-content:center; gap:3px; height:16px; margin-top:9px; max-width:860px; margin-left:auto; margin-right:auto; }
.nx-freq    { width:2.5px; background:#00f0ff; border-radius:1px; animation:nx-voice-bar 1s ease-in-out infinite; opacity:.4; }
.nx-freq:nth-child(1) { animation-delay:0s;   height:6px;  }
.nx-freq:nth-child(2) { animation-delay:.12s; height:14px; }
.nx-freq:nth-child(3) { animation-delay:.05s; height:8px;  }
.nx-freq:nth-child(4) { animation-delay:.25s; height:18px; }
.nx-freq:nth-child(5) { animation-delay:.3s;  height:10px; }
.nx-freq:nth-child(6) { animation-delay:.42s; height:20px; }
.nx-freq:nth-child(7) { animation-delay:.15s; height:6px;  }
.nx-freq:nth-child(8) { animation-delay:.35s; height:13px; }
.nx-freq:nth-child(9) { animation-delay:.08s; height:4px;  }
.nx-freq:nth-child(10){ animation-delay:.5s;  height:16px; }
.nx-freq:nth-child(11){ animation-delay:.22s; height:9px;  }
.nx-freq:nth-child(12){ animation-delay:.18s; height:5px;  }
.nx-freq--active { opacity:1; background:#ff007f; }
`;

export const NexusChat = ({
  onNavigate,
}: {
  active: ScreenKey;
  onNavigate: (s: ScreenKey) => void;
}) => {
  const { user, logout } = useAuth();

  const [msgs, setMsgs]               = useState<Msg[]>(SEED);
  const [input, setInput]             = useState("");
  const [sending, setSending]         = useState(false);
  const [sendError, setSendError]     = useState("");
  const [leftOpen, setLeftOpen]       = useState(true);
  const [clock, setClock]             = useState("00:00:00");
  const [avatarOpen, setAvatarOpen]   = useState(false);
  const [authModal, setAuthModal]     = useState<{ open: boolean; tab: "login" | "signup" }>({ open: false, tab: "login" });
  const [limitStatus, setLimitStatus] = useState<LimitStatusResponse | null>(null);
  const [history, setHistory]         = useState<ChatMessage[]>([]);
  const [refCopied, setRefCopied]     = useState(false);
  const [personality, setPersonality] = useState<Personality>("maya");
  const [language, setLanguage]       = useState<Lang>("en-IN");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mouseRef  = useRef({ x: 0, y: 0 });
  const flashRef  = useRef(0);

  const userInitial = user?.name?.[0]?.toUpperCase() ?? "?";
  const isAdmin     = user?.userType === "admin";

  /* ── Voice hook ──────────────────────────────────────────────────────────── */
  const voice = useVoiceChat({
    language,
    onResult: (data) => {
      setSendError("");
      setMsgs((m) => [
        ...m,
        { from: "user",  text: data.transcript },
        { from: "nexus", text: data.reply },
      ]);
      userAPI.getLimitStatus().then(setLimitStatus).catch(() => {});
      chatAPI.getHistory("nexus").then((d) => setHistory(d.history)).catch(() => {});
    },
    onError: (message) => setSendError(message),
  });

  const busy = sending || voice.processing;

  /* ── Clock ───────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(
        `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* ── Auto-scroll to newest message ──────────────────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, sending]);

  /* ── Fetch limit status & history when user logs in ─────────────────────── */
  useEffect(() => {
    if (!user) { setLimitStatus(null); setHistory([]); return; }
    userAPI.getLimitStatus().then(setLimitStatus).catch(() => {});
    chatAPI.getHistory("nexus").then((d) => setHistory(d.history)).catch(() => {});
  }, [user]);

  /* ── Three.js holographic reactor ───────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene    = new THREE.Scene();
    scene.fog      = new THREE.FogExp2(0x03020d, 0.015);
    const camera   = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0.8, 8.0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (w > 0 && h > 0) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    scene.add(new THREE.AmbientLight(0x0f0525));
    const pointLight = new THREE.PointLight(0x00f0ff, 1.8, 30);
    pointLight.position.set(3, 4, 5);
    scene.add(pointLight);
    const coreLight = new THREE.PointLight(0xff007f, 2.5, 12);
    scene.add(coreLight);

    const rg = new THREE.Group();
    rg.position.set(0, 0.2, 0);
    scene.add(rg);

    const coreMat = new THREE.MeshStandardMaterial({ color:0xff007f, emissive:0x00f0ff, emissiveIntensity:1.8, metalness:0.9, roughness:0.15, transparent:true, opacity:0.8 });
    const coreSphere = new THREE.Mesh(new THREE.SphereGeometry(0.5,32,32), coreMat);
    rg.add(coreSphere);

    rg.add(new THREE.Mesh(new THREE.TorusGeometry(0.7,0.015,16,100), new THREE.MeshBasicMaterial({ color:0x00f0ff, wireframe:true, transparent:true, opacity:0.85 })));

    const spokeG = new THREE.Group();
    const spokeMat = new THREE.MeshStandardMaterial({ color:0xff007f, emissive:0x00f0ff, emissiveIntensity:1.2, metalness:0.8, transparent:true, opacity:0.95 });
    for (let i = 0; i < 8; i++) {
      const a = (i/8)*Math.PI*2;
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.25,8), spokeMat);
      s.position.set(Math.cos(a)*0.6, Math.sin(a)*0.6, 0);
      s.rotation.z = a + Math.PI/2;
      spokeG.add(s);
    }
    rg.add(spokeG);

    const bracketG = new THREE.Group();
    const bracketMat = new THREE.MeshStandardMaterial({ color:0x00f0ff, emissive:0xff007f, emissiveIntensity:1.5, transparent:true, opacity:0.95 });
    for (let i = 0; i < 12; i++) {
      const a = (i/12)*Math.PI*2;
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.06,0.04,0.08), bracketMat);
      b.position.set(Math.cos(a)*0.9, Math.sin(a)*0.9, 0);
      b.rotation.z = a;
      bracketG.add(b);
    }
    rg.add(bracketG);

    const ringMat = new THREE.MeshStandardMaterial({ color:0x00f0ff, emissive:0x220033, emissiveIntensity:0.9, transparent:true, opacity:0.4 });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.25,0.035,16,100), ringMat); rg.add(ring1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.55,0.02,16,100), ringMat);  rg.add(ring2);

    const mkPanel = (x:number, y:number, z:number, w:number, h:number, col:number) => {
      const geo = new THREE.PlaneGeometry(w, h);
      const p   = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color:col, emissive:col, emissiveIntensity:0.4, transparent:true, opacity:0.12, side:THREE.DoubleSide, depthWrite:false }));
      p.position.set(x, y, z);
      scene.add(p);
      p.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color:col, transparent:true, opacity:0.35 })));
      return p;
    };
    const lp = mkPanel(-2.2, 1.2, -1.8, 2.4, 1.6, 0x00f0ff); lp.rotation.y =  0.3;
    const rp = mkPanel( 2.2,-0.6, -1.8, 2.2, 1.4, 0xff007f); rp.rotation.y = -0.25;
    const tp = mkPanel(0, 2.2, -2.5, 3.8, 0.9, 0x00ffaa);    tp.rotation.x =  0.15;

    const mkPts = (n:number, col:number, sz:number, op:number, rx:number, ry:number, rz:number) => {
      const g = new THREE.BufferGeometry();
      const p = new Float32Array(n*3);
      for (let i = 0; i < n; i++) { p[i*3]=(Math.random()-.5)*rx; p[i*3+1]=(Math.random()-.5)*ry; p[i*3+2]=(Math.random()-.5)*rz-2; }
      g.setAttribute("position", new THREE.BufferAttribute(p,3));
      return new THREE.Points(g, new THREE.PointsMaterial({ color:col, size:sz, transparent:true, opacity:op, blending:THREE.AdditiveBlending }));
    };
    const pts = mkPts(900, 0x00f0ff, 0.04, 0.55, 16, 10, 8); scene.add(pts);
    const hex = mkPts(450, 0x00ffaa, 0.024, 0.4, 14, 8, 6);  scene.add(hex);

    const onMM = (e: MouseEvent) => { mouseRef.current.x=(e.clientX/window.innerWidth)*2-1; mouseRef.current.y=-(e.clientY/window.innerHeight)*2+1; };
    window.addEventListener("mousemove", onMM);

    let id: number, t=0, tx=0, ty=0;
    const loop = () => {
      id = requestAnimationFrame(loop);
      t += 0.012;
      tx += (mouseRef.current.x - tx)*0.05;
      ty += (mouseRef.current.y - ty)*0.05;

      rg.rotation.y = t*0.2 + tx*0.45;
      rg.rotation.x = Math.sin(t*0.15)*0.1 + ty*0.35;
      bracketG.rotation.z = -t*0.65;
      spokeG.rotation.z   =  t*0.35;
      ring1.rotation.y = t*0.4;   ring1.rotation.x = Math.sin(t*0.25)*0.15;
      ring2.rotation.y = -t*0.2;  ring2.rotation.z = Math.cos(t*0.2)*0.12;

      lp.position.y = 1.2 + Math.sin(t*0.5)*0.08; lp.rotation.y = 0.3 + tx*0.15; lp.rotation.x = ty*0.1;
      rp.position.y = -0.6 + Math.cos(t*0.6)*0.06; rp.rotation.y = -0.25 + tx*0.15;
      tp.position.y = 2.2 + Math.sin(t*0.4)*0.05; tp.rotation.y = tx*0.1;

      let inten = 2.0 + Math.sin(t*8)*0.7, sc = Math.sin(t*8)*0.04;
      if (flashRef.current > 0.01) { inten += flashRef.current*7; sc += flashRef.current*0.18; flashRef.current *= 0.92; }
      const s = 1 + sc;
      coreSphere.scale.set(s,s,s);
      coreLight.intensity = inten;
      coreMat.color.setHSL(((Math.sin(t*0.2)+1)/2)*0.2+0.85, 1, 0.5);

      pts.rotation.y = t*0.03 + tx*0.15; pts.rotation.x = Math.sin(t*0.05)*0.05 + ty*0.1;
      hex.rotation.z = -t*0.015; hex.rotation.y = t*0.01 + tx*0.1;

      camera.position.x = Math.sin(t*0.3)*0.1 + tx*0.7;
      camera.position.y = 0.8 + Math.cos(t*0.2)*0.05 + ty*0.6;
      camera.lookAt(tx*0.4, ty*0.2, 0);
      renderer.render(scene, camera);
    };
    loop();

    return () => { cancelAnimationFrame(id); ro.disconnect(); window.removeEventListener("mousemove", onMM); renderer.dispose(); };
  }, []);

  /* ── Send text message ───────────────────────────────────────────────────── */
  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    if (!user) { setAuthModal({ open:true, tab:"login" }); return; }

    setInput("");
    setSendError("");
    setMsgs((m) => [...m, { from: "user", text }]);
    setSending(true);
    flashRef.current = 0.9;

    try {
      const token = localStorage.getItem("bb_token") ?? "";
      const res   = await fetch("/api/chat/nexus", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text, personality, language }),
      });
      const data = await res.json() as { reply?: string; message?: string; limitReached?: boolean };
      if (!res.ok) {
        if (data.limitReached) {
          setMsgs((m) => m.slice(0, -1));
          setInput(text);
          setSendError("Daily message limit reached. Refer a friend for +20 bonus messages!");
        } else {
          setSendError(data.message ?? "Something went wrong");
          setMsgs((m) => [...m, { from: "nexus", text: "Sorry, something went wrong. Please try again 🙏" }]);
        }
        return;
      }
      setMsgs((m) => [...m, { from: "nexus", text: data.reply ?? "" }]);
      userAPI.getLimitStatus().then(setLimitStatus).catch(() => {});
      chatAPI.getHistory("nexus").then((d) => setHistory(d.history)).catch(() => {});
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Something went wrong");
      setMsgs((m) => [...m, { from: "nexus", text: "Sorry, something went wrong. Please try again 🙏" }]);
    } finally {
      setSending(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); void send(); }
  };

  const handleLogout = () => {
    logout();
    setAvatarOpen(false);
    onNavigate("landing");
  };

  const copyRef = () => {
    const code = user?.referralCode ?? limitStatus?.referralCode;
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => { setRefCopied(true); setTimeout(() => setRefCopied(false), 2000); });
  };

  const usagePct = limitStatus && limitStatus.totalLimit > 0
    ? Math.min(100, Math.round((limitStatus.messagesUsed / limitStatus.totalLimit) * 100))
    : 0;

  const refCode     = user?.referralCode ?? limitStatus?.referralCode ?? "";
  const recentHist  = [...history].reverse().slice(0, 5);
  const connApps    = user?.connectedApps ?? [];

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="nx-root" onClick={() => avatarOpen && setAvatarOpen(false)}>

        {/* ── HEADER ── */}
        <header className="nx-header">
          <div className="nx-brand">
            <button
              className="nx-hdr-btn nx-hdr-btn--icon"
              onClick={() => setLeftOpen((v) => !v)}
              aria-label="Toggle panel"
            >☰</button>
            <div className="nx-logo nx-hf">N</div>
            <span className="nx-brand-name nx-hf">NEXUS OS</span>
          </div>

          <div className="nx-telemetry nx-mono">
            <div className="nx-status-pill">
              <span className="nx-pulse-dot" />
              <span>SYSTEM ACTIVE</span>
            </div>
            <span className="nx-clock">{clock}</span>
          </div>

          <div className="nx-hdr-actions">
            {user ? (
              <div
                className="nx-avatar"
                title={user.name}
                onClick={(e) => { e.stopPropagation(); setAvatarOpen((v) => !v); }}
              >
                {userInitial}
                {avatarOpen && (
                  <div className="nx-av-drop" onClick={(e) => e.stopPropagation()}>
                    <div className="nx-drop-row" style={{ borderBottom:"1px solid rgba(0,240,255,.1)", paddingBottom:10, marginBottom:4, cursor:"default" }}>
                      <span>👤</span>
                      <span>
                        <span style={{ fontWeight:700, display:"block" }}>{user.name}</span>
                        <span style={{ color:"rgba(232,249,255,.4)", fontSize:10 }}>{user.email}</span>
                      </span>
                    </div>
                    <div className="nx-drop-row nx-drop-row--red" onClick={handleLogout}>⏻ Logout</div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="nx-hdr-btn" onClick={() => setAuthModal({ open:true, tab:"login" })}>Login</button>
                <button className="nx-hdr-btn nx-hdr-btn--pink" onClick={() => setAuthModal({ open:true, tab:"signup" })}>Sign Up</button>
              </>
            )}
          </div>
        </header>

        {/* ── COCKPIT ── */}
        <div className="nx-cockpit">
          <canvas ref={canvasRef} className="nx-canvas" />
          <div className="nx-aurora" aria-hidden="true">
            <div className="nx-orb nx-orb-1" />
            <div className="nx-orb nx-orb-2" />
            <div className="nx-orb nx-orb-3" />
          </div>
          <div className="nx-sweep" aria-hidden="true" />

          {/* ── LEFT PANEL ── */}
          <aside className={`nx-left${leftOpen ? "" : " nx-left--closed"}`}>

            {/* Chat History */}
            <div className="nx-section">
              <div className="nx-stitle">💬 History</div>
              {!user
                ? <p className="nx-empty">Log in to see history</p>
                : recentHist.length === 0
                  ? <p className="nx-empty">No history yet.{"\n"}Start chatting!</p>
                  : recentHist.map((m, i) => (
                      <div key={i} className="nx-hist-row nx-mono">
                        <span className="nx-hist-pfx">{m.role === "user" ? "▷" : "◁"}</span>
                        {m.content.slice(0, 36)}{m.content.length > 36 ? "…" : ""}
                      </div>
                    ))
              }
            </div>

            {/* Usage */}
            <div className="nx-section">
              <div className="nx-stitle">📊 Usage Today</div>
              {!user
                ? <p className="nx-empty">Log in to see usage</p>
                : !limitStatus
                  ? <p className="nx-empty">Loading…</p>
                  : <>
                      <div className="nx-stat-pair">
                        <span>Messages Used</span>
                        <span className="nx-stat-pink">{limitStatus.messagesUsed} / {limitStatus.totalLimit}</span>
                      </div>
                      <div className="nx-prog-bar">
                        <div className="nx-prog-fill" style={{ width:`${usagePct}%` }} />
                      </div>
                      <div className="nx-stat-pair">
                        <span>Left Today</span>
                        <span className="nx-stat-green">{limitStatus.messagesLeft}</span>
                      </div>
                    </>
              }
            </div>

            {/* Referral */}
            <div className="nx-section">
              <div className="nx-stitle">🔗 Referral Code</div>
              {!user
                ? <p className="nx-empty">Log in to get your code</p>
                : !refCode
                  ? <p className="nx-empty">Loading…</p>
                  : <>
                      <div className="nx-ref-box">
                        <span className="nx-ref-code nx-mono">{refCode}</span>
                        <button className={`nx-ref-copy${refCopied ? " nx-ref-copy--done" : ""}`} onClick={copyRef}>
                          {refCopied ? "✓" : "Copy"}
                        </button>
                      </div>
                      <p className="nx-empty" style={{ marginTop:0, paddingTop:0 }}>
                        Refer friends — earn +20 msgs each
                      </p>
                    </>
              }
            </div>

            {/* Connected Apps */}
            <div className="nx-section">
              <div className="nx-stitle">🔌 Connected Apps</div>
              {ALL_APPS.map(({ name, icon }) => (
                <div key={name} className="nx-app-row">
                  <span className={`nx-app-dot nx-app-dot--${connApps.includes(name) ? "on" : "off"}`} />
                  <span>{icon} {name}</span>
                </div>
              ))}
            </div>

          </aside>

          {/* ── CHAT CENTER ── */}
          <main className="nx-chat">
            {/* Messages — chronological top→bottom */}
            <div className="nx-msgs">
              {msgs.map((m, i) =>
                m.from === "user" ? (
                  <div key={i} className="nx-bbl-row nx-bbl-row--right">
                    <div className="nx-bbl nx-bbl--user">
                      <div className="nx-bbl-name nx-bbl-name--user nx-hf">{user?.name ?? "You"} ▷</div>
                      {m.text}
                    </div>
                    <div className="nx-bbl-av nx-bbl-av--user">{userInitial}</div>
                  </div>
                ) : (
                  <div key={i} className="nx-bbl-row">
                    <div className="nx-bbl-av">N</div>
                    <div className="nx-bbl">
                      <div className="nx-bbl-name nx-hf">NEXUS ▷</div>
                      {m.text}
                      <div className="nx-vibe">
                        <span className="nx-vibe-dot" />
                        NEXUS CORE // ONLINE
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Typing indicator — always at bottom while waiting */}
              {busy && (
                <div className="nx-bbl-row">
                  <div className="nx-bbl-av">N</div>
                  <div className="nx-bbl">
                    <div className="nx-typing">
                      <div className="nx-dot" /><div className="nx-dot" /><div className="nx-dot" />
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll anchor — always at the very bottom */}
              <div ref={bottomRef} />
            </div>

            {sendError && (
              <div className="nx-err-bar">
                <span>⚠</span>
                <span>{sendError}</span>
                <button className="nx-err-dismiss" onClick={() => setSendError("")}>Dismiss</button>
              </div>
            )}

            <div className="nx-dock">
              <div className="nx-capsule">
                <button
                  className={`nx-ibtn nx-ibtn--mic${voice.recording ? " nx-rec" : ""}`}
                  onClick={() => {
                    if (!user) { setAuthModal({ open:true, tab:"login" }); return; }
                    voice.toggleRecording();
                  }}
                  disabled={voice.processing || sending}
                  aria-label={voice.recording ? "Stop recording" : "Voice input"}
                >
                  {voice.processing ? "⏳" : voice.recording ? "⏹" : "🎤"}
                </button>

                <input
                  className="nx-input nx-mono"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder={user ? "ENTER COMMAND OR QUESTION..." : "LOG IN TO ACTIVATE NEXUS..."}
                  disabled={busy}
                />

                <button
                  className="nx-ibtn nx-ibtn--send"
                  onClick={() => void send()}
                  disabled={busy || !input.trim()}
                  aria-label="Send"
                >▲</button>
              </div>

              <div className="nx-freqs" aria-hidden="true">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className={`nx-freq${voice.recording || voice.processing ? " nx-freq--active" : ""}`} />
                ))}
              </div>
            </div>
          </main>

          {/* ── RIGHT PANEL ── */}
          <aside className="nx-right">

            {/* User Profile */}
            {user ? (
              <div className="nx-prof-card">
                <div className="nx-prof-av">{userInitial}</div>
                <div className="nx-prof-name">{user.name}</div>
                <div className="nx-prof-mail nx-mono">{user.email}</div>
                <span className={`nx-plan-tag${isAdmin ? " nx-plan-tag--admin" : ""}`}>
                  {isAdmin ? "ADMIN" : (user.plan ?? "BETA").toUpperCase()}
                </span>
              </div>
            ) : (
              <div className="nx-login-card">
                <div style={{ fontSize:22, marginBottom:6 }}>⚡</div>
                Log in to unlock all NEXUS features
                <button onClick={() => setAuthModal({ open:true, tab:"login" })}>Login</button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="nx-section">
              <div className="nx-stitle">⚡ Quick Actions</div>
              <button className="nx-qa-btn nx-qa-btn--new" onClick={() => setMsgs(SEED)}>
                ＋ New Chat
              </button>
              <button
                className={`nx-qa-btn${voice.recording || voice.processing ? " nx-qa-btn--active" : ""}`}
                onClick={() => {
                  if (!user) { setAuthModal({ open:true, tab:"login" }); return; }
                  voice.toggleRecording();
                }}
                disabled={sending}
              >
                🎤 {voice.recording ? "Stop Recording" : voice.processing ? "Processing…" : "Voice Mode"}
              </button>
            </div>

            {/* Language */}
            <div className="nx-section">
              <div className="nx-stitle">🌐 Language</div>
              <div className="nx-tgl-group">
                {(["en-IN", "hi-IN", "hinglish"] as Lang[]).map((l) => (
                  <button
                    key={l}
                    className={`nx-tgl-opt${language === l ? " nx-tgl-opt--on" : ""}`}
                    onClick={() => setLanguage(l)}
                  >
                    {l === "en-IN" ? "EN" : l === "hi-IN" ? "HI" : "MIX"}
                  </button>
                ))}
              </div>
            </div>

            {/* Personality */}
            <div className="nx-section">
              <div className="nx-stitle">🤖 Personality</div>
              <div className="nx-tgl-group">
                {(["maya", "kabir"] as Personality[]).map((p) => (
                  <button
                    key={p}
                    className={`nx-tgl-opt${personality === p ? " nx-tgl-opt--pink-on" : ""}`}
                    onClick={() => setPersonality(p)}
                  >
                    {p === "maya" ? "MAYA" : "KABIR"}
                  </button>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </div>

      <AuthModal
        open={authModal.open}
        defaultTab={authModal.tab}
        onClose={() => setAuthModal((s) => ({ ...s, open: false }))}
        onSuccess={() => setAuthModal((s) => ({ ...s, open: false }))}
      />
    </>
  );
};
