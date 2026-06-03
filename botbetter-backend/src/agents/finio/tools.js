const { getMemory } = require("../../models/Memory.model");

function getFinioTools(userId) {
  return [
    {
      name: "sip_calculator",
      description: "Calculate SIP compound returns. ALWAYS call this tool for any SIP or mutual fund investment question. Never calculate manually.",
      // Typed param schema — aiCaller converts this to provider-native function declarations
      params: {
        monthlyAmount: { type: "number", description: "Monthly SIP investment amount in INR (e.g. 5000)" },
        annualReturn:  { type: "number", description: "Expected annual return in percent (use 12 as default for equity funds)" },
        years:         { type: "number", description: "Investment duration in years (e.g. 10)" },
      },
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
Estimated gains: ₹${Math.round(gains).toLocaleString("en-IN")}
Future value: ₹${Math.round(futureValue).toLocaleString("en-IN")} (~₹${(Math.round(futureValue) / 100000).toFixed(2)} lakhs) 🎯`;
        } catch {
          return "Invalid input. Provide monthlyAmount, annualReturn, and years.";
        }
      },
    },

    {
      name: "emi_calculator",
      description: "Calculate loan EMI. ALWAYS call this tool for any loan, home loan, car loan, or EMI calculation. Never calculate manually.",
      params: {
        principal:    { type: "number", description: "Loan principal amount in INR (e.g. 500000)" },
        annualRate:   { type: "number", description: "Annual interest rate in percent (e.g. 8.5)" },
        tenureMonths: { type: "number", description: "Loan tenure in months (e.g. 60 for 5 years)" },
      },
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
Tenure: ${tenureMonths} months (${(tenureMonths / 12).toFixed(1)} years)
Monthly EMI: ₹${Math.round(emi).toLocaleString("en-IN")}
Total interest: ₹${Math.round(totalInterest).toLocaleString("en-IN")}
Total payment: ₹${Math.round(totalPayment).toLocaleString("en-IN")}`;
        } catch {
          return "Invalid input. Provide principal, annualRate, and tenureMonths.";
        }
      },
    },

    {
      name: "save_financial_goal",
      description: 'Save a financial goal. Input: JSON like {"name": "Car", "targetAmount": 500000, "deadline": "2027-01-01"}',
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
    },

    {
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
    },

    {
      name: "web_search",
      description: "Search for latest finance information, fund performance, or market news. Input: search query string.",
      func: async (query) => {
        return `Searching for "${query}" — I can share insights from my knowledge on this topic. Please ask directly!`;
      },
    },
  ];
}

module.exports = { getFinioTools };
