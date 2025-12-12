import fs from "node:fs";
import { type Server } from "node:http";
import path from "node:path";

import express, { type Express } from "express";

import runApp from "./app";

export async function serveStatic(app: Express, server: Server) {
  const distPath = path.resolve(import.meta.dirname, "public");

  console.log(`[Production] Looking for static files in: ${distPath}`);

  if (!fs.existsSync(distPath)) {
    console.error(`[Production] ERROR: Build directory not found at ${distPath}`);
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  console.log(`[Production] Static files found, serving from: ${distPath}`);

  app.use(express.static(distPath));

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

(async () => {
  try {
    console.log(`[Production] Starting production server...`);
    console.log(`[Production] PORT environment variable: ${process.env.PORT || 'not set (will use 5000)'}`);
    console.log(`[Production] NODE_ENV: ${process.env.NODE_ENV}`);
    await runApp(serveStatic);
  } catch (error) {
    console.error(`[Production] FATAL ERROR during startup:`, error);
    process.exit(1);
  }
})();
