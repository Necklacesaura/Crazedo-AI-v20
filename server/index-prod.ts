import fs from "node:fs";
import { type Server } from "node:http";
import path from "node:path";
import { spawn, ChildProcess } from "node:child_process";

import express, { type Express, type Request } from "express";

import runApp from "./app";

let pytrendsProcess: ChildProcess | null = null;

function startPyTrendsAPI() {
  console.log('[PyTrends] Starting Flask API on port 5001...');
  pytrendsProcess = spawn('python', ['python_api/trends_api.py'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env }
  });

  pytrendsProcess.stdout?.on('data', (data) => {
    console.log(`[PyTrends] ${data.toString().trim()}`);
  });

  pytrendsProcess.stderr?.on('data', (data) => {
    console.error(`[PyTrends] ${data.toString().trim()}`);
  });

  pytrendsProcess.on('close', (code) => {
    console.log(`[PyTrends] Flask API exited with code ${code}`);
    if (code !== 0) {
      setTimeout(() => startPyTrendsAPI(), 3000);
    }
  });
}

process.on('exit', () => { if (pytrendsProcess) pytrendsProcess.kill(); });
process.on('SIGINT', () => { if (pytrendsProcess) pytrendsProcess.kill(); process.exit(); });

export async function serveStatic(app: Express, server: Server) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

(async () => {
  startPyTrendsAPI();
  await runApp(serveStatic);
})();
