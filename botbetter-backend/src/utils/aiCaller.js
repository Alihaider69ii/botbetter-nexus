const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getOrderedProviders } = require("../config/apiRouter");
const ApiUsage = require("../models/ApiUsage.model");

// ─── Tool helpers ─────────────────────────────────────────────────────────────

// Execute a named tool — handles both string input and object args from AI
async function executeTool(tools, toolName, toolArgs) {
  const tool = tools.find((t) => t.name === toolName);
  if (!tool) return `Tool "${toolName}" not found`;
  try {
    let input;
    if (typeof toolArgs === "string") {
      input = toolArgs;
    } else if (toolArgs && typeof toolArgs.input === "string") {
      // AI passed { input: "<json string>" }
      input = toolArgs.input;
    } else {
      // AI passed named args directly — stringify so func can JSON.parse
      input = JSON.stringify(toolArgs);
    }
    const result = await tool.func(input);
    return String(result);
  } catch (e) {
    return `Tool error: ${e.message}`;
  }
}

// Convert tool array to Gemini function declarations
function toGeminiFunctions(tools) {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: {
      type: "OBJECT",
      properties: {
        input: {
          type: "STRING",
          description: "JSON string with required parameters (see tool description for exact keys).",
        },
      },
      required: ["input"],
    },
  }));
}

// Convert tool array to OpenAI-compatible function format (Groq / Mistral / DeepSeek)
function toOpenAIFunctions(tools) {
  return tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: "object",
        properties: {
          input: {
            type: "string",
            description: "JSON string with required parameters (see tool description for exact keys).",
          },
        },
        required: ["input"],
      },
    },
  }));
}

// ─── Gemini ───────────────────────────────────────────────────────────────────

async function callGemini(provider, messages, systemPrompt, tools = []) {
  const genAI = new GoogleGenerativeAI(provider.apiKey());

  const modelConfig = {
    model: provider.model,
    systemInstruction: systemPrompt,
  };
  if (tools.length > 0) {
    modelConfig.tools = [{ functionDeclarations: toGeminiFunctions(tools) }];
  }

  const model = genAI.getGenerativeModel(modelConfig);

  // Gemini requires alternating user/model turns; last message must be from user
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1];
  const chat = model.startChat({ history });

  let result = await chat.sendMessage(lastMessage.content);
  let response = result.response;
  let totalTokens = response.usageMetadata?.totalTokenCount || 0;

  // Tool calling loop — max 5 rounds
  for (let i = 0; i < 5 && tools.length > 0; i++) {
    const parts = response.candidates?.[0]?.content?.parts || [];
    const fnCalls = parts.filter((p) => p.functionCall);
    if (fnCalls.length === 0) break;

    const toolResponses = [];
    for (const part of fnCalls) {
      const { name, args } = part.functionCall;
      console.log(`[Tool/Gemini] ${name}(${JSON.stringify(args).slice(0, 80)})`);
      const toolResult = await executeTool(tools, name, args);
      console.log(`[Tool/Gemini] ${name} → ${toolResult.slice(0, 100)}`);
      toolResponses.push({ functionResponse: { name, response: { result: toolResult } } });
    }

    result = await chat.sendMessage(toolResponses);
    response = result.response;
    totalTokens += response.usageMetadata?.totalTokenCount || 0;
  }

  return { reply: response.text(), tokensUsed: totalTokens };
}

// ─── OpenAI-compatible (Groq / Mistral / DeepSeek) ───────────────────────────

async function callOpenAICompat(baseURL, provider, messages, systemPrompt, tools = []) {
  let currentMessages = [{ role: "system", content: systemPrompt }, ...messages];
  const openAITools = tools.length > 0 ? toOpenAIFunctions(tools) : undefined;
  let totalTokens = 0;

  for (let i = 0; i < 5; i++) {
    const body = { model: provider.model, messages: currentMessages, temperature: 0.7 };
    if (openAITools) {
      body.tools = openAITools;
      body.tool_choice = "auto";
    }

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const bodyText = await response.text();
      throw new Error(`${provider.id} HTTP ${response.status}: ${bodyText.slice(0, 200)}`);
    }

    const data = await response.json();
    const assistantMsg = data.choices[0].message;
    totalTokens += data.usage?.total_tokens || 0;

    // No tool calls — final answer
    if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
      return { reply: assistantMsg.content, tokensUsed: totalTokens };
    }

    // Execute each tool call and collect results
    currentMessages.push(assistantMsg);

    for (const toolCall of assistantMsg.tool_calls) {
      const toolName = toolCall.function.name;
      let toolArgs;
      try {
        toolArgs = JSON.parse(toolCall.function.arguments);
      } catch {
        toolArgs = toolCall.function.arguments;
      }

      console.log(`[Tool/${provider.id}] ${toolName}(${JSON.stringify(toolArgs).slice(0, 80)})`);
      const toolResult = await executeTool(tools, toolName, toolArgs);
      console.log(`[Tool/${provider.id}] ${toolName} → ${toolResult.slice(0, 100)}`);

      currentMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: toolResult,
      });
    }
  }

  return { reply: "Tool loop complete but no final response.", tokensUsed: totalTokens };
}

// ─── Provider dispatch ────────────────────────────────────────────────────────

const BASE_URLS = {
  groq: "https://api.groq.com/openai/v1",
  mistral: "https://api.mistral.ai/v1",
  together: "https://api.together.xyz/v1",
  deepseek: "https://api.deepseek.com/v1",
};

async function callProvider(provider, messages, systemPrompt, tools = []) {
  if (provider.type === "gemini") {
    return callGemini(provider, messages, systemPrompt, tools);
  }
  const baseURL = BASE_URLS[provider.type];
  if (!baseURL) throw new Error(`No base URL for provider type: ${provider.type}`);
  return callOpenAICompat(baseURL, provider, messages, systemPrompt, tools);
}

// ─── Public API ───────────────────────────────────────────────────────────────

async function callAI(agentName, messages, systemPrompt, tools = []) {
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
      const result = await callProvider(provider, messages, systemPrompt, tools);

      // Track usage asynchronously — don't block the response
      ApiUsage.incrementUsage(provider.id, agentName, result.tokensUsed).catch((e) =>
        console.error(`[AI] Usage tracking failed:`, e.message)
      );

      console.log(`[AI] ${agentName} <- ${provider.id} OK (${result.tokensUsed} tokens)`);
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
    reply: "Abhi AI service temporarily unavailable hai. Kuch der baad dobara try karo! 🙏",
    tokensUsed: 0,
    provider: "none",
  };
}

module.exports = { callAI };
