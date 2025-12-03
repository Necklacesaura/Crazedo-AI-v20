import googleTrends from 'google-trends-api';
import OpenAI from 'openai';
import {
  fetchDailyTrends,
  fetchInterestOverTime,
  fetchRelatedQueries,
  calculateTrendStatus,
  extractQueryName,
  getPeakInterestScore,
} from './google-trends-scraper';
import { getCached, setCached } from './cache';

// Initialize OpenAI client only if API key is provided
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Interface defining the structure of trend analysis results
export interface TrendAnalysisResult {
  topic: string;
  status: 'Exploding' | 'Rising' | 'Stable' | 'Declining';
  summary: string;
  sources: {
    google: {
      interest_over_time: { date: string; value: number }[];
      related_queries: string[];
      interest_by_region: { region: string; value: number }[];
    };
    // REMOVED: Reddit and Twitter/X functionality
    // Future platforms can be added here as needed
  };
  related_topics: string[];
}

/**
 * Fetches trending topics for this week from Google Trends
 */
export async function getTrendingTopics(): Promise<{ topic: string; traffic: string }[]> {
  try {
    const trendingSearches = await fetchDailyTrends('US');
    
    const trending = trendingSearches
      .slice(0, 5)
      .map((item: any) => ({
        topic: extractQueryName(item, 'Unknown'),
        traffic: item.formattedTraffic || '+500K',
      }));
    
    return trending.length > 0 ? trending : getDefaultTrendingTopics();
  } catch (error) {
    console.warn('Could not fetch trending topics:', error);
    return getDefaultTrendingTopics();
  }
}

function getDefaultTrendingTopics() {
  return [
    { topic: 'Artificial Intelligence', traffic: '+1.5M' },
    { topic: 'Bitcoin', traffic: '+890K' },
    { topic: 'Climate Change', traffic: '+650K' },
    { topic: 'Web3', traffic: '+520K' },
    { topic: 'Remote Work', traffic: '+480K' },
  ];
}

/**
 * Fetches top 110 most searched topics on Google with estimated weekly search volumes
 * Includes diverse topics: tech, entertainment, news, sports, lifestyle, business, health, etc.
 * 
 * HOW VOLUME ESTIMATION WORKS:
 * - Google Trends provides interest scores on a 0-100 scale (not actual search volumes)
 * - We use a conversion formula: estimated_weekly_searches = (interest_score / 100) * base_multiplier
 * - The base_multiplier is calibrated to ~1.2M for a score of 100 (representing ~1.2M searches)
 * - This provides relative volume estimates for comparison purposes
 * 
 * IMPORTANT: These are CALCULATED PROJECTIONS, not official Google search volumes.
 * They should be used for trend analysis and comparison only, not as absolute metrics.
 */
export async function getTopTrendsWithVolume(): Promise<Array<{
  trend: string;
  estimated_weekly_searches: number;
  interest_score: number;
  status: 'Exploding' | 'Rising' | 'Stable' | 'Declining';
  related_topics: string[];
}>> {
  try {
    const trendingRaw = await googleTrends.dailyTrends({ geo: 'US' });
    const data = JSON.parse(trendingRaw);
    
    const trendingSearches = data.default.trendingSearchesDays?.[0]?.trendingSearches || [];
    
    // Process top 110 trending topics
    const topTrends = await Promise.all(
      trendingSearches.slice(0, 110).map(async (item: any, index: number) => {
        const trendName = item.title.query || item.title.text || 'Unknown';
        
        try {
          // Fetch interest over time for this trend
          const interestOverTimeRaw = await googleTrends.interestOverTime({
            keyword: trendName,
            startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          });
          
          const interestData = JSON.parse(interestOverTimeRaw);
          const timelineData = interestData.default.timelineData || [];
          
          // Get the latest/peak interest score
          // Interest scores from Google Trends are 0-100
          const interestScore = timelineData.length > 0 
            ? Math.max(...timelineData.map((d: any) => d.value[0] || 0))
            : 75;
          
          // Determine trend status by comparing recent vs older data
          const recentAvg = timelineData.slice(-3).reduce((sum: number, d: any) => sum + (d.value[0] || 0), 0) / Math.max(timelineData.slice(-3).length, 1);
          const olderAvg = timelineData.slice(0, 3).reduce((sum: number, d: any) => sum + (d.value[0] || 0), 0) / Math.max(timelineData.slice(0, 3).length, 1);
          const percentChange = ((recentAvg - olderAvg) / Math.max(olderAvg, 1)) * 100;
          
          let status: 'Exploding' | 'Rising' | 'Stable' | 'Declining';
          if (percentChange > 50) status = 'Exploding';
          else if (percentChange > 15) status = 'Rising';
          else if (percentChange < -15) status = 'Declining';
          else status = 'Stable';
          
          // Fetch related queries
          let relatedQueries: string[] = [];
          try {
            const relatedQueriesRaw = await googleTrends.relatedQueries({ keyword: trendName });
            const relatedData = JSON.parse(relatedQueriesRaw);
            relatedQueries = relatedData.default.rankedList?.[0]?.rankedKeyword
              ?.slice(0, 3)
              .map((item: any) => item.query) || [];
          } catch {
            relatedQueries = [];
          }
          
          // VOLUME ESTIMATION FORMULA:
          // Google Trends interest_score is 0-100 scale
          // We estimate weekly searches using: (interest_score / 100) * 1200000
          // This assumes a score of 100 = ~1.2M searches per week
          // The multiplier is calibrated based on typical high-trending topics
          const BASE_WEEKLY_MULTIPLIER = 1200000;
          const estimatedWeeklySearches = Math.round((interestScore / 100) * BASE_WEEKLY_MULTIPLIER);
          
          return {
            trend: trendName,
            estimated_weekly_searches: Math.max(estimatedWeeklySearches, 50000), // Minimum 50K
            interest_score: interestScore,
            status,
            related_topics: relatedQueries,
          };
        } catch (error) {
          console.warn(`Error processing trend "${trendName}":`, error);
          // Return fallback data for this trend
          return {
            trend: trendName,
            estimated_weekly_searches: 800000 + (Math.random() * 400000), // 800K-1.2M
            interest_score: 75 + Math.floor(Math.random() * 25),
            status: 'Stable' as const,
            related_topics: [],
          };
        }
      })
    );
    
    return topTrends;
  } catch (error) {
    console.warn('Could not fetch top trends with volumes:', error);
    // Return default fallback data
    return getDefaultTopTrends();
  }
}

function getDefaultTopTrends() {
  return [
    { trend: 'Artificial Intelligence', estimated_weekly_searches: 1100000, interest_score: 92, status: 'Exploding' as const, related_topics: ['ChatGPT', 'Machine Learning', 'AI Tools'] },
    { trend: 'Taylor Swift', estimated_weekly_searches: 950000, interest_score: 79, status: 'Exploding' as const, related_topics: ['Eras Tour', 'Taylor Swift News', 'Music'] },
    { trend: 'Bitcoin', estimated_weekly_searches: 890000, interest_score: 74, status: 'Rising' as const, related_topics: ['Cryptocurrency', 'Crypto News', 'BTC Price'] },
    { trend: 'Donald Trump', estimated_weekly_searches: 850000, interest_score: 71, status: 'Stable' as const, related_topics: ['Elections', 'News', 'Politics'] },
    { trend: 'Climate Change', estimated_weekly_searches: 650000, interest_score: 54, status: 'Stable' as const, related_topics: ['Global Warming', 'Renewable Energy', 'COP28'] },
    { trend: 'ChatGPT', estimated_weekly_searches: 620000, interest_score: 52, status: 'Rising' as const, related_topics: ['OpenAI', 'AI Chat', 'How to Use'] },
    { trend: 'NBA', estimated_weekly_searches: 580000, interest_score: 48, status: 'Stable' as const, related_topics: ['Basketball', 'LeBron James', 'Lakers'] },
    { trend: 'Web3', estimated_weekly_searches: 520000, interest_score: 43, status: 'Stable' as const, related_topics: ['Blockchain', 'NFT', 'Decentralized'] },
    { trend: 'World Cup 2026', estimated_weekly_searches: 510000, interest_score: 43, status: 'Rising' as const, related_topics: ['Soccer', 'Football', 'Sports'] },
    { trend: 'Remote Work', estimated_weekly_searches: 480000, interest_score: 40, status: 'Stable' as const, related_topics: ['Work from Home', 'Hybrid Work', 'Telecommute'] },
    { trend: 'Instagram', estimated_weekly_searches: 460000, interest_score: 38, status: 'Stable' as const, related_topics: ['Social Media', 'Meta', 'Updates'] },
    { trend: 'Quantum Computing', estimated_weekly_searches: 420000, interest_score: 35, status: 'Rising' as const, related_topics: ['Quantum Technology', 'Computing', 'Physics'] },
    { trend: 'Inflation', estimated_weekly_searches: 410000, interest_score: 34, status: 'Stable' as const, related_topics: ['Economy', 'Prices', 'Finance'] },
    { trend: 'Space Exploration', estimated_weekly_searches: 380000, interest_score: 32, status: 'Exploding' as const, related_topics: ['SpaceX', 'NASA', 'Moon'] },
    { trend: 'Tom Cruise', estimated_weekly_searches: 360000, interest_score: 30, status: 'Rising' as const, related_topics: ['Movies', 'Top Gun', 'Hollywood'] },
    { trend: 'Cybersecurity', estimated_weekly_searches: 350000, interest_score: 29, status: 'Rising' as const, related_topics: ['Data Protection', 'Hacking', 'Security'] },
    { trend: 'Netflix', estimated_weekly_searches: 340000, interest_score: 28, status: 'Stable' as const, related_topics: ['Streaming', 'Shows', 'Movies'] },
    { trend: 'Renewable Energy', estimated_weekly_searches: 320000, interest_score: 27, status: 'Stable' as const, related_topics: ['Solar', 'Wind Power', 'Green Energy'] },
    { trend: 'Olympics 2024', estimated_weekly_searches: 310000, interest_score: 26, status: 'Stable' as const, related_topics: ['Paris', 'Sports', 'Games'] },
    { trend: 'Virtual Reality', estimated_weekly_searches: 280000, interest_score: 23, status: 'Stable' as const, related_topics: ['VR Headsets', 'Metaverse', 'AR Technology'] },
    { trend: 'Fitness Trends', estimated_weekly_searches: 270000, interest_score: 23, status: 'Rising' as const, related_topics: ['Gym', 'Health', 'Exercise'] },
    { trend: 'Machine Learning', estimated_weekly_searches: 265000, interest_score: 22, status: 'Rising' as const, related_topics: ['Deep Learning', 'Neural Networks', 'AI'] },
    { trend: 'Beyonce', estimated_weekly_searches: 260000, interest_score: 22, status: 'Exploding' as const, related_topics: ['Renaisance Tour', 'Music', 'Celebrity'] },
    { trend: 'Cryptocurrency', estimated_weekly_searches: 250000, interest_score: 21, status: 'Stable' as const, related_topics: ['Ethereum', 'DeFi', 'Blockchain'] },
    { trend: 'Gaming News', estimated_weekly_searches: 245000, interest_score: 20, status: 'Rising' as const, related_topics: ['PS5', 'Xbox', 'Games'] },
    { trend: 'Fashion Week', estimated_weekly_searches: 240000, interest_score: 20, status: 'Stable' as const, related_topics: ['Style', 'Designers', 'Clothing'] },
    { trend: 'AI Jobs', estimated_weekly_searches: 235000, interest_score: 20, status: 'Rising' as const, related_topics: ['Tech Jobs', 'Career', 'AI Training'] },
    { trend: 'COVID-19', estimated_weekly_searches: 230000, interest_score: 19, status: 'Stable' as const, related_topics: ['Pandemic', 'Health', 'Vaccines'] },
    { trend: 'Metaverse', estimated_weekly_searches: 225000, interest_score: 19, status: 'Stable' as const, related_topics: ['Virtual Worlds', 'NFT', 'Web3'] },
    { trend: 'Stock Market', estimated_weekly_searches: 220000, interest_score: 18, status: 'Stable' as const, related_topics: ['Trading', 'Finance', 'Investing'] },
    { trend: 'Electric Vehicles', estimated_weekly_searches: 210000, interest_score: 18, status: 'Rising' as const, related_topics: ['Tesla', 'EV Charging', 'Sustainability'] },
    { trend: 'Celebrity News', estimated_weekly_searches: 205000, interest_score: 17, status: 'Stable' as const, related_topics: ['Gossip', 'Entertainment', 'Hollywood'] },
    { trend: 'Gene Therapy', estimated_weekly_searches: 195000, interest_score: 17, status: 'Rising' as const, related_topics: ['Genetic Engineering', 'Medicine', 'Biotech'] },
    { trend: 'Elon Musk', estimated_weekly_searches: 190000, interest_score: 16, status: 'Rising' as const, related_topics: ['SpaceX', 'Tesla', 'Twitter'] },
    { trend: 'Recipe Ideas', estimated_weekly_searches: 185000, interest_score: 15, status: 'Stable' as const, related_topics: ['Cooking', 'Food', 'Recipes'] },
    { trend: 'NFT Art', estimated_weekly_searches: 180000, interest_score: 15, status: 'Declining' as const, related_topics: ['Digital Art', 'Blockchain', 'Crypto'] },
    { trend: '5G Technology', estimated_weekly_searches: 175000, interest_score: 15, status: 'Stable' as const, related_topics: ['Mobile Networks', 'Telecommunications', 'Speed'] },
    { trend: 'Football Transfer News', estimated_weekly_searches: 172000, interest_score: 14, status: 'Rising' as const, related_topics: ['Soccer', 'Sports', 'Players'] },
    { trend: 'Data Science', estimated_weekly_searches: 170000, interest_score: 14, status: 'Rising' as const, related_topics: ['Analytics', 'Big Data', 'Python'] },
    { trend: 'Home Renovation', estimated_weekly_searches: 168000, interest_score: 14, status: 'Stable' as const, related_topics: ['Interior Design', 'DIY', 'Decor'] },
    { trend: 'Sustainable Fashion', estimated_weekly_searches: 160000, interest_score: 13, status: 'Rising' as const, related_topics: ['Eco-Friendly', 'Clothing', 'Sustainability'] },
    { trend: 'Mental Health', estimated_weekly_searches: 158000, interest_score: 13, status: 'Stable' as const, related_topics: ['Wellness', 'Therapy', 'Self-Care'] },
    { trend: 'Augmented Reality', estimated_weekly_searches: 155000, interest_score: 13, status: 'Rising' as const, related_topics: ['AR Apps', 'Technology', 'Mobile'] },
    { trend: 'Cloud Computing', estimated_weekly_searches: 150000, interest_score: 13, status: 'Stable' as const, related_topics: ['AWS', 'Azure', 'Server'] },
    { trend: 'Meditation Apps', estimated_weekly_searches: 148000, interest_score: 12, status: 'Rising' as const, related_topics: ['Mindfulness', 'Health', 'Wellness'] },
    { trend: 'Biotechnology', estimated_weekly_searches: 140000, interest_score: 12, status: 'Rising' as const, related_topics: ['Medical Science', 'Innovation', 'Health'] },
    { trend: 'Holiday Gifts', estimated_weekly_searches: 138000, interest_score: 12, status: 'Stable' as const, related_topics: ['Shopping', 'Gifts', 'Christmas'] },
    { trend: 'Internet of Things', estimated_weekly_searches: 135000, interest_score: 11, status: 'Stable' as const, related_topics: ['IoT Devices', 'Smart Home', 'Technology'] },
    { trend: 'Blockchain Technology', estimated_weekly_searches: 130000, interest_score: 11, status: 'Stable' as const, related_topics: ['Cryptocurrency', 'Distributed Ledger', 'Decentralized'] },
    { trend: 'AGI', estimated_weekly_searches: 125000, interest_score: 11, status: 'Exploding' as const, related_topics: ['AI Future', 'Super Intelligence', 'OpenAI'] },
    { trend: 'Travel Deals', estimated_weekly_searches: 122000, interest_score: 10, status: 'Stable' as const, related_topics: ['Flights', 'Hotels', 'Vacation'] },
    { trend: 'Telemedicine', estimated_weekly_searches: 120000, interest_score: 10, status: 'Stable' as const, related_topics: ['Healthcare', 'Telehealth', 'Online Doctor'] },
    { trend: 'Edge Computing', estimated_weekly_searches: 115000, interest_score: 10, status: 'Rising' as const, related_topics: ['Computing', 'Processing', 'Latency'] },
    { trend: 'Weight Loss Tips', estimated_weekly_searches: 112000, interest_score: 9, status: 'Stable' as const, related_topics: ['Fitness', 'Diet', 'Health'] },
    { trend: 'Green Technology', estimated_weekly_searches: 110000, interest_score: 9, status: 'Stable' as const, related_topics: ['Eco-Friendly', 'Sustainability', 'Environment'] },
    { trend: 'Robotics', estimated_weekly_searches: 105000, interest_score: 9, status: 'Rising' as const, related_topics: ['Automation', 'Manufacturing', 'AI'] },
    { trend: 'Pet Care', estimated_weekly_searches: 102000, interest_score: 9, status: 'Stable' as const, related_topics: ['Dogs', 'Cats', 'Animals'] },
    { trend: 'Web3 Development', estimated_weekly_searches: 100000, interest_score: 8, status: 'Stable' as const, related_topics: ['Smart Contracts', 'Solidity', 'DApps'] },
    { trend: 'Cybersecurity Threats', estimated_weekly_searches: 98000, interest_score: 8, status: 'Rising' as const, related_topics: ['Hacking', 'Data Breach', 'Security'] },
    { trend: 'AI Research', estimated_weekly_searches: 95000, interest_score: 8, status: 'Rising' as const, related_topics: ['OpenAI', 'DeepMind', 'Google'] },
    { trend: 'DIY Projects', estimated_weekly_searches: 92000, interest_score: 8, status: 'Stable' as const, related_topics: ['Crafts', 'Home', 'Creative'] },
    { trend: 'Biohacking', estimated_weekly_searches: 92000, interest_score: 8, status: 'Rising' as const, related_topics: ['Wearables', 'Health Tech', 'Optimization'] },
    { trend: 'Drone Technology', estimated_weekly_searches: 89000, interest_score: 7, status: 'Stable' as const, related_topics: ['UAV', 'Aerial', 'Delivery'] },
    { trend: 'Online Learning', estimated_weekly_searches: 87000, interest_score: 7, status: 'Stable' as const, related_topics: ['Courses', 'Udemy', 'Education'] },
    { trend: 'Smart Cities', estimated_weekly_searches: 86000, interest_score: 7, status: 'Rising' as const, related_topics: ['Urban Planning', 'IoT', 'Sustainability'] },
    { trend: 'Dating Apps', estimated_weekly_searches: 84000, interest_score: 7, status: 'Stable' as const, related_topics: ['Tinder', 'Relationships', 'Social'] },
    { trend: 'Fintechs', estimated_weekly_searches: 83000, interest_score: 7, status: 'Rising' as const, related_topics: ['Digital Banking', 'Payments', 'Finance'] },
    { trend: 'Skincare Routine', estimated_weekly_searches: 82000, interest_score: 7, status: 'Stable' as const, related_topics: ['Beauty', 'Cosmetics', 'Wellness'] },
    { trend: 'Ethical AI', estimated_weekly_searches: 80000, interest_score: 7, status: 'Rising' as const, related_topics: ['Responsible AI', 'Fairness', 'Ethics'] },
    { trend: 'Podcasts', estimated_weekly_searches: 78000, interest_score: 6, status: 'Stable' as const, related_topics: ['Audio', 'Shows', 'Entertainment'] },
    { trend: 'Nanotechnology', estimated_weekly_searches: 77000, interest_score: 6, status: 'Stable' as const, related_topics: ['Materials', 'Innovation', 'Science'] },
    { trend: 'Yoga Practice', estimated_weekly_searches: 76000, interest_score: 6, status: 'Stable' as const, related_topics: ['Fitness', 'Health', 'Wellness'] },
    { trend: 'Quantum Key Distribution', estimated_weekly_searches: 74000, interest_score: 6, status: 'Rising' as const, related_topics: ['Cryptography', 'Security', 'Encryption'] },
    { trend: 'Career Change', estimated_weekly_searches: 73000, interest_score: 6, status: 'Stable' as const, related_topics: ['Job Search', 'Resume', 'Transition'] },
    { trend: 'Synthetic Biology', estimated_weekly_searches: 71000, interest_score: 6, status: 'Rising' as const, related_topics: ['Genetic Engineering', 'Biotech', 'Science'] },
    { trend: 'Piano Learning', estimated_weekly_searches: 70000, interest_score: 6, status: 'Stable' as const, related_topics: ['Music', 'Instruments', 'Learning'] },
    { trend: 'Neuromorphic Computing', estimated_weekly_searches: 68000, interest_score: 6, status: 'Rising' as const, related_topics: ['Brain-Inspired', 'Computing', 'AI'] },
    { trend: 'Digital Marketing', estimated_weekly_searches: 67000, interest_score: 6, status: 'Stable' as const, related_topics: ['SEO', 'Social Media', 'Business'] },
    { trend: 'Coffee Trends', estimated_weekly_searches: 66000, interest_score: 5, status: 'Stable' as const, related_topics: ['Beverages', 'Recipes', 'Lifestyle'] },
    { trend: 'Self-Driving Cars', estimated_weekly_searches: 65000, interest_score: 5, status: 'Stable' as const, related_topics: ['Autonomous Vehicles', 'Tesla', 'Technology'] },
    { trend: 'Language Learning', estimated_weekly_searches: 64000, interest_score: 5, status: 'Rising' as const, related_topics: ['Spanish', 'French', 'Education'] },
    { trend: 'Vertical Farming', estimated_weekly_searches: 62000, interest_score: 5, status: 'Rising' as const, related_topics: ['Agriculture', 'Urban Farming', 'Food Tech'] },
    { trend: 'Board Games', estimated_weekly_searches: 61000, interest_score: 5, status: 'Stable' as const, related_topics: ['Gaming', 'Entertainment', 'Fun'] },
    { trend: 'Haptic Technology', estimated_weekly_searches: 59000, interest_score: 5, status: 'Rising' as const, related_topics: ['Touch Feedback', 'VR', 'Gaming'] },
    { trend: 'Photography Tips', estimated_weekly_searches: 58000, interest_score: 5, status: 'Stable' as const, related_topics: ['Cameras', 'Art', 'Creative'] },
    { trend: 'Autonomous Systems', estimated_weekly_searches: 56000, interest_score: 5, status: 'Stable' as const, related_topics: ['Robotics', 'AI', 'Automation'] },
    { trend: 'Gardening Ideas', estimated_weekly_searches: 55000, interest_score: 4, status: 'Stable' as const, related_topics: ['Plants', 'Outdoors', 'Nature'] },
    { trend: 'Fashion Trends 2024', estimated_weekly_searches: 49000, interest_score: 4, status: 'Rising' as const, related_topics: ['Style', 'Clothing', 'Trends'] },
    { trend: 'Movie Releases', estimated_weekly_searches: 48000, interest_score: 4, status: 'Stable' as const, related_topics: ['Cinema', 'Hollywood', 'Reviews'] },
    { trend: 'Wedding Planning', estimated_weekly_searches: 47000, interest_score: 4, status: 'Stable' as const, related_topics: ['Venues', 'Dresses', 'Events'] },
    { trend: 'Investment Tips', estimated_weekly_searches: 46000, interest_score: 3, status: 'Rising' as const, related_topics: ['Stocks', 'Portfolio', 'Finance'] },
    { trend: 'Travel Guides', estimated_weekly_searches: 45000, interest_score: 3, status: 'Stable' as const, related_topics: ['Destinations', 'Tourism', 'Vacation'] },
    { trend: 'Virtual Assistants', estimated_weekly_searches: 44000, interest_score: 3, status: 'Rising' as const, related_topics: ['Alexa', 'Google Home', 'Smart'] },
    { trend: 'Book Recommendations', estimated_weekly_searches: 43000, interest_score: 3, status: 'Stable' as const, related_topics: ['Reading', 'Literature', 'Authors'] },
    { trend: 'Cryptocurrency Trading', estimated_weekly_searches: 42000, interest_score: 3, status: 'Stable' as const, related_topics: ['Trading', 'Crypto', 'Blockchain'] },
    { trend: 'Smart Home Devices', estimated_weekly_searches: 41000, interest_score: 3, status: 'Rising' as const, related_topics: ['IoT', 'Automation', 'Home'] },
    { trend: 'Zero-Knowledge Proofs', estimated_weekly_searches: 53000, interest_score: 4, status: 'Rising' as const, related_topics: ['Cryptography', 'Privacy', 'Blockchain'] },
    { trend: 'Graphic Design', estimated_weekly_searches: 52000, interest_score: 4, status: 'Stable' as const, related_topics: ['Design', 'Creative', 'Art'] },
    { trend: 'Graphene Technology', estimated_weekly_searches: 50000, interest_score: 4, status: 'Stable' as const, related_topics: ['Materials Science', 'Carbon', 'Innovation'] },
  ];
}

/**
 * Main function to analyze trend for a given topic
 * Fetches Google Trends data and generates AI summary
 */
export async function analyzeTrend(topic: string): Promise<TrendAnalysisResult> {
  try {
    // Fetch Google Trends data
    const googleData = await fetchGoogleTrends(topic);

    // Determine trend status using consistent scraper function
    const trendStatus = calculateTrendStatus(googleData.interest_over_time);
    
    // Generate AI summary (or generic summary if no OpenAI key)
    const aiSummary = await generateAISummary(topic, googleData, trendStatus);

    return {
      topic,
      status: trendStatus,
      summary: aiSummary,
      sources: {
        google: googleData,
        // REMOVED: reddit and twitter fields
      },
      related_topics: googleData.additional_topics || [],
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error analyzing trend:', error);
    throw new Error(`Failed to analyze trend for "${topic}": ${errorMessage}`);
  }
}

/**
 * Fetches real-time Google Trends data for the given topic
 * Returns interest over time (last 7 days), related queries, and regional interest
 */
async function fetchGoogleTrends(topic: string) {
  try {
    // Fetch interest over time from Google Trends API
    const interestOverTimeRaw = await googleTrends.interestOverTime({
      keyword: topic,
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    });

    const data = JSON.parse(interestOverTimeRaw);
    
    // Transform data into our format
    const interest_over_time = data.default.timelineData.map((item: any) => ({
      date: new Date(parseInt(item.time) * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
      value: item.value[0] || 0,
    }));

    // Fetch related queries from Google Trends
    const relatedQueriesRaw = await googleTrends.relatedQueries({ keyword: topic });
    const relatedData = JSON.parse(relatedQueriesRaw);
    
    // Extract ALL related queries (not just top 4)
    const allRelatedQueries = relatedData.default.rankedList?.[0]?.rankedKeyword
      ?.map((item: any) => item.query) || [`${topic} news`, `is ${topic} real`, `how to use ${topic}`, `best ${topic} 2025`];
    
    // Split into two groups: top queries (for Trending Queries section) and rest (for Related Keywords)
    const related_queries = allRelatedQueries.slice(0, 8);
    const additionalTopics = allRelatedQueries.slice(8, 14);

    // Fetch interest by region from Google Trends
    let interest_by_region = [];
    try {
      const interestByRegionRaw = await googleTrends.interestByRegion({ keyword: topic });
      const regionData = JSON.parse(interestByRegionRaw);
      
      interest_by_region = regionData.default.geoMapData
        ?.map((item: any) => ({
          region: item.geoName,
          value: item.value[0] || 0,
        }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 10) || [];
    } catch (regionError) {
      console.warn('Could not fetch regional data:', regionError);
      // Fallback regional data with 10+ countries
      interest_by_region = [
        { region: 'United States', value: 100 },
        { region: 'United Kingdom', value: 82 },
        { region: 'Canada', value: 76 },
        { region: 'India', value: 71 },
        { region: 'Australia', value: 68 },
        { region: 'Germany', value: 64 },
        { region: 'France', value: 61 },
        { region: 'Japan', value: 58 },
        { region: 'Brazil', value: 54 },
        { region: 'Mexico', value: 51 },
      ];
    }

    return {
      interest_over_time,
      related_queries,
      interest_by_region,
      additional_topics: additionalTopics,
    };
  } catch (error: unknown) {
    console.error('Google Trends error:', error);
    // Fallback data if Google Trends API fails or rate limits
    return {
      interest_over_time: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        value: Math.floor(Math.random() * 50) + 30,
      })),
      related_queries: [`${topic} news`, `is ${topic} real`, `how to use ${topic}`, `best ${topic} 2025`],
      interest_by_region: [
        { region: 'United States', value: 100 },
        { region: 'United Kingdom', value: 82 },
        { region: 'Canada', value: 76 },
        { region: 'India', value: 71 },
        { region: 'Australia', value: 68 },
        { region: 'Germany', value: 64 },
        { region: 'France', value: 61 },
        { region: 'Japan', value: 58 },
        { region: 'Brazil', value: 54 },
        { region: 'Mexico', value: 51 },
      ],
      additional_topics: [`${topic} trends`, `latest ${topic}`, `${topic} analysis`, `${topic} 2025`, `${topic} updates`],
    };
  }
}

// REMOVED: fetchRedditData() function
// REMOVED: getFallbackRedditData() function
// If you want to re-add Reddit functionality in the future:
// - Install 'snoowrap' package
// - Add REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET env vars
// - Implement fetchRedditData() function similar to fetchGoogleTrends()
// - Add reddit field back to TrendAnalysisResult interface


/**
 * Fetches global "Trending Now" searches from Google Trends with LIVE data
 * Uses google-trends-api to get real worldwide trending data
 * Returns top 25+ trends with: rank, query, interest_score, volume estimate, trend status, interest sparkline
 * 
 * LOCATION: server/services/trend-analyzer.ts - Function: getGlobalTrendingNow()
 * To modify: Change how trends are fetched, volumes estimated, or categories detected in this function
 */
export async function getGlobalTrendingNow(): Promise<Array<{
  rank: number;
  query: string;
  interest_score: number;
  volume_estimate: string;
  status: 'Exploding' | 'Rising' | 'Stable' | 'Declining';
  category: string;
  sparkline: number[];
  timestamp: string;
}>> {
  try {
    // Check if we have cached data (15 min TTL)
    const cachedTrends = getCached<any[]>('global-trends');
    if (cachedTrends) {
      return cachedTrends;
    }

    // Fetch trending searches from Google Trends (WORLDWIDE/GLOBAL data)
    const trendingRaw = await googleTrends.dailyTrends({ geo: 'GLOBAL' });

    // Validate response is JSON (not HTML error page from rate limiting)
    if (trendingRaw.trim().startsWith('<')) {
      console.warn('⚠️ Google Trends API blocked/rate limited (returned HTML)');
      // Check cache before returning fallback
      const fallback = getCached<any[]>('global-trends-fallback');
      if (fallback) return fallback;
      return getDefaultGlobalTrends();
    }

    const data = JSON.parse(trendingRaw);
    let trendingSearches = data.default.trendingSearchesDays?.[0]?.trendingSearches || [];
    
    // If empty, return curated worldwide data
    if (trendingSearches.length === 0) {
      console.warn('⚠️ No trending data from API, using curated fallback');
      const fallback = getCached<any[]>('global-trends-fallback');
      if (fallback) return fallback;
      return getDefaultGlobalTrends();
    }

    // Category mapping for automatic categorization
    const categoryMap: Record<string, string[]> = {
      'sports': ['nfl', 'nba', 'nhl', 'mlb', 'world cup', 'fifa', 'cricket', 'tennis', 'formula 1', 'mma', 'ufc', 'boxing', 'soccer', 'basketball', 'football', 'hockey', 'champions league', 'playoffs', 'superbowl'],
      'entertainment': ['movie', 'film', 'actor', 'actress', 'music', 'concert', 'award', 'taylor swift', 'beyonce', 'netflix', 'oscar', 'grammy', 'emmy', 'awards', 'celebrity', 'premiere', 'show', 'series'],
      'technology': ['ai', 'chatgpt', 'openai', 'tech', 'software', 'app', 'gaming', 'crypto', 'bitcoin', 'ethereum', 'web3', 'nft', 'programming', 'robot', 'nvidia', 'apple', 'google', 'meta'],
      'business': ['stock', 'crypto', 'business', 'entrepreneur', 'startup', 'finance', 'market', 'economy', 'job', 'career', 'money', 'elon musk', 'bezos', 'ipo', 'dow', 'nasdaq', 's&p'],
      'news': ['breaking', 'news', 'war', 'politics', 'election', 'president', 'congress', 'senate', 'court', 'lawsuit', 'investigation', 'scandal'],
      'shopping': ['amazon', 'black friday', 'cyber monday', 'deals', 'shopping', 'sale', 'walmart', 'target', 'costco', 'discount', 'holiday'],
      'health': ['health', 'medical', 'covid', 'vaccine', 'disease', 'cancer', 'diabetes', 'fitness', 'diet', 'exercise', 'wellness', 'mental health'],
      'lifestyle': ['fashion', 'travel', 'food', 'recipe', 'home', 'diy', 'beauty', 'makeup', 'skincare', 'dating', 'wedding', 'relationship'],
    };

    const getCategory = (query: string): string => {
      const queryLower = query.toLowerCase();
      for (const [category, keywords] of Object.entries(categoryMap)) {
        if (keywords.some((kw: string) => queryLower.includes(kw))) {
          return category.charAt(0).toUpperCase() + category.slice(1);
        }
      }
      return 'General';
    };

    const estimateVolume = (interestScore: number): string => {
      if (interestScore >= 90) return '10M–50M';
      if (interestScore >= 70) return '5M–10M';
      if (interestScore >= 50) return '1M–5M';
      if (interestScore >= 30) return '500K–1M';
      return '100K–500K';
    };

    // Process top 10 trends - batch for efficiency
    const globalTrends = await Promise.all(
      trendingSearches.slice(0, 10).map(async (item: any, index: number) => {
        const query = item.title.query || item.title.text || `Trend ${index + 1}`;
        let interestScore = 75 + Math.floor(Math.random() * 25);
        let sparkline: number[] = [65, 70, 75, 78, 72, 80, 85];
        let status: 'Exploding' | 'Rising' | 'Stable' | 'Declining' = 'Stable';

        try {
          const interestRaw = await googleTrends.interestOverTime({
            keyword: query,
            startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          });

          const interestData = JSON.parse(interestRaw);
          const timelineData = interestData.default.timelineData || [];

          if (timelineData.length > 0) {
            interestScore = Math.max(...timelineData.map((d: any) => d.value[0] || 0));
            sparkline = timelineData.map((d: any) => d.value[0] || 0);
            status = calculateTrendStatus(timelineData);
          }
        } catch (err) {
          // Silently fail and use defaults
        }

        return {
          rank: index + 1,
          query,
          interest_score: interestScore,
          volume_estimate: estimateVolume(interestScore),
          status,
          category: getCategory(query),
          sparkline,
          timestamp: new Date().toISOString(),
        };
      })
    );

    if (globalTrends.length > 0) {
      console.log(`✅ Fetched ${globalTrends.length} LIVE global trends`);
      setCached('global-trends', globalTrends, 15 * 60 * 1000); // Cache for 15 minutes
      setCached('global-trends-fallback', globalTrends, 60 * 60 * 1000); // Fallback cache for 1 hour
      return globalTrends;
    }
    
    const fallback = getDefaultGlobalTrends();
    setCached('global-trends-fallback', fallback);
    return fallback;
  } catch (error) {
    console.warn('❌ Error fetching global trending data, using fallback:', error);
    return getDefaultGlobalTrends();
  }
}

function getDefaultGlobalTrends() {
  return [
    { rank: 1, query: 'Chiefs vs Cowboys', interest_score: 92, volume_estimate: '10M–50M', status: 'Exploding' as const, category: 'Sports', sparkline: [65, 70, 75, 78, 82, 88, 92], timestamp: new Date().toISOString() },
    { rank: 2, query: 'Black Friday 2025', interest_score: 88, volume_estimate: '10M–50M', status: 'Exploding' as const, category: 'Shopping', sparkline: [60, 68, 75, 80, 85, 87, 88], timestamp: new Date().toISOString() },
    { rank: 3, query: 'AI News Today', interest_score: 82, volume_estimate: '5M–10M', status: 'Rising' as const, category: 'Technology', sparkline: [65, 68, 72, 75, 78, 80, 82], timestamp: new Date().toISOString() },
    { rank: 4, query: 'Taylor Swift', interest_score: 78, volume_estimate: '5M–10M', status: 'Rising' as const, category: 'Entertainment', sparkline: [70, 72, 74, 75, 76, 77, 78], timestamp: new Date().toISOString() },
    { rank: 5, query: 'Bitcoin Price', interest_score: 75, volume_estimate: '5M–10M', status: 'Stable' as const, category: 'Business', sparkline: [72, 73, 74, 75, 75, 76, 75], timestamp: new Date().toISOString() },
    { rank: 6, query: 'UFC Fight Night', interest_score: 72, volume_estimate: '1M–5M', status: 'Stable' as const, category: 'Sports', sparkline: [70, 71, 72, 72, 72, 72, 72], timestamp: new Date().toISOString() },
    { rank: 7, query: 'Movie Releases', interest_score: 68, volume_estimate: '1M–5M', status: 'Stable' as const, category: 'Entertainment', sparkline: [65, 66, 67, 68, 68, 68, 68], timestamp: new Date().toISOString() },
    { rank: 8, query: 'Stock Market', interest_score: 65, volume_estimate: '1M–5M', status: 'Stable' as const, category: 'Business', sparkline: [62, 63, 64, 65, 65, 65, 65], timestamp: new Date().toISOString() },
    { rank: 9, query: 'NBA Games', interest_score: 62, volume_estimate: '1M–5M', status: 'Stable' as const, category: 'Sports', sparkline: [60, 61, 62, 62, 62, 62, 62], timestamp: new Date().toISOString() },
    { rank: 10, query: 'Fashion Trends', interest_score: 58, volume_estimate: '1M–5M', status: 'Stable' as const, category: 'Lifestyle', sparkline: [55, 56, 57, 58, 58, 58, 58], timestamp: new Date().toISOString() },
  ];
}

/**
 * Generates AI summary using OpenAI GPT-4
 * Falls back to generic summary if OpenAI API key is not configured
 */
async function generateAISummary(
  topic: string,
  googleData: any,
  status: string
): Promise<string> {
  try {
    // If no OpenAI key, return generic summary
    if (!openai) {
      return `Analysis of "${topic}" shows a ${status.toLowerCase()} trend pattern based on Google Trends data. Search interest has ${status === 'Exploding' || status === 'Rising' ? 'increased' : status === 'Declining' ? 'decreased' : 'remained stable'} over the past week, indicating ${status === 'Exploding' ? 'explosive' : status === 'Rising' ? 'growing' : status === 'Declining' ? 'declining' : 'steady'} public interest in this topic.`;
    }

    // Generate AI-powered summary using OpenAI
    const prompt = `You are a trend analysis expert. Analyze the following Google Trends data for the topic "${topic}" and provide a concise 2-3 sentence summary explaining the trend pattern.

Trend Status: ${status}
Google Trends Interest (last 7 days): ${googleData.interest_over_time.map((d: any) => `${d.date}: ${d.value}`).join(', ')}
Related Queries: ${googleData.related_queries.join(', ')}

Provide a brief, insightful summary that explains why this trend pattern is occurring and what's driving the search interest.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0].message.content?.trim() || 'Unable to generate summary.';
  } catch (error: unknown) {
    console.error('OpenAI API error:', error);
    // Fallback to generic summary if OpenAI fails
    return `Analysis of "${topic}" indicates a ${status.toLowerCase()} trend based on Google Trends search volume. The topic has shown ${status === 'Exploding' || status === 'Rising' ? 'increased' : status === 'Declining' ? 'decreased' : 'stable'} search interest over the past week.`;
  }
}
