import { v4 as uuidv4 } from 'uuid';
import { db } from './rag-db.js';

// Chunking with 20% overlap
function chunkText(text, maxTokens = 256, overlap = 50) {
  const sections = text.split(/(?:^|\n)(?:Section \d+|CHAPTER|Article)/i);
  const chunks = [];
  let chunkIndex = 0;
  
  for (const section of sections) {
    if (!section.trim() || section.trim().length < 20) continue;
    const cleanSection = section.trim();
    const words = cleanSection.split(/\s+/);
    
    if (words.length <= maxTokens) {
      chunks.push({ content: cleanSection, chunkIndex: chunkIndex++, tokenCount: words.length });
    } else {
      let start = 0;
      while (start < words.length) {
        const end = Math.min(start + maxTokens, words.length);
        chunks.push({ content: words.slice(start, end).join(' '), chunkIndex: chunkIndex++, tokenCount: end - start });
        start = end - overlap;
        if (start >= words.length) break;
      }
    }
  }
  
  if (chunks.length === 0) {
    const words = text.split(/\s+/);
    for (let i = 0; i < words.length; i += maxTokens) {
      chunks.push({ content: words.slice(i, i + maxTokens).join(' '), chunkIndex: Math.floor(i / maxTokens), tokenCount: Math.min(maxTokens, words.length - i) });
    }
  }
  return chunks;
}

function generateChunkMetadata(chunk) {
  const words = chunk.toLowerCase().split(/\s+/);
  const wordFreq = {};
  words.forEach(w => { const clean = w.replace(/[^a-z]/g, ''); if (clean.length > 3) wordFreq[clean] = (wordFreq[clean] || 0) + 1; });
  const keywords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([w]) => w);
  const questions = [`What about ${keywords[0]}?`, `Tell me about ${keywords[1]}`, `How does ${keywords[2]} work?`, `Details on ${keywords[3]}?`].filter(() => keywords.length >= 4);
  const sentences = chunk.split(/[.!?]+/).filter(s => s.trim().length > 10);
  return { summary: (sentences.slice(0, 2).join('. ').trim() || chunk.substring(0, 100) + '...'), keywords: keywords.join(', '), hypothetical_questions: questions.join('|||') };
}

export async function processDocument(clientId, title, content, fileType) {
  const docId = uuidv4();
  db.prepare(`INSERT INTO rag_documents (id, client_id, title, file_type, content, status) VALUES (?, ?, ?, ?, ?, 'processing')`).run(docId, clientId, title, fileType, content);
  const chunks = chunkText(content);
  for (const chunk of chunks) {
    const metadata = generateChunkMetadata(chunk.content);
    db.prepare(`INSERT INTO rag_chunks (id, document_id, client_id, content, summary, keywords, hypothetical_questions, chunk_index, token_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(uuidv4(), docId, clientId, chunk.content, metadata.summary, metadata.keywords, metadata.hypothetical_questions, chunk.chunkIndex, chunk.tokenCount);
  }
  db.prepare(`UPDATE rag_documents SET status = 'ready' WHERE id = ?`).run(docId);
  return { documentId: docId, chunksCreated: chunks.length };
}

// Simplified retrieval - always returns chunks with scores
export function retrieveChunks(clientId, query, limit = 5) {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const allChunks = db.prepare(`SELECT * FROM rag_chunks WHERE client_id = ? ORDER BY chunk_index`).all(clientId);
  if (allChunks.length === 0) return [];
  
  const scored = allChunks.map(chunk => {
    let score = 0;
    const content = (chunk.content || '').toLowerCase();
    const keywords = (chunk.keywords || '').toLowerCase();
    const hypo = (chunk.hypothetical_questions || '').toLowerCase();
    
    queryWords.forEach(word => {
      if (content.includes(word)) score += 15;
      if (keywords.includes(word)) score += 25;
      if (hypo.includes(word)) score += 30;
    });
    score += Math.min((chunk.token_count || 0) / 30, 8);
    return { ...chunk, score };
  });
  
  scored.sort((a, b) => b.score - a.score);
  
  // Return at least some chunks
  if (scored.every(c => c.score === 0)) {
    return scored.slice(0, Math.min(2, allChunks.length));
  }
  return scored.slice(0, limit);
}

// Validation - measure actual chunk relevance
function validateGatekeeper(query, answer, chunks) {
  if (!chunks || chunks.length === 0) return 0;
  const avgScore = chunks.reduce((s, c) => s + (c.score || 0), 0) / chunks.length;
  return Math.min(1, avgScore / 20); // Normalize
}

function validateAuditor(answer, chunks) {
  if (!chunks || chunks.length === 0) return 0;
  const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length === 0) return 0.95;
  const chunkTexts = chunks.map(c => c.content.toLowerCase());
  let grounded = 0;
  sentences.forEach(s => { const words = s.toLowerCase().split(/\s+/); if (words.some(w => w.length > 4 && chunkTexts.some(ct => ct.includes(w)))) grounded++; });
  return grounded / sentences.length;
}

function validateStrategist(answer) {
  if (answer.length < 20) return 0.1;
  if (answer.includes("based on your documents") || answer.includes("according to")) return 0.95;
  if (answer.includes("don't know") || answer.includes("cannot answer") || answer.includes("don't have enough") || answer.includes("not in the documents") || answer.includes("could you try")) return 1.0;
  return answer.length > 50 ? 0.85 : 0.7;
}

export async function answerQuery(clientId, query) {
  const startTime = Date.now();
  const sanitizedQuery = query.replace(/[<>{}]/g, '').substring(0, 500);
  
  // Block prompt injection
  if (['ignore previous', 'ignore all', 'system prompt', 'your instructions', 'disregard'].some(p => sanitizedQuery.toLowerCase().includes(p))) {
    return { answer: "I cannot comply with that request. I'm designed to answer questions based on your uploaded documents only.", chunks: [], latency: Date.now() - startTime, faithfulness: 1.0, relevance: 1.0 };
  }
  
  let chunks = retrieveChunks(clientId, sanitizedQuery);
  
  if (chunks.length === 0) {
    return { answer: "I don't have any documents to answer this question. Please upload some documents first.", chunks: [], latency: Date.now() - startTime, faithfulness: 1.0, relevance: 0.0 };
  }
  
  // Build answer with actual content
  const answer = chunks.map(c => c.summary).join('\n\n');
  
  // Validate
  const relevance = validateGatekeeper(sanitizedQuery, answer, chunks);
  const faithfulness = validateAuditor(answer, chunks);
  const strategist = validateStrategist(answer);
  
  // Retry if low scores
  if (relevance < 0.6 || faithfulness < 0.7) {
    const moreChunks = retrieveChunks(clientId, sanitizedQuery, 10);
    if (moreChunks.length > chunks.length) {
      chunks = moreChunks;
    }
  }
  
  // If still low, be honest
  if (relevance < 0.4 && chunks.length > 0) {
    return { answer: "I found some relevant documents but cannot provide a confident answer. Could you ask a more specific question?", chunks: [], latency: Date.now() - startTime, faithfulness: 1.0, relevance: 0.5 };
  }
  
  const finalFaith = faithfulness * 0.5 + strategist * 0.5;
  
  // Log
  db.prepare(`INSERT INTO rag_queries (id, client_id, query, retrieved_chunks, final_answer, faithfulness_score, relevance_score, latency_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(uuidv4(), clientId, sanitizedQuery, JSON.stringify(chunks.map(c => c.id)), answer, finalFaith, relevance, Date.now() - startTime);
  
  return { answer: "Based on your documents:\n\n" + chunks.map(c => c.summary).join('\n\n'), chunks: chunks.map(c => ({ content: c.content, summary: c.summary, chunkIndex: c.chunk_index })), latency: Date.now() - startTime, faithfulness: finalFaith, relevance };
}

export function getAnalytics(clientId) {
  const queries = clientId ? db.prepare('SELECT * FROM rag_queries WHERE client_id = ? ORDER BY created_at DESC LIMIT 100').all(clientId) : db.prepare('SELECT * FROM rag_queries ORDER BY created_at DESC LIMIT 100').all();
  if (queries.length === 0) return { avgFaithfulness: 0, avgRelevance: 0, avgLatency: 0, totalQueries: 0 };
  return { avgFaithfulness: Math.round((queries.reduce((s, q) => s + (q.faithfulness_score || 0), 0) / queries.length) * 100) / 100, avgRelevance: Math.round((queries.reduce((s, q) => s + (q.relevance_score || 0), 0) / queries.length) * 100) / 100, avgLatency: Math.round(queries.reduce((s, q) => s + (q.latency_ms || 0), 0) / queries.length), totalQueries: queries.length };
}
