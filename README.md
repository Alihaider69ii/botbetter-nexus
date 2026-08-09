# NEXUS BotBetter - Alihaider Qureshi
 
> India's first single-AI agentic platform — pick a niche, get a dedicated AI agent that actually does the work, not just talks about it.

🔗 **Live:** [botbetter-nexus.vercel.app](https://botbetter-nexus.vercel.app)
🛠️ **Backend:** [botbetter-backend.onrender.com](https://botbetter-backend.onrender.com)

---

## 🚀 What is NEXUS?

Most AI tools give you a chatbot. NEXUS gives you an **agent that works on your behalf**.

Instead of juggling ten different AI tools, you pick your niche — NEET prep, fashion styling, tutoring, whatever — and NEXUS spins up a dedicated agent for it. It's one core AI (Jarvis/Friday-style, not a swarm of disconnected bots) with two personalities:

- **Maya** — warm, conversational
- **Kabir** — precise, no-nonsense

If your niche doesn't exist yet, you can create a custom agent for it. Designed around a pay-per-use model — by the hour, by the month, or custom.

## 🧠 How it thinks

NEXUS doesn't brute-force every query through one LLM. It routes through a pool of provider APIs (Gemini, Groq, Mistral, Together AI, DeepSeek) and picks the right model for the job:

| Query type | Routed to |
|---|---|
| Hindi / Urdu | Qwen 2.5 |
| Real-time / current events | DeepSeek |
| General queries | Gemini Flash |
| Complex reasoning | Groq |

Backed by live global RAG (Tavily + ChromaDB), refreshed on a schedule — so answers aren't stuck on a training cutoff.

## ✨ Features

- Single conversational AI with two selectable personalities (voice + tone)
- Smart multi-provider model routing based on query type
- Live, self-refreshing RAG pipeline for current information
- Google OAuth + JWT authentication
- Simultaneous multi-task execution (ask NEXUS to do more than one thing at once)
- Connector framework for integrating external tools/services

## 🔌 Connectors

NEXUS ships with a connectors framework so the agent can eventually act across the tools you already use. 50+ apps are listed in the Connectors page, grouped by category:

- **Communication:** WhatsApp, WhatsApp Business, Gmail, Telegram, Slack, Discord, Signal, Zoom, Google Meet
- **Productivity:** Google Calendar, Google Drive, Notion, Microsoft Teams, Trello, Asana, Jira, Monday, ClickUp, Airtable, Figma, Canva
- **Social:** Instagram, YouTube, Twitter/X, LinkedIn
- **Indian Apps:** Paytm, PhonePe, Google Pay, BHIM, Flipkart, Myntra, Swiggy, Zomato, Ola, Uber
- **Business:** Razorpay, Meesho, Amazon, Zerodha
- **AI Tools:** Claude Code, Codex, ChatGPT, Perplexity
- **Developer:** GitHub, Vercel, Railway, Render, Netlify, AWS, Supabase, MongoDB Atlas

Each connector has its own brand color, connect button, and status badge. Actual OAuth/API integrations are being built out incrementally — most are functional placeholders today.

## 🏗️ Tech Stack

**Frontend:** React + Vite + Tailwind CSS
**Backend:** Node.js + Express
**Database:** MongoDB Atlas
**Auth:** JWT + Google OAuth
**AI Layer:** Multi-provider LLM routing (Gemini, Groq, Mistral, Together AI, DeepSeek), Sarvam AI for voice (STT/TTS)
**RAG:** Tavily API + ChromaDB
**Hosting:** Vercel (frontend), Render (backend)

## 📁 Project Structure

```
botbetter-nexus/
├── src/                  # Frontend (React + Vite)
│   ├── components/
│   ├── pages/
│   └── ...
├── botbetter-backend/    # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   └── ...
│   └── .env.example
└── .env.example
```

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- API keys for at least one LLM provider (Gemini/Groq/Mistral/Together AI/DeepSeek)
- Google OAuth credentials
- Sarvam AI API key (for voice features)
- Tavily API key (for RAG)

### Setup

```bash
# Clone the repo
git clone https://github.com/Alihaider69ii/botbetter-nexus.git
cd botbetter-nexus

# Install frontend dependencies
npm install

# Install backend dependencies
cd botbetter-backend
npm install
cd ..

# Set up environment variables
cp .env.example .env
cp botbetter-backend/.env.example botbetter-backend/.env
# Fill in your own values in both .env files

# Run frontend
npm run dev

# Run backend (in a separate terminal)
cd botbetter-backend
npm run dev
```

## 🔐 Environment Variables

See `.env.example` (frontend) and `botbetter-backend/.env.example` (backend) for the full list of required variables. None of these are included in this repo — you'll need your own API keys for each provider.

## 🗺️ Roadmap

- [ ] Jarvis-style hologram UI with hand gesture control
- [ ] Improved RAG quality and source coverage
- [ ] Real connector integrations (beyond framework)
- [ ] LangChain/LangGraph agent orchestration
- [ ] Public beta launch

## 👋 About

Built solo as a personal experiment in what an agentic AI platform could look like beyond the "chatbot with a nicer UI" pattern. Currently in active development.

## 📄 License

MIT License — free to use, modify, and share with credit. See `LICENSE` file.