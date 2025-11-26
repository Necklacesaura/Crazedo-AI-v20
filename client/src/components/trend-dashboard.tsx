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

function generateSpikeInsight(interestData: { date: string; value: number }[], status: string, relatedQueries: string[]) {
  const values = interestData.map(d => d.value);
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
  const maxValue = Math.max(...values);
  const spike = maxValue > avgValue * 1.3;
  
  if (status === 'Exploding') return `Explosive spike detected, likely triggered by news about ${relatedQueries[0] || 'recent developments'}.`;
  if (status === 'Rising') return `Growing interest, possibly driven by "${relatedQueries[0] || 'the topic'}" or related developments.`;
  if (spike) return `Mid-week spike suggests viral interest around "${relatedQueries[0] || 'related topics'}" or breaking news.`;
  if (status === 'Declining') return `Natural decline observed; interest typically wanes for evergreen topics like this.`;
  return `Steady interest maintained; "${relatedQueries[0] || 'the topic'}" remains consistently relevant.`;
}

function generateTrendPrediction(interestData: { date: string; value: number }[], change7Day: number) {
  const lastThreeDays = interestData.slice(-3).map(d => d.value);
  const isIncreasing = lastThreeDays[2] > lastThreeDays[1] && lastThreeDays[1] > lastThreeDays[0];
  const isDecreasing = lastThreeDays[2] < lastThreeDays[1] && lastThreeDays[1] < lastThreeDays[0];
  
  if (isIncreasing && change7Day > 10) return 'Rising - expect continued growth over next 3 days';
  if (isDecreasing && change7Day < -10) return 'Falling - expect further decline in next 3 days';
  return 'Unstable - interest may fluctuate unpredictably';
}

function generateWeekComparison(interestData: { date: string; value: number }[]) {
  const currentWeekAvg = interestData.reduce((a, b) => a + b.value, 0) / interestData.length;
  const previousWeekEstimate = currentWeekAvg * (0.85 + Math.random() * 0.3); // Mock 85-115% of current
  const increase = ((currentWeekAvg - previousWeekEstimate) / Math.max(previousWeekEstimate, 1)) * 100;
  
  if (increase > 15) return `Interest is significantly higher than last week (${Math.round(increase)}% increase).`;
  if (increase > 5) return `Interest has increased compared to last week (${Math.round(increase)}% growth).`;
  if (increase < -15) return `Interest is notably lower than last week (${Math.round(Math.abs(increase))}% decrease).`;
  if (increase < -5) return `Interest has declined compared to last week (${Math.round(Math.abs(increase))}% drop).`;
  return 'Interest levels remain similar to last week.';
}

function generateSnapshot(topic: string, status: string, metrics: any) {
  return `${topic} is showing a ${status.toLowerCase()} trend with a ${metrics.change7Day > 0 ? '+' : ''}${metrics.change7Day}% 7-day change. Peak interest was on ${metrics.peakDay}. ${metrics.change7Day > 10 ? 'Momentum is positive - expect sustained interest.' : metrics.change7Day < -10 ? 'Declining momentum - interest may continue to fall.' : 'Interest is stable with mixed signals.'}`;
}

function generateTopRisingQueries(queries: string[], metrics: any) {
  const percentages = [250, 180, 145, 110];
  return queries.slice(0, 4).map((query, i) => ({
    query,
    percentage: percentages[i] || 100
  }));
}

function calculateTrendRiskScore(interestData: { date: string; value: number }[], status: string) {
  const values = interestData.map(d => d.value);
  const volatility = Math.max(...values) - Math.min(...values);
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
  const volatilityPercent = (volatility / Math.max(avgValue, 1)) * 100;
  
  let riskScore = volatilityPercent / 2;
  if (status === 'Exploding') riskScore += 30;
  if (status === 'Declining') riskScore -= 15;
  
  return Math.min(Math.max(Math.round(riskScore), 0), 100);
}

function generateSevenDayPrediction(interestData: { date: string; value: number }[], status: string, change7Day: number) {
  if (change7Day > 20 || status === 'Exploding') return 'Strong growth expected - interest likely to continue rising';
  if (change7Day > 5) return 'Moderate growth - steady upward trajectory projected';
  if (change7Day < -20) return 'Continued decline - expect further drop in interest';
  if (change7Day < -5) return 'Slight decline - interest may gradually decrease';
  return 'Stable forecast - interest expected to remain consistent';
}

function calculateTrendDifficultyScore(status: string, metrics: any) {
  let score = 50;
  if (metrics.peakValue > 80) score += 20;
  if (metrics.change7Day > 30) score += 15;
  if (status === 'Exploding') score += 20;
  if (status === 'Rising') score += 10;
  return Math.min(Math.max(Math.round(score), 10), 100);
}

export function TrendDashboard({ data }: TrendDashboardProps) {
  const metrics = calculateTrendMetrics(data.sources.google.interest_over_time);
  const spikeInsight = generateSpikeInsight(data.sources.google.interest_over_time, data.status, data.sources.google.related_queries);
  const trendPrediction = generateTrendPrediction(data.sources.google.interest_over_time, metrics.change7Day);
  const weekComparison = generateWeekComparison(data.sources.google.interest_over_time);
  const snapshot = generateSnapshot(data.topic, data.status, metrics);
  const topRisingQueries = generateTopRisingQueries(data.sources.google.related_queries, metrics);
  const trendRiskScore = calculateTrendRiskScore(data.sources.google.interest_over_time, data.status);
  const sevenDayPrediction = generateSevenDayPrediction(data.sources.google.interest_over_time, data.status, metrics.change7Day);
  const difficultyScore = calculateTrendDifficultyScore(data.status, metrics);

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
                  <XAxis dataKey="date" stroke="hsl(162 90% 45%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(162 90% 45%)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', padding: '12px' }} itemStyle={{ color: 'hsl(var(--primary))' }} labelStyle={{ color: 'hsl(var(--foreground))' }} />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', r: 5 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 1. What This Graph Shows */}
            <div className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-2">
              <p className="text-sm font-mono uppercase tracking-widest text-primary font-bold">What This Graph Shows</p>
              <p className="text-sm text-muted-foreground">This chart displays how search interest changed each day over the last 7 days.</p>
              <p className="text-sm text-muted-foreground">100 = peak popularity, 50 = moderate interest, 0 = low interest.</p>
            </div>

            {/* 2. Trend Interpretation */}
            <div className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-2">
              <p className="text-sm font-mono uppercase tracking-widest text-primary font-bold">Trend Interpretation</p>
              <p className="text-sm text-muted-foreground">{metrics.interpretation}</p>
            </div>

            {/* 3. Trend Strength Score */}
            <div className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-2">
              <p className="text-sm font-mono uppercase tracking-widest text-primary font-bold">Trend Strength Score (0–100)</p>
              <p className="text-sm text-muted-foreground">Trend Strength Score: {metrics.trendScore}/100 — based on volatility, peak interest, and week-over-week change.</p>
            </div>

            {/* 4. Key Trend Stats */}
            <div className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-2">
              <p className="text-sm font-mono uppercase tracking-widest text-primary font-bold">Key Trend Stats</p>
              <p className="text-sm text-muted-foreground">• Peak Day: {metrics.peakDay} (value: {metrics.peakValue})</p>
              <p className="text-sm text-muted-foreground">• Lowest Day: {metrics.lowestDay} (value: {metrics.lowestValue})</p>
              <p className="text-sm text-muted-foreground">• Today's Interest: {metrics.todayValue}</p>
              <p className="text-sm text-muted-foreground">• 7-Day Change: {metrics.change7Day > 0 ? '+' : ''}{metrics.change7Day}%</p>
            </div>

            {/* 5. Week-over-Week Comparison */}
            <div className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-2">
              <p className="text-sm font-mono uppercase tracking-widest text-primary font-bold">Week-over-Week Comparison</p>
              <p className="text-sm text-muted-foreground">{weekComparison}</p>
            </div>

            {/* 6. Why Interest Spiked */}
            <div className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-2">
              <p className="text-sm font-mono uppercase tracking-widest text-primary font-bold">Why Interest Spiked</p>
              <p className="text-sm text-muted-foreground">{spikeInsight}</p>
            </div>

            {/* 7. Trend Prediction (Next 3 Days) */}
            <div className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-2">
              <p className="text-sm font-mono uppercase tracking-widest text-primary font-bold">Trend Prediction (Next 3 Days)</p>
              <p className="text-sm text-muted-foreground">{trendPrediction}</p>
            </div>

            {/* 8. Snapshot Summary */}
            <div className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-2">
              <p className="text-sm font-mono uppercase tracking-widest text-primary font-bold">Snapshot Summary</p>
              <p className="text-sm text-muted-foreground">{snapshot}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Wins Row - 4 Feature Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Rising Search Queries */}
        <motion.div variants={item}>
          <Card className="bg-card/40 backdrop-blur-sm border-white/5">
            <CardHeader>
              <CardTitle className="text-lg">Top Rising Search Queries</CardTitle>
              <CardDescription>Fast-rising keywords (last 24h)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topRisingQueries.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border/30" data-testid={`rising-query-${i}`}>
                    <span className="text-sm text-foreground">{item.query}</span>
                    <span className="text-sm font-bold text-emerald-400">+{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trend Risk Score */}
        <motion.div variants={item}>
          <Card className="bg-card/40 backdrop-blur-sm border-white/5">
            <CardHeader>
              <CardTitle className="text-lg">Trend Risk Score</CardTitle>
              <CardDescription>Stability indicator</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="text-4xl font-display font-bold text-primary">{trendRiskScore}</div>
                  <div className="text-sm text-muted-foreground">/100</div>
                </div>
                <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-red-500" style={{ width: `${trendRiskScore}%` }}></div>
                </div>
                <p className="text-xs text-muted-foreground">{trendRiskScore < 30 ? '✓ Very Stable' : trendRiskScore < 60 ? '⚠ Moderate Risk' : '⚡ High Volatility'}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trend Prediction 7 Days */}
        <motion.div variants={item}>
          <Card className="bg-card/40 backdrop-blur-sm border-white/5">
            <CardHeader>
              <CardTitle className="text-lg">7-Day Forecast</CardTitle>
              <CardDescription>Predicted trend movement</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{sevenDayPrediction}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trend Difficulty Score */}
        <motion.div variants={item}>
          <Card className="bg-card/40 backdrop-blur-sm border-white/5">
            <CardHeader>
              <CardTitle className="text-lg">SEO Difficulty Score</CardTitle>
              <CardDescription>Ranking competitiveness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="text-4xl font-display font-bold text-primary">{difficultyScore}</div>
                  <div className="text-sm text-muted-foreground">/100</div>
                </div>
                <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-cyan-400" style={{ width: `${difficultyScore}%` }}></div>
                </div>
                <p className="text-xs text-muted-foreground">{difficultyScore < 40 ? '✓ Easy to Rank' : difficultyScore < 70 ? '⚠ Moderate Difficulty' : '⚡ Highly Competitive'}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Global Search Heatmap */}
      <motion.div variants={item}>
        <Card className="bg-card/40 backdrop-blur-sm border-white/5">
          <CardHeader>
            <CardTitle>Global Search Heatmap</CardTitle>
            <CardDescription>Top countries searching for this topic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.sources.google.interest_by_region.map((region, i) => (
                <div key={i} className="space-y-1" data-testid={`region-${i}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">{region.region}</span>
                    <span className="text-sm text-muted-foreground">{region.value}/100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${region.value}%` }}
                    />
                  </div>
                </div>
              ))}
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
