import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getGlobalTrendingNow, GlobalTrend, analyzeTrend } from "@/lib/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Globe, RefreshCw, ArrowLeft, Flame, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function GlobalTrendingPage() {
  const [, navigate] = useLocation();
  const [trends, setTrends] = useState<GlobalTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [analyzingTrend, setAnalyzingTrend] = useState<string | null>(null);

  const handleTrendClick = async (trendName: string) => {
    setAnalyzingTrend(trendName);
    try {
      await analyzeTrend(trendName);
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
      const data = await getGlobalTrendingNow();
      setTrends(data);
      setLastUpdated(new Date().toLocaleTimeString());
      toast.success("Global trends updated");
    } catch (error) {
      console.error("Failed to fetch global trends", error);
      toast.error("Failed to load global trends");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
    const interval = setInterval(() => {
      fetchTrends();
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Exploding":
        return <Flame className="w-4 h-4" />;
      case "Rising":
        return <TrendingUp className="w-4 h-4" />;
      case "Stable":
        return <Minus className="w-4 h-4" />;
      case "Declining":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case "Exploding":
        return "from-red-500/20 to-red-600/20 border-red-500/50 hover:border-red-400/70 hover:from-red-500/30 hover:to-red-600/30 shadow-red-500/20";
      case "Rising":
        return "from-emerald-500/20 to-emerald-600/20 border-emerald-500/50 hover:border-emerald-400/70 hover:from-emerald-500/30 hover:to-emerald-600/30 shadow-emerald-500/20";
      case "Stable":
        return "from-blue-500/20 to-blue-600/20 border-blue-500/50 hover:border-blue-400/70 hover:from-blue-500/30 hover:to-blue-600/30 shadow-blue-500/20";
      case "Declining":
        return "from-gray-500/20 to-gray-600/20 border-gray-500/50 hover:border-gray-400/70 hover:from-gray-500/30 hover:to-gray-600/30 shadow-gray-500/20";
      default:
        return "from-cyan-500/20 to-cyan-600/20 border-cyan-500/50";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Exploding":
        return "bg-red-500/30 text-red-200 border-red-500/60";
      case "Rising":
        return "bg-emerald-500/30 text-emerald-200 border-emerald-500/60";
      case "Stable":
        return "bg-blue-500/30 text-blue-200 border-blue-500/60";
      case "Declining":
        return "bg-gray-500/30 text-gray-200 border-gray-500/60";
      default:
        return "bg-cyan-500/30 text-cyan-200 border-cyan-500/60";
    }
  };

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-foreground p-4 md:p-8">
      <div
        className="fixed inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-cyan-400" />
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-300">
                Global Trends
              </h1>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-emerald-400"
              />
              <span className="text-xs font-mono text-emerald-400 uppercase">LIVE</span>
            </div>
            <p className="text-cyan-300/70 font-light max-w-md">Real-time worldwide search trends Powered by Crazedo data</p>
          </motion.div>

          <div className="flex gap-2">
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              onClick={fetchTrends}
              disabled={isLoading}
              className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 hover:from-cyan-500/40 hover:to-cyan-600/40 text-cyan-300 border border-cyan-500/50 transition disabled:opacity-50 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20"
              data-testid="button-refresh"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              onClick={() => navigate('/')}
              className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 hover:from-cyan-500/40 hover:to-cyan-600/40 text-cyan-300 border border-cyan-500/50 transition shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="inline-flex flex-col items-center gap-4">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                <RefreshCw className="w-8 h-8 text-cyan-400" />
              </motion.div>
              <p className="text-cyan-300 font-light">Loading global trends...</p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Grid of Trend Cards */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
            >
              {trends.map((trend, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <button
                    onClick={() => handleTrendClick(trend.query)}
                    disabled={analyzingTrend === trend.query}
                    className={`w-full p-5 rounded-xl border backdrop-blur-sm transition-all group bg-gradient-to-br ${getStatusGradient(trend.status)} shadow-lg hover:shadow-xl text-left disabled:opacity-50`}
                    data-testid={`global-trend-${i}`}
                  >
                    {/* Top Row: Rank & Status */}
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-mono text-cyan-300/60 bg-cyan-500/20 px-2 py-1 rounded">
                        #{trend.rank}
                      </span>
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-md font-semibold text-xs border ${getStatusBadgeColor(trend.status)}`}>
                        {getStatusIcon(trend.status)}
                        {trend.status}
                      </span>
                    </div>

                    {/* Trend Name */}
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-cyan-100 transition">
                      {analyzingTrend === trend.query ? "Analyzing..." : trend.query}
                    </h3>

                    {/* Interest Score */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-cyan-300/60">Interest Score</span>
                        <span className="text-lg font-bold text-emerald-300">{trend.interest_score}/100</span>
                      </div>
                      <div className="w-full bg-slate-800/50 rounded-full h-1.5 border border-cyan-500/20">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${trend.interest_score}%` }}
                          transition={{ delay: 0.2, duration: 0.6 }}
                          className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Sparkline */}
                    <div className="mb-3">
                      <p className="text-xs text-cyan-300/60 mb-2">7-Day Trend</p>
                      <div className="flex gap-0.5 h-6 items-end">
                        {trend.sparkline.slice(-7).map((val, j) => (
                          <motion.div
                            key={j}
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max((val / 100) * 100, 2)}%` }}
                            transition={{ delay: 0.3 + j * 0.05, duration: 0.5 }}
                            className="flex-1 bg-gradient-to-t from-emerald-500 to-cyan-400 rounded-t opacity-80 hover:opacity-100 transition cursor-help"
                            title={`Day ${j + 1}: ${val}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Volume & Category */}
                    <div className="flex justify-between items-end pt-3 border-t border-cyan-500/20">
                      <div>
                        <p className="text-xs text-cyan-300/60">Est. Volume</p>
                        <p className="font-semibold text-cyan-200 text-sm">{trend.volume_estimate}</p>
                      </div>
                      <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded-full text-xs text-cyan-200 font-medium">
                        {trend.category}
                      </span>
                    </div>
                  </button>
                </motion.div>
              ))}
            </motion.div>

            {/* Footer Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center space-y-2 text-cyan-300/60 font-light"
            >
              <p className="text-sm">✓ Live data • Last updated: {lastUpdated}</p>
              <p className="text-xs">Click any trend card to analyze it in detail</p>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
