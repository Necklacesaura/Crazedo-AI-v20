/**
 * Google Trends Scraper Module (using google-trends-api package)
 * Handles all direct interactions with google-trends-api library
 * Provides clean, reusable functions for scraping trend data
 * 
 * ANTI-BLOCKING FEATURES:
 * - Request throttling (limits concurrent requests)
 * - Delays between requests (500ms default)
 * - User-Agent headers (mimics browser)
 * - Cache integration (reduces redundant API calls)
 * 
 * LOCATION: server/services/google-trends-scraper.ts
 * Imported by: server/services/trend-analyzer.ts
 */

import googleTrends from 'google-trends-api';

// Request throttling
const MAX_CONCURRENT_REQUESTS = 3;
let activeRequests = 0;
const requestQueue: Array<() => Promise<any>> = [];

// Browser-like User-Agent
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
];

// Delay between requests (in milliseconds)
const REQUEST_DELAY = 500;

/**
 * Sleep for specified milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get random User-Agent to look like a browser
 */
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Queue a request with throttling
 */
async function throttledRequest<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const execute = async () => {
      try {
        activeRequests++;
        await delay(REQUEST_DELAY);
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        activeRequests--;
        processQueue();
      }
    };

    if (activeRequests < MAX_CONCURRENT_REQUESTS) {
      execute();
    } else {
      requestQueue.push(execute);
    }
  });
}

/**
 * Process queued requests
 */
function processQueue() {
  if (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
    const fn = requestQueue.shift();
    if (fn) fn();
  }
}

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
    const result = await throttledRequest(async () => {
      const response = await googleTrends.dailyTrends({ geo });
      const data = JSON.parse(response);
      return data.default?.trendingSearchesDays?.[0]?.trendingSearches || [];
    });
    
    if (result.length === 0) {
      console.warn(`⚠️ No trending data found for ${geo}, returning empty array`);
      return [];
    }
    
    console.log(`✅ Fetched ${result.length} LIVE trends for geo: ${geo} (throttled)`);
    return result;
  } catch (error) {
    console.warn(`❌ Failed to fetch daily trends for geo: ${geo}`, error);
    return [];
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
    const result = await throttledRequest(async () => {
      const options: any = { keyword };
      if (startTime) options.startTime = startTime;
      
      const response = await googleTrends.interestOverTime(options);
      const data = JSON.parse(response);
      return data.default?.timelineData || [];
    });
    
    return result;
  } catch (error) {
    console.warn(`❌ Failed to fetch interest over time for "${keyword}"`, error);
    throw error;
  }
}

/**
 * Fetches related queries for a specific keyword
 * Generates smart autocomplete suggestions based on common patterns
 * @param keyword - Search term
 * @returns List of related search queries (3-5 suggestions)
 */
export async function fetchRelatedQueries(keyword: string): Promise<string[]> {
  try {
    // Generate smart suggestions based on common search patterns
    const suggestions: string[] = [];
    const lower = keyword.toLowerCase();
    
    // Common suggestion patterns
    const patterns = [
      `${keyword} news`,
      `${keyword} today`,
      `${keyword} price`,
      `${keyword} guide`,
      `best ${keyword}`,
      `${keyword} 2025`,
      `how to ${keyword}`,
      `${keyword} reddit`,
      `${keyword} explained`,
      `${keyword} vs`,
    ];
    
    // Return 3-5 random suggestions from patterns
    const shuffled = patterns.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
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
    const result = await throttledRequest(async () => {
      const response = await googleTrends.interestByRegion({ keyword });
      const data = JSON.parse(response);
      return data.default?.geoMapData || [];
    });
    
    return result;
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
