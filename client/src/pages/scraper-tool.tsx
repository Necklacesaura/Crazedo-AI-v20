import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SearchInput } from "@/components/search-input";
import { TrendDashboard } from "@/components/trend-dashboard";
import { analyzeTrend, TrendData } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Zap, TrendingUp } from "lucide-react";

const EXAMPLE_SEARCHES = ["AI", "Bitcoin", "Climate Change", "Taylor Swift", "Stock Market"];

export default function ScraperTool() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<TrendData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('scraperHistory') || '[]');
    setSearchHistory(saved);
  }, []);

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    
    setSearchTerm(term);
    setIsLoading(true);
    try {
      const result = await analyzeTrend(term);
      setData(result);
      
      // Save to history
      const updated = [term, ...searchHistory.filter(t => t !== term)].slice(0, 10);
      setSearchHistory(updated);
      localStorage.setItem('scraperHistory', JSON.stringify(updated));
      
      toast.success(`Analyzed "${term}"`, {
        description: `Status: ${result.status}`
      });
    } catch (error) {
      console.error("Failed to analyze trend", error);
      toast.error("Failed to analyze trend", {
        description: error instanceof Error ? error.message : "Please try again later"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/")}
          className="mb-8 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition font-semibold"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent font-orbitron">
            🔍 Google Trends Scraper
          </h1>
          <p className="text-xl text-slate-300 font-space-grotesk">
            Search any topic to analyze real Google Trends data with interest patterns and AI insights.
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-8">
          <SearchInput
            onSearch={handleSearch}
            isLoading={isLoading}
          />
        </div>

        {/* Example Searches */}
        {!data && !searchTerm && (
          <div className="mb-8 p-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <h3 className="text-sm font-semibold text-cyan-300 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Try these examples:
            </h3>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_SEARCHES.map((example) => (
                <button
                  key={example}
                  onClick={() => handleSearch(example)}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 hover:text-cyan-100 transition disabled:opacity-50 text-sm font-medium"
                  data-testid={`button-example-${example.toLowerCase()}`}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search History */}
        {searchHistory.length > 0 && !data && (
          <div className="mb-8 p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <h3 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Recent searches:
            </h3>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSearch(term)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 hover:text-emerald-100 transition disabled:opacity-50 text-sm"
                  data-testid={`button-history-${term.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {data && <TrendDashboard data={data} />}

        {/* Empty State */}
        {!data && !isLoading && !searchTerm && (
          <div className="mt-12 p-8 rounded-lg bg-slate-800/50 border border-slate-700 text-center">
            <p className="text-slate-400 text-lg mb-2">Search any topic to get started</p>
            <p className="text-slate-500 text-sm">Analyze interest patterns, trends, and get AI-powered insights</p>
          </div>
        )}
      </div>
    </div>
  );
}
