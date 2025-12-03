/**
 * Google Trends Scraper Module (using google-trends package)
 * Handles all direct interactions with google-trends library
 * Provides clean, reusable functions for scraping trend data
 * 
 * LOCATION: server/services/google-trends-scraper.ts
 * Imported by: server/services/trend-analyzer.ts
 */

// @ts-ignore - google-trends library doesn't have type declarations
import * as googleTrends from 'google-trends';

/**
 * Validates if response is valid JSON (not HTML error page)
 */
function isValidJSON(response: any): boolean {
  try {
    if (response === null || response === undefined) return false;
    if (typeof response === 'string' && response.trim().startsWith('<')) {
      console.warn('⚠️ API returned HTML (blocked/rate limited)');
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetches trending searches from Google Trends for a specific geography
 * @param geo - Geography code (e.g., 'US', 'GLOBAL', 'IN', 'UK')
 * @returns Raw trending data with queries, traffic, and metadata
 */
export async function fetchDailyTrends(geo: string = 'GLOBAL'): Promise<any[]> {
  try {
    const response = await googleTrends.dailyTrends({ geo });
    
    if (!isValidJSON(response)) {
      throw new Error('Invalid response (likely HTML error page)');
    }
    
    // Extract trends from response
    const trends = response.default?.trendingSearchesDays?.[0]?.trendingSearches || [];
    if (trends.length === 0) {
      throw new Error('No trending data returned');
    }
    
    console.log(`✅ Fetched ${trends.length} LIVE trends for geo: ${geo}`);
    return trends;
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
    
    const response = await googleTrends.interestOverTime(options);
    
    if (!isValidJSON(response)) {
      throw new Error('Invalid response');
    }
    
    return response.default?.timelineData || [];
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
    const response = await googleTrends.relatedQueries({ keyword });
    
    if (!isValidJSON(response)) {
      return [];
    }
    
    return response.default?.rankedList?.[0]?.rankedKeyword
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
    const response = await googleTrends.interestByRegion({ keyword });
    
    if (!isValidJSON(response)) {
      return [];
    }
    
    return response.default?.geoMapData || [];
  } catch (error) {
    console.warn(`❌ Failed to fetch interest by region for "${keyword}"`, error);
    return [];
  }
}

/**
 * Calculates trend status based on interest timeline
 * Works with both raw API format AND transformed format
 * Compares recent vs older data to determine trend direction
 * @param timelineData - Array of timeline data points (both formats supported)
 * @returns Status: 'Exploding' | 'Rising' | 'Stable' | 'Declining'
 */
export function calculateTrendStatus(
  timelineData: any[]
): 'Exploding' | 'Rising' | 'Stable' | 'Declining' {
  if (timelineData.length === 0) return 'Stable';

  // Handle both raw API format (d.value[0]) and transformed format (d.value)
  const getValue = (d: any): number => {
    if (Array.isArray(d.value)) return d.value[0] || 0;
    return d.value || 0;
  };

  const recentAvg = timelineData
    .slice(-3)
    .reduce((sum: number, d: any) => sum + getValue(d), 0) /
    Math.max(timelineData.slice(-3).length, 1);

  const olderAvg = timelineData
    .slice(0, 3)
    .reduce((sum: number, d: any) => sum + getValue(d), 0) /
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
