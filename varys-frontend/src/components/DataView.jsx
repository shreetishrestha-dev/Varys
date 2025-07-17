"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Search, Filter } from "lucide-react"

// Mock data
const mockMentions = [
  {
    id: "1",
    source: "Glassdoor",
    type: "Review",
    sentiment: "positive",
    keywords: ["salary", "benefits", "culture"],
    text: "Great company culture and competitive salary. The benefits package is excellent.",
    date: "2024-01-15",
  },
  {
    id: "2",
    source: "LinkedIn",
    type: "Post",
    sentiment: "neutral",
    keywords: ["work-life balance", "remote work"],
    text: "The company offers flexible remote work options which is great for work-life balance.",
    date: "2024-01-14",
  },
  {
    id: "3",
    source: "Indeed",
    type: "Review",
    sentiment: "negative",
    keywords: ["management", "communication"],
    text: "Management could improve communication with the team. Sometimes unclear expectations.",
    date: "2024-01-13",
  },
  {
    id: "4",
    source: "Twitter",
    type: "Tweet",
    sentiment: "positive",
    keywords: ["innovation", "technology"],
    text: "Impressed by the innovative technology solutions from this company. Great work!",
    date: "2024-01-12",
  },
  {
    id: "5",
    source: "Reddit",
    type: "Comment",
    sentiment: "neutral",
    keywords: ["interview", "process"],
    text: "The interview process was thorough but fair. They really care about finding the right fit.",
    date: "2024-01-11",
  },
]

export default function DataView({ company }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sentimentFilter, setSentimentFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [keywordFilter, setKeywordFilter] = useState("all")

  const filteredMentions = useMemo(() => {
    return mockMentions.filter((mention) => {
      const matchesSearch =
        mention.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mention.source.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSentiment = sentimentFilter === "all" || mention.sentiment === sentimentFilter
      const matchesType = typeFilter === "all" || mention.type === typeFilter
      const matchesKeyword = keywordFilter === "all" || mention.keywords.includes(keywordFilter)

      return matchesSearch && matchesSentiment && matchesType && matchesKeyword
    })
  }, [searchTerm, sentimentFilter, typeFilter, keywordFilter])

  const allKeywords = Array.from(new Set(mockMentions.flatMap((m) => m.keywords)))
  const allTypes = Array.from(new Set(mockMentions.map((m) => m.type)))

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
    <Card>
      <CardHeader>
        <CardTitle>Company Mentions - {company}</CardTitle>
        <CardDescription>View and filter all mentions and reviews for the selected company.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mentions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiments</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {allTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={keywordFilter} onValueChange={setKeywordFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Keyword" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Keywords</SelectItem>
              {allKeywords.map((keyword) => (
                <SelectItem key={keyword} value={keyword}>
                  {keyword}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredMentions.length} of {mockMentions.length} mentions
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Keywords</TableHead>
                <TableHead>Text</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMentions.map((mention) => (
                <TableRow key={mention.id}>
                  <TableCell className="font-medium">{mention.source}</TableCell>
                  <TableCell>{mention.type}</TableCell>
                  <TableCell>
                    <Badge className={getSentimentColor(mention.sentiment)}>{mention.sentiment}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {mention.keywords.slice(0, 3).map((keyword) => (
                        <Badge key={keyword} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {mention.keywords.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{mention.keywords.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate" title={mention.text}>
                      {mention.text}
                    </div>
                  </TableCell>
                  <TableCell>{mention.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
