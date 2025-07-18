"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { sendChatMessage, getChatHistory } from "../api/mockApi";

export default function ChatInterface({ selectedCompany }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Load chat history when company changes
  useEffect(() => {
    if (selectedCompany) {
      loadChatHistory();
    } else {
      setMessages([]);
    }
  }, [selectedCompany]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const loadChatHistory = async () => {
    try {
      const history = await getChatHistory(selectedCompany, sessionId);
      setMessages(history);
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !selectedCompany) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const assistantMessage = await sendChatMessage(
        input,
        sessionId,
        selectedCompany
      );
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, I encountered an error while processing your message. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "What do users think about the salary?",
    "Are working hours flexible?",
    "How is the company culture?",
    "What are the main complaints?",
    "How is the management team?",
  ];

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="h-[700px] flex flex-col bg-gradient-to-b from-background to-muted/20">
      <CardHeader className="border-b bg-background/80 backdrop-blur-sm">
        <CardTitle className="flex items-center">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mr-3">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          Varys AI Assistant
        </CardTitle>
        <CardDescription>
          Ask intelligent questions about{" "}
          {selectedCompany || "your monitored companies"} and get AI-powered
          insights.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 px-4 py-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full w-fit mx-auto mb-6">
                  <Bot className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Start a conversation!
                </h3>
                <p className="text-muted-foreground mb-6">
                  Ask me anything about company insights and data.
                </p>
                {selectedCompany && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">
                      Try asking:
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                      {suggestedQuestions.map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setInput(question)}
                          className="text-xs hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
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
                className={`flex items-start space-x-3 ${
                  message.role === "user" ? "flex-row" : "flex-row-reverse"
                }`}
              >
                {/* Avatar */}
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className={message.role === "user" ? "bg-blue-100" : "bg-purple-100"}>
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Bot className="h-4 w-4 text-purple-600" />
                    )}
                  </AvatarFallback>
                </Avatar>
                {/* Message Content */}
                <div className={`flex-1 space-y-1 ${message.role === "user" ? "text-left" : "text-right"}`}>
                  <div className={`flex items-center space-x-2 ${message.role === "user" ? "justify-start" : "justify-end"}`}>
                    <span className="text-sm font-medium">{message.role === "user" ? "You" : "Varys AI"}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                  </div>
                  <div className={`inline-block max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${message.role === "user" ? "bg-blue-500 text-white rounded-tl-md" : "bg-muted border rounded-tl-md"}`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-purple-100">
                    <Bot className="h-4 w-4 text-purple-600" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Varys AI</span>
                    <span className="text-xs text-muted-foreground">
                      thinking...
                    </span>
                  </div>
                  <div className="inline-block bg-muted border rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Form */}
        <div className="border-t bg-background/80 backdrop-blur-sm p-4">
          {!selectedCompany && (
            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                Please select a company to start chatting
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  selectedCompany
                    ? `Ask about ${selectedCompany}...`
                    : "Select a company first..."
                }
                disabled={!selectedCompany || isLoading}
                className="min-h-[50px] max-h-[120px] resize-none pr-12 rounded-xl border-2 focus:border-blue-300 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!input.trim() || !selectedCompany || isLoading}
                size="sm"
                className="absolute right-2 bottom-2 h-8 w-8 p-0 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-muted"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Press Enter to send, Shift+Enter for new line</span>
            {selectedCompany && (
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                Connected to {selectedCompany}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
