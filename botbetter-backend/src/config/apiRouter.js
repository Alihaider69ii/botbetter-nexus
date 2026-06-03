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

  nexus: [
    {
      id: "gemini",
      type: "gemini",
      model: "gemini-2.0-flash",
      apiKey: () => process.env.GEMINI_NEXUS,
      dailyLimit: 1500,
      limitType: "requests",
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
  ],
};

// Returns providers in priority order, filtering those over daily limit
async function getOrderedProviders(agentName) {
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

module.exports = { PROVIDERS, getOrderedProviders, getUsageSummary };
