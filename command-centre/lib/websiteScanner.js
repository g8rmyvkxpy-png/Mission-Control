const fs = require('fs');
const path = require('path');

const PPVENTURES_PATH = process.env.PPVENTURES_PATH || 
  '/home/deva/.openclaw/workspace/ppventures';

function scanAllFiles() {
  const files = {};
  const extensions = ['.tsx', '.ts', '.js', '.jsx', '.css', '.md'];
  const skipDirs = ['node_modules', '.next', '.git', 'dist', 'data'];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        if (skipDirs.includes(item)) continue;
        const full = path.join(dir, item);
        try {
          const stat = fs.statSync(full);
          if (stat.isDirectory()) walk(full);
          else if (extensions.some(e => item.endsWith(e))) {
            const relative = path.relative(PPVENTURES_PATH, full);
            files[relative] = {
              content: fs.readFileSync(full, 'utf8'),
              size: stat.size,
              modified: stat.mtime
            };
          }
        } catch (e) {
          // Skip inaccessible files
        }
      }
    } catch (e) {
      // Skip inaccessible directories
    }
  }

  walk(PPVENTURES_PATH);
  return files;
}

function getPageFiles() {
  const all = scanAllFiles();
  const pages = {};

  for (const [file, data] of Object.entries(all)) {
    let page = 'other';
    if (file.includes('app/page.') && !file.includes('dashboard')) page = 'homepage';
    else if (file.includes('automation/dashboard')) page = 'automation_dashboard';
    else if (file.includes('automation')) page = 'automation_landing';
    else if (file.includes('services')) page = 'services';
    else if (file.includes('about')) page = 'about';
    else if (file.includes('ai-agents')) page = 'ai_agents';
    else if (file.includes('blog') || file.includes('posts')) page = 'blog';
    else if (file.includes('contact')) page = 'contact';
    else if (file.includes('components')) page = 'components';
    else if (file.includes('styles') || file.includes('.css')) page = 'styles';

    if (!pages[page]) pages[page] = {};
    pages[page][file] = data.content.slice(0, 3000);
  }

  return pages;
}

function readFileContent(relativePath) {
  const fullPath = path.join(PPVENTURES_PATH, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf8');
}

function writeFileContent(relativePath, content) {
  const fullPath = path.join(PPVENTURES_PATH, relativePath);
  try {
    // Create backup
    if (fs.existsSync(fullPath)) {
      const backupDir = path.join(PPVENTURES_PATH, 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      const timestamp = Date.now();
      const backupPath = path.join(backupDir, `${relativePath.replace(/\//g, '_')}.${timestamp}.bak`);
      fs.copyFileSync(fullPath, backupPath);
    }
    
    // Ensure directory exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content, 'utf8');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

module.exports = { scanAllFiles, getPageFiles, readFileContent, writeFileContent, PPVENTURES_PATH };
