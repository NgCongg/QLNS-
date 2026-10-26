const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const router = require('./routes/router');
const { renderPage } = require('./views/viewEngine');
const store = require('./models/store');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

function sendStatic(req, res) {
  const filePath = path.join(PUBLIC_DIR, req.url.replace('/public/', ''));
  if (!filePath.startsWith(PUBLIC_DIR) || !fs.existsSync(filePath)) return false;
  const types = { '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml' };
  res.writeHead(200, { 'Content-Type': `${types[path.extname(filePath)] || 'application/octet-stream'}; charset=utf-8` });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

function parseBody(req) {
  return new Promise(resolve => {
    let raw = '';
    req.on('data', chunk => raw += chunk);
    req.on('end', () => resolve(querystring.parse(raw)));
  });
}

function render(res, data) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(renderPage(data));
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/public/') && sendStatic(req, res)) return;
  router(req, res, render, parseBody).catch(error => {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Da co loi xay ra.');
  });
});

async function start() {
  try {
    await store.connect();
    server.listen(PORT, () => console.log(`QLNS dang chay tai http://localhost:${PORT}`));
  } catch (error) {
    console.error('Khong the ket noi MongoDB:', error.message);
    console.error('Hay khoi dong dich vu MongoDB roi chay lai npm start.');
    process.exit(1);
  }
}

async function shutdown() {
  server.close(async () => {
    await store.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
