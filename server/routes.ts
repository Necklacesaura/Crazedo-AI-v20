import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeTrend } from "./services/trend-analyzer";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/analyze', async (req, res) => {
    try {
      const { topic } = req.body;

      if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
        return res.status(400).json({ error: 'Topic is required and must be a non-empty string' });
      }

      const trimmedTopic = topic.trim();
      
      if (trimmedTopic.length > 100) {
        return res.status(400).json({ error: 'Topic must be less than 100 characters' });
      }

      console.log(`Analyzing trend for: ${trimmedTopic}`);
      
      const result = await analyzeTrend(trimmedTopic);
      
      res.json(result);
    } catch (error) {
      console.error('Error in /api/analyze:', error);
      res.status(500).json({ 
        error: 'Failed to analyze trend', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.get('/api/health', (req, res) => {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      integrations: {
        openai: !!process.env.OPENAI_API_KEY,
      },
    };
    res.json(health);
  });

  const httpServer = createServer(app);
  return httpServer;
}
