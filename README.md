# Crazedo AI Trend Analyzer

**Google Trends Intelligence System v2.0**

A real-time trend analysis tool powered by Google Trends and optional AI summaries. Analyze any topic to see search interest momentum, trend classification, and related queries.

---

## 🎯 Features

- **Real-Time Google Trends Data**: 7-day search interest tracking
- **Trend Classification**: Automatic status detection (Exploding, Rising, Stable, Declining)
- **AI-Powered Summaries**: Optional OpenAI integration for intelligent trend explanations
- **Related Topics**: Discover what else people are searching for
- **Beautiful Dashboard**: Dark cyber-themed UI with interactive charts
- **Instant Analysis**: Type any topic and get results in seconds

---

## 🚀 Quick Start

### 1. Run the Application
The app starts automatically on Replit. If it stops, click the **Run** button.

### 2. Search for Any Topic
- Open the preview window
- Type a topic (e.g., "Artificial Intelligence", "Bitcoin", "Climate Change")
- Click **Analyze**
- View real-time Google Trends data

### 3. Optional: Add OpenAI Key for AI Summaries
- Click the **🔒 Secrets** tab in Replit
- Add: `OPENAI_API_KEY` = `sk-proj-...` (from https://platform.openai.com/api-keys)
- Restart the app (Stop → Run)

---

## 📊 What This Version Includes

✅ **Google Trends** (Always Active)
- Real-time search interest over 7 days
- Trend momentum calculation
- Related search queries
- No API key required

✅ **AI Summaries** (Optional)
- OpenAI GPT-4 powered insights
- Requires `OPENAI_API_KEY` in Secrets
- Falls back to generic summaries if not configured

❌ **Reddit & Twitter/X** (Removed in v2.0)
- Simplified to focus on Google Trends only
- Can be re-added in future if needed

---

## 🔧 Technical Stack

**Frontend:**
- React + TypeScript
- Tailwind CSS (Dark Cyber Theme)
- Framer Motion (Animations)
- Recharts (Data Visualization)

**Backend:**
- Node.js + Express
- Google Trends API
- OpenAI API (Optional)

---

## 🌐 Embedding in Your Website

```html
<iframe 
  src="https://your-replit-url.replit.app" 
  width="100%" 
  height="900px" 
  style="border: none; border-radius: 16px;"
  title="Crazedo AI Trend Analyzer"
></iframe>
```

Replace `your-replit-url` with your actual Replit deployment URL.

---

## 📡 API Documentation

### POST /api/analyze
Analyzes a topic and returns Google Trends data with AI summary.

**Request:**
```json
{
  "topic": "Artificial Intelligence"
}
```

**Response:**
```json
{
  "topic": "Artificial Intelligence",
  "status": "Exploding",
  "summary": "AI-generated or generic trend explanation...",
  "sources": {
    "google": {
      "interest_over_time": [
        { "date": "Mon", "value": 45 },
        { "date": "Tue", "value": 67 }
      ],
      "related_queries": ["ChatGPT", "Machine Learning", "AI news"]
    }
  },
  "related_topics": ["ChatGPT", "Machine Learning", "Neural Networks"]
}
```

### GET /api/health
Check API status and configured integrations.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-26T...",
  "integrations": {
    "openai": false
  }
}
```

---

## 🛠️ Modular Design for Future Updates

### Adding a New Platform (e.g., YouTube)

1. **Install Package:**
   ```bash
   npm install youtube-api-package
   ```

2. **Add Fetcher Function** (`server/services/trend-analyzer.ts`):
   ```typescript
   async function fetchYouTubeData(topic: string) {
     // Your YouTube API logic
     return { top_videos: [...], view_count: 1000000 };
   }
   ```

3. **Update Interface:**
   ```typescript
   export interface TrendAnalysisResult {
     // ... existing fields ...
     sources: {
       google: {...},
       youtube: {...}  // Add this
     }
   }
   ```

4. **Add to Main Function:**
   ```typescript
   const [googleData, youtubeData] = await Promise.all([
     fetchGoogleTrends(topic),
     fetchYouTubeData(topic)
   ]);
   ```

5. **Update Frontend Dashboard** to display YouTube data.

---

## 📂 Project Structure

```
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── search-input.tsx
│   │   │   ├── trend-dashboard.tsx
│   │   │   └── ui/         # Shadcn components
│   │   ├── lib/
│   │   │   └── api.ts      # API client
│   │   ├── pages/
│   │   │   └── home.tsx
│   │   └── index.css       # Tailwind styles
│   └── index.html
│
├── server/                  # Express backend
│   ├── services/
│   │   └── trend-analyzer.ts  # Main business logic
│   ├── routes.ts            # API endpoints
│   └── app.ts               # Express config
│
└── Documentation
    ├── README.md            # This file
    └── SETUP_INSTRUCTIONS.md # Detailed setup guide
```

---

## 🐛 Troubleshooting

**Problem:** No AI summaries, just generic text
**Solution:** Add `OPENAI_API_KEY` to Replit Secrets and restart

**Problem:** Random/unrealistic Google Trends data
**Solution:** Google Trends API has rate limits. Fallback data is shown. Wait and try again.

**Problem:** Port 5000 already in use
**Solution:** Click Stop, then Run again in Replit

---

## 📝 Version History

**v2.0** (Current)
- Removed Reddit and Twitter/X functionality
- Simplified to Google Trends only
- Improved UI with better empty state
- Enhanced documentation

**v1.0**
- Initial release with Google Trends, Reddit, Twitter/X support

---

## 🚀 Deployment

1. Click **Deploy** in Replit (top-right)
2. Your app will be live at: `https://your-project.replit.app`
3. Share this URL or embed it in your Crazedo website

---

**Built with ❤️ for Crazedo**  
Powered by Google Trends + OpenAI (Optional)
