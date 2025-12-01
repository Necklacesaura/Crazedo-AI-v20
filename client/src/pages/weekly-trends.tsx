import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getTopTrendsWithVolume, WeeklyTrend, analyzeTrend } from "@/lib/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Minus, Flame, RefreshCw, ArrowRight } from "lucide-react";

export default function WeeklyTrends() {
  const [, navigate] = useLocation();
  const [trends, setTrends] = useState<WeeklyTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [analyzingTrend, setAnalyzingTrend] = useState<string | null>(null);

  const handleTrendClick = async (trendName: string) => {
    setAnalyzingTrend(trendName);
    try {
      await analyzeTrend(trendName);
      // Store the trend in sessionStorage so home page can auto-search
      sessionStorage.setItem('autoSearchTrend', trendName);
      navigate('/');
    } catch (error) {
      toast.error(`Failed to analyze ${trendName}`);
      setAnalyzingTrend(null);
    }
  };

  const fetchTrends = async () => {
    setIsLoading(true);
    try {
      const data = await getTopTrendsWithVolume();
      setTrends(data);
      setLastUpdated(new Date().toLocaleTimeString());
      toast.success("Trends updated successfully");
    } catch (error) {
      console.error("Failed to fetch trends", error);
      toast.error("Failed to load trends");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();

    // Auto-refresh every 24 hours
    const interval = setInterval(() => {
      fetchTrends();
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Exploding":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "Rising":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
      case "Stable":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "Declining":
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
      default:
        return "bg-primary/20 text-primary border-primary/50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Exploding":
        return <Flame className="w-4 h-4 mr-2" />;
      case "Rising":
        return <ArrowUpRight className="w-4 h-4 mr-2" />;
      case "Stable":
        return <Minus className="w-4 h-4 mr-2" />;
      case "Declining":
        return <ArrowDownRight className="w-4 h-4 mr-2" />;
      default:
        return null;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-foreground p-4 md:p-8">
      {/* Background Grid */}
      <div
        className="fixed inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white">
              Most Searched Topics on Google This Week
            </h1>
            <p className="text-muted-foreground font-mono text-sm">
              Top 100 searches with estimated weekly volumes
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={fetchTrends}
            disabled={isLoading}
            className="p-3 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 transition disabled:opacity-50"
            data-testid="button-refresh"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
          </motion.button>
        </div>

        {/* Last Updated Info */}
        {lastUpdated && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-muted-foreground font-mono mb-6"
          >
            Last updated: {lastUpdated}
          </motion.p>
        )}

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
        >
          <p className="text-xs text-yellow-200">
            <strong>📌 Important:</strong> Estimated weekly search volumes are calculated projections based on Google Trends interest scores
            (0-100 scale). These are NOT official Google Trends data. Actual search volumes may vary significantly. Use for trend
            analysis and comparison purposes only.
          </p>
        </motion.div>

        {/* Trends Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {trends.map((trend, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <button
                onClick={() => handleTrendClick(trend.trend)}
                disabled={analyzingTrend === trend.trend}
                className="w-full h-full text-left"
                data-testid={`trend-card-button-${i}`}
              >
                <Card className="bg-card/40 backdrop-blur-sm border-primary/20 h-full hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 transition cursor-pointer group" data-testid={`trend-card-${i}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2" data-testid={`trend-name-${i}`}>
                        #{i + 1} {trend.trend}
                      </CardTitle>
                    </div>
                    <Badge
                      variant="outline"
                      className={`whitespace-nowrap ${getStatusColor(trend.status)}`}
                      data-testid={`status-badge-${i}`}
                    >
                      {getStatusIcon(trend.status)}
                      {trend.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Search Volume */}
                  <div className="bg-black/20 rounded-lg p-3 space-y-1">
                    <p className="text-xs text-muted-foreground font-mono">EST. WEEKLY SEARCHES</p>
                    <p className="text-2xl font-bold text-primary" data-testid={`volume-${i}`}>
                      {formatNumber(trend.estimated_weekly_searches)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ({trend.estimated_weekly_searches.toLocaleString()} exact)
                    </p>
                  </div>

                  {/* Interest Score */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground font-mono mb-1">INTEREST SCORE</p>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold text-primary">{trend.interest_score}</div>
                        <div className="text-xs text-muted-foreground">/100</div>
                      </div>
                    </div>

                    {/* Interest Bar */}
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground font-mono mb-2">TREND</p>
                      <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-cyan-400"
                          style={{ width: `${trend.interest_score}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Related Topics */}
                  {trend.related_topics.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-mono">RELATED SEARCHES</p>
                      <div className="flex flex-wrap gap-1">
                        {trend.related_topics.slice(0, 2).map((topic, j) => (
                          <Badge
                            key={j}
                            variant="secondary"
                            className="text-xs"
                            data-testid={`related-topic-${i}-${j}`}
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Click to Analyze */}
                  <div className="flex items-center gap-2 text-primary text-xs font-mono opacity-0 group-hover:opacity-100 transition mt-2">
                    <span>Click to analyze</span>
                    <ArrowRight className={`w-3 h-3 ${analyzingTrend === trend.trend ? 'animate-spin' : ''}`} />
                  </div>
                </CardContent>
              </Card>
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Loading State */}
        {isLoading && trends.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center min-h-[400px]"
          >
            <div className="text-center space-y-4">
              <div className="inline-block animate-spin">
                <RefreshCw className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground">Loading weekly trends...</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
