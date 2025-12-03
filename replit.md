# Crazedo AI Trend Analyzer

## Overview

Crazedo AI Trend Analyzer is a real-time trend analysis application that aggregates data from multiple sources (Google Trends, Reddit, and Twitter/X placeholders) and uses OpenAI to generate intelligent trend summaries. The application provides a modern, animated dashboard displaying trend status, visualizations, and detailed source breakdowns.

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
- RESTful JSON API with two main endpoints:
  - `POST /api/analyze` - Accepts topic, returns comprehensive trend analysis
  - `GET /api/health` - Health check endpoint showing API integration status

**Data Flow:**
1. Client submits topic via search form
2. Server orchestrates parallel API calls to external services
3. Data is aggregated and optionally enhanced with AI summaries
4. Structured response sent back to client for visualization

**Error Handling:**
- Input validation (topic length, empty strings)
- Graceful degradation when API keys are missing
- Fallback data for missing integrations

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

1. **OpenAI API** (Optional)
   - Used for: Generating intelligent trend summaries
   - Fallback: Generic summary without AI enhancement
   - Configuration: `OPENAI_API_KEY` environment variable
   - Library: `openai` npm package

2. **Google Trends API**
   - Used for: Historical interest over time data and related queries
   - Status: Always active (no API key required)
   - Library: `google-trends-api` npm package
   - Returns: Time series data and related search queries

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
- All external API calls happen server-side in `trend-analyzer.ts`
- Parallel Promise execution for optimal performance
- Client never directly communicates with external APIs
- Environment variables control which integrations are active