"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import {
  CheckCircle,
  Circle,
  Loader2,
  FileText,
  Play,
  Pause,
  Download,
  RefreshCw,
  Clock,
} from "lucide-react";
import { getActiveProcesses, getLogFile } from "../api/mockApi";

const STATUS_STEPS = [
  { id: "preparing", name: "Preparing", status: "preparing", progress: 5 },
  { id: "started", name: "Started", status: "Started", progress: 10 },
  {
    id: "scraping",
    name: "Scraping Completed",
    status: "Scraping Completed",
    progress: 15,
  },
  {
    id: "gathering",
    name: "Info Gathering Completed",
    status: "Info Gathering Completed",
    progress: 35,
  },
  {
    id: "preprocessing",
    name: "Preprocessing Completed",
    status: "Preprocessing Completed",
    progress: 55,
  },
  {
    id: "population",
    name: "DB Population Completed",
    status: "DB Population Completed",
    progress: 75,
  },
  {
    id: "embedding",
    name: "Embedding Completed",
    status: "Embedding Completed",
    progress: 95,
  },
  {
    id: "rag",
    name: "RAG Retriever Ready",
    status: "RAG Retriever Ready",
    progress: 100,
  },
];

export default function ProcessingMonitor({
  selectedCompany,
  onCompanySelect,
}) {
  const [processes, setProcesses] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [logs, setLogs] = useState("");
  const [autoRefreshLogs, setAutoRefreshLogs] = useState(true);
  const [logFilter, setLogFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const statusPollingRef = useRef(null);
  const logPollingRef = useRef(null);
  const logScrollRef = useRef(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (statusPollingRef.current) clearInterval(statusPollingRef.current);
      if (logPollingRef.current) clearInterval(logPollingRef.current);
    };
  }, []);

  // Load processes on mount
  useEffect(() => {
    loadProcesses();
    startStatusPolling();
  }, []);

  // Select company if provided
  useEffect(() => {
    if (selectedCompany && processes.length > 0) {
      const process = processes.find((p) => p.company === selectedCompany);
      if (process) {
        setSelectedProcess(process);
      }
    }
  }, [selectedCompany, processes]);

  // Start log polling when process is selected
  useEffect(() => {
    if (selectedProcess && selectedProcess.log_file) {
      startLogPolling(selectedProcess.log_file);
    } else {
      if (logPollingRef.current) {
        clearInterval(logPollingRef.current);
      }
      setLogs("");
    }
  }, [selectedProcess]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logScrollRef.current && autoRefreshLogs) {
      logScrollRef.current.scrollTop = logScrollRef.current.scrollHeight;
    }
  }, [logs, autoRefreshLogs]);

  const loadProcesses = async () => {
    setLoading(true);
    setError("");
    try {
      const activeProcesses = await getActiveProcesses();
      setProcesses(activeProcesses);

      // If no process is selected but we have processes, select the first one
      if (!selectedProcess && activeProcesses.length > 0) {
        setSelectedProcess(activeProcesses[0]);
      }
    } catch (err) {
      setError("Failed to load processes");
      console.error("Error loading processes:", err);
    } finally {
      setLoading(false);
    }
  };

  const startStatusPolling = () => {
    if (statusPollingRef.current) clearInterval(statusPollingRef.current);

    statusPollingRef.current = setInterval(async () => {
      try {
        const activeProcesses = await getActiveProcesses();
        setProcesses(activeProcesses);

        // Update selected process if it exists
        if (selectedProcess) {
          const updatedProcess = activeProcesses.find(
            (p) => p.company === selectedProcess.company
          );
          if (updatedProcess) {
            setSelectedProcess(updatedProcess);
          }
        }
      } catch (error) {
        console.error("Error polling status:", error);
      }
    }, 60000); // Poll every minute
  };

  const startLogPolling = (logFile) => {
    if (logPollingRef.current) clearInterval(logPollingRef.current);

    // Initial log fetch
    fetchLogs(logFile);

    // Set up periodic log fetching
    logPollingRef.current = setInterval(() => {
      if (autoRefreshLogs) {
        fetchLogs(logFile);
      }
    }, 5000); // Refresh logs every 5 seconds
  };

  const fetchLogs = async (logFile) => {
    try {
      const logContent = await getLogFile(logFile);
      setLogs(logContent);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const getStepStatus = (step, currentStatus) => {
    if (!currentStatus) return "pending";

    const currentIndex = STATUS_STEPS.findIndex(
      (s) => s.status === currentStatus
    );
    const stepIndex = STATUS_STEPS.findIndex((s) => s.id === step.id);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "processing";
    return "pending";
  };

  const getCurrentProgress = (currentStatus) => {
    if (!currentStatus) return 0;
    const currentStep = STATUS_STEPS.find((s) => s.status === currentStatus);
    return currentStep ? currentStep.progress : 0;
  };

  const getStatusColor = (status) => {
    if (status === "RAG Retriever Ready") return "bg-green-100 text-green-800";
    if (status === "unknown") return "bg-red-100 text-red-800";
    return "bg-blue-100 text-blue-800";
  };

  const downloadLogs = () => {
    if (!logs || !selectedProcess) return;
    const blob = new Blob([logs], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedProcess.company}_${Date.now()}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFilteredLogs = () => {
    if (!logs || logFilter === "all") return logs;

    const lines = logs.split("\n");
    return lines
      .filter((line) => {
        const lowerLine = line.toLowerCase();
        switch (logFilter) {
          case "info":
            return (
              lowerLine.includes("info") ||
              lowerLine.includes("starting") ||
              lowerLine.includes("completed")
            );
          case "error":
            return (
              lowerLine.includes("error") ||
              lowerLine.includes("failed") ||
              lowerLine.includes("exception")
            );
          case "warning":
            return lowerLine.includes("warning") || lowerLine.includes("warn");
          default:
            return true;
        }
      })
      .join("\n");
  };

  const getLogLineColor = (line) => {
    const lowerLine = line.toLowerCase();
    if (
      lowerLine.includes("error") ||
      lowerLine.includes("failed") ||
      lowerLine.includes("exception")
    ) {
      return "text-red-600";
    }
    if (lowerLine.includes("warning") || lowerLine.includes("warn")) {
      return "text-yellow-600";
    }
    if (lowerLine.includes("completed") || lowerLine.includes("success")) {
      return "text-green-600";
    }
    if (lowerLine.includes("info") || lowerLine.includes("starting")) {
      return "text-blue-600";
    }
    return "text-gray-700";
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading processes...</span>
        </CardContent>
      </Card>
    );
  }

  if (processes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Processes</CardTitle>
          <CardDescription>
            No company processing tasks are currently running.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Start monitoring a new company to see processing status here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Process Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Processing Monitor</span>
            <Button variant="outline" size="sm" onClick={loadProcesses}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>
            Monitor company processing tasks and view real-time logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Process
              </label>
              <Select
                value={selectedProcess?.company || ""}
                onValueChange={(company) => {
                  const process = processes.find((p) => p.company === company);
                  setSelectedProcess(process);
                  if (onCompanySelect) onCompanySelect(company);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a processing task" />
                </SelectTrigger>
                <SelectContent>
                  {processes.map((process) => (
                    <SelectItem key={process.company} value={process.company}>
                      <div className="flex items-center justify-between w-full">
                        <span>{process.company}</span>
                        <Badge
                          className={`ml-2 ${getStatusColor(
                            process.currentStatus
                          )}`}
                          variant="secondary"
                        >
                          {process.isCompleted ? "Completed" : "Processing"}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Process Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {processes.map((process) => (
                <Card
                  key={process.company}
                  className={`cursor-pointer transition-colors ${
                    selectedProcess?.company === process.company
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedProcess(process);
                    if (onCompanySelect) onCompanySelect(process.company);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{process.company}</h4>
                        <Badge
                          className={getStatusColor(process.currentStatus)}
                          variant="secondary"
                        >
                          {process.isCompleted ? "Done" : "Running"}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>
                            {getCurrentProgress(process.currentStatus)}%
                          </span>
                        </div>
                        <Progress
                          value={getCurrentProgress(process.currentStatus)}
                          className="h-2"
                        />
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        Started: {formatTime(process.startTime)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Process Details */}
      {selectedProcess && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                Processing Details - {selectedProcess.company}
              </CardTitle>
              <CardDescription>
                Process ID: {selectedProcess.pid} | Log File:{" "}
                {selectedProcess.log_file}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>
                    {getCurrentProgress(selectedProcess.currentStatus)}%
                  </span>
                </div>
                <Progress
                  value={getCurrentProgress(selectedProcess.currentStatus)}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Current Status:{" "}
                  <span className="font-medium text-foreground">
                    {selectedProcess.currentStatus || "Unknown"}
                  </span>
                </p>
              </div>

              <div className="space-y-3">
                {STATUS_STEPS.map((step) => {
                  const stepStatus = getStepStatus(
                    step,
                    selectedProcess.currentStatus
                  );
                  return (
                    <div
                      key={step.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        {stepStatus === "completed" && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {stepStatus === "processing" && (
                          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                        )}
                        {stepStatus === "pending" && (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
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
                      <span className="text-xs text-muted-foreground">
                        {step.progress}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Log Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Processing Logs
                  {logFilter !== "all" && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      (Filtered: {logFilter})
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoRefreshLogs(!autoRefreshLogs)}
                  >
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      selectedProcess.log_file &&
                      fetchLogs(selectedProcess.log_file)
                    }
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadLogs}
                    disabled={!logs}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Real-time logs from the processing script. Auto-refresh:{" "}
                {autoRefreshLogs ? "ON" : "OFF"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Filter:</span>
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

                <ScrollArea
                  className="h-96 w-full rounded-md border bg-gray-50"
                  ref={logScrollRef}
                >
                  <div className="p-4 space-y-1 align-left">
                    {logs ? (
                      getFilteredLogs()
                        .split("\n")
                        .map((line, index) => (
                          <div
                            key={index}
                            className={`text-xs font-mono text-left ${getLogLineColor(
                              line
                            )}`}
                          >
                            {line || "\u00A0"}
                          </div>
                        ))
                    ) : (
                      <div className="text-xs text-muted-foreground font-mono">
                        Loading logs...
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
