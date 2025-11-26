import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeTrend } from "./services/trend-analyzer";

export async function registerRoutes(app: Express): Promise<Server> {
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
        reddit: !!(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET),
      },
    };
    res.json(health);
  });

  const httpServer = createServer(app);
  return httpServer;
}
