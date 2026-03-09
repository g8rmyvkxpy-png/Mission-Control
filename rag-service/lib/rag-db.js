import Database from 'better-sqlite3';
import path from 'path';

// Use the existing automation database
const dbPath = path.join(process.cwd(), '..', 'ai-automation-service', 'data', 'automation.db');
export const db = new Database(dbPath);

// Initialize RAG tables
db.exec(`
  CREATE TABLE IF NOT EXISTS rag_documents (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    title TEXT NOT NULL,
    file_type TEXT,
    status TEXT DEFAULT 'processing',
    content TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS rag_chunks (
    id TEXT PRIMARY KEY,
    document_id TEXT,
    client_id TEXT,
    content TEXT NOT NULL,
    summary TEXT,
    keywords TEXT,
    hypothetical_questions TEXT,
    chunk_index INTEGER,
    token_count INTEGER,
    metadata TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES rag_documents(id),
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS rag_queries (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    query TEXT NOT NULL,
    retrieved_chunks TEXT,
    final_answer TEXT,
    faithfulness_score REAL,
    relevance_score REAL,
    latency_ms INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );

  CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON rag_chunks(document_id);
  CREATE INDEX IF NOT EXISTS idx_chunks_client_id ON rag_chunks(client_id);
  CREATE INDEX IF NOT EXISTS idx_queries_client_id ON rag_queries(client_id);
`);

console.log('RAG tables initialized');
