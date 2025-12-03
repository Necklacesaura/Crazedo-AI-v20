import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SearchInput } from "@/components/search-input";
import { analyzeTrend, TrendData } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Zap, TrendingUp, Download, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const EXAMPLE_SEARCHES = ["AI", "Bitcoin", "Climate Change", "Taylor Swift", "Stock Market"];

export default function ScraperTool() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<TrendData | null>(null);
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
    
    setIsLoading(true);
    try {
      const result = await analyzeTrend(term);
      setData(result);
      
      // Save to history
      const updated = [term, ...searchHistory.filter(t => t !== term)].slice(0, 10);
      setSearchHistory(updated);
      localStorage.setItem('scraperHistory', JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to analyze trend", error);
      toast.error("Failed to analyze trend", {
        description: error instanceof Error ? error.message : "Please try again later"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportJSON = () => {
    if (!data) return;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trends-${data.topic}-${Date.now()}.json`;
    a.click();
    toast.success("Exported as JSON");
  };

  const exportCSV = () => {
    if (!data) return;
    let csv = "Date,Interest Score\n";
    data.sources.google.interest_over_time.forEach(item => {
      csv += `"${item.date}",${item.value}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trends-${data.topic}-${Date.now()}.csv`;
    a.click();
    toast.success("Exported as CSV");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/")}
          className="mb-8 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-cyan-400">🔍 Google Trends Scraper</h1>
          <p className="text-slate-400">Extract and analyze real Google Trends data</p>
        </div>

        <div className="mb-8">
          <SearchInput
            onSearch={handleSearch}
            isLoading={isLoading}
          />
        </div>

        {/* Examples */}
        {!data && (
          <div className="mb-8 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-3 text-cyan-300 text-sm font-semibold">
              <Zap className="w-4 h-4" />
              Quick examples:
            </div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_SEARCHES.map(example => (
                <button
                  key={example}
                  onClick={() => handleSearch(example)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-sm transition disabled:opacity-50"
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
          <div className="mb-8 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-3 text-emerald-300 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              Recent:
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map(term => (
                <button
                  key={term}
                  onClick={() => handleSearch(term)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-sm transition disabled:opacity-50"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {data && (
          <div className="space-y-6">
            {/* Header with Export */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">{data.topic}</h2>
                <Badge className="bg-cyan-600">{data.status}</Badge>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportJSON}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center gap-2 transition"
                  data-testid="button-export-json"
                >
                  <Download className="w-4 h-4" />
                  JSON
                </button>
                <button
                  onClick={exportCSV}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center gap-2 transition"
                  data-testid="button-export-csv"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
              </div>
            </div>

            {/* Interest Over Time Chart */}
            {data.sources.google.interest_over_time.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-cyan-300">Interest Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.sources.google.interest_over_time}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#94a3b8"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #0891b2' }}
                        labelStyle={{ color: '#06b6d4' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#06b6d4" 
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Related Topics */}
            {data.related_topics.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-emerald-300 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Related Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {data.related_topics.slice(0, 10).map((topic, i) => (
                      <div key={i} className="p-3 rounded bg-slate-700/50 flex justify-between items-center">
                        <span className="text-slate-200">{topic}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Regional Interest */}
            {data.sources.google.interest_by_region.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-300">Interest by Region</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {data.sources.google.interest_by_region.slice(0, 12).map((item, i) => (
                      <div key={i} className="p-3 rounded bg-slate-700/50 text-center">
                        <div className="text-slate-300 text-sm">{item.region}</div>
                        <div className="text-cyan-400 font-bold">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Queries */}
            {data.sources.google.related_queries.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-purple-300">Related Queries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {data.sources.google.related_queries.slice(0, 15).map((query, i) => (
                      <div key={i} className="p-3 rounded bg-slate-700/50 flex justify-between items-center">
                        <span className="text-slate-200 text-sm">{query}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {!data && !isLoading && (
          <div className="mt-12 p-8 rounded-lg bg-slate-800/50 border border-slate-700 text-center">
            <p className="text-slate-400">Enter a search term to analyze Google Trends data</p>
          </div>
        )}
      </div>
    </div>
  );
}
