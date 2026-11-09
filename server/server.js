import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { handleApiRequest } from './api.js';

const PORT = process.env.PORT || 3001;
const distDir = path.resolve(process.cwd(), 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  // 1. API routes
  if (req.url.startsWith('/api')) {
    handleApiRequest(req, res);
    return;
  }

  // 2. Production static file server (serves dist folder if built)
  if (fs.existsSync(distDir)) {
    const urlPath = req.url.split('?')[0];
    let filePath = path.join(distDir, urlPath === '/' ? 'index.html' : urlPath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end('Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
    return;
  }

  // 3. Fallback when dist not built yet
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(`
    <div style="font-family: sans-serif; padding: 40px; text-align: center;">
      <h1 style="color: #dc2626;">Air Real News (ARN) Production Server</h1>
      <p>Frontend assets not found in /dist. Run <code>npm run build</code> first to generate production assets.</p>
      <p>API is active on <a href="/api/health">/api/health</a></p>
    </div>
  `);
});

server.listen(PORT, () => {
  console.log(`[ARN Production Server] running on http://localhost:${PORT}`);
});
