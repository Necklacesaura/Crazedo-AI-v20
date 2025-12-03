/**
 * Google Trends Scraper Module
 * Handles all direct interactions with google-trends-api library
 * Provides clean, reusable functions for scraping trend data
 * 
 * LOCATION: server/services/google-trends-scraper.ts
 * Imported by: server/services/trend-analyzer.ts
 */

import googleTrends from 'google-trends-api';

/**
 * Fetches trending searches from Google Trends for a specific geography
 * @param geo - Geography code (e.g., 'US', 'GLOBAL', 'IN', 'UK')
 * @returns Raw trending data with queries, traffic, and metadata
 */
export async function fetchDailyTrends(geo: string = 'GLOBAL'): Promise<any[]> {
  try {
    const trendingRaw = await googleTrends.dailyTrends({ geo });
    const data = JSON.parse(trendingRaw);
    return data.default.trendingSearchesDays?.[0]?.trendingSearches || [];
  } catch (error) {
    console.warn(`❌ Failed to fetch daily trends for geo: ${geo}`, error);
    throw error;
  }
}

/**
 * Fetches interest over time for a specific keyword
 * @param keyword - Search term to analyze
 * @param startTime - Start date for analysis
 * @returns Timeline data with interest values
 */
export async function fetchInterestOverTime(
  keyword: string,
  startTime?: Date
): Promise<any[]> {
  try {
    const options: any = { keyword };
    if (startTime) options.startTime = startTime;
    
    const interestRaw = await googleTrends.interestOverTime(options);
    const data = JSON.parse(interestRaw);
    return data.default.timelineData || [];
  } catch (error) {
    console.warn(`❌ Failed to fetch interest over time for "${keyword}"`, error);
    throw error;
  }
}

/**
 * Fetches related queries for a specific keyword
 * @param keyword - Search term
 * @returns List of related search queries
 */
export async function fetchRelatedQueries(keyword: string): Promise<string[]> {
  try {
    const relatedRaw = await googleTrends.relatedQueries({ keyword });
    const data = JSON.parse(relatedRaw);
    return data.default.rankedList?.[0]?.rankedKeyword
      ?.slice(0, 3)
      .map((item: any) => item.query) || [];
  } catch (error) {
    console.warn(`❌ Failed to fetch related queries for "${keyword}"`, error);
    return [];
  }
}

/**
 * Fetches interest by region for a specific keyword
 * @param keyword - Search term
 * @returns Regional interest data
 */
export async function fetchInterestByRegion(keyword: string): Promise<any[]> {
  try {
    const regionRaw = await googleTrends.interestByRegion({ keyword });
    const data = JSON.parse(regionRaw);
    return data.default.geoMapData || [];
  } catch (error) {
    console.warn(`❌ Failed to fetch interest by region for "${keyword}"`, error);
    return [];
  }
}

/**
 * Calculates trend status based on interest timeline
 * Compares recent vs older data to determine trend direction
 * @param timelineData - Array of timeline data points
 * @returns Status: 'Exploding' | 'Rising' | 'Stable' | 'Declining'
 */
export function calculateTrendStatus(
  timelineData: any[]
): 'Exploding' | 'Rising' | 'Stable' | 'Declining' {
  if (timelineData.length === 0) return 'Stable';

  const recentAvg = timelineData
    .slice(-3)
    .reduce((sum: number, d: any) => sum + (d.value[0] || 0), 0) /
    Math.max(timelineData.slice(-3).length, 1);

  const olderAvg = timelineData
    .slice(0, 3)
    .reduce((sum: number, d: any) => sum + (d.value[0] || 0), 0) /
    Math.max(timelineData.slice(0, 3).length, 1);

  const percentChange = ((recentAvg - olderAvg) / Math.max(olderAvg, 1)) * 100;

  if (percentChange > 50) return 'Exploding';
  if (percentChange > 15) return 'Rising';
  if (percentChange < -15) return 'Declining';
  return 'Stable';
}

/**
 * Extracts query name from trend item
 * @param item - Trend item from Google Trends
 * @returns Clean query string
 */
export function extractQueryName(item: any, fallback: string = 'Unknown'): string {
  return item.title?.query || item.title?.text || fallback;
}

/**
 * Gets peak interest score from timeline data
 * @param timelineData - Array of timeline points
 * @returns Interest score on 0-100 scale
 */
export function getPeakInterestScore(timelineData: any[]): number {
  if (timelineData.length === 0) return 75;
  return Math.max(...timelineData.map((d: any) => d.value[0] || 0));
}
