import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeTrend, getTrendingTopics, getTopTrendsWithVolume, getGlobalTrendingNow } from "./services/trend-analyzer";

export async function registerRoutes(app: Express): Promise<Server> {
  // POST /api/analyze - Main trend analysis endpoint
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

  // GET /api/trending - Get trending topics
  app.get('/api/trending', async (req, res) => {
    try {
      const trending = await getTrendingTopics();
      res.json({ trending });
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      res.status(500).json({ 
        error: 'Failed to fetch trending topics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/top-trends-weekly - Get top trending topics with volumes
  app.get('/api/top-trends-weekly', async (req, res) => {
    try {
      const topTrends = await getTopTrendsWithVolume();
      res.json({ 
        trends: topTrends,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching top trends with volume:', error);
      res.status(500).json({ 
        error: 'Failed to fetch top trends',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/global-trending - Get global trending searches
  app.get('/api/global-trending', async (req, res) => {
    try {
      const globalTrends = await getGlobalTrendingNow();
      res.json({ 
        trends: globalTrends,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching global trending:', error);
      res.status(500).json({ 
        error: 'Failed to fetch global trending',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/health - Health check endpoint
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
