import { useState, useEffect } from "react";
import { SearchInput } from "@/components/search-input";
import { TrendDashboard } from "@/components/trend-dashboard";
import { analyzeTrend, TrendData } from "@/lib/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { X } from "lucide-react";

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

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-foreground p-4 md:p-8 overflow-x-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

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
              Google Trends Intelligence System v2.0
            </p>
          </motion.div>
          
          <div className="w-full max-w-2xl">
            <SearchInput onSearch={handleSearch} isLoading={isLoading} />
          </div>
        </motion.div>

        {/* Results Area */}
        <div className="flex-1 w-full">
          {data && !isLoading && (
            <TrendDashboard data={data} />
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
                <h3 className="font-display text-2xl mb-4 text-primary">Powered by Crazedo Trends</h3>
                <div className="grid md:grid-cols-3 gap-3 text-left text-sm">
                  <div className="p-3 rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-1 text-foreground">📊 Real-Time Data</h4>
                    <p className="text-muted-foreground text-xs">7-day interest tracking</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-1 text-foreground">🤖 AI Insights</h4>
                    <p className="text-muted-foreground text-xs">AI-powered summaries</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-1 text-foreground">🔥 Trend Status</h4>
                    <p className="text-muted-foreground text-xs">Exploding/Rising/Declining</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-1 text-foreground">🔗 Related Topics</h4>
                    <p className="text-muted-foreground text-xs">Discover connections</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-1 text-foreground">📈 Lifecycle Stages</h4>
                    <p className="text-muted-foreground text-xs">Track trend maturity</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-1 text-foreground">💰 Revenue Potential</h4>
                    <p className="text-muted-foreground text-xs">Monetization scoring</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-1 text-foreground">🎯 Market Saturation</h4>
                    <p className="text-muted-foreground text-xs">Competition analysis</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-1 text-foreground">📝 Content Ideas</h4>
                    <p className="text-muted-foreground text-xs">AI-suggested topics</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-1 text-foreground">🔍 Seasonal Patterns</h4>
                    <p className="text-muted-foreground text-xs">Yearly trend cycles</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-1 text-foreground">⚠️ Anomaly Detection</h4>
                    <p className="text-muted-foreground text-xs">Unusual spikes/dips</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-1 text-foreground">📊 Risk Scoring</h4>
                    <p className="text-muted-foreground text-xs">Volatility analysis</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-1 text-foreground">🔮 7-Day Forecast</h4>
                    <p className="text-muted-foreground text-xs">Trend predictions</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-1 text-foreground">🚀 Rising Queries</h4>
                    <p className="text-muted-foreground text-xs">+250% breakouts</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-1 text-foreground">📥 Export Reports</h4>
                    <p className="text-muted-foreground text-xs">PDF/TXT download</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-1 text-foreground">❤️ Save Trends</h4>
                    <p className="text-muted-foreground text-xs">Track favorites</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-1 text-foreground">🔔 Trend Alerts</h4>
                    <p className="text-muted-foreground text-xs">Smart notifications</p>
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
