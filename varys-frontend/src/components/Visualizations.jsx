"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2, MessageSquare, User } from "lucide-react";
import {
  fetchSentimentBreakdown,
  fetchMentionTypes,
  fetchKeywords,
  getRecentQuestions,
} from "../api/appApi";
import { Avatar, AvatarFallback } from "./ui/avatar";

export default function Visualizations({ company }) {
  const [sentimentData, setSentimentData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [keywordData, setKeywordData] = useState([]);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (company) {
      loadVisualizationData();
    }
  }, [company]);

  const loadVisualizationData = async () => {
    setLoading(true);
    try {
      const [sentiment, types, keywords, questions] = await Promise.all([
        fetchSentimentBreakdown(company),
        fetchMentionTypes(company),
        fetchKeywords(company),
        getRecentQuestions(company, 15), // Get more questions for better visualization
      ]);

      // Transform sentiment data for pie chart
      const sentimentColors = {
        positive: "#10b981",
        negative: "#ef4444",
        neutral: "#6b7280",
      };

      const transformedSentiment = sentiment.map((item) => ({
        name: item.sentiment,
        value: item.count,
        color: sentimentColors[item.sentiment] || "#6b7280",
      }));

      // Transform types data for bar chart
      const transformedTypes = types.map((item) => ({
        name: item.type,
        value: item.count,
      }));

      // Transform keywords data
      const transformedKeywords = keywords.slice(0, 10).map((item) => ({
        keyword: item.keyword,
        frequency: item.count,
      }));

      // Transform questions data
      const transformedQuestions = questions.questions.map(
        (question, index) => ({
          question: question,
          timestamp: new Date(Date.now() - index * 60000), // Mock timestamps for now
          id: index,
        })
      );

      setSentimentData(transformedSentiment);
      setCategoryData(transformedTypes);
      setKeywordData(transformedKeywords);
      setRecentQuestions(transformedQuestions);
    } catch (error) {
      console.error("Failed to load visualization data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionCategory = (question) => {
    const lowerQuestion = question.toLowerCase();
    if (
      lowerQuestion.includes("salary") ||
      lowerQuestion.includes("pay") ||
      lowerQuestion.includes("compensation")
    ) {
      return { category: "Compensation", color: "#10b981" };
    } else if (
      lowerQuestion.includes("culture") ||
      lowerQuestion.includes("environment") ||
      lowerQuestion.includes("work life")
    ) {
      return { category: "Culture", color: "#3b82f6" };
    } else if (
      lowerQuestion.includes("management") ||
      lowerQuestion.includes("manager") ||
      lowerQuestion.includes("leadership")
    ) {
      return { category: "Management", color: "#8b5cf6" };
    } else if (
      lowerQuestion.includes("career") ||
      lowerQuestion.includes("growth") ||
      lowerQuestion.includes("promotion")
    ) {
      return { category: "Career Growth", color: "#f59e0b" };
    } else if (
      lowerQuestion.includes("benefit") ||
      lowerQuestion.includes("insurance") ||
      lowerQuestion.includes("vacation")
    ) {
      return { category: "Benefits", color: "#ef4444" };
    } else {
      return { category: "General", color: "#6b7280" };
    }
  };

  const questionCategories = recentQuestions.reduce((acc, q) => {
    const { category } = getQuestionCategory(q.question);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const questionCategoryData = Object.entries(questionCategories).map(
    ([category, count]) => ({
      name: category,
      value: count,
      color: getQuestionCategory(`${category.toLowerCase()}`).color,
    })
  );

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Sentiment Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
            <CardDescription>
              Overall sentiment analysis of mentions
            </CardDescription>
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
                    <div
                      key={item.name}
                      className="flex items-center space-x-2"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No sentiment data available
              </div>
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
              <div className="text-center py-8 text-muted-foreground">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Keywords */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Top Keywords</CardTitle>
            <CardDescription>
              Most frequently mentioned keywords
            </CardDescription>
          </CardHeader>
          <CardContent>
            {keywordData.length > 0 ? (
              <div className="space-y-2">
                {keywordData.slice(0, 8).map((item, index) => {
                  const maxFreq = Math.max(
                    ...keywordData.map((k) => k.frequency)
                  );
                  return (
                    <div
                      key={item.keyword}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">
                        {item.keyword}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(item.frequency / maxFreq) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8 text-right">
                          {item.frequency}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No keyword data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Chat Questions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Recent Questions Asked
            </CardTitle>
            <CardDescription>
              Latest questions from AI chat sessions about {company}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentQuestions.length > 0 ? (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {recentQuestions.slice(0, 10).map((item, index) => {
                  const { category, color } = getQuestionCategory(item.question);
                  // If you have AI answers, align them right. Here, only user questions are shown, so align left.
                  return (
                    <div
                      key={item.id || index}
                      className="flex flex-row items-start space-x-3 justify-start"
                    >
                      {/* Avatar */}
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-blue-100">
                          <User className="h-4 w-4 text-blue-600" />
                        </AvatarFallback>
                      </Avatar>
                      {/* Message Content */}
                      <div className="flex-1 space-y-1 text-left">
                        <div className="flex items-center space-x-2 justify-start">
                          <span className="text-sm font-medium">User</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(item.timestamp)}
                          </span>
                        </div>
                        <div className="inline-block max-w-[90%] px-4 py-3 bg-blue-500 text-white rounded-2xl rounded-tl-md text-sm leading-relaxed">
                          <p>{item.question}</p>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: `${color}20`, color: color }}
                          >
                            {category}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No recent questions found</p>
                <p className="text-xs mt-1">
                  Start asking questions in the AI chat to see them here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Question Categories Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Question Categories</CardTitle>
            <CardDescription>
              Distribution of question types asked about {company}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {questionCategoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={questionCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {questionCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {questionCategoryData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-left space-x-2"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No question categories yet</p>
                <p className="text-xs mt-1">
                  Categories will appear as users ask questions
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
