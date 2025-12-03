import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SearchInput } from "@/components/search-input";
import { analyzeTrend, TrendData } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Zap, TrendingUp, Download, BarChart3, TrendingDown, Activity, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-cyan-400">🔍 Google Trends Scraper</h1>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-3 h-3 rounded-full bg-green-500"
              data-testid="indicator-live"
            />
            <span className="text-xs text-green-400 font-semibold">LIVE</span>
          </div>
          <p className="text-slate-400">Extract and analyze real Google Trends data with instant search interest analytics</p>
        </div>

        <div className="mb-8">
          <SearchInput
            onSearch={handleSearch}
            isLoading={isLoading}
          />
        </div>

        {/* Results */}
        {data && (
          <div className="space-y-6">
            {/* Header with Export */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{data.topic}</h2>
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

            {/* Quick Stats */}
            {data.sources.google.interest_over_time.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-cyan-600/20 to-cyan-900/20 border-cyan-500/50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-xs text-cyan-300 mb-1 uppercase font-semibold">Peak Interest</div>
                      <div className="text-3xl font-bold text-cyan-400">{Math.max(...data.sources.google.interest_over_time.map(d => d.value))}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 border-emerald-500/50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-xs text-emerald-300 mb-1 uppercase font-semibold">Current</div>
                      <div className="text-3xl font-bold text-emerald-400">{data.sources.google.interest_over_time[data.sources.google.interest_over_time.length - 1]?.value || 0}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className={`bg-gradient-to-br ${
                  data.status === 'Exploding' || data.status === 'Rising' 
                    ? 'from-orange-600/20 to-orange-900/20 border-orange-500/50' 
                    : data.status === 'Declining'
                    ? 'from-red-600/20 to-red-900/20 border-red-500/50'
                    : 'from-slate-600/20 to-slate-900/20 border-slate-500/50'
                }`}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-xs text-slate-300 mb-1 uppercase font-semibold">Trend</div>
                      <div className="flex items-center justify-center gap-1">
                        {(data.status === 'Exploding' || data.status === 'Rising') && <TrendingUp className="w-5 h-5 text-orange-400" />}
                        {data.status === 'Declining' && <TrendingDown className="w-5 h-5 text-red-400" />}
                        {data.status === 'Stable' && <Activity className="w-5 h-5 text-slate-400" />}
                        <span className="font-bold text-slate-200">{data.status}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 border-purple-500/50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-xs text-purple-300 mb-1 uppercase font-semibold">Data Points</div>
                      <div className="text-3xl font-bold text-purple-400">{data.sources.google.interest_over_time.length}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

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

            {/* Top Trending Topics & Queries */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-emerald-300 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Top Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Top Related Topics */}
                  {data.related_topics.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-emerald-400 mb-2 uppercase">Related Topics</div>
                      <div className="grid gap-2">
                        {data.related_topics.slice(0, 8).map((topic, i) => (
                          <div key={i} className="p-2.5 rounded bg-slate-700/50 flex justify-between items-center">
                            <span className="text-slate-200 text-sm">{topic}</span>
                            <Badge variant="outline" className="text-emerald-400">Top</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

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

            {/* Top & Rising Queries */}
            {data.sources.google.related_queries.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-purple-300">Trending Queries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Top Queries */}
                    <div>
                      <div className="text-xs font-semibold text-purple-400 mb-2 uppercase flex items-center gap-2">
                        <span>🔝 Top Queries</span>
                        <Badge className="bg-purple-600 text-xs">Popular</Badge>
                      </div>
                      <div className="grid gap-2">
                        {data.sources.google.related_queries.slice(0, 8).map((query, i) => (
                          <div key={i} className="p-2.5 rounded bg-slate-700/50 flex justify-between items-center">
                            <span className="text-slate-200 text-sm">{query}</span>
                            <Badge variant="outline" className="text-purple-400 text-xs">Top</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rising Queries */}
                    {data.sources.google.related_queries.length > 8 && (
                      <div>
                        <div className="text-xs font-semibold text-red-400 mb-2 uppercase flex items-center gap-2">
                          <span>📈 Rising Queries</span>
                          <Badge className="bg-red-600 text-xs">Trending</Badge>
                        </div>
                        <div className="grid gap-2">
                          {data.sources.google.related_queries.slice(8, 15).map((query, i) => (
                            <div key={i} className="p-2.5 rounded bg-slate-700/50 flex justify-between items-center">
                              <span className="text-slate-200 text-sm">{query}</span>
                              <Badge variant="outline" className="text-red-400 text-xs">Rising</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Keyword Suggestions - After Search */}
            {data.related_topics.length > 0 && (
              <div className="mt-8 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-3 text-purple-300 text-sm font-semibold">
                  <Sparkles className="w-4 h-4" />
                  Related Keywords:
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.related_topics.map((keyword, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearch(keyword)}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-sm transition disabled:opacity-50"
                      data-testid={`button-keyword-${keyword.toLowerCase().replace(/\s/g, '-')}`}
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>
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
