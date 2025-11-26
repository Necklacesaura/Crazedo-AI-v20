# Crazedo AI Trend Analyzer - Setup Guide

## ⚠️ Important Note
This project is currently in **Frontend Mockup Mode**. The current implementation uses a simulation layer (`client/src/lib/mock-api.ts`) to mimic the backend behavior so you can verify the design and user experience immediately without complex backend setup.

## 🔧 Backend Implementation Guide (Python + Flask)

To implement the real backend, you will need to create a Python Flask server. Here is the JSON structure that your API endpoint should return:

### API Endpoint Structure
**Endpoint:** `POST /api/analyze`
**Body:** `{ "topic": "your_search_term" }`

**Response Format:**
```json
{
  "topic": "Search Term",
  "status": "Exploding", // Options: Exploding, Rising, Stable, Declining
  "summary": "AI generated summary string...",
  "sources": {
    "google": {
      "interest_over_time": [
        { "date": "Mon", "value": 45 },
        { "date": "Tue", "value": 80 }
      ],
      "related_queries": ["query 1", "query 2"]
    },
    "reddit": {
      "top_posts": [
        { "title": "Post Title", "subreddit": "r/sub", "score": 1200, "url": "..." }
      ],
      "sentiment": "Positive"
    },
    "twitter": {
      "recent_tweets": [
        { "text": "Tweet text", "author": "@user", "likes": 50 }
      ],
      "hashtags": ["#tag1", "#tag2"]
    }
  },
  "related_topics": ["Topic A", "Topic B"]
}
```

## 🔑 API Keys Configuration

When you implement the backend, you will need to set up the following environment variables or configuration keys:

1.  **OpenAI / LLM API Key** (for the AI Summary)
    -   `OPENAI_API_KEY=sk-...`
2.  **Reddit API** (PRAW)
    -   `REDDIT_CLIENT_ID=...`
    -   `REDDIT_CLIENT_SECRET=...`
    -   `REDDIT_USER_AGENT=...`
3.  **Twitter / X API** (Optional)
    -   `TWITTER_BEARER_TOKEN=...`

## 🚀 How to Run (Current Mockup)
The project is currently running in a standard Node.js environment on Replit.
1.  The app automatically starts when you open the Replit project.
2.  If it stops, click the "Run" button at the top of the screen.

## 🌐 How to Embed (Iframe Method)
To embed this tool inside your existing website, add the following code to your HTML:

```html
<iframe 
  src="https://your-replit-project-url.replit.app" 
  width="100%" 
  height="800px" 
  style="border: none; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);"
  allow="clipboard-read; clipboard-write"
></iframe>
```

*Replace `https://your-replit-project-url.replit.app` with the actual URL of your deployed Replit project.*
