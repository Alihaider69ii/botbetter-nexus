const { getMemory } = require("../../models/Memory.model");
const { getFinioPrompt } = require("./prompt");
const { getFinioTools } = require("./tools");
const { callAI } = require("../../utils/aiCaller");

// ─── SIP pre-calculation ──────────────────────────────────────────────────────

function detectSIP(message) {
  const amountRx = /(?:₹\s*)?(\d[\d,]*)\s*k?\s*(?:per month|\/month|pm\b|mahine|monthly|ka sip|ki sip)/i;
  const yearsRx  = /(\d+)\s*(?:saal|year|yr|years)/i;
  const returnRx = /(\d+(?:\.\d+)?)\s*%/i;

  const amountM = message.match(amountRx);
  const yearsM  = message.match(yearsRx);
  if (!amountM || !yearsM) return null;

  let amount = parseInt(amountM[1].replace(/,/g, ""));
  if (/\dk\b/i.test(amountM[0])) amount *= 1000;
  const years = parseInt(yearsM[1]);
  if (!amount || !years || amount > 10_000_000 || years > 40) return null;

  const returnM    = message.match(returnRx);
  const annualReturn = returnM ? parseFloat(returnM[1]) : 12;

  const r = annualReturn / 12 / 100;
  const n = years * 12;
  const futureValue = amount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const invested    = amount * n;
  const gains       = futureValue - invested;

  return {
    monthly: amount, years, annualReturn,
    invested:    Math.round(invested),
    gains:       Math.round(gains),
    futureValue: Math.round(futureValue),
    lakhs:       (Math.round(futureValue) / 100000).toFixed(2),
  };
}

// ─── EMI pre-calculation ──────────────────────────────────────────────────────

function detectEMI(message) {
  // Match loan amount: "5 lakh", "500000", "₹5,00,000"
  const loanRx   = /(?:₹\s*)?(\d[\d,]*)\s*(?:lakh|lac|l\b)?/i;
  const rateRx   = /(\d+(?:\.\d+)?)\s*%/i;
  const tenureRx = /(\d+)\s*(?:saal|year|yr|years|month|mahine)/i;

  const lower = message.toLowerCase();
  if (!lower.includes("loan") && !lower.includes("emi") && !lower.includes("karz")) return null;

  const loanM   = message.match(loanRx);
  const rateM   = message.match(rateRx);
  const tenureM = message.match(tenureRx);
  if (!loanM || !rateM || !tenureM) return null;

  let principal = parseInt(loanM[1].replace(/,/g, ""));
  if (/lakh|lac|l\b/i.test(loanM[0])) principal *= 100000;
  const rate = parseFloat(rateM[1]);
  let tenure = parseInt(tenureM[1]);
  if (/year|saal|yr/i.test(tenureM[0])) tenure *= 12;

  if (!principal || !rate || !tenure || principal > 1_000_000_000 || tenure > 360) return null;

  const r   = rate / 12 / 100;
  const emi = (principal * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1);
  const totalPayment  = emi * tenure;
  const totalInterest = totalPayment - principal;

  return {
    principal, rate, tenureMonths: tenure,
    emi:           Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalPayment:  Math.round(totalPayment),
  };
}

// ─── Reliable response templates (correct math, natural language) ─────────────

function sipResponse(sip) {
  const isHindi = true; // Finio users mostly use Hinglish
  return `Bilkul! ₹${sip.monthly.toLocaleString("en-IN")} per month SIP ke ${sip.years} saal ke baad:

📊 **SIP Calculator Results** (${sip.annualReturn}% p.a. expected return)
- Monthly investment : ₹${sip.monthly.toLocaleString("en-IN")}
- Total invested     : ₹${sip.invested.toLocaleString("en-IN")}
- Estimated gains    : ₹${sip.gains.toLocaleString("en-IN")}
- **Future value     : ₹${sip.futureValue.toLocaleString("en-IN")} (~₹${sip.lakhs} lakhs) 🎯**

Yeh compounding ka magic hai — aapne invest kiya ₹${sip.invested.toLocaleString("en-IN")} aur mila ₹${sip.futureValue.toLocaleString("en-IN")}!${sip.years >= 10 ? " 10+ saal ka SIP sabse powerful hota hai." : ""}

**Next step:** Groww ya Zerodha par **Mirae Asset Large Cap Fund** ya **Nifty 50 Index Fund** mein SIP start karo. Direct plan lo — regular se ~1% zyada return milta hai.`;
}

function emiResponse(emi) {
  return `Loan EMI calculation:

📊 **EMI Calculator Results** (${emi.rate}% p.a.)
- Loan amount   : ₹${emi.principal.toLocaleString("en-IN")}
- Tenure        : ${emi.tenureMonths} months (${(emi.tenureMonths / 12).toFixed(1)} years)
- **Monthly EMI : ₹${emi.emi.toLocaleString("en-IN")}**
- Total interest: ₹${emi.totalInterest.toLocaleString("en-IN")}
- Total payment : ₹${emi.totalPayment.toLocaleString("en-IN")}

**Next step:** Prepayment karo jab bhi possible ho — interest significantly kam hoga.`;
}

// ─── Main runner ──────────────────────────────────────────────────────────────

async function runFinio(userId, userMessage) {
  try {
    const memory = await getMemory(userId);

    // For calculation queries: calculate server-side and return directly.
    // Do NOT hand numbers to the LLM — it cannot do compound math reliably.
    const sip = detectSIP(userMessage);
    if (sip) {
      const reply = sipResponse(sip);
      await memory.addMessage("finio", "user", userMessage);
      await memory.addMessage("finio", "assistant", reply);
      return reply;
    }

    const emi = detectEMI(userMessage);
    if (emi) {
      const reply = emiResponse(emi);
      await memory.addMessage("finio", "user", userMessage);
      await memory.addMessage("finio", "assistant", reply);
      return reply;
    }

    // For all other queries: use AI with tools for advice, goals, etc.
    const systemPrompt = getFinioPrompt(memory);
    const tools = getFinioTools(userId);
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
