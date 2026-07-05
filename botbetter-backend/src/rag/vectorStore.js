const crypto = require("crypto");
const { ChromaClient } = require("chromadb");
const { embedDocuments, embedText } = require("./embeddings");

const COLLECTIONS = [
  "news_global",
  "news_india",
  "sports",
  "finance",
  "entertainment",
  "tech",
  "weather",
];

const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const memoryStore = new Map(COLLECTIONS.map((name) => [name, []]));
const lastUpdated = new Map();

let chromaClient;
const chromaCollections = new Map();
let chromaAvailable = true;

function getClient() {
  if (!chromaClient) {
    chromaClient = new ChromaClient({
      path: process.env.CHROMA_URL || "http://localhost:8000",
    });
  }
  return chromaClient;
}

async function getCollection(name) {
  if (!COLLECTIONS.includes(name) || !chromaAvailable) return null;
  if (chromaCollections.has(name)) return chromaCollections.get(name);

  try {
    const collection = await getClient().getOrCreateCollection({ name });
    chromaCollections.set(name, collection);
    return collection;
  } catch (e) {
    chromaAvailable = false;
    console.warn("[RAG] Chroma unavailable, using in-memory vector store:", e.message);
    return null;
  }
}

function stableId(doc) {
  const raw = `${doc.collection}:${doc.url || ""}:${doc.title || ""}:${doc.publishedAt || ""}`;
  return crypto.createHash("sha1").update(raw).digest("hex");
}

function normalizeDoc(collection, doc) {
  const now = new Date().toISOString();
  return {
    id: doc.id || stableId({ ...doc, collection }),
    collection,
    title: doc.title || "Untitled",
    content: doc.content || doc.summary || doc.description || "",
    url: doc.url || "",
    source: doc.source || "unknown",
    category: doc.category || collection,
    publishedAt: doc.publishedAt || now,
    createdAt: doc.createdAt || now,
  };
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / ((Math.sqrt(normA) * Math.sqrt(normB)) || 1);
}

async function upsertDocuments(collectionName, docs = []) {
  if (!COLLECTIONS.includes(collectionName) || docs.length === 0) return 0;

  const normalized = docs
    .map((doc) => normalizeDoc(collectionName, doc))
    .filter((doc) => doc.content || doc.title);

  if (normalized.length === 0) return 0;

  const texts = normalized.map((doc) => `${doc.title}\n${doc.content}`);
  const embeddings = await embedDocuments(texts);

  const existing = memoryStore.get(collectionName) || [];
  const byId = new Map(existing.map((doc) => [doc.id, doc]));
  normalized.forEach((doc, index) => byId.set(doc.id, { ...doc, embedding: embeddings[index] }));
  memoryStore.set(collectionName, Array.from(byId.values()));
  lastUpdated.set(collectionName, new Date().toISOString());

  const collection = await getCollection(collectionName);
  if (collection) {
    try {
      await collection.upsert({
        ids: normalized.map((doc) => doc.id),
        documents: texts,
        embeddings,
        metadatas: normalized.map((doc) => ({
          title: doc.title,
          url: doc.url,
          source: doc.source,
          category: doc.category,
          publishedAt: doc.publishedAt,
          createdAt: doc.createdAt,
        })),
      });
    } catch (e) {
      console.warn(`[RAG] Chroma upsert failed for ${collectionName}:`, e.message);
    }
  }

  return normalized.length;
}

async function searchCollection(collectionName, query, limit = 5) {
  const collection = await getCollection(collectionName);

  if (collection) {
    try {
      const queryEmbedding = await embedText(query);
      const result = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit,
      });

      return (result.ids?.[0] || []).map((id, index) => ({
        id,
        collection: collectionName,
        title: result.metadatas?.[0]?.[index]?.title || "Untitled",
        content: result.documents?.[0]?.[index] || "",
        url: result.metadatas?.[0]?.[index]?.url || "",
        source: result.metadatas?.[0]?.[index]?.source || "unknown",
        publishedAt: result.metadatas?.[0]?.[index]?.publishedAt,
        score: result.distances?.[0]?.[index] == null ? null : 1 - result.distances[0][index],
      }));
    } catch (e) {
      console.warn(`[RAG] Chroma search failed for ${collectionName}:`, e.message);
    }
  }

  const queryEmbedding = await embedText(query);
  return (memoryStore.get(collectionName) || [])
    .map((doc) => ({ ...doc, score: cosineSimilarity(queryEmbedding, doc.embedding || []) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function searchAll(query, limit = 8) {
  const perCollection = Math.max(2, Math.ceil(limit / COLLECTIONS.length));
  const results = [];

  for (const collection of COLLECTIONS) {
    results.push(...await searchCollection(collection, query, perCollection));
  }

  return results.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, limit);
}

async function cleanupOldData() {
  const cutoff = Date.now() - RETENTION_MS;

  for (const collectionName of COLLECTIONS) {
    const kept = (memoryStore.get(collectionName) || []).filter((doc) => {
      const timestamp = Date.parse(doc.publishedAt || doc.createdAt);
      return Number.isNaN(timestamp) || timestamp >= cutoff;
    });
    memoryStore.set(collectionName, kept);

    const collection = await getCollection(collectionName);
    if (collection) {
      try {
        await collection.delete({ where: { publishedAt: { "$lt": new Date(cutoff).toISOString() } } });
      } catch (e) {
        console.warn(`[RAG] Chroma cleanup skipped for ${collectionName}:`, e.message);
      }
    }
  }
}

function getStatus() {
  return {
    chromaAvailable,
    retentionDays: 7,
    collections: COLLECTIONS.map((name) => ({
      name,
      docCount: (memoryStore.get(name) || []).length,
      lastUpdated: lastUpdated.get(name) || null,
    })),
  };
}

module.exports = {
  COLLECTIONS,
  upsertDocuments,
  searchAll,
  searchCollection,
  cleanupOldData,
  getStatus,
};
