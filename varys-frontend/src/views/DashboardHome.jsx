"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Building2,
  TrendingUp,
  MessageSquare,
  BarChart3,
  Plus,
  ArrowRight,
  Users,
  Activity,
  Clock,
  Star,
  Loader2,
} from "lucide-react";
import { getDashboardStats, getRecentCompanyActivity } from "../api/mockApi";

const quickActions = [
  {
    title: "Add New Company",
    description: "Start monitoring a new company",
    icon: Plus,
    action: "add-company",
    color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
  },
  {
    title: "View Analytics",
    description: "Explore company insights",
    icon: BarChart3,
    action: "overview",
    color: "bg-green-50 hover:bg-green-100 border-green-200",
  },
  {
    title: "AI Chat",
    description: "Ask questions about companies",
    icon: MessageSquare,
    action: "chat",
    color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
  },
];

export default function DashboardHome({ onCompanySelect, onTabChange }) {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalMentions: 0,
    avgSentimentScore: "0/10",
    activeCompanies: 0,
  });
  const [recentCompanies, setRecentCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [dashboardStats, recentActivity] = await Promise.all([
        getDashboardStats(),
        getRecentCompanyActivity(),
      ]);

      setStats(dashboardStats);
      setRecentCompanies(recentActivity);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      case "neutral":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statsConfig = [
    {
      title: "Total Companies",
      value: stats.totalCompanies.toString(),
      change: `${stats.totalCompanies} monitored`,
      icon: Building2,
      color: "text-blue-600",
    },
    {
      title: "Total Mentions",
      value: stats.totalMentions.toLocaleString(),
      change: "Across all companies",
      icon: MessageSquare,
      color: "text-green-600",
    },
    {
      title: "Avg Sentiment Score",
      value: stats.avgSentimentScore,
      change: "Overall rating",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Active Monitoring",
      value: stats.activeCompanies.toString(),
      change: "Companies tracked",
      icon: Activity,
      color: "text-orange-600",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Loading Dashboard...
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Fetching your company intelligence data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Building2 className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Error Loading Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {error}
          </p>
          <Button onClick={loadDashboardData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Welcome to Varys</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Understand how the world sees your brand — with GenAI-powered insight
          from real conversations.
        </p>
        <div className="flex items-center justify-center space-x-4 pt-4">
          <Button onClick={() => onTabChange("add-company")} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Company
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => onTabChange("chat")}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Try AI Chat
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Recent Companies
            </CardTitle>
            <CardDescription>
              Companies you've been monitoring recently
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentCompanies.length > 0 ? (
              <>
                {recentCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{company.name}</h4>
                        <Badge
                          className={getSentimentColor(company.sentiment)}
                          variant="secondary"
                        >
                          {company.sentiment}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <MessageSquare className="mr-1 h-3 w-3" />
                          {company.mentions} mentions
                        </span>
                        <span>Updated {company.lastUpdated}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onCompanySelect(company.name);
                        onTabChange("overview");
                      }}
                    >
                      View <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => onTabChange("data")}
                >
                  View All Companies
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No companies found</p>
                <p className="text-xs mt-1">
                  Add your first company to get started
                </p>
                <Button
                  onClick={() => onTabChange("add-company")}
                  className="mt-4"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Company
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Get started with these common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="outline"
                className={`w-full justify-start h-auto p-4 ${action.color}`}
                onClick={() => onTabChange(action.action)}
              >
                <action.icon className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {action.description}
                  </div>
                </div>
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Features</CardTitle>
          <CardDescription>
            Discover what Varys can do for your company intelligence needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="p-3 bg-blue-50 rounded-full w-fit mx-auto">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Real-time Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Get instant insights with sentiment analysis, keyword tracking,
                and trend monitoring.
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="p-3 bg-green-50 rounded-full w-fit mx-auto">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">AI-Powered Chat</h3>
              <p className="text-sm text-muted-foreground">
                Ask natural language questions and get intelligent answers about
                company data.
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="p-3 bg-purple-50 rounded-full w-fit mx-auto">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Multi-Source Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Track mentions across social media, review sites, news, and
                professional networks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
