import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getGlobalTrendingNow, GlobalTrend, analyzeTrend } from "@/lib/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Globe, RefreshCw, ArrowLeft } from "lucide-react";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Exploding":
        return "bg-red-500/20 text-red-200 border-red-500/50";
      case "Rising":
        return "bg-orange-500/20 text-orange-200 border-orange-500/50";
      case "Stable":
        return "bg-blue-500/20 text-blue-200 border-blue-500/50";
      case "Declining":
        return "bg-gray-500/20 text-gray-200 border-gray-500/50";
      default:
        return "bg-cyan-500/20 text-cyan-200 border-cyan-500/50";
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

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-cyan-100 to-cyan-200">
              🌍 Global Most Searched On Google
            </h1>
            <p className="text-cyan-300/60">Real-time worldwide trending searches with interest metrics</p>
          </motion.div>

          <div className="flex gap-3">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={fetchTrends}
              disabled={isLoading}
              className="p-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 transition disabled:opacity-50"
              data-testid="button-refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => navigate('/')}
              className="p-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 transition"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {isLoading ? (
            <Card className="bg-cyan-500/5 border-cyan-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin mr-3">
                    <RefreshCw className="w-5 h-5 text-cyan-400" />
                  </div>
                  <p className="text-cyan-300">Loading global trends...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border-cyan-500/30 mb-6">
                <CardHeader>
                  <CardTitle className="text-cyan-100">Worldwide Trending Searches</CardTitle>
                  <CardDescription>Live data showing interest scores and volume estimates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs md:text-sm">
                      <thead>
                        <tr className="border-b border-cyan-500/30">
                          <th className="text-left py-3 px-2 text-cyan-300 font-semibold">#</th>
                          <th className="text-left py-3 px-2 text-cyan-300 font-semibold">Trend</th>
                          <th className="text-center py-3 px-2 text-cyan-300 font-semibold">Interest</th>
                          <th className="text-left py-3 px-2 text-cyan-300 font-semibold">Volume</th>
                          <th className="text-center py-3 px-2 text-cyan-300 font-semibold">Status</th>
                          <th className="text-left py-3 px-2 text-cyan-300 font-semibold">Sparkline</th>
                          <th className="text-left py-3 px-2 text-cyan-300 font-semibold">Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trends.map((trend, i) => (
                          <tr key={i} className="border-b border-cyan-500/10 hover:bg-cyan-500/5 transition">
                            <td className="py-3 px-2 text-cyan-400 font-bold">{trend.rank}</td>
                            <td className="py-3 px-2">
                              <button
                                onClick={() => handleTrendClick(trend.query)}
                                disabled={analyzingTrend === trend.query}
                                className="text-cyan-100 hover:text-cyan-50 hover:underline transition text-left font-medium truncate max-w-[150px] disabled:opacity-50"
                                data-testid={`global-trend-${i}`}
                              >
                                {analyzingTrend === trend.query ? "Analyzing..." : trend.query}
                              </button>
                            </td>
                            <td className="py-3 px-2 text-center text-cyan-300 font-semibold">{trend.interest_score}</td>
                            <td className="py-3 px-2 text-cyan-200/70 font-medium text-xs">{trend.volume_estimate}</td>
                            <td className="py-3 px-2 text-center">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-bold border ${getStatusColor(trend.status)}`}>
                                {trend.status.charAt(0)}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex gap-0.5 h-5">
                                {trend.sparkline.slice(-7).map((val, j) => (
                                  <div
                                    key={j}
                                    className="flex-1 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-sm opacity-70 hover:opacity-100 transition"
                                    style={{ height: `${(val / 100) * 100}%`, minHeight: '2px' }}
                                    title={`Day ${j + 1}: ${val}`}
                                  />
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <span className="inline-block px-2 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded-full text-xs text-cyan-200 whitespace-nowrap">
                                {trend.category}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center text-xs text-cyan-300/60">
                <p>✓ Live data • Last updated: {lastUpdated}</p>
                <p className="mt-1">Click any trend to analyze it instantly</p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
