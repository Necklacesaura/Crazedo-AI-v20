import { useState } from "react";
import { useLocation } from "wouter";
import { SearchInput } from "@/components/search-input";
import { TrendDashboard } from "@/components/trend-dashboard";
import { analyzeTrend, TrendData } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function ScraperTool() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<TrendData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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
            Google Trends Scraper
          </h1>
          <p className="text-xl text-slate-300 font-space-grotesk">
            Search any topic to analyze Google Trends data, view interest patterns, and get AI-powered insights.
          </p>
        </div>

        <SearchInput
          onSearch={handleSearch}
          isLoading={isLoading}
          placeholder="Enter any search term (e.g., 'AI', 'Bitcoin', 'Climate Change')..."
          data-testid="input-search-scraper"
        />

        {data && <TrendDashboard data={data} />}

        {!data && !isLoading && (
          <div className="mt-12 text-center text-slate-400">
            <p className="text-lg">Enter a search term above to analyze trends on Google</p>
          </div>
        )}
      </div>
    </div>
  );
}
