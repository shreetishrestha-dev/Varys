"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
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
} from "lucide-react"

const recentCompanies = [
  { id: "leapfrog", name: "Leapfrog Technology", lastUpdated: "2 hours ago", mentions: 156, sentiment: "positive" },
  { id: "cloudfactory", name: "CloudFactory", lastUpdated: "1 day ago", mentions: 203, sentiment: "positive" },
  { id: "fusemachines", name: "FUSEmachines", lastUpdated: "3 days ago", mentions: 89, sentiment: "neutral" },
]

const stats = [
  {
    title: "Total Companies",
    value: "12",
    change: "+2 this month",
    icon: Building2,
    color: "text-blue-600",
  },
  {
    title: "Total Mentions",
    value: "2,847",
    change: "+12% from last month",
    icon: MessageSquare,
    color: "text-green-600",
  },
  {
    title: "Avg Sentiment Score",
    value: "7.2/10",
    change: "+0.3 from last month",
    icon: TrendingUp,
    color: "text-purple-600",
  },
  {
    title: "Active Monitoring",
    value: "8",
    change: "Companies tracked",
    icon: Activity,
    color: "text-orange-600",
  },
]

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
]

export default function DashboardHome({ onCompanySelect, onTabChange }) {
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800"
      case "negative":
        return "bg-red-100 text-red-800"
      case "neutral":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
          Your intelligent company monitoring platform. Get real-time insights, sentiment analysis, and AI-powered
          intelligence about companies that matter to you.
        </p>
        <div className="flex items-center justify-center space-x-4 pt-4">
          <Button onClick={() => onTabChange("add-company")} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Company
          </Button>
          <Button variant="outline" size="lg" onClick={() => onTabChange("chat")}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Try AI Chat
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
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
            <CardDescription>Companies you've been monitoring recently</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentCompanies.map((company) => (
              <div
                key={company.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{company.name}</h4>
                    <Badge className={getSentimentColor(company.sentiment)} variant="secondary">
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
                    onCompanySelect(company.id)
                    onTabChange("overview")
                  }}
                >
                  View <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button variant="outline" className="w-full bg-transparent" onClick={() => onTabChange("data")}>
              View All Companies
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Get started with these common tasks</CardDescription>
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
                  <div className="text-sm text-muted-foreground">{action.description}</div>
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
          <CardDescription>Discover what Varys can do for your company intelligence needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="p-3 bg-blue-50 rounded-full w-fit mx-auto">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Real-time Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Get instant insights with sentiment analysis, keyword tracking, and trend monitoring.
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="p-3 bg-green-50 rounded-full w-fit mx-auto">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">AI-Powered Chat</h3>
              <p className="text-sm text-muted-foreground">
                Ask natural language questions and get intelligent answers about company data.
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="p-3 bg-purple-50 rounded-full w-fit mx-auto">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Multi-Source Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Track mentions across social media, review sites, news, and professional networks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
