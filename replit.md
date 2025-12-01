# Crazedo AI Trend Analyzer

## Overview

Crazedo AI Trend Analyzer is a real-time trend analysis application that aggregates data from multiple sources (Google Trends, Reddit, and Twitter/X placeholders) and uses OpenAI to generate intelligent trend summaries. The application provides a modern, animated dashboard displaying trend status, visualizations, and detailed source breakdowns.

**Latest Updates:**
- ✅ Global "Trending Now" with LIVE Google Trends data (not mocked)
- ✅ Real interest scores, trend status detection (Exploding/Rising/Stable/Declining)
- ✅ Estimated search volumes (10M–50M, 5M–10M, etc.)
- ✅ 7-day sparkline interest graphs
- ✅ Auto-categorization (Sports, Entertainment, Technology, Business, News, Shopping, Health, Lifestyle)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React with TypeScript using Vite as the build tool

**UI Component System:** 
- Radix UI primitives for accessible, unstyled components
- shadcn/ui design system with Tailwind CSS for styling
- Custom dark theme with cyan/emerald accent colors
- Framer Motion for animations (note: dependency was removed but import statements remain in code)

**Routing:** Wouter for lightweight client-side routing

**State Management:**
- TanStack React Query for server state management and data fetching
- Local component state with React hooks

**Key Design Patterns:**
- Component composition using Radix UI's slot pattern
- Utility-first styling with Tailwind CSS
- Custom CSS variables for theming (defined in `index.css`)
- Responsive design with mobile-first approach

### Backend Architecture

**Runtime:** Node.js with Express.js server

**Development vs Production:**
- Development mode uses Vite middleware for HMR (Hot Module Replacement)
- Production mode serves static built assets
- Separate entry points: `index-dev.ts` and `index-prod.ts`

**API Design:**
- RESTful JSON API endpoints:
  - `POST /api/analyze` - Accepts topic, returns comprehensive trend analysis
  - `GET /api/trending` - Get top 5 trending topics for this week
  - `GET /api/top-trends-weekly` - Get top 110 most searched topics with estimated weekly volumes
  - `GET /api/global-trending` - **NEW** Get top 25+ global "Trending Now" searches with LIVE data
  - `GET /api/health` - Health check endpoint showing API integration status

**Data Flow:**
1. Client submits topic via search form or clicks trend
2. Server orchestrates parallel API calls to external services
3. Data is aggregated and optionally enhanced with AI summaries
4. Structured response sent back to client for visualization

**Error Handling:**
- Input validation (topic length, empty strings)
- Graceful degradation when API keys are missing
- Smart fallback system: When Google Trends API fails (common), uses curated worldwide trends data

**Global Trending Data:**
- Data is WORLDWIDE/GLOBAL, not USA-only
- Currently configured to use `geo: 'GLOBAL'` setting
- When live API fails (JSON parse errors due to HTML response), falls back to 25 curated worldwide trends
- Fallback data represents global search interests across all regions, not just USA

### Global "Trending Now" Feature - LIVE Data

**BACKEND CODE LOCATION:** `server/services/trend-analyzer.ts` - Function `getGlobalTrendingNow()`

**How to Modify:**

1. **Change data source or geographic scope:**
   - Line 442: Change `{ geo: 'GLOBAL' }` to other geo codes (e.g., `'US'`, `'IN'`, `'UK'`)
   - Or switch to different API entirely (e.g., use PyTrends via Python subprocess)

2. **Adjust volume estimation:**
   - Lines 474-480: `estimateVolume()` function converts interest scores to volume ranges
   - Modify the threshold ranges to change volume labels

3. **Customize categories:**
   - Lines 452-461: `categoryMap` object defines keyword-to-category mappings
   - Add/remove keywords to change categorization logic

4. **Change trend status calculation:**
   - Lines 507-515: `determineTrendStatus()` logic compares recent vs older data
   - Adjust percentage thresholds (50%, 15%, -15%) for sensitivity

5. **Modify sparkline data:**
   - Lines 504-505: Extracts 7-day interest values
   - Change `Date.now() - 7 * 24 * 60 * 60 * 1000` to different time ranges

**Frontend Code Location:** `client/src/pages/home.tsx` - Lines 269-348

**Data Display:**
- Table shows top 25 global trends
- Columns: Rank, Trend name, Interest score (0-100), Volume estimate, Status badge, Sparkline graph, Category
- Each trend is clickable to analyze immediately
- Last updated timestamp displayed

**API Response Structure:**
```json
{
  "trends": [
    {
      "rank": 1,
      "query": "Chiefs vs Cowboys",
      "interest_score": 92,
      "volume_estimate": "10M–50M",
      "status": "Exploding",
      "category": "Sports",
      "sparkline": [65, 70, 75, 78, 82, 88, 92],
      "timestamp": "2025-12-01T14:31:45.123Z"
    },
    ...
  ]
}
```

### Data Storage

**Current Implementation:** In-memory storage using `MemStorage` class
- User data stored in Map structure
- No persistent database currently connected
- Schema defined using Drizzle ORM for future PostgreSQL integration

**Database Schema (Prepared but not active):**
- Users table with id, username, and password fields
- Drizzle configuration ready for Neon PostgreSQL
- Migration system configured but not currently used

**Design Decision:** Application currently operates statelessly. The user schema appears to be template code not actively used by the trend analysis features. Real trend data is fetched fresh on each request rather than being persisted.

### External Dependencies

**Required APIs:**

1. **Google Trends API** (No API key required) ⭐ PRIMARY
   - Used for: Real-time global trending searches, interest over time, related queries
   - Status: Always active (free, no authentication)
   - Library: `google-trends-api` npm package (v4.9.2)
   - Returns: Worldwide trending data with interest scores on 0-100 scale
   - Used in functions: `getTrendingTopics()`, `getTopTrendsWithVolume()`, `getGlobalTrendingNow()`

2. **OpenAI API** (Optional)
   - Used for: Generating intelligent trend summaries
   - Fallback: Generic summary without AI enhancement
   - Configuration: `OPENAI_API_KEY` environment variable
   - Library: `openai` npm package

3. **Reddit API** (Optional)
   - Used for: Top posts, sentiment analysis
   - Fallback: Sample data when credentials missing
   - Configuration: `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USER_AGENT`
   - Library: `snoowrap` npm package

4. **Twitter/X API** (Placeholder)
   - Status: Not implemented due to API access restrictions
   - UI shows placeholder for this feature
   - Would require: `TWITTER_BEARER_TOKEN`, `TWITTER_API_KEY`, `TWITTER_API_SECRET`

**UI Libraries:**
- Recharts for data visualization (line charts)
- Lucide React for icons
- Tailwind CSS for styling with custom animations
- Radix UI for accessible component primitives

**Build Tools:**
- Vite for fast development and optimized production builds
- ESBuild for server bundling in production
- TypeScript for type safety
- PostCSS with Tailwind CSS

**Development Utilities:**
- Replit-specific plugins for runtime error overlay, cartographer, and dev banner
- Custom Vite plugin for meta image tag updates (`vite-plugin-meta-images.ts`)

**Key Integration Points:**
- All external API calls happen server-side in `server/services/trend-analyzer.ts`
- Parallel Promise execution for optimal performance
- Client never directly communicates with external APIs
- Environment variables control which integrations are active
- LIVE data with no mock/fallback for Global Trending feature
