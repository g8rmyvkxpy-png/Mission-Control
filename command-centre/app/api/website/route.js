import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import fs from 'fs';
import path from 'path';

const WEBSITE_ROOT = '/home/deva/.openclaw/workspace/ppventures';

// Safety limits
const ALLOWED_PATHS = ['app/', 'pages/', 'content/', 'posts/', 'public/', 'components/', 'lib/'];
const FORBIDDEN_PATHS = ['.env', '.env.local', 'next.config', 'package.json', 'package-lock.json', 'node_modules/', '.git/'];
const MAX_FILE_SIZE = 50000;

// Helper to verify agent API key
async function verifyAgent(apiKey) {
  const { data, error } = await supabaseAdmin
    .from('agents')
    .select('id, name, api_key')
    .eq('api_key', apiKey)
    .single();
  
  return data || null;
}

// Helper to check if path is allowed
function isPathAllowed(filePath) {
  // Check forbidden paths
  for (const forbidden of FORBIDDEN_PATHS) {
    if (filePath.includes(forbidden)) return false;
  }
  // Check allowed paths
  for (const allowed of ALLOWED_PATHS) {
    if (filePath.startsWith(allowed)) return true;
  }
  return filePath.startsWith('content/') || filePath.startsWith('posts/');
}

// GET /api/website/files - List website files
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const filePath = searchParams.get('path');
    
    // Verify API key
    const apiKey = searchParams.get('api_key');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }
    
    const agent = await verifyAgent(apiKey);
    if (!agent) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    
    if (action === 'read' && filePath) {
      // Read specific file
      const fullPath = path.join(WEBSITE_ROOT, filePath);
      
      if (!isPathAllowed(filePath)) {
        return NextResponse.json({ error: 'Path not allowed' }, { status: 403 });
      }
      
      if (!fs.existsSync(fullPath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      
      const content = fs.readFileSync(fullPath, 'utf-8');
      return NextResponse.json({ content, path: filePath });
    }
    
    // List files (default)
    const listFiles = (dir, basePath = '') => {
      const items = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const relativePath = path.join(basePath, entry.name);
        
        // Skip forbidden
        if (FORBIDDEN_PATHS.some(f => entry.name.includes(f))) continue;
        
        if (entry.isDirectory()) {
          items.push({ type: 'directory', path: relativePath });
          items.push(...listFiles(path.join(dir, entry.name), relativePath));
        } else {
          const stats = fs.statSync(path.join(dir, entry.name));
          items.push({ 
            type: 'file', 
            path: relativePath,
            size: stats.size,
            modified: stats.mtime
          });
        }
      }
      return items;
    };
    
    const files = listFiles(WEBSITE_ROOT);
    return NextResponse.json({ files, website: 'ppventures', root: WEBSITE_ROOT });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/website/implement - Implement changes
export async function POST(request) {
  try {
    const body = await request.json();
    const { api_key, action, file_path, content, description, backup = true } = body;
    
    // Verify API key
    if (!api_key) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }
    
    const agent = await verifyAgent(api_key);
    if (!agent) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    
    // Validate action
    if (!['update_file', 'create_file', 'append_to_file'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    // Check path safety
    if (!isPathAllowed(file_path)) {
      return NextResponse.json({ error: 'Path not allowed. Only content files can be edited.' }, { status: 403 });
    }
    
    const fullPath = path.join(WEBSITE_ROOT, file_path);
    const backupPath = fullPath + '.backup.' + Date.now();
    
    // Check if file exists for update
    if (action === 'update_file' && !fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'File does not exist' }, { status: 404 });
    }
    
    // Check file size
    if (content && content.length > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File too large. Max ${MAX_FILE_SIZE} bytes.` }, { status: 400 });
    }
    
    // Create backup if file exists and backup requested
    let backupPathResult = null;
    if (backup && fs.existsSync(fullPath)) {
      fs.copyFileSync(fullPath, backupPath);
      backupPathResult = backupPath;
    }
    
    // Ensure directory exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Perform action
    if (action === 'append_to_file' && fs.existsSync(fullPath)) {
      fs.appendFileSync(fullPath, content);
    } else {
      fs.writeFileSync(fullPath, content);
    }
    
    // Log the change
    await supabaseAdmin.from('activity_logs').insert({
      agent_id: agent.id,
      message: `${agent.name} updated ${file_path}: ${description || action}`,
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
      agent: agent.name,
      action,
      file_path,
      backup_path: backupPathResult,
      message: `${agent.name} ${action} ${file_path}`
    });
    
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
