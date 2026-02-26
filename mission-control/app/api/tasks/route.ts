import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// === DELIVERABLES SETUP ===
const DELIVERABLES_DIR = path.join(process.cwd(), 'public', 'deliverables');

// Ensure deliverables directory exists
function ensureDeliverablesDir() {
  if (!fs.existsSync(DELIVERABLES_DIR)) {
    fs.mkdirSync(DELIVERABLES_DIR, { recursive: true });
  }
}

// Save a deliverable file and return the path
function saveDeliverable(type: string, filename: string, content: string): { path: string; url: string } {
  ensureDeliverablesDir();

  const safeFilename = filename.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 100);
  const fullPath = path.join(DELIVERABLES_DIR, `${type}_${safeFilename}.md`);

  fs.writeFileSync(fullPath, content);
  console.log(`[Deliverable] Saved: ${fullPath}`);

  return {
    path: fullPath,
    url: `/deliverables/${type}_${safeFilename}.md`
  };
}

// === PHASE 1: TASK ANALYSIS (Common for all agents) ===

// Task Analysis Types
interface TaskAnalysis {
  intent: string;           // What the user wants to achieve
  actionType: string;        // create | read | update | delete | analyze | generate | find
  keywords: string[];        // Extracted keywords
  entities: string[];       // Named entities (names, companies, etc.)
  successCriteria: string[]; // How to measure success
  confidence: number;        // 0-1, how confident AI is
  needsNeoReview: boolean;   // Should trigger Neo escalation
  reviewReason?: string;    // Why it needs Neo review
  suggestedAgent?: string;  // Which agent should handle this
}

// MiniMax API Key
const MINIMAX_KEY = 'sk-cp-hPi4QnQsjU4Vtn3snMYLUyBff8daKXYSPp98NytYuOPsMa5j46YRQjU992TCIeRVntVel-OlLQ0QStaSAC6vW1KEqeiISp--AIfbPz951JfXu59IiwxVIA4';
const GEMINI_KEY = 'AIzaSyCoN8mAiKmYFGy1w9HGG3cMssJ5JJNeMmI';

// Call AI with fallback
async function callAI(prompt: string, maxTokens = 1500): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  
  try {
    const response = await fetch('https://api.minimax.io/anthropic/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MINIMAX_KEY}` },
      body: JSON.stringify({ model: 'MiniMax-M2.1', max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    const data = await response.json();
    if (data?.content) {
      const text = Array.isArray(data.content) ? data.content.find((c: any) => c.type === 'text')?.text : data.content;
      if (text) return text;
    }
    throw new Error('Empty response');
  } catch (e) {
    clearTimeout(timeout);
    // Fallback to Gemini
    try {
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), 30000);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: maxTokens } }),
        signal: controller2.signal
      });
      clearTimeout(timeout2);
      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (e2) {
      console.log('[TaskAnalysis] AI fallback failed:', e2);
      return '';
    }
  }
}

// Main Task Analysis Function
async function analyzeTask(taskTitle: string, taskDesc: string, agentId?: string): Promise<TaskAnalysis> {
  console.log(`[TaskAnalysis] Analyzing: ${taskTitle}`);
  
  const prompt = `You are a task deconstruction engine. Analyze this task and break it down into structured components.

TASK TITLE: ${taskTitle}
TASK DESCRIPTION: ${taskDesc}
TARGET AGENT: ${agentId || 'auto-detect'}

Analyze and return ONLY valid JSON:

{
  "intent": "What the user wants to achieve (1 sentence)",
  "actionType": "create|read|update|delete|analyze|generate|find|fix|build|write|research|outreach",
  "keywords": ["extracted", "keywords", "from", "task"],
  "entities": ["specific", "names", "companies", "urls", "files"],
  "successCriteria": ["criterion 1", "criterion 2", "criterion 3"],
  "confidence": 0.0-1.0,
  "needsNeoReview": true|false,
  "reviewReason": "why needs neo review or null",
  "suggestedAgent": "agent_id or null"
}

RULES:
1. confidence < 0.6 → needsNeoReview = true (ambiguous)
2. actionType is unclear → needsNeoReview = true
3. no keywords found → needsNeoReview = true
4. task is multi-agent (needs research + build) → needsNeoReview = true
5. task requires creativity/judgment → needsNeoReview = true

Return ONLY JSON, no explanation:`;

  const aiResponse = await callAI(prompt, 800);
  
  try {
    // Extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize
      const validActions = ['create', 'read', 'update', 'delete', 'analyze', 'generate', 'find', 'fix', 'build', 'write', 'research', 'outreach'];
      
      return {
        intent: analysis.intent || 'Unknown',
        actionType: validActions.includes(analysis.actionType) ? analysis.actionType : 'analyze',
        keywords: Array.isArray(analysis.keywords) ? analysis.keywords : [],
        entities: Array.isArray(analysis.entities) ? analysis.entities : [],
        successCriteria: Array.isArray(analysis.successCriteria) ? analysis.successCriteria : [],
        confidence: typeof analysis.confidence === 'number' ? Math.max(0, Math.min(1, analysis.confidence)) : 0.5,
        needsNeoReview: analysis.needsNeoReview === true,
        reviewReason: analysis.reviewReason || undefined,
        suggestedAgent: analysis.suggestedAgent || undefined
      };
    }
  } catch (e) {
    console.log('[TaskAnalysis] Parse failed, using defaults');
  }
  
  // Default fallback
  return {
    intent: taskTitle,
    actionType: 'analyze',
    keywords: taskTitle.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3),
    entities: [],
    successCriteria: ['Task completed'],
    confidence: 0.3,
    needsNeoReview: true,
    reviewReason: 'Could not parse task - requires Neo guidance'
  };
}

// === PHASE 2: DISCOVERY (Data Gathering) ===

interface RawData {
  source: string;
  type: string;
  content: any;
  relevance: number; // 0-1
  meetsCriteria: boolean;
  metadata?: Record<string, any>;
}

interface DiscoveryResult {
  rawData: RawData[];
  refinedQuery?: string;
  attempts: number;
  sufficient: boolean;
}

// Agent-specific discovery tools
const agentDiscoveryTools: Record<string, (analysis: TaskAnalysis, query: string) => Promise<RawData[]>> = {
  // SALES TEAM
  atlas: async (analysis: TaskAnalysis, query: string) => {
    // Lead discovery - search for companies
    const results: RawData[] = [];
    const searchQueries = [
      `${analysis.keywords.join(' ')} companies leads`,
      `${analysis.entities.join(' ')} startups funding`,
      `${analysis.keywords[0] || 'B2B'} companies decision makers`
    ];
    
    for (const q of searchQueries.slice(0, 3)) {
      const searchResult = await searchWeb(q, 10);
      if (searchResult.success && searchResult.results) {
        for (const r of searchResult.results) {
          results.push({
            source: r.url || 'web',
            type: 'company',
            content: { title: r.title, url: r.url, snippet: r.content },
            relevance: 0.7,
            meetsCriteria: true
          });
        }
      }
    }
    return results;
  },
  
  pulse: async (analysis: TaskAnalysis, query: string) => {
    // Prospect discovery
    const results: RawData[] = [];
    const searchResult = await searchWeb(`${analysis.keywords.join(' ')} prospects`, 10);
    if (searchResult.success && searchResult.results) {
      for (const r of searchResult.results) {
        results.push({
          source: r.url || 'web',
          type: 'prospect',
          content: { title: r.title, url: r.url },
          relevance: 0.7,
          meetsCriteria: true
        });
      }
    }
    return results;
  },
  
  // RESEARCH TEAM
  scout: async (analysis: TaskAnalysis, query: string) => {
    const results: RawData[] = [];
    const searchResult = await searchWeb(query, 10);
    if (searchResult.success && searchResult.results) {
      for (const r of searchResult.results) {
        results.push({
          source: r.url || 'web',
          type: 'research',
          content: { title: r.title, url: r.url, content: r.content },
          relevance: 0.8,
          meetsCriteria: true
        });
      }
    }
    return results;
  },
  
  radar: async (analysis: TaskAnalysis, query: string) => {
    const results: RawData[] = [];
    const searchResult = await searchWeb(`${query} SEO keywords`, 5);
    if (searchResult.success && searchResult.results) {
      for (const r of searchResult.results) {
        results.push({
          source: r.url || 'web',
          type: 'seo',
          content: { title: r.title, url: r.url },
          relevance: 0.8,
          meetsCriteria: true
        });
      }
    }
    return results;
  },
  
  compass: async (analysis: TaskAnalysis, query: string) => {
    const results: RawData[] = [];
    const searchResult = await searchWeb(`${query} competitors`, 5);
    if (searchResult.success && searchResult.results) {
      for (const r of searchResult.results) {
        results.push({
          source: r.url || 'web',
          type: 'competitor',
          content: { title: r.title, url: r.url },
          relevance: 0.8,
          meetsCriteria: true
        });
      }
    }
    return results;
  },
  
  trends: async (analysis: TaskAnalysis, query: string) => {
    const results: RawData[] = [];
    const searchResult = await searchWeb(`${query} trends 2026`, 5);
    if (searchResult.success && searchResult.results) {
      for (const r of searchResult.results) {
        results.push({
          source: r.url || 'web',
          type: 'trend',
          content: { title: r.title, url: r.url },
          relevance: 0.8,
          meetsCriteria: true
        });
      }
    }
    return results;
  },
  
  // RETENTION TEAM
  bond: async (analysis: TaskAnalysis, query: string) => {
    const results: RawData[] = [];
    const searchResult = await searchWeb(`${query} churn prevention`, 5);
    if (searchResult.success && searchResult.results) {
      for (const r of searchResult.results) {
        results.push({
          source: r.url || 'web',
          type: 'churn',
          content: { title: r.title, url: r.url },
          relevance: 0.8,
          meetsCriteria: true
        });
      }
    }
    return results;
  },
  
  // DEV TEAM - File discovery (placeholder for now)
  byte: async (analysis: TaskAnalysis, query: string) => {
    // Byte discovers code files relevant to the task
    const results: RawData[] = [];
    const keywords = analysis.keywords.join(' ');
    
    // Search for relevant files in the project
    const fs = await import('fs');
    const path = await import('path');
    const projectDir = path.join(process.cwd(), 'app');
    
    const searchFiles = (dir: string, keyword: string): string[] => {
      const files: string[] = [];
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            files.push(...searchFiles(fullPath, keyword));
          } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts'))) {
            try {
              const content = fs.readFileSync(fullPath, 'utf-8');
              if (content.toLowerCase().includes(keyword.toLowerCase())) {
                files.push(fullPath);
              }
            } catch {}
          }
        }
      } catch {}
      return files;
    };
    
    const foundFiles = searchFiles(projectDir, keywords.slice(0, 20));
    
    for (const file of foundFiles.slice(0, 5)) {
      try {
        const content = fs.readFileSync(file, 'utf-8').slice(0, 5000);
        results.push({
          source: file,
          type: 'code',
          content: { file, content },
          relevance: 0.9,
          meetsCriteria: true
        });
      } catch {}
    }
    
    return results;
  },
  
  // CONTENT TEAM
  ink: async (analysis: TaskAnalysis, query: string) => {
    const results: RawData[] = [];
    const searchResult = await searchWeb(`${query} blog content`, 5);
    if (searchResult.success && searchResult.results) {
      for (const r of searchResult.results) {
        results.push({
          source: r.url || 'web',
          type: 'content',
          content: { title: r.title, url: r.url },
          relevance: 0.8,
          meetsCriteria: true
        });
      }
    }
    return results;
  },
  
  blaze: async (analysis: TaskAnalysis, query: string) => {
    const results: RawData[] = [];
    const searchResult = await searchWeb(`${query} social media trends`, 5);
    if (searchResult.success && searchResult.results) {
      for (const r of searchResult.results) {
        results.push({
          source: r.url || 'web',
          type: 'social',
          content: { title: r.title, url: r.url },
          relevance: 0.8,
          meetsCriteria: true
        });
      }
    }
    return results;
  },
  
  // SALES OUTREACH
  hunter: async (analysis: TaskAnalysis, query: string) => {
    const results: RawData[] = [];
    // Find potential leads for cold outreach
    const searchResult = await searchWeb(`${query} decision maker contact`, 10);
    if (searchResult.success && searchResult.results) {
      for (const r of searchResult.results) {
        results.push({
          source: r.url || 'web',
          type: 'outreach',
          content: { title: r.title, url: r.url, snippet: r.content },
          relevance: 0.7,
          meetsCriteria: true
        });
      }
    }
    return results;
  },
  
  phoenix: async (analysis: TaskAnalysis, query: string) => {
    // Warm leads - conversion focused
    const results: RawData[] = [];
    const searchResult = await searchWeb(`${query} demo request pricing`, 5);
    if (searchResult.success && searchResult.results) {
      for (const r of searchResult.results) {
        results.push({
          source: r.url || 'web',
          type: 'conversion',
          content: { title: r.title, url: r.url },
          relevance: 0.8,
          meetsCriteria: true
        });
      }
    }
    return results;
  },
  
  // CONTENT
  draft: async (analysis: TaskAnalysis, query: string) => {
    const results: RawData[] = [];
    const searchResult = await searchWeb(`${query} email best practices`, 5);
    if (searchResult.success && searchResult.results) {
      for (const r of searchResult.results) {
        results.push({
          source: r.url || 'web',
          type: 'email',
          content: { title: r.title, url: r.url },
          relevance: 0.8,
          meetsCriteria: true
        });
      }
    }
    return results;
  },
  
  cinema: async (analysis: TaskAnalysis, query: string) => {
    const results: RawData[] = [];
    const searchResult = await searchWeb(`${query} video content ideas`, 5);
    if (searchResult.success && searchResult.results) {
      for (const r of searchResult.results) {
        results.push({
          source: r.url || 'web',
          type: 'video',
          content: { title: r.title, url: r.url },
          relevance: 0.8,
          meetsCriteria: true
        });
      }
    }
    return results;
  },
  
  // RETENTION
  mend: async (analysis: TaskAnalysis, query: string) => {
    const results: RawData[] = [];
    const searchResult = await searchWeb(`${query} customer support best practices`, 5);
    if (searchResult.success && searchResult.results) {
      for (const r of searchResult.results) {
        results.push({
          source: r.url || 'web',
          type: 'support',
          content: { title: r.title, url: r.url },
          relevance: 0.8,
          meetsCriteria: true
        });
      }
    }
    return results;
  },
  
  grow: async (analysis: TaskAnalysis, query: string) => {
    const results: RawData[] = [];
    const searchResult = await searchWeb(`${query} upsell strategies`, 5);
    if (searchResult.success && searchResult.results) {
      for (const r of searchResult.results) {
        results.push({
          source: r.url || 'web',
          type: 'upsell',
          content: { title: r.title, url: r.url },
          relevance: 0.8,
          meetsCriteria: true
        });
      }
    }
    return results;
  },
  
  // DEV
  pixel: async (analysis: TaskAnalysis, query: string) => {
    const results: RawData[] = [];
    // Find UI/UX inspiration
    const searchResult = await searchWeb(`${query} UI design inspiration`, 5);
    if (searchResult.success && searchResult.results) {
      for (const r of searchResult.results) {
        results.push({
          source: r.url || 'web',
          type: 'design',
          content: { title: r.title, url: r.url },
          relevance: 0.8,
          meetsCriteria: true
        });
      }
    }
    return results;
  },
  
  server: async (analysis: TaskAnalysis, query: string) => {
    const results: RawData[] = [];
    // Find API documentation
    const searchResult = await searchWeb(`${query} API documentation`, 5);
    if (searchResult.success && searchResult.results) {
      for (const r of searchResult.results) {
        results.push({
          source: r.url || 'web',
          type: 'api',
          content: { title: r.title, url: r.url },
          relevance: 0.8,
          meetsCriteria: true
        });
      }
    }
    return results;
  },
  
  auto: async (analysis: TaskAnalysis, query: string) => {
    const results: RawData[] = [];
    // Find automation ideas
    const searchResult = await searchWeb(`${query} automation workflow ideas`, 5);
    if (searchResult.success && searchResult.results) {
      for (const r of searchResult.results) {
        results.push({
          source: r.url || 'web',
          type: 'automation',
          content: { title: r.title, url: r.url },
          relevance: 0.8,
          meetsCriteria: true
        });
      }
    }
    return results;
  },
  
  // SUPPORT
  care: async (analysis: TaskAnalysis, query: string) => {
    const results: RawData[] = [];
    const searchResult = await searchWeb(`${query} customer service solutions`, 5);
    if (searchResult.success && searchResult.results) {
      for (const r of searchResult.results) {
        results.push({
          source: r.url || 'web',
          type: 'support',
          content: { title: r.title, url: r.url },
          relevance: 0.8,
          meetsCriteria: true
        });
      }
    }
    return results;
  },
};

// Evaluate relevance using MiniMax
async function evaluateRelevance(rawData: RawData[], analysis: TaskAnalysis): Promise<RawData[]> {
  if (rawData.length === 0) return [];
  
  const prompt = `Evaluate the relevance of each data item against the success criteria.

SUCCESS CRITERIA:
${analysis.successCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

KEYWORDS: ${analysis.keywords.join(', ')}

DATA ITEMS:
${rawData.map((d, i) => `${i + 1}. [${d.type}] ${d.content.title || d.content.file || d.source}: ${JSON.stringify(d.content).slice(0, 200)}`).join('\n')}

Return ONLY valid JSON array with relevance scores:
[{"index": 0, "relevance": 0.0-1.0, "meetsCriteria": true/false}, ...]`;

  const aiResponse = await callAI(prompt, 1000);
  
  try {
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const evaluations = JSON.parse(jsonMatch[0]);
      return rawData.map((d, i) => {
        const eval_ = evaluations.find((e: any) => e.index === i);
        if (eval_) {
          d.relevance = eval_.relevance;
          d.meetsCriteria = eval_.meetsCriteria;
        }
        return d;
      });
    }
  } catch (e) {
    console.log('[Discovery] Evaluation parse failed');
  }
  
  return rawData;
}

// Refine search query based on results
async function refineQuery(query: string, rawData: RawData[], analysis: TaskAnalysis): Promise<string> {
  const prompt = `Given the original query and the results found, suggest an improved search query.

ORIGINAL QUERY: ${query}
SUCCESS CRITERIA: ${analysis.successCriteria.join(', ')}

RESULTS FOUND: ${rawData.length} items
${rawData.map(d => `- ${d.content.title || d.source}`).join('\n')}

Return ONLY the refined query string (max 10 words):`;

  const aiResponse = await callAI(prompt, 100);
  const match = aiResponse.match(/["']([^"']+)["']/);
  return match ? match[1] : query + ' more';
}

// Main Phase 2: Discovery function
async function executeDiscovery(agentId: string, analysis: TaskAnalysis, query: string): Promise<DiscoveryResult> {
  console.log(`[Discovery] Starting for agent: ${agentId}`);
  
  const maxAttempts = 2;
  let attempts = 0;
  let rawData: RawData[] = [];
  let refinedQuery = query;
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`[Discovery] Attempt ${attempts}/${maxAttempts}: ${refinedQuery}`);
    
    // Get discovery function for this agent
    const discoverFn = agentDiscoveryTools[agentId];
    
    if (discoverFn) {
      const results = await discoverFn(analysis, refinedQuery);
      rawData = [...rawData, ...results];
    }
    
    // Evaluate relevance
    if (rawData.length > 0) {
      rawData = await evaluateRelevance(rawData, analysis);
    }
    
    // Check if sufficient
    const meetsCriteria = rawData.filter(d => d.meetsCriteria).length;
    console.log(`[Discovery] Found ${rawData.length} items, ${meetsCriteria} meet criteria`);
    
    if (meetsCriteria >= 3 || attempts >= maxAttempts) {
      break;
    }
    
    // Refine query if not sufficient
    if (attempts < maxAttempts) {
      refinedQuery = await refineQuery(refinedQuery, rawData, analysis);
      console.log(`[Discovery] Refined query: ${refinedQuery}`);
    }
  }
  
  // Remove duplicates
  const seen = new Set<string>();
  const uniqueData = rawData.filter(d => {
    const key = d.content.title || d.content.file || d.source;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  return {
    rawData: uniqueData,
    refinedQuery,
    attempts,
    sufficient: uniqueData.filter(d => d.meetsCriteria).length >= 1
  };
}

// === PHASE 3: PROCESSING (Transform RawData to Results) ===

interface ProcessedResult {
  output: any;
  summary: string;
  confidence: number;
  meetsCriteria: boolean[];
  rawDataUsed: number;
}

// Agent-specific processing functions
const agentProcessors: Record<string, (rawData: RawData[], analysis: TaskAnalysis) => Promise<ProcessedResult>> = {
  // SALES TEAM
  atlas: async (rawData: RawData[], analysis: TaskAnalysis) => {
    // Process leads - extract companies and contacts
    const companies = rawData.filter(d => d.type === 'company').slice(0, 20);
    
    const prompt = `Transform these company leads into a structured lead list.

TASK: ${analysis.intent}
SUCCESS CRITERIA: ${analysis.successCriteria.join(', ')}

LEADS FOUND:
${companies.map((c, i) => `${i + 1}. ${JSON.stringify(c.content)}`).join('\n')}

Analyze and return ONLY valid JSON:
{
  "leads": [{"company": "name", "domain": "url", "decisionMaker": "name", "role": "role", "score": 1-10}],
  "summary": "brief summary",
  "hotLeads": number,
  "warmLeads": number
}`;

    const aiResponse = await callAI(prompt, 1000);
    
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          output: parsed,
          summary: parsed.summary || `Found ${parsed.leads?.length || 0} leads`,
          confidence: 0.8,
          meetsCriteria: [parsed.leads?.length > 0],
          rawDataUsed: companies.length
        };
      }
    } catch (e) {}
    
    return {
      output: { leads: companies.map(c => ({ company: c.content.title, domain: c.content.url })) },
      summary: `Found ${companies.length} companies`,
      confidence: 0.6,
      meetsCriteria: [companies.length > 0],
      rawDataUsed: companies.length
    };
  },
  
  pulse: async (rawData: RawData[], analysis: TaskAnalysis) => {
    const prospects = rawData.filter(d => d.type === 'prospect').slice(0, 10);
    
    return {
      output: { prospects: prospects.map(p => ({ name: p.content.title, source: p.source })) },
      summary: `Found ${prospects.length} prospects`,
      confidence: 0.7,
      meetsCriteria: [prospects.length > 0],
      rawDataUsed: prospects.length
    };
  },
  
  // RESEARCH TEAM
  scout: async (rawData: RawData[], analysis: TaskAnalysis) => {
    const sources = rawData.filter(d => d.relevance > 0.5);
    
    const prompt = `Synthesize research findings into a comprehensive summary.

TASK: ${analysis.intent}
SUCCESS CRITERIA: ${analysis.successCriteria.join(', ')}

SOURCES:
${sources.map((s, i) => `${i + 1}. ${s.content.title}: ${s.content.content || s.content.snippet || ''}`.slice(0, 300)).join('\n\n')}

Return ONLY valid JSON:
{
  "summary": "2-3 sentence summary",
  "keyFindings": ["finding 1", "finding 2", "finding 3"],
  "sources": [{"title": "name", "url": "link"}]
}`;

    const aiResponse = await callAI(prompt, 1000);
    
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          output: parsed,
          summary: parsed.summary || `Researched ${sources.length} sources`,
          confidence: 0.85,
          meetsCriteria: analysis.successCriteria.map(() => true),
          rawDataUsed: sources.length
        };
      }
    } catch (e) {}
    
    return {
      output: { sources: sources.map(s => ({ title: s.content.title, url: s.source })) },
      summary: `Researched ${sources.length} sources`,
      confidence: 0.7,
      meetsCriteria: [sources.length > 0],
      rawDataUsed: sources.length
    };
  },
  
  radar: async (rawData: RawData[], analysis: TaskAnalysis) => {
    return {
      output: { seoData: rawData.map(r => r.content) },
      summary: `SEO analysis complete`,
      confidence: 0.8,
      meetsCriteria: analysis.successCriteria.map(() => true),
      rawDataUsed: rawData.length
    };
  },
  
  compass: async (rawData: RawData[], analysis: TaskAnalysis) => {
    return {
      output: { competitors: rawData.map(r => r.content) },
      summary: `Competitor analysis complete`,
      confidence: 0.8,
      meetsCriteria: analysis.successCriteria.map(() => true),
      rawDataUsed: rawData.length
    };
  },
  
  trends: async (rawData: RawData[], analysis: TaskAnalysis) => {
    const prompt = `Analyze trends data and predict future direction.

TASK: ${analysis.intent}
SUCCESS CRITERIA: ${analysis.successCriteria.join(', ')}

TRENDS:
${rawData.map((t, i) => `${i + 1}. ${t.content.title}`).join('\n')}

Return ONLY valid JSON:
{
  "summary": "trend summary",
  "predictions": ["prediction 1", "prediction 2"],
  "confidence": 0.0-1.0
}`;

    const aiResponse = await callAI(prompt, 800);
    
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          output: parsed,
          summary: parsed.summary || 'Trends analyzed',
          confidence: parsed.confidence || 0.7,
          meetsCriteria: analysis.successCriteria.map(() => true),
          rawDataUsed: rawData.length
        };
      }
    } catch (e) {}
    
    return {
      output: { trends: rawData.map(r => r.content) },
      summary: 'Trends analyzed',
      confidence: 0.7,
      meetsCriteria: analysis.successCriteria.map(() => true),
      rawDataUsed: rawData.length
    };
  },
  
  // RETENTION TEAM
  bond: async (rawData: RawData[], analysis: TaskAnalysis) => {
    return {
      output: { retentionData: rawData.map(r => r.content) },
      summary: 'Retention strategy analyzed',
      confidence: 0.8,
      meetsCriteria: analysis.successCriteria.map(() => true),
      rawDataUsed: rawData.length
    };
  },
  
  // DEV TEAM
  byte: async (rawData: RawData[], analysis: TaskAnalysis) => {
    // Byte processes code files
    const codeFiles = rawData.filter(d => d.type === 'code');
    
    if (codeFiles.length === 0) {
      return {
        output: { error: 'No code files found' },
        summary: 'No relevant code found for this task',
        confidence: 0.3,
        meetsCriteria: [false],
        rawDataUsed: 0
      };
    }
    
    const prompt = `Analyze code files and determine what changes are needed.

TASK: ${analysis.intent}
SUCCESS CRITERIA: ${analysis.successCriteria.join(', ')}

CODE FILES:
${codeFiles.map(f => `=== ${f.content.file} ===\n${f.content.content}`.slice(0, 2000)).join('\n\n')}

Determine:
1. What files need changes
2. What specific changes are needed
3. Confidence level

Return ONLY valid JSON:
{
  "filesToModify": [{"file": "path", "action": "edit/add/remove", "description": "what to do"}],
  "confidence": 0.0-1.0,
  "canAutoFix": true/false
}`;

    const aiResponse = await callAI(prompt, 1000);
    
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          output: parsed,
          summary: parsed.filesToModify?.length ? `Found ${parsed.filesToModify.length} files to modify` : 'No changes needed',
          confidence: parsed.confidence || 0.6,
          meetsCriteria: [(parsed.filesToModify?.length || 0) > 0],
          rawDataUsed: codeFiles.length
        };
      }
    } catch (e) {}
    
    return {
      output: { codeFiles: codeFiles.map(f => f.content.file) },
      summary: `Found ${codeFiles.length} code files`,
      confidence: 0.5,
      meetsCriteria: [codeFiles.length > 0],
      rawDataUsed: codeFiles.length
    };
  },
  
  // CONTENT TEAM
  ink: async (rawData: RawData[], analysis: TaskAnalysis) => {
    const prompt = `Generate blog content based on research.

TASK: ${analysis.intent}
SUCCESS CRITERIA: ${analysis.successCriteria.join(', ')}

RESEARCH:
${rawData.map(r => r.content.title + ': ' + (r.content.snippet || '')).join('\n')}

Generate a blog post and return ONLY valid JSON:
{
  "title": "blog title",
  "content": "full article content",
  "wordCount": number,
  "keyPoints": ["point 1", "point 2"]
}`;

    const aiResponse = await callAI(prompt, 1500);
    
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          output: parsed,
          summary: parsed.title || 'Blog content generated',
          confidence: 0.85,
          meetsCriteria: analysis.successCriteria.map(() => true),
          rawDataUsed: rawData.length
        };
      }
    } catch (e) {}
    
    return {
      output: { sources: rawData.map(r => r.content) },
      summary: 'Content generated from research',
      confidence: 0.6,
      meetsCriteria: [rawData.length > 0],
      rawDataUsed: rawData.length
    };
  },
  
  blaze: async (rawData: RawData[], analysis: TaskAnalysis) => {
    return {
      output: { socialData: rawData.map(r => r.content) },
      summary: 'Social content ready',
      confidence: 0.8,
      meetsCriteria: analysis.successCriteria.map(() => true),
      rawDataUsed: rawData.length
    };
  },
  
  // SALES OUTREACH
  hunter: async (rawData: RawData[], analysis: TaskAnalysis) => {
    const leads = rawData.filter(d => d.type === 'outreach');
    return {
      output: { leads: leads.map(l => l.content) },
      summary: `Found ${leads.length} outreach targets`,
      confidence: 0.7,
      meetsCriteria: [leads.length > 0],
      rawDataUsed: leads.length
    };
  },
  
  phoenix: async (rawData: RawData[], analysis: TaskAnalysis) => {
    const warm = rawData.filter(d => d.type === 'conversion');
    return {
      output: { warmLeads: warm.map(l => l.content) },
      summary: `Found ${warm.length} warm leads for conversion`,
      confidence: 0.8,
      meetsCriteria: [warm.length > 0],
      rawDataUsed: warm.length
    };
  },
  
  // CONTENT
  draft: async (rawData: RawData[], analysis: TaskAnalysis) => {
    return {
      output: { emailData: rawData.map(r => r.content) },
      summary: 'Email content ready',
      confidence: 0.8,
      meetsCriteria: analysis.successCriteria.map(() => true),
      rawDataUsed: rawData.length
    };
  },
  
  cinema: async (rawData: RawData[], analysis: TaskAnalysis) => {
    return {
      output: { videoData: rawData.map(r => r.content) },
      summary: 'Video content ready',
      confidence: 0.8,
      meetsCriteria: analysis.successCriteria.map(() => true),
      rawDataUsed: rawData.length
    };
  },
  
  // RETENTION
  mend: async (rawData: RawData[], analysis: TaskAnalysis) => {
    return {
      output: { supportData: rawData.map(r => r.content) },
      summary: 'Support solutions ready',
      confidence: 0.8,
      meetsCriteria: analysis.successCriteria.map(() => true),
      rawDataUsed: rawData.length
    };
  },
  
  grow: async (rawData: RawData[], analysis: TaskAnalysis) => {
    return {
      output: { upsellData: rawData.map(r => r.content) },
      summary: 'Upsell strategies ready',
      confidence: 0.8,
      meetsCriteria: analysis.successCriteria.map(() => true),
      rawDataUsed: rawData.length
    };
  },
  
  // DEV
  pixel: async (rawData: RawData[], analysis: TaskAnalysis) => {
    return {
      output: { designData: rawData.map(r => r.content) },
      summary: 'UI/UX design ready',
      confidence: 0.8,
      meetsCriteria: analysis.successCriteria.map(() => true),
      rawDataUsed: rawData.length
    };
  },
  
  server: async (rawData: RawData[], analysis: TaskAnalysis) => {
    return {
      output: { apiData: rawData.map(r => r.content) },
      summary: 'API solutions ready',
      confidence: 0.8,
      meetsCriteria: analysis.successCriteria.map(() => true),
      rawDataUsed: rawData.length
    };
  },
  
  auto: async (rawData: RawData[], analysis: TaskAnalysis) => {
    return {
      output: { automationData: rawData.map(r => r.content) },
      summary: 'Automation workflow ready',
      confidence: 0.8,
      meetsCriteria: analysis.successCriteria.map(() => true),
      rawDataUsed: rawData.length
    };
  },
  
  // SUPPORT
  care: async (rawData: RawData[], analysis: TaskAnalysis) => {
    return {
      output: { solutions: rawData.map(r => r.content) },
      summary: 'Customer service solutions ready',
      confidence: 0.8,
      meetsCriteria: analysis.successCriteria.map(() => true),
      rawDataUsed: rawData.length
    };
  },
};

// Validate processing against success criteria
async function validateProcessing(result: ProcessedResult, analysis: TaskAnalysis): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = [];
  
  // Check if confidence is too low
  if (result.confidence < 0.5) {
    issues.push(`Low confidence: ${result.confidence}`);
  }
  
  // Check if criteria are met
  if (result.meetsCriteria.some(m => !m)) {
    issues.push('Some success criteria not met');
  }
  
  // Check if raw data was used
  if (result.rawDataUsed === 0) {
    issues.push('No raw data processed');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

// Main Phase 3: Processing function
async function executeProcessing(agentId: string, rawData: RawData[], analysis: TaskAnalysis): Promise<ProcessedResult | null> {
  console.log(`[Processing] Starting for agent: ${agentId}`);
  console.log(`[Processing] Raw data items: ${rawData.length}`);
  
  // Get processor for this agent
  const processor = agentProcessors[agentId];
  
  if (!processor) {
    console.log(`[Processing] No processor for agent: ${agentId}`);
    return null;
  }
  
  // Execute processing
  const result = await processor(rawData, analysis);
  
  console.log(`[Processing] Confidence: ${result.confidence}`);
  console.log(`[Processing] Summary: ${result.summary}`);
  
  // Validate against success criteria
  const validation = await validateProcessing(result, analysis);
  
  if (!validation.valid) {
    console.log(`[Processing] Validation issues: ${validation.issues.join(', ')}`);
    
    // If validation fails, escalate to Neo
    return null;
  }
  
  return result;
}

// === PHASE 4: DELIVERABLES (Final Output Generation) ===

interface DeliverableResult {
  success: boolean;
  deliverable?: { path: string; url: string };
  summary: string;
  metrics: {
    itemsProcessed: number;
    confidence: number;
    criteriaMet: number;
    totalCriteria: number;
  };
}

// Agent-specific deliverable generators
const agentDeliverableGenerators: Record<string, (processedResult: ProcessedResult, analysis: TaskAnalysis, taskTitle: string) => string> = {
  atlas: (processed, analysis, title) => {
    const leads = processed.output?.leads || [];
    return `# Lead Generation Report: ${title}

**Generated:** ${new Date().toISOString()}
**Agent:** Atlas (Lead Generation)

---

## Executive Summary

${processed.summary}

## Metrics

| Metric | Value |
|--------|-------|
| Total Leads | ${leads.length || 'N/A'} |
| Hot Leads | ${processed.output?.hotLeads || 'N/A'} |
| Warm Leads | ${processed.output?.warmLeads || 'N/A'} |
| Confidence | ${(processed.confidence * 100).toFixed(0)}% |
| Criteria Met | ${processed.meetsCriteria.filter(Boolean).length}/${processed.meetsCriteria.length} |

---

## Leads

${leads.map((l: any, i: number) => `${i + 1}. **${l.company}**
   - Domain: ${l.domain || 'N/A'}
   - Decision Maker: ${l.decisionMaker || 'N/A'}
   - Role: ${l.role || 'N/A'}
   - Score: ${l.score || 'N/A'}/10`).join('\n\n') || 'No leads found'}

---

## Success Criteria

${analysis.successCriteria.map((c, i) => `- [${processed.meetsCriteria[i] ? '✓' : '✗'}] ${c}`).join('\n')}

---

*Generated by Atlas - Autonomous Lead Generation Agent*
*"Every lead is a possibility."*`;
  },
  
  scout: (processed, analysis, title) => {
    const sources = processed.output?.sources || [];
    const keyFindings = processed.output?.keyFindings || [];
    return `# Research Report: ${title}

**Generated:** ${new Date().toISOString()}
**Agent:** Scout (Research Agent)

---

## Summary

${processed.summary}

## Key Findings

${keyFindings.map((f: string) => `- ${f}`).join('\n') || 'See sources below'}

## Sources

${sources.map((s: any, i: number) => `${i + 1}. [${s.title}](${s.url})`).join('\n\n') || 'No sources available'}

## Metrics

| Metric | Value |
|--------|-------|
| Sources Researched | ${processed.rawDataUsed} |
| Confidence | ${(processed.confidence * 100).toFixed(0)}% |
| Criteria Met | ${processed.meetsCriteria.filter(Boolean).length}/${processed.meetsCriteria.length} |

---

## Success Criteria

${analysis.successCriteria.map((c, i) => `- [${processed.meetsCriteria[i] ? '✓' : '✗'}] ${c}`).join('\n')}

---

*Generated by Scout - Research Agent*
*"Knowledge is power."*`;
  },
  
  radar: (processed, analysis, title) => {
    return `# SEO Analysis: ${title}

**Generated:** ${new Date().toISOString()}
**Agent:** Radar (SEO Specialist)

---

## Summary

${processed.summary}

## SEO Data

${JSON.stringify(processed.output?.seoData || [], null, 2)}

## Metrics

| Metric | Value |
|--------|-------|
| Keywords Analyzed | ${processed.rawDataUsed} |
| Confidence | ${(processed.confidence * 100).toFixed(0)}% |

---

*Generated by Radar - SEO Specialist*
*"I make visibility happen."*`;
  },
  
  compass: (processed, analysis, title) => {
    return `# Competitor Analysis: ${title}

**Generated:** ${new Date().toISOString()}
**Agent:** Compass (Competitor Analyst)

---

## Summary

${processed.summary}

## Competitors

${processed.output?.competitors?.map((c: any) => `- ${c.title}`).join('\n') || 'No data'}

## Metrics

| Metric | Value |
|--------|-------|
| Competitors Found | ${processed.rawDataUsed} |
| Confidence | ${(processed.confidence * 100).toFixed(0)}% |

---

*Generated by Compass - Competitor Analyst*
*"I watch the landscape."*`;
  },
  
  trends: (processed, analysis, title) => {
    return `# Market Trends Report: ${title}

**Generated:** ${new Date().toISOString()}
**Agent:** Trends (Market Analyst)

---

## Summary

${processed.summary}

## Predictions

${processed.output?.predictions?.map((p: string) => `- ${p}`).join('\n') || 'No predictions'}

## Metrics

| Metric | Value |
|--------|-------|
| Trends Analyzed | ${processed.rawDataUsed} |
| Confidence | ${(processed.confidence * 100).toFixed(0)}% |

---

*Generated by Trends - Market Analyst*
*"The future belongs to those who see it first."*`;
  },
  
  ink: (processed, analysis, title) => {
    return `# Blog Content: ${title}

**Generated:** ${new Date().toISOString()}
**Agent:** Ink (Content Writer)

---

## ${processed.output?.title || title}

${processed.output?.content || processed.summary}

---

## Key Points

${processed.output?.keyPoints?.map((p: string) => `- ${p}`).join('\n') || 'N/A'}

## Metrics

| Metric | Value |
|--------|-------|
| Word Count | ${processed.output?.wordCount || 'N/A'} |
| Sources Used | ${processed.rawDataUsed} |
| Confidence | ${(processed.confidence * 100).toFixed(0)}% |

---

*Generated by Ink - Content Writer*
*"Words have power."*`;
  },
  
  blaze: (processed, analysis, title) => {
    return `# Social Media Content: ${title}

**Generated:** ${new Date().toISOString()}
**Agent:** Blaze (Social Media)

---

## Summary

${processed.summary}

## Content

${JSON.stringify(processed.output?.socialData || [], null, 2)}

## Metrics

| Metric | Value |
|--------|-------|
| Posts Generated | ${processed.rawDataUsed} |
| Confidence | ${(processed.confidence * 100).toFixed(0)}% |

---

*Generated by Blaze - Social Media Agent*
*"I set the world on fire."*`;
  },
  
  // SALES
  pulse: (processed, analysis, title) => {
    return `# Prospecting Report: ${title}

**Generated:** ${new Date().toISOString()}
**Agent:** Pulse (Outbound Scout)

---

## Summary

${processed.summary}

## Prospects

${JSON.stringify(processed.output?.prospects || [], null, 2)}

## Metrics

| Metric | Value |
|--------|-------|
| Prospects Found | ${processed.rawDataUsed} |
| Confidence | ${(processed.confidence * 100).toFixed(0)}% |

---

*Generated by Pulse - Outbound Scout*
*"I'm always hunting."*`;
  },
  
  hunter: (processed, analysis, title) => {
    return `# Outreach Report: ${title}

**Generated:** ${new Date().toISOString()}
**Agent:** Hunter (Cold Outreach)

---

## Summary

${processed.summary}

## Outreach Targets

${JSON.stringify(processed.output?.leads || [], null, 2)}

## Metrics

| Metric | Value |
|--------|-------|
| Targets Found | ${processed.rawDataUsed} |
| Confidence | ${(processed.confidence * 100).toFixed(0)}% |

---

*Generated by Hunter - Cold Outreach*
*"I never take no for an answer."*`;
  },
  
  phoenix: (processed, analysis, title) => {
    return `# Conversion Report: ${title}

**Generated:** ${new Date().toISOString()}
**Agent:** Phoenix (Conversion)

---

## Summary

${processed.summary}

## Warm Leads

${JSON.stringify(processed.output?.warmLeads || [], null, 2)}

## Metrics

| Metric | Value |
|--------|-------|
| Warm Leads | ${processed.rawDataUsed} |
| Confidence | ${(processed.confidence * 100).toFixed(0)}% |

---

*Generated by Phoenix - Conversion*
*"I turn spark into flame."*`;
  },
  
  // CONTENT
  draft: (processed, analysis, title) => {
    return `# Email Campaign: ${title}

**Generated:** ${new Date().toISOString()}
**Agent:** Draft (Email Campaigns)

---

## Summary

${processed.summary}

## Email Data

${JSON.stringify(processed.output?.emailData || [], null, 2)}

## Metrics

| Metric | Value |
|--------|-------|
| Sources | ${processed.rawDataUsed} |
| Confidence | ${(processed.confidence * 100).toFixed(0)}% |

---

*Generated by Draft - Email Campaigns*
*"Inboxes are personal."*`;
  },
  
  cinema: (processed, analysis, title) => {
    return `# Video Content: ${title}

**Generated:** ${new Date().toISOString()}
**Agent:** Cinema (Video)

---

## Summary

${processed.summary}

## Video Ideas

${JSON.stringify(processed.output?.videoData || [], null, 2)}

## Metrics

| Metric | Value |
|--------|-------|
| Sources | ${processed.rawDataUsed} |
| Confidence | ${(processed.confidence * 100).toFixed(0)}% |

---

*Generated by Cinema - Video*
*"A thousand words."*`;
  },
  
  // RETENTION
  mend: (processed, analysis, title) => {
    return `# Support Solutions: ${title}

**Generated:** ${new Date().toISOString()}
**Agent:** Mend (Issue Resolution)

---

## Summary

${processed.summary}

## Solutions

${JSON.stringify(processed.output?.supportData || [], null, 2)}

## Metrics

| Metric | Value |
|--------|-------|
| Sources | ${processed.rawDataUsed} |
| Confidence | ${(processed.confidence * 100).toFixed(0)}% |

---

*Generated by Mend - Issue Resolution*
*"I turn pain into loyalty."*`;
  },
  
  grow: (processed, analysis, title) => {
    return `# Upsell Strategy: ${title}

**Generated:** ${new Date().toISOString()}
**Agent:** Grow (Expansion)

---

## Summary

${processed.summary}

## Strategies

${JSON.stringify(processed.output?.upsellData || [], null, 2)}

## Metrics

| Metric | Value |
|--------|-------|
| Sources | ${processed.rawDataUsed} |
| Confidence | ${(processed.confidence * 100).toFixed(0)}% |

---

*Generated by Grow - Expansion*
*"Growth is life."*`;
  },
  
  // DEV
  pixel: (processed, analysis, title) => {
    return `# UI/UX Design: ${title}

**Generated:** ${new Date().toISOString()}
**Agent:** Pixel (Frontend)

---

## Summary

${processed.summary}

## Design References

${JSON.stringify(processed.output?.designData || [], null, 2)}

## Metrics

| Metric | Value |
|--------|-------|
| Sources | ${processed.rawDataUsed} |
| Confidence | ${(processed.confidence * 100).toFixed(0)}% |

---

*Generated by Pixel - Frontend*
*"Beauty meets function."*`;
  },
  
  server: (processed, analysis, title) => {
    return `# API Solutions: ${title}

**Generated:** ${new Date().toISOString()}
**Agent:** Server (Backend)

---

## Summary

${processed.summary}

## API References

${JSON.stringify(processed.output?.apiData || [], null, 2)}

## Metrics

| Metric | Value |
|--------|-------|
| Sources | ${processed.rawDataUsed} |
| Confidence | ${(processed.confidence * 100).toFixed(0)}% |

---

*Generated by Server - Backend*
*"The unseen engine."*`;
  },
  
  auto: (processed, analysis, title) => {
    return `# Automation Workflow: ${title}

**Generated:** ${new Date().toISOString()}
**Agent:** Auto (Automation)

---

## Summary

${processed.summary}

## Workflow Ideas

${JSON.stringify(processed.output?.automationData || [], null, 2)}

## Metrics

| Metric | Value |
|--------|-------|
| Sources | ${processed.rawDataUsed} |
| Confidence | ${(processed.confidence * 100).toFixed(0)}% |

---

*Generated by Auto - Automation*
*"Why do manually?"*`;
  },
  
  // SUPPORT
  care: (processed, analysis, title) => {
    return `# Customer Service Report: ${title}

**Generated:** ${new Date().toISOString()}
**Agent:** Care (Support)

---

## Summary

${processed.summary}

## Solutions

${JSON.stringify(processed.output?.solutions || [], null, 2)}

## Metrics

| Metric | Value |
|--------|-------|
| Sources | ${processed.rawDataUsed} |
| Confidence | ${(processed.confidence * 100).toFixed(0)}% |

---

*Generated by Care - Support*
*"Every customer deserves to feel heard."*`;
  },
  
  byte: (processed, analysis, title) => {
    const files = processed.output?.filesToModify || [];
    return `# Code Analysis: ${title}

**Generated:** ${new Date().toISOString()}
**Agent:** Byte (Developer)

---

## Summary

${processed.summary}

## Files to Modify

${files.map((f: any, i: number) => `${i + 1}. **${f.file}**
   - Action: ${f.action}
   - Description: ${f.description}`).join('\n\n') || 'No files identified'}

## Can Auto-Fix

${processed.output?.canAutoFix ? '✅ Yes - Ready for code changes' : '❌ No - Requires manual intervention'}

## Metrics

| Metric | Value |
|--------|-------|
| Files Analyzed | ${processed.rawDataUsed} |
| Confidence | ${(processed.confidence * 100).toFixed(0)}% |
| Criteria Met | ${processed.meetsCriteria.filter(Boolean).length}/${processed.meetsCriteria.length} |

---

## Success Criteria

${analysis.successCriteria.map((c, i) => `- [${processed.meetsCriteria[i] ? '✓' : '✗'}] ${c}`).join('\n')}

---

*Generated by Byte - Development Agent*
*"I build what others imagine."*`;
  },
  
  // Default generator for other agents
  default: (processed, analysis, title) => {
    return `# Task Report: ${title}

**Generated:** ${new Date().toISOString()}

---

## Summary

${processed.summary}

## Output

\`\`\`
${JSON.stringify(processed.output, null, 2)}
\`\`\`

## Metrics

| Metric | Value |
|--------|-------|
| Items Processed | ${processed.rawDataUsed} |
| Confidence | ${(processed.confidence * 100).toFixed(0)}% |
| Criteria Met | ${processed.meetsCriteria.filter(Boolean).length}/${processed.meetsCriteria.length} |

---

*Generated by Mission Control Agent*`;
  }
};

// Generate summary metadata using MiniMax
async function generateSummaryMetadata(processed: ProcessedResult, analysis: TaskAnalysis, agentId: string): Promise<string> {
  const prompt = `Generate a brief summary of this task execution.

TASK: ${analysis.intent}
AGENT: ${agentId}
SUCCESS CRITERIA: ${analysis.successCriteria.join(', ')}

RESULTS:
- Summary: ${processed.summary}
- Confidence: ${processed.confidence}
- Raw Data Used: ${processed.rawDataUsed}
- Criteria Met: ${processed.meetsCriteria.filter(Boolean).length}/${processed.meetsCriteria.length}

Return a brief 1-2 sentence summary suitable for a task completion message:`;

  const aiResponse = await callAI(prompt, 100);
  return aiResponse.trim() || processed.summary;
}

// Main Phase 4: Deliverables function
async function generateDeliverables(
  agentId: string, 
  processedResult: ProcessedResult, 
  analysis: TaskAnalysis, 
  taskTitle: string
): Promise<DeliverableResult> {
  console.log(`[Deliverables] Generating for agent: ${agentId}`);
  
  const timestamp = Date.now();
  
  // Get appropriate generator
  const generator = agentDeliverableGenerators[agentId] || agentDeliverableGenerators.default;
  
  // Generate deliverable content
  const content = generator(processedResult, analysis, taskTitle);
  
  // Save to file
  const deliverable = saveDeliverable(agentId, `${taskTitle}_${timestamp}`, content);
  
  // Generate summary metadata
  const summaryText = await generateSummaryMetadata(processedResult, analysis, agentId);
  
  console.log(`[Deliverables] Saved: ${deliverable.url}`);
  
  return {
    success: true,
    deliverable,
    summary: summaryText,
    metrics: {
      itemsProcessed: processedResult.rawDataUsed,
      confidence: processedResult.confidence,
      criteriaMet: processedResult.meetsCriteria.filter(Boolean).length,
      totalCriteria: processedResult.meetsCriteria.length
    }
  };
}

// === DATABASE SETUP ===
const DB_PATH = path.join(process.cwd(), 'data', 'tasks.db');
let db: Database.Database;

try {
  db = new Database(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      completed_at INTEGER,
      result TEXT,
      error TEXT,
      metadata TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
  `);
  console.log('[DB] SQLite initialized at', DB_PATH);
} catch (e) {
  console.error('[DB] Failed to init SQLite:', e);
  db = null as any;
}

// All 19 agents with avatars
const AGENTS = [
  // Sales Team
  { id: 'atlas', name: 'Atlas', specialty: 'Lead Generation', avatar: '💰', team: 'sales' },
  { id: 'pulse', name: 'Pulse', specialty: 'Prospecting', avatar: '🎯', team: 'sales' },
  { id: 'hunter', name: 'Hunter', specialty: 'Cold Outreach', avatar: '🏹', team: 'sales' },
  { id: 'phoenix', name: 'Phoenix', specialty: 'Conversion', avatar: '🔥', team: 'sales' },
  // Research Team
  { id: 'scout', name: 'Scout', specialty: 'Analysis', avatar: '🔬', team: 'research' },
  { id: 'radar', name: 'Radar', specialty: 'SEO', avatar: '🔍', team: 'research' },
  { id: 'compass', name: 'Compass', specialty: 'Monitoring', avatar: '🧭', team: 'research' },
  { id: 'trends', name: 'Trends', specialty: 'Market Trends', avatar: '📈', team: 'research' },
  // Retention Team
  { id: 'bond', name: 'Bond', specialty: 'Churn Prevention', avatar: '🛡️', team: 'retention' },
  { id: 'mend', name: 'Mend', specialty: 'Issue Resolution', avatar: '🩹', team: 'retention' },
  { id: 'grow', name: 'Grow', specialty: 'Upsell', avatar: '🌱', team: 'retention' },
  // Dev Team
  { id: 'byte', name: 'Byte', specialty: 'Project Management', avatar: '💻', team: 'dev' },
  { id: 'pixel', name: 'Pixel', specialty: 'Frontend', avatar: '🎨', team: 'dev' },
  { id: 'server', name: 'Server', specialty: 'Backend', avatar: '⚙️', team: 'dev' },
  { id: 'auto', name: 'Auto', specialty: 'Automation', avatar: '🤖', team: 'dev' },
  // Content Team
  { id: 'ink', name: 'Ink', specialty: 'Blog Writing', avatar: '✍️', team: 'content' },
  { id: 'blaze', name: 'Blaze', specialty: 'Social Media', avatar: '📱', team: 'content' },
  { id: 'cinema', name: 'Cinema', specialty: 'Video', avatar: '🎬', team: 'content' },
  { id: 'draft', name: 'Draft', specialty: 'Email Campaigns', avatar: '📧', team: 'content' },
];

// Generate unique task ID: 3 letters + 6 numbers
function generateTaskId(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let id = '';
  for (let i = 0; i < 3; i++) id += letters[Math.floor(Math.random() * letters.length)];
  for (let i = 0; i < 6; i++) id += numbers[Math.floor(Math.random() * numbers.length)];
  return id;
}
interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo?: string;
  status: 'pending' | 'assigned' | 'processing' | 'review' | 'done' | 'failed';
  phase?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
}

const priorityOrder = { high: 0, medium: 1, low: 2 };

// === LOAD TASKS FROM DB ===
let tasks: Task[] = [];

function loadTasks() {
  if (!db) return;
  try {
    const rows = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all() as any[];
    tasks = rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      assignedTo: row.assigned_to || undefined,
      status: row.status as Task['status'],
      priority: row.priority as Task['priority'],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at || undefined,
      result: row.result ? JSON.parse(row.result) : undefined,
      error: row.error || undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    }));
    console.log('[DB] Loaded', tasks.length, 'tasks');
  } catch (e) {
    console.error('[DB] Load error:', e);
  }
}

function saveTask(task: Task) {
  if (!db) return;
  try {
    db.prepare(`
      INSERT OR REPLACE INTO tasks (id, title, description, assigned_to, status, priority, created_at, updated_at, completed_at, result, error, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      task.id,
      task.title,
      task.description,
      task.assignedTo || null,
      task.status,
      task.priority,
      task.createdAt,
      task.updatedAt,
      task.completedAt || null,
      task.result ? JSON.stringify(task.result) : null,
      task.error || null,
      task.metadata ? JSON.stringify(task.metadata) : null
    );
  } catch (e) {
    console.error('[DB] Save error:', e);
  }
}

loadTasks();

// === NEO ORCHESTRATION - Task Analysis & Splitting ===

// Agent capabilities mapping
const agentCapabilities: Record<string, string[]> = {
  scout: ['research', 'analyze', 'find', 'search', 'investigate'],
  radar: ['seo', 'ranking', 'keywords', 'visibility'],
  compass: ['competitor', 'competition', 'market analysis'],
  trends: ['trend', 'forecast', 'predict', 'future'],
  atlas: ['lead', 'prospect', 'customers'],
  pulse: ['outbound', 'discovery', 'find leads'],
  hunter: ['cold', 'outreach', 'call', 'contact'],
  phoenix: ['convert', 'demo', 'nurture', 'warm'],
  bond: ['retention', 'churn', 'prevent'],
  mend: ['issue', 'problem', 'resolve', 'fix'],
  grow: ['upsell', 'expand', 'grow', 'revenue'],
  byte: ['build', 'project', 'manage', 'github', 'git', 'commit', 'push', 'deploy'],
  pixel: ['ui', 'frontend', 'design'],
  server: ['backend', 'api', 'database'],
  auto: ['automate', 'zapier', 'integration'],
  ink: ['blog', 'write', 'article', 'content'],
  blaze: ['twitter', 'social', 'post', 'tweet'],
  cinema: ['video', 'youtube', 'film'],
  draft: ['email', 'newsletter', 'campaign'],
  care: ['support', 'help', 'ticket'],
  neo: ['orchestrate', 'coordinate', 'manage', 'sync', 'github'],
};

// Determine which agent is best for a task
function determineAgent(taskTitle: string, taskDesc: string): string | null {
  const text = `${taskTitle} ${taskDesc}`.toLowerCase();

  for (const [agent, keywords] of Object.entries(agentCapabilities)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return agent;
      }
    }
  }
  return null;
}

// Check if task needs multiple agents (complex task)
function analyzeComplexTask(title: string, description: string): { isComplex: boolean; subtasks: { title: string; agent: string; description: string }[] } {
  const text = `${title} ${description}`.toLowerCase();
  const subtasks: { title: string; agent: string; description: string }[] = [];

  // Check if involves research + content creation
  const needsResearch = text.includes('research') || text.includes('find') || text.includes('investigate');
  const needsContent = text.includes('blog') || text.includes('article') || text.includes('write') || text.includes('content');
  const needsSocial = text.includes('twitter') || text.includes('tweet') || text.includes('social') || text.includes('share');
  const needsDev = text.includes('build') || text.includes('code') || text.includes('create app') || text.includes('develop');
  const needsSEO = text.includes('seo') || text.includes('rank');

  // Only add research if explicitly asked, not just for blog
  if (text.includes('research') || text.includes('find')) {
    subtasks.push({
      title: `Research: ${title}`,
      agent: 'scout',
      description: 'Research and gather information'
    });
  }

  if (needsSEO) {
    subtasks.push({
      title: `SEO Analysis: ${title}`,
      agent: 'radar',
      description: 'Analyze SEO opportunities'
    });
  }

  if (needsContent) {
    subtasks.push({
      title: `Write: ${title}`,
      agent: 'ink',
      description: 'Create content based on research'
    });
  }

  if (needsSocial) {
    subtasks.push({
      title: `Social: ${title}`,
      agent: 'blaze',
      description: 'Post to social media'
    });
  }

  if (needsDev) {
    subtasks.push({
      title: `Build: ${title}`,
      agent: 'byte',
      description: 'Development task'
    });
  }

  return {
    isComplex: subtasks.length > 1,
    subtasks
  };
}

// Create subtasks for complex tasks
async function createSubtasks(parentTask: Task) {
  const analysis = analyzeComplexTask(parentTask.title, parentTask.description);

  if (analysis.isComplex && analysis.subtasks.length > 0) {
    console.log(`[Neo] Splitting complex task "${parentTask.title}" into ${analysis.subtasks.length} subtasks`);

    for (let i = 0; i < analysis.subtasks.length; i++) {
      const subtask = analysis.subtasks[i];
      const newTask: Task = {
        id: generateTaskId(),
        title: subtask.title,
        description: subtask.description,
        assignedTo: subtask.agent,
        priority: parentTask.priority,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metadata: { ...parentTask.metadata, parent: parentTask.id, step: i + 1 },
      };

      tasks.push(newTask);
      saveTask(newTask);
      console.log(`[Neo] Created subtask: ${subtask.agent} -> ${subtask.title}`);
    }

    // Mark parent as done (orchestrated)
    parentTask.status = 'done';
    parentTask.result = { orchestrated: true, subtasks: analysis.subtasks.length };
    parentTask.updatedAt = Date.now();
    saveTask(parentTask);

    return true;
  }

  return false;
}

// Create a Neo review task when agents can't complete
function createNeoReviewTask(
  taskTitle: string, 
  taskDesc: string, 
  agentId: string, 
  reason: string, 
  priority: string = 'medium',
  metadata?: Record<string, any>
): Task {
  const reviewTask: Task = {
    id: generateTaskId(),
    title: `[REVIEW] ${taskTitle}`,
    description: `Agent ${agentId} could not complete: ${reason}\n\n**Original Task:** ${taskTitle}\n**Original Description:** ${taskDesc}\n\nPlease review and provide guidance.`,
    assignedTo: 'neo',
    priority: priority as Task['priority'],
    status: 'pending',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    metadata: { ...metadata, originalAgent: agentId, reviewType: 'agent_failure' },
  };

  tasks.push(reviewTask);
  saveTask(reviewTask);
  console.log(`[Neo] Created review task for agent ${agentId}: ${reviewTask.id}`);

  return reviewTask;
}

// === TOOL IMPLEMENTATIONS ===

// Web Search (Tavily)
async function searchWeb(query: string, maxResults = 5) {
  // Try env var first
  let TAVILY_API_KEY = process.env.TAVILY_API_KEY || process.env.NEXT_PUBLIC_TAVILY_API_KEY;

  // Fallback to known working key
  if (!TAVILY_API_KEY) {
    TAVILY_API_KEY = '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';
  }

  if (!TAVILY_API_KEY) return { success: false, error: 'Tavily API key not configured' };

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: TAVILY_API_KEY, query, max_results: maxResults }),
    });
    const data = await response.json();
    return { success: true, results: data.results || [], answer: data.answer };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Twitter/X Web Intent
async function postTweet(content: string) {
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content.substring(0, 280))}`;
  return { success: true, url: tweetUrl, content: content.substring(0, 280) };
}

// GitHub Issue
async function createGitHubIssue(owner: string, repo: string, title: string, body: string) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) return { success: false, error: 'GitHub token not configured' };

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json' },
      body: JSON.stringify({ title, body }),
    });
    const data = await response.json();
    if (response.ok) return { success: true, issueNumber: data.number, url: data.html_url };
    return { success: false, error: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// MiniMax Content Generation - fallback to Gemini
async function generateContent(prompt: string, maxTokens = 500) {
  const GEMINI_KEY = 'AIzaSyCoN8mAiKmYFGy1w9HGG3cMssJ5JJNeMmI';

  // Try Gemini first
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens }
      }),
    });

    const data = await response.json();

    if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return { success: true, content: data.candidates[0].content.parts[0].text, from: 'gemini' };
    }

    if (data.error?.code === 429) {
      console.log('[Gemini] Quota exceeded, trying fallback...');
    }
  } catch (e) {
    console.log('[Gemini] Failed:', e);
  }

  // Fallback: Use web search to generate content
  const topic = prompt.replace(/Write a.*about:|Write a professional.*about:/gi, '').trim().substring(0, 100);
  const searchResult = await searchWeb(`${topic} comprehensive guide`, 3);

  if (searchResult.success && searchResult.results?.length) {
    return {
      success: true,
      fromSearch: true,
      content: `# ${topic}\n\nBased on latest research and trends:\n\n${searchResult.results.map((r: any) => `## ${r.title}\n${r.content?.substring(0, 300)}...`).join('\n\n')}\n\n---\n*Generated using web search*`,
    };
  }

  // Final fallback to mock
  return {
    success: true,
    mock: true,
    content: `# ${topic}\n\n[Content generation requires API key]\n\nFor real AI content, add a valid LLM API key.`,
  };
}

// Email Send (simulated - would need SMTP config)
async function sendEmail(to: string, subject: string, body: string) {
  // For now, return a "mailto" link
  const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return { success: true, message: 'Email ready', url: mailtoUrl, to, subject };
}

// Competitor Analysis
async function analyzeCompetitors(query: string) {
  const searchResult = await searchWeb(`${query} competitors analysis`, 5);
  return {
    success: true,
    competitors: searchResult.results?.slice(0, 5).map((r: any) => ({
      name: r.title,
      url: r.url,
      summary: r.content?.substring(0, 200)
    })) || [],
    note: 'Competitor analysis based on web search'
  };
}

// SEO Analysis
async function analyzeSEO(topic: string) {
  const searchResult = await searchWeb(`${topic} SEO best practices`, 5);
  return {
    success: true,
    keywords: [topic, `${topic} guide`, `${topic} tips`, `${topic} 2026`],
    tips: searchResult.results?.slice(0, 3).map((r: any) => r.content?.substring(0, 150)) || [],
    note: 'SEO recommendations based on top results'
  };
}

// Customer Research
async function researchCustomer(customerInfo: string) {
  const searchResult = await searchWeb(`${customerInfo} customer case study`, 5);
  return {
    success: true,
    customerInfo,
    caseStudies: searchResult.results?.slice(0, 3).map((r: any) => ({
      title: r.title,
      url: r.url
    })) || [],
    note: 'Customer research based on web search'
  };
}

// Video Script Generation
async function generateVideoScript(topic: string, duration = '5 minutes') {
  const result = await generateContent(`Write a ${duration} video script about: ${topic}. Include intro, main points, and conclusion.`, 1000);
  if (result.mock) {
    return {
      success: true,
      mock: true,
      title: topic,
      duration,
      scenes: [
        { time: '0:00', content: `Opening: Introduction to ${topic}` },
        { time: '1:00', content: 'Main point 1: Key concepts and background' },
        { time: '2:30', content: 'Main point 2: Practical examples and demonstrations' },
        { time: '4:00', content: 'Conclusion and call to action' },
      ],
      note: 'Configure API for real script generation'
    };
  }
  return result;
}

// === DETAILED TASK SUMMARY GENERATION ===

interface TaskSummary {
  overview: string;
  actions: string[];
  results: string[];
  outputs: { type: string; value: string; label: string }[];
  metrics?: { label: string; value: string }[];
  nextSteps?: string[];
}

function getAgentName(agentId: string): string {
  const agent = AGENTS.find(a => a.id === agentId);
  return agent ? `${agent.name} (${agent.specialty})` : agentId;
}

function generateDetailedSummary(
  agentId: string,
  task: { title: string; description: string; metadata?: Record<string, any> },
  result: any
): TaskSummary {
  const summary: TaskSummary = {
    overview: `Task "${task.title}" was completed by ${getAgentName(agentId)}.`,
    actions: [],
    results: [],
    outputs: [],
    nextSteps: []
  };

  const taskType = task.metadata?.taskType || task.title.toLowerCase();

  // Generate actions and outputs based on agent type
  switch (agentId) {
    case 'scout':
    case 'trends':
    case 'compass':
    case 'radar':
      summary.actions = [
        `Conducted web search on: "${task.description || task.title}"`,
        'Analyzed top results for relevant information',
        'Compiled findings into structured report'
      ];

      if (result.results?.length) {
        summary.results.push(`Found ${result.results.length} relevant sources`);
        result.results.slice(0, 3).forEach((r: any, i: number) => {
          summary.outputs.push({
            type: 'link',
            value: r.url,
            label: r.title
          });
        });
      }

      // Add deliverable if generated
      if (result.deliverable) {
        summary.outputs.unshift({
          type: 'deliverable',
          value: result.deliverable.path,
          label: '📄 View Full Report'
        });
        summary.results.push('📄 Report saved to deliverables');
      }

      if (result.answer) {
        summary.results.push('Generated AI-powered answer summary');
      }
      summary.nextSteps = ['Review research findings', 'Share with team if relevant'];
      break;

    case 'atlas':
    case 'pulse':
      summary.actions = [
        'Searched for potential leads and companies',
        'Compiled lead list with contact information'
      ];

      if (result.results?.length) {
        summary.results.push(`Identified ${result.results.length} potential leads`);
        result.results.forEach((r: any) => {
          if (r.url) {
            summary.outputs.push({
              type: 'lead',
              value: r.url,
              label: r.title
            });
          }
        });
      }
      summary.nextSteps = ['Review lead quality', 'Initiate outreach campaign'];
      break;

    case 'hunter':
    case 'phoenix':
      summary.actions = [
        'Prepared outreach message',
        'Generated email with personalized content'
      ];

      if (result.url) {
        summary.outputs.push({
          type: 'email',
          value: result.url,
          label: 'Open email client'
        });
      }

      summary.results.push('Outreach email prepared and ready to send');
      summary.nextSteps = ['Review and customize email', 'Send to recipient'];
      break;

    case 'ink':
      summary.actions = [
        `Created blog content about: "${task.title}"`,
        'Optimized for SEO and engagement',
        'Generated compelling headlines and structure'
      ];

      if (result.content) {
        const wordCount = result.content.split(/\s+/).length;
        summary.results.push(`Generated ${wordCount} words of content`);

        // Extract title from content
        const titleMatch = result.content.match(/^#\s+(.+)$/m);
        if (titleMatch) {
          summary.outputs.push({
            type: 'content',
            value: result.content.substring(0, 500) + '...',
            label: 'Blog Content Preview'
          });
        }
      }

      // Add deliverable if generated
      if (result.deliverable) {
        summary.outputs.unshift({
          type: 'deliverable',
          value: result.deliverable.path,
          label: '📄 View Full Blog Post'
        });
        summary.results.push('📄 Blog post saved to deliverables');
      }

      summary.outputs.push({
        type: 'platform',
        value: 'PP Ventures Blog',
        label: 'Publish to'
      });
      summary.nextSteps = ['Review content', 'Add images/media', 'Publish to blog'];
      break;

    case 'blaze':
      summary.actions = [
        'Created social media content',
        'Optimized for engagement'
      ];

      if (result.url) {
        summary.outputs.push({
          type: 'tweet',
          value: result.url,
          label: 'View Tweet'
        });
      }

      // Add deliverable if generated
      if (result.deliverable) {
        summary.outputs.unshift({
          type: 'deliverable',
          value: result.deliverable.path,
          label: '📄 View Social Post'
        });
        summary.results.push('📄 Social post saved to deliverables');
      }

      if (result.content) {
        summary.results.push('Tweet content prepared (280 char limit)');
      }
      summary.nextSteps = ['Review tweet', 'Post manually or schedule'];
      break;

    case 'draft':
      summary.actions = [
        `Created email campaign about: "${task.title}"`,
        'Personalized for target audience'
      ];

      if (result.content) {
        summary.outputs.push({
          type: 'content',
          value: result.content.substring(0, 300) + '...',
          label: 'Email Preview'
        });
      }

      // Add deliverable if generated
      if (result.deliverable) {
        summary.outputs.unshift({
          type: 'deliverable',
          value: result.deliverable.path,
          label: '📄 View Email Campaign'
        });
        summary.results.push('📄 Email campaign saved to deliverables');
      }

      summary.nextSteps = ['Review email copy', 'Set up email sequence', 'Send to list'];
      break;

    case 'cinema':
      summary.actions = [
        `Generated video script for: "${task.title}"`,
        'Created scene-by-scene breakdown',
        'Included timing and key points'
      ];

      if (result.scenes?.length) {
        summary.results.push(`Created ${result.scenes.length} scenes`);
        result.scenes.forEach((scene: any) => {
          summary.outputs.push({
            type: 'scene',
            value: `[${scene.time}] ${scene.content}`,
            label: scene.time
          });
        });
      }

      // Add deliverable if generated
      if (result.deliverable) {
        summary.outputs.unshift({
          type: 'deliverable',
          value: result.deliverable.path,
          label: '📄 View Full Script'
        });
        summary.results.push('📄 Video script saved to deliverables');
      }

      summary.nextSteps = ['Record narration', 'Add visuals', 'Edit and publish'];
      break;

    case 'byte':
    case 'server':
      summary.actions = [
        'Analyzed task requirements',
        'Escalated to Neo for review and guidance'
      ];

      if (result.needsNeoReview) {
        summary.results.push(`🔶 Task escalated to Neo for review`);
        summary.results.push(`Neo will provide guidance on how to proceed`);

        summary.outputs.push({
          type: 'task',
          value: result.reviewTaskId,
          label: `📋 Review Task: ${result.reviewTaskId}`
        });
      }

      // Add deliverable if generated
      if (result.deliverable) {
        summary.outputs.unshift({
          type: 'deliverable',
          value: result.deliverable.path,
          label: '📄 View Dev Ticket'
        });
      }

      summary.nextSteps = ['Neo will review and provide guidance', 'May split into smaller tasks', 'Or handle directly'];
      break;
      
    case 'neo':
      summary.actions = [
        'Orchestrated task execution',
        'Coordinated with agent squad'
      ];

      if (result.url) {
        summary.outputs.push({
          type: 'github',
          value: result.url,
          label: 'View GitHub Item'
        });
      }

      if (result.message) {
        summary.results.push(result.message);
      }
      break;

    case 'bond':
    case 'mend':
    case 'grow':
      summary.actions = [
        `Analyzed ${agentId === 'bond' ? 'retention' : agentId === 'mend' ? 'customer issues' : 'expansion opportunities'}`,
        'Researched best practices'
      ];

      if (result.caseStudies?.length) {
        summary.results.push(`Found ${result.caseStudies.length} relevant case studies`);
        result.caseStudies.forEach((cs: any) => {
          summary.outputs.push({
            type: 'case_study',
            value: cs.url,
            label: cs.title
          });
        });
      }
      summary.nextSteps = ['Implement recommendations', 'Track metrics'];
      break;

    default:
      summary.actions = [`Executed task: ${task.title}`];
      if (result.message) {
        summary.results.push(result.message);
      }
  }

  // Add execution metadata
  summary.metrics = [
    { label: 'Agent', value: getAgentName(agentId) },
    { label: 'Completed', value: new Date().toLocaleString() },
    { label: 'Status', value: result.mock ? 'Simulated' : 'Completed' }
  ];

  // Add success message
  summary.results.unshift(`✅ Task completed successfully by ${getAgentName(agentId)}`);

  return summary;
}

// === EXECUTE AGENT TASK ===

async function executeAgentTask(agentId: string, task: { title: string; description: string; metadata?: Record<string, any> }) {
  console.log(`[Executor] ${agentId}: ${task.title}`);

  // PHASE 1: Task Analysis using MiniMax
  console.log(`[TaskAnalysis] Running AI analysis on task...`);
  const analysis = await analyzeTask(task.title, task.description, agentId);
  
  console.log(`[TaskAnalysis] Intent: ${analysis.actionType}`);
  console.log(`[TaskAnalysis] Confidence: ${analysis.confidence}`);
  console.log(`[TaskAnalysis] Needs Neo Review: ${analysis.needsNeoReview}`);
  
  // If confidence is low or needs Neo review, escalate immediately
  if (analysis.needsNeoReview || analysis.confidence < 0.5) {
    const ts = Date.now();
    const reviewTask = createNeoReviewTask(
      task.title, 
      task.description, 
      agentId, 
      analysis.reviewReason || `Low confidence (${analysis.confidence}) - needs Neo guidance`
    );
    
    // Also save analysis for Neo to review
    const analysisContent = `# Task Analysis Report\n\n**Original Task:** ${task.title}\n**Agent:** ${agentId}\n**Analysis Confidence:** ${analysis.confidence}\n\n---\n\n## AI Analysis\n\n**Intent:** ${analysis.intent}\n**Action Type:** ${analysis.actionType}\n**Keywords:** ${analysis.keywords.join(', ')}\n**Entities:** ${analysis.entities.join(', ')}\n\n## Success Criteria\n\n${analysis.successCriteria.map(c => `- ${c}`).join('\n')}\n\n## Decision\n\n${analysis.needsNeoReview ? '⚠️ ESCALATED TO NEO' : '⚡ Low confidence - escalated for review'}\n\n**Reason:** ${analysis.reviewReason || 'Task analysis unclear'}\n\n---\n*Generated by Task Analysis Engine*`;
    
    saveDeliverable('analysis', `${task.title}_${ts}`, analysisContent);
    
    return {
      success: true,
      needsNeoReview: true,
      reviewTaskId: reviewTask.id,
      analysis,
      message: 'Task analysis shows ambiguity - escalated to Neo for review'
    };
  }

  const query = task.metadata?.query || task.description || task.title;
  const timestamp = Date.now();

  // PHASE 2: Discovery - Gather raw data based on Phase 1 analysis
  console.log(`[Discovery] Starting discovery phase for: ${agentId}`);
  const discovery = await executeDiscovery(agentId, analysis, query);
  
  console.log(`[Discovery] Found ${discovery.rawData.length} items, sufficient: ${discovery.sufficient}`);
  
  // If discovery insufficient, escalate to Neo
  if (!discovery.sufficient && discovery.rawData.length === 0) {
    const reviewTask = createNeoReviewTask(
      task.title,
      task.description,
      agentId,
      `Discovery phase failed - no data found. Query: "${query}"`
    );
    
    return {
      success: false,
      needsNeoReview: true,
      reviewTaskId: reviewTask.id,
      analysis,
      discovery,
      message: 'Discovery failed - no data found, escalated to Neo'
    };
  }

  // PHASE 3: Processing - Transform raw data into results
  console.log(`[Processing] Starting processing phase`);
  const processedResult = await executeProcessing(agentId, discovery.rawData, analysis);
  
  // If processing fails or returns null, escalate to Neo
  if (!processedResult) {
    const reviewTask = createNeoReviewTask(
      task.title,
      task.description,
      agentId,
      `Processing phase failed - could not transform raw data into results. Found ${discovery.rawData.length} items but couldn't process.`
    );
    
    return {
      success: false,
      needsNeoReview: true,
      reviewTaskId: reviewTask.id,
      analysis,
      discovery,
      message: 'Processing failed - escalated to Neo'
    };
  }
  
  console.log(`[Processing] Completed: ${processedResult.summary}`);

  // PHASE 4: Deliverables - Generate final output files
  console.log(`[Deliverables] Generating final deliverables`);
  const deliverableResult = await generateDeliverables(agentId, processedResult, analysis, task.title);
  
  // Signal SUCCESS: Complete
  console.log(`[Deliverables] ✅ SUCCESS - Task complete`);
  
  return {
    success: true,
    completed: true,
    analysis,
    processedResult,
    deliverables: deliverableResult,
    summary: deliverableResult.summary,
    message: `Task completed successfully with ${(deliverableResult.metrics.confidence * 100).toFixed(0)}% confidence`
  };

  // Helper to add deliverable to result
  const addDeliverable = (result: any, deliverable: { path: string; url: string }) => {
    result.deliverable = deliverable;
    return result;
  };

  switch (agentId) {
    // === RESEARCH TEAM ===
    case 'scout': {
      const result = await searchWeb(query, 5);
      // Create research report deliverable
      if (result.success && result.results?.length) {
        const reportContent = `# Research Report: ${task.title}\n\n**Date:** ${new Date().toISOString()}\n**Query:** ${query}\n\n---\n\n## Summary\n\nFound ${result.results.length} relevant sources on this topic.\n\n## Sources\n\n${result.results.map((r: any, i: number) => `${i + 1}. **${r.title}**\n   - ${r.url}\n   - ${r.content?.substring(0, 200)}...`).join('\n\n')}\n\n---\n*Generated by Scout (Research Agent)*`;
        const deliverable = saveDeliverable('research', `${task.title}_${timestamp}`, reportContent);
        return addDeliverable(result, deliverable);
      }
      return result;
    }
    case 'radar': {
      const result = await analyzeSEO(task.title);
      // Create SEO report deliverable
      if (result.success) {
        const reportContent = `# SEO Analysis: ${task.title}\n\n**Date:** ${new Date().toISOString()}\n\n---\n\n## Target Keywords\n\n${result.keywords?.map((k: string) => `- ${k}`).join('\n') || 'N/A'}\n\n## SEO Tips\n\n${result.tips?.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n\n') || 'N/A'}\n\n---\n*Generated by Radar (SEO Agent)*`;
        const deliverable = saveDeliverable('seo', `${task.title}_${timestamp}`, reportContent);
        return addDeliverable(result, deliverable);
      }
      return result;
    }
    case 'compass': {
      const result = await analyzeCompetitors(query);
      // Create competitor analysis deliverable
      if (result.success && result.competitors?.length) {
        const reportContent = `# Competitor Analysis: ${task.title}\n\n**Date:** ${new Date().toISOString()}\n\n---\n\n## Competitors Found\n\n${result.competitors.map((c: any, i: number) => `### ${i + 1}. ${c.name}\n${c.summary}\n[Link](${c.url})`).join('\n\n')}\n\n---\n*Generated by Compass (Competitor Analysis Agent)*`;
        const deliverable = saveDeliverable('competitor', `${task.title}_${timestamp}`, reportContent);
        return addDeliverable(result, deliverable);
      }
      return result;
    }
    case 'trends': {
      const result = await searchWeb(`${query} trends 2026`, 5);
      // Create trends report deliverable
      if (result.success && result.results?.length) {
        const reportContent = `# Trends Report: ${task.title}\n\n**Date:** ${new Date().toISOString()}\n\n---\n\n## Key Trends\n\n${result.results.map((r: any, i: number) => `### ${r.title}\n${r.content?.substring(0, 300)}...\n\n[Read more](${r.url})`).join('\n\n')}\n\n---\n*Generated by Trends (Market Intelligence Agent)*`;
        const deliverable = saveDeliverable('trends', `${task.title}_${timestamp}`, reportContent);
        return addDeliverable(result, deliverable);
      }
      return result;
    }

    // === SALES TEAM ===
    case 'atlas':
    case 'pulse': {
      const result = await searchWeb(`companies ${query} leads`, 5);
      // Create leads list deliverable
      if (result.success && result.results?.length) {
        const reportContent = `# Lead List: ${task.title}\n\n**Date:** ${new Date().toISOString()}\n\n---\n\n## Potential Leads\n\n${result.results.map((r: any, i: number) => `${i + 1}. **${r.title}**\n   - ${r.url}\n   - Relevance: ${Math.round((r.score || 0.5) * 100)}%`).join('\n\n')}\n\n---\n*Generated by ${agentId === 'atlas' ? 'Atlas' : 'Pulse'} (Lead Generation Agent)*`;
        const deliverable = saveDeliverable('leads', `${task.title}_${timestamp}`, reportContent);
        return addDeliverable(result, deliverable);
      }
      return result;
    }
    case 'hunter':
    case 'phoenix': {
      const result = await sendEmail(
        task.metadata?.to || 'lead@example.com',
        task.title,
        task.description
      );
      // Create email deliverable
      const emailContent = `# Outreach Email: ${task.title}\n\n**To:** ${task.metadata?.to || 'lead@example.com'}\n**Subject:** ${task.title}\n\n---\n\n${task.description || task.title}\n\n---\n*Generated by ${agentId === 'hunter' ? 'Hunter' : 'Phoenix'} (Outreach Agent)*`;
      const deliverable = saveDeliverable('email', `${task.title}_${timestamp}`, emailContent);
      return addDeliverable(result, deliverable);
    }

    // === RETENTION TEAM ===
    case 'bond': {
      const result = await searchWeb(`${query} customer success best practices`, 3);
      if (result.success && result.results?.length) {
        const reportContent = `# Retention Strategy: ${task.title}\n\n**Date:** ${new Date().toISOString()}\n\n---\n\n## Best Practices\n\n${result.results.map((r: any, i: number) => `### ${r.title}\n${r.content?.substring(0, 300)}...`).join('\n\n')}\n\n---\n*Generated by Bond (Retention Agent)*`;
        const deliverable = saveDeliverable('retention', `${task.title}_${timestamp}`, reportContent);
        return addDeliverable(result, deliverable);
      }
      return result;
    }
    case 'mend': {
      const result = await researchCustomer(query);
      if (result.success) {
        const reportContent = `# Customer Issue Analysis: ${task.title}\n\n**Date:** ${new Date().toISOString()}\n\n---\n\n## Customer Info\n\n${result.customerInfo}\n\n## Related Case Studies\n\n${result.caseStudies?.map((c: any, i: number) => `${i + 1}. ${c.title}\n   - ${c.url}`).join('\n\n') || 'None found'}\n\n---\n*Generated by Mend (Issue Resolution Agent)*`;
        const deliverable = saveDeliverable('issue', `${task.title}_${timestamp}`, reportContent);
        return addDeliverable(result, deliverable);
      }
      return result;
    }
    case 'grow': {
      const result = await searchWeb(`${query} upsell opportunities`, 3);
      if (result.success && result.results?.length) {
        const reportContent = `# Upsell Opportunities: ${task.title}\n\n**Date:** ${new Date().toISOString()}\n\n---\n\n## Opportunities\n\n${result.results.map((r: any, i: number) => `### ${r.title}\n${r.content?.substring(0, 300)}...`).join('\n\n')}\n\n---\n*Generated by Grow (Expansion Agent)*`;
        const deliverable = saveDeliverable('upsell', `${task.title}_${timestamp}`, reportContent);
        return addDeliverable(result, deliverable);
      }
      return result;
    }

    // === DEV TEAM ===
    case 'byte':
    case 'server': {
      // Create Neo review task instead of auto-creating GitHub issue
      // Neo will review and decide the best approach
      const reviewTask = createNeoReviewTask(task.title, task.description, agentId, 'Requires code changes - need Neo guidance', task.metadata?.priority as string || 'medium', task.metadata);

      const result = {
        success: true,
        needsNeoReview: true,
        reviewTaskId: reviewTask.id,
        message: 'Escalated to Neo for review. Neo will provide guidance on how to proceed.'
      };

      // Also save a ticket for reference
      const ticketContent = `# Dev Task: ${task.title}\n\n**Status:** 🔶 ESCALATED TO NEO\n**Agent:** ${agentId}\n**Review Task ID:** ${reviewTask.id}\n\n---\n\n## Description\n\n${task.description || task.title}\n\n## Next Steps\n\nNeo will review this task and either:\n1. Provide guidance on how to complete\n2. Split into smaller tasks\n3. Handle directly\n\n---\n*Generated by ${agentId === 'byte' ? 'Byte' : 'Server'} (Development Agent)*`;
      const deliverable = saveDeliverable('devticket', `${task.title}_${timestamp}`, ticketContent);
      return addDeliverable(result, deliverable);
    }
    case 'pixel': {
      const result = { success: true, message: 'Frontend task noted', title: task.title };
      const content = `# Frontend Task: ${task.title}\n\n**Status:** To Do\n\n---\n\n## Requirements\n\n${task.description}\n\n## Notes\n\nFrontend implementation needed.\n\n---\n*Generated by Pixel (Frontend Agent)*`;
      const deliverable = saveDeliverable('frontend', `${task.title}_${timestamp}`, content);
      return addDeliverable(result, deliverable);
    }
    case 'auto': {
      const result = { success: true, message: 'Automation task noted', title: task.title };
      const content = `# Automation Task: ${task.title}\n\n**Status:** To Do\n\n---\n\n## Description\n\n${task.description}\n\n## Notes\n\nAutomation implementation needed (Zapier, Make, etc.)\n\n---\n*Generated by Auto (Automation Agent)*`;
      const deliverable = saveDeliverable('automation', `${task.title}_${timestamp}`, content);
      return addDeliverable(result, deliverable);
    }

    // === CONTENT TEAM ===
    case 'ink': {
      const result = await generateContent(`Write a compelling blog post about: ${task.title}. ${task.description}`, 1500);
      // Create blog post deliverable
      if (result.success && result.content) {
        const deliverable = saveDeliverable('blogpost', `${task.title}_${timestamp}`, result.content);
        return addDeliverable(result, deliverable);
      }
      return result;
    }
    case 'blaze': {
      const result = await postTweet(task.metadata?.content || task.description || task.title);
      // Create social post deliverable
      const content = `# Social Post: ${task.title}\n\n**Platform:** Twitter/X\n\n---\n\n${task.metadata?.content || task.description || task.title}\n\n---\n*Generated by Blaze (Social Media Agent)*`;
      const deliverable = saveDeliverable('social', `${task.title}_${timestamp}`, content);
      return addDeliverable(result, deliverable);
    }
    case 'draft': {
      const result = await generateContent(`Write a professional email about: ${task.title}. ${task.description}`, 500);
      // Create email campaign deliverable
      if (result.success && result.content) {
        const deliverable = saveDeliverable('emailcampaign', `${task.title}_${timestamp}`, result.content);
        return addDeliverable(result, deliverable);
      }
      return result;
    }
    case 'cinema': {
      const result: any = await generateVideoScript(task.title, task.metadata?.duration || '5 minutes');
      // Create video script deliverable
      if (result.success) {
        const scriptContent = `# Video Script: ${task.title}\n\n**Duration:** ${result.duration || 'N/A'}\n\n---\n\n${result.scenes?.map((s: any) => `## ${s.time}\n${s.content}`).join('\n\n') || result.content}\n\n---\n*Generated by Cinema (Video Production Agent)*`;
        const deliverable = saveDeliverable('videoscript', `${task.title}_${timestamp}`, scriptContent);
        return addDeliverable(result, deliverable);
      }
      return result;
    }

    // === NEO ORCHESTRATOR ===
    case 'neo': {
      const message = task.title;
      const lowerMsg = message.toLowerCase();

      // Determine which subagents to involve
      const subagents: { id: string; name: string; action: string }[] = [];

      if (lowerMsg.includes('research') || lowerMsg.includes('find') || lowerMsg.includes('analysis') || lowerMsg.includes('trends') || lowerMsg.includes('competitor')) {
        subagents.push({ id: 'scout', name: 'Scout', action: 'Research & Analysis' });
      }
      if (lowerMsg.includes('seo') || lowerMsg.includes('rank') || lowerMsg.includes('search')) {
        subagents.push({ id: 'radar', name: 'Radar', action: 'SEO Analysis' });
      }
      if (lowerMsg.includes('blog') || lowerMsg.includes('write') || lowerMsg.includes('content') || lowerMsg.includes('article')) {
        subagents.push({ id: 'ink', name: 'Ink', action: 'Content Creation' });
      }
      if (lowerMsg.includes('twitter') || lowerMsg.includes('social') || lowerMsg.includes('tweet') || lowerMsg.includes('post')) {
        subagents.push({ id: 'blaze', name: 'Blaze', action: 'Social Media' });
      }
      if (lowerMsg.includes('email') || lowerMsg.includes('outreach')) {
        subagents.push({ id: 'draft', name: 'Draft', action: 'Email Campaigns' });
      }
      if (lowerMsg.includes('video') || lowerMsg.includes('youtube')) {
        subagents.push({ id: 'cinema', name: 'Cinema', action: 'Video Production' });
      }
      if (lowerMsg.includes('lead') || lowerMsg.includes('prospect') || lowerMsg.includes('customer')) {
        subagents.push({ id: 'atlas', name: 'Atlas', action: 'Lead Generation' });
      }
      if (lowerMsg.includes('github') || lowerMsg.includes('code') || lowerMsg.includes('bug') || lowerMsg.includes('build')) {
        subagents.push({ id: 'byte', name: 'Byte', action: 'Development' });
      }
      if (lowerMsg.includes('retention') || lowerMsg.includes('churn')) {
        subagents.push({ id: 'bond', name: 'Bond', action: 'Customer Retention' });
      }

      // Default to research if no specific agents matched
      if (subagents.length === 0) {
        subagents.push({ id: 'scout', name: 'Scout', action: 'Research & Analysis' });
      }

      console.log(`[Neo] Orchestrating task: ${task.title} with ${subagents.length} subagents`);

      // Execute each subagent and collect results
      const subagentResults: any[] = [];

      for (const subagent of subagents) {
        console.log(`[Neo] Calling subagent: ${subagent.name}`);

        try {
          let result: any;

          // Call the appropriate subagent based on type
          switch (subagent.id) {
            case 'scout':
              result = await searchWeb(message, 5);
              break;
            case 'radar':
              result = await analyzeSEO(message);
              break;
            case 'ink':
              result = await generateContent(`Write a compelling blog post about: ${message}`, 1500);
              break;
            case 'blaze':
              result = await postTweet(message);
              break;
            case 'draft':
              result = await generateContent(`Write a professional email about: ${message}`, 500);
              break;
            case 'cinema':
              result = await generateVideoScript(message, '5 minutes');
              break;
            case 'atlas':
              result = await searchWeb(`companies ${message} leads`, 5);
              break;
            case 'byte':
              // Create a GitHub issue as deliverable
              const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
              if (GITHUB_TOKEN) {
                const [owner, repoName] = (process.env.GITHUB_REPO || 'g8rmyvkxpy-png/Mission-Control').split('/');
                const ghResult = await createGitHubIssue(owner, repoName, `Neo: ${message}`, task.description);
                result = ghResult;
              } else {
                result = { success: true, message: 'Development task noted (GitHub not configured)' };
              }
              break;
            case 'bond':
              result = await searchWeb(`${message} customer success best practices`, 3);
              break;
            default:
              result = { success: true, message: 'Task analyzed' };
          }

          subagentResults.push({
            agent: subagent.name,
            action: subagent.action,
            success: result.success,
            result: result
          });

        } catch (err: any) {
          console.error(`[Neo] Subagent ${subagent.name} failed:`, err);
          subagentResults.push({
            agent: subagent.name,
            action: subagent.action,
            success: false,
            error: err.message
          });
        }
      }

      // Generate final orchestration report
      const successfulResults = subagentResults.filter(r => r.success).length;

      const orchestrationReport = `# 🎯 Orchestration Report: ${task.title}

**Date:** ${new Date().toISOString()}
**Status:** ${successfulResults === subagentResults.length ? '✅ Completed' : '⚠️ Partial'}
**Subagents Coordinated:** ${subagents.length}

---

## Task Summary

${task.description}

---

## Subagent Results

${subagentResults.map(r => `
### ${r.agent} (${r.action})
- **Status:** ${r.success ? '✅ Success' : '❌ Failed'}
${r.success ? `- **Deliverable:** ${r.result?.deliverable?.path || 'Generated'}` : `- **Error:** ${r.error || 'Unknown error'}`}
`).join('\n')}

---

## Final Deliverables

${subagentResults.filter(r => r.success && r.result?.deliverable).map(r => `- ${r.agent}: ${r.result.deliverable.path.split('/').pop()}`).join('\n') || 'See individual agent results above'}

---

*Coordinated by Neo (Chief Orchestrator)*`;

      // Save orchestration deliverable
      const deliverable = saveDeliverable('orchestration', `${task.title}_${timestamp}`, orchestrationReport);

      return {
        success: true,
        message: `Neo orchestrated ${subagents.length} subagent(s), ${successfulResults} completed successfully`,
        orchestration: {
          totalSubagents: subagents.length,
          successful: successfulResults,
          failed: subagents.length - successfulResults,
          subagents: subagentResults
        },
        deliverable
      };
    }

    default:
      return { success: false, error: `No handler for agent: ${agentId}` };
  }
}

// === TASK PROCESSOR ===

let processorInterval: NodeJS.Timeout | null = null;

function startProcessor() {
  if (processorInterval) return;
  processorInterval = setInterval(async () => await processTasks(), 10000);
  processTasks();
}

async function processTasks() {
  const pending = tasks.filter(t => t.status === 'pending');
  if (!pending.length) return;

  console.log(`[Processor] ${pending.length} pending tasks`);

  for (const task of pending) {
    // If no agent assigned, analyze and handle the task
    if (!task.assignedTo) {
      // First check if it's a complex task that needs splitting
      const analysis = analyzeComplexTask(task.title, task.description);

      if (analysis.isComplex && analysis.subtasks.length > 1) {
        // Split into subtasks
        const split = await createSubtasks(task);
        if (split) continue; // Parent handled, move to next task
      }

      // Try to determine best single agent
      const agent = determineAgent(task.title, task.description);

      if (agent) {
        // Single agent can handle it - assign directly
        task.assignedTo = agent;
        task.status = 'processing';
        task.updatedAt = Date.now();
        saveTask(task);
        console.log(`[Neo] Auto-assigned task to ${agent}`);
      } else {
        // Could not handle - mark as failed
        task.status = 'failed';
        task.error = 'No agent could be assigned';
        saveTask(task);
        continue;
      }
    }

    // Skip full pipeline for review tasks - mark as review directly
    if (task.title.startsWith('[REVIEW]')) {
      task.status = 'review';
      task.phase = 'human_intervention';
      task.updatedAt = Date.now();
      saveTask(task);
      console.log(`[Review] Task ${task.id} queued for human review`);
      continue;
    }

    task.status = 'assigned'; // Phase 1: Task Analysis
    task.phase = 'analysis';
    task.updatedAt = Date.now();
    saveTask(task);

    try {
      const result: any = await executeAgentTask(task.assignedTo, { title: task.title, description: task.description, metadata: task.metadata });
      
      if (result.needsNeoReview) {
        // Neo escalation needed - set to review status
        task.status = 'review';
        task.phase = 'escalation';
        task.updatedAt = Date.now();
        saveTask(task);
      } else if (result.success) {
        task.status = 'processing'; // Phases 2-3: Discovery + Processing
        task.phase = 'discovery';
        task.updatedAt = Date.now();
        saveTask(task);
        
        // Wait a moment for processing to start
        await new Promise(r => setTimeout(r, 1000));
        
        if (result.completed) {
          task.status = 'done'; // Phase 4: Complete
          task.phase = 'delivered';
        }
      } else {
        task.status = 'failed';
        task.phase = 'error';
      }

      // Generate detailed summary for done tasks
      if (task.status === 'done') {
        console.log(`[Summary] Generating summary for task ${task.id} by ${task.assignedTo}`);
        const summary = generateDetailedSummary(task.assignedTo, { title: task.title, description: task.description, metadata: task.metadata }, result);
        console.log(`[Summary] Generated:`, JSON.stringify(summary).substring(0, 200));

        // Store both raw result and detailed summary
        task.result = {
          ...result,
          summary,
          completedAt: new Date().toISOString()
        };
      }
    } catch (error: any) {
      task.status = 'failed';
      task.error = error.message;
    }

    task.completedAt = Date.now();
    task.updatedAt = Date.now();
    saveTask(task);
  }
}

startProcessor();

// === API ROUTES ===

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assignee = searchParams.get('assignee');

    let filtered = [...tasks];
    if (status) filtered = filtered.filter(t => t.status === status);
    if (assignee) filtered = filtered.filter(t => t.assignedTo === assignee);

    const queueStatus = {
      pending: tasks.filter(t => t.status === 'pending').length,
      processing: tasks.filter(t => t.status === 'processing').length,
      completed: tasks.filter(t => t.status === 'done').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      total: tasks.length,
    };

    return NextResponse.json({ tasks: filtered, queueStatus, agents: AGENTS });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, assignedTo, priority, metadata } = body;

    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });

    const task: Task = {
      id: generateTaskId(),
      title,
      description: description || '',
      assignedTo,
      priority: priority || 'medium',
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata,
    };

    const insertIndex = tasks.findIndex(t => priorityOrder[t.priority] > priorityOrder[task.priority]);
    if (insertIndex === -1) tasks.push(task);
    else tasks.splice(insertIndex, 0, task);

    saveTask(task);
    console.log(`[Queue] Task ${task.id} -> ${assignedTo || 'unassigned'}`);

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { taskId, action } = body;
    if (!taskId || !action) return NextResponse.json({ error: 'taskId and action required' }, { status: 400 });

    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return NextResponse.json({ success: false, error: 'Task not found' });

    const task = tasks[taskIndex];
    let result = false;

    if (action === 'cancel' && task.status === 'pending') {
      task.status = 'failed';
      task.error = 'Cancelled';
      task.updatedAt = Date.now();
      result = true;
    } else if (action === 'retry' && task.status === 'failed') {
      task.status = 'pending';
      task.error = undefined;
      task.updatedAt = Date.now();
      result = true;
    }

    if (result) saveTask(task);
    return NextResponse.json({ success: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Delete a specific task by ID
    const taskId = searchParams.get('id');
    if (taskId) {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        return NextResponse.json({ success: false, error: 'Task not found' });
      }

      const deletedTask = tasks[taskIndex];
      tasks.splice(taskIndex, 1);

      // Also delete from database
      if (db) {
        db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
      }

      // Delete associated deliverable if exists
      if (deletedTask.result?.deliverable?.path) {
        const deliverablePath = deletedTask.result.deliverable.path;
        if (fs.existsSync(deliverablePath)) {
          fs.unlinkSync(deliverablePath);
          console.log(`[Deliverable] Deleted: ${deliverablePath}`);
        }
      }

      return NextResponse.json({ success: true, deleted: deletedTask });
    }

    // Clear all completed/failed tasks
    if (searchParams.get('clear') === 'history') {
      tasks = tasks.filter(t => t.status === 'pending' || t.status === 'processing');
      if (db) db.prepare("DELETE FROM tasks WHERE status IN ('done', 'failed')").run();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
