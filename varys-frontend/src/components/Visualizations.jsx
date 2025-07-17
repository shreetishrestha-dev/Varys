import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock data for charts
const sentimentData = [
  { name: "Positive", value: 45, color: "#10b981" },
  { name: "Neutral", value: 35, color: "#6b7280" },
  { name: "Negative", value: 20, color: "#ef4444" },
]

const categoryData = [
  { name: "Reviews", value: 40 },
  { name: "Posts", value: 25 },
  { name: "Comments", value: 20 },
  { name: "Tweets", value: 15 },
]

const keywordData = [
  { keyword: "salary", frequency: 45 },
  { keyword: "culture", frequency: 38 },
  { keyword: "benefits", frequency: 32 },
  { keyword: "work-life balance", frequency: 28 },
  { keyword: "management", frequency: 25 },
  { keyword: "remote work", frequency: 22 },
  { keyword: "innovation", frequency: 18 },
  { keyword: "technology", frequency: 15 },
  { keyword: "communication", frequency: 12 },
  { keyword: "interview", frequency: 10 },
]

export default function Visualizations({ company }) {
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
                    {item.name}: {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Content Categories</CardTitle>
            <CardDescription>Distribution by content type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Keywords */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Top Keywords</CardTitle>
            <CardDescription>Most frequently mentioned keywords</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {keywordData.slice(0, 8).map((item, index) => (
                <div key={item.keyword} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.keyword}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(item.frequency / 45) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{item.frequency}</span>
                  </div>
                </div>
              ))}
            </div>
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={keywordData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="keyword" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="frequency" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
