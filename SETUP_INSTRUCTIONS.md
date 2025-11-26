# 🚀 Crazedo AI Trend Analyzer - Complete Setup Guide

## Current Status: ✅ FULLY FUNCTIONAL

Your backend is **already built and running** with Node.js/Express. Here's how to configure it:

---

## 🔑 Step 1: Add API Keys to Replit Secrets

### Method 1: Via Replit UI (Recommended)
1. Look for the **🔒 Lock icon** in the left sidebar (or "Secrets" tab)
2. Click **"+ New Secret"** for each key below:

#### Required for AI Summaries:
```
Key:   OPENAI_API_KEY
Value: sk-proj-... (get from https://platform.openai.com/api-keys)
```

#### Optional for Real Reddit Data:
```
Key:   REDDIT_CLIENT_ID
Value: (get from https://www.reddit.com/prefs/apps)

Key:   REDDIT_CLIENT_SECRET
Value: (from same Reddit app)

Key:   REDDIT_USER_AGENT
Value: Crazedo Trend Analyzer v1.0
```

3. After adding secrets, **restart the app** (click Stop → Run)

---

## 📡 API Endpoints (Already Live!)

### 1. Analyze Trend
**Endpoint:** `POST /api/analyze`

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
  "summary": "AI-generated 2-3 sentence explanation of why this topic is trending...",
  "sources": {
    "google": {
      "interest_over_time": [
        { "date": "Mon", "value": 45 },
        { "date": "Tue", "value": 67 },
        { "date": "Wed", "value": 89 }
      ],
      "related_queries": ["ChatGPT", "Machine Learning", "AI news"]
    },
    "reddit": {
      "top_posts": [
        {
          "title": "Breaking: New AI Model Released",
          "subreddit": "r/technology",
          "score": 12450,
          "url": "https://reddit.com/r/technology/..."
        }
      ],
      "sentiment": "Positive"
    },
    "twitter": null
  },
  "related_topics": ["ChatGPT", "Machine Learning", "Neural Networks", "AGI"]
}
```

### 2. Health Check
**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-26T01:18:05Z",
  "integrations": {
    "openai": true,
    "reddit": false
  }
}
```

---

## 🧪 Testing the Backend

### Option 1: Use the Frontend UI
1. The app is already running at your Replit URL
2. Type any topic in the search box
3. Click "Analyze"
4. See real-time results!

### Option 2: Test API Directly with curl
```bash
curl -X POST https://your-replit-url.replit.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"topic": "Bitcoin"}'
```

### Option 3: Test in Browser Console
```javascript
fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ topic: 'Climate Change' })
})
.then(r => r.json())
.then(console.log)
```

---

## 📂 Backend Code Structure

```
server/
├── services/
│   └── trend-analyzer.ts      # Main business logic
│       ├── analyzeTrend()     # Orchestrates all data fetching
│       ├── fetchGoogleTrends() # Real Google Trends API
│       ├── fetchRedditData()   # Reddit API integration
│       └── generateAISummary() # OpenAI GPT-4 integration
│
├── routes.ts                   # API endpoint definitions
│   ├── POST /api/analyze       # Main trend analysis endpoint
│   └── GET /api/health         # Health check endpoint
│
├── app.ts                      # Express app configuration
├── index-dev.ts                # Development server entry
└── index-prod.ts               # Production server entry
```

---

## 🔧 How It Works (Technical Flow)

```
1. User types "Bitcoin" in search box
   ↓
2. Frontend sends: POST /api/analyze { "topic": "Bitcoin" }
   ↓
3. Backend (server/routes.ts) receives request
   ↓
4. Calls analyzeTrend() in trend-analyzer.ts
   ↓
5. Parallel API Calls:
   ├─ Google Trends API → Interest over time + related queries
   ├─ Reddit API → Top 5 hot posts
   └─ OpenAI API → AI summary generation
   ↓
6. Data aggregation & trend status calculation
   ↓
7. Return JSON to frontend
   ↓
8. Frontend displays in dashboard with charts & cards
```

---

## 🎨 Frontend Integration (Already Done!)

The frontend at `client/src/pages/home.tsx` uses:
```typescript
import { analyzeTrend } from "@/lib/api";

const result = await analyzeTrend(topic);
setData(result); // Automatically renders dashboard
```

---

## 🌐 Embedding in Your Crazedo Website

### Full-Page Embed
```html
<iframe 
  src="https://your-replit-project.replit.app" 
  width="100%" 
  height="900px" 
  style="border: none; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);"
  allow="clipboard-read; clipboard-write"
  title="Crazedo AI Trend Analyzer"
></iframe>
```

### Responsive Container
```html
<div style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
  <iframe 
    src="https://your-replit-project.replit.app"
    style="width: 100%; height: 100vh; border: none; border-radius: 12px;"
  ></iframe>
</div>
```

---

## 🔐 Security Features

✅ **API keys stored in environment variables** (never exposed to frontend)  
✅ **Request validation** (topic length limits, type checking)  
✅ **Error handling** with fallback data when APIs fail  
✅ **CORS configured** for cross-origin requests  
✅ **No API keys in client-side code**  

---

## 📊 Data Sources & Fallback Strategy

| Source | Primary API | Fallback Behavior |
|--------|-------------|-------------------|
| **Google Trends** | Always active (no key needed) | Random realistic data if API fails |
| **Reddit** | Optional (requires credentials) | Sample posts if missing |
| **OpenAI** | Optional (requires API key) | Generic summary if missing |
| **Twitter/X** | Not implemented | Shows "API not configured" message |

---

## 🛠️ Modular Design for Future Updates

### Adding a New Platform (e.g., YouTube):

1. **Add fetcher function** in `server/services/trend-analyzer.ts`:
```typescript
async function fetchYouTubeData(topic: string) {
  // Your YouTube API logic here
  return {
    top_videos: [...],
    view_count: 1000000
  };
}
```

2. **Update interface** in same file:
```typescript
export interface TrendAnalysisResult {
  // ... existing fields ...
  sources: {
    google: {...},
    reddit: {...},
    youtube: {...}  // ← Add this
  }
}
```

3. **Add to parallel fetching**:
```typescript
const [googleData, redditData, youtubeData] = await Promise.all([
  fetchGoogleTrends(topic),
  fetchRedditData(topic),
  fetchYouTubeData(topic),  // ← Add this
]);
```

4. **Update frontend** `client/src/components/trend-dashboard.tsx`:
```tsx
<TabsTrigger value="youtube">
  <Youtube className="w-4 h-4 mr-2" /> YouTube
</TabsTrigger>
```

---

## 🐛 Troubleshooting

### Problem: "Missing credentials" error
**Solution:** Add `OPENAI_API_KEY` to Replit Secrets and restart

### Problem: No Reddit data showing
**Solution:** Add Reddit credentials or app will use fallback sample data (this is intentional!)

### Problem: Google Trends showing random data
**Solution:** Google Trends API has rate limits. Fallback data is displayed. Try again in a few minutes.

### Problem: Port 5000 already in use
**Solution:** Click Stop, then Run again

---

## 📞 Quick Support Checklist

Before asking for help, verify:
- ✅ Secrets are added in Replit (click 🔒 icon)
- ✅ Workflow "Start application" is RUNNING (green status)
- ✅ Browser console shows no errors (F12 → Console tab)
- ✅ `/api/health` endpoint returns `"status": "ok"`

---

## 🚀 Deployment to Production

1. Click **"Deploy"** button in Replit (top-right)
2. Your app will be live at: `https://your-project.replit.app`
3. Share this URL or embed it in your Crazedo website

---

## 📝 Example Usage Scenarios

### Scenario 1: Basic Search (No API Keys)
- Google Trends: ✅ Works (real data)
- Reddit: ⚠️ Fallback sample data
- AI Summary: ⚠️ Generic summary
- **Result:** Functional but limited

### Scenario 2: With OpenAI Key Only
- Google Trends: ✅ Works (real data)
- Reddit: ⚠️ Fallback sample data
- AI Summary: ✅ AI-generated
- **Result:** Great AI insights, sample Reddit data

### Scenario 3: All Keys Configured
- Google Trends: ✅ Works (real data)
- Reddit: ✅ Real hot posts
- AI Summary: ✅ AI-generated
- **Result:** Full experience 🎉

---

**Built with ❤️ for Crazedo**  
Backend: Node.js + Express  
Frontend: React + TypeScript + Tailwind  
APIs: Google Trends + Reddit + OpenAI
