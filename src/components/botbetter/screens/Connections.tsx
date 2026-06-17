import { useState } from "react";
import {
  MessageSquare, Zap, Globe, Briefcase, Smartphone, Bot, Code2,
  Copy, Check, Plus, Send, X, Loader2, Mail, Calendar, ChevronDown, ChevronUp,
} from "lucide-react";
import { ScreenKey } from "../TopNav";
import { DashShell } from "../DashShell";

const BASE = (import.meta.env.VITE_API_URL as string) ?? "";

async function apiPost(path: string, body: unknown) {
  const token = localStorage.getItem("bb_token");
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function apiGet(path: string) {
  const token = localStorage.getItem("bb_token");
  const r = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  return r.json();
}

/* ── Types ─────────────────────────────────────────────────────────────────── */
type Connector = {
  name: string;
  desc: string;
  color: string;
  letter: string;
  gradient?: string;
  connected: boolean;
  category: string;
};

/* ── Brand SVG paths (simpleicons.org, viewBox 0 0 24 24) ───────────────────
   Only major brands where the icon is more recognizable than the letter.      */
const BRAND_SVGS: Record<string, string> = {
  WhatsApp:
    "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",

  "WhatsApp Business":
    "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",

  Telegram:
    "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",

  Gmail:
    "M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z",

  Slack:
    "M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zm2.521-10.123a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z",

  Discord:
    "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z",

  Instagram:
    "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12c0 3.259.014 3.668.072 4.948.058 1.268.259 2.139.558 2.9.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.058 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.058-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.163 6.162 6.163 3.405 0 6.162-2.76 6.162-6.163 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z",

  YouTube:
    "M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z",

  "Twitter / X":
    "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",

  LinkedIn:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",

  GitHub:
    "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",

  Vercel:
    "M24 22.525H0l12-21.05 12 21.05z",

  Figma:
    "M5.809 23.994A5.993 5.993 0 0 0 11.8 18v-6H5.809a5.993 5.993 0 0 0 0 11.994zM.003 12.005a5.994 5.994 0 0 1 5.806-5.994H11.8V18H5.809A5.994 5.994 0 0 1 .003 12.005zm5.806-12A5.993 5.993 0 0 1 11.8 5.996V12H5.809a5.994 5.994 0 0 1 0-11.988zM11.8.006h5.992a5.994 5.994 0 0 1 0 11.988H11.8zm5.992 12a5.994 5.994 0 0 1 0 11.988 5.993 5.993 0 0 1-5.992-5.994V12.006z",

  ChatGPT:
    "M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0L4.001 14.06A4.5 4.5 0 0 1 2.34 7.896zm16.597 3.855l-5.843-3.369 2.02-1.168a.076.076 0 0 1 .071 0l4.817 2.797a4.5 4.5 0 0 1-.676 8.106v-5.678a.79.79 0 0 0-.389-.688zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.817-2.787a4.5 4.5 0 0 1 6.693 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z",

  Notion:
    "M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933z",
};

/* ── Category icons (Lucide) ────────────────────────────────────────────────── */
const CATEGORY_LUCIDE: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  Communication: MessageSquare,
  Productivity:  Zap,
  Social:        Globe,
  Business:      Briefcase,
  "Indian Apps": Smartphone,
  "AI Tools":    Bot,
  Developer:     Code2,
};

const CATEGORY_COLORS: Record<string, string> = {
  Communication: "#25D366",
  Productivity:  "#F59E0B",
  Social:        "#8B5CF6",
  Business:      "#3B82F6",
  "Indian Apps": "#EF4444",
  "AI Tools":    "#10B981",
  Developer:     "#6366F1",
};

const CategoryBadge = ({ category, size = 18 }: { category: string; size?: number }) => {
  const Icon = CATEGORY_LUCIDE[category];
  const color = CATEGORY_COLORS[category] ?? "#6C00FF";
  if (!Icon) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: Math.round(size * 0.33),
      background: color + "22", color, flexShrink: 0,
    }}>
      <Icon size={Math.round(size * 0.62)} strokeWidth={2.5} />
    </span>
  );
};

/* ── Connector data ─────────────────────────────────────────────────────────── */
const INITIAL_CONNECTORS: Connector[] = [
  // ── Communication
  { name: "WhatsApp",          desc: "Send & automate messages",             color: "#25D366", letter: "W",   connected: true,  category: "Communication" },
  { name: "WhatsApp Business", desc: "Business catalog & bulk messaging",    color: "#25D366", letter: "WB",  connected: false, category: "Communication" },
  { name: "Telegram",          desc: "Bot replies and channel automation",   color: "#2AABEE", letter: "T",   connected: false, category: "Communication" },
  { name: "Gmail",             desc: "Draft, send and triage emails",        color: "#EA4335", letter: "G",   connected: true,  category: "Communication" },
  { name: "Slack",             desc: "Team notifications & workflows",       color: "#4A154B", letter: "S",   connected: false, category: "Communication" },
  { name: "Discord",           desc: "Server management & bots",            color: "#5865F2", letter: "D",   connected: false, category: "Communication" },
  { name: "Signal",            desc: "Encrypted private messaging",         color: "#3A76F0", letter: "Si",  connected: false, category: "Communication" },
  { name: "Zoom",              desc: "Meeting scheduling & summaries",       color: "#2D8CFF", letter: "Zm",  connected: false, category: "Communication" },
  { name: "Google Meet",       desc: "Video calls & calendar sync",          color: "#00897B", letter: "GM",  connected: false, category: "Communication" },

  // ── Productivity
  { name: "Google Calendar",   desc: "Events, slots, and reminders",        color: "#4285F4", letter: "C",   connected: true,  category: "Productivity" },
  { name: "Google Drive",      desc: "File management and search",           color: "#0F9D58", letter: "Dr",  connected: false, category: "Productivity" },
  { name: "Notion",            desc: "Docs, wikis, and databases",          color: "#FFFFFF", letter: "N",   connected: false, category: "Productivity" },
  { name: "Microsoft Teams",   desc: "Team collaboration hub",              color: "#6264A7", letter: "T",   connected: false, category: "Productivity" },
  { name: "Trello",            desc: "Kanban boards & card automation",     color: "#0052CC", letter: "Tr",  connected: false, category: "Productivity" },
  { name: "Asana",             desc: "Task & project management",           color: "#F06A6A", letter: "As",  connected: false, category: "Productivity" },
  { name: "Jira",              desc: "Issue tracking & sprints",            color: "#0052CC", letter: "Ji",  connected: false, category: "Productivity" },
  { name: "Monday.com",        desc: "Visual work management",              color: "#FF3D57", letter: "Mo",  connected: false, category: "Productivity" },
  { name: "ClickUp",           desc: "All-in-one productivity suite",       color: "#7B68EE", letter: "CU",  connected: false, category: "Productivity" },
  { name: "Airtable",          desc: "Spreadsheet-database hybrid",         color: "#FFBF00", letter: "AT",  connected: false, category: "Productivity" },
  { name: "Figma",             desc: "Design file access & comments",       color: "#F24E1E", letter: "Fi",  connected: false, category: "Productivity" },
  { name: "Canva",             desc: "Create & edit designs with AI",       color: "#00C4CC", letter: "Cv",  connected: false, category: "Productivity" },

  // ── Social
  { name: "Instagram",         desc: "DMs, comments, and reels",           color: "#DD2A7B", gradient: "linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)", letter: "I",  connected: false, category: "Social" },
  { name: "YouTube",           desc: "Video data and analytics",           color: "#FF0000", letter: "Y",   connected: false, category: "Social" },
  { name: "Twitter / X",       desc: "Tweets, trends, and mentions",       color: "#000000", letter: "X",   connected: false, category: "Social" },
  { name: "LinkedIn",          desc: "Professional networking",            color: "#0077B5", letter: "in",  connected: false, category: "Social" },

  // ── Business
  { name: "Razorpay",          desc: "Payments and transactions",          color: "#3395FF", letter: "R",   connected: false, category: "Business" },
  { name: "Meesho",            desc: "Reseller store automation",          color: "#9B2D8E", letter: "M",   connected: false, category: "Business" },
  { name: "Amazon",            desc: "Orders and seller tools",            color: "#FF9900", letter: "A",   connected: false, category: "Business" },
  { name: "Zerodha",           desc: "Portfolio and trade alerts",         color: "#387ED1", letter: "Z",   connected: false, category: "Business" },

  // ── Indian Apps
  { name: "Paytm",             desc: "UPI payments & wallet management",   color: "#002970", letter: "Pay", connected: false, category: "Indian Apps" },
  { name: "PhonePe",           desc: "UPI transfers and bill payments",    color: "#5F259F", letter: "PP",  connected: false, category: "Indian Apps" },
  { name: "Google Pay",        desc: "GPay UPI & offers tracking",         color: "#4285F4", gradient: "linear-gradient(135deg,#4285F4,#34A853,#FBBC05,#EA4335)", letter: "G", connected: false, category: "Indian Apps" },
  { name: "BHIM UPI",          desc: "Direct bank UPI automation",         color: "#FF6B00", letter: "UPI", connected: false, category: "Indian Apps" },
  { name: "Flipkart",          desc: "Orders, tracking & deals",           color: "#2874F0", letter: "F",   connected: false, category: "Indian Apps" },
  { name: "Myntra",            desc: "Fashion orders & wishlist",          color: "#FF3F6C", letter: "Mn",  connected: false, category: "Indian Apps" },
  { name: "Swiggy",            desc: "Food orders and reordering",         color: "#FC8019", letter: "Sw",  connected: false, category: "Indian Apps" },
  { name: "Zomato",            desc: "Restaurant orders & reviews",        color: "#E23744", letter: "Zo",  connected: false, category: "Indian Apps" },
  { name: "Ola",               desc: "Ride bookings & history",            color: "#1C1C1C", letter: "Ola", connected: false, category: "Indian Apps" },
  { name: "Uber",              desc: "Rides, trips, and receipts",         color: "#000000", letter: "Ub",  connected: false, category: "Indian Apps" },

  // ── AI Tools
  { name: "ChatGPT",           desc: "OpenAI GPT-4 integration",           color: "#10A37F", letter: "GP",  connected: false, category: "AI Tools" },
  { name: "Claude",            desc: "Anthropic Claude AI models",         color: "#D97706", letter: "C",   connected: false, category: "AI Tools" },
  { name: "Perplexity",        desc: "AI-powered search engine",           color: "#6B46C1", letter: "Px",  connected: false, category: "AI Tools" },
  { name: "Codex / Copilot",   desc: "GitHub AI code assistant",           color: "#10B981", letter: "Cx",  connected: false, category: "AI Tools" },

  // ── Developer
  { name: "GitHub",            desc: "Repos, issues, and PRs",             color: "#24292e", letter: "GH",  connected: false, category: "Developer" },
  { name: "Vercel",            desc: "Deployments and previews",           color: "#000000", letter: "▲",   connected: false, category: "Developer" },
  { name: "Railway",           desc: "Cloud infra & deployments",          color: "#7C3AED", letter: "Rail",connected: false, category: "Developer" },
  { name: "Render",            desc: "Web services & static sites",        color: "#46E3B7", letter: "Rnd", connected: false, category: "Developer" },
  { name: "Netlify",           desc: "JAMstack & serverless deploys",      color: "#00C7B7", letter: "Net", connected: false, category: "Developer" },
  { name: "AWS",               desc: "Amazon cloud services",              color: "#FF9900", letter: "AWS", connected: false, category: "Developer" },
  { name: "Supabase",          desc: "Open-source Firebase alternative",   color: "#3ECF8E", letter: "SB",  connected: false, category: "Developer" },
  { name: "MongoDB Atlas",     desc: "Cloud database management",          color: "#47A248", letter: "MDB", connected: false, category: "Developer" },
  { name: "Webhook",           desc: "Custom HTTP integrations",           color: "#6C00FF", letter: "⚡",  connected: false, category: "Developer" },
];

const CATEGORIES = [
  "Communication", "Productivity", "Social", "Business",
  "Indian Apps",   "AI Tools",    "Developer",
];

/* ── BrandIcon ──────────────────────────────────────────────────────────────── */
const BrandIcon = ({
  name, color, letter, gradient, size = 48,
}: {
  name: string; color: string; letter: string; gradient?: string; size?: number;
}) => {
  const svgPath = BRAND_SVGS[name];
  const isLight = color === "#FFFFFF" || color === "#FF9900" || color === "#FFBF00";
  const iconColor = isLight ? "#111" : "#fff";

  return (
    <div
      style={{
        width: size, height: size, borderRadius: 12,
        background: gradient ?? color,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 4px 14px ${color === "#FFFFFF" || color === "#000000" ? "rgba(0,0,0,0.28)" : color + "40"}`,
        flexShrink: 0,
        border: color === "#FFFFFF" ? "1px solid rgba(0,0,0,0.10)" : "none",
      }}
    >
      {svgPath ? (
        <svg
          viewBox="0 0 24 24"
          fill={iconColor}
          style={{ width: size * 0.54, height: size * 0.54 }}
          aria-hidden="true"
        >
          <path d={svgPath} />
        </svg>
      ) : (
        <span style={{
          color: iconColor,
          fontWeight: 700,
          fontSize: letter.length > 2 ? size * 0.25 : size * 0.33,
          letterSpacing: "-0.5px",
          lineHeight: 1,
          fontFamily: "system-ui, sans-serif",
        }}>
          {letter}
        </span>
      )}
    </div>
  );
};

/* ── Action Panels ──────────────────────────────────────────────────────────── */
const WhatsAppPanel = ({ onClose }: { onClose: () => void }) => {
  const [to, setTo] = useState("");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const send = async () => {
    if (!to.trim() || !msg.trim()) return;
    setSending(true);
    const res = await apiPost("/api/connectors/whatsapp/send", { to: to.trim(), message: msg.trim() });
    setSending(false);
    setResult(res.success ? "✓ Message sent!" : `✕ ${res.message}`);
    if (res.success) { setTo(""); setMsg(""); }
  };

  return (
    <div className="bento-card border-[#25D366]/30 bg-[#25D366]/5 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[#25D366]" />
          <span className="text-sm font-bold text-foreground">Send WhatsApp Message</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      </div>
      <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="+91 98765 43210 (with country code)" className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium outline-none focus:border-[#25D366] transition" />
      <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} placeholder="Your message…" className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium outline-none focus:border-[#25D366] transition resize-none" />
      <div className="flex items-center gap-3">
        <button onClick={send} disabled={sending || !to.trim() || !msg.trim()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition" style={{ background: "#25D366" }}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
        </button>
        {result && <span className={`text-xs font-bold ${result.startsWith("✓") ? "text-emerald-400" : "text-red-400"}`}>{result}</span>}
      </div>
    </div>
  );
};

const GmailPanel = ({ onClose }: { onClose: () => void }) => {
  const [tab, setTab] = useState<"send" | "read">("send");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [emails, setEmails] = useState<{ id: string; from: string; subject: string; snippet: string; date: string }[]>([]);
  const [reading, setReading] = useState(false);

  const sendEmail = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) return;
    setSending(true);
    const res = await apiPost("/api/connectors/gmail/send", { to, subject, body });
    setSending(false);
    setResult(res.success ? "✓ Email sent!" : `✕ ${res.message}`);
    if (res.success) { setTo(""); setSubject(""); setBody(""); }
  };

  const readEmails = async () => {
    setReading(true);
    const res = await apiGet("/api/connectors/gmail/read");
    setReading(false);
    if (res.success) setEmails(res.emails || []);
    else setResult(`✕ ${res.message}`);
  };

  return (
    <div className="bento-card border-[#EA4335]/30 bg-[#EA4335]/5 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-[#EA4335]" />
          <span className="text-sm font-bold text-foreground">Gmail</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      </div>
      <div className="flex gap-2">
        {(["send", "read"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className="px-4 py-1.5 rounded-full text-xs font-bold transition capitalize" style={tab === t ? { background: "#EA4335", color: "#fff" } : { background: "hsl(var(--card))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}>
            {t === "send" ? "Compose" : "Read Inbox"}
          </button>
        ))}
      </div>
      {tab === "send" ? (
        <>
          <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="To (email address)" className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium outline-none focus:border-[#EA4335] transition" />
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium outline-none focus:border-[#EA4335] transition" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Email body…" className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium outline-none focus:border-[#EA4335] transition resize-none" />
          <div className="flex items-center gap-3">
            <button onClick={sendEmail} disabled={sending || !to || !subject || !body} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: "#EA4335" }}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
            </button>
            {result && <span className={`text-xs font-bold ${result.startsWith("✓") ? "text-emerald-400" : "text-red-400"}`}>{result}</span>}
          </div>
        </>
      ) : (
        <>
          <button onClick={readEmails} disabled={reading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: "#EA4335" }}>
            {reading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Load Latest Emails
          </button>
          <div className="space-y-2">
            {emails.map((em) => (
              <div key={em.id} className="rounded-xl border border-border bg-card p-3">
                <div className="text-xs font-bold text-foreground truncate">{em.subject}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{em.from}</div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{em.snippet}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const CalendarPanel = ({ onClose }: { onClose: () => void }) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [attendees, setAttendees] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const create = async () => {
    if (!title.trim() || !dateTime) return;
    setSaving(true);
    const startDateTime = new Date(dateTime).toISOString();
    const endDateTime = new Date(new Date(dateTime).getTime() + 3600000).toISOString();
    const res = await apiPost("/api/connectors/calendar/create", { title, description: desc, startDateTime, endDateTime, attendees });
    setSaving(false);
    setResult(res.success ? `✓ Event created!${res.event?.demo ? " (demo)" : ""}` : `✕ ${res.message}`);
    if (res.success) { setTitle(""); setDesc(""); setDateTime(""); setAttendees(""); }
  };

  return (
    <div className="bento-card border-[#4285F4]/30 bg-[#4285F4]/5 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#4285F4]" />
          <span className="text-sm font-bold text-foreground">Create Calendar Event</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium outline-none focus:border-[#4285F4] transition" />
      <input value={dateTime} onChange={(e) => setDateTime(e.target.value)} type="datetime-local" className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium outline-none focus:border-[#4285F4] transition" />
      <input value={attendees} onChange={(e) => setAttendees(e.target.value)} placeholder="Attendees (comma-separated emails, optional)" className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium outline-none focus:border-[#4285F4] transition" />
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="Description (optional)" className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium outline-none focus:border-[#4285F4] transition resize-none" />
      <div className="flex items-center gap-3">
        <button onClick={create} disabled={saving || !title.trim() || !dateTime} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: "#4285F4" }}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />} Create Event
        </button>
        {result && <span className={`text-xs font-bold ${result.startsWith("✓") ? "text-emerald-400" : "text-red-400"}`}>{result}</span>}
      </div>
    </div>
  );
};

const RequestModal = ({ onClose }: { onClose: () => void }) => {
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setSending(true);
    await apiPost("/api/connectors/request", { connectorName: name, reason });
    setSending(false);
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bento-card w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="text-center space-y-3 py-4">
            <div className="text-4xl">🙌</div>
            <div className="text-lg font-bold text-foreground">Request Submitted!</div>
            <p className="text-sm text-muted-foreground">We'll build {name} soon and notify you.</p>
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg,#6C00FF,#FF3CAC)" }}>Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">Request a Connector</span>
              <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Connector name (e.g. Notion, Stripe, Twilio)" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium outline-none focus:border-primary transition" />
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Why do you need it? (optional)" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium outline-none focus:border-primary transition resize-none" />
            <button onClick={submit} disabled={sending || !name.trim()} className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg,#6C00FF,#FF3CAC)" }}>
              {sending ? "Submitting…" : "Submit Request"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/* ── ConnectorCard — module-level (never re-defined on re-render) ─────────── */
const ConnectorCard = ({
  c,
  activePanel,
  setActivePanel,
  toggle,
}: {
  c: Connector;
  activePanel: string | null;
  setActivePanel: (v: string | null) => void;
  toggle: (name: string) => void;
}) => {
  const isActionable = c.connected && (c.name === "WhatsApp" || c.name === "Gmail" || c.name === "Google Calendar");
  const panelOpen = activePanel === c.name;

  return (
    <div className="space-y-2">
      <div className="bento-card p-5 flex flex-col hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <BrandIcon name={c.name} color={c.color} letter={c.letter} gradient={c.gradient} />
          {c.connected && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected
            </span>
          )}
        </div>
        <div className="text-[15px] font-bold text-foreground">{c.name}</div>
        <p className="text-sm text-muted-foreground mt-1 flex-1 leading-relaxed">{c.desc}</p>
        <div className="mt-4 flex gap-2">
          {isActionable ? (
            <button
              onClick={() => setActivePanel(panelOpen ? null : c.name)}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg,${c.color},${c.color}cc)`, border: "none", color: "#fff" }}
            >
              Use {panelOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <button
              onClick={() => toggle(c.name)}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all"
              style={
                c.connected
                  ? { background: "transparent", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }
                  : {
                      background: `linear-gradient(135deg,${c.color},${c.color}cc)`,
                      border: "none",
                      color: c.color === "#FFFFFF" || c.color === "#FF9900" || c.color === "#FFBF00" ? "#111" : "#fff",
                      boxShadow: `0 4px 12px ${c.color === "#000000" ? "rgba(0,0,0,0.3)" : c.color + "33"}`,
                    }
              }
            >
              {c.connected ? "Disconnect" : "Connect"}
            </button>
          )}
        </div>
      </div>
      {panelOpen && c.name === "WhatsApp" && <WhatsAppPanel onClose={() => setActivePanel(null)} />}
      {panelOpen && c.name === "Gmail" && <GmailPanel onClose={() => setActivePanel(null)} />}
      {panelOpen && c.name === "Google Calendar" && <CalendarPanel onClose={() => setActivePanel(null)} />}
    </div>
  );
};

/* ── Component ──────────────────────────────────────────────────────────────── */
export const Connections = ({
  active, onNavigate,
}: {
  active: ScreenKey; onNavigate: (s: ScreenKey) => void;
}) => {
  const [connectors, setConnectors] = useState<Connector[]>(INITIAL_CONNECTORS);
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [showRequest, setShowRequest] = useState(false);

  const toggle = (name: string) => {
    if (name === "WhatsApp" || name === "Gmail" || name === "Google Calendar") {
      setActivePanel((prev) => prev === name ? null : name);
    } else {
      setConnectors((prev) => prev.map((c) => c.name === name ? { ...c, connected: !c.connected } : c));
    }
  };

  const copy = (val: string) => {
    navigator.clipboard?.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const visibleCategories = activeCategory ? [activeCategory] : CATEGORIES;

  return (
    <>
    <DashShell active={active} onNavigate={onNavigate} title="Connectors">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">

        {/* Category filter tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
            style={
              activeCategory === null
                ? { background: "linear-gradient(135deg,#6C00FF,#FF3CAC)", color: "#fff", boxShadow: "0 4px 12px rgba(108,0,255,0.25)" }
                : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }
            }
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
              style={
                activeCategory === cat
                  ? { background: "linear-gradient(135deg,#6C00FF,#FF3CAC)", color: "#fff", boxShadow: "0 4px 12px rgba(108,0,255,0.25)" }
                  : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }
              }
            >
              <CategoryBadge category={cat} size={16} />
              {cat}
            </button>
          ))}
        </div>

        {/* Connector categories */}
        {visibleCategories.map((cat) => {
          const items = connectors.filter((c) => c.category === cat);
          if (items.length === 0) return null;
          return (
            <div key={cat}>
              <div className="mb-4 flex items-center gap-3">
                <CategoryBadge category={cat} size={32} />
                <div>
                  <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    {cat.toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold text-foreground leading-tight">{cat}</h3>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((c) => <ConnectorCard key={c.name} c={c} activePanel={activePanel} setActivePanel={setActivePanel} toggle={toggle} />)}
              </div>
            </div>
          );
        })}

        {/* API & Webhooks */}
        <div className="bento-card p-6 sm:p-8 bg-primary/5">
          <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-1">DEVELOPER ACCESS</div>
          <h3 className="text-2xl font-bold text-foreground mt-1">API & Webhooks</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Use Nexus from your own backend programmatically.
          </p>
          <div className="mt-8 space-y-6">
            <div>
              <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-2">API KEY</div>
              <div className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card px-4 py-3 shadow-sm">
                <code className="text-sm flex-1 truncate font-mono font-bold text-foreground">bb_live_sk_8f4x...92ab</code>
                <button
                  onClick={() => copy("bb_live_sk_8f4x92ab")}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-colors shrink-0"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-2">WEBHOOK URL</div>
              <div className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card px-4 py-3 shadow-sm">
                <code className="text-sm flex-1 truncate font-mono font-bold text-foreground">https://api.botbetter.ai/v1/hooks/u_a1b2</code>
                <button
                  onClick={() => copy("https://api.botbetter.ai/v1/hooks/u_a1b2")}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-colors shrink-0"
                >
                  <Copy className="h-4 w-4" /> Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Request a connector */}
        <div className="flex justify-center pb-4">
          <button
            onClick={() => setShowRequest(true)}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl border-2 border-dashed border-border text-sm font-bold text-muted-foreground hover:border-primary hover:text-primary transition-all hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Request a Connector
          </button>
        </div>

      </div>
    </DashShell>
    {showRequest && <RequestModal onClose={() => setShowRequest(false)} />}
    </>
  );
};
