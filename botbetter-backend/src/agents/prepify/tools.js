const { Tool } = require("langchain/tools");
const { getMemory } = require("../../models/Memory.model");

const MOCK_QUESTIONS = {
  dsa: [
    "Reverse a linked list — explain approach, write code, then optimize.",
    "Find two numbers in an array that sum to a target (Two Sum). What's the optimal solution?",
    "Given a binary tree, find the maximum depth. Write recursive and iterative solutions.",
    "Implement a stack using queues. Explain tradeoffs.",
    "Check if a string has balanced parentheses. Handle all bracket types.",
  ],
  system_design: [
    "Design a URL shortener like bit.ly. Walk me through your entire architecture.",
    "Design WhatsApp — focus on message delivery, storage, and real-time updates.",
    "Design a rate limiter for an API. What algorithms would you use?",
    "Design YouTube's video upload and streaming system.",
  ],
  hr: [
    "Tell me about yourself — walk me through your background.",
    "What is your greatest weakness? Give a real example.",
    "Describe a time you faced a conflict in your team. How did you resolve it?",
    "Where do you see yourself in 5 years?",
    "Why do you want to join this company specifically?",
  ],
  tcs: [
    "What is the difference between process and thread?",
    "Explain OOPS concepts with real-world examples.",
    "What is normalization in databases? Explain 1NF, 2NF, 3NF.",
    "Write a program to find the factorial of a number recursively.",
  ],
};

function getPrepifyTools(userId) {
  return [
    new Tool({
      name: "save_interview_target",
      description: "Save target company and role. Input: JSON with targetCompany and targetRole.",
      func: async (input) => {
        try {
          const { targetCompany, targetRole } = JSON.parse(input);
          const mem = await getMemory(userId);
          if (!mem.career) mem.career = {};
          mem.career.targetCompany = targetCompany;
          mem.career.targetRole = targetRole;
          await mem.save();
          return `Target saved: ${targetRole} at ${targetCompany} ✅`;
        } catch {
          return "Could not save target.";
        }
      },
    }),

    new Tool({
      name: "get_mock_questions",
      description: "Get mock interview questions. Input: category — dsa, system_design, hr, or tcs.",
      func: async (category) => {
        const cat = category.toLowerCase().trim();
        const questions = MOCK_QUESTIONS[cat];
        if (!questions) {
          return `Available categories: dsa, system_design, hr, tcs\nYou asked for: ${category}`;
        }
        const q = questions[Math.floor(Math.random() * questions.length)];
        return `Mock Question (${cat.toUpperCase()}):\n\n${q}\n\nTake your time and answer — I'll give you detailed feedback!`;
      },
    }),

    new Tool({
      name: "save_score",
      description: "Save mock interview score. Input: JSON with topic and score (0-10).",
      func: async (input) => {
        try {
          const { topic, score } = JSON.parse(input);
          const mem = await getMemory(userId);
          if (!mem.career) mem.career = { mockScores: [] };
          if (!mem.career.mockScores) mem.career.mockScores = [];
          mem.career.mockScores.push({ topic, score: Number(score), date: new Date() });
          await mem.save();
          return `Score saved: ${topic} — ${score}/10 ✅`;
        } catch {
          return "Could not save score.";
        }
      },
    }),

    new Tool({
      name: "get_progress",
      description: "Get interview preparation progress. Use when user asks about their prep status.",
      func: async () => {
        const mem = await getMemory(userId);
        const career = mem.career;
        if (!career) return "Abhi koi progress data nahi hai. Pehle target set karo!";
        const scores = career.mockScores || [];
        const avg = scores.length
          ? (scores.reduce((s, m) => s + m.score, 0) / scores.length).toFixed(1)
          : "N/A";
        return `Prep Progress:
Target: ${career.targetRole || "N/A"} at ${career.targetCompany || "N/A"}
Mock interviews done: ${scores.length}
Average score: ${avg}/10
Weak topics: ${career.weakTopics?.join(", ") || "none"}
Recent scores: ${scores.slice(-3).map((s) => `${s.topic}: ${s.score}/10`).join(", ") || "none"}`;
      },
    }),

    new Tool({
      name: "web_search",
      description: "Search for company info, interview experiences, or job market trends. Input: query.",
      func: async (query) => {
        return `Searching for "${query}" — I can share insights on this from my knowledge. Ask away!`;
      },
    }),
  ];
}

module.exports = { getPrepifyTools };
