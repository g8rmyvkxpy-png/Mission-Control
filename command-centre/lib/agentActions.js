const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PPVENTURES_PATH = process.env.PPVENTURES_PATH || '/home/deva/ppventures-next';

const ALLOWED_PATHS = ['app/', 'pages/', 'components/', 'content/', 'public/', 'posts/'];
const FORBIDDEN_PATHS = ['.env', 'next.config', 'package.json', 'node_modules', 'start-agents'];

// Read a file from the website
function readFile(filePath) {
  try {
    const full = path.join(PPVENTURES_PATH, filePath);
    if (!fs.existsSync(full)) return null;
    return fs.readFileSync(full, 'utf8');
  } catch (err) {
    return null;
  }
}

// Write a file to the website with backup
function writeFile(filePath, newContent, agentName) {
  try {
    const full = path.join(PPVENTURES_PATH, filePath);

    const isAllowed = ALLOWED_PATHS.some(a => filePath.startsWith(a));
    const isForbidden = FORBIDDEN_PATHS.some(f => filePath.includes(f));

    if (!isAllowed || isForbidden) {
      return { success: false, error: `Write blocked — path not allowed: ${filePath}` };
    }

    // Backup original
    if (fs.existsSync(full)) {
      const backupPath = full + '.backup.' + Date.now();
      fs.copyFileSync(full, backupPath);
    }

    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, newContent, 'utf8');

    console.log(`[${agentName}] ✅ Wrote ${filePath}`);
    return { success: true, file: filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Replace specific text in a file
function replaceInFile(filePath, oldText, newText, agentName) {
  const current = readFile(filePath);
  if (!current) return { success: false, error: `File not found: ${filePath}` };
  if (!current.includes(oldText)) return { success: false, error: `Text not found in ${filePath}` };

  const updated = current.replace(oldText, newText);
  return writeFile(filePath, updated, agentName);
}

// Create a new blog post file
function createBlogPost(title, content, agentName) {
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);
  const date = new Date().toISOString().split('T')[0];
  const filePath = `content/posts/${slug}.md`;
  const fileContent = `---
title: "${title}"
date: "${date}"
author: "${agentName}"
---

${content}`;
  return writeFile(filePath, fileContent, agentName);
}

// Restart the ppventures website
function restartWebsite() {
  return new Promise((resolve) => {
    exec('pm2 restart ppventures 2>/dev/null || pm2 restart website 2>/dev/null || true', (err, stdout) => {
      resolve(stdout || 'Restart attempted');
    });
  });
}

// Read all key website pages for context
function getWebsiteContext() {
  const keyFiles = [
    'app/page.js', 'app/page.tsx', 'pages/index.js', 'pages/index.tsx',
    'app/services/page.js', 'app/services/page.tsx',
    'app/about/page.js', 'app/ai-agents/page.js',
    'content/home.md', 'content/services.md',
    'components/Header.js', 'components/Footer.js'
  ];

  let context = '';
  for (const file of keyFiles) {
    const content = readFile(file);
    if (content) {
      context += `\n=== ${file} ===\n${content.slice(0, 1500)}\n`;
    }
  }
  return context || 'No website files found at configured path';
}

module.exports = { readFile, writeFile, replaceInFile, createBlogPost, restartWebsite, getWebsiteContext };
