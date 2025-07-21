"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { ScrollArea } from "./ui/scroll-area"
import { CheckCircle, Circle, Loader2, AlertCircle, FileText, Play, Pause, Download } from "lucide-react"
import { processNewCompany, checkCompanyStatus, getLogFile } from "../api/mockApi"

const STATUS_STEPS = [
  { id: "preparing", name: "Preparing", status: "preparing", progress: 5 },
  { id: "started", name: "Started", status: "Started", progress: 10 },
  { id: "scraping", name: "Scraping Completed", status: "Scraping Completed", progress: 15 },
  { id: "gathering", name: "Info Gathering Completed", status: "Info Gathering Completed", progress: 35 },
  { id: "preprocessing", name: "Preprocessing Completed", status: "Preprocessing Completed", progress: 55 },
  { id: "population", name: "DB Population Completed", status: "DB Population Completed", progress: 75 },
  { id: "embedding", name: "Embedding Completed", status: "Embedding Completed", progress: 95 },
  { id: "rag", name: "RAG Retriever Ready", status: "RAG Retriever Ready", progress: 100 },
]

export default function AddCompanyForm() {
  const [companyName, setCompanyName] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [processInfo, setProcessInfo] = useState(null)
  const [currentStatus, setCurrentStatus] = useState("")
  const [logs, setLogs] = useState("")
  const [autoRefreshLogs, setAutoRefreshLogs] = useState(true)
  const [limit, setLimit] = useState(100)
  const [logFilter, setLogFilter] = useState("all") // all, info, error, warning

  const statusPollingRef = useRef(null)
  const logPollingRef = useRef(null)
  const logScrollRef = useRef(null)

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (statusPollingRef.current) clearInterval(statusPollingRef.current)
      if (logPollingRef.current) clearInterval(logPollingRef.current)
    }
  }, [])

  // Auto-scroll logs to bottom when new content is added
  useEffect(() => {
    if (logScrollRef.current && autoRefreshLogs) {
      logScrollRef.current.scrollTop = logScrollRef.current.scrollHeight
    }
  }, [logs, autoRefreshLogs])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!companyName.trim()) return

    setIsProcessing(true)
    setError("")
    setCurrentStatus("")
    setLogs("")

    try {
      // Start the processing
      const result = await processNewCompany(companyName, { limit, allSteps: true })
      setProcessInfo(result)

      // Start polling for status updates
      startStatusPolling()

      // Start polling for log updates
      if (result.log_file) {
        startLogPolling(result.log_file)
      }
    } catch (err) {
      setError(err.message || "Failed to start processing")
      setIsProcessing(false)
    }
  }

  const startStatusPolling = () => {
    // Clear any existing polling
    if (statusPollingRef.current) clearInterval(statusPollingRef.current)

    statusPollingRef.current = setInterval(async () => {
      try {
        const statusResponse = await checkCompanyStatus(companyName)
        setCurrentStatus(statusResponse.status)

        // Stop polling if we've reached the final status
        if (statusResponse.status === "RAG Retriever Ready") {
          clearInterval(statusPollingRef.current)
          setIsProcessing(false)

          // Stop log polling as well
          if (logPollingRef.current) {
            clearInterval(logPollingRef.current)
          }

          // Reset form
          setTimeout(() => {
            setCompanyName("")
            setProcessInfo(null)
            setCurrentStatus("")
            setLogs("")
          }, 5000) // Give user more time to see completion
        }
      } catch (error) {
        console.error("Error checking status:", error)
      }
    }, 60000) // Poll every minute
  }

  const startLogPolling = (logFile) => {
    // Clear any existing log polling
    if (logPollingRef.current) clearInterval(logPollingRef.current)

    // Initial log fetch
    fetchLogs(logFile)

    // Set up periodic log fetching
    logPollingRef.current = setInterval(() => {
      if (autoRefreshLogs) {
        fetchLogs(logFile)
      }
    }, 5000) // Refresh logs every 5 seconds for more real-time feel
  }

  const fetchLogs = async (logFile) => {
    try {
      const logContent = await getLogFile(logFile)
      setLogs(logContent)
    } catch (error) {
      console.error("Error fetching logs:", error)
    }
  }

  const getStepStatus = (step) => {
    if (!currentStatus) return "pending"

    const currentIndex = STATUS_STEPS.findIndex((s) => s.status === currentStatus)
    const stepIndex = STATUS_STEPS.findIndex((s) => s.id === step.id)

    if (stepIndex < currentIndex) return "completed"
    if (stepIndex === currentIndex) return "processing"
    return "pending"
  }

  const getCurrentProgress = () => {
    if (!currentStatus) return 0
    const currentStep = STATUS_STEPS.find((s) => s.status === currentStatus)
    return currentStep ? currentStep.progress : 0
  }

  const handleStop = () => {
    if (statusPollingRef.current) clearInterval(statusPollingRef.current)
    if (logPollingRef.current) clearInterval(logPollingRef.current)
    setIsProcessing(false)
    setCurrentStatus("")
    setProcessInfo(null)
    setLogs("")
  }

  const downloadLogs = () => {
    if (!logs) return
    const blob = new Blob([logs], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${companyName}_${Date.now()}.log`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getFilteredLogs = () => {
    if (!logs || logFilter === "all") return logs

    const lines = logs.split("\n")
    return lines
      .filter((line) => {
        const lowerLine = line.toLowerCase()
        switch (logFilter) {
          case "info":
            return lowerLine.includes("info") || lowerLine.includes("starting") || lowerLine.includes("completed")
          case "error":
            return lowerLine.includes("error") || lowerLine.includes("failed") || lowerLine.includes("exception")
          case "warning":
            return lowerLine.includes("warning") || lowerLine.includes("warn")
          default:
            return true
        }
      })
      .join("\n")
  }

  const getLatestLogLines = (maxLines = 10) => {
    if (!logs) return ""
    const lines = logs.split("\n").filter((line) => line.trim())
    return lines.slice(-maxLines).join("\n")
  }

  const getLogLineColor = (line) => {
    const lowerLine = line.toLowerCase()
    if (lowerLine.includes("error") || lowerLine.includes("failed") || lowerLine.includes("exception")) {
      return "text-red-600"
    }
    if (lowerLine.includes("warning") || lowerLine.includes("warn")) {
      return "text-yellow-600"
    }
    if (lowerLine.includes("completed") || lowerLine.includes("success")) {
      return "text-green-600"
    }
    if (lowerLine.includes("info") || lowerLine.includes("starting")) {
      return "text-blue-600"
    }
    return "text-gray-700"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monitor New Company</CardTitle>
          <CardDescription>
            Add a new company to your monitoring dashboard and start gathering intelligence data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Enter company name..."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={isProcessing}
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Limit (default: 100)"
                  value={limit}
                  onChange={(e) => setLimit(Number.parseInt(e.target.value) || 100)}
                  disabled={isProcessing}
                  min="10"
                  max="1000"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={isProcessing || !companyName.trim()} className="flex-1">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Begin Monitoring
                  </>
                )}
              </Button>

              {isProcessing && (
                <Button type="button" variant="outline" onClick={handleStop}>
                  <Pause className="mr-2 h-4 w-4" />
                  Stop
                </Button>
              )}
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {isProcessing && processInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Intelligence Gathering in Progress</CardTitle>
            <CardDescription>
              Processing {companyName}... Please wait while we gather and analyze data.
              <span className="block mt-1 text-xs">
                Process ID: {processInfo.pid} | Log: {processInfo.log_file}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{getCurrentProgress()}%</span>
              </div>
              <Progress value={getCurrentProgress()} className="w-full" />
              {currentStatus && (
                <p className="text-sm text-muted-foreground">
                  Current Status: <span className="font-medium text-foreground">{currentStatus}</span>
                </p>
              )}
            </div>

            <div className="space-y-3">
              {STATUS_STEPS.map((step) => {
                const stepStatus = getStepStatus(step)
                return (
                  <div key={step.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {stepStatus === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {stepStatus === "processing" && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
                      {stepStatus === "pending" && <Circle className="h-5 w-5 text-gray-400" />}
                      <span
                        className={`text-sm ${
                          stepStatus === "completed"
                            ? "text-green-700 font-medium"
                            : stepStatus === "processing"
                              ? "text-blue-700 font-medium"
                              : "text-gray-500"
                        }`}
                      >
                        {step.name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{step.progress}%</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {processInfo && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Latest Logs Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Latest Activity
              </CardTitle>
              <CardDescription>Most recent log entries (last 10 lines)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto bg-gray-50 rounded-md p-3">
                {getLatestLogLines(10)
                  .split("\n")
                  .filter((line) => line.trim())
                  .map((line, index) => (
                    <div key={index} className={`text-xs font-mono ${getLogLineColor(line)}`}>
                      {line}
                    </div>
                  ))}
                {!logs && <div className="text-xs text-muted-foreground font-mono">Waiting for logs...</div>}
              </div>
            </CardContent>
          </Card>

          {/* Log Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Log Controls</CardTitle>
              <CardDescription>Manage log viewing and filtering options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Auto-refresh</span>
                <Button variant="outline" size="sm" onClick={() => setAutoRefreshLogs(!autoRefreshLogs)}>
                  {autoRefreshLogs ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Resume
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Manual refresh</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => processInfo.log_file && fetchLogs(processInfo.log_file.split("/")[1])}
                >
                  Refresh Now
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Download logs</span>
                <Button variant="outline" size="sm" onClick={downloadLogs} disabled={!logs}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Filter logs</span>
                <div className="grid grid-cols-2 gap-2">
                  {["all", "info", "error", "warning"].map((filter) => (
                    <Button
                      key={filter}
                      variant={logFilter === filter ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLogFilter(filter)}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {processInfo && logs && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Full Processing Logs
                {logFilter !== "all" && (
                  <span className="ml-2 text-sm text-muted-foreground">(Filtered: {logFilter})</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Success</span>
                  <div className="w-2 h-2 bg-red-500 rounded-full ml-2"></div>
                  <span>Error</span>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full ml-2"></div>
                  <span>Warning</span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                  <span>Info</span>
                </div>
              </div>
            </CardTitle>
            <CardDescription>
              Complete log output from the processing script. Auto-refresh: {autoRefreshLogs ? "ON" : "OFF"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 w-full rounded-md border bg-gray-50" ref={logScrollRef}>
              <div className="p-4 space-y-1">
                {getFilteredLogs()
                  .split("\n")
                  .map((line, index) => (
                    <div key={index} className={`text-xs font-mono ${getLogLineColor(line)}`}>
                      {line || "\u00A0"} {/* Non-breaking space for empty lines */}
                    </div>
                  ))}
                {!logs && <div className="text-xs text-muted-foreground font-mono">Loading logs...</div>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
