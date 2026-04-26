export type Agent = {
  name: string;
  role: string;
  emoji: string;
  color: string;
  bg: string;
  desc: string;
};

export const agents: Agent[] = [
  { name: "Nexus", role: "Master Platform Agent", emoji: "⚡", color: "#7C6BFF", bg: "#1A1540", desc: "Jarvis of BotBetter — routes everything, connects all apps, executes tasks" },
  { name: "Buddy", role: "Personal Assistant", emoji: "🤖", color: "#7C6BFF", bg: "#1A1540", desc: "Remembers you, manages schedule, executes tasks 24/7" },
  { name: "Prepify", role: "Interview Coach", emoji: "🎤", color: "#1D9E75", bg: "#0A1F18", desc: "Mock interviews, real feedback in Hindi/English" },
  { name: "Sellio", role: "E-commerce AI", emoji: "🛒", color: "#D85A30", bg: "#1F1008", desc: "Meesho/Amazon listings, pricing, customer replies" },
  { name: "Creato", role: "Content Creator", emoji: "🎬", color: "#D4537E", bg: "#1F0A14", desc: "Reel ideas, YouTube scripts, viral captions" },
  { name: "Finio", role: "Finance AI", emoji: "💰", color: "#1D9E75", bg: "#0A1F18", desc: "Budget, SIP, tax saving — Indian finance expert" },
];
