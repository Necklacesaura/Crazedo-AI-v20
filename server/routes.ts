import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeTrend, getTrendingTopics, getTopTrendsWithVolume } from "./services/trend-analyzer";

export async function registerRoutes(app: Express): Promise<Server> {
  // POST /api/analyze - Main trend analysis endpoint
  // Accepts: { "topic": "search term" }
  // Returns: Google Trends data + trend status + AI summary (if configured)
  app.post('/api/analyze', async (req, res) => {
    try {
      const { topic } = req.body;

      // Input validation
      if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
        return res.status(400).json({ error: 'Topic is required and must be a non-empty string' });
      }

      const trimmedTopic = topic.trim();
      
      if (trimmedTopic.length > 100) {
        return res.status(400).json({ error: 'Topic must be less than 100 characters' });
      }

      console.log(`Analyzing trend for: ${trimmedTopic}`);
      
      // Fetch and analyze trend data
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

  // GET /api/trending - Get trending topics for this week
  // Returns: Top 5 trending searches with traffic data
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

  // GET /api/top-trends-weekly - Get top 50 trends with estimated weekly search volumes
  // Returns: Top 50 trending searches with estimated weekly searches, interest scores, status, and related topics
  // NOTE: Search volume estimates are calculated projections, not official Google data
  app.get('/api/top-trends-weekly', async (req, res) => {
    try {
      const topTrends = await getTopTrendsWithVolume();
      res.json({ 
        trends: topTrends,
        timestamp: new Date().toISOString(),
        note: 'Estimated weekly searches are calculated projections based on Google Trends interest scores. These are not official Google search volume numbers.'
      });
    } catch (error) {
      console.error('Error fetching top trends with volume:', error);
      res.status(500).json({ 
        error: 'Failed to fetch top trends',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/health - Health check endpoint
  // Returns: API status and which integrations are configured
  app.get('/api/health', (req, res) => {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      integrations: {
        openai: !!process.env.OPENAI_API_KEY,
        // REMOVED: reddit integration check (no longer supported in v2.0)
      },
    };
    res.json(health);
  });

  const httpServer = createServer(app);
  return httpServer;
}
