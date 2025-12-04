import { useState, useEffect, useRef } from "react";
import { SearchInput } from "@/components/search-input";
import { TrendDashboard } from "@/components/trend-dashboard";
import { analyzeTrend, TrendData } from "@/lib/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { X, ArrowLeft } from "lucide-react";

interface SavedTrend {
  topic: string;
  savedAt: string;
  status: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<TrendData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [savedTrends, setSavedTrends] = useState<SavedTrend[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedTrends') || '[]');
    setSavedTrends(saved);
  }, []);

  const handleSearch = async (term: string) => {
    setIsLoading(true);
    setHasSearched(true);
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

  const handleQuickSearch = async (topic: string) => {
    await handleSearch(topic);
  };

  const handleRemoveSaved = (topic: string) => {
    const updated = savedTrends.filter(t => t.topic !== topic);
    setSavedTrends(updated);
    localStorage.setItem('savedTrends', JSON.stringify(updated));
  };

  const handleBackToSearch = () => {
    setData(null);
    setHasSearched(false);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-foreground p-4 md:p-8 overflow-x-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      {/* Fixed Green Back Button - Only visible after search */}
      {data && !isLoading && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onClick={handleBackToSearch}
          className="fixed top-4 left-4 z-50 p-3 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-300 hover:border-emerald-400 transition-all duration-200 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
          data-testid="button-back-fixed"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </motion.button>
      )}

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col min-h-[90vh]">
        {/* Header - Animates to top when searched */}
        <motion.div 
          layout
          className={`flex flex-col items-center text-center space-y-6 ${hasSearched ? 'mt-8 mb-12' : 'mt-[20vh] mb-12'}`}
        >
          <motion.div layout className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              CRAZEDO AI
            </h1>
            <p className="text-muted-foreground font-mono text-sm md:text-base tracking-widest uppercase">
              Crazedo Trends Intelligence System v2.0
            </p>
          </motion.div>
          
          <div className="w-full max-w-2xl">
            <SearchInput ref={searchInputRef} onSearch={handleSearch} isLoading={isLoading} />
          </div>
        </motion.div>

        {/* Results Area */}
        <div className="flex-1 w-full">
          {data && !isLoading && (
            <TrendDashboard data={data} onBack={handleBackToSearch} />
          )}
          
          {/* Empty State / Instructions */}
          {!hasSearched && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="max-w-4xl mx-auto mt-20 space-y-8"
            >
              {/* Trending Now Section */}
              {savedTrends.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="bg-card/40 backdrop-blur-sm border-white/5">
                    <CardHeader>
                      <CardTitle>Your Saved Trends</CardTitle>
                      <CardDescription>Quick access to your tracked topics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {savedTrends.map((trend, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuickSearch(trend.topic)}
                            className="relative p-3 rounded-lg bg-muted/20 border border-border/30 hover:border-primary/50 hover:bg-muted/40 transition group"
                            data-testid={`saved-trend-${i}`}
                          >
                            <div className="text-sm font-medium text-foreground text-left">{trend.topic}</div>
                            <div className="text-xs text-muted-foreground text-left">{trend.status}</div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRemoveSaved(trend.topic); }}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                              data-testid={`remove-saved-${i}`}
                            >
                              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                            </button>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <div className="p-8 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm text-center space-y-4">
                <h3 className="font-display text-2xl mb-6 text-primary">Powered by Crazedo Trends</h3>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 text-left text-sm">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 hover:border-blue-400/60 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all group cursor-default">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition">📊</div>
                    <h4 className="font-semibold mb-1 text-blue-100">Real-Time Data</h4>
                    <p className="text-blue-200/60 text-xs">7-day interest tracking</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 hover:border-purple-400/60 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all group cursor-default">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition">🤖</div>
                    <h4 className="font-semibold mb-1 text-purple-100">AI Insights</h4>
                    <p className="text-purple-200/60 text-xs">AI-powered summaries</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 hover:border-red-400/60 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all group cursor-default">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition">🔥</div>
                    <h4 className="font-semibold mb-1 text-red-100">Trend Status</h4>
                    <p className="text-red-200/60 text-xs">Exploding/Rising/Declining</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 hover:border-green-400/60 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all group cursor-default">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition">🔗</div>
                    <h4 className="font-semibold mb-1 text-green-100">Related Topics</h4>
                    <p className="text-green-200/60 text-xs">Discover connections</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/30 hover:border-indigo-400/60 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all group cursor-default">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition">📈</div>
                    <h4 className="font-semibold mb-1 text-indigo-100">Lifecycle Stages</h4>
                    <p className="text-indigo-200/60 text-xs">Track trend maturity</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 hover:border-yellow-400/60 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all group cursor-default">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition">💰</div>
                    <h4 className="font-semibold mb-1 text-yellow-100">Revenue Potential</h4>
                    <p className="text-yellow-200/60 text-xs">Monetization scoring</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border border-cyan-500/30 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all group cursor-default">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition">🎯</div>
                    <h4 className="font-semibold mb-1 text-cyan-100">Market Saturation</h4>
                    <p className="text-cyan-200/60 text-xs">Competition analysis</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 border border-fuchsia-500/30 hover:border-fuchsia-400/60 hover:shadow-[0_0_20px_rgba(217,70,239,0.2)] transition-all group cursor-default">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition">📝</div>
                    <h4 className="font-semibold mb-1 text-fuchsia-100">Content Ideas</h4>
                    <p className="text-fuchsia-200/60 text-xs">AI-suggested topics</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-500/10 border border-sky-500/30 hover:border-sky-400/60 hover:shadow-[0_0_20px_rgba(14,165,233,0.2)] transition-all group cursor-default">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition">🔍</div>
                    <h4 className="font-semibold mb-1 text-sky-100">Seasonal Patterns</h4>
                    <p className="text-sky-200/60 text-xs">Yearly trend cycles</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 hover:border-orange-400/60 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all group cursor-default">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition">⚠️</div>
                    <h4 className="font-semibold mb-1 text-orange-100">Anomaly Detection</h4>
                    <p className="text-orange-200/60 text-xs">Unusual spikes/dips</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/30 hover:border-rose-400/60 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] transition-all group cursor-default">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition">📊</div>
                    <h4 className="font-semibold mb-1 text-rose-100">Risk Scoring</h4>
                    <p className="text-rose-200/60 text-xs">Volatility analysis</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/30 hover:border-violet-400/60 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all group cursor-default">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition">🔮</div>
                    <h4 className="font-semibold mb-1 text-violet-100">7-Day Forecast</h4>
                    <p className="text-violet-200/60 text-xs">Trend predictions</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-lime-500/10 to-green-500/10 border border-lime-500/30 hover:border-lime-400/60 hover:shadow-[0_0_20px_rgba(132,204,22,0.2)] transition-all group cursor-default">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition">🚀</div>
                    <h4 className="font-semibold mb-1 text-lime-100">Rising Queries</h4>
                    <p className="text-lime-200/60 text-xs">+250% breakouts</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/30 hover:border-teal-400/60 hover:shadow-[0_0_20px_rgba(20,184,166,0.2)] transition-all group cursor-default">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition">📥</div>
                    <h4 className="font-semibold mb-1 text-teal-100">Export Reports</h4>
                    <p className="text-teal-200/60 text-xs">PDF/TXT download</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/30 hover:border-pink-400/60 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] transition-all group cursor-default">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition">❤️</div>
                    <h4 className="font-semibold mb-1 text-pink-100">Save Trends</h4>
                    <p className="text-pink-200/60 text-xs">Track favorites</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/30 hover:border-amber-400/60 hover:shadow-[0_0_20px_rgba(217,119,6,0.2)] transition-all group cursor-default">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition">🔔</div>
                    <h4 className="font-semibold mb-1 text-amber-100">Trend Alerts</h4>
                    <p className="text-amber-200/60 text-xs">Smart notifications</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
