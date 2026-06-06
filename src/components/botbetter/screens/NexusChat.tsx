import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { chatAPI, userAPI, ApiError } from "@/services/api";
import type { LimitStatusResponse, ChatMessage } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useVoiceChat } from "@/hooks/use-voice-chat";
import { AuthModal } from "./AuthModal";
import type { ScreenKey } from "../TopNav";

type Msg = { from: "user"; text: string } | { from: "nexus"; text: string };
type SideTab = "history" | "connectors" | "usage" | "referral";

const SEED: Msg[] = [
  {
    from: "nexus",
    text: "Hey! I'm NEXUS ⚡ — your master AI agent. Tell me anything — I'll route it to the right specialist and get it done.\n\nExamples:\n• \"Lose 10kg\" → FlexAI\n• \"Interview prep\" → Prepify\n• \"NEET physics\" → Cracky\n• \"Calculate SIP\" → Finio",
  },
];

const JARVIS_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&family=Share+Tech+Mono&display=swap');

  .nx-root {
    position: fixed;
    inset: 0;
    font-family: 'Space Grotesk', sans-serif;
    background: #03020d;
    color: #e8f9ff;
    overflow: hidden;
    z-index: 40;
    display: flex;
    flex-direction: column;
  }
  .nx-hf { font-family: 'Syne', sans-serif; font-weight: 800; }
  .nx-mono { font-family: 'Share Tech Mono', monospace; }

  @keyframes nx-blink {
    0%,100% { opacity:1; transform:scale(1); }
    50% { opacity:.4; transform:scale(.9); }
  }
  @keyframes nx-scan {
    0% { top:0%; }
    100% { top:100%; }
  }
  @keyframes nx-voice-bar {
    0%,100% { height:4px; background:#00f0ff; }
    50% { height:20px; background:#ff007f; }
  }
  @keyframes nx-orb-float {
    0% { transform:translate(0,0) scale(1); }
    50% { transform:translate(60px,-60px) scale(1.15); }
    100% { transform:translate(-40px,40px) scale(.9); }
  }
  @keyframes nx-prog-shift {
    0%,100% { filter:hue-rotate(0deg); }
    50% { filter:hue-rotate(30deg); }
  }
  @keyframes nx-fade-up {
    from { opacity:0; transform:translateY(10px); }
    to { opacity:1; transform:translateY(0); }
  }
  @keyframes nx-glow-pulse {
    0%,100% { box-shadow:0 0 10px rgba(0,240,255,.3),0 0 20px rgba(255,0,127,.1); }
    50% { box-shadow:0 0 25px rgba(0,240,255,.6),0 0 40px rgba(255,0,127,.3); }
  }
  @keyframes nx-bounce-dot {
    0%,100% { transform:scale(.6); opacity:.3; }
    50% { transform:scale(1); opacity:1; }
  }
  @keyframes nx-spin-cw { to { transform:rotate(360deg); } }
  @keyframes nx-spin-ccw { to { transform:rotate(-360deg); } }
  @keyframes nx-slide-in-left {
    from { transform:translateX(-100%); }
    to { transform:translateX(0); }
  }
  @keyframes nx-recording-pulse {
    0%,100% { box-shadow:0 0 0 0 rgba(255,0,127,.4); }
    50% { box-shadow:0 0 0 8px rgba(255,0,127,0); }
  }

  /* ===== HEADER ===== */
  .nx-header {
    height:64px; min-height:64px;
    display:flex; align-items:center; justify-content:space-between;
    padding:0 24px;
    border-bottom:1px dashed rgba(0,240,255,.3);
    background:rgba(3,2,13,.9);
    backdrop-filter:blur(12px);
    z-index:20; position:relative;
    flex-shrink:0;
  }
  .nx-brand { display:flex; align-items:center; gap:10px; }
  .nx-logo {
    width:32px; height:32px; border-radius:8px;
    background:linear-gradient(45deg,#00f0ff,#ff007f);
    display:flex; align-items:center; justify-content:center;
    font-weight:900; font-size:16px; color:#fff;
    box-shadow:0 0 15px rgba(0,240,255,.4); flex-shrink:0;
  }
  .nx-brand-name { font-size:18px; letter-spacing:2px; color:#fff; }
  .nx-version-badge {
    font-size:9px; font-weight:700; padding:2px 8px; border-radius:20px;
    background:rgba(57,255,20,.12); border:1px solid #39ff14;
    color:#39ff14; text-transform:uppercase; letter-spacing:1px;
  }
  .nx-telemetry { display:flex; align-items:center; gap:18px; font-size:12px; }
  .nx-status-pill {
    display:flex; align-items:center; gap:7px;
    background:rgba(0,240,255,.07); border:1px solid rgba(0,240,255,.22);
    padding:4px 12px; border-radius:30px;
  }
  .nx-pulse-dot {
    width:6px; height:6px; border-radius:50%;
    background:#39ff14; box-shadow:0 0 8px #39ff14;
    animation:nx-blink 1.5s infinite;
  }
  .nx-clock { font-variant-numeric:tabular-nums; font-weight:bold; color:#00f0ff; }
  .nx-hdr-actions { display:flex; align-items:center; gap:8px; }
  .nx-hdr-btn {
    height:34px; padding:0 14px; border-radius:9px;
    border:1px solid rgba(0,240,255,.2); background:rgba(0,240,255,.04);
    color:#00f0ff; cursor:pointer; display:flex; align-items:center; gap:6px;
    font-size:11px; font-weight:700; letter-spacing:1px; transition:all .25s;
    white-space:nowrap; font-family:'Space Grotesk',sans-serif;
  }
  .nx-hdr-btn:hover {
    background:linear-gradient(135deg,#00f0ff,#ff007f);
    color:#fff; box-shadow:0 0 14px rgba(255,0,127,.4); transform:scale(1.04);
  }
  .nx-hdr-btn--pink {
    background:rgba(255,0,127,.08); border-color:rgba(255,0,127,.35); color:#ff007f;
  }
  .nx-hdr-btn--panel {
    width:36px; padding:0; justify-content:center; font-size:18px; border-radius:9px;
  }
  .nx-hdr-avatar {
    width:34px; height:34px; border-radius:50%;
    background:linear-gradient(135deg,#00f0ff,#ff007f);
    display:flex; align-items:center; justify-content:center;
    font-weight:900; font-size:13px; color:#fff;
    box-shadow:0 0 10px rgba(0,240,255,.35); cursor:pointer; flex-shrink:0;
    transition:transform .2s;
  }
  .nx-hdr-avatar:hover { transform:scale(1.08); }

  /* ===== COCKPIT ===== */
  .nx-cockpit {
    display:flex; flex:1; overflow:hidden;
    position:relative; z-index:5;
  }
  .nx-canvas {
    position:absolute; inset:0; width:100%; height:100%;
    z-index:0; pointer-events:none;
  }
  .nx-aurora {
    position:absolute; inset:0; filter:blur(100px); opacity:.55;
    z-index:1; mix-blend-mode:screen; pointer-events:none; overflow:hidden;
  }
  .nx-orb {
    position:absolute; border-radius:50%;
    filter:blur(50px); mix-blend-mode:screen;
    animation:nx-orb-float 14s ease-in-out infinite alternate;
  }
  .nx-orb-1 {
    width:450px; height:450px;
    background:radial-gradient(circle,#00f0ff 0%,transparent 70%);
    top:10%; left:15%; animation-duration:18s;
  }
  .nx-orb-2 {
    width:500px; height:500px;
    background:radial-gradient(circle,#ff007f 0%,transparent 70%);
    bottom:10%; right:15%; animation-duration:22s;
  }
  .nx-orb-3 {
    width:350px; height:350px;
    background:radial-gradient(circle,#7f00ff 0%,transparent 70%);
    top:35%; left:45%; animation-duration:16s;
  }
  .nx-sweep {
    position:absolute; left:0; width:100%; height:3px; top:0%;
    background:linear-gradient(90deg,transparent,#00f0ff,#ff007f,transparent);
    animation:nx-scan 7s linear infinite;
    z-index:2; pointer-events:none;
  }

  /* ===== SIDE PANEL ===== */
  .nx-side {
    width:0; overflow:hidden;
    background:rgba(8,3,24,.88);
    border-right:1px dashed rgba(0,240,255,.18);
    backdrop-filter:blur(22px);
    display:flex; flex-direction:column;
    z-index:15; transition:width .38s cubic-bezier(.16,1,.3,1);
    flex-shrink:0; position:relative;
  }
  .nx-side--open { width:272px; }
  .nx-side-inner {
    width:272px; height:100%; display:flex; flex-direction:column;
    padding:18px 16px; overflow:hidden;
  }
  .nx-tabs {
    display:flex; gap:3px; margin-bottom:14px;
    background:rgba(0,240,255,.03); border:1px solid rgba(0,240,255,.1);
    border-radius:10px; padding:4px; flex-shrink:0;
  }
  .nx-tab {
    flex:1; padding:7px 2px; border-radius:7px; border:none;
    font-size:16px; color:rgba(232,249,255,.3); background:transparent;
    cursor:pointer; transition:all .18s;
  }
  .nx-tab--active {
    background:rgba(0,240,255,.12); color:#00f0ff;
    box-shadow:0 0 8px rgba(0,240,255,.12);
  }
  .nx-tab:hover:not(.nx-tab--active) { color:rgba(232,249,255,.6); }
  .nx-tab-content { flex:1; overflow-y:auto; }
  .nx-tab-content::-webkit-scrollbar { width:3px; }
  .nx-tab-content::-webkit-scrollbar-thumb { background:rgba(0,240,255,.12); border-radius:2px; }

  .nx-stitle {
    font-size:10px; font-weight:700; letter-spacing:3px;
    color:rgba(232,249,255,.38); margin-bottom:10px;
    text-transform:uppercase;
  }
  .nx-new-chat-btn {
    width:100%; padding:9px; margin-bottom:12px;
    border-radius:10px; border:1px dashed rgba(0,240,255,.3);
    background:rgba(0,240,255,.04); color:#00f0ff;
    font-size:12px; font-weight:700; letter-spacing:1px;
    cursor:pointer; transition:all .2s; font-family:'Space Grotesk',sans-serif;
    display:flex; align-items:center; justify-content:center; gap:6px;
  }
  .nx-new-chat-btn:hover { background:rgba(0,240,255,.09); }
  .nx-hist-item {
    padding:9px 12px; border-radius:9px; border:1px solid transparent;
    font-size:12px; font-weight:600; color:rgba(232,249,255,.55);
    cursor:pointer; transition:all .18s; margin-bottom:5px;
    background:rgba(0,240,255,.015);
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  .nx-hist-item:hover {
    background:rgba(0,240,255,.06); color:#e8f9ff;
    border-color:rgba(0,240,255,.18);
  }
  .nx-empty-note {
    font-size:11px; color:rgba(232,249,255,.28); line-height:1.6;
    text-align:center; padding:20px 8px;
  }

  .nx-connector-row {
    display:flex; align-items:center; gap:10px;
    padding:10px 12px; border-radius:9px; margin-bottom:6px;
    background:rgba(0,240,255,.02); border:1px solid rgba(0,240,255,.1);
    font-size:12px; font-weight:600; color:rgba(232,249,255,.65);
  }
  .nx-conn-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
  .nx-conn-dot--on { background:#39ff14; box-shadow:0 0 6px #39ff14; animation:nx-blink 2s infinite; }
  .nx-conn-dot--off { background:rgba(255,255,255,.18); }

  .nx-stat-card {
    background:rgba(0,240,255,.025); border:1px solid rgba(0,240,255,.14);
    border-radius:11px; padding:11px 12px; margin-bottom:10px;
  }
  .nx-stat-row {
    display:flex; justify-content:space-between; align-items:center;
    font-size:12px; margin-bottom:7px;
  }
  .nx-stat-row:last-child { margin-bottom:0; }
  .nx-stat-val-pink { color:#ff007f; font-weight:700; font-size:11px;
    padding:1px 7px; border-radius:4px; background:rgba(255,0,127,.12);
    border:1px solid rgba(255,0,127,.3);
  }
  .nx-stat-val-green { color:#39ff14; font-weight:700; }
  .nx-stat-val-cyan { color:#00f0ff; font-weight:700; }
  .nx-prog-track {
    width:100%; height:5px; background:rgba(255,255,255,.05);
    border-radius:3px; overflow:hidden; margin-top:6px;
  }
  .nx-prog-fill {
    height:100%; background:linear-gradient(90deg,#00f0ff,#ff007f);
    border-radius:3px; animation:nx-prog-shift 4s linear infinite;
    transition:width .5s ease;
  }

  .nx-ref-code-box {
    display:flex; align-items:center; gap:8px;
    background:rgba(0,240,255,.04); border:1px dashed rgba(0,240,255,.28);
    border-radius:10px; padding:10px 13px; margin-bottom:10px;
  }
  .nx-ref-code {
    font-size:14px; font-weight:700; letter-spacing:3px; color:#00f0ff; flex:1;
  }
  .nx-copy-btn {
    font-size:10px; font-weight:700; padding:3px 9px;
    border-radius:6px; border:1px solid rgba(0,240,255,.28);
    background:rgba(0,240,255,.07); color:#00f0ff; cursor:pointer;
    transition:all .18s; font-family:'Space Grotesk',sans-serif; flex-shrink:0;
  }
  .nx-copy-btn:hover { background:rgba(0,240,255,.14); }
  .nx-copy-btn--done { color:#39ff14; border-color:rgba(57,255,20,.35); background:rgba(57,255,20,.08); }
  .nx-ref-hint {
    font-size:10px; color:rgba(232,249,255,.35); line-height:1.55;
    padding:0 2px; margin-top:2px;
  }

  /* Profile sticker */
  .nx-profile {
    margin-top:auto; border:1px solid rgba(0,240,255,.22);
    background:rgba(0,240,255,.04); border-radius:12px;
    padding:11px 13px; display:flex; align-items:center; gap:10px;
    cursor:pointer; position:relative; flex-shrink:0;
    transition:background .18s;
  }
  .nx-profile:hover { background:rgba(0,240,255,.07); }
  .nx-prof-avatar {
    width:32px; height:32px; border-radius:50%;
    background:linear-gradient(135deg,#00f0ff,#ff007f);
    box-shadow:0 0 8px rgba(0,240,255,.35);
    display:flex; align-items:center; justify-content:center;
    font-weight:bold; font-size:12px; color:#fff; flex-shrink:0;
  }
  .nx-prof-name { font-weight:700; font-size:13px; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .nx-plan-tag {
    font-size:8px; padding:2px 6px; border-radius:20px;
    border:1.5px solid #00f0ff; color:#00f0ff; font-weight:bold;
    text-transform:uppercase; letter-spacing:1px; flex-shrink:0;
  }
  .nx-dropdown {
    position:absolute; bottom:calc(100% + 6px); left:0; right:0;
    background:rgba(5,3,18,.98); border:1px solid rgba(0,240,255,.4);
    border-radius:11px; padding:5px 0; z-index:50;
    box-shadow:0 -8px 28px rgba(0,0,0,.7);
    animation:nx-fade-up .18s ease;
  }
  .nx-drop-item {
    display:flex; align-items:center; gap:9px;
    padding:9px 15px; font-size:12px; font-weight:600;
    color:rgba(232,249,255,.65); cursor:pointer; transition:all .15s;
    font-family:'Space Grotesk',sans-serif;
  }
  .nx-drop-item:hover { background:rgba(0,240,255,.07); color:#00f0ff; }
  .nx-drop-item--red { color:#ff007f; }
  .nx-drop-item--red:hover { background:rgba(255,0,127,.07); color:#ff3385; }

  /* ===== CHAT CENTER ===== */
  .nx-chat {
    flex:1; display:flex; flex-direction:column;
    position:relative; overflow:hidden; min-width:0;
  }
  .nx-msgs {
    flex:1; display:flex; flex-direction:column;
    gap:16px; padding:24px 28px; overflow-y:auto; z-index:5;
  }
  .nx-msgs::-webkit-scrollbar { width:4px; }
  .nx-msgs::-webkit-scrollbar-thumb { background:rgba(0,240,255,.14); border-radius:2px; }

  .nx-bubble-row {
    display:flex; gap:11px; max-width:640px;
    animation:nx-fade-up .28s ease both;
  }
  .nx-bubble-row--right { align-self:flex-end; justify-content:flex-end; }
  .nx-bbl-avatar {
    width:32px; height:32px; border-radius:10px; flex-shrink:0;
    background:linear-gradient(135deg,#00f0ff,#ff007f);
    box-shadow:0 0 12px rgba(0,240,255,.45);
    display:flex; align-items:center; justify-content:center;
    font-weight:900; font-size:13px; color:#fff; margin-top:2px;
  }
  .nx-bbl-avatar--user {
    background:#ff007f; box-shadow:0 0 12px rgba(255,0,127,.45);
  }
  .nx-bbl {
    background:rgba(8,3,28,.55); border:1px solid rgba(0,240,255,.22);
    border-radius:0 14px 14px 14px; padding:14px 18px;
    font-size:13.5px; line-height:1.65; color:#e8f9ff;
    backdrop-filter:blur(14px); box-shadow:0 8px 32px rgba(0,0,0,.28);
    white-space:pre-line;
  }
  .nx-bbl--user {
    background:rgba(255,0,127,.055); border-color:rgba(255,0,127,.32);
    border-radius:14px 0 14px 14px;
  }
  .nx-bbl-name {
    font-size:10px; font-weight:700; letter-spacing:2px;
    color:#00f0ff; margin-bottom:7px; text-transform:uppercase;
  }
  .nx-bbl-name--user { color:#ff007f; }
  .nx-vibe {
    display:inline-flex; align-items:center; gap:6px;
    font-size:9px; letter-spacing:2px; color:rgba(232,249,255,.38);
    margin-top:9px; font-weight:bold; font-family:'Share Tech Mono',monospace;
  }
  .nx-vibe-dot { width:5px; height:5px; border-radius:50%; background:#39ff14; animation:nx-blink 1.5s infinite; flex-shrink:0; }

  /* Typing indicator */
  .nx-typing { display:flex; gap:5px; align-items:center; padding:6px 2px; }
  .nx-dot {
    width:7px; height:7px; border-radius:50%;
    background:rgba(0,240,255,.45);
    animation:nx-bounce-dot 1.2s ease-in-out infinite;
  }
  .nx-dot:nth-child(2) { animation-delay:.2s; }
  .nx-dot:nth-child(3) { animation-delay:.4s; }

  /* Error */
  .nx-err-bar {
    margin:0 20px 8px; padding:10px 14px; border-radius:10px;
    background:rgba(255,0,127,.07); border:1px solid rgba(255,0,127,.3);
    color:#ff007f; font-size:12px; font-weight:600;
    display:flex; align-items:center; gap:8px; z-index:10; flex-shrink:0;
  }
  .nx-err-dismiss {
    margin-left:auto; font-size:10px; text-decoration:underline;
    cursor:pointer; background:none; border:none; color:#ff007f;
    padding:0; font-weight:bold; font-family:'Space Grotesk',sans-serif;
  }

  /* ===== INPUT DOCK ===== */
  .nx-input-dock {
    border-top:1px dashed rgba(0,240,255,.2);
    background:rgba(3,2,13,.88); padding:14px 24px 16px;
    z-index:10; backdrop-filter:blur(12px); flex-shrink:0;
  }
  .nx-input-capsule {
    display:flex; align-items:center; gap:9px;
    max-width:860px; margin:0 auto;
  }
  .nx-input {
    flex:1; background:rgba(0,240,255,.02);
    border:1px solid rgba(0,240,255,.28); border-radius:30px;
    padding:11px 20px; font-family:'Space Grotesk',sans-serif;
    font-size:14px; color:#e8f9ff; outline:none;
    box-shadow:inset 0 0 10px rgba(0,240,255,.04); transition:all .25s;
  }
  .nx-input:focus { border-color:#ff007f; box-shadow:0 0 15px rgba(255,0,127,.22); }
  .nx-input::placeholder { color:rgba(0,240,255,.32); font-size:12px; letter-spacing:.5px; }
  .nx-input:disabled { opacity:.45; }

  .nx-abtn {
    width:42px; height:42px; min-width:42px; border-radius:50%;
    border:1px solid rgba(0,240,255,.28); background:rgba(0,240,255,.025);
    color:#00f0ff; display:flex; align-items:center; justify-content:center;
    cursor:pointer; font-size:16px;
    transition:all .28s cubic-bezier(.175,.885,.32,1.275);
  }
  .nx-abtn:hover { box-shadow:0 0 15px #00f0ff; transform:scale(1.08); background:rgba(0,240,255,.09); }
  .nx-abtn:disabled { opacity:.45; cursor:not-allowed; transform:none !important; box-shadow:none !important; }
  .nx-abtn--mic {
    background:rgba(255,0,127,.08); border-color:rgba(255,0,127,.38);
    color:#ff007f; box-shadow:0 0 10px rgba(255,0,127,.28);
  }
  .nx-abtn--mic:hover { box-shadow:0 0 20px #ff007f; background:rgba(255,0,127,.16); }
  .nx-abtn--mic.nx-recording {
    background:rgba(255,0,127,.22);
    animation:nx-recording-pulse 1s ease-in-out infinite;
  }
  .nx-abtn--send {
    background:linear-gradient(135deg,#00f0ff,#ff007f);
    border:none; color:#fff; font-weight:bold; font-size:18px;
  }
  .nx-abtn--send:hover { box-shadow:0 0 20px rgba(255,0,127,.55); }
  .nx-abtn--send:disabled { opacity:.45; }

  /* Frequency bars */
  .nx-freqs {
    display:flex; align-items:flex-end; justify-content:center;
    gap:3px; height:16px; margin-top:9px;
    max-width:860px; margin-left:auto; margin-right:auto;
  }
  .nx-freq {
    width:2.5px; background:#00f0ff; border-radius:1px;
    animation:nx-voice-bar 1s ease-in-out infinite;
    opacity:.45;
  }
  .nx-freq:nth-child(1)  { animation-delay:0s;    height:6px; }
  .nx-freq:nth-child(2)  { animation-delay:.12s;  height:14px; }
  .nx-freq:nth-child(3)  { animation-delay:.05s;  height:8px; }
  .nx-freq:nth-child(4)  { animation-delay:.25s;  height:18px; }
  .nx-freq:nth-child(5)  { animation-delay:.3s;   height:10px; }
  .nx-freq:nth-child(6)  { animation-delay:.42s;  height:20px; }
  .nx-freq:nth-child(7)  { animation-delay:.15s;  height:6px; }
  .nx-freq:nth-child(8)  { animation-delay:.35s;  height:13px; }
  .nx-freq:nth-child(9)  { animation-delay:.08s;  height:4px; }
  .nx-freq:nth-child(10) { animation-delay:.5s;   height:16px; }
  .nx-freq:nth-child(11) { animation-delay:.22s;  height:9px; }
  .nx-freq:nth-child(12) { animation-delay:.18s;  height:5px; }
  .nx-freq--active { opacity:1; background:#ff007f; }
`;

export const NexusChat = ({
  onNavigate,
}: {
  active: ScreenKey;
  onNavigate: (s: ScreenKey) => void;
}) => {
  const { user, logout } = useAuth();

  const [msgs, setMsgs] = useState<Msg[]>(SEED);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sideOpen, setSideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SideTab>("history");
  const [profileOpen, setProfileOpen] = useState(false);
  const [clock, setClock] = useState("00:00:00");
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: "login" | "signup" }>({
    open: false,
    tab: "login",
  });
  const [limitStatus, setLimitStatus] = useState<LimitStatusResponse | null>(null);
  const [historyItems, setHistoryItems] = useState<ChatMessage[]>([]);
  const [referralCopied, setReferralCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const flashRef = useRef(0);

  const userInitial = user?.name?.[0]?.toUpperCase() ?? "G";

  const voice = useVoiceChat({
    language: user?.language ?? "en-IN",
    onResult: (data) => {
      setSendError("");
      setMsgs((m) => [
        ...m,
        { from: "user", text: data.transcript },
        { from: "nexus", text: data.reply },
      ]);
    },
    onError: (message) => setSendError(message),
  });

  const busy = sending || voice.processing;

  // ── Clock ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Auto scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, sending]);

  // ── Limit status ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    userAPI.getLimitStatus().then(setLimitStatus).catch(() => {});
  }, [user]);

  // ── Chat history (when history tab is active) ─────────────────────────────
  useEffect(() => {
    if (!user || activeTab !== "history") return;
    chatAPI
      .getHistory("nexus")
      .then((d) => setHistoryItems(d.history))
      .catch(() => {});
  }, [user, activeTab]);

  // ── Three.js holographic reactor ──────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x03020d, 0.015);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0.8, 8.0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w > 0 && h > 0) {
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x0f0525);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00f0ff, 1.8, 30);
    pointLight.position.set(3, 4, 5);
    scene.add(pointLight);
    const coreLight = new THREE.PointLight(0xff007f, 2.5, 12);
    scene.add(coreLight);

    // Reactor group
    const reactorGroup = new THREE.Group();
    reactorGroup.position.set(0, 0.2, 0);
    scene.add(reactorGroup);

    // Core sphere
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.8,
      metalness: 0.9,
      roughness: 0.15,
      transparent: true,
      opacity: 0.8,
    });
    const coreSphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), coreMat);
    reactorGroup.add(coreSphere);

    // Inner wire torus
    const innerWire = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.015, 16, 100),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.85 })
    );
    reactorGroup.add(innerWire);

    // Spokes
    const spokeGroup = new THREE.Group();
    const spokeMat = new THREE.MeshStandardMaterial({
      color: 0xff007f, emissive: 0x00f0ff, emissiveIntensity: 1.2, metalness: 0.8, transparent: true, opacity: 0.95,
    });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8), spokeMat);
      spoke.position.set(Math.cos(angle) * 0.6, Math.sin(angle) * 0.6, 0);
      spoke.rotation.z = angle + Math.PI / 2;
      spokeGroup.add(spoke);
    }
    reactorGroup.add(spokeGroup);

    // Bracket nodes
    const bracketGroup = new THREE.Group();
    const bracketMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff, emissive: 0xff007f, emissiveIntensity: 1.5, transparent: true, opacity: 0.95,
    });
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.08), bracketMat);
      bracket.position.set(Math.cos(angle) * 0.9, Math.sin(angle) * 0.9, 0);
      bracket.rotation.z = angle;
      bracketGroup.add(bracket);
    }
    reactorGroup.add(bracketGroup);

    // Outer rings
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff, emissive: 0x220033, emissiveIntensity: 0.9, transparent: true, opacity: 0.4,
    });
    const outerRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.035, 16, 100), ringMat);
    reactorGroup.add(outerRing1);
    const outerRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.02, 16, 100), ringMat);
    reactorGroup.add(outerRing2);

    // Holographic HUD panels
    const makePanel = (x: number, y: number, z: number, w: number, h: number, color: number) => {
      const geo = new THREE.PlaneGeometry(w, h);
      const mat = new THREE.MeshStandardMaterial({
        color, emissive: color, emissiveIntensity: 0.4,
        transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false,
      });
      const panel = new THREE.Mesh(geo, mat);
      panel.position.set(x, y, z);
      scene.add(panel);
      const borderMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 });
      const border = new THREE.LineSegments(new THREE.EdgesGeometry(geo), borderMat);
      panel.add(border);
      return panel;
    };
    const leftPanel = makePanel(-2.2, 1.2, -1.8, 2.4, 1.6, 0x00f0ff);
    leftPanel.rotation.y = 0.3;
    const rightPanel = makePanel(2.2, -0.6, -1.8, 2.2, 1.4, 0xff007f);
    rightPanel.rotation.y = -0.25;
    const topPanel = makePanel(0, 2.2, -2.5, 3.8, 0.9, 0x00ffaa);
    topPanel.rotation.x = 0.15;

    // Floating particles
    const makeParticles = (
      count: number, color: number, size: number, opacity: number, rx: number, ry: number, rz: number
    ) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * rx;
        pos[i * 3 + 1] = (Math.random() - 0.5) * ry;
        pos[i * 3 + 2] = (Math.random() - 0.5) * rz - 2;
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      return new THREE.Points(
        geo,
        new THREE.PointsMaterial({ color, size, transparent: true, opacity, blending: THREE.AdditiveBlending })
      );
    };
    const particleSystem = makeParticles(900, 0x00f0ff, 0.04, 0.55, 16, 10, 8);
    scene.add(particleSystem);
    const hexField = makeParticles(450, 0x00ffaa, 0.024, 0.4, 14, 8, 6);
    scene.add(hexField);

    // Mouse parallax
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Animation loop
    let animId: number;
    let time = 0;
    let targetX = 0;
    let targetY = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      time += 0.012;

      targetX += (mouseRef.current.x - targetX) * 0.05;
      targetY += (mouseRef.current.y - targetY) * 0.05;

      reactorGroup.rotation.y = time * 0.2 + targetX * 0.45;
      reactorGroup.rotation.x = Math.sin(time * 0.15) * 0.1 + targetY * 0.35;
      bracketGroup.rotation.z = -time * 0.65;
      spokeGroup.rotation.z = time * 0.35;
      outerRing1.rotation.y = time * 0.4;
      outerRing1.rotation.x = Math.sin(time * 0.25) * 0.15;
      outerRing2.rotation.y = -time * 0.2;
      outerRing2.rotation.z = Math.cos(time * 0.2) * 0.12;

      leftPanel.position.y = 1.2 + Math.sin(time * 0.5) * 0.08;
      leftPanel.rotation.y = 0.3 + targetX * 0.15;
      leftPanel.rotation.x = targetY * 0.1;
      rightPanel.position.y = -0.6 + Math.cos(time * 0.6) * 0.06;
      rightPanel.rotation.y = -0.25 + targetX * 0.15;
      topPanel.position.y = 2.2 + Math.sin(time * 0.4) * 0.05;
      topPanel.rotation.y = targetX * 0.1;

      let intensity = 2.0 + Math.sin(time * 8) * 0.7;
      let scaleOff = Math.sin(time * 8) * 0.04;
      if (flashRef.current > 0.01) {
        intensity += flashRef.current * 7;
        scaleOff += flashRef.current * 0.18;
        flashRef.current *= 0.92;
      }
      const s = 1.0 + scaleOff;
      coreSphere.scale.set(s, s, s);
      coreLight.intensity = intensity;
      coreMat.color.setHSL(((Math.sin(time * 0.2) + 1.0) / 2.0) * 0.2 + 0.85, 1.0, 0.5);

      particleSystem.rotation.y = time * 0.03 + targetX * 0.15;
      particleSystem.rotation.x = Math.sin(time * 0.05) * 0.05 + targetY * 0.1;
      hexField.rotation.z = -time * 0.015;
      hexField.rotation.y = time * 0.01 + targetX * 0.1;

      camera.position.x = Math.sin(time * 0.3) * 0.1 + targetX * 0.7;
      camera.position.y = 0.8 + Math.cos(time * 0.2) * 0.05 + targetY * 0.6;
      camera.lookAt(targetX * 0.4, targetY * 0.2, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      renderer.dispose();
    };
  }, []);

  // ── Send message ──────────────────────────────────────────────────────────
  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;

    if (!user) {
      setAuthModal({ open: true, tab: "login" });
      return;
    }

    setInput("");
    setSendError("");
    setMsgs((m) => [...m, { from: "user", text }]);
    setSending(true);
    flashRef.current = 0.9;

    try {
      const data = await chatAPI.sendMessage("nexus", text);
      setMsgs((m) => [...m, { from: "nexus", text: data.reply }]);
      userAPI.getLimitStatus().then(setLimitStatus).catch(() => {});
    } catch (err) {
      if (err instanceof ApiError && err.data.limitReached) {
        setMsgs((m) => m.slice(0, -1));
        setInput(text);
        setSendError("Daily message limit reached. Refer a friend for +20 bonus messages!");
      } else {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        setSendError(msg);
        setMsgs((m) => [...m, { from: "nexus", text: "Sorry, something went wrong. Please try again! 🙏" }]);
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void send();
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    onNavigate("landing");
  };

  const copyReferral = () => {
    const code = user?.referralCode ?? limitStatus?.referralCode;
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2000);
    });
  };

  const usagePct =
    limitStatus && limitStatus.totalLimit > 0
      ? Math.min(100, Math.round((limitStatus.messagesUsed / limitStatus.totalLimit) * 100))
      : 0;

  const referralCode = user?.referralCode ?? limitStatus?.referralCode ?? "";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: JARVIS_CSS }} />

      <div className="nx-root">
        {/* ===== HEADER ===== */}
        <header className="nx-header">
          {/* Left: panel toggle + brand */}
          <div className="nx-brand">
            <button
              className="nx-hdr-btn nx-hdr-btn--panel"
              onClick={() => setSideOpen((v) => !v)}
              aria-label="Toggle side panel"
            >
              ☰
            </button>
            <div className="nx-logo nx-hf">B</div>
            <span className="nx-brand-name nx-hf">BOTBETTER</span>
            <span className="nx-version-badge nx-mono">NEXUS v4.6</span>
          </div>

          {/* Center: status + clock */}
          <div className="nx-telemetry nx-mono">
            <div className="nx-status-pill">
              <span className="nx-pulse-dot" />
              <span>SYSTEM ACTIVE</span>
            </div>
            <span className="nx-clock">{clock}</span>
          </div>

          {/* Right: auth or avatar */}
          <div className="nx-hdr-actions">
            {user ? (
              <div
                className="nx-hdr-avatar"
                title={user.name}
                onClick={() => {
                  setSideOpen(true);
                  setActiveTab("history");
                }}
              >
                {userInitial}
              </div>
            ) : (
              <>
                <button
                  className="nx-hdr-btn"
                  onClick={() => setAuthModal({ open: true, tab: "login" })}
                >
                  Login
                </button>
                <button
                  className="nx-hdr-btn nx-hdr-btn--pink"
                  onClick={() => setAuthModal({ open: true, tab: "signup" })}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </header>

        {/* ===== COCKPIT ===== */}
        <div className="nx-cockpit">
          {/* 3D WebGL canvas */}
          <canvas ref={canvasRef} className="nx-canvas" />

          {/* Aurora glow background */}
          <div className="nx-aurora" aria-hidden="true">
            <div className="nx-orb nx-orb-1" />
            <div className="nx-orb nx-orb-2" />
            <div className="nx-orb nx-orb-3" />
          </div>
          <div className="nx-sweep" aria-hidden="true" />

          {/* ===== SIDE PANEL ===== */}
          <aside className={`nx-side${sideOpen ? " nx-side--open" : ""}`}>
            <div className="nx-side-inner">
              {/* Tab bar */}
              <div className="nx-tabs">
                {(
                  [
                    { key: "history", icon: "💬", label: "History" },
                    { key: "connectors", icon: "🔌", label: "Apps" },
                    { key: "usage", icon: "📊", label: "Usage" },
                    { key: "referral", icon: "🔗", label: "Refer" },
                  ] as const
                ).map(({ key, icon }) => (
                  <button
                    key={key}
                    className={`nx-tab${activeTab === key ? " nx-tab--active" : ""}`}
                    onClick={() => setActiveTab(key)}
                    title={key.charAt(0).toUpperCase() + key.slice(1)}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="nx-tab-content">
                {/* ── HISTORY ── */}
                {activeTab === "history" && (
                  <>
                    <div className="nx-stitle nx-hf">Chat History</div>
                    <button className="nx-new-chat-btn" onClick={() => setMsgs(SEED)}>
                      + New Chat
                    </button>
                    {historyItems.length === 0 ? (
                      <p className="nx-empty-note nx-mono">
                        No history yet.{"\n"}Start chatting with NEXUS!
                      </p>
                    ) : (
                      [...historyItems]
                        .reverse()
                        .slice(0, 20)
                        .map((m, i) => (
                          <div key={i} className="nx-hist-item nx-mono">
                            {m.role === "user" ? "▷ " : "◁ "}
                            {m.content.slice(0, 42)}
                            {m.content.length > 42 ? "…" : ""}
                          </div>
                        ))
                    )}
                  </>
                )}

                {/* ── CONNECTORS ── */}
                {activeTab === "connectors" && (
                  <>
                    <div className="nx-stitle nx-hf">Connectors</div>
                    {(user?.connectedApps ?? []).map((app) => (
                      <div key={app} className="nx-connector-row">
                        <span className="nx-conn-dot nx-conn-dot--on" />
                        <span>{app}</span>
                      </div>
                    ))}
                    {(user?.connectedApps ?? []).length === 0 && (
                      <p className="nx-empty-note nx-mono">
                        No connectors active.{"\n"}Connect apps to supercharge NEXUS.
                      </p>
                    )}
                    <div className="nx-connector-row" style={{ opacity: 0.45 }}>
                      <span className="nx-conn-dot nx-conn-dot--off" />
                      <span>Gmail (not connected)</span>
                    </div>
                    <div className="nx-connector-row" style={{ opacity: 0.45 }}>
                      <span className="nx-conn-dot nx-conn-dot--off" />
                      <span>Calendar (not connected)</span>
                    </div>
                    <div className="nx-connector-row" style={{ opacity: 0.45 }}>
                      <span className="nx-conn-dot nx-conn-dot--off" />
                      <span>WhatsApp (not connected)</span>
                    </div>
                  </>
                )}

                {/* ── USAGE ── */}
                {activeTab === "usage" && (
                  <>
                    <div className="nx-stitle nx-hf">Usage</div>
                    {!user ? (
                      <p className="nx-empty-note nx-mono">Log in to see usage stats.</p>
                    ) : !limitStatus ? (
                      <p className="nx-empty-note nx-mono">Loading…</p>
                    ) : (
                      <>
                        <div className="nx-stat-card">
                          <div className="nx-stat-row">
                            <span>Messages Used</span>
                            <span className="nx-stat-val-pink">
                              {limitStatus.messagesUsed} / {limitStatus.totalLimit}
                            </span>
                          </div>
                          <div className="nx-prog-track">
                            <div className="nx-prog-fill" style={{ width: `${usagePct}%` }} />
                          </div>
                        </div>
                        <div className="nx-stat-card">
                          <div className="nx-stat-row">
                            <span>Messages Left</span>
                            <span className="nx-stat-val-green">{limitStatus.messagesLeft}</span>
                          </div>
                        </div>
                        <div className="nx-stat-card">
                          <div className="nx-stat-row">
                            <span>Bonus Messages</span>
                            <span className="nx-stat-val-cyan">+{limitStatus.bonusMessages}</span>
                          </div>
                        </div>
                        <p
                          className="nx-mono"
                          style={{ fontSize: 10, color: "rgba(232,249,255,.3)", marginTop: 4, lineHeight: 1.5 }}
                        >
                          Resets:{" "}
                          {limitStatus.resetTime
                            ? new Date(limitStatus.resetTime).toLocaleString()
                            : "Daily at midnight"}
                        </p>
                      </>
                    )}
                  </>
                )}

                {/* ── REFERRAL ── */}
                {activeTab === "referral" && (
                  <>
                    <div className="nx-stitle nx-hf">Referral</div>
                    {!user ? (
                      <p className="nx-empty-note nx-mono">Log in to see your referral code.</p>
                    ) : referralCode ? (
                      <>
                        <div className="nx-ref-code-box">
                          <span className="nx-ref-code nx-mono">{referralCode}</span>
                          <button
                            className={`nx-copy-btn${referralCopied ? " nx-copy-btn--done" : ""}`}
                            onClick={copyReferral}
                          >
                            {referralCopied ? "✓ Copied" : "Copy"}
                          </button>
                        </div>
                        <div className="nx-stat-card">
                          <div className="nx-stat-row">
                            <span>Friends Referred</span>
                            <span className="nx-stat-val-cyan">
                              {limitStatus?.referralCount ?? 0}
                            </span>
                          </div>
                        </div>
                        <div className="nx-stat-card">
                          <div className="nx-stat-row">
                            <span>Bonus Earned</span>
                            <span className="nx-stat-val-green">
                              +{limitStatus?.bonusMessages ?? 0} msgs
                            </span>
                          </div>
                        </div>
                        <p className="nx-ref-hint nx-mono">
                          Share your code and earn +20 messages for every friend who joins!
                        </p>
                      </>
                    ) : (
                      <p className="nx-empty-note nx-mono">Loading referral code…</p>
                    )}
                  </>
                )}
              </div>

              {/* Profile sticker */}
              {user && (
                <div className="nx-profile" onClick={() => setProfileOpen((v) => !v)}>
                  <div className="nx-prof-avatar">{userInitial}</div>
                  <div className="nx-prof-name">{user.name}</div>
                  <span className="nx-plan-tag">{(user.plan ?? "free").toUpperCase()}</span>

                  {profileOpen && (
                    <div className="nx-dropdown" onClick={(e) => e.stopPropagation()}>
                      <div className="nx-drop-item">👤 Profile</div>
                      <div
                        className="nx-drop-item nx-drop-item--red"
                        onClick={handleLogout}
                      >
                        ⏻ Logout
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* ===== CHAT CENTER ===== */}
          <main
            className="nx-chat"
            onClick={() => {
              if (profileOpen) setProfileOpen(false);
            }}
          >
            {/* Messages */}
            <div className="nx-msgs">
              {msgs.map((m, i) => {
                if (m.from === "user") {
                  return (
                    <div key={i} className="nx-bubble-row nx-bubble-row--right">
                      <div className="nx-bbl nx-bbl--user">
                        <div className="nx-bbl-name nx-bbl-name--user nx-hf">
                          {user?.name ?? "You"} ▷
                        </div>
                        {m.text}
                      </div>
                      <div className="nx-bbl-avatar nx-bbl-avatar--user">{userInitial}</div>
                    </div>
                  );
                }
                return (
                  <div key={i} className="nx-bubble-row">
                    <div className="nx-bbl-avatar">N</div>
                    <div className="nx-bbl">
                      <div className="nx-bbl-name nx-hf">NEXUS ▷</div>
                      {m.text}
                      <div className="nx-vibe">
                        <span className="nx-vibe-dot" />
                        NEXUS CORE // BOTBETTER
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Loading indicator */}
              {busy && (
                <div className="nx-bubble-row">
                  <div className="nx-bbl-avatar">N</div>
                  <div className="nx-bbl">
                    <div className="nx-typing">
                      <div className="nx-dot" />
                      <div className="nx-dot" />
                      <div className="nx-dot" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Error banner */}
            {sendError && (
              <div className="nx-err-bar">
                <span>⚠</span>
                <span>{sendError}</span>
                <button className="nx-err-dismiss" onClick={() => setSendError("")}>
                  Dismiss
                </button>
              </div>
            )}

            {/* ===== INPUT DOCK ===== */}
            <div className="nx-input-dock">
              <div className="nx-input-capsule">
                {/* Mic / voice */}
                <button
                  className={`nx-abtn nx-abtn--mic${voice.recording ? " nx-recording" : ""}`}
                  onClick={() => {
                    if (!user) {
                      setAuthModal({ open: true, tab: "login" });
                      return;
                    }
                    voice.toggleRecording();
                  }}
                  disabled={voice.processing || sending}
                  title={voice.recording ? "Stop recording" : "Voice input (STT → AI → TTS)"}
                  aria-label={voice.recording ? "Stop recording" : "Start voice input"}
                >
                  {voice.processing ? "⏳" : voice.recording ? "⏹" : "🎤"}
                </button>

                {/* Text input */}
                <input
                  className="nx-input nx-mono"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    user
                      ? "ENTER COMMAND // VOICE OR TYPE..."
                      : "LOG IN TO ACTIVATE NEXUS..."
                  }
                  disabled={busy}
                  aria-label="Chat input"
                />

                {/* Send */}
                <button
                  className="nx-abtn nx-abtn--send"
                  onClick={() => void send()}
                  disabled={busy || !input.trim()}
                  title="Send message"
                  aria-label="Send"
                >
                  ▲
                </button>
              </div>

              {/* Frequency visualizer */}
              <div className="nx-freqs" aria-hidden="true">
                {Array.from({ length: 12 }, (_, i) => (
                  <div
                    key={i}
                    className={`nx-freq${voice.recording || voice.processing ? " nx-freq--active" : ""}`}
                  />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Auth modal */}
      <AuthModal
        open={authModal.open}
        defaultTab={authModal.tab}
        onClose={() => setAuthModal((s) => ({ ...s, open: false }))}
        onSuccess={() => setAuthModal((s) => ({ ...s, open: false }))}
      />
    </>
  );
};
