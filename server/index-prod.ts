import fs from "node:fs";
import { type Server } from "node:http";
import path from "node:path";

import express, { type Express } from "express";

import runApp from "./app";

console.log("[Production] Starting server...");
console.log("[Production] Environment check:", {
  hasDatabase: !!process.env.DATABASE_URL,
  hasSessionSecret: !!process.env.SESSION_SECRET,
  hasOpenAI: !!process.env.OPENAI_API_KEY,
  port: process.env.PORT || "5000 (default)",
});

export async function serveStatic(app: Express, server: Server) {
  const distPath = path.resolve(import.meta.dirname, "public");

  console.log("[Production] Setting up static file serving...");
  console.log("[Production] Looking for build at:", distPath);

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
  
  console.log("[Production] Static file serving configured.");
}

(async () => {
  try {
    console.log("[Production] Initializing application...");
    await runApp(serveStatic);
    console.log("[Production] Application started successfully.");
  } catch (error) {
    console.error("[Production] Fatal error during startup:", error);
    process.exit(1);
  }
})();
