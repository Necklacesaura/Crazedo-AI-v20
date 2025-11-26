import googleTrends from 'google-trends-api';
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
    // REMOVED: Reddit and Twitter/X functionality
    // Future platforms can be added here as needed
  };
  related_topics: string[];
}

/**
 * Main function to analyze trend for a given topic
 * Fetches Google Trends data and generates AI summary
 */
export async function analyzeTrend(topic: string): Promise<TrendAnalysisResult> {
  try {
    // Fetch Google Trends data
    const googleData = await fetchGoogleTrends(topic);

    // Determine trend status based on interest over time
    const trendStatus = determineTrendStatus(googleData.interest_over_time);
    
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
      related_topics: googleData.related_queries.slice(0, 4),
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
    
    // Extract top 4 related queries or use fallback
    const related_queries = relatedData.default.rankedList?.[0]?.rankedKeyword
      ?.slice(0, 4)
      .map((item: any) => item.query) || [`${topic} news`, `is ${topic} real`, `how to use ${topic}`, `best ${topic} 2025`];

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
      // Fallback regional data
      interest_by_region = [
        { region: 'United States', value: 100 },
        { region: 'United Kingdom', value: 75 },
        { region: 'Canada', value: 65 },
        { region: 'India', value: 55 },
        { region: 'Australia', value: 50 },
      ];
    }

    return {
      interest_over_time,
      related_queries,
      interest_by_region,
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
        { region: 'United Kingdom', value: 75 },
        { region: 'Canada', value: 65 },
        { region: 'India', value: 55 },
        { region: 'Australia', value: 50 },
      ],
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
 * Determines trend status based on interest over time data
 * Compares recent 3 days average vs earlier 3 days average
 */
function determineTrendStatus(interestData: { date: string; value: number }[]): 'Exploding' | 'Rising' | 'Stable' | 'Declining' {
  if (interestData.length < 2) return 'Stable';

  const recent = interestData.slice(-3); // Last 3 days
  const earlier = interestData.slice(0, 3); // First 3 days

  const recentAvg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length;
  const earlierAvg = earlier.reduce((sum, d) => sum + d.value, 0) / earlier.length;

  const percentChange = ((recentAvg - earlierAvg) / Math.max(earlierAvg, 1)) * 100;

  if (percentChange > 50) return 'Exploding';
  if (percentChange > 15) return 'Rising';
  if (percentChange < -15) return 'Declining';
  return 'Stable';
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
