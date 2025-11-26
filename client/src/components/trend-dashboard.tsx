import { TrendData } from "@/lib/mock-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ArrowUpRight, Flame, Minus, ArrowDownRight, Twitter, Globe, MessageSquare, Share2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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

export function TrendDashboard({ data }: TrendDashboardProps) {
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
    >
      {/* Header Section */}
      <motion.div variants={item} className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-card/40 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-display mb-2">{data.topic}</CardTitle>
                <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getStatusColor(data.status)}`}>
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
            <p className="text-lg leading-relaxed text-muted-foreground">
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
              {data.related_topics.map((topic, i) => (
                <Badge key={i} variant="secondary" className="hover:bg-primary/20 cursor-pointer transition-colors">
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Tabs */}
      <motion.div variants={item}>
        <Tabs defaultValue="google" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/30 p-1">
            <TabsTrigger value="google" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Globe className="w-4 h-4 mr-2" /> Google Trends
            </TabsTrigger>
            <TabsTrigger value="reddit" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-500">
              <MessageSquare className="w-4 h-4 mr-2" /> Reddit
            </TabsTrigger>
            <TabsTrigger value="twitter" className="data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-500">
              <Twitter className="w-4 h-4 mr-2" /> Twitter / X
            </TabsTrigger>
          </TabsList>

          <TabsContent value="google" className="mt-4">
            <Card className="bg-card/40 backdrop-blur-sm border-white/5">
              <CardHeader>
                <CardTitle>Interest Over Time (7 Days)</CardTitle>
                <CardDescription>Search volume data from Google Trends</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.sources.google.interest_over_time}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--primary))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reddit" className="mt-4">
            <div className="grid gap-4">
              {data.sources.reddit.top_posts.map((post, i) => (
                <Card key={i} className="bg-card/40 backdrop-blur-sm border-white/5 hover:border-orange-500/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="text-sm text-orange-500 font-medium mb-1">{post.subreddit}</p>
                        <h4 className="font-semibold text-lg mb-2">{post.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">Score: <span className="text-foreground">{post.score.toLocaleString()}</span></span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={post.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="twitter" className="mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              {data.sources.twitter ? (
                data.sources.twitter.recent_tweets.map((tweet, i) => (
                  <Card key={i} className="bg-card/40 backdrop-blur-sm border-white/5 hover:border-sky-500/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sky-500">{tweet.author}</span>
                        <Twitter className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <p className="mb-3 text-sm leading-relaxed">{tweet.text}</p>
                      <div className="text-xs text-muted-foreground">
                        {tweet.likes} Likes
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 p-8 text-center border border-dashed rounded-lg border-muted">
                  <p className="text-muted-foreground">Twitter API key not configured.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
