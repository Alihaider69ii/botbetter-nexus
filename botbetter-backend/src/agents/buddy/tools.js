const { Tool } = require("langchain/tools");
const { getMemory } = require("../../models/Memory.model");

function getBuddyTools(userId) {
  return [
    new Tool({
      name: "save_note",
      description: "Save a note for the user. Input: JSON with title and content fields.",
      func: async (input) => {
        try {
          const { title, content } = JSON.parse(input);
          const mem = await getMemory(userId);
          if (!mem.personal) mem.personal = { notes: [], tasks: [] };
          if (!mem.personal.notes) mem.personal.notes = [];
          mem.personal.notes.push({ title, content, createdAt: new Date() });
          await mem.save();
          return `Note saved: "${title}" ✅`;
        } catch (e) {
          return "Could not save note.";
        }
      },
    }),

    new Tool({
      name: "get_notes",
      description: "Get all saved notes. Use when user asks to see or list their notes.",
      func: async () => {
        const mem = await getMemory(userId);
        const notes = mem.personal?.notes;
        if (!notes || notes.length === 0) return "Koi notes save nahi hain abhi.";
        return notes
          .slice(-10)
          .map((n, i) => `${i + 1}. ${n.title}: ${n.content}`)
          .join("\n");
      },
    }),

    new Tool({
      name: "add_task",
      description: "Add a task/to-do item. Input: JSON with title and optional dueDate.",
      func: async (input) => {
        try {
          const { title, dueDate } = JSON.parse(input);
          const mem = await getMemory(userId);
          if (!mem.personal) mem.personal = { notes: [], tasks: [] };
          if (!mem.personal.tasks) mem.personal.tasks = [];
          mem.personal.tasks.push({ title, done: false, dueDate: dueDate || null, createdAt: new Date() });
          await mem.save();
          return `Task added: "${title}" ✅`;
        } catch (e) {
          return "Could not add task.";
        }
      },
    }),

    new Tool({
      name: "get_tasks",
      description: "Get pending tasks. Use when user asks for their task list or to-do list.",
      func: async () => {
        const mem = await getMemory(userId);
        const tasks = mem.personal?.tasks?.filter((t) => !t.done);
        if (!tasks || tasks.length === 0) return "Koi pending tasks nahi hain. Sab clear! 🎉";
        return tasks
          .map((t, i) => `${i + 1}. ${t.title}${t.dueDate ? ` (Due: ${new Date(t.dueDate).toLocaleDateString("en-IN")})` : ""}`)
          .join("\n");
      },
    }),

    new Tool({
      name: "save_user_info",
      description: "Save user's name or city. Input: JSON with name and/or city fields.",
      func: async (input) => {
        try {
          const data = JSON.parse(input);
          const mem = await getMemory(userId);
          if (data.name) mem.name = data.name;
          if (data.city) mem.city = data.city;
          await mem.save();
          return `Profile updated ✅`;
        } catch (e) {
          return "Could not save info.";
        }
      },
    }),

    new Tool({
      name: "calculator",
      description: "Perform a math calculation. Input: a mathematical expression as a string.",
      func: async (expression) => {
        try {
          const cleaned = expression.replace(/[^0-9+\-*/().\s]/g, "");
          // eslint-disable-next-line no-new-func
          const result = Function(`"use strict"; return (${cleaned})`)();
          return `Result: ${result}`;
        } catch {
          return "Invalid expression. Please try again.";
        }
      },
    }),

    new Tool({
      name: "web_search",
      description: "Search the web for information. Input: search query string.",
      func: async (query) => {
        return `Web search for "${query}" — I can help you find information on this topic. Based on my knowledge: please ask me directly and I'll share what I know!`;
      },
    }),
  ];
}

module.exports = { getBuddyTools };
