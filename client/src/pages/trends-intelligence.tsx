import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp, BarChart3, Filter, Bell, Zap, Sparkles, Download, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, BarChart, Bar, ScatterChart, Scatter, Area, AreaChart } from "recharts";
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

const ALERTS = [
  { id: 1, keyword: "AI Trends", change: "+150%", status: "Exploding", timestamp: "2 hours ago", color: "red" },
  { id: 2, keyword: "Web3", change: "+45%", status: "Rising", timestamp: "4 hours ago", color: "orange" },
  { id: 3, keyword: "Quantum Computing", change: "+12%", status: "Stable", timestamp: "1 day ago", color: "cyan" },
  { id: 4, keyword: "Cybersecurity", change: "-8%", status: "Declining", timestamp: "2 days ago", color: "slate" },
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
                Trends Intelligence System
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                        labelStyle={{ color: "#e2e8f0" }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="AI" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4" }} />
                      <Line type="monotone" dataKey="Machine Learning" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6" }} />
                      <Line type="monotone" dataKey="ChatGPT" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
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
                  7-Day Forecast & Confidence Interval
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-slate-700/30 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={FORECAST_DATA}>
                      <defs>
                        <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                        labelStyle={{ color: "#e2e8f0" }}
                      />
                      <Area type="monotone" dataKey="upper" stroke="none" fill="#06b6d4" fillOpacity={0.1} />
                      <Area type="monotone" dataKey="lower" stroke="none" fill="#06b6d4" fillOpacity={0.1} />
                      <Line type="monotone" dataKey="forecast" stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="p-3 rounded bg-slate-700/50 text-center">
                    <div className="text-slate-400 text-xs">Current</div>
                    <div className="text-lg font-bold text-cyan-400">88</div>
                  </div>
                  <div className="p-3 rounded bg-slate-700/50 text-center">
                    <div className="text-slate-400 text-xs">Forecast (7d)</div>
                    <div className="text-lg font-bold text-violet-400">102</div>
                  </div>
                  <div className="p-3 rounded bg-slate-700/50 text-center">
                    <div className="text-slate-400 text-xs">Confidence</div>
                    <div className="text-lg font-bold text-emerald-400">94%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Correlation Analysis */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-pink-300 flex items-center gap-2">
                  🔗 Keyword Correlation Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-slate-700/30 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" dataKey="x" stroke="#94a3b8" />
                      <YAxis type="number" dataKey="y" stroke="#94a3b8" />
                      <Tooltip 
                        cursor={{ strokeDasharray: "3 3" }}
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                        labelStyle={{ color: "#e2e8f0" }}
                        content={({ active, payload }) => {
                          if (active && payload && payload[0]) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 p-2 rounded text-sm text-cyan-300 border border-slate-600">
                                <p>{data.name}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
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
                  <BarChart3 className="w-5 h-5" />
                  Sentiment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-700/30 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SENTIMENT_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="sentiment" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                        labelStyle={{ color: "#e2e8f0" }}
                      />
                      <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {SENTIMENT_DATA.map(item => (
                    <div key={item.sentiment} className="p-3 rounded bg-slate-700/50 text-center">
                      <div className="text-slate-400 text-sm">{item.sentiment}</div>
                      <div className="text-lg font-bold text-cyan-400">{item.percentage}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category Filter */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-emerald-300 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Category Filter
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

            {/* Trend Alerts */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-red-300 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Alerts
                </CardTitle>
                <button
                  onClick={() => setShowAddAlert(!showAddAlert)}
                  className="p-1 hover:bg-slate-700/50 rounded"
                  data-testid="button-toggle-add-alert"
                >
                  {showAddAlert ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </CardHeader>
              <CardContent className="space-y-3">
                {showAddAlert && (
                  <div className="p-3 rounded bg-slate-700/50 border border-slate-600 space-y-2">
                    <input
                      type="text"
                      value={newAlert}
                      onChange={(e) => setNewAlert(e.target.value)}
                      placeholder="Keyword to track..."
                      className="w-full px-2 py-1.5 rounded bg-slate-600/50 border border-slate-500 text-slate-200 text-sm focus:outline-none focus:border-red-500"
                      onKeyPress={(e) => e.key === 'Enter' && addAlert()}
                      data-testid="input-new-alert"
                    />
                    <button
                      onClick={addAlert}
                      className="w-full px-2 py-1.5 rounded bg-red-500/30 hover:bg-red-500/40 text-red-300 text-sm transition"
                      data-testid="button-add-alert-confirm"
                    >
                      Create Alert
                    </button>
                  </div>
                )}
                {alerts.map(alert => (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded border ${getStatusColor(alert.status)}`}
                    data-testid={`card-alert-${alert.id}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-sm">{alert.keyword}</div>
                      <button
                        onClick={() => removeAlert(alert.id)}
                        className="p-0.5 hover:bg-black/30 rounded"
                        data-testid={`button-remove-alert-${alert.id}`}
                      >
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
                <CardTitle className="text-lg text-yellow-300 flex items-center gap-2">
                  📊 Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded bg-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1">Trending Keywords</div>
                  <div className="text-2xl font-bold text-yellow-400">24</div>
                </div>
                <div className="p-3 rounded bg-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1">Active Alerts</div>
                  <div className="text-2xl font-bold text-red-400">{alerts.length}</div>
                </div>
                <div className="p-3 rounded bg-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1">Avg. Momentum</div>
                  <div className="text-2xl font-bold text-emerald-400">+42%</div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tools */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-blue-300 flex items-center gap-2">
                  🔧 Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  className="w-full px-3 py-2 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm transition"
                  data-testid="button-anomaly-detection"
                  onClick={() => toast.success("Anomaly detection activated")}
                >
                  🚨 Anomaly Detection
                </button>
                <button
                  className="w-full px-3 py-2 rounded bg-green-500/20 hover:bg-green-500/30 text-green-300 text-sm transition"
                  data-testid="button-seasonal-analysis"
                  onClick={() => toast.success("Seasonal analysis loaded")}
                >
                  📅 Seasonal Analysis
                </button>
                <button
                  className="w-full px-3 py-2 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-sm transition"
                  data-testid="button-market-saturation"
                  onClick={() => toast.success("Market saturation calculated")}
                >
                  🎯 Market Saturation
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
