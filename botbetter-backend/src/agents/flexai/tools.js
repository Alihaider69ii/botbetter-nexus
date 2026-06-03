const { Tool } = require("langchain/tools");
const { getMemory } = require("../../models/Memory.model");

function getFlexAITools(userId) {
  return [
    new Tool({
      name: "save_fitness_goal",
      description: "Save fitness goal and body stats. Input: JSON with goal, weight (kg), height (cm).",
      func: async (input) => {
        try {
          const { goal, weight, height } = JSON.parse(input);
          const mem = await getMemory(userId);
          if (!mem.fitness) mem.fitness = {};
          if (goal) mem.fitness.goal = goal;
          if (weight) mem.fitness.weight = Number(weight);
          if (height) mem.fitness.height = Number(height);
          await mem.save();
          return `Fitness profile updated ✅ Goal: ${goal || "unchanged"}`;
        } catch {
          return "Could not save fitness goal.";
        }
      },
    }),

    new Tool({
      name: "log_workout",
      description: "Log a completed workout. Input: JSON with workout (name) and duration (minutes).",
      func: async (input) => {
        try {
          const { workout, duration } = JSON.parse(input);
          const mem = await getMemory(userId);
          if (!mem.fitness) mem.fitness = { workoutHistory: [] };
          if (!mem.fitness.workoutHistory) mem.fitness.workoutHistory = [];
          mem.fitness.workoutHistory.push({ workout, duration: Number(duration), date: new Date() });
          await mem.save();
          return `Workout logged: ${workout} — ${duration} minutes 💪 Keep it up!`;
        } catch {
          return "Could not log workout.";
        }
      },
    }),

    new Tool({
      name: "calculate_bmi",
      description: "Calculate BMI. Input: JSON with weight (kg) and height (cm).",
      func: async (input) => {
        try {
          const { weight, height } = JSON.parse(input);
          const bmi = (Number(weight) / Math.pow(Number(height) / 100, 2)).toFixed(1);
          let category = "";
          if (bmi < 18.5) category = "Underweight — focus on muscle building";
          else if (bmi < 25) category = "Normal weight — maintain with balanced diet";
          else if (bmi < 30) category = "Overweight — focus on fat loss";
          else category = "Obese — consult doctor + start gradual exercise";
          return `BMI Result:
Weight: ${weight} kg | Height: ${height} cm
BMI: ${bmi}
Category: ${category}`;
        } catch {
          return "Invalid input. Provide weight and height.";
        }
      },
    }),

    new Tool({
      name: "get_progress",
      description: "Get fitness progress summary. Use when user asks about their progress.",
      func: async () => {
        const mem = await getMemory(userId);
        const fit = mem.fitness;
        if (!fit) return "Abhi koi fitness data nahi hai. Goal set karo pehle!";
        const workouts = fit.workoutHistory || [];
        const thisWeek = workouts.filter((w) => {
          const diff = (Date.now() - new Date(w.date)) / (1000 * 60 * 60 * 24);
          return diff <= 7;
        });
        return `Fitness Progress:
Goal: ${fit.goal || "not set"}
Weight: ${fit.weight ? `${fit.weight} kg` : "not set"}
Diet: ${fit.dietPreference || "not set"}
Total workouts: ${workouts.length}
This week: ${thisWeek.length} workouts
Recent sessions: ${workouts.slice(-3).map((w) => w.workout).join(", ") || "none"}`;
      },
    }),

    new Tool({
      name: "save_diet_preference",
      description: "Save diet preference. Input: diet type as string (e.g. vegetarian, vegan, non-veg, keto).",
      func: async (diet) => {
        const mem = await getMemory(userId);
        if (!mem.fitness) mem.fitness = {};
        mem.fitness.dietPreference = diet.trim();
        await mem.save();
        return `Diet preference saved: ${diet.trim()} ✅`;
      },
    }),
  ];
}

module.exports = { getFlexAITools };
