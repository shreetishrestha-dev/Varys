"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Loader2 } from "lucide-react"
import { fetchSentimentBreakdown, fetchMentionTypes, fetchKeywords } from "../api/mockApi"

export default function Visualizations({ company }) {
  const [sentimentData, setSentimentData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [keywordData, setKeywordData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (company) {
      loadVisualizationData()
    }
  }, [company])

  const loadVisualizationData = async () => {
    setLoading(true)
    try {
      const [sentiment, types, keywords] = await Promise.all([
        fetchSentimentBreakdown(company),
        fetchMentionTypes(company),
        fetchKeywords(company),
      ])

      // Transform sentiment data for pie chart
      const sentimentColors = {
        positive: "#10b981",
        negative: "#ef4444",
        neutral: "#6b7280",
      }

      const transformedSentiment = sentiment.map((item) => ({
        name: item.sentiment,
        value: item.count,
        color: sentimentColors[item.sentiment] || "#6b7280",
      }))

      // Transform types data for bar chart
      const transformedTypes = types.map((item) => ({
        name: item.type,
        value: item.count,
      }))

      // Transform keywords data
      const transformedKeywords = keywords.slice(0, 10).map((item) => ({
        keyword: item.keyword,
        frequency: item.count,
      }))

      setSentimentData(transformedSentiment)
      setCategoryData(transformedTypes)
      setKeywordData(transformedKeywords)
    } catch (error) {
      console.error("Failed to load visualization data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading analytics...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Sentiment Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
            <CardDescription>Overall sentiment analysis of mentions</CardDescription>
          </CardHeader>
          <CardContent>
            {sentimentData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-4 mt-4">
                  {sentimentData.map((item) => (
                    <div key={item.name} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No sentiment data available</div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Content Categories</CardTitle>
            <CardDescription>Distribution by content type</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No category data available</div>
            )}
          </CardContent>
        </Card>

        {/* Top Keywords */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Top Keywords</CardTitle>
            <CardDescription>Most frequently mentioned keywords</CardDescription>
          </CardHeader>
          <CardContent>
            {keywordData.length > 0 ? (
              <div className="space-y-2">
                {keywordData.slice(0, 8).map((item, index) => {
                  const maxFreq = Math.max(...keywordData.map((k) => k.frequency))
                  return (
                    <div key={item.keyword} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.keyword}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(item.frequency / maxFreq) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8 text-right">{item.frequency}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No keyword data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Keyword Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Frequency Analysis</CardTitle>
          <CardDescription>Detailed view of top 10 most mentioned keywords for {company}</CardDescription>
        </CardHeader>
        <CardContent>
          {keywordData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={keywordData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="keyword" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="frequency" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No keyword data available</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
