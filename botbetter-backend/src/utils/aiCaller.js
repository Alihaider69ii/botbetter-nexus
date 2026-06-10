const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getOrderedProviders } = require("../config/apiRouter");
const ApiUsage = require("../models/ApiUsage.model");

// ─── Tool helpers ─────────────────────────────────────────────────────────────

// Execute a named tool.
// toolArgs may be:
//   { input: "<json string>" }  — single-string-param style
//   { key1: val, key2: val }    — native typed params (if tool has .params schema)
//   "<json string>"             — raw string
async function executeTool(tools, toolName, toolArgs) {
  const tool = tools.find((t) => t.name === toolName);
  if (!tool) return `Tool "${toolName}" not found`;
  try {
    let input;
    if (typeof toolArgs === "string") {
      input = toolArgs;
    } else if (toolArgs && typeof toolArgs.input === "string") {
      input = toolArgs.input;
    } else {
      // Native typed args → stringify so func can JSON.parse
      input = JSON.stringify(toolArgs);
    }
    const result = await tool.func(input);
    return String(result);
  } catch (e) {
    return `Tool error: ${e.message}`;
  }
}

// Build OpenAI-compatible function definition for a tool.
// If tool.params is defined, use typed named params (more reliable for smaller models).
// Otherwise fall back to a single opaque "input" string param.
function toOpenAIFunction(tool) {
  if (tool.params) {
    return {
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: "object",
          properties: tool.params,
          required: Object.keys(tool.params),
        },
      },
    };
  }
  return {
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: "object",
        properties: {
          input: {
            type: "string",
            description: "JSON string input — see tool description for required keys.",
          },
        },
        required: ["input"],
      },
    },
  };
}

// Build Gemini function declaration for a tool.
function toGeminiDeclaration(tool) {
  if (tool.params) {
    const properties = {};
    for (const [key, val] of Object.entries(tool.params)) {
      properties[key] = {
        type: val.type === "number" ? "NUMBER" : "STRING",
        description: val.description,
      };
    }
    return {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: "OBJECT",
        properties,
        required: Object.keys(tool.params),
      },
    };
  }
  return {
    name: tool.name,
    description: tool.description,
    parameters: {
      type: "OBJECT",
      properties: {
        input: {
          type: "STRING",
          description: "JSON string — see tool description for required keys.",
        },
      },
      required: ["input"],
    },
  };
}

// ─── Gemini ───────────────────────────────────────────────────────────────────

async function callGemini(provider, messages, systemPrompt, tools = []) {
  const genAI = new GoogleGenerativeAI(provider.apiKey());

  const modelConfig = { model: provider.model, systemInstruction: systemPrompt };
  if (tools.length > 0) {
    modelConfig.tools = [{ functionDeclarations: tools.map(toGeminiDeclaration) }];
  }

  const model = genAI.getGenerativeModel(modelConfig);

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
      console.log(`[Tool/Gemini] → ${toolResult.slice(0, 100)}`);
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
  const openAITools = tools.length > 0 ? tools.map(toOpenAIFunction) : undefined;
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

    // Execute each tool call then loop for final answer
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
      console.log(`[Tool/${provider.id}] → ${toolResult.slice(0, 100)}`);

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

// ─── Streaming: Gemini ────────────────────────────────────────────────────────

async function callGeminiStream(provider, messages, systemPrompt, onChunk) {
  const genAI = new GoogleGenerativeAI(provider.apiKey());
  const model = genAI.getGenerativeModel({ model: provider.model, systemInstruction: systemPrompt });

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1];
  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(lastMessage.content);

  let fullText = "";
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) { fullText += text; onChunk(text); }
  }

  const finalResponse = await result.response;
  return { reply: fullText, tokensUsed: finalResponse.usageMetadata?.totalTokenCount || 0 };
}

// ─── Streaming: OpenAI-compatible (Groq / Mistral / DeepSeek) ────────────────

async function callOpenAICompatStream(baseURL, provider, messages, systemPrompt, onChunk) {
  const body = {
    model: provider.model,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    temperature: 0.7,
    stream: true,
  };

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

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content ?? "";
        if (delta) { fullText += delta; onChunk(delta); }
      } catch { /* ignore malformed chunk */ }
    }
  }

  return { reply: fullText, tokensUsed: 0 };
}

async function callProviderStream(provider, messages, systemPrompt, onChunk) {
  if (provider.type === "gemini") {
    return callGeminiStream(provider, messages, systemPrompt, onChunk);
  }
  const baseURL = BASE_URLS[provider.type];
  if (!baseURL) throw new Error(`No base URL for provider type: ${provider.type}`);
  return callOpenAICompatStream(baseURL, provider, messages, systemPrompt, onChunk);
}

// ─── Public API ───────────────────────────────────────────────────────────────

async function callAIStream(agentName, messages, systemPrompt, onChunk) {
  const userMessage = messages[messages.length - 1]?.content ?? "";
  let providers;
  try {
    providers = await getOrderedProviders(agentName, userMessage);
  } catch (e) {
    console.error(`[AI Stream] Failed to get providers for ${agentName}:`, e.message);
    throw e;
  }

  if (providers.length === 0) throw new Error(`No providers available for ${agentName}`);

  for (const provider of providers) {
    try {
      console.log(`[AI Stream] ${agentName} -> ${provider.id} (${provider.model})`);
      const result = await callProviderStream(provider, messages, systemPrompt, onChunk);
      ApiUsage.incrementUsage(provider.id, agentName, result.tokensUsed).catch((e) =>
        console.error(`[AI Stream] Usage tracking failed:`, e.message)
      );
      console.log(`[AI Stream] ${agentName} <- ${provider.id} OK`);
      return result;
    } catch (e) {
      console.error(`[AI Stream] ${provider.id} failed for ${agentName}: ${e.message}`);
    }
  }

  throw new Error(`All providers failed for ${agentName}`);
}

async function callAI(agentName, messages, systemPrompt, tools = []) {
  const userMessage = messages[messages.length - 1]?.content ?? "";
  let providers;
  try {
    providers = await getOrderedProviders(agentName, userMessage);
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
      console.log(`[AI] ${agentName} -> ${provider.id} (${provider.model})`);
      const result = await callProvider(provider, messages, systemPrompt, tools);

      ApiUsage.incrementUsage(provider.id, agentName, result.tokensUsed).catch((e) =>
        console.error(`[AI] Usage tracking failed:`, e.message)
      );

      console.log(`[AI] ${agentName} <- ${provider.id} OK (${result.tokensUsed} tokens)`);
      return { reply: result.reply, tokensUsed: result.tokensUsed, provider: provider.id };
    } catch (e) {
      console.error(`[AI] ${provider.id} failed for ${agentName}: ${e.message}`);
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

module.exports = { callAI, callAIStream };
