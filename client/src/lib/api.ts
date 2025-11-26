export type TrendStatus = 'Exploding' | 'Rising' | 'Stable' | 'Declining';

export interface TrendData {
  topic: string;
  status: TrendStatus;
  summary: string;
  sources: {
    google: {
      interest_over_time: { date: string; value: number }[];
      related_queries: string[];
    };
    reddit: {
      top_posts: { title: string; subreddit: string; score: number; url: string }[];
      sentiment: string;
    };
    twitter: {
      recent_tweets: { text: string; author: string; likes: number }[];
      hashtags: string[];
    } | null;
  };
  related_topics: string[];
}

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
