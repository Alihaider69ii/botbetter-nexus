const { Tool } = require("langchain/tools");
const { getMemory } = require("../../models/Memory.model");

function getCrackyTools(userId) {
  return [

    new Tool({
      name: "save_exam_target",
      description: "Save user's target exam. Use when user mentions NEET, JEE, UPSC, CA, SSC, Banking.",
      func: async (exam) => {
        const mem = await getMemory(userId);
        if (!mem.education) mem.education = {};
        mem.education.exam = exam.toUpperCase();
        await mem.save();
        return `Exam target saved: ${exam.toUpperCase()} ✅`;
      },
    }),

    new Tool({
      name: "save_weak_chapter",
      description: "Save a weak chapter. Use when user says they don't understand a topic.",
      func: async (chapter) => {
        const mem = await getMemory(userId);
        if (!mem.education) mem.education = { weakChapters: [] };
        if (!mem.education.weakChapters) mem.education.weakChapters = [];
        if (!mem.education.weakChapters.includes(chapter)) {
          mem.education.weakChapters.push(chapter);
          await mem.save();
        }
        return `Weak chapter noted: ${chapter} ✅`;
      },
    }),

    new Tool({
      name: "save_score",
      description: "Save a practice test score. Input format: topicName,score (e.g. Physics,75)",
      func: async (input) => {
        try {
          const [topic, score] = input.split(",");
          const mem = await getMemory(userId);
          if (!mem.education) mem.education = { dailyScores: [] };
          if (!mem.education.dailyScores) mem.education.dailyScores = [];
          mem.education.dailyScores.push({
            date: new Date(),
            score: parseInt(score),
            topic: topic.trim(),
          });
          await mem.save();
          return `Score saved: ${topic.trim()} — ${score}% ✅`;
        } catch (e) {
          return "Could not save score";
        }
      },
    }),

    new Tool({
      name: "get_progress",
      description: "Get student's progress summary. Use when asked about performance.",
      func: async () => {
        const mem = await getMemory(userId);
        const edu = mem.education;
        if (!edu) return "Abhi koi progress data nahi hai.";
        return `Progress Summary:
Exam: ${edu.exam || "not set"}
Weak chapters: ${edu.weakChapters?.join(", ") || "none"}
Study streak: ${edu.studyStreak || 0} days
Recent scores: ${edu.dailyScores?.slice(-3).map((s) => `${s.topic}: ${s.score}%`).join(", ") || "none"}`;
      },
    }),

    new Tool({
      name: "update_streak",
      description: "Update study streak. Call when user completes a study session.",
      func: async () => {
        const mem = await getMemory(userId);
        if (!mem.education) mem.education = { studyStreak: 0 };
        mem.education.studyStreak = (mem.education.studyStreak || 0) + 1;
        await mem.save();
        return `Study streak updated: ${mem.education.studyStreak} days 🔥`;
      },
    }),

  ];
}

module.exports = { getCrackyTools };