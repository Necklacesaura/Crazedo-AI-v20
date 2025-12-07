import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-foreground overflow-x-hidden">
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-display font-bold tracking-tight">CRAZEDO AI</span>
          </div>
          <a href="/api/login">
            <Button 
              variant="outline" 
              className="border-white/20 hover:bg-white/10"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </a>
        </header>

        <main className="flex flex-col items-center text-center mt-[6vh] md:mt-[8vh] space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-mono">
            <Zap className="w-4 h-4" />
            Real-Time Trend Intelligence
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] max-w-4xl">
            Discover What's Trending Before Everyone Else
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Analyze Google search trends with AI-powered insights. Get real-time data, 
            trend predictions, and actionable intelligence for your business.
          </p>

          <div className="flex flex-col items-center gap-3">
            <a href="/api/login">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-lg px-8 py-6 gap-2"
                data-testid="button-get-started"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
            <span className="text-xs text-muted-foreground/70 border border-white/10 rounded-full px-4 py-1.5 bg-white/5 shadow-[0_0_10px_rgba(255,255,255,0.05)]">
              Free Version 2.0 — No charge. No credit card required.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full max-w-4xl">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-left">
              <TrendingUp className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Live Trend Data</h3>
              <p className="text-muted-foreground text-sm">
                Access real-time Google Trends data for any keyword or topic.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-left">
              <Sparkles className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI-Powered Analysis</h3>
              <p className="text-muted-foreground text-sm">
                Get intelligent insights and trend predictions powered by AI.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-left">
              <Zap className="w-10 h-10 text-yellow-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Instant Results</h3>
              <p className="text-muted-foreground text-sm">
                Get analysis results in seconds, not hours. Stay ahead of the curve.
              </p>
            </div>
          </div>
        </main>

        <footer className="absolute bottom-0 left-0 right-0 py-6 px-4 md:px-8 text-center text-muted-foreground text-sm">
          <div className="flex justify-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
