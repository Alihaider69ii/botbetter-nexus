const { Tool } = require("langchain/tools");
const { getMemory } = require("../../models/Memory.model");

function getSellioTools(userId) {
  return [

    new Tool({
      name: "save_product",
      description: "Save user's product. Use when user mentions product name, price, or category.",
      func: async (input) => {
        try {
          const data = JSON.parse(input);
          const mem = await getMemory(userId);
          if (!mem.ecommerce) mem.ecommerce = { products: [] };
          if (!mem.ecommerce.products) mem.ecommerce.products = [];
          mem.ecommerce.products.push(data);
          await mem.save();
          return `Product saved: ${data.name} ✅`;
        } catch (e) {
          return "Could not save product";
        }
      },
    }),

    new Tool({
      name: "save_platform",
      description: "Save which platform user sells on. Use when user mentions Meesho, Amazon, Flipkart.",
      func: async (platform) => {
        const mem = await getMemory(userId);
        if (!mem.ecommerce) mem.ecommerce = {};
        mem.ecommerce.platform = platform;
        await mem.save();
        return `Platform saved: ${platform} ✅`;
      },
    }),

    new Tool({
      name: "get_my_products",
      description: "Get user's saved products. Use when user asks about their products.",
      func: async () => {
        const mem = await getMemory(userId);
        const products = mem.ecommerce?.products;
        if (!products || products.length === 0) {
          return "Koi products save nahi hain abhi.";
        }
        return products
          .map((p, i) => `${i + 1}. ${p.name} — ₹${p.price}`)
          .join("\n");
      },
    }),

    new Tool({
      name: "optimize_title",
      description: "Generate SEO optimized product title. Input: product name and category.",
      func: async (input) => {
        return `Optimized title for "${input}":
"Premium ${input} | Best Quality | Fast Delivery | 2026 Latest"

Tips:
- Include main keyword first
- Add 2-3 feature words
- Keep under 100 characters
- Include year for freshness`;
      },
    }),

    new Tool({
      name: "price_strategy",
      description: "Suggest best pricing strategy. Input: product name and current price.",
      func: async (input) => {
        return `Pricing strategy for ${input}:
1. Check top 10 competitors — note average price
2. Price 5-10% below average to get initial sales
3. After 10+ reviews — increase by ₹20-30
4. Run flash sale every 2 weeks — 15-20% off
5. Never go below cost price + 30% margin`;
      },
    }),

    new Tool({
      name: "customer_reply",
      description: "Generate professional customer reply. Input: customer complaint or query.",
      func: async (input) => {
        return `Professional reply for: "${input}"

"Namaste! Thank you for reaching out. We sincerely apologize for the inconvenience caused. We take customer satisfaction very seriously and will resolve this immediately. Please share your order ID and we will process your request within 24 hours. Thank you for your patience! 🙏"`;
      },
    }),

  ];
}

module.exports = { getSellioTools };