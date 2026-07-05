const ApiUsage = require("../models/ApiUsage.model");

const JARVIS_USAGE_SCOPE = "jarvis";

const LIMITS = {
  gemini: { dailyLimit: 1500, limitType: "requests" },
  groq: { dailyLimit: 500000, limitType: "tokens" },
  mistral: { dailyLimit: null, limitType: "requests" },
  together: { dailyLimit: null, limitType: "requests" },
  deepseek: { dailyLimit: null, limitType: "requests" },
};

const JARVIS_POOL = [
  { provider: "gemini", key: process.env.GEMINI_NEXUS, model: "gemini-1.5-flash", keyName: "GEMINI_NEXUS" },
  { provider: "gemini", key: process.env.GEMINI_CRACKY, model: "gemini-1.5-flash", keyName: "GEMINI_CRACKY" },
  { provider: "gemini", key: process.env.GEMINI_SELLIO, model: "gemini-1.5-flash", keyName: "GEMINI_SELLIO" },
  { provider: "gemini", key: process.env.GEMINI_BUDDY, model: "gemini-1.5-flash", keyName: "GEMINI_BUDDY" },
  { provider: "gemini", key: process.env.GEMINI_PREPIFY, model: "gemini-1.5-flash", keyName: "GEMINI_PREPIFY" },
  { provider: "gemini", key: process.env.GEMINI_FLEXAI, model: "gemini-1.5-flash", keyName: "GEMINI_FLEXAI" },
  { provider: "gemini", key: process.env.GEMINI_CREATO, model: "gemini-1.5-flash", keyName: "GEMINI_CREATO" },
  { provider: "gemini", key: process.env.GEMINI_FINIO, model: "gemini-1.5-flash", keyName: "GEMINI_FINIO" },
  { provider: "groq", key: process.env.GROQ_NEXUS, model: "qwen-qwq-32b", keyName: "GROQ_NEXUS" },
  { provider: "groq", key: process.env.GROQ_CRACKY, model: "qwen-qwq-32b", keyName: "GROQ_CRACKY" },
  { provider: "groq", key: process.env.GROQ_SELLIO, model: "qwen-qwq-32b", keyName: "GROQ_SELLIO" },
  { provider: "groq", key: process.env.GROQ_BUDDY, model: "qwen-qwq-32b", keyName: "GROQ_BUDDY" },
  { provider: "groq", key: process.env.GROQ_PREPIFY, model: "qwen-qwq-32b", keyName: "GROQ_PREPIFY" },
  { provider: "groq", key: process.env.GROQ_FLEXAI, model: "qwen-qwq-32b", keyName: "GROQ_FLEXAI" },
  { provider: "groq", key: process.env.GROQ_CREATO, model: "qwen-qwq-32b", keyName: "GROQ_CREATO" },
  { provider: "groq", key: process.env.GROQ_FINIO, model: "qwen-qwq-32b", keyName: "GROQ_FINIO" },
  { provider: "mistral", key: process.env.MISTRAL_NEXUS, model: "mistral-small-latest", keyName: "MISTRAL_NEXUS" },
  { provider: "mistral", key: process.env.MISTRAL_CRACKY, model: "mistral-small-latest", keyName: "MISTRAL_CRACKY" },
  { provider: "mistral", key: process.env.MISTRAL_SELLIO, model: "mistral-small-latest", keyName: "MISTRAL_SELLIO" },
  { provider: "mistral", key: process.env.MISTRAL_PREPIFY, model: "mistral-small-latest", keyName: "MISTRAL_PREPIFY" },
  { provider: "mistral", key: process.env.MISTRAL_FLEXAI, model: "mistral-small-latest", keyName: "MISTRAL_FLEXAI" },
  { provider: "mistral", key: process.env.MISTRAL_CREATO, model: "mistral-small-latest", keyName: "MISTRAL_CREATO" },
  { provider: "mistral", key: process.env.MISTRAL_FINIO, model: "mistral-small-latest", keyName: "MISTRAL_FINIO" },
  { provider: "together", key: process.env.TOGETHER_NEXUS, model: "Qwen/Qwen2.5-72B-Instruct-Turbo", keyName: "TOGETHER_NEXUS" },
  { provider: "deepseek", key: process.env.DEEPSEEK_NEXUS, model: "deepseek-chat", keyName: "DEEPSEEK_NEXUS" },
];

const PROVIDERS = {
  jarvis: JARVIS_POOL,
  nexus: JARVIS_POOL,
  cracky: JARVIS_POOL,
  sellio: JARVIS_POOL,
  buddy: JARVIS_POOL,
  finio: JARVIS_POOL,
  prepify: JARVIS_POOL,
  flexai: JARVIS_POOL,
  creato: JARVIS_POOL,
};

function detectQueryType(message = "") {
  if (/[\u0900-\u097F\u0600-\u06FF]/.test(message)) return "hindi_urdu";
  if (/\b(today|latest|current|live|breaking|news|score|weather|stock|crypto|price|election|result|market|now)\b/i.test(message)) {
    return "real_time";
  }
  if (
    message.length > 200 ||
    (message.match(/\?/g) || []).length > 1 ||
    /\b(code|debug|algorithm|analyze|compare|architecture|implement|strategy|reasoning|derive|optimize|complex)\b/i.test(message)
  ) {
    return "complex";
  }
  return "general";
}

function queryProviderPreference(queryType) {
  if (queryType === "hindi_urdu") return ["together", "gemini", "groq", "deepseek", "mistral"];
  if (queryType === "real_time") return ["deepseek", "gemini", "groq", "together", "mistral"];
  if (queryType === "complex") return ["groq", "gemini", "together", "deepseek", "mistral"];
  return ["gemini", "groq", "mistral", "together", "deepseek"];
}

function normalizeProvider(entry) {
  const limits = LIMITS[entry.provider] || {};
  return {
    id: entry.keyName,
    type: entry.provider,
    provider: entry.provider,
    model: entry.model,
    dailyLimit: limits.dailyLimit,
    limitType: limits.limitType || "requests",
    usageScope: JARVIS_USAGE_SCOPE,
    apiKey: () => process.env[entry.keyName] || entry.key,
  };
}

function usedForLimit(provider, usage) {
  return provider.limitType === "tokens" ? usage.tokensUsed : usage.requestsUsed;
}

async function withUsage(provider) {
  if (!provider.dailyLimit) {
    return { ...provider, remaining: Number.MAX_SAFE_INTEGER, status: "available" };
  }

  const usage = await ApiUsage.getUsage(provider.id, provider.usageScope);
  const used = usedForLimit(provider, usage);
  const remaining = provider.dailyLimit - used;

  return {
    ...provider,
    requestsUsed: usage.requestsUsed,
    tokensUsed: usage.tokensUsed,
    remaining,
    status: remaining > 0 ? "available" : "exhausted",
  };
}

async function getOrderedProviders(agentName, userMessage = "") {
  const pool = PROVIDERS[agentName] || PROVIDERS.jarvis;
  const queryType = detectQueryType(userMessage);
  const preference = queryProviderPreference(queryType);
  const hydrated = [];

  for (const entry of pool) {
    const provider = normalizeProvider(entry);
    if (!provider.apiKey()) {
      console.log(`[Router] ${provider.id}: no API key, skipping`);
      continue;
    }

    const usageAware = await withUsage(provider);
    if (usageAware.status === "exhausted") {
      console.log(`[Router] ${provider.id}: limit reached`);
      continue;
    }
    hydrated.push(usageAware);
  }

  hydrated.sort((a, b) => {
    const providerRank = preference.indexOf(a.type) - preference.indexOf(b.type);
    if (providerRank !== 0) return providerRank;
    return (b.remaining || 0) - (a.remaining || 0);
  });

  if (hydrated[0]) {
    console.log(`[Router] ${agentName} ${queryType} -> ${hydrated[0].id} (${hydrated[0].model})`);
  }

  return hydrated;
}

async function getUsageSummary() {
  const today = ApiUsage.getISTDate();
  const records = await ApiUsage.getTodayAll();
  const providers = [];

  for (const entry of JARVIS_POOL) {
    const provider = normalizeProvider(entry);
    const record = records.find((r) => r.providerId === provider.id && r.agentName === provider.usageScope);
    const requestsUsed = record?.requestsUsed || 0;
    const tokensUsed = record?.tokensUsed || 0;
    const used = provider.limitType === "tokens" ? tokensUsed : requestsUsed;
    const remaining = provider.dailyLimit ? provider.dailyLimit - used : null;

    providers.push({
      id: provider.id,
      provider: provider.provider,
      model: provider.model,
      dailyLimit: provider.dailyLimit,
      limitType: provider.limitType,
      requestsUsed,
      tokensUsed,
      remaining,
      status: provider.dailyLimit && remaining <= 0 ? "exhausted" : "available",
      hasKey: !!provider.apiKey(),
    });
  }

  return {
    jarvis: {
      date: today,
      resetTimezone: "Asia/Kolkata",
      activeProvider: providers.find((p) => p.hasKey && p.status !== "exhausted")?.id || "none",
      providers,
    },
  };
}

module.exports = { JARVIS_POOL, PROVIDERS, getOrderedProviders, getUsageSummary, detectQueryType };
