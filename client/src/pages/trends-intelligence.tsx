import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp, BarChart3, Filter, Bell, Zap, Sparkles, Download, Plus, X, Globe, AlertTriangle, TrendingDown } from "lucide-react";
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
  { id: 1, keyword: "AI Trends", change: "+150%", status: "Exploding", timestamp: "2 hours ago" },
  { id: 2, keyword: "Web3", change: "+45%", status: "Rising", timestamp: "4 hours ago" },
  { id: 3, keyword: "Quantum Computing", change: "+12%", status: "Stable", timestamp: "1 day ago" },
  { id: 4, keyword: "Cybersecurity", change: "-8%", status: "Declining", timestamp: "2 days ago" },
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
      timestamp: "now"
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
              <p className="text-slate-400 text-sm">Advanced analysis, forecasting & monitoring</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportData("csv")}
              className="px-4 py-2 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm transition"
              data-testid="button-export-csv"
            >
              <Download className="w-4 h-4 inline mr-1" />
              CSV
            </button>
            <button
              onClick={() => exportData("json")}
              className="px-4 py-2 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm transition"
              data-testid="button-export-json"
            >
              <Download className="w-4 h-4 inline mr-1" />
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-cyan-300 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Trend Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <input
                        type="text"
                        value={comparisonKeywords}
                        onChange={(e) => setComparisonKeywords(e.target.value)}
                        placeholder="e.g., AI, ChatGPT, Machine Learning"
                        className="w-full px-3 py-2 rounded bg-slate-700/50 border border-slate-600 text-slate-200 text-sm"
                        data-testid="input-keywords"
                      />
                    </div>
                    <div className="h-80 bg-slate-700/30 rounded-lg p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={SAMPLE_COMPARISON_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: "#1e293b" }} />
                          <Legend />
                          <Line type="monotone" dataKey="AI" stroke="#06b6d4" strokeWidth={2} />
                          <Line type="monotone" dataKey="Machine Learning" stroke="#8b5cf6" strokeWidth={2} />
                          <Line type="monotone" dataKey="ChatGPT" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-violet-300">7-Day Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 bg-slate-700/30 rounded-lg p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={FORECAST_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: "#1e293b" }} />
                          <Area type="monotone" dataKey="forecast" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-pink-300">Keyword Correlations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-slate-700/30 rounded-lg p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis type="number" dataKey="x" stroke="#94a3b8" />
                          <YAxis type="number" dataKey="y" stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: "#1e293b" }} />
                          <Scatter name="Keywords" data={CORRELATION_DATA} fill="#06b6d4" fillOpacity={0.6} />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-purple-300">Sentiment Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-slate-700/30 rounded-lg p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={SENTIMENT_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="sentiment" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: "#1e293b" }} />
                          <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

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

            {activeTab === "lifecycle" && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-orange-300">Trend Lifecycle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-slate-700/30 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={LIFECYCLE_STAGES} cx="50%" cy="50%" labelLine={false} label={({ stage, percentage }) => `${stage} ${percentage}%`} outerRadius={120} dataKey="percentage">
                          {LIFECYCLE_STAGES.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#1e293b" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "viral" && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-red-300">Viral Potential Score</CardTitle>
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
                </CardContent>
              </Card>
            )}

            {activeTab === "content" && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-300">AI Content Ideas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {CONTENT_IDEAS.map((idea, i) => (
                    <div
                      key={i}
                      className="p-4 rounded bg-slate-700/50 border border-slate-600 hover:border-yellow-500/50 cursor-pointer"
                      data-testid={`idea-${i}`}
                    >
                      <h4 className="text-slate-200 font-semibold">{idea}</h4>
                      <p className="text-slate-400 text-sm">Perfect timing for this trend</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

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
                    <h4 className="text-orange-300 font-semibold mb-1">Market Saturation: MEDIUM</h4>
                    <p className="text-orange-200/70 text-sm">Competition is increasing.</p>
                  </div>
                  <div className="p-4 rounded bg-red-500/20 border border-red-500/30">
                    <h4 className="text-red-300 font-semibold mb-1">Volatility: HIGH</h4>
                    <p className="text-red-200/70 text-sm">Unpredictable fluctuations detected.</p>
                  </div>
                  <div className="p-4 rounded bg-cyan-500/20 border border-cyan-500/30">
                    <h4 className="text-cyan-300 font-semibold mb-1">Growth Opportunity: EXCELLENT</h4>
                    <p className="text-cyan-200/70 text-sm">Strong upward trajectory.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                        : "bg-slate-700/50 text-slate-300"
                    }`}
                    data-testid={`cat-${category.toLowerCase()}`}
                  >
                    {selectedCategories.includes(category) ? "✓" : "○"} {category}
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg text-red-300 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Alerts
                </CardTitle>
                <button onClick={() => setShowAddAlert(!showAddAlert)} data-testid="toggle-alert">
                  {showAddAlert ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </CardHeader>
              <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                {showAddAlert && (
                  <div className="p-3 rounded bg-slate-700/50 space-y-2">
                    <input
                      type="text"
                      value={newAlert}
                      onChange={(e) => setNewAlert(e.target.value)}
                      placeholder="Keyword..."
                      className="w-full px-2 py-1.5 rounded bg-slate-600/50 border border-slate-500 text-slate-200 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && addAlert()}
                      data-testid="input-alert"
                    />
                    <button
                      onClick={addAlert}
                      className="w-full px-2 py-1.5 rounded bg-red-500/30 text-red-300 text-sm"
                      data-testid="btn-add-alert"
                    >
                      Add
                    </button>
                  </div>
                )}
                {alerts.map(alert => (
                  <div key={alert.id} className={`p-3 rounded border ${
                    alert.status === "Exploding" ? "bg-red-500/20 border-red-500/30" :
                    alert.status === "Rising" ? "bg-orange-500/20 border-orange-500/30" :
                    alert.status === "Stable" ? "bg-cyan-500/20 border-cyan-500/30" :
                    "bg-slate-500/20 border-slate-500/30"
                  }`} data-testid={`alert-${alert.id}`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-sm">{alert.keyword}</div>
                      <button onClick={() => removeAlert(alert.id)}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <Badge className="bg-red-600 text-xs">{alert.change}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-cyan-300">📊 Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded bg-slate-700/50">
                  <div className="text-xs text-slate-400">Trends</div>
                  <div className="text-2xl font-bold text-cyan-400">24</div>
                </div>
                <div className="p-3 rounded bg-slate-700/50">
                  <div className="text-xs text-slate-400">Alerts</div>
                  <div className="text-2xl font-bold text-red-400">{alerts.length}</div>
                </div>
                <div className="p-3 rounded bg-slate-700/50">
                  <div className="text-xs text-slate-400">Momentum</div>
                  <div className="text-2xl font-bold text-emerald-400">+42%</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-blue-300">🔧 Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  className="w-full px-3 py-2 rounded bg-blue-500/20 text-blue-300 text-sm"
                  onClick={() => toast.success("Keyword research loaded")}
                  data-testid="tool-keywords"
                >
                  🔍 Keywords
                </button>
                <button
                  className="w-full px-3 py-2 rounded bg-green-500/20 text-green-300 text-sm"
                  onClick={() => toast.success("Hashtag analysis loaded")}
                  data-testid="tool-hashtags"
                >
                  #️⃣ Hashtags
                </button>
                <button
                  className="w-full px-3 py-2 rounded bg-purple-500/20 text-purple-300 text-sm"
                  onClick={() => toast.success("Competitor analysis loaded")}
                  data-testid="tool-competitors"
                >
                  👥 Competitors
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
