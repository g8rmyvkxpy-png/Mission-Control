import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const dataDir = join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const enhancementsFile = join(dataDir, 'enhancements.json');

function getEnhancements() {
  if (!existsSync(enhancementsFile)) {
    return [];
  }
  try {
    return JSON.parse(readFileSync(enhancementsFile, 'utf-8'));
  } catch {
    return [];
  }
}

function saveEnhancements(enhancements) {
  writeFileSync(enhancementsFile, JSON.stringify(enhancements, null, 2));
}

// GET — list all enhancements
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const page = searchParams.get('page');
  
  let enhancements = getEnhancements();
  
  if (status && status !== 'all') {
    enhancements = enhancements.filter(e => e.status === status);
  }
  
  if (page) {
    enhancements = enhancements.filter(e => e.page === page);
  }
  
  // Sort by created_at desc
  enhancements.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  // Get stats
  const stats = {
    total: getEnhancements().length,
    queued: getEnhancements().filter(e => e.status === 'queued').length,
    in_progress: getEnhancements().filter(e => e.status === 'in_progress').length,
    implemented: getEnhancements().filter(e => e.status === 'implemented').length,
    failed: getEnhancements().filter(e => e.status === 'failed').length,
    skipped: getEnhancements().filter(e => e.status === 'skipped').length,
    by_page: {}
  };
  
  // Group by page
  const pages = [...new Set(getEnhancements().map(e => e.page))];
  for (const p of pages) {
    stats.by_page[p] = {
      queued: getEnhancements().filter(e => e.page === p && e.status === 'queued').length,
      in_progress: getEnhancements().filter(e => e.page === p && e.status === 'in_progress').length,
      implemented: getEnhancements().filter(e => e.page === p && e.status === 'implemented').length,
      failed: getEnhancements().filter(e => e.page === p && e.status === 'failed').length
    };
  }
  
  return NextResponse.json({ 
    enhancements: enhancements.slice(0, 50),
    stats 
  });
}

// POST — create new enhancement
export async function POST(req) {
  const body = await req.json();
  
  const enhancement = {
    id: crypto.randomUUID(),
    page: body.page || 'other',
    file_path: body.file_path || '',
    issue: body.issue || '',
    improvement: body.improvement || '',
    status: body.status || 'queued',
    agent_id: body.agent_id || null,
    priority: body.priority || 'medium',
    impact: body.impact || 'medium',
    before_content: null,
    after_content: null,
    implemented_at: null,
    created_at: new Date().toISOString()
  };
  
  const enhancements = getEnhancements();
  enhancements.push(enhancement);
  saveEnhancements(enhancements);
  
  return NextResponse.json({ enhancement }, { status: 201 });
}
