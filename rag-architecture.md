# PPVentures RAG System Architecture

## Executive Summary

Production-ready Retrieval Augmented Generation system for PPVentures AI Automation Service. Enables AI agents to answer questions based on clients' private documents with hallucination prevention and validation.

---

## System Architecture

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│  Client    │────▶│  RAG API       │────▶│  Hybrid     │
│  Dashboard │     │  (Next.js)     │     │  Retrieval  │
└─────────────┘     └─────────────────┘     └──────────────┘
                          │                        │
                          ▼                        ▼
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│  Document   │────▶│  Chunking      │────▶│  Embedding   │
│  Upload    │     │  Pipeline      │     │  (OpenAI)   │
└─────────────┘     └─────────────────┘     └──────────────┘
                                                       │
                                                       ▼
                                              ┌──────────────┐
                                              │  pgvector    │
                                              │  Store       │
                                              └──────────────┘
```

## Components

### 1. Document Ingestion Pipeline
- **Supported formats:** PDF, DOCX, HTML, TXT, CSV, MD
- **Structure extraction:** Headings, paragraphs, tables, code blocks
- **Chunking:** Structure-aware, 256-512 tokens with overlap
- **Metadata:** Summary, keywords, hypothetical questions, source info

### 2. Hybrid Retrieval Engine
- **Vector search:** Semantic similarity via embeddings
- **Keyword search:** Full-text search for exact matches
- **Reranking:** Combine and score results
- **Metadata filtering:** Client-scoped queries
- **Hypothetical questions:** Match against pre-generated questions

### 3. Reasoning Engine
- **Simple queries:** Single retrieval + answer
- **Complex queries:** Multi-step with sub-query planning
- **Synthesis:** Combine multiple sources

### 4. Validation Layer
- **Gatekeeper:** Does answer match question?
- **Auditor:** Are claims grounded in context?
- **Strategist:** Does response make sense?
- **Retry logic:** Refine query on failure

### 5. Evaluation System
- Faithfulness score (0-1)
- Relevance score (0-1)
- Latency tracking
- Query logging

---

## Database Schema

### rag_documents
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| client_id | UUID | FK to clients |
| title | TEXT | Document title |
| file_type | TEXT | pdf, docx, etc |
| status | TEXT | processing/ready/failed |
| created_at | TIMESTAMPTZ | Creation time |

### rag_chunks
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| document_id | UUID | FK to documents |
| client_id | UUID | FK to clients |
| content | TEXT | Chunk text |
| summary | TEXT | Auto-generated |
| keywords | TEXT[] | Extracted keywords |
| hypothetical_questions | TEXT[] | Generated questions |
| embedding | VECTOR(1536) | OpenAI embedding |

### rag_queries
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| client_id | UUID | FK to clients |
| query | TEXT | User query |
| final_answer | TEXT | Generated answer |
| faithfulness_score | NUMERIC | 0-1 score |
| relevance_score | NUMERIC | 0-1 score |
| latency_ms | INTEGER | Processing time |

---

## API Endpoints

### Public (Client Dashboard)
- `POST /api/rag/query` - Ask questions
- `POST /api/rag/upload` - Upload documents
- `GET /api/rag/documents` - List documents

### Admin (Command Centre)
- `GET /api/rag/admin/documents` - All documents
- `GET /api/rag/admin/analytics` - Stats
- `POST /api/rag/admin/reindex` - Rebuild embeddings

---

## Security

- Client isolation via client_id filtering
- No cross-client document access
- Input sanitization for prompt injection
- Rate limiting on queries

---

## Success Metrics

- >0.9 faithfulness score average
- <2s average latency
- 100% client isolation

---

*Document Version: 1.0*
*Created: March 9, 2026*
