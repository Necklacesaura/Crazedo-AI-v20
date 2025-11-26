# 🚀 Crazedo AI Trend Analyzer - Setup Instructions

**Version 2.0 - Google Trends Edition**

---

## ⚡ Quick Start (No Setup Required!)

Your app works **right now** with zero configuration. Google Trends data is available immediately.

1. **Open the preview window**
2. **Type any topic** (e.g., "Artificial Intelligence", "Bitcoin", "SpaceX")
3. **Click Analyze**
4. **See results** with real Google Trends data

---

## 🔑 Optional: Add OpenAI for AI Summaries

### Without OpenAI Key:
- ✅ Real Google Trends data
- ✅ Trend classification
- ✅ Related topics
- ⚠️ Generic summaries

### With OpenAI Key:
- ✅ Real Google Trends data
- ✅ Trend classification
- ✅ Related topics
- ✅ **AI-powered intelligent summaries**

### How to Add OpenAI Key:

1. **Get your API key** from https://platform.openai.com/api-keys
2. **Click the 🔒 Lock icon** in Replit's left sidebar (Secrets tab)
3. **Add a new secret:**
   ```
   Key:   OPENAI_API_KEY
   Value: sk-proj-... (paste your key here)
   ```
4. **Restart the app** (Click Stop → Run)

---

## 📡 API Endpoints

### POST /api/analyze

Analyze any topic and get Google Trends data.

**Request:**
```bash
curl -X POST https://your-url.replit.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"topic": "Climate Change"}'
```

**Response:**
```json
{
  "topic": "Climate Change",
  "status": "Rising",
  "summary": "Analysis shows rising trend pattern based on Google Trends...",
  "sources": {
    "google": {
      "interest_over_time": [
        { "date": "Mon", "value": 65 },
        { "date": "Tue", "value": 72 },
        { "date": "Wed", "value": 78 },
        { "date": "Thu", "value": 85 },
        { "date": "Fri", "value": 91 },
        { "date": "Sat", "value": 88 },
        { "date": "Sun", "value": 95 }
      ],
      "related_queries": [
        "climate change news",
        "global warming",
        "carbon emissions",
        "climate crisis 2025"
      ]
    }
  },
  "related_topics": [
    "Global Warming",
    "Carbon Emissions", 
    "Renewable Energy",
    "Climate Crisis"
  ]
}
```

### GET /api/health

Check if the API is running and which integrations are configured.

**Request:**
```bash
curl https://your-url.replit.app/api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-26T01:45:00.000Z",
  "integrations": {
    "openai": false
  }
}
```

If `openai: true`, AI summaries are enabled.

---

## 🌐 Embedding in Your Crazedo Website

### Full-Page Embed
```html
<iframe 
  src="https://your-replit-url.replit.app" 
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
    src="https://your-replit-url.replit.app"
    style="width: 100%; height: 100vh; border: none; border-radius: 12px;"
    title="Crazedo AI Trend Analyzer"
  ></iframe>
</div>
```

**Important:** Replace `your-replit-url` with your actual Replit deployment URL.

---

## 🔧 Technical Architecture

### Frontend (`client/`)
- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS (Dark Cyber Theme)
  - Neon green accents (`#00FF9D`)
  - Dark background gradients
  - Glassmorphism effects
  - Smooth animations via Framer Motion
- **Charts:** Recharts for Google Trends visualization
- **Components:**
  - `search-input.tsx` - Search bar with loading states
  - `trend-dashboard.tsx` - Main results display
  - `home.tsx` - Landing page

### Backend (`server/`)
- **Framework:** Express.js (Node.js)
- **Main Service:** `server/services/trend-analyzer.ts`
  - `analyzeTrend()` - Main orchestration function
  - `fetchGoogleTrends()` - Real Google Trends API integration
  - `determineTrendStatus()` - Classification algorithm
  - `generateAISummary()` - OpenAI integration (optional)

### Data Flow
```
User Input
    ↓
Frontend sends POST /api/analyze
    ↓
Backend validates input
    ↓
Fetches Google Trends data
    ↓
Calculates trend status
    ↓
Generates AI summary (if configured)
    ↓
Returns JSON response
    ↓
Frontend renders dashboard with chart
```

---

## 📊 How Trend Status is Calculated

The algorithm compares the **recent 3 days** vs **earlier 3 days** of Google Trends data:

```typescript
const recentAvg = last 3 days average
const earlierAvg = first 3 days average
const percentChange = ((recentAvg - earlierAvg) / earlierAvg) * 100

if (percentChange > 50)  → "Exploding"
if (percentChange > 15)  → "Rising"
if (percentChange < -15) → "Declining"
else                     → "Stable"
```

---

## 🛠️ Code Comments Explaining Removed Features

In `server/services/trend-analyzer.ts`, you'll find comments like:

```typescript
// REMOVED: Reddit and Twitter/X functionality
// If you want to re-add Reddit in the future:
// - Install 'snoowrap' package
// - Add REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET env vars
// - Implement fetchRedditData() function similar to fetchGoogleTrends()
// - Add reddit field back to TrendAnalysisResult interface
```

This makes it easy to re-add platforms later if needed.

---

## 🧪 Testing Guide

### Test 1: Basic Functionality (No API Keys)
1. Search for "Bitcoin"
2. Verify you see:
   - ✅ Google Trends line chart
   - ✅ Trend status badge (e.g., "Rising")
   - ✅ Generic summary text
   - ✅ Related topics

### Test 2: With OpenAI Key
1. Add `OPENAI_API_KEY` to Secrets
2. Restart app
3. Search for "Artificial Intelligence"
4. Verify summary sounds intelligent and specific (not generic)

### Test 3: API Direct Test
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"topic": "SpaceX"}'
```

Should return valid JSON with Google Trends data.

### Test 4: Health Check
```bash
curl http://localhost:5000/api/health
```

Should return `{"status": "ok", ...}`

---

## 🐛 Troubleshooting

### Problem: Generic summaries instead of AI
**Cause:** OpenAI API key not configured  
**Solution:** Add `OPENAI_API_KEY` to Replit Secrets and restart

### Problem: "Failed to analyze trend" error
**Cause:** Google Trends API rate limit or network issue  
**Solution:** Wait 1-2 minutes and try again. App has fallback data.

### Problem: Chart not displaying
**Cause:** Data format issue  
**Solution:** Check browser console (F12) for errors. Restart app.

### Problem: Port 5000 already in use
**Cause:** Previous instance still running  
**Solution:** Click Stop, wait 5 seconds, then Run again

---

## 📝 What Changed in v2.0

### Removed:
- ❌ Reddit API integration
- ❌ Twitter/X API integration
- ❌ Reddit hot posts tab
- ❌ Twitter/X tweets tab
- ❌ `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `TWITTER_BEARER_TOKEN` environment variables

### Kept:
- ✅ All visual styling (dark theme, neon accents, fonts)
- ✅ Google Trends integration
- ✅ Trend classification algorithm
- ✅ OpenAI AI summaries (optional)
- ✅ Related topics
- ✅ Modular architecture for future additions

### Improved:
- Better empty state UI
- Clearer documentation
- Simpler setup process
- Enhanced Google Trends chart

---

## 🚀 Deployment

### Deploy on Replit:
1. Click **Deploy** button (top-right)
2. Choose deployment settings
3. Your app goes live at: `https://your-project.replit.app`

### Custom Domain (Optional):
1. In Replit deployment settings, add custom domain
2. Update your DNS records as instructed
3. Access via your own domain

---

## 🔐 Security Features

✅ **No API keys in frontend code**  
✅ **Environment variables for all secrets**  
✅ **Input validation** (topic length limits)  
✅ **Error handling** with fallback data  
✅ **CORS configured** for safe embedding  

---

## 📚 File Reference

**Backend Files:**
- `server/services/trend-analyzer.ts` - Main business logic (Google Trends + AI)
- `server/routes.ts` - API endpoint definitions
- `server/app.ts` - Express configuration

**Frontend Files:**
- `client/src/pages/home.tsx` - Landing page
- `client/src/components/trend-dashboard.tsx` - Results display
- `client/src/components/search-input.tsx` - Search bar
- `client/src/lib/api.ts` - API client
- `client/src/index.css` - Tailwind styling (Dark Cyber Theme)

**Documentation:**
- `README.md` - Overview and quick start
- `SETUP_INSTRUCTIONS.md` - This file (detailed setup)

---

## 💡 Pro Tips

1. **Test with trending topics** for best results (e.g., current events, viral trends)
2. **Add OpenAI key** for much better summaries
3. **Embed in iframe** for seamless integration in your website
4. **Check /api/health** to verify which features are active
5. **Monitor console logs** if something doesn't work as expected

---

**Ready to deploy! 🚀**  
Your Google Trends analyzer is fully functional and ready for production use.
