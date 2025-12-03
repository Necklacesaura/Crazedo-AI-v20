import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp, BarChart3, Filter, Bell, Zap, Sparkles, Download, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { toast } from "sonner";

const SAMPLE_DATA = [
  { date: "Mon", value: 45 },
  { date: "Tue", value: 52 },
  { date: "Wed", value: 65 },
  { date: "Thu", value: 72 },
  { date: "Fri", value: 78 },
  { date: "Sat", value: 82 },
  { date: "Sun", value: 85 },
];

const SENTIMENT_DATA = [
  { name: "Positive", value: 45 },
  { name: "Neutral", value: 38 },
  { name: "Negative", value: 17 },
];

const ALERTS = [
  { id: 1, keyword: "AI Trends", change: "+150%", status: "Exploding" },
  { id: 2, keyword: "Web3", change: "+45%", status: "Rising" },
  { id: 3, keyword: "Quantum Computing", change: "+12%", status: "Stable" },
];

export default function TrendsIntelligence() {
  const [, navigate] = useLocation();
  const [alerts, setAlerts] = useState(ALERTS);
  const [newAlert, setNewAlert] = useState("");

  const addAlert = () => {
    if (!newAlert.trim()) {
      toast.error("Please enter a keyword");
      return;
    }
    const alert = {
      id: alerts.length + 1,
      keyword: newAlert,
      change: "+25%",
      status: "Rising"
    };
    setAlerts([alert, ...alerts]);
    setNewAlert("");
    toast.success(`Alert created for "${newAlert}"`);
  };

  const removeAlert = (id: number) => {
    setAlerts(alerts.filter(a => a.id !== id));
    toast.success("Alert removed");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 text-cyan-400" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 flex items-center gap-2">
              <Sparkles className="w-7 h-7" />
              Trends Intelligence Pro
            </h1>
            <p className="text-slate-400 text-xs md:text-sm">Advanced analysis & monitoring tools</p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => toast.success("Exported as CSV")}
            className="px-3 py-2 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs md:text-sm transition"
            data-testid="button-export-csv"
          >
            📥 Export CSV
          </button>
          <button
            onClick={() => toast.success("Exported as JSON")}
            className="px-3 py-2 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs md:text-sm transition"
            data-testid="button-export-json"
          >
            📥 Export JSON
          </button>
        </div>

        {/* Quick Tools Bar */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardContent className="pt-6">
            <div className="text-sm text-slate-400 mb-3 font-semibold">⚡ Quick Tools:</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <button
                className="px-3 py-2 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs transition font-semibold"
                onClick={() => toast.success("🔍 Keyword research loaded")}
                data-testid="button-keywords"
              >
                🔍 Keywords
              </button>
              <button
                className="px-3 py-2 rounded bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs transition font-semibold"
                onClick={() => toast.success("Hashtag analysis loaded")}
                data-testid="button-hashtags"
              >
                #️⃣ Hashtags
              </button>
              <button
                className="px-3 py-2 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs transition font-semibold"
                onClick={() => toast.success("Competitor analysis loaded")}
                data-testid="button-competitors"
              >
                👥 Competitors
              </button>
              <button
                className="px-3 py-2 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs transition font-semibold"
                onClick={() => toast.success("Influencer tracking loaded")}
                data-testid="button-influencers"
              >
                ⭐ Influencers
              </button>
              <button
                className="px-3 py-2 rounded bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs transition font-semibold"
                onClick={() => toast.success("Risk analysis loaded")}
                data-testid="button-risk"
              >
                ⚠️ Risk
              </button>
              <button
                className="px-3 py-2 rounded bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-xs transition font-semibold"
                onClick={() => toast.success("Insights generated")}
                data-testid="button-insights"
              >
                ✨ Insights
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Main Grid */}
        <div className="space-y-6">
          {/* Trend Comparison */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg text-cyan-300 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trend Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-slate-700/30 rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SAMPLE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                    <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sentiment & Stats Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sentiment Analysis */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-purple-300 flex items-center gap-2">
                  💭 Sentiment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-700/30 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SENTIMENT_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                      <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-emerald-300">📊 Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded bg-slate-700/50 border border-slate-600">
                  <div className="text-slate-400 text-xs mb-1">Trending Keywords</div>
                  <div className="text-3xl font-bold text-cyan-400">24</div>
                </div>
                <div className="p-4 rounded bg-slate-700/50 border border-slate-600">
                  <div className="text-slate-400 text-xs mb-1">Active Alerts</div>
                  <div className="text-3xl font-bold text-red-400">{alerts.length}</div>
                </div>
                <div className="p-4 rounded bg-slate-700/50 border border-slate-600">
                  <div className="text-slate-400 text-xs mb-1">Avg Momentum</div>
                  <div className="text-3xl font-bold text-emerald-400">+42%</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts Section */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg text-red-300 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Trend Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Add Alert Form */}
              <div className="p-3 rounded bg-slate-700/50 border border-slate-600 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAlert}
                    onChange={(e) => setNewAlert(e.target.value)}
                    placeholder="Enter keyword..."
                    className="flex-1 px-3 py-2 rounded bg-slate-600/50 border border-slate-500 text-slate-200 text-sm focus:outline-none focus:border-red-500"
                    onKeyPress={(e) => e.key === 'Enter' && addAlert()}
                    data-testid="input-new-alert"
                  />
                  <button
                    onClick={addAlert}
                    className="px-4 py-2 rounded bg-red-500/30 hover:bg-red-500/40 text-red-300 text-sm transition font-semibold"
                    data-testid="button-add-alert"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Alerts List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {alerts.map(alert => (
                  <div key={alert.id} className="p-3 rounded bg-slate-700/50 border border-slate-600 flex justify-between items-center" data-testid={`alert-${alert.id}`}>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-200 text-sm">{alert.keyword}</div>
                      <div className="text-xs text-slate-400 flex gap-2 mt-1">
                        <Badge className="bg-red-600 text-xs">{alert.change}</Badge>
                        <Badge className="bg-slate-600 text-xs">{alert.status}</Badge>
                      </div>
                    </div>
                    <button
                      onClick={() => removeAlert(alert.id)}
                      className="p-1 hover:bg-slate-600/50 rounded transition"
                      data-testid={`remove-alert-${alert.id}`}
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tools Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-yellow-300">💡 Content Ideas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {["Top 10 AI Tools 2025", "Machine Learning Guide", "Trend Forecast Report", "Market Analysis"].map((idea, i) => (
                  <div key={i} className="p-3 rounded bg-slate-700/50 hover:bg-slate-700/70 transition cursor-pointer">
                    <p className="text-slate-300 text-sm">{idea}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-orange-300">⚠️ Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded bg-orange-500/20 border border-orange-500/30">
                  <h4 className="text-orange-300 font-semibold text-sm mb-1">Market Saturation</h4>
                  <p className="text-orange-200/70 text-xs">MEDIUM - Competition increasing</p>
                </div>
                <div className="p-3 rounded bg-red-500/20 border border-red-500/30">
                  <h4 className="text-red-300 font-semibold text-sm mb-1">Volatility</h4>
                  <p className="text-red-200/70 text-xs">HIGH - Unpredictable fluctuations</p>
                </div>
                <div className="p-3 rounded bg-cyan-500/20 border border-cyan-500/30">
                  <h4 className="text-cyan-300 font-semibold text-sm mb-1">Growth Opportunity</h4>
                  <p className="text-cyan-200/70 text-xs">EXCELLENT - Strong upward trend</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
