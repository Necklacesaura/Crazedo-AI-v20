import { useState, useEffect } from 'react';

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
    } | null; // Nullable if API key missing
  };
  related_topics: string[];
}

// Mock data generator
export const analyzeTrend = async (topic: string): Promise<TrendData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const isTech = ['ai', 'python', 'code', 'tech', 'robot'].some(t => topic.toLowerCase().includes(t));
  
  return {
    topic,
    status: isTech ? 'Exploding' : 'Rising',
    summary: `Analysis of "${topic}" indicates a significant surge in engagement across all monitored platforms. The primary driver appears to be recent viral discussions on social media combined with a steady increase in search volume over the last 48 hours.`,
    sources: {
      google: {
        interest_over_time: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          value: Math.floor(Math.random() * 50) + 50
        })),
        related_queries: [`${topic} news`, `is ${topic} real`, `how to use ${topic}`, `best ${topic} 2025`]
      },
      reddit: {
        top_posts: [
          { title: `Anyone else noticed ${topic} lately?`, subreddit: "r/technology", score: 4520, url: "#" },
          { title: `The truth about ${topic} - Mega Thread`, subreddit: "r/outoftheloop", score: 1240, url: "#" },
          { title: `My experience with ${topic}`, subreddit: "r/discussion", score: 890, url: "#" }
        ],
        sentiment: "Positive"
      },
      twitter: {
        recent_tweets: [
          { text: `Just saw the new ${topic} update. Mind blown! 🤯 #tech`, author: "@tech_guru", likes: 234 },
          { text: `Why is everyone talking about ${topic}?`, author: "@curious_mind", likes: 56 },
          { text: `${topic} is going to change everything.`, author: "@future_watcher", likes: 892 }
        ],
        hashtags: [`#${topic.replace(/\s/g, '')}`, "#trending", "#viral", "#2025"]
      }
    },
    related_topics: ["Artificial Intelligence", "Cybersecurity", "Web Development", "SpaceX"]
  };
};
