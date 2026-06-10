const ApiUsage = require("../models/ApiUsage.model");

const PROVIDERS = {
  cracky: [
    {
      id: "gemini",
      type: "gemini",
      model: "gemini-2.0-flash",
      apiKey: () => process.env.GEMINI_CRACKY,
      dailyLimit: 1500,
      limitType: "requests",
    },
    {
      id: "groq",
      type: "groq",
      model: "llama-3.1-8b-instant",
      apiKey: () => process.env.GROQ_CRACKY,
      dailyLimit: 500000,
      limitType: "tokens",
    },
    {
      id: "mistral",
      type: "mistral",
      model: "mistral-small-latest",
      apiKey: () => process.env.MISTRAL_CRACKY,
      dailyLimit: null,
      limitType: "requests",
    },
    {
      id: "together",
      type: "together",
      model: "meta-llama/Llama-3-8b-chat-hf",
      apiKey: () => process.env.TOGETHER_CRACKY,
      dailyLimit: null,
      oneTimeCredit: true,
    },
    {
      id: "deepseek",
      type: "deepseek",
      model: "deepseek-chat",
      apiKey: () => process.env.DEEPSEEK_CRACKY,
      dailyLimit: null,
      oneTimeCredit: true,
    },
  ],
  sellio: [
    {
      id: "gemini",
      type: "gemini",
      model: "gemini-2.0-flash",
      apiKey: () => process.env.GEMINI_SELLIO,
      dailyLimit: 1500,
      limitType: "requests",
    },
    {
      id: "groq",
      type: "groq",
      model: "llama-3.1-8b-instant",
      apiKey: () => process.env.GROQ_SELLIO,
      dailyLimit: 500000,
      limitType: "tokens",
    },
    {
      id: "mistral",
      type: "mistral",
      model: "mistral-small-latest",
      apiKey: () => process.env.MISTRAL_SELLIO,
      dailyLimit: null,
      limitType: "requests",
    },
    {
      id: "together",
      type: "together",
      model: "meta-llama/Llama-3-8b-chat-hf",
      apiKey: () => process.env.TOGETHER_SELLIO,
      dailyLimit: null,
      oneTimeCredit: true,
    },
    {
      id: "deepseek",
      type: "deepseek",
      model: "deepseek-chat",
      apiKey: () => process.env.DEEPSEEK_SELLIO,
      dailyLimit: null,
      oneTimeCredit: true,
    },
  ],

  buddy: [
    {
      id: "gemini",
      type: "gemini",
      model: "gemini-2.0-flash",
      apiKey: () => process.env.GEMINI_BUDDY,
      dailyLimit: 1500,
      limitType: "requests",
    },
    {
      id: "groq",
      type: "groq",
      model: "llama-3.1-8b-instant",
      apiKey: () => process.env.GROQ_BUDDY,
      dailyLimit: 500000,
      limitType: "tokens",
    },
    {
      id: "mistral",
      type: "mistral",
      model: "mistral-small-latest",
      apiKey: () => process.env.MISTRAL_BUDDY,
      dailyLimit: null,
      limitType: "requests",
    },
    {
      id: "deepseek",
      type: "deepseek",
      model: "deepseek-chat",
      apiKey: () => process.env.DEEPSEEK_BUDDY,
      dailyLimit: null,
      oneTimeCredit: true,
    },
  ],

  finio: [
    {
      id: "gemini",
      type: "gemini",
      model: "gemini-2.0-flash",
      apiKey: () => process.env.GEMINI_FINIO,
      dailyLimit: 1500,
      limitType: "requests",
    },
    {
      id: "groq",
      type: "groq",
      model: "llama-3.1-8b-instant",
      apiKey: () => process.env.GROQ_FINIO,
      dailyLimit: 500000,
      limitType: "tokens",
    },
    {
      id: "mistral",
      type: "mistral",
      model: "mistral-small-latest",
      apiKey: () => process.env.MISTRAL_FINIO,
      dailyLimit: null,
      limitType: "requests",
    },
    {
      id: "deepseek",
      type: "deepseek",
      model: "deepseek-chat",
      apiKey: () => process.env.DEEPSEEK_FINIO,
      dailyLimit: null,
      oneTimeCredit: true,
    },
  ],

  prepify: [
    {
      id: "gemini",
      type: "gemini",
      model: "gemini-2.0-flash",
      apiKey: () => process.env.GEMINI_PREPIFY,
      dailyLimit: 1500,
      limitType: "requests",
    },
    {
      id: "groq",
      type: "groq",
      model: "llama-3.1-8b-instant",
      apiKey: () => process.env.GROQ_PREPIFY,
      dailyLimit: 500000,
      limitType: "tokens",
    },
    {
      id: "mistral",
      type: "mistral",
      model: "mistral-small-latest",
      apiKey: () => process.env.MISTRAL_PREPIFY,
      dailyLimit: null,
      limitType: "requests",
    },
    {
      id: "deepseek",
      type: "deepseek",
      model: "deepseek-chat",
      apiKey: () => process.env.DEEPSEEK_PREPIFY,
      dailyLimit: null,
      oneTimeCredit: true,
    },
  ],

  flexai: [
    {
      id: "gemini",
      type: "gemini",
      model: "gemini-2.0-flash",
      apiKey: () => process.env.GEMINI_FLEXAI,
      dailyLimit: 1500,
      limitType: "requests",
    },
    {
      id: "groq",
      type: "groq",
      model: "llama-3.1-8b-instant",
      apiKey: () => process.env.GROQ_FLEXAI,
      dailyLimit: 500000,
      limitType: "tokens",
    },
    {
      id: "mistral",
      type: "mistral",
      model: "mistral-small-latest",
      apiKey: () => process.env.MISTRAL_FLEXAI,
      dailyLimit: null,
      limitType: "requests",
    },
    {
      id: "deepseek",
      type: "deepseek",
      model: "deepseek-chat",
      apiKey: () => process.env.DEEPSEEK_FLEXAI,
      dailyLimit: null,
      oneTimeCredit: true,
    },
  ],

  creato: [
    {
      id: "gemini",
      type: "gemini",
      model: "gemini-2.0-flash",
      apiKey: () => process.env.GEMINI_CREATO,
      dailyLimit: 1500,
      limitType: "requests",
    },
    {
      id: "groq",
      type: "groq",
      model: "llama-3.1-8b-instant",
      apiKey: () => process.env.GROQ_CREATO,
      dailyLimit: 500000,
      limitType: "tokens",
    },
    {
      id: "mistral",
      type: "mistral",
      model: "mistral-small-latest",
      apiKey: () => process.env.MISTRAL_CREATO,
      dailyLimit: null,
      limitType: "requests",
    },
    {
      id: "deepseek",
      type: "deepseek",
      model: "deepseek-chat",
      apiKey: () => process.env.DEEPSEEK_CREATO,
      dailyLimit: null,
      oneTimeCredit: true,
    },
  ],

  // ─── NEXUS — smart routing + full 26-key fallback pool ──────────────────────
  nexus: [
    // Primary dedicated keys with smart query-type tags
    {
      id: "gemini",
      type: "gemini",
      model: "gemini-2.0-flash",
      apiKey: () => process.env.GEMINI_NEXUS,
      dailyLimit: 1500,
      limitType: "requests",
      queryTypes: ["english"],
    },
    {
      id: "together",
      type: "together",
      model: "Qwen/Qwen2.5-72B-Instruct-Turbo",
      apiKey: () => process.env.TOGETHER_NEXUS,
      dailyLimit: null,
      queryTypes: ["hindi_urdu"],
    },
    {
      id: "groq-70b",
      type: "groq",
      model: "llama-3.3-70b-versatile",
      apiKey: () => process.env.GROQ_NEXUS,
      dailyLimit: 200000,
      limitType: "tokens",
      queryTypes: ["complex"],
    },
    {
      id: "groq",
      type: "groq",
      model: "llama-3.1-8b-instant",
      apiKey: () => process.env.GROQ_NEXUS,
      dailyLimit: 500000,
      limitType: "tokens",
    },
    {
      id: "mistral",
      type: "mistral",
      model: "mistral-small-latest",
      apiKey: () => process.env.MISTRAL_NEXUS,
      dailyLimit: null,
      limitType: "requests",
    },
    {
      id: "deepseek",
      type: "deepseek",
      model: "deepseek-chat",
      apiKey: () => process.env.DEEPSEEK_NEXUS,
      dailyLimit: null,
      oneTimeCredit: true,
    },
    // ── Fallback pool: all other agent keys (auto-rotate when primary exhausted) ──
    { id: "gemini-buddy",    type: "gemini",  model: "gemini-2.0-flash",        apiKey: () => process.env.GEMINI_BUDDY,    dailyLimit: null },
    { id: "groq-buddy",      type: "groq",    model: "llama-3.1-8b-instant",    apiKey: () => process.env.GROQ_BUDDY,      dailyLimit: null },
    { id: "mistral-buddy",   type: "mistral", model: "mistral-small-latest",    apiKey: () => process.env.MISTRAL_BUDDY,   dailyLimit: null },
    { id: "gemini-cracky",   type: "gemini",  model: "gemini-2.0-flash",        apiKey: () => process.env.GEMINI_CRACKY,   dailyLimit: null },
    { id: "groq-cracky",     type: "groq",    model: "llama-3.1-8b-instant",    apiKey: () => process.env.GROQ_CRACKY,     dailyLimit: null },
    { id: "mistral-cracky",  type: "mistral", model: "mistral-small-latest",    apiKey: () => process.env.MISTRAL_CRACKY,  dailyLimit: null },
    { id: "gemini-sellio",   type: "gemini",  model: "gemini-2.0-flash",        apiKey: () => process.env.GEMINI_SELLIO,   dailyLimit: null },
    { id: "groq-sellio",     type: "groq",    model: "llama-3.1-8b-instant",    apiKey: () => process.env.GROQ_SELLIO,     dailyLimit: null },
    { id: "mistral-sellio",  type: "mistral", model: "mistral-small-latest",    apiKey: () => process.env.MISTRAL_SELLIO,  dailyLimit: null },
    { id: "gemini-finio",    type: "gemini",  model: "gemini-2.0-flash",        apiKey: () => process.env.GEMINI_FINIO,    dailyLimit: null },
    { id: "groq-finio",      type: "groq",    model: "llama-3.1-8b-instant",    apiKey: () => process.env.GROQ_FINIO,      dailyLimit: null },
    { id: "mistral-finio",   type: "mistral", model: "mistral-small-latest",    apiKey: () => process.env.MISTRAL_FINIO,   dailyLimit: null },
    { id: "gemini-prepify",  type: "gemini",  model: "gemini-2.0-flash",        apiKey: () => process.env.GEMINI_PREPIFY,  dailyLimit: null },
    { id: "groq-prepify",    type: "groq",    model: "llama-3.1-8b-instant",    apiKey: () => process.env.GROQ_PREPIFY,    dailyLimit: null },
    { id: "mistral-prepify", type: "mistral", model: "mistral-small-latest",    apiKey: () => process.env.MISTRAL_PREPIFY, dailyLimit: null },
    { id: "gemini-flexai",   type: "gemini",  model: "gemini-2.0-flash",        apiKey: () => process.env.GEMINI_FLEXAI,   dailyLimit: null },
    { id: "groq-flexai",     type: "groq",    model: "llama-3.1-8b-instant",    apiKey: () => process.env.GROQ_FLEXAI,     dailyLimit: null },
    { id: "mistral-flexai",  type: "mistral", model: "mistral-small-latest",    apiKey: () => process.env.MISTRAL_FLEXAI,  dailyLimit: null },
    { id: "gemini-creato",   type: "gemini",  model: "gemini-2.0-flash",        apiKey: () => process.env.GEMINI_CREATO,   dailyLimit: null },
    { id: "groq-creato",     type: "groq",    model: "llama-3.1-8b-instant",    apiKey: () => process.env.GROQ_CREATO,     dailyLimit: null },
    { id: "mistral-creato",  type: "mistral", model: "mistral-small-latest",    apiKey: () => process.env.MISTRAL_CREATO,  dailyLimit: null },
  ],
};

// ─── Smart query-type detection ──────────────────────────────────────────────

function detectQueryType(message) {
  if (!message) return "english";
  // Devanagari (Hindi/Marathi) or Arabic script (Urdu)
  if (/[ऀ-ॿ؀-ۿ]/.test(message)) return "hindi_urdu";
  // Complex: long, multi-question, or analytical/technical keywords
  if (
    message.length > 200 ||
    (message.match(/\?/g) || []).length > 1 ||
    /\b(code|debug|algorithm|explain|analyze|compare|difference|implement|architecture|why does|how does|what is the difference|step[- ]by[- ]step)\b/i.test(message)
  ) return "complex";
  return "english";
}

// Returns providers in priority order, filtering those over daily limit.
// For Nexus, applies smart query-type routing when userMessage is provided.
async function getOrderedProviders(agentName, userMessage = "") {
  const providers = PROVIDERS[agentName];
  if (!providers) throw new Error(`Unknown agent: ${agentName}`);

  const available = [];
  for (const provider of providers) {
    const key = provider.apiKey();
    if (!key) {
      console.log(`[Router] ${provider.id}/${agentName}: no API key, skipping`);
      continue;
    }

    if (!provider.dailyLimit) {
      available.push(provider);
      continue;
    }

    const usage = await ApiUsage.getUsage(provider.id, agentName);
    const used = provider.limitType === "tokens" ? usage.tokensUsed : usage.requestsUsed;

    if (used < provider.dailyLimit) {
      available.push(provider);
    } else {
      console.log(
        `[Router] ${provider.id}/${agentName}: limit reached (${used}/${provider.dailyLimit} ${provider.limitType})`
      );
    }
  }

  // Smart routing: promote best-fit provider to front for Nexus queries
  if (agentName === "nexus" && userMessage) {
    const queryType = detectQueryType(userMessage);
    const preferred = available.filter((p) => p.queryTypes?.includes(queryType));
    const rest      = available.filter((p) => !p.queryTypes?.includes(queryType));
    if (preferred.length) {
      console.log(`[Router] nexus smart routing: ${queryType} → ${preferred[0].id} (${preferred[0].model})`);
    }
    return [...preferred, ...rest];
  }

  return available;
}

async function getUsageSummary() {
  const today = ApiUsage.getISTDate();
  const records = await ApiUsage.getTodayAll();

  const summary = {};
  for (const [agentName, providers] of Object.entries(PROVIDERS)) {
    summary[agentName] = { date: today, providers: [] };

    for (const provider of providers) {
      const record = records.find(
        (r) => r.providerId === provider.id && r.agentName === agentName
      );
      const requestsUsed = record?.requestsUsed || 0;
      const tokensUsed = record?.tokensUsed || 0;

      let remaining = null;
      let status = "available";

      if (provider.dailyLimit) {
        const used = provider.limitType === "tokens" ? tokensUsed : requestsUsed;
        remaining = provider.dailyLimit - used;
        status = remaining <= 0 ? "exhausted" : "available";
      } else {
        status = provider.oneTimeCredit ? "credit" : "rate-limited";
      }

      summary[agentName].providers.push({
        id: provider.id,
        model: provider.model,
        dailyLimit: provider.dailyLimit,
        limitType: provider.limitType || null,
        requestsUsed,
        tokensUsed,
        remaining,
        status,
        hasKey: !!provider.apiKey(),
      });
    }

    // Determine active provider (first available with a key)
    const active = summary[agentName].providers.find(
      (p) => p.hasKey && p.status !== "exhausted"
    );
    summary[agentName].activeProvider = active?.id || "none";
  }

  return summary;
}

module.exports = { PROVIDERS, getOrderedProviders, getUsageSummary, detectQueryType };
