import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp, BarChart3, Filter, Bell, Zap, Sparkles, Download, Plus, X, Globe, Heart, AlertTriangle, TrendingDown, Eye, Users, Share2, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, BarChart, Bar, ScatterChart, Scatter, Area, AreaChart, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";

const CATEGORIES = ["Technology", "Entertainment", "Sports", "Business", "Health", "News", "Shopping", "Lifestyle"];

const SAMPLE_COMPARISON_DATA = [
  { date: "Mon", "AI": 45, "Machine Learning": 42, "ChatGPT": 38 },
  { date: "Tue", "AI": 52, "Machine Learning": 48, "ChatGPT": 41 },
  { date: "Wed", "AI": 65, "Machine Learning": 59, "ChatGPT": 51 },
  { date: "Thu", "AI": 72, "Machine Learning": 68, "ChatGPT": 58 },
  { date: "Fri", "AI": 78, "Machine Learning": 74, "ChatGPT": 65 },
  { date: "Sat", "AI": 82, "Machine Learning": 79, "ChatGPT": 71 },
  { date: "Sun", "AI": 85, "Machine Learning": 81, "ChatGPT": 75 },
];

const FORECAST_DATA = [
  { date: "Mon", actual: 85, forecast: 85, upper: 90, lower: 80 },
  { date: "Tue", actual: 88, forecast: 88, upper: 93, lower: 83 },
  { date: "Wed", forecast: 92, upper: 98, lower: 86 },
  { date: "Thu", forecast: 95, upper: 102, lower: 88 },
  { date: "Fri", forecast: 98, upper: 106, lower: 90 },
  { date: "Sat", forecast: 100, upper: 109, lower: 91 },
  { date: "Sun", forecast: 102, upper: 111, lower: 93 },
];

const SENTIMENT_DATA = [
  { sentiment: "Positive", count: 45, percentage: 45 },
  { sentiment: "Neutral", count: 38, percentage: 38 },
  { sentiment: "Negative", count: 17, percentage: 17 },
];

const GEOGRAPHIC_DATA = [
  { region: "USA", value: 95, searches: "2.4M" },
  { region: "UK", value: 82, searches: "1.2M" },
  { region: "India", value: 78, searches: "1.8M" },
  { region: "Canada", value: 71, searches: "890K" },
  { region: "Germany", value: 68, searches: "756K" },
  { region: "France", value: 65, searches: "634K" },
];

const LIFECYCLE_STAGES = [
  { stage: "Emerging", percentage: 10, color: "#3b82f6" },
  { stage: "Growing", percentage: 30, color: "#10b981" },
  { stage: "Mature", percentage: 40, color: "#f59e0b" },
  { stage: "Declining", percentage: 20, color: "#ef4444" },
];

const ALERTS = [
  { id: 1, keyword: "AI Trends", change: "+150%", status: "Exploding", timestamp: "2 hours ago", color: "red" },
  { id: 2, keyword: "Web3", change: "+45%", status: "Rising", timestamp: "4 hours ago", color: "orange" },
  { id: 3, keyword: "Quantum Computing", change: "+12%", status: "Stable", timestamp: "1 day ago", color: "cyan" },
  { id: 4, keyword: "Cybersecurity", change: "-8%", status: "Declining", timestamp: "2 days ago", color: "slate" },
];

const CONTENT_IDEAS = [
  "Top 10 AI Tools in 2025",
  "How to Use ChatGPT for Business",
  "Machine Learning for Beginners",
  "The Future of Artificial Intelligence",
  "AI Ethics and Responsibility",
];

const VIRAL_SCORE_METRICS = [
  { metric: "Momentum", score: 92 },
  { metric: "Reach", score: 87 },
  { metric: "Engagement", score: 78 },
  { metric: "Shareability", score: 85 },
  { metric: "Search Volume", score: 94 },
];

const CORRELATION_DATA = [
  { x: 20, y: 50, name: "AI-ML", size: 400 },
  { x: 60, y: 70, name: "ChatGPT-AI", size: 350 },
  { x: 80, y: 45, name: "Tech-Innovation", size: 300 },
  { x: 30, y: 80, name: "ML-Data", size: 280 },
  { x: 75, y: 65, name: "AI-Future", size: 320 },
];

export default function TrendsIntelligence() {
  const [, navigate] = useLocation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Technology", "Business"]);
  const [comparisonKeywords, setComparisonKeywords] = useState("AI, ChatGPT, Machine Learning");
  const [alerts, setAlerts] = useState(ALERTS);
  const [newAlert, setNewAlert] = useState("");
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const addAlert = () => {
    if (!newAlert.trim()) {
      toast.error("Please enter a keyword");
      return;
    }
    const alert = {
      id: alerts.length + 1,
      keyword: newAlert,
      change: "+25%",
      status: "Rising",
      timestamp: "now",
      color: "orange"
    };
    setAlerts([alert, ...alerts]);
    setNewAlert("");
    setShowAddAlert(false);
    toast.success(`Alert created for "${newAlert}"`);
  };

  const removeAlert = (id: number) => {
    setAlerts(alerts.filter(a => a.id !== id));
    toast.success("Alert removed");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Exploding": return "bg-red-500/20 text-red-300 border-red-500/30";
      case "Rising": return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "Stable": return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      case "Declining": return "bg-slate-500/20 text-slate-300 border-slate-500/30";
      default: return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  const exportData = (format: string) => {
    let content = "";
    if (format === "csv") {
      content = "Keyword,Change,Status,Timestamp\n";
      alerts.forEach(a => {
        content += `${a.keyword},${a.change},${a.status},${a.timestamp}\n`;
      });
    } else {
      content = JSON.stringify({ alerts, comparison: comparisonKeywords, categories: selectedCategories }, null, 2);
    }
    const blob = new Blob([content], { type: format === "csv" ? "text/csv" : "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trends-intelligence.${format}`;
    a.click();
    toast.success(`Exported as ${format.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5 text-cyan-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
                <Sparkles className="w-8 h-8" />
                Trends Intelligence Pro
              </h1>
              <p className="text-slate-400 text-sm">Advanced analysis, forecasting & real-time monitoring</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportData("csv")}
              className="px-4 py-2 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm transition flex items-center gap-2"
              data-testid="button-export-csv"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => exportData("json")}
              className="px-4 py-2 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm transition flex items-center gap-2"
              data-testid="button-export-json"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["overview", "geographic", "lifecycle", "viral", "content", "risk"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded text-sm transition whitespace-nowrap ${
                activeTab === tab
                  ? "bg-cyan-500/30 text-cyan-200 border border-cyan-500/50"
                  : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
              }`}
              data-testid={`tab-${tab}`}
            >
              {tab === "overview" && "📊 Overview"}
              {tab === "geographic" && "🌍 Geographic"}
              {tab === "lifecycle" && "📈 Lifecycle"}
              {tab === "viral" && "🚀 Viral Score"}
              {tab === "content" && "💡 Content"}
              {tab === "risk" && "⚠️ Risk"}
            </button>
          ))}
        </div>

        {/* Quick Tools Bar */}
        <div className="mb-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <div className="text-sm text-slate-400 mb-3 font-semibold">⚡ Quick Tools:</div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <button
              className="px-3 py-2 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs transition font-semibold"
              onClick={() => toast.success("🔍 Keyword research loaded")}
              data-testid="button-quick-keyword-research"
            >
              🔍 Keywords
            </button>
            <button
              className="px-3 py-2 rounded bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs transition font-semibold"
              onClick={() => toast.success("#️⃣ Hashtag analysis loaded")}
              data-testid="button-quick-hashtag"
            >
              #️⃣ Hashtags
            </button>
            <button
              className="px-3 py-2 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs transition font-semibold"
              onClick={() => toast.success("👥 Competitor analysis loaded")}
              data-testid="button-quick-competitors"
            >
              👥 Competitors
            </button>
            <button
              className="px-3 py-2 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs transition font-semibold"
              onClick={() => toast.success("⭐ Influencer tracking loaded")}
              data-testid="button-quick-influencers"
            >
              ⭐ Influencers
            </button>
            <button
              className="px-3 py-2 rounded bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs transition font-semibold"
              onClick={() => setShowAddAlert(!showAddAlert)}
              data-testid="button-quick-alerts"
            >
              🔔 Alerts
            </button>
            <button
              className="px-3 py-2 rounded bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-xs transition font-semibold"
              onClick={() => toast.success("Generating insights...")}
              data-testid="button-quick-insights"
            >
              ✨ Insights
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <>
                {/* Trend Comparison */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-cyan-300 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Trend Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <label className="text-sm text-slate-300 mb-2 block">Keywords (comma-separated):</label>
                      <input
                        type="text"
                        value={comparisonKeywords}
                        onChange={(e) => setComparisonKeywords(e.target.value)}
                        placeholder="e.g., AI, ChatGPT, Machine Learning"
                        className="w-full px-3 py-2 rounded bg-slate-700/50 border border-slate-600 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
                        data-testid="input-comparison-keywords"
                      />
                    </div>
                    <div className="h-80 bg-slate-700/30 rounded-lg p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={SAMPLE_COMPARISON_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                          <Legend />
                          <Line type="monotone" dataKey="AI" stroke="#06b6d4" strokeWidth={2} />
                          <Line type="monotone" dataKey="Machine Learning" stroke="#8b5cf6" strokeWidth={2} />
                          <Line type="monotone" dataKey="ChatGPT" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Trend Forecast */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-violet-300 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      7-Day Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 bg-slate-700/30 rounded-lg p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={FORECAST_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                          <Area type="monotone" dataKey="forecast" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Correlation Analysis */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-pink-300 flex items-center gap-2">
                      🔗 Keyword Correlations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-slate-700/30 rounded-lg p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis type="number" dataKey="x" stroke="#94a3b8" />
                          <YAxis type="number" dataKey="y" stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                          <Scatter name="Keywords" data={CORRELATION_DATA} fill="#06b6d4" fillOpacity={0.6} />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Sentiment Analysis */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-purple-300 flex items-center gap-2">
                      💭 Sentiment Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-slate-700/30 rounded-lg p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={SENTIMENT_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="sentiment" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                          <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Geographic Tab */}
            {activeTab === "geographic" && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-emerald-300 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Geographic Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {GEOGRAPHIC_DATA.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">{item.region}</span>
                        <span className="text-cyan-400">{item.searches}</span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2 rounded-full"
                          style={{ width: `${item.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Lifecycle Tab */}
            {activeTab === "lifecycle" && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-orange-300 flex items-center gap-2">
                    📈 Trend Lifecycle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-slate-700/30 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={LIFECYCLE_STAGES} cx="50%" cy="50%" labelLine={false} label={({ stage, percentage }) => `${stage} ${percentage}%`} outerRadius={120} fill="#8884d8" dataKey="percentage">
                          {LIFECYCLE_STAGES.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Viral Score Tab */}
            {activeTab === "viral" && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-red-300 flex items-center gap-2">
                    🚀 Viral Potential Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {VIRAL_SCORE_METRICS.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">{item.metric}</span>
                        <span className="text-red-400 font-bold">{item.score}/100</span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-red-500 to-pink-500 h-3 rounded-full"
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-6 p-4 rounded bg-red-500/20 border border-red-500/30">
                    <div className="text-red-300 font-bold mb-2">Overall Viral Score: 87/100</div>
                    <p className="text-red-200/70 text-sm">This trend has high viral potential with strong momentum and engagement metrics.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Content Ideas Tab */}
            {activeTab === "content" && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-300 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    AI Content Ideas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {CONTENT_IDEAS.map((idea, i) => (
                    <div
                      key={i}
                      className="p-4 rounded bg-slate-700/50 border border-slate-600 hover:border-yellow-500/50 hover:bg-slate-700/70 transition cursor-pointer group"
                      data-testid={`content-idea-${i}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-slate-200 font-semibold mb-1">{idea}</h4>
                          <p className="text-slate-400 text-sm">Perfect timing for this trend • High engagement potential</p>
                        </div>
                        <Badge className="ml-2 bg-yellow-600">✨ Hot</Badge>
                      </div>
                    </div>
                  ))}
                  <button
                    className="w-full mt-4 px-4 py-2 rounded bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-sm transition"
                    onClick={() => toast.success("Generated 10 more content ideas!")}
                  >
                    Generate More Ideas
                  </button>
                </CardContent>
              </Card>
            )}

            {/* Risk Analysis Tab */}
            {activeTab === "risk" && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-orange-300 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded bg-orange-500/20 border border-orange-500/30">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-orange-300 font-semibold mb-1">Market Saturation Risk: MEDIUM</h4>
                        <p className="text-orange-200/70 text-sm">Competition is increasing. Position your content early.</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded bg-red-500/20 border border-red-500/30">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-red-300 font-semibold mb-1">Volatility Risk: HIGH</h4>
                        <p className="text-red-200/70 text-sm">Trend shows unpredictable fluctuations. Use caution with long-term bets.</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded bg-cyan-500/20 border border-cyan-500/30">
                    <div className="flex items-start gap-3 mb-3">
                      <TrendingUp className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-cyan-300 font-semibold mb-1">Growth Opportunity: EXCELLENT</h4>
                        <p className="text-cyan-200/70 text-sm">Strong upward trajectory. Best time to capitalize on this trend.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category Filter */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-emerald-300 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                      selectedCategories.includes(category)
                        ? "bg-emerald-500/30 text-emerald-200 border border-emerald-500/50"
                        : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                    }`}
                    data-testid={`button-category-${category.toLowerCase()}`}
                  >
                    {selectedCategories.includes(category) ? "✓" : "○"} {category}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-red-300 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Alerts
                </CardTitle>
                <button onClick={() => setShowAddAlert(!showAddAlert)} data-testid="button-toggle-add-alert">
                  {showAddAlert ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </CardHeader>
              <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                {showAddAlert && (
                  <div className="p-3 rounded bg-slate-700/50 border border-slate-600 space-y-2">
                    <input
                      type="text"
                      value={newAlert}
                      onChange={(e) => setNewAlert(e.target.value)}
                      placeholder="Keyword..."
                      className="w-full px-2 py-1.5 rounded bg-slate-600/50 border border-slate-500 text-slate-200 text-sm focus:outline-none focus:border-red-500"
                      onKeyPress={(e) => e.key === 'Enter' && addAlert()}
                      data-testid="input-new-alert"
                    />
                    <button onClick={addAlert} className="w-full px-2 py-1.5 rounded bg-red-500/30 text-red-300 text-sm" data-testid="button-add-alert-confirm">
                      Add
                    </button>
                  </div>
                )}
                {alerts.map(alert => (
                  <div key={alert.id} className={`p-3 rounded border ${getStatusColor(alert.status)}`} data-testid={`card-alert-${alert.id}`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-sm">{alert.keyword}</div>
                      <button onClick={() => removeAlert(alert.id)} data-testid={`button-remove-alert-${alert.id}`}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <Badge className="bg-red-600 text-xs">{alert.change}</Badge>
                      <span className="text-slate-400">{alert.timestamp}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-cyan-300">📊 Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded bg-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1">Trends</div>
                  <div className="text-2xl font-bold text-cyan-400">24</div>
                </div>
                <div className="p-3 rounded bg-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1">Alerts</div>
                  <div className="text-2xl font-bold text-red-400">{alerts.length}</div>
                </div>
                <div className="p-3 rounded bg-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1">Avg Momentum</div>
                  <div className="text-2xl font-bold text-emerald-400">+42%</div>
                </div>
                <div className="p-3 rounded bg-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1">Viral Score</div>
                  <div className="text-2xl font-bold text-pink-400">87/100</div>
                </div>
              </CardContent>
            </Card>

            {/* Tools */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-blue-300">🔧 Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  className="w-full px-3 py-2 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm transition"
                  onClick={() => toast.success("Keyword research loaded")}
                  data-testid="button-keyword-research"
                >
                  🔍 Keyword Research
                </button>
                <button
                  className="w-full px-3 py-2 rounded bg-green-500/20 hover:bg-green-500/30 text-green-300 text-sm transition"
                  onClick={() => toast.success("Hashtag analysis loaded")}
                  data-testid="button-hashtag-analyzer"
                >
                  #️⃣ Hashtag Analyzer
                </button>
                <button
                  className="w-full px-3 py-2 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm transition"
                  onClick={() => toast.success("Competitor analysis loaded")}
                  data-testid="button-competitor-analysis"
                >
                  👥 Competitor Analysis
                </button>
                <button
                  className="w-full px-3 py-2 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-sm transition"
                  onClick={() => toast.success("Influencer tracking loaded")}
                  data-testid="button-influencer-tracker"
                >
                  ⭐ Influencer Tracker
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
