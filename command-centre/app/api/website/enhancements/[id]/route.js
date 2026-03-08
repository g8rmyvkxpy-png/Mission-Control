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

// PATCH — update enhancement
export async function PATCH(req, { params }) {
  const { id } = params;
  const body = await req.json();
  
  const enhancements = getEnhancements();
  const index = enhancements.findIndex(e => e.id === id);
  
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  // Update allowed fields
  const allowedFields = ['status', 'agent_id', 'before_content', 'after_content', 'implemented_at', 'issue', 'improvement'];
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      enhancements[index][field] = body[field];
    }
  }
  
  saveEnhancements(enhancements);
  
  return NextResponse.json({ enhancement: enhancements[index] });
}

// GET — get single enhancement
export async function GET(req, { params }) {
  const { id } = params;
  
  const enhancements = getEnhancements();
  const enhancement = enhancements.find(e => e.id === id);
  
  if (!enhancement) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  return NextResponse.json({ enhancement });
}
