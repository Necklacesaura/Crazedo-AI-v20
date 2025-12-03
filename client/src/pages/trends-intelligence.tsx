import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp, BarChart3, Filter, Bell, Zap, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
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

const SENTIMENT_DATA = [
  { sentiment: "Positive", count: 45, percentage: 45 },
  { sentiment: "Neutral", count: 38, percentage: 38 },
  { sentiment: "Negative", count: 17, percentage: 17 },
];

const ALERTS = [
  { id: 1, keyword: "AI Trends", change: "+150%", status: "Exploding", timestamp: "2 hours ago" },
  { id: 2, keyword: "Web3", change: "+45%", status: "Rising", timestamp: "4 hours ago" },
  { id: 3, keyword: "Quantum Computing", change: "+12%", status: "Stable", timestamp: "1 day ago" },
  { id: 4, keyword: "Cybersecurity", change: "-8%", status: "Declining", timestamp: "2 days ago" },
];

export default function TrendsIntelligence() {
  const [, navigate] = useLocation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Technology", "Business"]);
  const [comparisonKeywords, setComparisonKeywords] = useState("AI, ChatGPT, Machine Learning");
  const [alerts, setAlerts] = useState(ALERTS);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const createAlert = () => {
    toast.success("Alert created successfully!");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
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
            <p className="text-slate-400 text-sm">Advanced trend analysis and comparison tools</p>
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
                  <label className="text-sm text-slate-300 mb-2 block">Keywords to Compare:</label>
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

            {/* Sentiment Analysis */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-purple-300 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Sentiment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-slate-700/30 rounded-lg p-4">
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
                    ✓ {category}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Trend Alerts */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-red-300 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.map(alert => (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded border ${getStatusColor(alert.status)}`}
                    data-testid={`card-alert-${alert.id}`}
                  >
                    <div className="font-semibold text-sm mb-1">{alert.keyword}</div>
                    <div className="flex justify-between items-center text-xs">
                      <Badge className="bg-red-600 text-xs">{alert.change}</Badge>
                      <span className="text-slate-400">{alert.timestamp}</span>
                    </div>
                  </div>
                ))}
                <button
                  onClick={createAlert}
                  className="w-full mt-4 px-4 py-2 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm transition flex items-center justify-center gap-2"
                  data-testid="button-create-alert"
                >
                  <Bell className="w-4 h-4" />
                  Create New Alert
                </button>
              </CardContent>
            </Card>

            {/* Quick Tools */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-yellow-300 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  className="w-full px-3 py-2 rounded bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-sm transition"
                  data-testid="button-trend-forecast"
                >
                  📊 Trend Forecast
                </button>
                <button
                  className="w-full px-3 py-2 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm transition"
                  data-testid="button-keyword-analysis"
                >
                  🔍 Keyword Analysis
                </button>
                <button
                  className="w-full px-3 py-2 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm transition"
                  data-testid="button-correlation-analysis"
                >
                  🔗 Correlation Analysis
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
