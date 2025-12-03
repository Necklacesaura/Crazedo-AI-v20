import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp, Globe, Search, BarChart3, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { toast } from "sonner";
import type { GlobalTrend } from "@/lib/api";

export default function TrendsIntelligence() {
  const [, navigate] = useLocation();
  const [globalTrends, setGlobalTrends] = useState<GlobalTrend[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<GlobalTrend | null>(null);
  const [trendAnalysis, setTrendAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [searchInput, setSearchInput] = useState("");

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
      setSelectedTrend(null);
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
    setSelectedTrend(trend);
    handleSearchOrAnalyze(trend.query);
  };

  const convertSparklineData = (sparkline: number[]) => {
    return sparkline.map((value, index) => ({
      day: index + 1,
      value,
    }));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 text-cyan-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
              <TrendingUp className="w-8 h-8" />
              Trends Intelligence
            </h1>
            <p className="text-slate-400 text-sm">Live global trends & analysis</p>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-2">
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
          </CardContent>
        </Card>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Trending List */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-emerald-300 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Global Trending Now
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader className="w-5 h-5 animate-spin mx-auto text-cyan-400" />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {globalTrends.slice(0, 20).map((trend, i) => (
                      <button
                        key={i}
                        onClick={() => handleTrendClick(trend)}
                        className={`w-full text-left p-3 rounded border transition ${
                          selectedTrend?.query === trend.query
                            ? "bg-cyan-500/20 border-cyan-500/50"
                            : "bg-slate-700/50 border-slate-600 hover:border-cyan-500/50"
                        }`}
                        data-testid={`trend-${trend.query}`}
                        disabled={analyzing}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <div className="flex-1 font-semibold text-slate-200 text-sm">{trend.query}</div>
                          <Badge className={`text-xs ${getStatusColor(trend.status)}`}>
                            {trend.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>{trend.volume_estimate}</span>
                          <span>{trend.category}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-2 space-y-6">
            {trendAnalysis ? (
              <>
                {/* Trend Overview */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl text-cyan-300">{trendAnalysis.topic}</CardTitle>
                        <p className="text-slate-400 text-sm mt-1">{trendAnalysis.summary}</p>
                      </div>
                      <Badge className={`text-sm ${getStatusColor(trendAnalysis.status)}`}>
                        {trendAnalysis.status}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>

                {/* Interest Over Time */}
                {trendAnalysis.sources?.google?.interest_over_time?.length > 0 && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-violet-300">Interest Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-slate-700/30 rounded-lg p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendAnalysis.sources.google.interest_over_time}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                            <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4" }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Geographic Distribution */}
                {trendAnalysis.sources?.google?.interest_by_region?.length > 0 && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-emerald-300">Top Regions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72 bg-slate-700/30 rounded-lg p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={trendAnalysis.sources.google.interest_by_region.slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="region" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
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
                        <CardTitle className="text-lg text-pink-300">Related Queries</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {trendAnalysis.sources.google.related_queries.slice(0, 8).map((query: string, i: number) => (
                            <button
                              key={i}
                              onClick={() => handleSearchOrAnalyze(query)}
                              className="w-full text-left px-3 py-2 rounded bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 text-sm transition"
                              data-testid={`related-query-${i}`}
                              disabled={analyzing}
                            >
                              → {query}
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {trendAnalysis.related_topics?.length > 0 && (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-lg text-blue-300">Related Topics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {trendAnalysis.related_topics.slice(0, 8).map((topic: string, i: number) => (
                            <button
                              key={i}
                              onClick={() => handleSearchOrAnalyze(topic)}
                              className="w-full text-left px-3 py-2 rounded bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 text-sm transition"
                              data-testid={`related-topic-${i}`}
                              disabled={analyzing}
                            >
                              → {topic}
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
                <CardContent className="pt-12 pb-12 text-center">
                  <BarChart3 className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                  <p className="text-slate-400">
                    Click a trend or search to see live analysis
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
