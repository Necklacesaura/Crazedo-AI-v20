import { TrendData } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ArrowUpRight, Flame, Minus, ArrowDownRight, Share2, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface TrendDashboardProps {
  data: TrendData;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// UPDATED: Helper functions for trend analysis calculations
function calculateTrendMetrics(interestData: { date: string; value: number }[]) {
  if (interestData.length === 0) return { peakDay: '', peakValue: 0, lowestDay: '', lowestValue: 0, change7Day: 0, trendScore: 0, interpretation: '' };
  
  const values = interestData.map(d => d.value);
  const peakIndex = values.indexOf(Math.max(...values));
  const lowestIndex = values.indexOf(Math.min(...values));
  const avgValue = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const firstDayValue = values[0];
  const lastDayValue = values[values.length - 1];
  const change7Day = ((lastDayValue - firstDayValue) / Math.max(firstDayValue, 1)) * 100;
  const trendScore = Math.round(avgValue + (change7Day > 0 ? Math.min(change7Day, 30) : Math.max(change7Day, -30)));
  
  let interpretation = '';
  if (change7Day > 25) interpretation = 'Strong upward momentum - interest significantly increased throughout the week.';
  else if (change7Day > 5) interpretation = 'Positive trend - interest gradually grew over the past week.';
  else if (change7Day > -5) interpretation = 'Stable trend - interest remained relatively consistent throughout the week.';
  else if (change7Day > -25) interpretation = 'Declining trend - search interest gradually decreased.';
  else interpretation = 'Strong downward momentum - interest significantly declined throughout the week.';
  
  return {
    peakDay: interestData[peakIndex].date,
    peakValue: values[peakIndex],
    lowestDay: interestData[lowestIndex].date,
    lowestValue: values[lowestIndex],
    change7Day: Math.round(change7Day),
    trendScore: Math.min(Math.max(trendScore, 0), 100),
    todayValue: lastDayValue,
    interpretation,
    avgValue
  };
}

function generateSpikeInsight(interestData: { date: string; value: number }[], status: string) {
  const values = interestData.map(d => d.value);
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
  const maxValue = Math.max(...values);
  const spike = maxValue > avgValue * 1.3;
  
  if (status === 'Exploding') return '• Rapid surge detected - interest spiked dramatically\n• Likely driven by recent news or viral event\n• Peak momentum may be short-lived';
  if (status === 'Rising') return '• Consistent growth pattern throughout the week\n• Building momentum indicates sustained interest\n• Good opportunity for content or engagement';
  if (spike) return '• Significant spike observed mid-week\n• Interest level rebounded after initial decline\n• Multiple search catalysts driving engagement';
  if (status === 'Declining') return '• Interest waning over the 7-day period\n• Trending topics typically see natural decline\n• May rebound with new developments';
  return '• Steady search volume maintained\n• Consistent public interest throughout the week\n• Reliable topic for ongoing tracking';
}

export function TrendDashboard({ data }: TrendDashboardProps) {
  const metrics = calculateTrendMetrics(data.sources.google.interest_over_time);
  const spikeInsight = generateSpikeInsight(data.sources.google.interest_over_time, data.status);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Exploding': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'Rising': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'Stable': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'Declining': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default: return 'bg-primary/20 text-primary border-primary/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Exploding': return <Flame className="w-5 h-5 mr-2" />;
      case 'Rising': return <ArrowUpRight className="w-5 h-5 mr-2" />;
      case 'Stable': return <Minus className="w-5 h-5 mr-2" />;
      case 'Declining': return <ArrowDownRight className="w-5 h-5 mr-2" />;
      default: return null;
    }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full max-w-6xl mx-auto space-y-6 pb-20"
      data-testid="trend-dashboard"
    >
      {/* Header Section */}
      <motion.div variants={item} className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-card/40 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-display mb-2" data-testid="text-topic">{data.topic}</CardTitle>
                <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getStatusColor(data.status)}`} data-testid="badge-status">
                  {getStatusIcon(data.status)}
                  <span className="font-mono font-bold uppercase tracking-wider">{data.status}</span>
                </div>
              </div>
              <div className="text-right hidden md:block">
                <span className="text-xs text-muted-foreground font-mono block mb-1">ANALYSIS ID</span>
                <span className="text-sm font-mono text-primary">#CRZ-{Math.floor(Math.random() * 10000)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed text-muted-foreground" data-testid="text-summary">
              <span className="text-primary font-bold mr-2">AI SUMMARY &gt;</span>
              {data.summary}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">
              <Share2 className="w-4 h-4" /> Related Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {/* UPDATED: Made topics clickable - each badge now links to Google search for that topic */}
              {data.related_topics.map((topic, i) => (
                <a
                  key={i}
                  href={`https://www.google.com/search?q=${encodeURIComponent(topic)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                  data-testid={`badge-related-${i}`}
                >
                  <Badge variant="secondary" className="hover:bg-primary/50 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary/50 hover:scale-105">
                    {topic}
                  </Badge>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Google Trends Chart Section */}
      <motion.div variants={item}>
        <Card className="bg-card/40 backdrop-blur-sm border-white/5">
          <CardHeader>
            <CardTitle>Google Trends - Interest Over Time (7 Days)</CardTitle>
            <CardDescription>Real-time search volume data showing trend momentum</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Chart */}
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.sources.google.interest_over_time}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(162 90% 45% / 0.2)" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(162 90% 45%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(162 90% 45%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))', 
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                    itemStyle={{ color: 'hsl(var(--primary))' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* What This Graph Shows - Helper Explanation */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
              <p className="text-sm font-mono uppercase tracking-widest text-primary font-bold">📊 What This Graph Shows</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• <span className="text-foreground font-medium">100</span> = peak popularity</p>
                <p>• <span className="text-foreground font-medium">50</span> = half as popular</p>
                <p>• <span className="text-foreground font-medium">0</span> = very low search activity</p>
                <p className="pt-2 text-foreground">Chart displays how search interest changed daily over the last 7 days.</p>
              </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Peak Day */}
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1">Peak Day</p>
                <p className="text-lg font-display font-bold text-emerald-300">{metrics.peakDay}</p>
                <p className="text-xs text-muted-foreground mt-1">Value: {metrics.peakValue}</p>
              </div>

              {/* Lowest Day */}
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-xs font-mono uppercase tracking-widest text-blue-400 mb-1">Lowest Day</p>
                <p className="text-lg font-display font-bold text-blue-300">{metrics.lowestDay}</p>
                <p className="text-xs text-muted-foreground mt-1">Value: {metrics.lowestValue}</p>
              </div>

              {/* Today's Interest */}
              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <p className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">Today's Interest</p>
                <p className="text-lg font-display font-bold text-cyan-300">{metrics.todayValue}</p>
                <p className="text-xs text-muted-foreground mt-1">Latest value</p>
              </div>

              {/* 7-Day Change */}
              <div className={`p-3 rounded-lg ${metrics.change7Day >= 0 ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{color: metrics.change7Day >= 0 ? 'hsl(160 84% 56%)' : 'hsl(0 84% 60%)'}}>{metrics.change7Day >= 0 ? '📈' : '📉'} 7-Day Change</p>
                <p className="text-lg font-display font-bold" style={{color: metrics.change7Day >= 0 ? 'hsl(160 84% 56%)' : 'hsl(0 84% 60%)'}}>{metrics.change7Day > 0 ? '+' : ''}{metrics.change7Day}%</p>
                <p className="text-xs text-muted-foreground mt-1">vs. start of week</p>
              </div>
            </div>

            {/* Trend Strength Score */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 space-y-2">
              <p className="text-sm font-mono uppercase tracking-widest text-primary font-bold">⚡ Trend Strength Score</p>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-display font-bold text-primary">{metrics.trendScore}<span className="text-lg text-muted-foreground">/100</span></div>
                <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-cyan-400" style={{ width: `${metrics.trendScore}%` }}></div>
                </div>
              </div>
            </div>

            {/* Trend Interpretation */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-2">
              <p className="text-sm font-mono uppercase tracking-widest text-blue-300 font-bold">📊 Trend Interpretation</p>
              <p className="text-muted-foreground">{metrics.interpretation}</p>
            </div>

            {/* Why Interest Spiked */}
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 space-y-2">
              <p className="text-sm font-mono uppercase tracking-widest text-red-300 font-bold">🔥 Pattern Analysis</p>
              <div className="text-muted-foreground text-sm whitespace-pre-line leading-relaxed">{spikeInsight}</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Related Queries */}
      <motion.div variants={item}>
        <Card className="bg-card/40 backdrop-blur-sm border-white/5">
          <CardHeader>
            <CardTitle>Related Search Queries</CardTitle>
            <CardDescription>What people are also searching for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* UPDATED: Made all queries clickable - each opens Google search in a new tab */}
              {data.sources.google.related_queries.map((query, i) => (
                <a
                  key={i}
                  href={`https://www.google.com/search?q=${encodeURIComponent(query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 cursor-pointer"
                  data-testid={`query-${i}`}
                >
                  <span className="text-foreground font-medium">{query}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
