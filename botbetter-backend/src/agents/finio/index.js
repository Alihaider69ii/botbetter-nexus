const { getMemory } = require("../../models/Memory.model");
const { getFinioPrompt } = require("./prompt");
const { getFinioTools } = require("./tools");
const { callAI } = require("../../utils/aiCaller");

// Extract SIP parameters from natural language and pre-calculate.
// This runs server-side before the AI call so the correct answer is always
// injected into context — regardless of whether the LLM uses the tool.
function preCalculateSIP(message) {
  // Match amount: "5000", "5,000", "₹5000", "5k"
  const amountRx = /(?:₹\s*)?(\d[\d,]*)\s*k?\s*(?:per month|\/month|pm\b|mahine|monthly|ka sip|ki sip)/i;
  // Match years: "10 saal", "10 years", "10 yr"
  const yearsRx = /(\d+)\s*(?:saal|year|yr|years)/i;
  // Optional explicit return rate: "15%"
  const returnRx = /(\d+(?:\.\d+)?)\s*%/i;

  const amountM = message.match(amountRx);
  const yearsM = message.match(yearsRx);
  if (!amountM || !yearsM) return null;

  let amount = parseInt(amountM[1].replace(/,/g, ""));
  if (/\dk\b/i.test(amountM[0])) amount *= 1000;
  const years = parseInt(yearsM[1]);
  if (!amount || !years || amount > 10_000_000 || years > 40) return null;

  const returnM = message.match(returnRx);
  const annualReturn = returnM ? parseFloat(returnM[1]) : 12;

  const r = annualReturn / 12 / 100;
  const n = years * 12;
  const futureValue = amount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const invested = amount * n;
  const gains = futureValue - invested;

  return {
    monthly: amount, years, annualReturn,
    invested: Math.round(invested),
    gains: Math.round(gains),
    futureValue: Math.round(futureValue),
    lakhs: (Math.round(futureValue) / 100000).toFixed(2),
  };
}

async function runFinio(userId, userMessage) {
  try {
    const memory = await getMemory(userId);
    let systemPrompt = getFinioPrompt(memory);
    const tools = getFinioTools(userId);

    // Pre-calculate SIP and inject result so the AI always has the correct numbers
    const sip = preCalculateSIP(userMessage);
    if (sip) {
      systemPrompt += `

VERIFIED CALCULATION (use these EXACT numbers — do NOT recalculate):
SIP: ₹${sip.monthly.toLocaleString("en-IN")}/month × ${sip.years} years @ ${sip.annualReturn}% p.a.
→ Total invested : ₹${sip.invested.toLocaleString("en-IN")}
→ Estimated gains: ₹${sip.gains.toLocaleString("en-IN")}
→ Future value   : ₹${sip.futureValue.toLocaleString("en-IN")} (approx ₹${sip.lakhs} lakhs)`;
    }

    const history = memory.getAgentHistory("finio", 8).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    const { reply } = await callAI(
      "finio",
      [...history, { role: "user", content: userMessage }],
      systemPrompt,
      tools
    );

    await memory.addMessage("finio", "user", userMessage);
    await memory.addMessage("finio", "assistant", reply);

    return reply;
  } catch (e) {
    console.error("Finio error:", e.message);
    return "Sorry yaar, thoda issue aa gaya. Dobara try karo! 🙏";
  }
}

module.exports = { runFinio };
