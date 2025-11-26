# Crazedo AI Trend Analyzer - Complete Setup Guide

## 🎯 Overview
A fully functional AI-powered trend analysis tool that fetches real-time data from Google Trends, Reddit, and Twitter/X APIs, then uses OpenAI to generate intelligent summaries.

---

## 🔑 API Keys Configuration

### Required API Keys

#### 1. **OpenAI API Key** (Required for AI Summaries)
- Get your API key from: https://platform.openai.com/api-keys
- **Set in Replit:**
  1. Click on "Secrets" in the left sidebar (🔒 icon)
  2. Add a new secret:
     - **Key:** `OPENAI_API_KEY`
     - **Value:** `sk-proj-...` (your OpenAI API key)

**Note:** The app will work without this, but summaries will be generic instead of AI-generated.

---

#### 2. **Reddit API Credentials** (Optional but Recommended)
- Create a Reddit app at: https://www.reddit.com/prefs/apps
- Click "Create App" or "Create Another App"
- Select "script" as the app type
- Note down your credentials

**Set in Replit Secrets:**
- `REDDIT_CLIENT_ID` = (your client ID from Reddit)
- `REDDIT_CLIENT_SECRET` = (your client secret from Reddit)
- `REDDIT_USER_AGENT` = `Crazedo Trend Analyzer v1.0` (or any custom name)
- `REDDIT_USERNAME` = (your Reddit username - optional)
- `REDDIT_PASSWORD` = (your Reddit password - optional)

**Note:** Without Reddit credentials, the app will show fallback/sample Reddit data.

---

#### 3. **Twitter/X API** (Currently Not Implemented)
The Twitter/X API requires elevated access and is not currently implemented due to Twitter's API restrictions. The UI shows a placeholder for this feature.

To add Twitter support in the future:
- Apply for Twitter Developer access at: https://developer.twitter.com/
- Add environment variables:
  - `TWITTER_BEARER_TOKEN`
  - `TWITTER_API_KEY`
  - `TWITTER_API_SECRET`

---

## 🚀 How to Run the Application

### On Replit:
1. Open your Replit project
2. Click the "Run" button at the top
3. The app will start automatically
4. Access the app through the Webview panel

### Locally (if cloned):
```bash
npm install
npm run dev
```
The app will be available at `http://localhost:5000`

---

## 📊 How It Works

1. **User Input:** Enter any topic in the search box (e.g., "Artificial Intelligence", "Bitcoin", "Climate Change")
2. **Data Collection:**
   - **Google Trends:** Fetches real search interest over the past 7 days
   - **Reddit:** Searches for hot posts related to the topic
   - **Twitter/X:** Placeholder (not yet implemented)
3. **AI Analysis:** OpenAI generates a concise summary explaining why the topic is trending
4. **Visualization:** Interactive dashboard with:
   - Trend status badge (Exploding, Rising, Stable, Declining)
   - AI-generated summary
   - Line chart of search interest
   - Related topics
   - Social media feed tabs

---

## 🌐 Embedding in Your Website (iframe Method)

To embed this tool in your Crazedo website, add this code to your HTML:

```html
<iframe 
  src="https://your-replit-project-url.replit.app" 
  width="100%" 
  height="900px" 
  style="border: none; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);"
  allow="clipboard-read; clipboard-write"
  title="Crazedo AI Trend Analyzer"
></iframe>
```

**Replace** `https://your-replit-project-url.replit.app` with your actual Replit deployment URL.

### Responsive Embed (Optional):
```html
<div style="position: relative; width: 100%; padding-bottom: 75%; overflow: hidden;">
  <iframe 
    src="https://your-replit-project-url.replit.app"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
    allow="clipboard-read; clipboard-write"
    title="Crazedo AI Trend Analyzer"
  ></iframe>
</div>
```

---

## 🛠️ Technical Architecture

### Backend (`server/`)
- **Framework:** Express.js
- **API Endpoint:** `POST /api/analyze`
- **Services:**
  - `trend-analyzer.ts` - Main logic for fetching and analyzing trend data
  - Google Trends integration (real-time data)
  - Reddit API integration (via Snoowrap)
  - OpenAI integration (AI summaries)

### Frontend (`client/`)
- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS (Dark Cyber theme with neon accents)
- **Charts:** Recharts for data visualization
- **Animations:** Framer Motion
- **State Management:** React hooks

### Data Flow:
```
User Input → API Request → Backend Services → External APIs → AI Analysis → JSON Response → Frontend Display
```

---

## 📦 API Response Format

The backend returns JSON in this format:

```json
{
  "topic": "Artificial Intelligence",
  "status": "Exploding",
  "summary": "AI-generated trend summary...",
  "sources": {
    "google": {
      "interest_over_time": [
        { "date": "Mon", "value": 45 },
        { "date": "Tue", "value": 67 }
      ],
      "related_queries": ["AI news", "ChatGPT", "Machine Learning"]
    },
    "reddit": {
      "top_posts": [
        {
          "title": "Post Title",
          "subreddit": "r/technology",
          "score": 1234,
          "url": "https://reddit.com/..."
        }
      ],
      "sentiment": "Positive"
    },
    "twitter": null
  },
  "related_topics": ["Machine Learning", "ChatGPT", "Neural Networks"]
}
```

---

## 🔍 Health Check Endpoint

Check if the API is running and which integrations are configured:

```bash
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-26T...",
  "integrations": {
    "openai": true,
    "reddit": false
  }
}
```

---

## 🎨 Customization Guide

### Change Color Theme:
Edit `client/src/index.css` and modify the CSS variables under `@theme inline`

### Add New Data Sources:
1. Add integration logic to `server/services/trend-analyzer.ts`
2. Update the `TrendAnalysisResult` interface
3. Add new tab in `client/src/components/trend-dashboard.tsx`

### Modify AI Prompt:
Edit the `generateAISummary` function in `server/services/trend-analyzer.ts`

---

## 📝 Troubleshooting

### "Missing credentials" error:
- Make sure you've added `OPENAI_API_KEY` to Replit Secrets
- Restart the application after adding secrets

### No Reddit data:
- Add Reddit API credentials to Replit Secrets
- The app will use fallback data if credentials are missing

### Google Trends data looks random:
- Google Trends API sometimes has rate limits
- The app uses fallback data when the API is unavailable

---

## 🚀 Deployment

To make your app publicly accessible:
1. Click "Publish" in Replit (top right)
2. Your app will be live at: `https://your-project.replit.app`
3. Use this URL for embedding

---

## 📞 Support

For questions or issues:
- Check the browser console for error messages
- Verify all API keys are correctly set in Replit Secrets
- Make sure the workflow is running (check the "Start application" status)

---

**Built with ❤️ for Crazedo | Powered by OpenAI, Google Trends, and Reddit**
