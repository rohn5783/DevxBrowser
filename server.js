import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

const INTERNAL_PAGES = [
  'newtab',
  'settings',
  'wallet',
  'rewards',
  'history',
  'bookmarks',
  'downloads',
  'tor',
  'shields',
  'playlist'
];

function sendFile(res, filePath) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

function resolvePath(reqUrl) {
  const parsed = new URL(reqUrl, `http://${HOST}:${PORT}`);
  let pathname = decodeURIComponent(parsed.pathname);

  // Health check endpoint for Render
  if (pathname === '/health' || pathname === '/healthz') {
    return { isHealth: true };
  }

  // Root -> main renderer index.html
  if (pathname === '/' || pathname === '/index.html') {
    return { filePath: path.join(__dirname, 'src', 'renderer', 'index.html') };
  }

  // Handle brave internal pages: e.g. /brave/newtab or /brave/wallet
  const braveMatch = pathname.match(/^\/brave\/([a-zA-Z0-9_-]+)(\/.*)?$/);
  if (braveMatch) {
    const pageName = braveMatch[1].toLowerCase();
    const subPath = braveMatch[2] ? braveMatch[2].replace(/^\//, '') : '';

    if (INTERNAL_PAGES.includes(pageName)) {
      if (!subPath || subPath === 'index.html') {
        return { filePath: path.join(__dirname, 'src', 'internal-pages', pageName, `${pageName}.html`) };
      }
      return { filePath: path.join(__dirname, 'src', 'internal-pages', pageName, subPath) };
    }

    // Check if filename was requested directly as /brave/<name>.css or /brave/<name>.js
    const ext = path.extname(pageName);
    const baseName = path.basename(pageName, ext);
    if (INTERNAL_PAGES.includes(baseName)) {
      return { filePath: path.join(__dirname, 'src', 'internal-pages', baseName, `${baseName}${ext}`) };
    }
  }

  // Candidate locations in priority order
  const candidates = [
    path.join(__dirname, pathname),
    path.join(__dirname, 'src', 'renderer', pathname),
    path.join(__dirname, 'src', 'internal-pages', pathname),
    path.join(__dirname, 'src', pathname)
  ];

  for (const candidate of candidates) {
    const normalized = path.normalize(candidate);
    if (normalized.startsWith(__dirname) && fs.existsSync(normalized) && fs.statSync(normalized).isFile()) {
      return { filePath: normalized };
    }
  }

  return { filePath: null };
}

const server = http.createServer((req, res) => {
  try {
    const { isHealth, filePath } = resolvePath(req.url);

    if (isHealth) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'brave-browser' }));
      return;
    }

    if (!filePath) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${req.url}`);
      return;
    }

    sendFile(res, filePath);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Internal Server Error: ${err.message}`);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`====================================================`);
  console.log(`🦁 Brave Browser Web Server listening on ${HOST}:${PORT}`);
  console.log(`🚀 Ready for Render / Web deployment`);
  console.log(`====================================================`);
});
