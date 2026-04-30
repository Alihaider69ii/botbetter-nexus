const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getOrderedProviders } = require("../config/apiRouter");
const ApiUsage = require("../models/ApiUsage.model");

async function callGemini(provider, messages, systemPrompt) {
  const genAI = new GoogleGenerativeAI(provider.apiKey());
  const model = genAI.getGenerativeModel({
    model: provider.model,
    systemInstruction: systemPrompt,
  });

  // Gemini requires alternating user/model turns; last message must be from user
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1];
  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage.content);
  const response = result.response;

  return {
    reply: response.text(),
    tokensUsed: response.usageMetadata?.totalTokenCount || 0,
  };
}

async function callOpenAICompat(baseURL, provider, messages, systemPrompt) {
  const response = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${provider.id} HTTP ${response.status}: ${body.slice(0, 200)}`);
  }

  const data = await response.json();
  return {
    reply: data.choices[0].message.content,
    tokensUsed: data.usage?.total_tokens || 0,
  };
}

const BASE_URLS = {
  groq: "https://api.groq.com/openai/v1",
  mistral: "https://api.mistral.ai/v1",
  together: "https://api.together.xyz/v1",
  deepseek: "https://api.deepseek.com/v1",
};

async function callProvider(provider, messages, systemPrompt) {
  if (provider.type === "gemini") {
    return callGemini(provider, messages, systemPrompt);
  }
  const baseURL = BASE_URLS[provider.type];
  if (!baseURL) throw new Error(`No base URL for provider type: ${provider.type}`);
  return callOpenAICompat(baseURL, provider, messages, systemPrompt);
}

async function callAI(agentName, messages, systemPrompt) {
  let providers;
  try {
    providers = await getOrderedProviders(agentName);
  } catch (e) {
    console.error(`[AI] Failed to get providers for ${agentName}:`, e.message);
    return fallbackResponse();
  }

  if (providers.length === 0) {
    console.error(`[AI] No providers available for ${agentName}`);
    return fallbackResponse();
  }

  for (const provider of providers) {
    try {
      console.log(`[AI] ${agentName} -> trying ${provider.id} (${provider.model})`);
      const result = await callProvider(provider, messages, systemPrompt);

      // Track usage asynchronously — don't block the response
      ApiUsage.incrementUsage(provider.id, agentName, result.tokensUsed).catch((e) =>
        console.error(`[AI] Usage tracking failed:`, e.message)
      );

      console.log(
        `[AI] ${agentName} <- ${provider.id} OK (${result.tokensUsed} tokens)`
      );
      return { reply: result.reply, tokensUsed: result.tokensUsed, provider: provider.id };
    } catch (e) {
      console.error(`[AI] ${provider.id} failed for ${agentName}: ${e.message}`);
      // Try next provider
    }
  }

  console.error(`[AI] All providers failed for ${agentName}`);
  return fallbackResponse();
}

function fallbackResponse() {
  return {
    reply:
      "Abhi AI service temporarily unavailable hai. Kuch der baad dobara try karo! 🙏",
    tokensUsed: 0,
    provider: "none",
  };
}

module.exports = { callAI };
