/**
 * Semantic Embedding & Similarity Service
 * Provides modular vector embeddings and cosine similarity for product descriptions and preferences.
 * 
 * Modular Architecture:
 * - If process.env.GEMINI_API_KEY is configured, can use Gemini text-embedding-004 via REST API.
 * - Otherwise (or on network failure), uses a local TF-IDF + Cosine Vectorizer with n-grams,
 *   subword n-grams, synonym expansions (e.g. sneakers <-> shoes, backpack <-> laptop bag, coat <-> jacket),
 *   and dimension projection for fast, deterministic, 100% offline semantic similarity.
 */

// Synonym clusters for domain-specific semantic expansion
const SYNONYM_CLUSTERS = [
  ['shoe', 'shoes', 'sneaker', 'sneakers', 'kicks', 'footwear', 'trainers', 'running', 'boots', 'combat', 'loafers', 'slides'],
  ['jacket', 'coat', 'hoodie', 'sweater', 'fleece', 'outerwear', 'windbreaker', 'pullover', 'parka', 'cardigan', 'blazer', 'denim'],
  ['bag', 'backpack', 'tote', 'duffle', 'pack', 'messenger', 'laptop', 'handbag', 'satchel', 'briefcase', 'rucksack'],
  ['book', 'books', 'textbook', 'textbooks', 'novel', 'manual', 'edition', 'paperback', 'hardcover', 'handbook', 'guide'],
  ['trouser', 'trousers', 'pants', 'pant', 'jeans', 'denim', 'shorts', 'bottoms', 'chinos', 'sweatpants', 'cargo'],
  ['accessories', 'accessory', 'sunglasses', 'shades', 'watch', 'cap', 'hat', 'beanie', 'belt', 'jewelry', 'scarf', 'wallet'],
  ['shirt', 't-shirt', 'tee', 'top', 'blouse', 'polo', 'button-down', 'oversized'],
  ['sports', 'gym', 'workout', 'running', 'fitness', 'athletic', 'training'],
  ['vintage', 'retro', 'classic', 'thrift', 'authentic', '90s', 'y2k'],
  ['electronics', 'headphones', 'earphones', 'charger', 'audio', 'gadget', 'wireless', 'tech'],
];

/**
 * Clean & tokenize text into normalized terms
 */
function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

/**
 * Expand tokens with domain synonyms to capture semantic equivalence
 * (e.g. "running shoes" <-> "sports sneakers", "laptop bag" <-> "computer backpack")
 */
function expandTokens(tokens) {
  const set = new Set(tokens);
  for (const token of tokens) {
    for (const cluster of SYNONYM_CLUSTERS) {
      if (cluster.includes(token)) {
        for (const syn of cluster) {
          set.add(syn);
        }
      }
    }
  }
  return Array.from(set);
}

/**
 * Generate a local TF-IDF style semantic dense embedding vector (dimension: 128)
 */
function generateLocalEmbedding(text) {
  const tokens = tokenize(text);
  const expanded = expandTokens(tokens);

  // 128-dimensional dense vector projection via consistent feature hashing
  const dim = 128;
  const vector = new Float32Array(dim);

  if (expanded.length === 0) return Array.from(vector);

  // Term frequency & character n-grams hashing
  const termCounts = {};
  for (const t of expanded) {
    termCounts[t] = (termCounts[t] || 0) + 1;
  }

  for (const [term, count] of Object.entries(termCounts)) {
    // Hash term
    let hash = 0;
    for (let i = 0; i < term.length; i++) {
      hash = (hash << 5) - hash + term.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dim;
    const weight = Math.log(1 + count) * (tokens.includes(term) ? 1.0 : 0.65);
    vector[idx] += weight;

    // Subword bigrams/trigrams for partial stems (e.g. "sneak" in "sneakers")
    if (term.length >= 4) {
      for (let i = 0; i <= term.length - 3; i++) {
        const sub = term.slice(i, i + 3);
        let subHash = 0;
        for (let j = 0; j < sub.length; j++) {
          subHash = (subHash << 5) - subHash + sub.charCodeAt(j);
          subHash |= 0;
        }
        const subIdx = Math.abs(subHash) % dim;
        vector[subIdx] += 0.25;
      }
    }
  }

  // L2 Normalize
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) {
      vector[i] /= norm;
    }
  }

  return Array.from(vector);
}

/**
 * Compute cosine similarity between two dense vectors
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  const sim = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.max(0, Math.min(1, sim));
}

/**
 * Get Embedding for a given text.
 * Pluggable architecture: Checks GEMINI_API_KEY for remote Gemini text-embedding-004,
 * and seamlessly falls back to high-resolution local vectorizer.
 */
async function getEmbedding(text) {
  const cleanText = (text || '').trim();
  if (!cleanText) return generateLocalEmbedding('');

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'models/text-embedding-004',
            content: { parts: [{ text: cleanText }] },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data?.embedding?.values) {
          return data.embedding.values;
        }
      }
    } catch {
      // Remote API unavailable or network timeout; fallback safely to local
    }
  }

  return generateLocalEmbedding(cleanText);
}

/**
 * Compute semantic similarity between two text snippets (0.0 to 1.0)
 */
async function computeSemanticSimilarity(textA, textB) {
  if (!textA || !textB) return 0;
  const [vecA, vecB] = await Promise.all([getEmbedding(textA), getEmbedding(textB)]);
  return cosineSimilarity(vecA, vecB);
}

module.exports = {
  getEmbedding,
  computeSemanticSimilarity,
  cosineSimilarity,
  tokenize,
  expandTokens,
};

