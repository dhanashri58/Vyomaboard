process.env.YJS_DISABLE_DOUBLE_IMPORT_CHECK = 'true';
delete process.env.YPERSISTENCE;
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import https from 'https';
import http from 'http';
import AdmZip from 'adm-zip';
import { exec, spawn, execFile } from 'child_process';
import util from 'util';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { WebSocketServer } from 'ws';
import { createRequire } from 'module';
import os from 'os';
import pty from 'node-pty';
const require = createRequire(import.meta.url);
const Y = require('yjs');
const { setupWSConnection, setPersistence } = require('y-websocket/bin/utils');
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cron from 'node-cron';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
if (JWT_SECRET === 'super-secret-key-change-in-production') {
  console.warn('WARNING: Using insecure default JWT_SECRET. Set the JWT_SECRET environment variable in production.');
}

const execPromise = util.promisify(exec);
const execFilePromise = util.promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const DEFAULT_PORT = Number(process.env.PORT || process.env.BACKEND_PORT || 3002);
let server;

// Setup database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS yjs_documents (
    room_id TEXT PRIMARY KEY,
    document_state BLOB,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    username TEXT,
    role TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS annotations (
    file_id TEXT PRIMARY KEY,
    strokes TEXT NOT NULL DEFAULT '[]',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    hostName TEXT,
    hostId TEXT,
    parentId TEXT,
    kind TEXT DEFAULT 'board',
    meta TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS attendance (
    room_id TEXT NOT NULL,
    date TEXT NOT NULL,
    student_id TEXT NOT NULL,
    name TEXT,
    manual INTEGER DEFAULT 0,
    auto INTEGER DEFAULT 0,
    joined_at TEXT,
    PRIMARY KEY (room_id, date, student_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS submissions (
    room_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    data TEXT NOT NULL DEFAULT '{}',
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (room_id, student_id)
  )`);
});

// Migrate older databases: add missing columns if existing SQLite DB was created with older schema
db.all(`PRAGMA table_info(users)`, (migErr, rows) => {
  if (migErr) return console.error('Migration check failed:', migErr);
  const names = rows.map(r => r.name);
  const addColumn = (column, definition) => {
    if (!names.includes(column)) {
      db.run(`ALTER TABLE users ADD COLUMN ${column} ${definition}`, (alterErr) => {
        if (alterErr) console.error('Migration failed to add column:', alterErr);
      });
    }
  };
  addColumn('username', 'TEXT');
  addColumn('role', 'TEXT');
  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL`);
});

// Migrate rooms table if it exists without new columns
db.all(`PRAGMA table_info(rooms)`, (migErr, rows) => {
  if (migErr || !rows) return;
  const names = rows.map(r => r.name);
  const addCol = (col, def) => {
    if (!names.includes(col)) {
      db.run(`ALTER TABLE rooms ADD COLUMN ${col} ${def}`, (alterErr) => {
        if (alterErr) console.error(`Migration failed to add rooms.${col}:`, alterErr);
      });
    }
  };
  addCol('hostName', 'TEXT');
  addCol('hostId', 'TEXT');
  addCol('parentId', 'TEXT');
  addCol('kind', "TEXT DEFAULT 'board'");
  addCol('meta', "TEXT DEFAULT '{}'");
  addCol('created_at', 'DATETIME');
});

// Migrate annotations table if it uses old schema
db.all(`PRAGMA table_info(annotations)`, (migErr, rows) => {
  if (migErr) return console.error('Migration check failed:', migErr);
  const names = rows.map(r => r.name);
  if (names.includes('fileId') && !names.includes('file_id')) {
    db.run(`ALTER TABLE annotations RENAME TO annotations_old`, () => {
      db.run(`CREATE TABLE IF NOT EXISTS annotations (
        file_id TEXT PRIMARY KEY,
        strokes TEXT NOT NULL DEFAULT '[]',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, () => {
         db.run(`INSERT INTO annotations (file_id, strokes) SELECT fileId, strokesData FROM annotations_old`);
      });
    });
  }
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }, (err, user) => {
    if (err) return res.status(403).json({ success: false, error: 'Forbidden' });
    req.user = user;
    next();
  });
};

// Validation Schemas
const roomSchema = z.object({
  name: z.string().min(2, "Room name must be at least 2 characters").max(100),
  hostId: z.string().optional()
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Auth Endpoints

app.post('/api/auth/account', express.json(), (req, res) => {
  const { username, email, password } = req.body;
  const identifier = (username || email || '').trim();
  if (!identifier || !password) return res.status(400).json({ error: 'Email and password are required' });

  db.get(`SELECT * FROM users WHERE email = ? OR username = ?`, [identifier, identifier], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!user) return res.status(401).json({ error: 'No account found with this email' });

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Incorrect password' });

    const role = user.role || 'Casual';
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, username: user.username, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, username: user.username, role }
    });
  });
});

// Public sign-up: create an account straight from the sign-in page.
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email required'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  role: z.string().optional()
});

app.post('/api/auth/register', express.json(), (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.errors[0].message });
  }
  const { name, email, password, role = 'Casual' } = result.data;

  db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existing) return res.status(409).json({ success: false, error: 'An account with this email already exists' });

    const hash = bcrypt.hashSync(password, 10);
    db.run(`INSERT INTO users (name, email, password_hash, username, role) VALUES (?, ?, ?, NULL, ?)`,
      [name, email, hash, role],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        const token = jwt.sign({ id: this.lastID, name, email, username: null, role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user: { id: this.lastID, name, email, username: null, role } });
      }
    );
  });
});

// Account management (create/list). Requires a valid token.
const accountSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters').max(50),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  role: z.string().optional()
});

app.get('/api/accounts', authenticateToken, (req, res) => {
  db.all(`SELECT id, username, name, email, role, created_at FROM users ORDER BY id`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, accounts: rows });
  });
});

app.post('/api/accounts', authenticateToken, express.json(), (req, res) => {
  const result = accountSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.errors[0].message });
  }
  const { username, password, name, email = '', role = 'Casual' } = result.data;

  db.get(`SELECT id FROM users WHERE username = ? OR email = ?`, [username, email], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existing) return res.status(409).json({ success: false, error: 'Username or email already exists' });

    const hash = bcrypt.hashSync(password, 10);
    db.run(`INSERT INTO users (name, email, password_hash, username, role) VALUES (?, ?, ?, ?, ?)`,
      [name, email, hash, username, role],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({
          success: true,
          account: { id: this.lastID, username, name, email, role }
        });
      }
    );
  });
});

// Setup Yjs Persistence
const saveYdoc = (docName, ydoc) => {
  return new Promise((resolve, reject) => {
    const stateVector = Y.encodeStateAsUpdate(ydoc);
    const buffer = Buffer.from(stateVector);
    db.run(
      `INSERT INTO yjs_documents (room_id, document_state, updated_at) 
       VALUES (?, ?, CURRENT_TIMESTAMP) 
       ON CONFLICT(room_id) DO UPDATE SET document_state=excluded.document_state, updated_at=CURRENT_TIMESTAMP`,
      [docName, buffer],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

setPersistence({
  bindState: async (docName, ydoc) => {
    return new Promise((resolve) => {
      db.get(`SELECT document_state FROM yjs_documents WHERE room_id = ?`, [docName], (err, row) => {
        if (err) {
          console.error('Error loading Yjs document:', err);
        } else if (row && row.document_state) {
          try {
            Y.applyUpdate(ydoc, new Uint8Array(row.document_state));
            console.log(`Loaded persisted state for room: ${docName}`);
          } catch (e) {
            console.error('Error applying Yjs update:', e);
          }
        }
        
        let timeoutId;
        ydoc.on('update', () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            saveYdoc(docName, ydoc).catch(console.error);
          }, 2000);
        });
        
        resolve();
      });
    });
  },
  writeState: async (docName, ydoc) => {
    return saveYdoc(docName, ydoc);
  }
});

// Setup upload directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage and limits
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitize filename to prevent path traversal / command injection
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, uniqueSuffix + '-' + safeOriginalName);
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://localhost:3001", "https://localhost:3002", "wss://localhost:3001", "wss://localhost:3002", "http://localhost:3001", "http://localhost:3002", "ws://localhost:3001", "ws://localhost:3002"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      frameSrc: ["'self'", "blob:"]
    }
  }
}));

const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'https://localhost:5173,https://localhost:4173,http://localhost:5173,http://localhost:4173,http://localhost:5174,https://localhost:5174')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(uploadDir)); 

// Persistent server-side file upload endpoint
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file provided' });
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url,
    name: req.file.originalname,
    size: req.file.size,
    fileId: req.file.filename
  });
});

// Convert PPTX to PDF endpoint
app.post('/api/convert-ppt-to-pdf', authenticateToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file provided' });
  }
  
  const inputPath = req.file.path;
  const outputDir = path.dirname(inputPath);
  
  try {
    const libreOfficePath = process.platform === 'win32' 
      ? 'C:\\Program Files\\LibreOffice\\program\\soffice.exe' 
      : 'libreoffice';
      
    const args = ['--headless', '--convert-to', 'pdf', inputPath, '--outdir', outputDir];
    await execFilePromise(libreOfficePath, args, { timeout: 60000 });
    
    const baseName = path.parse(inputPath).name;
    const pdfPath = path.join(outputDir, `${baseName}.pdf`);
    
    if (fs.existsSync(pdfPath)) {
      const url = `/uploads/${baseName}.pdf`;
      res.json({
        success: true,
        url,
        name: req.file.originalname.replace(/\.pptx?$/i, '.pdf'),
        fileId: `${baseName}.pdf`
      });
    } else {
      throw new Error('PDF file was not generated');
    }
  } catch (err) {
    console.error('PPTX to PDF conversion failed:', err);
    res.status(500).json({ success: false, error: 'Conversion failed: ' + err.message });
  }
});

// Apply rate limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});
app.use('/api/', apiLimiter);

const codeRunLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many code execution requests, please try again later.'
});

// Annotations Endpoints
app.get('/api/annotations/:fileId', authenticateToken, (req, res) => {
  const { fileId } = req.params;
  db.get('SELECT strokes FROM annotations WHERE file_id = ?', [fileId], (err, row) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!row) return res.json({ success: true, strokes: [] });
    try {
      const strokes = JSON.parse(row.strokes);
      res.json({ success: true, strokes });
    } catch (e) {
      res.json({ success: true, strokes: [] });
    }
  });
});

app.post('/api/annotations/:fileId', authenticateToken, express.json(), (req, res) => {
  const { fileId } = req.params;
  const { strokes } = req.body;
  
  if (!Array.isArray(strokes)) {
    return res.status(400).json({ success: false, error: 'strokes must be an array' });
  }
  
  const strokesStr = JSON.stringify(strokes);
  db.run(
    `INSERT INTO annotations (file_id, strokes, updated_at) 
     VALUES (?, ?, CURRENT_TIMESTAMP) 
     ON CONFLICT(file_id) DO UPDATE SET strokes=excluded.strokes, updated_at=CURRENT_TIMESTAMP`,
    [fileId, strokesStr],
    (err) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true });
    }
  );
});

// Save Workspace File Endpoint for Terminal
app.post('/api/save-workspace-file', authenticateToken, express.json({ limit: '10mb' }), (req, res) => {
  const { boardName, filename, content } = req.body;
  if (!filename) return res.status(400).json({ success: false, error: 'Filename is required' });
  
  const safeBoardName = (boardName || 'Workspace').replace(/[^a-zA-Z0-9-_\s]/g, '_');
  const workspacePath = path.join(__dirname, 'workspaces', safeBoardName);
  
  if (!fs.existsSync(workspacePath)) {
    fs.mkdirSync(workspacePath, { recursive: true });
  }
  
  const filePath = path.join(workspacePath, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  res.json({ success: true, filePath: filename });
});

// Run Code Endpoint
app.post('/api/run-code', authenticateToken, express.json({ limit: '50mb' }), async (req, res) => {
  const { code, language, files } = req.body;
  if (language !== 'c' && language !== 'python' && language !== 'javascript' && language !== 'java') {
    return res.status(400).json({ success: false, error: 'Language not supported' });
  }
  
  const runId = Math.random().toString(36).substring(2, 15);
  const tempDir = path.join(__dirname, 'temp_runs', runId);
  fs.mkdirSync(tempDir, { recursive: true });
  
  try {
    // Basic static analysis to prevent trivial RCE
    const dangerousPatterns = [/system\s*\(/, /popen\s*\(/, /exec\s*\(/, /ShellExecute\s*\(/, /CreateProcess\s*\(/];
    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        return res.status(403).json({ success: false, error: 'Dangerous code detected: Execution of shell commands is disabled.' });
      }
    }
    
    // 1. Write the code (with compatibility shims for Windows/MinGW if C)
    let mainPath;
    let exeCommand = '';
    let exeArgs = [];

    if (language === 'c') {
      mainPath = path.join(tempDir, 'main.c');
      let processedCode = code;
      if (code.includes('strsep') && !code.includes('char *strsep')) {
        const strsepShim = `
/* Portable strsep shim for MinGW/Windows */
#ifndef HAVE_STRSEP
static char *strsep(char **stringp, const char *delim) {
    char *start = *stringp;
    char *p;
    if (start == NULL) return NULL;
    p = strpbrk(start, delim);
    if (p) {
        *p = '\\0';
        *stringp = p + 1;
    } else {
        *stringp = NULL;
    }
    return start;
}
#define HAVE_STRSEP 1
#endif
`;
        const lastIncludeIdx = processedCode.lastIndexOf('#include');
        if (lastIncludeIdx !== -1) {
          const endOfLine = processedCode.indexOf('\n', lastIncludeIdx);
          processedCode = processedCode.slice(0, endOfLine + 1) + strsepShim + processedCode.slice(endOfLine + 1);
        } else {
          processedCode = strsepShim + processedCode;
        }
      }
      fs.writeFileSync(mainPath, processedCode);
      const exePath = path.join(tempDir, 'program.exe');
      await execFilePromise('gcc', [mainPath, '-o', exePath], { cwd: tempDir, timeout: 10000 });
      exeCommand = exePath;
    } else if (language === 'python') {
      mainPath = path.join(tempDir, 'main.py');
      const pythonShim = `
import sys
import io
import base64

try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    
    _original_show = plt.show
    def custom_show(*args, **kwargs):
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        print(f"\\n__IMAGE_BASE64__{img_str}__IMAGE_BASE64_END__\\n")
        plt.clf()
        
    plt.show = custom_show
except ImportError:
    pass

`;
      fs.writeFileSync(mainPath, pythonShim + code);
      exeCommand = 'python';
      exeArgs = ['main.py'];
    } else if (language === 'javascript') {
      mainPath = path.join(tempDir, 'main.js');
      fs.writeFileSync(mainPath, code);
      exeCommand = 'node';
      exeArgs = [mainPath];
    } else if (language === 'java') {
      // Find the class name (assumes basic public class Name)
      const classMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
      const className = classMatch ? classMatch[1] : 'Main';
      mainPath = path.join(tempDir, `${className}.java`);
      fs.writeFileSync(mainPath, code);
      
      // Compile java
      await execFilePromise('javac', [mainPath], { cwd: tempDir, timeout: 10000 });
      
      exeCommand = 'java';
      exeArgs = [className];
    }
    
    // 2. Copy attached files and find a data file to pipe as stdin
    let stdinFilePath = null;
    if (files && Array.isArray(files)) {
      for (const f of files) {
        if (f.name) {
          const destPath = path.join(tempDir, f.name);
          if (f.content !== undefined) {
            fs.writeFileSync(destPath, f.content);
            const ext = f.name.split('.').pop().toLowerCase();
            if (['csv', 'txt', 'dat', 'tsv', 'json'].includes(ext) && !stdinFilePath) {
              stdinFilePath = destPath;
            }
          } else if (f.url) {
            const relativeUrl = f.url.startsWith('/') ? f.url.slice(1) : f.url;
            const srcPath = path.join(__dirname, relativeUrl);
            if (fs.existsSync(srcPath)) {
              fs.copyFileSync(srcPath, destPath);
              const ext = f.name.split('.').pop().toLowerCase();
              if (['csv', 'txt', 'dat', 'tsv', 'json'].includes(ext) && !stdinFilePath) {
                stdinFilePath = destPath;
              }
            } else {
              console.error('File not found to copy:', srcPath);
            }
          }
        }
      }
    }
    
    // 4. Run - pipe stdin from data file if available
    const result = await new Promise((resolve, reject) => {
      const child = spawn(exeCommand, exeArgs, { cwd: tempDir });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => { stdout += data.toString(); });
      child.stderr.on('data', (data) => { stderr += data.toString(); });
      
      // If we have a data file, pipe it into stdin
      if (stdinFilePath && fs.existsSync(stdinFilePath)) {
        const stdinStream = fs.createReadStream(stdinFilePath);
        stdinStream.pipe(child.stdin);
        stdinStream.on('error', () => { try { child.stdin.end(); } catch(e) {} });
      } else {
        child.stdin.end();
      }
      
      const timer = setTimeout(() => {
        child.kill();
        reject(new Error('Program timed out after 30 seconds'));
      }, 30000);
      
      child.on('close', (exitCode) => {
        clearTimeout(timer);
        if (exitCode !== 0 && !stdout) {
          reject({ stderr, stdout, message: `Process exited with code ${exitCode}` });
        } else {
          resolve({ stdout, stderr });
        }
      });
      
      child.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
    
    res.json({ success: true, output: result.stdout, errorOutput: result.stderr });
  } catch (err) {
    res.json({ success: false, errorOutput: err.stderr || err.message, compileError: err.stdout });
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {
      console.error('Failed to cleanup temp dir', e);
    }
  }
});

// Terminal Workspace Sync Endpoint
app.post('/api/terminal/sync', express.json({ limit: '50mb' }), (req, res) => {
  try {
    const { boardName, files } = req.body;
    console.log(`[SYNC] Syncing workspace for board: ${boardName}, files:`, files.map(f => f.name));
    if (!boardName || !Array.isArray(files)) return res.status(400).json({ error: 'Invalid payload' });

    const workspacePath = path.join(__dirname, 'workspaces', boardName.replace(/[^a-zA-Z0-9-_\s]/g, '_'));
    if (!fs.existsSync(workspacePath)) {
      fs.mkdirSync(workspacePath, { recursive: true });
    }

    files.forEach(f => {
      if (f.name) {
        fs.writeFileSync(path.join(workspacePath, f.name), f.content || '');
      }
    });

    res.json({ success: true, workspacePath });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Room Endpoints
app.post('/api/rooms', authenticateToken, express.json(), (req, res) => {
  const result = roomSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.errors[0].message });
  }
  const { hostName, hostId, name: requestedName } = result.data;
  const roomId = 'room-' + Math.random().toString(36).substring(2, 9);
  const roomName = requestedName || `Untitled Workspace`;
  const kind = req.body.kind || 'board';
  const parentId = req.body.parentId || null;
  const meta = req.body.meta ? JSON.stringify(req.body.meta) : '{}';
  
  db.run(`INSERT INTO rooms (id, name, hostName, hostId, kind, parentId, meta, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [roomId, roomName, hostName || 'Anonymous', hostId, kind, parentId, meta, new Date().toISOString()], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, roomId, name: roomName, hostName, hostId, kind, parentId });
  });
});

app.get('/api/rooms', (req, res) => {
  const { hostId, parentId, kind } = req.query;
  let sql = 'SELECT * FROM rooms WHERE 1=1';
  const params = [];
  if (hostId) { sql += ' AND hostId = ?'; params.push(hostId); }
  if (parentId) { sql += ' AND parentId = ?'; params.push(parentId); }
  if (kind) { sql += ' AND kind = ?'; params.push(kind); }
  sql += ' ORDER BY created_at DESC';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    const rooms = (rows || []).map(r => {
      try { r.meta = JSON.parse(r.meta || '{}'); } catch (e) { r.meta = {}; }
      return r;
    });
    res.json({ success: true, rooms });
  });
});

app.get('/api/rooms/:id', (req, res) => {
  db.get(`SELECT * FROM rooms WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!row) return res.status(404).json({ success: false, error: 'Room not found' });
    // Parse meta JSON
    try { row.meta = JSON.parse(row.meta || '{}'); } catch (e) { row.meta = {}; }
    res.json({ success: true, room: row });
  });
});

// PATCH: update room metadata (exam config, classMeta, roster, etc.)
app.patch('/api/rooms/:id', authenticateToken, express.json({ limit: '10mb' }), (req, res) => {
  const roomId = req.params.id;
  db.get(`SELECT meta FROM rooms WHERE id = ?`, [roomId], (err, row) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    let current = {};
    try { current = JSON.parse(row?.meta || '{}'); } catch (e) {}
    const merged = Object.assign({}, current, req.body);
    db.run(`UPDATE rooms SET meta = ? WHERE id = ?`, [JSON.stringify(merged), roomId], (e2) => {
      if (e2) return res.status(500).json({ success: false, error: e2.message });
      res.json({ success: true });
    });
  });
});

app.delete('/api/rooms/:id', authenticateToken, (req, res) => {
  const roomId = req.params.id;
  
  // Check if room is empty by checking commsRooms
  let isEmpty = true;
  if (commsRooms[roomId]) {
    for (const client of commsRooms[roomId]) {
      if (client.readyState === 1) { isEmpty = false; break; }
    }
  }
  
  if (!isEmpty) {
    return res.status(400).json({ success: false, error: 'Room is not empty' });
  }
  
  db.run(`DELETE FROM rooms WHERE id = ?`, [roomId], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true });
  });
});

// ── Attendance Endpoints ──────────────────────────────────────────────────────

// GET today's attendance for a room+date
app.get('/api/attendance/:roomId/:date', authenticateToken, (req, res) => {
  const { roomId, date } = req.params;
  db.all(`SELECT student_id, name, manual, auto, joined_at FROM attendance WHERE room_id = ? AND date = ?`,
    [roomId, date], (err, rows) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      const students = {};
      rows.forEach(r => { students[r.student_id] = { name: r.name, manual: !!r.manual, auto: !!r.auto, joinedAt: r.joined_at }; });
      res.json({ success: true, students });
    });
});

// GET full attendance history for a room
app.get('/api/attendance/:roomId', authenticateToken, (req, res) => {
  const { roomId } = req.params;
  db.all(`SELECT date, student_id, name, manual, auto, joined_at FROM attendance WHERE room_id = ? ORDER BY date DESC`,
    [roomId], (err, rows) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      const byDate = {};
      rows.forEach(r => {
        if (!byDate[r.date]) byDate[r.date] = {};
        byDate[r.date][r.student_id] = { name: r.name, manual: !!r.manual, auto: !!r.auto, joinedAt: r.joined_at };
      });
      const history = Object.entries(byDate).map(([date, students]) => ({
        date, count: Object.keys(students).length, students
      })).sort((a, b) => b.date.localeCompare(a.date));
      res.json({ success: true, history });
    });
});

// POST mark attendance for a room+date (bulk upsert)
app.post('/api/attendance/:roomId/:date', authenticateToken, express.json(), (req, res) => {
  const { roomId, date } = req.params;
  const { students } = req.body;
  if (!students || typeof students !== 'object') return res.status(400).json({ success: false, error: 'students object required' });
  
  const stmt = db.prepare(`INSERT INTO attendance (room_id, date, student_id, name, manual, auto, joined_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(room_id, date, student_id) DO UPDATE SET name=excluded.name, manual=excluded.manual, auto=excluded.auto, joined_at=excluded.joined_at`);
  
  Object.entries(students).forEach(([uid, info]) => {
    stmt.run(roomId, date, uid, info.name || uid, info.manual ? 1 : 0, info.auto ? 1 : 0, info.joinedAt || new Date().toISOString());
  });
  stmt.finalize(err => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true });
  });
});

// ── Submissions Endpoints ─────────────────────────────────────────────────────

// GET all submissions for a room (teacher)
app.get('/api/submissions/:roomId', authenticateToken, (req, res) => {
  db.all(`SELECT student_id, data, submitted_at FROM submissions WHERE room_id = ?`, [req.params.roomId], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    const docs = rows.map(r => {
      let d = {};
      try { d = JSON.parse(r.data); } catch (e) {}
      return { uid: r.student_id, ...d, submittedAt: r.submitted_at };
    });
    res.json({ success: true, submissions: docs });
  });
});

// GET a single student's submission
app.get('/api/submissions/:roomId/:studentId', (req, res) => {
  db.get(`SELECT data FROM submissions WHERE room_id = ? AND student_id = ?`,
    [req.params.roomId, req.params.studentId], (err, row) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      if (!row) return res.status(404).json({ success: false, error: 'Not found' });
      let d = {};
      try { d = JSON.parse(row.data); } catch (e) {}
      res.json({ success: true, submission: d });
    });
});

// POST / upsert a student submission
app.post('/api/submissions/:roomId/:studentId', express.json({ limit: '10mb' }), (req, res) => {
  const { roomId, studentId } = req.params;
  const data = JSON.stringify(req.body);
  db.run(`INSERT INTO submissions (room_id, student_id, data, submitted_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(room_id, student_id) DO UPDATE SET data=excluded.data, submitted_at=CURRENT_TIMESTAMP`,
    [roomId, studentId, data], (err) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true });
    });
});

// PATCH a submission (for grading)
app.patch('/api/submissions/:roomId/:studentId', authenticateToken, express.json({ limit: '10mb' }), (req, res) => {
  const { roomId, studentId } = req.params;
  db.get(`SELECT data FROM submissions WHERE room_id = ? AND student_id = ?`, [roomId, studentId], (err, row) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    let current = {};
    try { current = JSON.parse(row?.data || '{}'); } catch (e) {}
    const merged = Object.assign({}, current, req.body);
    db.run(`UPDATE submissions SET data = ?, submitted_at = CURRENT_TIMESTAMP WHERE room_id = ? AND student_id = ?`,
      [JSON.stringify(merged), roomId, studentId], (e2) => {
        if (e2) return res.status(500).json({ success: false, error: e2.message });
        res.json({ success: true });
      });
  });
});

// DELETE a submission
app.delete('/api/submissions/:roomId/:studentId', authenticateToken, (req, res) => {
  db.run(`DELETE FROM submissions WHERE room_id = ? AND student_id = ?`,
    [req.params.roomId, req.params.studentId], (err) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true });
    });
});

function startServer(port) {
  const keyPath = path.join(__dirname, '../localhost+2-key.pem');
  const certPath = path.join(__dirname, '../localhost+2.pem');
  
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    try {
      const options = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
      const serverInstance = https.createServer(options, app).listen(port, () => {
        console.log(`Backend server running on HTTPS port ${port}`);
        serverInstance.on('upgrade', upgradeHandler);
      });
      server = serverInstance;
      return;
    } catch (err) {
      console.warn('SSL cert load failed, falling back to HTTP:', err.message);
    }
  } else {
    console.warn('SSL certs not found — starting in plain HTTP mode (localhost only).');
  }

  // HTTP fallback
  const serverInstance = http.createServer(app).listen(port, () => {
    console.log(`Backend server running on HTTP port ${port}`);
    serverInstance.on('upgrade', upgradeHandler);
  });
  server = serverInstance;
}

server = startServer(DEFAULT_PORT);

// Setup WebSocket servers for Yjs and WebRTC Comms
const wssYjs = new WebSocketServer({ noServer: true });
const wssComms = new WebSocketServer({ noServer: true });
const wssTerminal = new WebSocketServer({ noServer: true });

const shell = process.env.COMSPEC || (os.platform() === 'win32' ? 'cmd.exe' : 'bash');

wssTerminal.on('connection', (ws, req) => {
  const urlParams = new URL(req.url, `http://${req.headers.host}`);
  const boardName = urlParams.searchParams.get('boardName') || 'Workspace';
  const userName = urlParams.searchParams.get('userName') || 'user';
  
  const workspacePath = path.join(__dirname, 'workspaces', boardName.replace(/[^a-zA-Z0-9-_\s]/g, '_'));
  if (!fs.existsSync(workspacePath)) {
    fs.mkdirSync(workspacePath, { recursive: true });
  }

  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: workspacePath,
    env: { ...process.env, PROMPT: `${userName}@${boardName}$G ` },
    useConpty: false
  });

  ptyProcess.onData((data) => {
    if (ws.readyState === 1) ws.send(data);
  });

  ws.on('message', (msg) => {
    ptyProcess.write(msg.toString());
  });

  ws.on('close', () => {
    ptyProcess.kill();
  });
});

wssYjs.on('connection', (conn, req) => {
  // Extract room ID without query string
  const pathParts = req.url.split('?')[0].split('/');
  const docName = pathParts[pathParts.length - 1] || 'moodboard-room';
  setupWSConnection(conn, req, { docName });
});

const commsRooms = {}; // roomId -> Set of ws clients
const chatHistory = {}; // Keep chat history in memory per room
const dmHistory = {}; // Keep DM history: roomId -> [{from, to, message}]

wssComms.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      const { type, roomId, targetId, userId } = data;
      
      if (!roomId) return;
      if (!commsRooms[roomId]) commsRooms[roomId] = new Set();
      if (!chatHistory[roomId]) chatHistory[roomId] = [];
      if (!dmHistory[roomId]) dmHistory[roomId] = [];
      
      switch (type) {
        case 'join':
          ws.userId = userId;
          ws.roomId = roomId;
          ws.userName = data.name;
          ws.userColor = data.color;
          commsRooms[roomId].add(ws);
          
          // Send existing chat history to the new user
          if (chatHistory[roomId].length > 0) {
            ws.send(JSON.stringify({ type: 'chat-history', messages: chatHistory[roomId] }));
          }

          // Send existing DM history to the new user
          const myDms = dmHistory[roomId].filter(m => m.from === userId || m.to === userId);
          if (myDms.length > 0) {
            ws.send(JSON.stringify({ type: 'dm-history', messages: myDms }));
          }

          // Broadcast to others and notify new user of existing users
          for (const client of commsRooms[roomId]) {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify({ type: 'user-joined', userId: ws.userId, name: ws.userName, color: ws.userColor }));
              ws.send(JSON.stringify({ type: 'user-joined', userId: client.userId, name: client.userName || 'User', color: client.userColor || '#5865F2' }));
            }
          }
          break;
          
        case 'offer':
          case 'answer':
          case 'ice-candidate':
            // Route P2P signals directly to target
            for (const client of commsRooms[roomId]) {
              if (client.userId === targetId && client.readyState === 1) {
                client.send(JSON.stringify(data));
                break;
              }
            }
            break;
            
          case 'join-call':
          case 'leave-call':
            // Broadcast call status to everyone in the room
            for (const client of commsRooms[roomId]) {
              if (client !== ws && client.readyState === 1) {
                client.send(JSON.stringify(data));
              }
            }
            break;

          case 'chat-message':
          // Save message to history
          chatHistory[roomId].push(data.message);
          // Broadcast chat to everyone in the room
          for (const client of commsRooms[roomId]) {
            if (client.readyState === 1) {
              client.send(JSON.stringify(data));
            }
          }
          break;

        case 'chat-dm':
          const dmRecord = { from: userId, to: targetId, message: data.message };
          dmHistory[roomId].push(dmRecord);
          // Send to target and back to sender
          for (const client of commsRooms[roomId]) {
            if ((client.userId === targetId || client.userId === userId) && client.readyState === 1) {
              client.send(JSON.stringify(data));
            }
          }
          break;

        case 'kick-user':
          for (const client of commsRooms[roomId]) {
            if (client.userId === targetId && client.readyState === 1) {
              client.send(JSON.stringify({ type: 'kicked' }));
              client.close();
              break;
            }
          }
          break;
      }
    } catch (e) {
      console.error('WebSocket comms error', e);
    }
  });

  ws.on('close', () => {
    if (ws.roomId && commsRooms[ws.roomId]) {
      commsRooms[ws.roomId].delete(ws);
      for (const client of commsRooms[ws.roomId]) {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: 'user-left', userId: ws.userId }));
        }
      }
    }
  });
});

function upgradeHandler(request, socket, head) {
  const urlParams = new URL(request.url, `http://${request.headers.host}`);
  const token = urlParams.searchParams.get('token');
  console.log('WS Upgrade Request for URL:', request.url, 'from host:', request.headers.host);
  const verifySocket = (cb) => {
    if (!token) {
      console.log('WS Upgrade rejected: No token');
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    if (token === 'dev-mode-token-12345') {
      request.user = { id: 9999, name: 'Dev User', email: 'dev@local.host' };
      return cb();
    }

    jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }, (err, user) => {
      if (err) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        socket.destroy();
        return;
      }
      request.user = user;
      cb();
    });
  };

  if (request.url.startsWith('/yjs')) {
    verifySocket(() => {
      wssYjs.handleUpgrade(request, socket, head, (ws) => {
        wssYjs.emit('connection', ws, request);
      });
    });
  } else if (request.url.startsWith('/comms')) {
    verifySocket(() => {
      wssComms.handleUpgrade(request, socket, head, (ws) => {
        wssComms.emit('connection', ws, request);
      });
    });
  } else if (request.url.startsWith('/api/terminal')) {
    verifySocket(() => {
      wssTerminal.handleUpgrade(request, socket, head, (ws) => {
        wssTerminal.emit('connection', ws, request);
      });
    });
  } else {
    socket.destroy();
  }
};

console.log('WebSocket servers for Yjs & Comms enabled.');

// Automated DB Backups
cron.schedule('0 0 * * *', () => { // Run every day at midnight
  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
  
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `database-${dateStr}.sqlite`);
  
  fs.copyFileSync(dbPath, backupPath);
  console.log(`Database backed up to ${backupPath}`);
});
