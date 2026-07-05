const { GoogleGenerativeAI } = require("@google/generative-ai");

const EMBEDDING_DIMENSIONS = 384;

function hashEmbedding(text = "") {
  const vector = Array(EMBEDDING_DIMENSIONS).fill(0);
  const tokens = String(text).toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];

  for (const token of tokens) {
    let hash = 2166136261;
    for (let i = 0; i < token.length; i += 1) {
      hash ^= token.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const index = Math.abs(hash) % EMBEDDING_DIMENSIONS;
    vector[index] += 1;
  }

  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => value / magnitude);
}

async function geminiEmbedding(text) {
  const key = process.env.GEMINI_NEXUS || process.env.GEMINI_CRACKY;
  if (!key) return null;

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(String(text).slice(0, 30000));
  return result.embedding.values;
}

async function embedText(text) {
  try {
    const embedding = await geminiEmbedding(text);
    if (embedding?.length) return embedding;
  } catch (e) {
    console.warn("[RAG] Gemini embedding unavailable, using local hash embedding:", e.message);
  }

  return hashEmbedding(text);
}

async function embedDocuments(texts) {
  const embeddings = [];
  for (const text of texts) {
    embeddings.push(await embedText(text));
  }
  return embeddings;
}

module.exports = { embedText, embedDocuments, hashEmbedding };
