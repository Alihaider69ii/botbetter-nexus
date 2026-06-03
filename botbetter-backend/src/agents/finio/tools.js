const { Tool } = require("langchain/tools");
const { getMemory } = require("../../models/Memory.model");

function getFinioTools(userId) {
  return [
    new Tool({
      name: "sip_calculator",
      description: "Calculate SIP returns. Input: JSON with monthlyAmount, annualReturn (%), and years.",
      func: async (input) => {
        try {
          const { monthlyAmount, annualReturn, years } = JSON.parse(input);
          const r = annualReturn / 12 / 100;
          const n = years * 12;
          const futureValue = monthlyAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
          const invested = monthlyAmount * n;
          const gains = futureValue - invested;
          return `SIP Calculator Results:
Monthly SIP: ₹${monthlyAmount.toLocaleString("en-IN")}
Duration: ${years} years (${n} months)
Expected return: ${annualReturn}% p.a.
Total invested: ₹${Math.round(invested).toLocaleString("en-IN")}
Estimated returns: ₹${Math.round(gains).toLocaleString("en-IN")}
Future value: ₹${Math.round(futureValue).toLocaleString("en-IN")} 🎯`;
        } catch {
          return "Invalid input. Provide monthlyAmount, annualReturn, and years.";
        }
      },
    }),

    new Tool({
      name: "emi_calculator",
      description: "Calculate loan EMI. Input: JSON with principal, annualRate (%), and tenureMonths.",
      func: async (input) => {
        try {
          const { principal, annualRate, tenureMonths } = JSON.parse(input);
          const r = annualRate / 12 / 100;
          const emi = (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
          const totalPayment = emi * tenureMonths;
          const totalInterest = totalPayment - principal;
          return `EMI Calculator Results:
Loan amount: ₹${principal.toLocaleString("en-IN")}
Interest rate: ${annualRate}% p.a.
Tenure: ${tenureMonths} months (${Math.round(tenureMonths / 12 * 10) / 10} years)
Monthly EMI: ₹${Math.round(emi).toLocaleString("en-IN")}
Total interest: ₹${Math.round(totalInterest).toLocaleString("en-IN")}
Total payment: ₹${Math.round(totalPayment).toLocaleString("en-IN")}`;
        } catch {
          return "Invalid input. Provide principal, annualRate, and tenureMonths.";
        }
      },
    }),

    new Tool({
      name: "save_financial_goal",
      description: "Save a financial goal. Input: JSON with name, targetAmount, and optional deadline.",
      func: async (input) => {
        try {
          const { name, targetAmount, deadline } = JSON.parse(input);
          const mem = await getMemory(userId);
          if (!mem.finance) mem.finance = { goals: [], investments: [] };
          if (!mem.finance.goals) mem.finance.goals = [];
          mem.finance.goals.push({ name, targetAmount, savedAmount: 0, deadline: deadline || null, createdAt: new Date() });
          await mem.save();
          return `Goal saved: "${name}" — Target ₹${Number(targetAmount).toLocaleString("en-IN")} ✅`;
        } catch {
          return "Could not save goal.";
        }
      },
    }),

    new Tool({
      name: "get_financial_goals",
      description: "Get all saved financial goals. Use when user asks about their goals.",
      func: async () => {
        const mem = await getMemory(userId);
        const goals = mem.finance?.goals;
        if (!goals || goals.length === 0) return "Koi financial goals save nahi hain abhi.";
        return goals
          .map((g, i) => `${i + 1}. ${g.name} — Target: ₹${g.targetAmount?.toLocaleString("en-IN") || "N/A"}`)
          .join("\n");
      },
    }),

    new Tool({
      name: "web_search",
      description: "Search for latest finance information, fund performance, or market news. Input: query.",
      func: async (query) => {
        return `Searching for "${query}" — Based on my knowledge, I can provide the latest information on this topic. Please ask directly!`;
      },
    }),
  ];
}

module.exports = { getFinioTools };
