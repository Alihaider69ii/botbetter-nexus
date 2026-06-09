import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import {
  chatAPI, userAPI,
  type LimitStatusResponse, type ChatMessage,
} from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useVoiceChat, playBase64Audio } from "@/hooks/use-voice-chat";
import { ThemeSwitcher, useTheme } from "@/components/botbetter/ThemeProvider";
import { AuthModal } from "./AuthModal";
import type { ScreenKey } from "../TopNav";

/* ── Types ─────────────────────────────────────────────────────────────────── */
type Msg = { from: "user"; text: string } | { from: "nexus"; text: string };
type Lang = string;
type Personality = "maya" | "kabir";
type Session = { id: string; title: string; date: string; messages: Msg[] };

const LANGUAGES = [
  { code: "en-IN", label: "English",   native: "English"   },
  { code: "hi-IN", label: "Hindi",     native: "हिंदी"      },
  { code: "ur",    label: "Urdu",      native: "اردو"       },
  { code: "mr-IN", label: "Marathi",   native: "मराठी"     },
  { code: "bn-IN", label: "Bengali",   native: "বাংলা"     },
  { code: "ta-IN", label: "Tamil",     native: "தமிழ்"     },
  { code: "te-IN", label: "Telugu",    native: "తెలుగు"    },
  { code: "gu-IN", label: "Gujarati",  native: "ગુજરાતી"  },
  { code: "pa-IN", label: "Punjabi",   native: "ਪੰਜਾਬੀ"   },
  { code: "kn-IN", label: "Kannada",   native: "ಕನ್ನಡ"    },
  { code: "ml-IN", label: "Malayalam", native: "മലയാളം"   },
];

/* ── UI label translations ─────────────────────────────────────────────────── */
type TKey = "newChat"|"history"|"connectors"|"usageToday"|"referralCode"|"voice"|"personality"
          |"language"|"textOnly"|"voiceOn"|"logIn"|"signUp"|"placeholder"|"loginPrompt"
          |"noHistory"|"search"|"nexusOs"|"systemActive"|"profile";

const TR: Record<string, Record<TKey,string>> = {
  "en-IN": {
    newChat:"New Chat", history:"History", connectors:"Connectors", usageToday:"Usage Today",
    referralCode:"Referral Code", voice:"Voice", personality:"Personality", language:"Language",
    textOnly:"Text Only", voiceOn:"Voice On", logIn:"Log In", signUp:"Sign Up",
    placeholder:"Ask NEXUS anything...", loginPrompt:"Log in to chat with NEXUS",
    noHistory:"No history yet.\nStart chatting!", search:"Search history...",
    nexusOs:"NEXUS OS", systemActive:"SYSTEM ACTIVE", profile:"Profile",
  },
  "hi-IN": {
    newChat:"नया चैट", history:"इतिहास", connectors:"कनेक्शन", usageToday:"आज का उपयोग",
    referralCode:"रेफरल कोड", voice:"आवाज़", personality:"व्यक्तित्व", language:"भाषा",
    textOnly:"टेक्स्ट", voiceOn:"आवाज़ चालू", logIn:"लॉग इन", signUp:"साइन अप",
    placeholder:"NEXUS से कुछ भी पूछें...", loginPrompt:"NEXUS से चैट के लिए लॉग इन करें",
    noHistory:"कोई इतिहास नहीं।\nचैटिंग शुरू करें!", search:"इतिहास खोजें...",
    nexusOs:"NEXUS सिस्टम", systemActive:"सक्रिय", profile:"प्रोफ़ाइल",
  },
  "ur": {
    newChat:"نئی چیٹ", history:"تاریخ", connectors:"کنکشن", usageToday:"آج کا استعمال",
    referralCode:"ریفرل کوڈ", voice:"آواز", personality:"شخصیت", language:"زبان",
    textOnly:"متن", voiceOn:"آواز آن", logIn:"لاگ ان", signUp:"سائن اپ",
    placeholder:"NEXUS سے کچھ بھی پوچھیں...", loginPrompt:"NEXUS سے چیٹ کرنے کے لیے لاگ ان کریں",
    noHistory:"کوئی تاریخ نہیں۔\nچیٹ شروع کریں!", search:"تاریخ تلاش کریں...",
    nexusOs:"NEXUS سسٹم", systemActive:"فعال", profile:"پروفائل",
  },
  "mr-IN": {
    newChat:"नवीन चॅट", history:"इतिहास", connectors:"कनेक्शन", usageToday:"आजचा वापर",
    referralCode:"रेफरल कोड", voice:"आवाज", personality:"व्यक्तिमत्व", language:"भाषा",
    textOnly:"मजकूर", voiceOn:"आवाज चालू", logIn:"लॉग इन", signUp:"साइन अप",
    placeholder:"NEXUS ला काहीही विचारा...", loginPrompt:"NEXUS शी चॅट करण्यासाठी लॉग इन करा",
    noHistory:"कोणताही इतिहास नाही.\nचॅट सुरू करा!", search:"इतिहास शोधा...",
    nexusOs:"NEXUS प्रणाली", systemActive:"सक्रिय", profile:"प्रोफाइल",
  },
  "bn-IN": {
    newChat:"নতুন চ্যাট", history:"ইতিহাস", connectors:"সংযোগ", usageToday:"আজকের ব্যবহার",
    referralCode:"রেফারেল কোড", voice:"ভয়েস", personality:"ব্যক্তিত্ব", language:"ভাষা",
    textOnly:"টেক্সট", voiceOn:"ভয়েস অন", logIn:"লগ ইন", signUp:"সাইন আপ",
    placeholder:"NEXUS কে কিছু জিজ্ঞেস করুন...", loginPrompt:"NEXUS এর সাথে চ্যাট করতে লগ ইন করুন",
    noHistory:"কোনো ইতিহাস নেই।\nচ্যাট শুরু করুন!", search:"ইতিহাস খুঁজুন...",
    nexusOs:"NEXUS সিস্টেম", systemActive:"সক্রিয়", profile:"প্রোফাইল",
  },
  "ta-IN": {
    newChat:"புதிய அரட்டை", history:"வரலாறு", connectors:"இணைப்புகள்", usageToday:"இன்றைய பயன்பாடு",
    referralCode:"பரிந்துரை குறியீடு", voice:"குரல்", personality:"ஆளுமை", language:"மொழி",
    textOnly:"உரை மட்டும்", voiceOn:"குரல் இயக்கு", logIn:"உள்நுழை", signUp:"பதிவு செய்",
    placeholder:"NEXUS ஐ எதுவும் கேளுங்கள்...", loginPrompt:"NEXUS உடன் அரட்டையடிக்க உள்நுழையவும்",
    noHistory:"வரலாறு இல்லை.\nஅரட்டை தொடங்குங்கள்!", search:"வரலாறு தேடுங்கள்...",
    nexusOs:"NEXUS அமைப்பு", systemActive:"செயலில்", profile:"சுயவிவரம்",
  },
  "te-IN": {
    newChat:"కొత్త చాట్", history:"చరిత్ర", connectors:"కనెక్షన్లు", usageToday:"నేటి వినియోగం",
    referralCode:"రెఫరల్ కోడ్", voice:"వాయిస్", personality:"వ్యక్తిత్వం", language:"భాష",
    textOnly:"టెక్స్ట్", voiceOn:"వాయిస్ ఆన్", logIn:"లాగిన్", signUp:"సైన్ అప్",
    placeholder:"NEXUS ను ఏదైనా అడగండి...", loginPrompt:"NEXUS తో చాట్ చేయడానికి లాగిన్ చేయండి",
    noHistory:"చరిత్ర లేదు.\nచాటింగ్ ప్రారంభించండి!", search:"చరిత్ర శోధించండి...",
    nexusOs:"NEXUS వ్యవస్థ", systemActive:"యాక్టివ్", profile:"ప్రొఫైల్",
  },
  "gu-IN": {
    newChat:"નવી ચેટ", history:"ઇતિહાસ", connectors:"કનેક્શન", usageToday:"આજનો ઉપયોગ",
    referralCode:"રેફરલ કોડ", voice:"અવાજ", personality:"વ્યક્તિત્વ", language:"ભાષા",
    textOnly:"ટેક્સ્ટ", voiceOn:"અવાજ ચાલુ", logIn:"લૉગ ઇન", signUp:"સાઇન અપ",
    placeholder:"NEXUS ને કંઈ પણ પૂછો...", loginPrompt:"NEXUS સાથે ચેટ કરવા લૉગ ઇન કરો",
    noHistory:"કોઈ ઇતિહાસ નથી.\nચેટ શરૂ કરો!", search:"ઇતિહાસ શોધો...",
    nexusOs:"NEXUS સિસ્ટમ", systemActive:"સક્રિય", profile:"પ્રોફાઇલ",
  },
  "pa-IN": {
    newChat:"ਨਵੀਂ ਚੈਟ", history:"ਇਤਿਹਾਸ", connectors:"ਕਨੈਕਸ਼ਨ", usageToday:"ਅੱਜ ਦੀ ਵਰਤੋਂ",
    referralCode:"ਰੈਫਰਲ ਕੋਡ", voice:"ਅਵਾਜ਼", personality:"ਸ਼ਖਸੀਅਤ", language:"ਭਾਸ਼ਾ",
    textOnly:"ਟੈਕਸਟ", voiceOn:"ਅਵਾਜ਼ ਚਾਲੂ", logIn:"ਲੌਗ ਇਨ", signUp:"ਸਾਈਨ ਅੱਪ",
    placeholder:"NEXUS ਨੂੰ ਕੁਝ ਵੀ ਪੁੱਛੋ...", loginPrompt:"NEXUS ਨਾਲ ਚੈਟ ਕਰਨ ਲਈ ਲੌਗ ਇਨ ਕਰੋ",
    noHistory:"ਕੋਈ ਇਤਿਹਾਸ ਨਹੀਂ।\nਚੈਟ ਸ਼ੁਰੂ ਕਰੋ!", search:"ਇਤਿਹਾਸ ਖੋਜੋ...",
    nexusOs:"NEXUS ਸਿਸਟਮ", systemActive:"ਸਰਗਰਮ", profile:"ਪ੍ਰੋਫਾਈਲ",
  },
  "kn-IN": {
    newChat:"ಹೊಸ ಚಾಟ್", history:"ಇತಿಹಾಸ", connectors:"ಸಂಪರ್ಕಗಳು", usageToday:"ಇಂದಿನ ಬಳಕೆ",
    referralCode:"ರೆಫರಲ್ ಕೋಡ್", voice:"ಧ್ವನಿ", personality:"ವ್ಯಕ್ತಿತ್ವ", language:"ಭಾಷೆ",
    textOnly:"ಪಠ್ಯ", voiceOn:"ಧ್ವನಿ ಆನ್", logIn:"ಲಾಗಿನ್", signUp:"ಸೈನ್ ಅಪ್",
    placeholder:"NEXUS ಗೆ ಏನು ಬೇಕಾದರೂ ಕೇಳಿ...", loginPrompt:"NEXUS ಜೊತೆ ಚಾಟ್ ಮಾಡಲು ಲಾಗಿನ್ ಮಾಡಿ",
    noHistory:"ಯಾವುದೇ ಇತಿಹಾಸ ಇಲ್ಲ.\nಚಾಟ್ ಪ್ರಾರಂಭಿಸಿ!", search:"ಇತಿಹಾಸ ಹುಡುಕಿ...",
    nexusOs:"NEXUS ವ್ಯವಸ್ಥೆ", systemActive:"ಸಕ್ರಿಯ", profile:"ಪ್ರೊಫೈಲ್",
  },
  "ml-IN": {
    newChat:"പുതിയ ചാറ്റ്", history:"ചരിത്രം", connectors:"കണക്ഷനുകൾ", usageToday:"ഇന്നത്തെ ഉപയോഗം",
    referralCode:"റഫറൽ കോഡ്", voice:"ശബ്ദം", personality:"വ്യക്തിത്വം", language:"ഭാഷ",
    textOnly:"ടെക്സ്റ്റ്", voiceOn:"ശബ്ദം ഓൺ", logIn:"ലോഗ് ഇൻ", signUp:"സൈൻ അപ്",
    placeholder:"NEXUS നോട് എന്തും ചോദിക്കൂ...", loginPrompt:"NEXUS ൽ ചാറ്റ് ചെയ്യാൻ ലോഗ് ഇൻ ചെയ്യൂ",
    noHistory:"ചരിത്രം ഇല്ല.\nചാറ്റ് ആരംഭിക്കൂ!", search:"ചരിത്രം തിരയൂ...",
    nexusOs:"NEXUS സിസ്റ്റം", systemActive:"സജീവം", profile:"പ്രൊഫൈൽ",
  },
};
const t = (lang: Lang, key: TKey): string => TR[lang]?.[key] ?? TR["en-IN"][key] ?? key;

/* ── Helpers ───────────────────────────────────────────────────────────────── */
function histToMsgs(history: ChatMessage[]): Msg[] {
  return history.map((m): Msg =>
    m.role === "user" ? { from: "user", text: m.content } : { from: "nexus", text: m.content }
  );
}

function groupIntoSessions(history: ChatMessage[]): Session[] {
  if (!history.length) return [];
  const sessions: Session[] = [];
  let cur: ChatMessage[] = [];

  for (const msg of history) {
    if (msg.role === "user" && cur.length > 0) {
      const prev = cur[cur.length - 1];
      const gap = new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime();
      if (gap > 2 * 60 * 60 * 1000) {
        const first = cur.find((m) => m.role === "user");
        if (first) sessions.push({ id: first.createdAt, title: first.content.slice(0, 45), date: first.createdAt, messages: histToMsgs(cur) });
        cur = [];
      }
    }
    cur.push(msg);
  }
  if (cur.length) {
    const first = cur.find((m) => m.role === "user");
    if (first) sessions.push({ id: first.createdAt, title: first.content.slice(0, 45), date: first.createdAt, messages: histToMsgs(cur) });
  }
  return sessions.reverse();
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function getSeed(p: Personality): Msg[] {
  return [{
    from: "nexus",
    text: p === "kabir"
      ? "Ready. What do you need done?"
      : "Namaste! Main Maya hoon. Kya help kar sakti hoon?",
  }];
}

const ALL_APPS = [
  { name: "WhatsApp", icon: "💬" }, { name: "Gmail", icon: "📧" },
  { name: "Calendar", icon: "📅" }, { name: "Notion",  icon: "📝" },
];

/* ── Injected CSS ──────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&family=Share+Tech+Mono&display=swap');
.nx-root {
  position:fixed; inset:0;
  font-family:'Space Grotesk',sans-serif;
  background:#03020d; color:#e8f9ff;
  overflow:hidden; z-index:40;
  display:flex; flex-direction:column;
}
.nx-hf   { font-family:'Syne',sans-serif; font-weight:800; }
.nx-mono { font-family:'Share Tech Mono',monospace; }

@keyframes nx-blink      { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.9)} }
@keyframes nx-scan       { 0%{top:0%} 100%{top:100%} }
@keyframes nx-orb-float  { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(60px,-60px) scale(1.15)} 100%{transform:translate(-40px,40px) scale(.9)} }
@keyframes nx-fade-up    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes nx-bounce-dot { 0%,100%{transform:scale(.6);opacity:.3} 50%{transform:scale(1);opacity:1} }
@keyframes nx-rec-pulse  { 0%,100%{box-shadow:0 0 0 0 rgba(255,0,127,.4)} 50%{box-shadow:0 0 0 8px rgba(255,0,127,0)} }
@keyframes nx-prog-shift { 0%,100%{filter:hue-rotate(0deg)} 50%{filter:hue-rotate(30deg)} }
@keyframes nx-voice-bar  { 0%,100%{transform:scaleY(.4)} 50%{transform:scaleY(1)} }

/* HEADER */
.nx-header {
  height:60px; min-height:60px;
  display:flex; align-items:center; justify-content:space-between; padding:0 20px;
  border-bottom:1px solid rgba(0,240,255,.13);
  background:rgba(3,2,13,.93); backdrop-filter:blur(14px);
  z-index:20; position:relative; flex-shrink:0;
}
.nx-brand      { display:flex; align-items:center; gap:9px; }
.nx-logo       { width:30px; height:30px; border-radius:8px; background:linear-gradient(45deg,#00f0ff,#ff007f); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:15px; color:#fff; box-shadow:0 0 12px rgba(0,240,255,.35); flex-shrink:0; }
.nx-brand-name { font-size:16px; letter-spacing:1.5px; color:#fff; }
.nx-telemetry  { display:flex; align-items:center; gap:16px; font-size:12px; }
.nx-status-pill{ display:flex; align-items:center; gap:6px; background:rgba(0,240,255,.06); border:1px solid rgba(0,240,255,.2); padding:3px 11px; border-radius:30px; }
.nx-pulse-dot  { width:5px; height:5px; border-radius:50%; background:#39ff14; box-shadow:0 0 6px #39ff14; animation:nx-blink 1.5s infinite; }
.nx-clock      { font-variant-numeric:tabular-nums; font-weight:bold; color:#00f0ff; }
.nx-hdr-actions{ display:flex; align-items:center; gap:7px; }
.nx-hdr-btn    { height:32px; padding:0 12px; border-radius:8px; border:1px solid rgba(0,240,255,.2); background:rgba(0,240,255,.04); color:#00f0ff; cursor:pointer; display:flex; align-items:center; gap:5px; font-size:11px; font-weight:700; letter-spacing:.8px; transition:all .2s; font-family:'Space Grotesk',sans-serif; }
.nx-hdr-btn:hover     { background:linear-gradient(135deg,#00f0ff,#ff007f); color:#fff; }
.nx-hdr-btn--pink     { background:rgba(255,0,127,.07); border-color:rgba(255,0,127,.3); color:#ff007f; }
.nx-hdr-btn--icon     { width:34px; padding:0; justify-content:center; font-size:17px; }
.nx-avatar    { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#00f0ff,#ff007f); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:13px; color:#fff; box-shadow:0 0 10px rgba(0,240,255,.3); cursor:pointer; flex-shrink:0; transition:transform .2s; position:relative; }
.nx-avatar:hover { transform:scale(1.08); }
.nx-av-drop   { position:absolute; top:calc(100% + 8px); right:0; background:rgba(5,3,18,.98); border:1px solid rgba(0,240,255,.4); border-radius:11px; padding:4px 0; z-index:60; box-shadow:0 8px 28px rgba(0,0,0,.7); animation:nx-fade-up .18s ease; min-width:175px; }
.nx-drop-row  { display:flex; align-items:center; gap:8px; padding:8px 14px; font-size:12px; font-weight:600; color:rgba(232,249,255,.6); cursor:pointer; transition:all .15s; font-family:'Space Grotesk',sans-serif; white-space:nowrap; }
.nx-drop-row:hover      { background:rgba(0,240,255,.07); color:#00f0ff; }
.nx-drop-row--red       { color:#ff007f; }
.nx-drop-row--red:hover { background:rgba(255,0,127,.07); }

/* COCKPIT */
.nx-cockpit { display:flex; flex:1; overflow:hidden; position:relative; z-index:5; }
.nx-canvas  { position:absolute; inset:0; width:100%; height:100%; z-index:0; pointer-events:none; }
.nx-aurora  { position:absolute; inset:0; filter:blur(100px); opacity:.45; z-index:1; mix-blend-mode:screen; pointer-events:none; overflow:hidden; }
.nx-orb     { position:absolute; border-radius:50%; filter:blur(50px); mix-blend-mode:screen; animation:nx-orb-float 14s ease-in-out infinite alternate; }
.nx-orb-1   { width:400px; height:400px; background:radial-gradient(circle,#00f0ff 0%,transparent 70%); top:10%; left:15%; animation-duration:18s; }
.nx-orb-2   { width:450px; height:450px; background:radial-gradient(circle,#ff007f 0%,transparent 70%); bottom:10%; right:15%; animation-duration:22s; }
.nx-orb-3   { width:300px; height:300px; background:radial-gradient(circle,#7f00ff 0%,transparent 70%); top:35%; left:45%; animation-duration:16s; }
.nx-sweep   { position:absolute; left:0; width:100%; height:3px; background:linear-gradient(90deg,transparent,#00f0ff,#ff007f,transparent); animation:nx-scan 7s linear infinite; z-index:2; pointer-events:none; }

/* LEFT SIDEBAR */
.nx-left {
  width:256px; flex-shrink:0;
  background:rgba(10,4,30,.55);
  border-right:1px solid rgba(0,240,255,.11);
  backdrop-filter:blur(20px);
  display:flex; flex-direction:column;
  z-index:10;
  transition:width .32s cubic-bezier(.16,1,.3,1), min-width .32s;
  overflow:hidden; min-width:256px;
}
.nx-left--closed { width:0; min-width:0; }
.nx-left-scroll  { flex:1; overflow-y:auto; padding:12px 13px; }
.nx-left-scroll::-webkit-scrollbar { width:2px; }
.nx-left-scroll::-webkit-scrollbar-thumb { background:rgba(0,240,255,.1); }

.nx-new-btn { width:100%; margin-bottom:14px; padding:9px 13px; border-radius:10px; border:1px dashed rgba(0,240,255,.28); background:rgba(0,240,255,.03); color:#00f0ff; font-size:12px; font-weight:700; letter-spacing:.8px; cursor:pointer; display:flex; align-items:center; gap:7px; transition:all .18s; font-family:'Space Grotesk',sans-serif; }
.nx-new-btn:hover { background:rgba(0,240,255,.08); border-color:rgba(0,240,255,.45); }

.nx-section-head { font-size:9px; font-weight:700; letter-spacing:3px; color:rgba(232,249,255,.28); text-transform:uppercase; margin:14px 0 6px; font-family:'Syne',sans-serif; padding:0 2px; }
.nx-search       { width:100%; padding:7px 10px; border-radius:8px; border:1px solid rgba(0,240,255,.13); background:rgba(0,240,255,.02); color:#e8f9ff; font-size:11px; font-family:'Space Grotesk',sans-serif; outline:none; margin-bottom:6px; transition:border-color .15s; }
.nx-search::placeholder { color:rgba(0,240,255,.28); }
.nx-search:focus { border-color:rgba(0,240,255,.32); }

.nx-date-label  { font-size:9px; letter-spacing:1.5px; color:rgba(232,249,255,.22); text-transform:uppercase; margin:8px 0 4px; padding:0 2px; font-family:'Share Tech Mono',monospace; }
.nx-hist-item   { display:flex; align-items:center; gap:6px; padding:7px 9px; border-radius:8px; cursor:pointer; transition:all .14s; margin-bottom:2px; }
.nx-hist-item:hover { background:rgba(0,240,255,.07); }
.nx-hist-item--active { background:rgba(0,240,255,.1); border-left:2px solid #00f0ff; padding-left:7px; }
.nx-hist-dot    { width:5px; height:5px; border-radius:50%; background:rgba(0,240,255,.28); flex-shrink:0; }
.nx-hist-text   { font-size:11px; color:rgba(232,249,255,.58); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1; line-height:1.4; }
.nx-hist-del    { font-size:10px; color:rgba(255,0,127,.35); cursor:pointer; flex-shrink:0; padding:2px; opacity:0; transition:opacity .14s; }
.nx-hist-item:hover .nx-hist-del { opacity:1; }
.nx-hist-del:hover { color:#ff007f; }

.nx-app-row  { display:flex; align-items:center; gap:7px; padding:5px 8px; border-radius:7px; font-size:11px; color:rgba(232,249,255,.48); margin-bottom:3px; }
.nx-app-dot  { width:5px; height:5px; border-radius:50%; flex-shrink:0; }
.nx-dot-on   { background:#39ff14; box-shadow:0 0 5px #39ff14; animation:nx-blink 2s infinite; }
.nx-dot-off  { background:rgba(255,255,255,.16); }

.nx-stat-row { display:flex; justify-content:space-between; align-items:center; font-size:11px; margin-bottom:5px; color:rgba(232,249,255,.6); }
.nx-stat-tag { font-size:9px; font-weight:700; padding:1px 7px; border-radius:4px; background:rgba(255,0,127,.1); border:1px solid rgba(255,0,127,.3); color:#ff007f; }
.nx-prog-bar { height:4px; background:rgba(255,255,255,.05); border-radius:2px; overflow:hidden; margin-bottom:5px; }
.nx-prog-fill{ height:100%; background:linear-gradient(90deg,#00f0ff,#ff007f); border-radius:2px; animation:nx-prog-shift 4s linear infinite; transition:width .5s; }

.nx-ref-row  { display:flex; align-items:center; gap:6px; background:rgba(0,240,255,.025); border:1px dashed rgba(0,240,255,.2); border-radius:9px; padding:7px 10px; }
.nx-ref-code { font-size:12px; font-weight:700; letter-spacing:3px; color:#00f0ff; flex:1; }
.nx-ref-copy { font-size:9px; font-weight:700; padding:3px 7px; border-radius:5px; border:1px solid rgba(0,240,255,.22); background:rgba(0,240,255,.05); color:#00f0ff; cursor:pointer; transition:all .14s; font-family:'Space Grotesk',sans-serif; }
.nx-ref-copy:hover     { background:rgba(0,240,255,.12); }
.nx-ref-copy--done     { color:#39ff14; border-color:rgba(57,255,20,.3); background:rgba(57,255,20,.06); }

.nx-empty { font-size:10px; color:rgba(232,249,255,.24); text-align:center; padding:8px 4px; line-height:1.8; font-family:'Share Tech Mono',monospace; }

/* CHAT CENTER */
.nx-chat { flex:1; display:flex; flex-direction:column; position:relative; overflow:hidden; min-width:0; }
.nx-msgs { flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:14px; padding:22px 24px; z-index:5; }
.nx-msgs::-webkit-scrollbar { width:3px; }
.nx-msgs::-webkit-scrollbar-thumb { background:rgba(0,240,255,.11); border-radius:2px; }

.nx-bbl-row        { display:flex; gap:10px; max-width:660px; animation:nx-fade-up .24s ease both; }
.nx-bbl-row--right { align-self:flex-end; justify-content:flex-end; }
.nx-bbl-av  { width:30px; height:30px; border-radius:9px; flex-shrink:0; background:linear-gradient(135deg,#00f0ff,#ff007f); box-shadow:0 0 10px rgba(0,240,255,.4); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:12px; color:#fff; margin-top:2px; }
.nx-bbl-av--user { background:#ff007f; box-shadow:0 0 10px rgba(255,0,127,.4); }
.nx-bbl     { background:rgba(8,3,28,.5); border:1px solid rgba(0,240,255,.18); border-radius:0 13px 13px 13px; padding:12px 16px; font-size:13.5px; line-height:1.65; color:#e8f9ff; backdrop-filter:blur(12px); white-space:pre-line; }
.nx-bbl--user { background:rgba(255,0,127,.044); border-color:rgba(255,0,127,.26); border-radius:13px 0 13px 13px; }
.nx-bbl-name { font-size:9px; font-weight:700; letter-spacing:2px; color:#00f0ff; margin-bottom:6px; text-transform:uppercase; font-family:'Syne',sans-serif; }
.nx-bbl-name--user { color:#ff007f; }

.nx-typing { display:flex; gap:5px; align-items:center; padding:4px 0; }
.nx-dot    { width:6px; height:6px; border-radius:50%; background:rgba(0,240,255,.4); animation:nx-bounce-dot 1.2s ease-in-out infinite; }
.nx-dot:nth-child(2) { animation-delay:.2s; }
.nx-dot:nth-child(3) { animation-delay:.4s; }

.nx-err-bar     { margin:0 18px 6px; padding:9px 13px; border-radius:9px; background:rgba(255,0,127,.06); border:1px solid rgba(255,0,127,.26); color:#ff007f; font-size:12px; font-weight:600; display:flex; align-items:center; gap:7px; flex-shrink:0; }
.nx-err-dismiss { margin-left:auto; font-size:10px; text-decoration:underline; cursor:pointer; background:none; border:none; color:#ff007f; padding:0; font-family:'Space Grotesk',sans-serif; font-weight:bold; }

/* INPUT DOCK */
.nx-dock    { border-top:1px solid rgba(0,240,255,.11); background:rgba(3,2,13,.9); padding:12px 20px 14px; z-index:10; backdrop-filter:blur(14px); flex-shrink:0; }
.nx-capsule { display:flex; align-items:center; gap:8px; max-width:820px; margin:0 auto; }
.nx-input   { flex:1; background:rgba(0,240,255,.02); border:1px solid rgba(0,240,255,.24); border-radius:28px; padding:10px 18px; font-family:'Space Grotesk',sans-serif; font-size:13.5px; color:#e8f9ff; outline:none; transition:border-color .2s; }
.nx-input:focus        { border-color:#ff007f; }
.nx-input::placeholder { color:rgba(0,240,255,.28); font-size:12px; }
.nx-input:disabled     { opacity:.45; }
.nx-ibtn            { width:40px; height:40px; min-width:40px; border-radius:50%; border:1px solid rgba(0,240,255,.24); background:rgba(0,240,255,.02); color:#00f0ff; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:16px; transition:all .24s; }
.nx-ibtn:hover      { box-shadow:0 0 14px #00f0ff; transform:scale(1.07); background:rgba(0,240,255,.08); }
.nx-ibtn:disabled   { opacity:.45; cursor:not-allowed; transform:none !important; box-shadow:none !important; }
.nx-ibtn--mic       { background:rgba(255,0,127,.07); border-color:rgba(255,0,127,.33); color:#ff007f; }
.nx-ibtn--mic:hover { box-shadow:0 0 14px #ff007f; background:rgba(255,0,127,.13); }
.nx-ibtn--mic.nx-rec { background:rgba(255,0,127,.2); animation:nx-rec-pulse 1s ease-in-out infinite; }
.nx-ibtn--send      { background:linear-gradient(135deg,#00f0ff,#ff007f); border:none; color:#fff; font-size:17px; }
.nx-ibtn--send:hover{ box-shadow:0 0 18px rgba(255,0,127,.5); transform:scale(1.07); }

.nx-freqs   { display:flex; align-items:flex-end; justify-content:center; gap:3px; height:14px; margin-top:8px; max-width:820px; margin-left:auto; margin-right:auto; }
.nx-freq    { width:2px; border-radius:1px; background:#00f0ff; opacity:.28; transform-origin:bottom; animation:nx-voice-bar 1s ease-in-out infinite; }
.nx-freq:nth-child(even) { animation-delay:.25s; }
.nx-freq:nth-child(3n)   { animation-delay:.1s; }
.nx-freq--active { opacity:1; background:#ff007f; }

/* RIGHT SIDEBAR */
.nx-right {
  width:218px; flex-shrink:0;
  background:rgba(10,4,30,.55);
  border-left:1px solid rgba(0,240,255,.11);
  backdrop-filter:blur(20px);
  display:flex; flex-direction:column;
  padding:14px; z-index:10; overflow-y:auto;
}
.nx-right::-webkit-scrollbar { width:2px; }
.nx-right::-webkit-scrollbar-thumb { background:rgba(0,240,255,.1); }

.nx-prof-card { background:rgba(0,240,255,.025); border:1px solid rgba(0,240,255,.12); border-radius:12px; padding:12px; margin-bottom:14px; display:flex; flex-direction:column; align-items:center; gap:3px; text-align:center; }
.nx-prof-av   { width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg,#00f0ff,#ff007f); box-shadow:0 0 12px rgba(0,240,255,.35); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:16px; color:#fff; margin-bottom:3px; }
.nx-prof-name { font-weight:700; font-size:13px; color:#fff; }
.nx-prof-mail { font-size:9px; color:rgba(232,249,255,.33); margin-bottom:3px; word-break:break-all; }
.nx-plan-tag  { font-size:8px; font-weight:900; padding:2px 7px; border-radius:20px; border:1px solid #00f0ff; color:#00f0ff; letter-spacing:1px; text-transform:uppercase; }
.nx-plan-tag--admin { border-color:#ff007f; color:#ff007f; }

.nx-stitle    { font-size:9px; font-weight:700; letter-spacing:2.5px; color:rgba(232,249,255,.27); text-transform:uppercase; margin:12px 0 7px; font-family:'Syne',sans-serif; }
.nx-divider   { height:1px; background:rgba(0,240,255,.07); margin:10px 0; }

.nx-tgl-group { display:flex; gap:3px; margin-bottom:10px; }
.nx-tgl-opt   { flex:1; padding:7px 2px; border-radius:8px; font-size:9px; font-weight:700; letter-spacing:.6px; border:1px solid rgba(0,240,255,.13); background:transparent; color:rgba(232,249,255,.3); cursor:pointer; transition:all .15s; text-align:center; font-family:'Space Grotesk',sans-serif; text-transform:uppercase; }
.nx-tgl-opt:hover       { color:rgba(232,249,255,.65); border-color:rgba(0,240,255,.26); }
.nx-tgl-opt--on         { background:rgba(0,240,255,.09); border-color:rgba(0,240,255,.38); color:#00f0ff; }
.nx-tgl-opt--maya-on    { background:rgba(124,107,255,.11); border-color:rgba(124,107,255,.38); color:#7C6BFF; }
.nx-tgl-opt--kabir-on   { background:rgba(14,165,233,.09); border-color:rgba(14,165,233,.36); color:#0ea5e9; }

.nx-lang-sel { width:100%; padding:7px 9px; border-radius:9px; border:1px solid rgba(0,240,255,.18); background:rgba(0,240,255,.02); color:#e8f9ff; font-size:11px; font-family:'Space Grotesk',sans-serif; outline:none; cursor:pointer; transition:border-color .14s; }
.nx-lang-sel:hover, .nx-lang-sel:focus { border-color:rgba(0,240,255,.35); }
.nx-lang-sel option { background:#050312; color:#e8f9ff; }

.nx-login-card { background:rgba(0,240,255,.025); border:1px dashed rgba(0,240,255,.17); border-radius:11px; padding:14px; text-align:center; font-size:11px; color:rgba(232,249,255,.38); line-height:1.7; margin-bottom:12px; }
.nx-login-card button { margin-top:8px; padding:6px 14px; border-radius:8px; border:1px solid rgba(0,240,255,.28); background:rgba(0,240,255,.05); color:#00f0ff; font-size:11px; font-weight:700; cursor:pointer; font-family:'Space Grotesk',sans-serif; width:100%; transition:all .17s; }
.nx-login-card button:hover { background:rgba(0,240,255,.12); }

.nx-save-toast { margin-top:6px; font-size:9px; text-align:center; letter-spacing:1px; animation:nx-fade-up .2s ease; color:#39ff14; }
.nx-save-saving { color:rgba(0,240,255,.45); }

/* ── VOID theme ── */
[data-theme="void"] .nx-root { background:#000 !important; }
[data-theme="void"] .nx-header { background:rgba(0,0,0,.97) !important; border-color:#1A1A1A !important; }
[data-theme="void"] .nx-dock { background:rgba(0,0,0,.97) !important; border-color:#1A1A1A !important; }
[data-theme="void"] .nx-left { background:rgba(8,0,22,.6) !important; border-color:#1A1A1A !important; }
[data-theme="void"] .nx-right { background:rgba(8,0,22,.6) !important; border-color:#1A1A1A !important; }
[data-theme="void"] .nx-brand-name,[data-theme="void"] .nx-clock,[data-theme="void"] .nx-new-btn,[data-theme="void"] .nx-bbl-name { color:#7C6BFF !important; }
[data-theme="void"] .nx-hdr-btn { color:#7C6BFF !important; border-color:rgba(124,107,255,.28) !important; background:rgba(124,107,255,.04) !important; }
[data-theme="void"] .nx-hdr-btn:hover { background:linear-gradient(135deg,#7C6BFF,#FF007F) !important; color:#fff !important; }
[data-theme="void"] .nx-status-pill { border-color:rgba(124,107,255,.25) !important; background:rgba(124,107,255,.06) !important; }
[data-theme="void"] .nx-pulse-dot { background:#7C6BFF !important; box-shadow:0 0 6px #7C6BFF !important; }
[data-theme="void"] .nx-bbl { border-color:rgba(124,107,255,.2) !important; }
[data-theme="void"] .nx-input { border-color:rgba(124,107,255,.28) !important; }
[data-theme="void"] .nx-input:focus { border-color:#7C6BFF !important; }
[data-theme="void"] .nx-orb-1 { background:radial-gradient(circle,#7C6BFF 0%,transparent 70%) !important; }
[data-theme="void"] .nx-ibtn--send { background:linear-gradient(135deg,#7C6BFF,#FF007F) !important; }
[data-theme="void"] .nx-logo { background:linear-gradient(45deg,#7C6BFF,#FF007F) !important; }
[data-theme="void"] .nx-prog-fill { background:linear-gradient(90deg,#7C6BFF,#FF007F) !important; }

/* ── GEN Z theme ── */
[data-theme="genz"] .nx-root { background:#fff !important; color:#0A0A0F !important; }
[data-theme="genz"] .nx-header { background:rgba(255,255,255,.97) !important; border-color:#E5E7EB !important; }
[data-theme="genz"] .nx-dock { background:rgba(255,255,255,.97) !important; border-color:#E5E7EB !important; }
[data-theme="genz"] .nx-left { background:rgba(248,247,255,.92) !important; border-color:#E5E7EB !important; }
[data-theme="genz"] .nx-right { background:rgba(248,247,255,.92) !important; border-color:#E5E7EB !important; }
[data-theme="genz"] .nx-brand-name,[data-theme="genz"] .nx-clock,[data-theme="genz"] .nx-new-btn,[data-theme="genz"] .nx-bbl-name { color:#6C00FF !important; }
[data-theme="genz"] .nx-hdr-btn { color:#6C00FF !important; border-color:rgba(108,0,255,.22) !important; background:rgba(108,0,255,.04) !important; }
[data-theme="genz"] .nx-hdr-btn:hover { background:linear-gradient(135deg,#6C00FF,#FF3CAC) !important; color:#fff !important; }
[data-theme="genz"] .nx-status-pill { border-color:rgba(108,0,255,.2) !important; background:rgba(108,0,255,.05) !important; color:#6C00FF !important; }
[data-theme="genz"] .nx-pulse-dot { background:#22c55e !important; box-shadow:0 0 6px #22c55e !important; }
[data-theme="genz"] .nx-bbl { background:rgba(108,0,255,.03) !important; border-color:rgba(108,0,255,.14) !important; color:#0A0A0F !important; }
[data-theme="genz"] .nx-bbl--user { background:rgba(255,60,172,.04) !important; border-color:rgba(255,60,172,.18) !important; }
[data-theme="genz"] .nx-input { background:rgba(108,0,255,.02) !important; border-color:rgba(108,0,255,.2) !important; color:#0A0A0F !important; }
[data-theme="genz"] .nx-input:focus { border-color:#FF3CAC !important; }
[data-theme="genz"] .nx-input::placeholder { color:rgba(108,0,255,.35) !important; }
[data-theme="genz"] .nx-section-head { color:rgba(10,10,15,.35) !important; }
[data-theme="genz"] .nx-hist-text { color:rgba(10,10,15,.55) !important; }
[data-theme="genz"] .nx-hist-item:hover { background:rgba(108,0,255,.06) !important; }
[data-theme="genz"] .nx-hist-item--active { background:rgba(108,0,255,.09) !important; border-color:#6C00FF !important; }
[data-theme="genz"] .nx-empty { color:rgba(10,10,15,.35) !important; }
[data-theme="genz"] .nx-orb-1,[data-theme="genz"] .nx-orb-2,[data-theme="genz"] .nx-orb-3 { opacity:.08 !important; }
[data-theme="genz"] .nx-aurora { opacity:.08 !important; }
[data-theme="genz"] .nx-ibtn--send { background:linear-gradient(135deg,#6C00FF,#FF3CAC) !important; }
[data-theme="genz"] .nx-ibtn--mic { background:rgba(255,60,172,.07) !important; border-color:rgba(255,60,172,.3) !important; color:#FF3CAC !important; }
[data-theme="genz"] .nx-logo { background:linear-gradient(45deg,#6C00FF,#FF3CAC) !important; }
[data-theme="genz"] .nx-prog-fill { background:linear-gradient(90deg,#6C00FF,#FF3CAC) !important; }
[data-theme="genz"] .nx-ref-code,[data-theme="genz"] .nx-ref-copy { color:#6C00FF !important; border-color:rgba(108,0,255,.25) !important; }
[data-theme="genz"] .nx-stat-tag { background:rgba(255,60,172,.08) !important; border-color:rgba(255,60,172,.25) !important; color:#FF3CAC !important; }
[data-theme="genz"] .nx-plan-tag { border-color:#6C00FF !important; color:#6C00FF !important; }
[data-theme="genz"] .nx-tgl-opt { border-color:rgba(108,0,255,.15) !important; color:rgba(10,10,15,.4) !important; }
[data-theme="genz"] .nx-drop-row { color:rgba(10,10,15,.6) !important; }
[data-theme="genz"] .nx-av-drop { background:rgba(255,255,255,.99) !important; border-color:rgba(108,0,255,.3) !important; }
`;

/* ── Component ─────────────────────────────────────────────────────────────── */
export const NexusChat = ({
  onNavigate,
}: {
  active: ScreenKey;
  onNavigate: (s: ScreenKey) => void;
}) => {
  const { user, logout, updateUser } = useAuth();
  const { theme } = useTheme();

  // Save theme to backend when it changes (debounced)
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      userAPI.updateProfile({ theme }).catch(() => {});
    }, 800);
    return () => clearTimeout(timer);
  }, [theme, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [msgs,       setMsgs]        = useState<Msg[]>(() => getSeed(user?.personality ?? "maya"));
  const [input,      setInput]       = useState("");
  const [sending,    setSending]     = useState(false);
  const [sendError,  setSendError]   = useState("");

  const [voice,       setVoiceState]       = useState<"off"|"on">(user?.voice === "off" ? "off" : "on");
  const [personality, setPersonalityState] = useState<Personality>(user?.personality ?? "maya");
  const [language,    setLanguageState]    = useState<Lang>(user?.language ?? "en-IN");
  const [savingPref,  setSavingPref]       = useState(false);
  const [savedToast,  setSavedToast]       = useState(false);

  const [leftOpen,         setLeftOpen]         = useState(true);
  const [sessions,         setSessions]         = useState<Session[]>([]);
  const [activeSessionId,  setActiveSessionId]  = useState<string|null>(null);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [limitStatus,      setLimitStatus]      = useState<LimitStatusResponse|null>(null);
  const [refCopied,        setRefCopied]        = useState(false);
  const [clock,            setClock]            = useState("00:00:00");
  const [avatarOpen,       setAvatarOpen]       = useState(false);
  const [authModal,        setAuthModal]        = useState<{open:boolean;tab:"login"|"signup"}>({open:false,tab:"login"});

  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const mouseRef   = useRef({ x:0, y:0 });
  const flashRef   = useRef(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>|null>(null);

  const userInitial = user?.name?.[0]?.toUpperCase() ?? "?";
  const isAdmin     = user?.userType === "admin";

  /* ── Persist settings (debounced) ── */
  const persistPrefs = useCallback((lang: Lang, v: "off"|"on", p: Personality) => {
    if (!user) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSavingPref(true);
      try {
        await userAPI.updateProfile({ language: lang, voice: v === "on" ? "female" : "off", personality: p });
        updateUser({ language: lang, voice: v === "on" ? "female" : "off", personality: p });
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 1800);
      } catch { /* ignore */ }
      finally { setSavingPref(false); }
    }, 700);
  }, [user, updateUser]);

  const setVoice = (v: "off"|"on") => { setVoiceState(v); persistPrefs(language, v, personality); };
  const setPersonality = (p: Personality) => { setPersonalityState(p); persistPrefs(language, voice, p); };
  const setLanguage = (l: Lang) => { setLanguageState(l); persistPrefs(l, voice, personality); };

  /* ── Voice hook ── */
  const voiceHook = useVoiceChat({
    language,
    personality,
    onResult: (data) => {
      setSendError("");
      setMsgs((m) => [...m, { from:"user", text:data.transcript }, { from:"nexus", text:data.reply }]);
      refreshSidebar();
    },
    onError: (message) => setSendError(message),
  });

  const busy = sending || voiceHook.processing;

  /* ── Clock ── */
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`);
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  /* ── Auto-scroll ── */
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, sending]);

  /* ── Sidebar refresh ── */
  const refreshSidebar = useCallback(() => {
    if (!user) { setLimitStatus(null); setSessions([]); return; }
    userAPI.getLimitStatus().then(setLimitStatus).catch(() => {});
    chatAPI.getHistory("nexus").then((d) => setSessions(groupIntoSessions(d.history))).catch(() => {});
  }, [user]);

  useEffect(() => { refreshSidebar(); }, [refreshSidebar]);

  /* ── Sync prefs from user profile (on login/account switch) ── */
  useEffect(() => {
    if (!user) return;
    setVoiceState(user.voice === "off" ? "off" : "on");
    if (user.personality) setPersonalityState(user.personality);
    if (user.language)    setLanguageState(user.language);
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Three.js holographic reactor ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x03020d, 0.015);
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0.8, 8.0); camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const resize = () => { const w=canvas.clientWidth,h=canvas.clientHeight; if(w>0&&h>0){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();} };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas);
    scene.add(new THREE.AmbientLight(0x0f0525));
    const pl = new THREE.PointLight(0x00f0ff,1.8,30); pl.position.set(3,4,5); scene.add(pl);
    const cl = new THREE.PointLight(0xff007f,2.5,12); scene.add(cl);
    const rg = new THREE.Group(); rg.position.set(0,0.2,0); scene.add(rg);
    const cMat = new THREE.MeshStandardMaterial({ color:0xff007f, emissive:0x00f0ff, emissiveIntensity:1.8, metalness:.9, roughness:.15, transparent:true, opacity:.8 });
    const core = new THREE.Mesh(new THREE.SphereGeometry(.5,32,32), cMat); rg.add(core);
    rg.add(new THREE.Mesh(new THREE.TorusGeometry(.7,.015,16,100), new THREE.MeshBasicMaterial({ color:0x00f0ff, wireframe:true, transparent:true, opacity:.8 })));
    const spkG = new THREE.Group();
    const spkM = new THREE.MeshStandardMaterial({ color:0xff007f, emissive:0x00f0ff, emissiveIntensity:1.2, metalness:.8, transparent:true, opacity:.95 });
    for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2;const s=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.25,8),spkM);s.position.set(Math.cos(a)*.6,Math.sin(a)*.6,0);s.rotation.z=a+Math.PI/2;spkG.add(s);}
    rg.add(spkG);
    const brG = new THREE.Group();
    const brM = new THREE.MeshStandardMaterial({ color:0x00f0ff, emissive:0xff007f, emissiveIntensity:1.5, transparent:true, opacity:.95 });
    for(let i=0;i<12;i++){const a=(i/12)*Math.PI*2;const b=new THREE.Mesh(new THREE.BoxGeometry(.06,.04,.08),brM);b.position.set(Math.cos(a)*.9,Math.sin(a)*.9,0);b.rotation.z=a;brG.add(b);}
    rg.add(brG);
    const ringM = new THREE.MeshStandardMaterial({ color:0x00f0ff, emissive:0x220033, emissiveIntensity:.9, transparent:true, opacity:.4 });
    const r1=new THREE.Mesh(new THREE.TorusGeometry(1.25,.035,16,100),ringM); rg.add(r1);
    const r2=new THREE.Mesh(new THREE.TorusGeometry(1.55,.02,16,100),ringM); rg.add(r2);
    const mkPts = (n:number,col:number,sz:number,op:number,rx:number,ry:number,rz:number)=>{
      const g=new THREE.BufferGeometry();const p=new Float32Array(n*3);
      for(let i=0;i<n;i++){p[i*3]=(Math.random()-.5)*rx;p[i*3+1]=(Math.random()-.5)*ry;p[i*3+2]=(Math.random()-.5)*rz-2;}
      g.setAttribute("position",new THREE.BufferAttribute(p,3));
      return new THREE.Points(g,new THREE.PointsMaterial({color:col,size:sz,transparent:true,opacity:op,blending:THREE.AdditiveBlending}));
    };
    const pts=mkPts(800,0x00f0ff,.04,.5,16,10,8); scene.add(pts);
    const hex=mkPts(400,0x00ffaa,.024,.38,14,8,6); scene.add(hex);
    const onMM=(e:MouseEvent)=>{mouseRef.current.x=(e.clientX/window.innerWidth)*2-1;mouseRef.current.y=-(e.clientY/window.innerHeight)*2+1;};
    window.addEventListener("mousemove",onMM);
    let rid:number,t=0,tx=0,ty=0;
    const loop=()=>{
      rid=requestAnimationFrame(loop);t+=.012;
      tx+=(mouseRef.current.x-tx)*.05;ty+=(mouseRef.current.y-ty)*.05;
      rg.rotation.y=t*.2+tx*.45;rg.rotation.x=Math.sin(t*.15)*.1+ty*.35;
      brG.rotation.z=-t*.65;spkG.rotation.z=t*.35;
      r1.rotation.y=t*.4;r1.rotation.x=Math.sin(t*.25)*.15;
      r2.rotation.y=-t*.2;r2.rotation.z=Math.cos(t*.2)*.12;
      let inten=2+Math.sin(t*8)*.7,sc=Math.sin(t*8)*.04;
      if(flashRef.current>.01){inten+=flashRef.current*7;sc+=flashRef.current*.18;flashRef.current*=.92;}
      const s=1+sc;core.scale.set(s,s,s);cl.intensity=inten;
      cMat.color.setHSL(((Math.sin(t*.2)+1)/2)*.2+.85,1,.5);
      pts.rotation.y=t*.03+tx*.15;pts.rotation.x=Math.sin(t*.05)*.05+ty*.1;
      hex.rotation.z=-t*.015;hex.rotation.y=t*.01+tx*.1;
      camera.position.x=Math.sin(t*.3)*.1+tx*.7;
      camera.position.y=.8+Math.cos(t*.2)*.05+ty*.6;
      camera.lookAt(tx*.4,ty*.2,0);
      renderer.render(scene,camera);
    };
    loop();
    return ()=>{cancelAnimationFrame(rid);ro.disconnect();window.removeEventListener("mousemove",onMM);renderer.dispose();};
  }, []);

  /* ── Send message ── */
  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    if (!user) { setAuthModal({open:true,tab:"login"}); return; }
    setInput(""); setSendError("");
    setMsgs((m) => [...m, { from:"user", text }]);
    setSending(true); flashRef.current = 0.9;
    try {
      const token = localStorage.getItem("bb_token") ?? "";
      const res = await fetch("/api/chat/nexus", {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body:JSON.stringify({ message:text, personality, language, tts: voice === "on" }),
      });
      const data = await res.json() as { reply?:string; audioBase64?:string; message?:string; limitReached?:boolean };
      if (!res.ok) {
        if (data.limitReached) { setMsgs((m)=>m.slice(0,-1)); setInput(text); setSendError("Daily message limit reached. Refer a friend for +20 bonus messages!"); }
        else { setSendError(data.message ?? "Something went wrong"); setMsgs((m)=>[...m,{from:"nexus",text:"Sorry, something went wrong. Please try again 🙏"}]); }
        return;
      }
      setMsgs((m) => [...m, { from:"nexus", text: data.reply ?? "" }]);
      if (voice === "on" && data.audioBase64) { playBase64Audio(data.audioBase64).catch(()=>{}); }
      refreshSidebar();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Something went wrong");
      setMsgs((m) => [...m, { from:"nexus", text:"Sorry, something went wrong. Please try again 🙏" }]);
    } finally { setSending(false); }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key==="Enter") { e.preventDefault(); void send(); } };
  const handleLogout = () => { logout(); setAvatarOpen(false); onNavigate("landing"); };
  const copyRef = () => {
    const code = user?.referralCode ?? limitStatus?.referralCode;
    if (!code) return;
    navigator.clipboard.writeText(code).then(()=>{ setRefCopied(true); setTimeout(()=>setRefCopied(false),2000); });
  };

  const loadSession = (s: Session) => { setActiveSessionId(s.id); setMsgs(s.messages.length ? s.messages : getSeed(personality)); };
  const deleteSession = (e: React.MouseEvent, s: Session) => {
    e.stopPropagation();
    setSessions((p) => p.filter((x) => x.id !== s.id));
    if (activeSessionId === s.id) { setActiveSessionId(null); setMsgs(getSeed(personality)); }
  };

  const usagePct = limitStatus && limitStatus.totalLimit > 0
    ? Math.min(100, Math.round((limitStatus.messagesUsed / limitStatus.totalLimit) * 100)) : 0;
  const refCode  = user?.referralCode ?? limitStatus?.referralCode ?? "";
  const connApps = user?.connectedApps ?? [];

  const filtered = sessions.filter((s) => !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const grouped: Record<string, Session[]> = {};
  for (const s of filtered) { const l = fmtDate(s.date); if (!grouped[l]) grouped[l] = []; grouped[l].push(s); }

  /* ── Render ── */
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="nx-root" onClick={() => avatarOpen && setAvatarOpen(false)}>

        {/* HEADER */}
        <header className="nx-header">
          <div className="nx-brand">
            <button className="nx-hdr-btn nx-hdr-btn--icon" onClick={()=>setLeftOpen((v)=>!v)} aria-label="Toggle sidebar">☰</button>
            <div className="nx-logo nx-hf">N</div>
            <span className="nx-brand-name nx-hf">{t(language,"nexusOs")}</span>
          </div>
          <div className="nx-telemetry nx-mono">
            <div className="nx-status-pill"><span className="nx-pulse-dot"/><span>{t(language,"systemActive")}</span></div>
            <span className="nx-clock">{clock}</span>
          </div>
          <div className="nx-hdr-actions">
            <ThemeSwitcher style={{ marginRight: 4 }} />
            {user ? (
              <div className="nx-avatar" title={user.name} onClick={(e)=>{e.stopPropagation();setAvatarOpen((v)=>!v);}}>
                {userInitial}
                {avatarOpen && (
                  <div className="nx-av-drop" onClick={(e)=>e.stopPropagation()}>
                    <div className="nx-drop-row" style={{borderBottom:"1px solid rgba(0,240,255,.1)",paddingBottom:10,marginBottom:4,cursor:"default"}}>
                      <span>👤</span>
                      <span>
                        <span style={{fontWeight:700,display:"block"}}>{user.name}</span>
                        <span style={{color:"rgba(232,249,255,.35)",fontSize:10}}>{user.email}</span>
                      </span>
                    </div>
                    <div className="nx-drop-row nx-drop-row--red" onClick={handleLogout}>⏻ Logout</div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="nx-hdr-btn" onClick={()=>setAuthModal({open:true,tab:"login"})}>{t(language,"logIn")}</button>
                <button className="nx-hdr-btn nx-hdr-btn--pink" onClick={()=>setAuthModal({open:true,tab:"signup"})}>{t(language,"signUp")}</button>
              </>
            )}
          </div>
        </header>

        {/* COCKPIT */}
        <div className="nx-cockpit">
          <canvas ref={canvasRef} className="nx-canvas"/>
          <div className="nx-aurora" aria-hidden="true">
            <div className="nx-orb nx-orb-1"/><div className="nx-orb nx-orb-2"/><div className="nx-orb nx-orb-3"/>
          </div>
          <div className="nx-sweep" aria-hidden="true"/>

          {/* LEFT SIDEBAR */}
          <aside className={`nx-left${leftOpen ? "" : " nx-left--closed"}`}>
            <div className="nx-left-scroll">
              <button className="nx-new-btn" onClick={()=>{setMsgs(getSeed(personality));setActiveSessionId(null);}}>
                ＋ {t(language,"newChat")}
              </button>

              <div className="nx-section-head">{t(language,"history")}</div>
              {user && (
                <input className="nx-search" placeholder={t(language,"search")}
                  value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)}/>
              )}
              {!user ? (
                <p className="nx-empty">Log in to see history</p>
              ) : filtered.length === 0 ? (
                <p className="nx-empty">{t(language,"noHistory")}</p>
              ) : Object.entries(grouped).map(([label, grp]) => (
                <div key={label}>
                  <div className="nx-date-label">{label}</div>
                  {grp.map((s) => (
                    <div key={s.id} className={`nx-hist-item${activeSessionId===s.id?" nx-hist-item--active":""}`} onClick={()=>loadSession(s)}>
                      <span className="nx-hist-dot"/>
                      <span className="nx-hist-text nx-mono">{s.title}</span>
                      <span className="nx-hist-del" onClick={(e)=>deleteSession(e,s)}>✕</span>
                    </div>
                  ))}
                </div>
              ))}

              <div className="nx-section-head">{t(language,"connectors")}</div>
              {ALL_APPS.map(({name,icon})=>(
                <div key={name} className="nx-app-row">
                  <span className={`nx-app-dot ${connApps.includes(name)?"nx-dot-on":"nx-dot-off"}`}/>
                  <span>{icon} {name}</span>
                </div>
              ))}

              <div className="nx-section-head">{t(language,"usageToday")}</div>
              {!user ? (
                <p className="nx-empty">Log in to see usage</p>
              ) : !limitStatus ? (
                <p className="nx-empty">Loading…</p>
              ) : (
                <>
                  <div className="nx-stat-row">
                    <span>Messages</span>
                    <span className="nx-stat-tag">{limitStatus.messagesUsed} / {limitStatus.totalLimit}</span>
                  </div>
                  <div className="nx-prog-bar"><div className="nx-prog-fill" style={{width:`${usagePct}%`}}/></div>
                  <div style={{fontSize:10,color:"rgba(57,255,20,.65)",marginBottom:4}}>{limitStatus.messagesLeft} left today</div>
                </>
              )}

              {user && (
                <>
                  <div className="nx-section-head">{t(language,"referralCode")}</div>
                  {refCode ? (
                    <div className="nx-ref-row">
                      <span className="nx-ref-code nx-mono">{refCode}</span>
                      <button className={`nx-ref-copy${refCopied?" nx-ref-copy--done":""}`} onClick={copyRef}>{refCopied?"✓":"Copy"}</button>
                    </div>
                  ) : <p className="nx-empty">Loading…</p>}
                </>
              )}
            </div>
          </aside>

          {/* CHAT CENTER */}
          <main className="nx-chat">
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
                      <div className="nx-bbl-name nx-hf">{personality==="kabir"?"KABIR":"MAYA"} ▷</div>
                      {m.text}
                    </div>
                  </div>
                )
              )}
              {busy && (
                <div className="nx-bbl-row">
                  <div className="nx-bbl-av">N</div>
                  <div className="nx-bbl">
                    <div className="nx-typing"><div className="nx-dot"/><div className="nx-dot"/><div className="nx-dot"/></div>
                  </div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            {sendError && (
              <div className="nx-err-bar">
                <span>⚠</span><span>{sendError}</span>
                <button className="nx-err-dismiss" onClick={()=>setSendError("")}>Dismiss</button>
              </div>
            )}

            <div className="nx-dock">
              <div className="nx-capsule">
                {voice === "on" && (
                  <button
                    className={`nx-ibtn nx-ibtn--mic${voiceHook.recording?" nx-rec":""}`}
                    onClick={()=>{if(!user){setAuthModal({open:true,tab:"login"});return;}voiceHook.toggleRecording();}}
                    disabled={voiceHook.processing||sending}
                    aria-label={voiceHook.recording?"Stop recording":"Voice input"}
                  >
                    {voiceHook.processing?"⏳":voiceHook.recording?"⏹":"🎤"}
                  </button>
                )}
                <input className="nx-input nx-mono" value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={onKey}
                  placeholder={user ? t(language,"placeholder") : t(language,"loginPrompt")} disabled={busy}/>
                <button className="nx-ibtn nx-ibtn--send" onClick={()=>void send()} disabled={busy||!input.trim()} aria-label="Send">▲</button>
              </div>
              {voice === "on" && (
                <div className="nx-freqs" aria-hidden="true">
                  {Array.from({length:14},(_,i)=>(
                    <div key={i} style={{height:`${5+Math.abs(Math.sin(i*0.9))*10}px`}}
                      className={`nx-freq${voiceHook.recording||voiceHook.processing?" nx-freq--active":""}`}/>
                  ))}
                </div>
              )}
            </div>
          </main>

          {/* RIGHT SIDEBAR */}
          <aside className="nx-right">
            {user ? (
              <div className="nx-prof-card">
                <div className="nx-prof-av">{userInitial}</div>
                <div className="nx-prof-name">{user.name}</div>
                <div className="nx-prof-mail nx-mono">{user.email}</div>
                <span className={`nx-plan-tag${isAdmin?" nx-plan-tag--admin":""}`}>
                  {isAdmin?"ADMIN":(user.plan??"FREE").toUpperCase()}
                </span>
              </div>
            ) : (
              <div className="nx-login-card">
                <div style={{fontSize:20,marginBottom:4}}>⚡</div>
                Log in to unlock all NEXUS features
                <button onClick={()=>setAuthModal({open:true,tab:"login"})}>{t(language,"logIn")}</button>
              </div>
            )}

            <div className="nx-stitle">{t(language,"voice")}</div>
            <div className="nx-tgl-group">
              <button className={`nx-tgl-opt${voice==="off"?" nx-tgl-opt--on":""}`} onClick={()=>setVoice("off")}>🔇 {t(language,"textOnly")}</button>
              <button className={`nx-tgl-opt${voice==="on"?" nx-tgl-opt--on":""}`} onClick={()=>setVoice("on")}>🔊 {t(language,"voiceOn")}</button>
            </div>

            <div className="nx-divider"/>

            <div className="nx-stitle">{t(language,"personality")}</div>
            <div className="nx-tgl-group">
              <button className={`nx-tgl-opt${personality==="maya"?" nx-tgl-opt--maya-on":""}`} onClick={()=>setPersonality("maya")}>🌸 MAYA</button>
              <button className={`nx-tgl-opt${personality==="kabir"?" nx-tgl-opt--kabir-on":""}`} onClick={()=>setPersonality("kabir")}>⚡ KABIR</button>
            </div>

            <div className="nx-divider"/>

            <div className="nx-stitle">{t(language,"language")}</div>
            <select className="nx-lang-sel" value={language} onChange={(e)=>setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label} — {l.native}</option>)}
            </select>

            {savedToast && <div className="nx-save-toast">✓ SAVED</div>}
            {savingPref && !savedToast && <div className="nx-save-toast nx-save-saving">Saving…</div>}
          </aside>
        </div>
      </div>

      <AuthModal open={authModal.open} defaultTab={authModal.tab}
        onClose={()=>setAuthModal((s)=>({...s,open:false}))}
        onSuccess={()=>setAuthModal((s)=>({...s,open:false}))}/>
    </>
  );
};
