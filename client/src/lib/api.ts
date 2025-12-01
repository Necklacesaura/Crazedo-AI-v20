// Type definitions for API responses
export type TrendStatus = 'Exploding' | 'Rising' | 'Stable' | 'Declining';

export interface TrendData {
  topic: string;
  status: TrendStatus;
  summary: string;
  sources: {
    google: {
      interest_over_time: { date: string; value: number }[];
      related_queries: string[];
      interest_by_region: { region: string; value: number }[];
    };
    // REMOVED: reddit and twitter fields
    // This version only supports Google Trends data
  };
  related_topics: string[];
}

/**
 * Analyzes a topic by calling the backend API
 * Returns Google Trends data, trend status, and AI summary
 */
export const analyzeTrend = async (topic: string): Promise<TrendData> => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to analyze trend');
  }

  return response.json();
};

// Type definitions for weekly trends
export interface WeeklyTrend {
  trend: string;
  estimated_weekly_searches: number;
  interest_score: number;
  status: TrendStatus;
  related_topics: string[];
}

/**
 * Fetches top 10 trends with estimated weekly search volumes
 * NOTE: Estimates are calculated projections, not official Google data
 */
export const getTopTrendsWithVolume = async (): Promise<WeeklyTrend[]> => {
  const response = await fetch('/api/top-trends-weekly');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch top trends');
  }

  const data = await response.json();
  return data.trends;
};
