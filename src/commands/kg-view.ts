/**
 * `synergyspec-hw kg view` — serve the local KG data.json via a tiny HTTP
 * server and open the viewer in the default browser.
 */

import { createServer, AddressInfo } from 'net';
import http from 'http';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { KG_VIEWER_HTML } from '../core/kg/viewer-html.js';
import { kgRefreshCommand } from './kg-refresh.js';

export interface KGViewOptions {
  port?: string;
  noOpen?: boolean;
  noRefresh?: boolean;
}

async function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, () => {
      const port = (srv.address() as AddressInfo).port;
      srv.close(() => resolve(port));
    });
  });
}

function openInBrowser(url: string): void {
  const cmd =
    process.platform === 'darwin' ? `open "${url}"` :
    process.platform === 'win32'  ? `start "" "${url}"` :
                                    `xdg-open "${url}"`;
  exec(cmd, (err) => {
    if (err) {
      console.warn(`Could not auto-open browser. Visit: ${url}`);
    }
  });
}

export async function kgViewCommand(options: KGViewOptions = {}): Promise<void> {
  const projectRoot = process.cwd();
  const dataPath = path.join(projectRoot, 'synergyspec', 'kg', 'data.json');

  if (!existsSync(dataPath)) {
    throw new Error(
      `No KG found at ${path.relative(projectRoot, dataPath) || dataPath}. ` +
      `Run \`synergyspec-hw new change <name>\` first to initialize the graph.`
    );
  }

  const port = options.port ? parseInt(options.port, 10) : await findFreePort();
  if (Number.isNaN(port) || port < 0 || port > 65535) {
    throw new Error(`Invalid port: ${options.port}`);
  }

  const server = http.createServer((req, res) => {
    const url = req.url || '/';
    if (url === '/' || url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(KG_VIEWER_HTML);
      return;
    }
    if (url === '/data.json') {
      try {
        const data = readFileSync(dataPath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(data);
      } catch (e: any) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Failed to read data.json: ${e.message}`);
      }
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve());
  });

  const url = `http://127.0.0.1:${port}/`;
  console.log(`KG viewer running at ${url}`);
  console.log(`Serving ${path.relative(projectRoot, dataPath)}`);
  console.log(`Press Ctrl+C to stop.`);

  if (!options.noOpen) {
    openInBrowser(url);
  }

  // Keep the process alive until Ctrl+C.
  const shutdown = () => {
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
