"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { ScrollArea } from "./ui/scroll-area"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Send, Bot, User } from "lucide-react"

export default function ChatInterface({ selectedCompany }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => Math.random().toString(36).substring(7))
  const scrollAreaRef = useRef(null)

  // Mock responses based on common queries
  const getMockResponse = (query) => {
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes("salary") || lowerQuery.includes("pay") || lowerQuery.includes("compensation")) {
      return "Based on the mentions analyzed, employees generally report competitive salaries. The average sentiment around compensation is positive, with many mentioning good benefits packages and fair pay scales. However, some reviews suggest that salary growth could be improved for senior positions."
    }

    if (lowerQuery.includes("work") && lowerQuery.includes("hour")) {
      return "Regarding working hours, the feedback is mixed. Many employees appreciate the flexible work arrangements and remote work options. However, some mentions indicate occasional long hours during project deadlines. Overall, work-life balance seems to be a priority for the company."
    }

    if (lowerQuery.includes("culture") || lowerQuery.includes("environment")) {
      return "The company culture receives mostly positive feedback. Employees frequently mention a collaborative environment, supportive colleagues, and good team dynamics. The innovation-focused culture and learning opportunities are particularly well-regarded."
    }

    if (lowerQuery.includes("management") || lowerQuery.includes("leadership")) {
      return "Management feedback is varied. While many employees praise supportive managers and clear leadership, some reviews mention communication gaps and unclear expectations. The company seems to be working on improving management training and communication processes."
    }

    return `Based on the available data for ${selectedCompany || "the selected company"}, I can see various mentions and reviews. The overall sentiment analysis shows a mix of positive and constructive feedback. Would you like me to focus on any specific aspect like culture, benefits, or work environment?`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getMockResponse(input),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const suggestedQuestions = [
    "What do users think about the salary?",
    "Are working hours flexible?",
    "How is the company culture?",
    "What are the main complaints?",
    "How is the management team?",
  ]

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Varys AI Assistant</CardTitle>
        <CardDescription>
          Ask intelligent questions about your monitored companies and get AI-powered insights.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="mb-4">Start a conversation by asking about company insights!</p>
                {selectedCompany && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Try asking:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {suggestedQuestions.map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setInput(question)}
                          className="text-xs"
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedCompany ? `Ask about ${selectedCompany}...` : "Select a company first..."}
            disabled={!selectedCompany || isLoading}
            className="flex-1 min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button type="submit" disabled={!input.trim() || !selectedCompany || isLoading} className="self-end">
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {!selectedCompany && (
          <p className="text-sm text-muted-foreground text-center">Please select a company to start chatting</p>
        )}
      </CardContent>
    </Card>
  )
}
