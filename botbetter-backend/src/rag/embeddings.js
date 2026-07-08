const EMBEDDING_DIMENSIONS = 384;

let loggedOnce = false;

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

async function embedText(text) {
  if (!loggedOnce) {
    loggedOnce = true;
    console.log("[RAG] Using local hash embedding (no external API required)");
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
