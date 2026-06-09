import type { ScreenKey } from "./TopNav";

export const LANGUAGES = [
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "Hindi" },
  { code: "ur", label: "Urdu" },
  { code: "mr-IN", label: "Marathi" },
  { code: "bn-IN", label: "Bengali" },
  { code: "ta-IN", label: "Tamil" },
  { code: "te-IN", label: "Telugu" },
  { code: "gu-IN", label: "Gujarati" },
  { code: "pa-IN", label: "Punjabi" },
  { code: "kn-IN", label: "Kannada" },
  { code: "ml-IN", label: "Malayalam" },
];

export type ConnectorCategory =
  | "Communication"
  | "Productivity"
  | "Social"
  | "Business"
  | "Creative"
  | "Developer";

export type Connector = {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: ConnectorCategory;
};

export const CONNECTORS: Connector[] = [
  { id: "whatsapp", name: "WhatsApp", icon: "💬", description: "Send messages, automate replies, and manage customer chats.", category: "Communication" },
  { id: "gmail", name: "Gmail", icon: "✉️", description: "Draft, summarize, send, and triage email from Nexus.", category: "Communication" },
  { id: "calendar", name: "Google Calendar", icon: "📅", description: "Create events, find slots, and keep your day organized.", category: "Productivity" },
  { id: "telegram", name: "Telegram", icon: "📨", description: "Automate bot replies and group workflows.", category: "Communication" },
  { id: "slack", name: "Slack", icon: "💼", description: "Send team updates, alerts, and workflow notifications.", category: "Business" },
  { id: "instagram", name: "Instagram DM", icon: "📸", description: "Handle comments, DMs, creator replies, and lead capture.", category: "Social" },
  { id: "linkedin", name: "LinkedIn", icon: "🔗", description: "Draft posts, manage outreach, and summarize updates.", category: "Business" },
  { id: "notion", name: "Notion", icon: "📝", description: "Create pages, update databases, and search workspace notes.", category: "Productivity" },
  { id: "drive", name: "Google Drive", icon: "📁", description: "Find files, summarize documents, and organize folders.", category: "Productivity" },
  { id: "canva", name: "Canva", icon: "🎨", description: "Generate creative briefs and turn ideas into design tasks.", category: "Creative" },
  { id: "shopify", name: "Shopify", icon: "🛒", description: "Manage products, orders, customer updates, and sales tasks.", category: "Business" },
  { id: "github", name: "GitHub", icon: "💻", description: "Track issues, summarize pull requests, and create dev tasks.", category: "Developer" },
];

export type SidebarSession = {
  id: string;
  title: string;
  date: string;
  time: string;
  messages?: unknown[];
};

export const APP_DESTINATIONS: { key: ScreenKey; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "D" },
  { key: "connections", label: "Connectors", icon: "C" },
];
