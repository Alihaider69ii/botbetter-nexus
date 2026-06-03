const { Tool } = require("langchain/tools");
const { getMemory } = require("../../models/Memory.model");

function getCreatoTools(userId) {
  return [
    new Tool({
      name: "save_content_preferences",
      description: "Save content preferences. Input: JSON with platform and/or niche.",
      func: async (input) => {
        try {
          const { platform, niche } = JSON.parse(input);
          const mem = await getMemory(userId);
          if (!mem.content) mem.content = { savedIdeas: [], contentCalendar: [] };
          if (platform) mem.content.platform = platform;
          if (niche) mem.content.niche = niche;
          await mem.save();
          return `Content profile updated ✅ Platform: ${platform || "unchanged"} | Niche: ${niche || "unchanged"}`;
        } catch {
          return "Could not save preferences.";
        }
      },
    }),

    new Tool({
      name: "save_idea",
      description: "Save a content idea. Input: JSON with title and type (reel/video/post/story).",
      func: async (input) => {
        try {
          const { title, type } = JSON.parse(input);
          const mem = await getMemory(userId);
          if (!mem.content) mem.content = { savedIdeas: [], contentCalendar: [] };
          if (!mem.content.savedIdeas) mem.content.savedIdeas = [];
          mem.content.savedIdeas.push({ title, type: type || "reel", createdAt: new Date() });
          await mem.save();
          return `Idea saved: "${title}" (${type || "reel"}) ✅`;
        } catch {
          return "Could not save idea.";
        }
      },
    }),

    new Tool({
      name: "get_saved_ideas",
      description: "Get all saved content ideas. Use when user asks to see their ideas.",
      func: async () => {
        const mem = await getMemory(userId);
        const ideas = mem.content?.savedIdeas;
        if (!ideas || ideas.length === 0) return "Koi ideas save nahi hain abhi. Pehle kuch ideas save karo!";
        return ideas
          .slice(-10)
          .map((idea, i) => `${i + 1}. [${idea.type?.toUpperCase() || "REEL"}] ${idea.title}`)
          .join("\n");
      },
    }),

    new Tool({
      name: "get_content_calendar",
      description: "Get the content calendar. Use when user asks about their posting schedule.",
      func: async () => {
        const mem = await getMemory(userId);
        const calendar = mem.content?.contentCalendar;
        if (!calendar || calendar.length === 0) {
          return "Koi content calendar set nahi hai. Ek schedule banate hain — batao kitne posts per week chahiye?";
        }
        return calendar
          .slice(-7)
          .map((c) => `${new Date(c.date).toLocaleDateString("en-IN")} | ${c.platform} | ${c.topic} [${c.status}]`)
          .join("\n");
      },
    }),

    new Tool({
      name: "web_search",
      description: "Search for trending topics, viral content, or platform updates. Input: query.",
      func: async (query) => {
        return `Searching for trending content on "${query}" — I can share what's currently working for Indian creators. Ask me directly!`;
      },
    }),
  ];
}

module.exports = { getCreatoTools };
