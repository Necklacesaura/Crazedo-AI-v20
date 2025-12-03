import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp, Globe, Search, BarChart3, Loader, Star, Download, X, Eye, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, BarChart, Bar, ComposedChart, Area, AreaChart, ScatterChart, Scatter } from "recharts";
import { toast } from "sonner";
import type { GlobalTrend } from "@/lib/api";

export default function TrendsIntelligence() {
  const [, navigate] = useLocation();
  const [globalTrends, setGlobalTrends] = useState<GlobalTrend[]>([]);
  const [selectedTrends, setSelectedTrends] = useState<GlobalTrend[]>([]);
  const [trendAnalysis, setTrendAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  // Fetch global trending on mount
  useEffect(() => {
    const fetchGlobalTrends = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/global-trending");
        const data = await response.json();
        setGlobalTrends(data.trends || []);
      } catch (error) {
        console.error("Error fetching global trends:", error);
        toast.error("Failed to load global trends");
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalTrends();
    // Refresh every 5 minutes
    const interval = setInterval(fetchGlobalTrends, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchOrAnalyze = async (query: string) => {
    if (!query.trim()) {
      toast.error("Please enter a keyword");
      return;
    }

    try {
      setAnalyzing(true);
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: query.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Analysis failed");
      }

      const data = await response.json();
      setTrendAnalysis(data);
      setSearchInput("");
      toast.success(`Analysis complete for "${query}"`);
    } catch (error) {
      console.error("Error analyzing trend:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze trend");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTrendClick = (trend: GlobalTrend) => {
    if (comparisonMode) {
      setSelectedTrends(prev =>
        prev.find(t => t.query === trend.query)
          ? prev.filter(t => t.query !== trend.query)
          : [...prev, trend]
      );
    } else {
      handleSearchOrAnalyze(trend.query);
    }
  };

  const toggleFavorite = (query: string) => {
    setFavorites(prev =>
      prev.includes(query)
        ? prev.filter(q => q !== query)
        : [...prev, query]
    );
  };

  const exportTrends = () => {
    const data = globalTrends.map(t => ({
      rank: t.rank,
      query: t.query,
      interest_score: t.interest_score,
      volume_estimate: t.volume_estimate,
      status: t.status,
      category: t.category,
    }));
    
    const csv = [
      ["Rank", "Query", "Interest Score", "Volume Estimate", "Status", "Category"],
      ...data.map(d => [d.rank, d.query, d.interest_score, d.volume_estimate, d.status, d.category])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crazedo-trends-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Exported as CSV");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Exploding":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "Rising":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "Stable":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      case "Declining":
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Exploding":
        return "🚀";
      case "Rising":
        return "📈";
      case "Stable":
        return "➡️";
      case "Declining":
        return "📉";
      default:
        return "•";
    }
  };

  const filteredTrends = categoryFilter
    ? globalTrends.filter(t => t.category === categoryFilter)
    : globalTrends;

  const uniqueCategories = Array.from(new Set(globalTrends.map(t => t.category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5 text-cyan-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
                <Zap className="w-8 h-8" />
                Crazedo Trends
              </h1>
              <p className="text-slate-400 text-sm">Live global trend analysis & insights</p>
            </div>
          </div>
          <button
            onClick={exportTrends}
            className="px-4 py-2 rounded bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-300 text-sm transition flex items-center gap-2"
            data-testid="button-export"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Search Bar */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search any topic..."
                className="flex-1 px-4 py-3 rounded bg-slate-700/50 border border-slate-600 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                onKeyPress={(e) => e.key === "Enter" && handleSearchOrAnalyze(searchInput)}
                data-testid="input-search"
                disabled={analyzing}
              />
              <button
                onClick={() => handleSearchOrAnalyze(searchInput)}
                disabled={analyzing}
                className="px-6 py-3 rounded bg-cyan-500/30 hover:bg-cyan-500/40 text-cyan-300 font-semibold transition disabled:opacity-50"
                data-testid="button-search"
              >
                {analyzing ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </button>
            </div>

            {/* Category Filter & Comparison Toggle */}
            <div className="flex gap-2 items-center flex-wrap">
              <div className="flex gap-1 items-center">
                <span className="text-xs text-slate-400">Filter:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2 py-1 rounded bg-slate-700/50 border border-slate-600 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                  data-testid="select-category"
                >
                  <option value="">All Categories</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  setComparisonMode(!comparisonMode);
                  setSelectedTrends([]);
                }}
                className={`px-3 py-1 rounded text-xs transition ${
                  comparisonMode
                    ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                }`}
                data-testid="toggle-comparison"
              >
                {comparisonMode ? "✓ Compare Mode" : "Compare Mode"}
              </button>
              {selectedTrends.length > 0 && (
                <span className="text-xs text-slate-400">{selectedTrends.length} selected</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Trending List */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-emerald-300 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Trending Now
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  {filteredTrends.length} trends
                </p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader className="w-5 h-5 animate-spin mx-auto text-cyan-400" />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {filteredTrends.slice(0, 25).map((trend, i) => (
                      <button
                        key={i}
                        onClick={() => handleTrendClick(trend)}
                        className={`w-full text-left p-3 rounded border transition ${
                          selectedTrends.find(t => t.query === trend.query)
                            ? "bg-purple-500/20 border-purple-500/50"
                            : "bg-slate-700/50 border-slate-600 hover:border-cyan-500/50"
                        }`}
                        data-testid={`trend-${trend.query}`}
                        disabled={analyzing}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <div className="flex-1">
                            <div className="font-semibold text-slate-200 text-sm line-clamp-2">
                              {trend.query}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              Score: {trend.interest_score}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(trend.query);
                            }}
                            className="p-1 hover:bg-slate-600/50 rounded"
                            data-testid={`favorite-${trend.query}`}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                favorites.includes(trend.query)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-slate-500"
                              }`}
                            />
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge className={`text-xs ${getStatusColor(trend.status)}`}>
                            {getStatusIcon(trend.status)} {trend.status}
                          </Badge>
                          <span className="text-xs text-slate-400">{trend.category}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-3 space-y-6">
            {comparisonMode && selectedTrends.length > 0 ? (
              <>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-purple-300">
                      Comparing {selectedTrends.length} Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {selectedTrends.map((trend, i) => (
                        <div key={i} className="p-4 rounded bg-slate-700/50 border border-slate-600">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-slate-200">{trend.query}</h3>
                            <button onClick={() => setSelectedTrends(prev => prev.filter((_, idx) => idx !== i))}>
                              <X className="w-4 h-4 text-slate-400" />
                            </button>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Interest Score</span>
                              <span className="text-cyan-300 font-bold">{trend.interest_score}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Volume</span>
                              <span className="text-emerald-300">{trend.volume_estimate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Status</span>
                              <Badge className={`text-xs ${getStatusColor(trend.status)}`}>
                                {trend.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedTrends.length > 1 && selectedTrends[0].sparkline && (
                      <div className="h-64 bg-slate-700/30 rounded-lg p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={selectedTrends[0].sparkline.map((val, idx) => ({
                              day: idx + 1,
                              ...Object.fromEntries(selectedTrends.map(t => [t.query, t.sparkline[idx]]))
                            }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="day" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: "#1e293b" }} />
                            <Legend />
                            {selectedTrends.map((trend, i) => (
                              <Line
                                key={i}
                                type="monotone"
                                dataKey={trend.query}
                                stroke={["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b"][i % 4]}
                                strokeWidth={2}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : trendAnalysis ? (
              <>
                {/* Trend Overview */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-2xl text-cyan-300">{trendAnalysis.topic}</CardTitle>
                        <p className="text-slate-400 text-sm mt-2">{trendAnalysis.summary}</p>
                      </div>
                      <Badge className={`text-sm ${getStatusColor(trendAnalysis.status)}`}>
                        {getStatusIcon(trendAnalysis.status)} {trendAnalysis.status}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>

                {/* Interest Over Time */}
                {trendAnalysis.sources?.google?.interest_over_time?.length > 0 && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-violet-300">📊 Interest Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 bg-slate-700/30 rounded-lg p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={trendAnalysis.sources.google.interest_over_time}>
                            <defs>
                              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                            <Area type="monotone" dataKey="value" stroke="#06b6d4" fillOpacity={1} fill="url(#colorValue)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Geographic Distribution */}
                {trendAnalysis.sources?.google?.interest_by_region?.length > 0 && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-emerald-300">🌍 Top Regions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72 bg-slate-700/30 rounded-lg p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={trendAnalysis.sources.google.interest_by_region.slice(0, 12)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="region" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: "#1e293b" }} />
                            <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Related Queries & Topics */}
                <div className="grid md:grid-cols-2 gap-6">
                  {trendAnalysis.sources?.google?.related_queries?.length > 0 && (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-lg text-pink-300">🔗 Related Queries</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {trendAnalysis.sources.google.related_queries.slice(0, 10).map((query: string, i: number) => (
                            <button
                              key={i}
                              onClick={() => handleSearchOrAnalyze(query)}
                              className="w-full text-left px-3 py-2 rounded bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 text-sm transition"
                              data-testid={`related-query-${i}`}
                              disabled={analyzing}
                            >
                              🔍 {query}
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {trendAnalysis.related_topics?.length > 0 && (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-lg text-blue-300">🏷️ Related Topics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {trendAnalysis.related_topics.slice(0, 10).map((topic: string, i: number) => (
                            <button
                              key={i}
                              onClick={() => handleSearchOrAnalyze(topic)}
                              className="w-full text-left px-3 py-2 rounded bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 text-sm transition"
                              data-testid={`related-topic-${i}`}
                              disabled={analyzing}
                            >
                              🏷️ {topic}
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-20 pb-20 text-center">
                  <Eye className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                  <p className="text-slate-400 mb-4">
                    Click a trend to see detailed analysis with interest graphs and insights
                  </p>
                  <p className="text-slate-500 text-sm">
                    Or search for any topic to get live trend data
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
