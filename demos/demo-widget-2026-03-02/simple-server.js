const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/public/demo.html' : req.url;

  // Handle built files
  if (filePath.startsWith('/dist/')) {
    filePath = filePath;
  } else if (!filePath.startsWith('/public/')) {
    filePath = '/public' + filePath;
  }

  const fullPath = path.join(__dirname, filePath);

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found: ' + filePath);
      return;
    }

    let contentType = 'text/html';
    if (filePath.endsWith('.js')) contentType = 'text/javascript';
    if (filePath.endsWith('.css')) contentType = 'text/css';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
🚀 Dashboard Demo Server Running!
📍 Open http://localhost:${PORT}/ in your browser

The demo shows:
- Drag and drop widgets
- Resize widgets
- Add new widgets from registry
- Edit mode toggle
  `);
});