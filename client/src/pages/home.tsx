import { useState } from "react";
import { SearchInput } from "@/components/search-input";
import { TrendDashboard } from "@/components/trend-dashboard";
import { analyzeTrend, TrendData } from "@/lib/api";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<TrendData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

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
              Trend Intelligence System v1.0
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
              className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto"
            >
              {[
                { title: "Google Trends", desc: "Search volume velocity & related queries" },
                { title: "Reddit Sentiment", desc: "Community discussions & hot topics" },
                { title: "X / Twitter", desc: "Real-time viral conversations & hashtags" }
              ].map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors text-center">
                  <h3 className="font-display text-lg mb-2 text-primary">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
