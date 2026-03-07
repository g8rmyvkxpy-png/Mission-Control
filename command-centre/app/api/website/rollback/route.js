import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import fs from 'fs';
import path from 'path';

const WEBSITE_ROOT = '/home/deva/.openclaw/workspace/ppventures';

// Helper to verify agent API key
async function verifyAgent(apiKey) {
  const { data } = await supabaseAdmin
    .from('agents')
    .select('id, name')
    .eq('api_key', apiKey)
    .single();
  return data || null;
}

// POST /api/website/rollback - Restore from backup
export async function POST(request) {
  try {
    const body = await request.json();
    const { api_key, backup_path } = body;
    
    // Verify API key
    if (!api_key) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }
    
    const agent = await verifyAgent(api_key);
    if (!agent) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    
    if (!backup_path || !fs.existsSync(backup_path)) {
      return NextResponse.json({ error: 'Backup file not found' }, { status: 404 });
    }
    
    // Extract original path from backup
    const originalPath = backup_path.replace(/\.backup\.\d+$/, '');
    const relativePath = path.relative(WEBSITE_ROOT, originalPath);
    
    // Read backup and write to original
    const backupContent = fs.readFileSync(backup_path, 'utf-8');
    fs.writeFileSync(originalPath, backupContent);
    
    // Log rollback
    await supabaseAdmin.from('activity_logs').insert({
      agent_id: agent.id,
      message: `${agent.name} rolled back ${relativePath} from backup`,
      log_type: 'task'
    });
    
    // Trigger rebuild
    try {
      const { execSync } = require('child_process');
      execSync('pm2 restart ppventures', { stdio: 'ignore' });
    } catch (e) {
      console.log('Could not restart ppventures:', e.message);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Rolled back ${relativePath}`,
      restored_from: backup_path
    });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/website/backups - List available backups
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const api_key = searchParams.get('api_key');
  
  if (!api_key) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }
  
  const agent = await verifyAgent(api_key);
  if (!agent) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  // Find all backup files
  const findBackups = (dir, backups = []) => {
    if (!fs.existsSync(dir)) return backups;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        findBackups(fullPath, backups);
      } else if (entry.name.includes('.backup.')) {
        const stats = fs.statSync(fullPath);
        backups.push({
          path: fullPath,
          relative: path.relative(WEBSITE_ROOT, fullPath),
          original: fullPath.replace(/\.backup\.\d+$/, ''),
          size: stats.size,
          created: stats.mtime
        });
      }
    }
    return backups;
  };
  
  const backups = findBackups(WEBSITE_ROOT);
  
  return NextResponse.json({ backups });
}
