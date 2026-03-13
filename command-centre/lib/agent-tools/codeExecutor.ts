/**
 * Code Executor Module for Agent Operations
 * Provides file system operations, command execution, and build verification
 */

import fs from 'fs';
import path from 'path';
import { exec as execSync } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execSync);

// Base project directory - the Command Centre project root
const PROJECT_ROOT = process.cwd();

// Whitelist of allowed commands for security
const ALLOWED_COMMANDS = [
  'npm run build',
  'npm run lint',
  'npx tsc --noEmit',
  'npm test',
  'npm run dev'
];

// Maximum file size (500 lines max per change)
const MAX_FILE_LINES = 500;

// Backup directory
const BACKUP_DIR = path.join(PROJECT_ROOT, '.backups');

/**
 * Ensure backup directory exists
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

/**
 * Read a file from the project directory
 */
export function readProjectFile(filePath: string): string {
  const fullPath = path.resolve(PROJECT_ROOT, filePath);
  
  if (!fullPath.startsWith(PROJECT_ROOT)) {
    throw new Error(`Access denied: Path ${filePath} is outside project root`);
  }
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${filePath}. Use listProjectFiles() to discover actual structure.`);
  }
  
  const stats = fs.statSync(fullPath);
  if (stats.isDirectory()) {
    throw new Error(`Path is a directory: ${filePath}`);
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8');
  const lineCount = content.split('\n').length;
  
  if (lineCount > MAX_FILE_LINES) {
    throw new Error(`File too large: ${filePath} has ${lineCount} lines (max ${MAX_FILE_LINES})`);
  }
  
  return content;
}

/**
 * Write content to a file in the project directory
 * Creates backup before writing
 */
export function writeProjectFile(filePath: string, content: string): void {
  const fullPath = path.resolve(PROJECT_ROOT, filePath);
  
  if (!fullPath.startsWith(PROJECT_ROOT)) {
    throw new Error(`Access denied: Path ${filePath} is outside project root`);
  }
  
  // Security: Block critical files
  const forbiddenFiles = ['package.json', 'next.config.js', '.env', '.env.local', '.env.production'];
  if (forbiddenFiles.some(f => fullPath.endsWith(f))) {
    throw new Error(`Forbidden: Cannot modify ${filePath} for security reasons`);
  }
  
  // Ensure directory exists
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Create backup if file exists
  if (fs.existsSync(fullPath)) {
    ensureBackupDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, timestamp, filePath);
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    fs.copyFileSync(fullPath, backupPath);
  }
  
  fs.writeFileSync(fullPath, content, 'utf-8');
}

/**
 * List files in a project directory
 */
export function listProjectFiles(directory: string = 'src'): string[] {
  const fullPath = path.resolve(PROJECT_ROOT, directory);
  
  if (!fullPath.startsWith(PROJECT_ROOT)) {
    throw new Error(`Access denied: Path ${directory} is outside project root`);
  }
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Directory not found: ${directory}`);
  }
  
  const files: string[] = [];
  const ignoreDirs = ['node_modules', '.next', '.git', '.backups', 'dist', 'build'];
  
  function walkDir(dir: string, baseDir: string = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      if (ignoreDirs.includes(item)) continue;
      
      const fullItemPath = path.join(dir, item);
      const relativePath = path.join(baseDir, item);
      const stats = fs.statSync(fullItemPath);
      
      if (stats.isDirectory()) {
        walkDir(fullItemPath, relativePath);
      } else {
        files.push(relativePath);
      }
    }
  }
  
  walkDir(fullPath, directory);
  return files;
}

/**
 * Run a shell command with timeout
 */
export async function runCommand(
  command: string, 
  timeoutMs: number = 60000
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  // Security: Only allow whitelisted commands
  const isAllowed = ALLOWED_COMMANDS.some(allowed => 
    command === allowed || command.startsWith(allowed + ' ')
  );
  
  if (!isAllowed) {
    throw new Error(`Command not allowed: ${command}. Allowed: ${ALLOWED_COMMANDS.join(', ')}`);
  }
  
  try {
    const { stdout, stderr } = await exec(command, { 
      cwd: PROJECT_ROOT,
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });
    
    return {
      stdout: stdout || '',
      stderr: stderr || '',
      exitCode: 0
    };
  } catch (error: any) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || error.message,
      exitCode: error.code || 1
    };
  }
}

/**
 * Rollback a file from backup
 */
export function rollbackFile(filePath: string, timestamp: string): void {
  const fullPath = path.resolve(PROJECT_ROOT, filePath);
  const backupPath = path.join(BACKUP_DIR, timestamp, filePath);
  
  if (!fs.existsSync(backupPath)) {
    throw new Error(`No backup found for ${filePath} at ${timestamp}`);
  }
  
  fs.copyFileSync(backupPath, fullPath);
}

/**
 * Get project structure summary
 */
export function getProjectStructure(): string {
  const structure = {
    'pages': listProjectFiles('pages'),
    'app': listProjectFiles('app'),
    'components': listProjectFiles('components'),
    'lib': listProjectFiles('lib'),
    'styles': listProjectFiles('styles'),
    'public': listProjectFiles('public')
  };
  
  return JSON.stringify(structure, null, 2);
}
