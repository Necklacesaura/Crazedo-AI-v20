/**
 * Trend Analyzer - Simplified version using ONLY hardcoded data
 * Removes all Google Trends API calls that cause blocking
 * Works 100% reliably with cached/fallback data
 */

import OpenAI from 'openai';

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
  };
  related_topics: string[];
}

/**
 * Returns top trending topics - ONLY hardcoded data
 */
export async function getTrendingTopics(): Promise<{ topic: string; traffic: string }[]> {
  return [
    { topic: 'Artificial Intelligence', traffic: '+1.5M' },
    { topic: 'Bitcoin', traffic: '+890K' },
    { topic: 'Climate Change', traffic: '+650K' },
    { topic: 'Web3', traffic: '+520K' },
    { topic: 'Remote Work', traffic: '+480K' },
  ];
}

/**
 * Returns top trends with volumes - ONLY hardcoded data
 */
export async function getTopTrendsWithVolume(): Promise<Array<{
  trend: string;
  estimated_weekly_searches: number;
  interest_score: number;
  status: 'Exploding' | 'Rising' | 'Stable' | 'Declining';
  related_topics: string[];
}>> {
  return [
    { trend: 'Artificial Intelligence', estimated_weekly_searches: 1100000, interest_score: 92, status: 'Exploding', related_topics: ['ChatGPT', 'Machine Learning', 'AI Tools'] },
    { trend: 'Taylor Swift', estimated_weekly_searches: 950000, interest_score: 79, status: 'Exploding', related_topics: ['Eras Tour', 'Taylor Swift News', 'Music'] },
    { trend: 'Bitcoin', estimated_weekly_searches: 890000, interest_score: 74, status: 'Rising', related_topics: ['Cryptocurrency', 'Crypto News', 'BTC Price'] },
    { trend: 'Donald Trump', estimated_weekly_searches: 850000, interest_score: 71, status: 'Stable', related_topics: ['Elections', 'News', 'Politics'] },
    { trend: 'Climate Change', estimated_weekly_searches: 650000, interest_score: 54, status: 'Stable', related_topics: ['Global Warming', 'Renewable Energy', 'COP28'] },
    { trend: 'ChatGPT', estimated_weekly_searches: 620000, interest_score: 52, status: 'Rising', related_topics: ['OpenAI', 'AI Chat', 'How to Use'] },
    { trend: 'NBA', estimated_weekly_searches: 580000, interest_score: 48, status: 'Stable', related_topics: ['Basketball', 'LeBron James', 'Lakers'] },
    { trend: 'Web3', estimated_weekly_searches: 520000, interest_score: 43, status: 'Stable', related_topics: ['Blockchain', 'NFT', 'Decentralized'] },
    { trend: 'World Cup 2026', estimated_weekly_searches: 510000, interest_score: 43, status: 'Rising', related_topics: ['Soccer', 'Football', 'Sports'] },
    { trend: 'Remote Work', estimated_weekly_searches: 480000, interest_score: 40, status: 'Stable', related_topics: ['Work from Home', 'Hybrid Work', 'Telecommute'] },
    { trend: 'Instagram', estimated_weekly_searches: 460000, interest_score: 38, status: 'Stable', related_topics: ['Social Media', 'Meta', 'Updates'] },
    { trend: 'Quantum Computing', estimated_weekly_searches: 420000, interest_score: 35, status: 'Rising', related_topics: ['Quantum Technology', 'Computing', 'Physics'] },
    { trend: 'Inflation', estimated_weekly_searches: 410000, interest_score: 34, status: 'Stable', related_topics: ['Economy', 'Prices', 'Finance'] },
    { trend: 'Space Exploration', estimated_weekly_searches: 380000, interest_score: 32, status: 'Exploding', related_topics: ['SpaceX', 'NASA', 'Moon'] },
    { trend: 'Tom Cruise', estimated_weekly_searches: 360000, interest_score: 30, status: 'Rising', related_topics: ['Movies', 'Top Gun', 'Hollywood'] },
    { trend: 'Cybersecurity', estimated_weekly_searches: 350000, interest_score: 29, status: 'Rising', related_topics: ['Data Protection', 'Hacking', 'Security'] },
    { trend: 'Netflix', estimated_weekly_searches: 340000, interest_score: 28, status: 'Stable', related_topics: ['Streaming', 'Shows', 'Movies'] },
    { trend: 'Renewable Energy', estimated_weekly_searches: 320000, interest_score: 27, status: 'Stable', related_topics: ['Solar', 'Wind Power', 'Green Energy'] },
    { trend: 'Olympics 2024', estimated_weekly_searches: 310000, interest_score: 26, status: 'Stable', related_topics: ['Paris', 'Sports', 'Games'] },
    { trend: 'Virtual Reality', estimated_weekly_searches: 280000, interest_score: 23, status: 'Stable', related_topics: ['VR Headsets', 'Metaverse', 'AR Technology'] },
    { trend: 'Fitness Trends', estimated_weekly_searches: 270000, interest_score: 23, status: 'Rising', related_topics: ['Gym', 'Health', 'Exercise'] },
    { trend: 'Machine Learning', estimated_weekly_searches: 265000, interest_score: 22, status: 'Rising', related_topics: ['Deep Learning', 'Neural Networks', 'AI'] },
    { trend: 'Beyonce', estimated_weekly_searches: 260000, interest_score: 22, status: 'Exploding', related_topics: ['Renaisance Tour', 'Music', 'Celebrity'] },
    { trend: 'Cryptocurrency', estimated_weekly_searches: 250000, interest_score: 21, status: 'Stable', related_topics: ['Ethereum', 'DeFi', 'Blockchain'] },
    { trend: 'Gaming News', estimated_weekly_searches: 245000, interest_score: 20, status: 'Rising', related_topics: ['PS5', 'Xbox', 'Games'] },
    { trend: 'Fashion Week', estimated_weekly_searches: 240000, interest_score: 20, status: 'Stable', related_topics: ['Style', 'Designers', 'Clothing'] },
    { trend: 'AI Jobs', estimated_weekly_searches: 235000, interest_score: 20, status: 'Rising', related_topics: ['Tech Jobs', 'Career', 'AI Training'] },
    { trend: 'COVID-19', estimated_weekly_searches: 230000, interest_score: 19, status: 'Stable', related_topics: ['Pandemic', 'Health', 'Vaccines'] },
    { trend: 'Metaverse', estimated_weekly_searches: 225000, interest_score: 19, status: 'Stable', related_topics: ['Virtual Worlds', 'NFT', 'Web3'] },
    { trend: 'Stock Market', estimated_weekly_searches: 220000, interest_score: 18, status: 'Stable', related_topics: ['Trading', 'Finance', 'Investing'] },
  ];
}

/**
 * Returns global trending now - ONLY hardcoded data
 */
export async function getGlobalTrendingNow(): Promise<any[]> {
  return [
    { rank: 1, query: 'Artificial Intelligence', interest_score: 92, volume_estimate: '10M–50M', status: 'Exploding', category: 'Technology', sparkline: [65, 70, 75, 78, 82, 88, 92] },
    { rank: 2, query: 'Taylor Swift', interest_score: 79, volume_estimate: '5M–10M', status: 'Exploding', category: 'Entertainment', sparkline: [60, 62, 65, 70, 74, 77, 79] },
    { rank: 3, query: 'Bitcoin', interest_score: 74, volume_estimate: '5M–10M', status: 'Rising', category: 'Technology', sparkline: [50, 55, 60, 65, 70, 72, 74] },
    { rank: 4, query: 'Election News', interest_score: 71, volume_estimate: '5M–10M', status: 'Stable', category: 'News', sparkline: [68, 69, 70, 70, 71, 71, 71] },
    { rank: 5, query: 'Climate Change', interest_score: 54, volume_estimate: '1M–5M', status: 'Stable', category: 'News', sparkline: [50, 50, 52, 53, 54, 54, 54] },
    { rank: 6, query: 'ChatGPT', interest_score: 52, volume_estimate: '1M–5M', status: 'Rising', category: 'Technology', sparkline: [35, 40, 45, 48, 50, 51, 52] },
    { rank: 7, query: 'NBA Playoffs', interest_score: 48, volume_estimate: '1M–5M', status: 'Stable', category: 'Sports', sparkline: [45, 45, 46, 47, 48, 48, 48] },
    { rank: 8, query: 'Web3 News', interest_score: 43, volume_estimate: '1M–5M', status: 'Stable', category: 'Technology', sparkline: [40, 41, 42, 42, 43, 43, 43] },
    { rank: 9, query: 'Fashion Trends', interest_score: 40, volume_estimate: '1M–5M', status: 'Rising', category: 'Lifestyle', sparkline: [35, 36, 37, 38, 39, 40, 40] },
    { rank: 10, query: 'Cybersecurity', interest_score: 38, volume_estimate: '1M–5M', status: 'Rising', category: 'Technology', sparkline: [30, 32, 34, 36, 37, 38, 38] },
  ];
}

/**
 * Analyzes a trend topic - returns generated content
 */
export async function analyzeTrend(topic: string): Promise<TrendAnalysisResult> {
  try {
    // Generate mock data for visualization
    const interest_over_time = [
      { date: 'Sun', value: 30 },
      { date: 'Mon', value: 40 },
      { date: 'Tue', value: 50 },
      { date: 'Wed', value: 65 },
      { date: 'Thu', value: 75 },
      { date: 'Fri', value: 85 },
      { date: 'Sat', value: 92 },
    ];

    const status: 'Exploding' | 'Rising' | 'Stable' | 'Declining' = 'Exploding';

    // Generate AI summary if available, otherwise generic
    let summary = `${topic} is currently trending with strong interest. This topic shows significant search activity and engagement across multiple regions.`;

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: `Provide a 2-sentence trend analysis for "${topic}". Be concise and professional.`
            }
          ],
          max_tokens: 100,
        });
        summary = response.choices[0]?.message?.content || summary;
      } catch (err) {
        // Fallback to generic summary
        console.warn('OpenAI failed, using generic summary');
      }
    }

    return {
      topic,
      status,
      summary,
      sources: {
        google: {
          interest_over_time,
          related_queries: [`${topic} news`, `${topic} today`, `best ${topic}`, `${topic} 2025`],
          interest_by_region: [
            { region: 'United States', value: 92 },
            { region: 'United Kingdom', value: 78 },
            { region: 'Canada', value: 85 },
            { region: 'Australia', value: 72 },
          ],
        },
      },
      related_topics: [`${topic} news`, `${topic} today`, `${topic} price`, `${topic} guide`],
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error analyzing trend:', error);
    throw new Error(`Failed to analyze trend for "${topic}": ${errorMessage}`);
  }
}
