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

import { Select, SelectContent, SelectItem } from "./ui/select";

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

import {
  getActiveProcesses,
  getLogFile,
  checkCompanyStatus,
} from "../api/appApi";

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

  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now()); // Force re-render trigger

  const statusPollingRef = useRef(null);

  const logPollingRef = useRef(null);

  const logScrollRef = useRef(null);

  // Calculate the latest process data - moved outside JSX for better React reconciliation

  const latestProcess = selectedProcess
    ? processes.find((p) => p.company === selectedProcess.company) ||
      selectedProcess
    : null;

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Select company if provided from parent

  useEffect(() => {
    if (selectedCompany && processes.length > 0) {
      const process = processes.find((p) => p.company === selectedCompany);

      if (
        process &&
        (!selectedProcess || selectedProcess.company !== selectedCompany)
      ) {
        setSelectedProcess(process);
      }
    }
  }, [selectedCompany, processes, selectedProcess]);

  // Start log polling when process is selected or changed

  useEffect(() => {
    // Clear existing logs when switching processes

    setLogs("");

    // Stop any existing log polling

    if (logPollingRef.current) {
      console.log("Stopping previous log polling");

      clearInterval(logPollingRef.current);

      logPollingRef.current = null;
    }

    if (selectedProcess && selectedProcess.log_file) {
      console.log("Starting new log polling for:", selectedProcess.company);

      // Start polling for the new process

      startLogPolling(selectedProcess.log_file);
    }

    // Cleanup function to stop polling when selectedProcess changes

    return () => {
      if (logPollingRef.current) {
        clearInterval(logPollingRef.current);

        logPollingRef.current = null;
      }
    };
  }, [selectedProcess]); // Watch selectedProcess object

  // Auto-scroll logs to bottom

  useEffect(() => {
    if (logScrollRef.current && autoRefreshLogs && logs) {
      logScrollRef.current.scrollTop = logScrollRef.current.scrollHeight;
    }
  }, [logs, autoRefreshLogs]);

  const loadProcesses = async () => {
    setLoading(true);
    setError("");
    try {
      const activeProcesses = await getActiveProcesses();
      // Force new object references to ensure React detects changes
      const processesWithNewRefs = activeProcesses.map((process) => ({
        ...process,
      }));

      setProcesses(processesWithNewRefs);
      setLastUpdateTime(Date.now()); // Force re-render

      // Always update selectedProcess with the latest info from backend
      if (selectedProcess) {
        const updatedProcess = processesWithNewRefs.find(
          (p) => p.company === selectedProcess.company
        );
        if (updatedProcess) {
          setSelectedProcess({ ...updatedProcess });
        } else {
          // If the selected process is no longer active, clear selection
          setSelectedProcess(null);
        }
      } else if (processesWithNewRefs.length > 0) {
        setSelectedProcess({ ...processesWithNewRefs[0] });
      }

      // ALWAYS start status polling after processes are loaded, regardless of count
      console.log("Starting status polling after loading processes");
      startStatusPolling(processesWithNewRefs);
    } catch (err) {
      setError("Failed to load processes");
      console.error("Error loading processes:", err);
    } finally {
      setLoading(false);
    }
  };

  const startStatusPolling = (initialProcesses = processes) => {
    if (statusPollingRef.current) clearInterval(statusPollingRef.current);

    console.log(
      "Starting status polling with processes:",
      initialProcesses.map((p) => p.company)
    );

    statusPollingRef.current = setInterval(async () => {
      try {
        console.log("=== STATUS POLLING TICK ===");

        // Get current processes from state
        const currentProcesses =
          processes.length > 0 ? processes : initialProcesses;

        if (currentProcesses.length === 0) {
          console.log("No processes to poll, skipping...");
          return;
        }

        console.log(
          "Polling status for processes:",
          currentProcesses.map((p) => p.company)
        );

        // Get fresh status for each process
        const updatedProcesses = await Promise.all(
          currentProcesses.map(async (process) => {
            try {
              console.log(`🔄 Checking status for ${process.company}...`);
              const statusResponse = await checkCompanyStatus(process.company);
              console.log(
                `✅ Status for ${process.company}:`,
                statusResponse.status
              );

              return {
                ...process,
                currentStatus: statusResponse.status,
                isCompleted: statusResponse.status === "RAG Retriever Ready",
                lastUpdated: Date.now(),
              };
            } catch (error) {
              console.error(
                `❌ Error checking status for ${process.company}:`,
                error
              );
              // Keep the old process data if status check fails
              return { ...process };
            }
          })
        );

        console.log(
          "📊 Updated processes:",
          updatedProcesses.map((p) => ({
            company: p.company,
            status: p.currentStatus,
            completed: p.isCompleted,
          }))
        );

        setProcesses([...updatedProcesses]); // Force new array reference
        setLastUpdateTime(Date.now()); // Force re-render

        // Always update selectedProcess with the latest info from backend
        if (selectedProcess) {
          const updatedProcess = updatedProcesses.find(
            (p) => p.company === selectedProcess.company
          );
          if (updatedProcess) {
            console.log(
              `🔄 Updating selected process ${selectedProcess.company}:`,
              {
                oldStatus: selectedProcess.currentStatus,
                newStatus: updatedProcess.currentStatus,
              }
            );
            // Always create new object reference to force re-render
            setSelectedProcess({ ...updatedProcess });

            // Stop status polling if the selected process is completed
            if (updatedProcess.isCompleted && !selectedProcess.isCompleted) {
              console.log(
                `✅ Process ${updatedProcess.company} completed, stopping polling`
              );
              if (statusPollingRef.current) {
                clearInterval(statusPollingRef.current);
                statusPollingRef.current = null;
              }
            }
          } else {
            setSelectedProcess(null);
          }
        } else if (updatedProcesses.length > 0) {
          setSelectedProcess({ ...updatedProcesses[0] });
        }

        // If all processes are completed, stop polling
        const hasActiveProcesses = updatedProcesses.some((p) => !p.isCompleted);
        if (!hasActiveProcesses) {
          console.log("🏁 All processes completed, stopping status polling");
          if (statusPollingRef.current) {
            clearInterval(statusPollingRef.current);
            statusPollingRef.current = null;
          }
        }
      } catch (error) {
        console.error("❌ Error in status polling:", error);
      }
    }, 5000); // Poll every 5 seconds for more responsive updates
  };

  const startLogPolling = (logFile) => {
    console.log("Starting log polling for:", logFile);

    // Initial log fetch

    fetchLogs(logFile);

    // Only start polling if the process is not completed

    if (selectedProcess && !selectedProcess.isCompleted) {
      // Set up periodic log fetching

      logPollingRef.current = setInterval(() => {
        if (
          autoRefreshLogs &&
          selectedProcess &&
          !selectedProcess.isCompleted
        ) {
          fetchLogs(logFile);
        } else if (selectedProcess && selectedProcess.isCompleted) {
          // Stop log polling if process is completed

          console.log(
            `Process for ${selectedProcess.company} is completed, stopping log polling`
          );

          if (logPollingRef.current) {
            clearInterval(logPollingRef.current);

            logPollingRef.current = null;
          }
        }
      }, 5000);
    }
  };

  const fetchLogs = async (logFile) => {
    try {
      console.log("=== FETCHING LOGS ===");

      console.log("Requested log file:", logFile);

      console.log("Selected process:", selectedProcess?.company);

      const logContent = await getLogFile(logFile);

      console.log("Log content length:", logContent.length);

      console.log("First 100 chars:", logContent.substring(0, 100));

      setLogs(logContent);
    } catch (error) {
      console.error("Error fetching logs:", error);

      setLogs(
        `Error loading logs for ${selectedProcess?.company}: ${error.message}`
      );
    }
  };

  const handleProcessSelection = (companyName) => {
    const process = processes.find((p) => p.company === companyName);

    if (process) {
      console.log("=== SELECTING NEW PROCESS ===");

      console.log("Company:", companyName);

      console.log("Log file:", process.log_file);

      console.log("Previous process:", selectedProcess?.company);

      console.log("Previous log file:", selectedProcess?.log_file);

      // Clear logs immediately to prevent showing wrong logs

      setLogs("");

      // Stop any existing polling

      if (logPollingRef.current) {
        clearInterval(logPollingRef.current);

        logPollingRef.current = null;
      }

      // Set the new process with new object reference

      setSelectedProcess({ ...process });

      // Force immediate log fetch for new process

      if (process.log_file) {
        console.log("Force fetching logs for:", process.log_file);

        fetchLogs(process.log_file);
      }

      if (onCompanySelect) {
        onCompanySelect(companyName);
      }
    }
  };

  const handleProcessCardClick = (process) => {
    console.log(
      "Card clicked for:",

      process.company,

      "with log file:",

      process.log_file
    );

    handleProcessSelection(process.company);
  };

  const getStepStatus = (step, currentStatus) => {
    if (!currentStatus) return "pending";

    const currentIndex = STATUS_STEPS.findIndex(
      (s) => s.status === currentStatus
    );

    const stepIndex = STATUS_STEPS.findIndex((s) => s.id === step.id);

    // If current status is "RAG Retriever Ready", all steps including the last one should be completed

    if (currentStatus === "RAG Retriever Ready") {
      return "completed";
    }

    if (stepIndex < currentIndex) return "completed";

    if (stepIndex === currentIndex) return "processing";

    return "pending";
  };

  const getCurrentProgress = (currentStatus) => {
    if (!currentStatus) return 0;

    if (currentStatus === "RAG Retriever Ready") return 100;

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

  const handleManualRefresh = async () => {
    console.log("🔄 Manual refresh triggered");
    await loadProcesses();

    // Also manually check status for selected process if available
    if (selectedProcess) {
      try {
        console.log(`🔄 Manual status check for ${selectedProcess.company}`);
        const statusResponse = await checkCompanyStatus(
          selectedProcess.company
        );
        console.log(`✅ Manual status result:`, statusResponse.status);

        const updatedProcess = {
          ...selectedProcess,
          currentStatus: statusResponse.status,
          isCompleted: statusResponse.status === "RAG Retriever Ready",
          lastUpdated: Date.now(),
        };

        setSelectedProcess(updatedProcess);

        // Update in processes array too
        setProcesses((prev) =>
          prev.map((p) =>
            p.company === selectedProcess.company ? updatedProcess : p
          )
        );

        setLastUpdateTime(Date.now());
      } catch (error) {
        console.error("❌ Manual status check failed:", error);
      }
    }

    // Also refresh logs if we have a selected process
    if (selectedProcess && selectedProcess.log_file) {
      console.log("🔄 Also refreshing logs for:", selectedProcess.company);
      fetchLogs(selectedProcess.log_file);
    }
  };

  const manualRefreshLogs = () => {
    if (selectedProcess && selectedProcess.log_file) {
      console.log("Manual refresh for:", selectedProcess.log_file);

      fetchLogs(selectedProcess.log_file);
    }
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

  if (processes.length === 0 && !selectedProcess) {
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

            <div className="flex items-center space-x-2">
              {selectedProcess && selectedProcess.isCompleted && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Polling Stopped - Process Complete
                </Badge>
              )}

              <Button variant="outline" size="sm" onClick={handleManualRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardTitle>

          <CardDescription>
            Monitor company processing tasks and view real-time logs. Status
            polling:{" "}
            {statusPollingRef.current ? "🟢 Active (5s)" : "🔴 Stopped"}
            <br />
            <span className="text-xs">
              Last update: {new Date(lastUpdateTime).toLocaleTimeString()}
            </span>
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
                onValueChange={handleProcessSelection}
              >
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
                  onClick={() => handleProcessCardClick(process)}
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

      {/* Selected Process Details and Log Controls */}

      {latestProcess && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                Processing Details - {latestProcess.company}
              </CardTitle>

              <CardDescription>
                Log File: {latestProcess.log_file || "Not available"}
                <span className="ml-2 text-xs">
                  (Last updated: {new Date(lastUpdateTime).toLocaleTimeString()}
                  )
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>

                  <span>
                    {getCurrentProgress(latestProcess.currentStatus)}%
                  </span>
                </div>

                <Progress
                  value={getCurrentProgress(latestProcess.currentStatus)}
                  className="w-full"
                />

                <p className="text-sm text-muted-foreground">
                  Current Status:{" "}
                  <span className="font-medium text-foreground">
                    {latestProcess.currentStatus || "Unknown"}
                  </span>
                  {latestProcess.isCompleted && (
                    <Badge
                      className="ml-2 bg-green-100 text-green-800"
                      variant="secondary"
                    >
                      Complete
                    </Badge>
                  )}
                </p>
              </div>

              <div className="space-y-3">
                {STATUS_STEPS.map((step) => {
                  const stepStatus = getStepStatus(
                    step,

                    latestProcess.currentStatus
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
                  Processing Logs - {selectedProcess.company}
                  {logFilter !== "all" && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      (Filtered: {logFilter})
                    </span>
                  )}
                  {selectedProcess.isCompleted && (
                    <Badge
                      className="ml-2 bg-green-100 text-green-800"
                      variant="secondary"
                    >
                      Final Logs
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoRefreshLogs(!autoRefreshLogs)}
                    disabled={selectedProcess.isCompleted}
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
                    onClick={manualRefreshLogs}
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
                {selectedProcess.isCompleted ? (
                  <>
                    Final logs for {selectedProcess.company} (Process completed)
                  </>
                ) : (
                  <>
                    Real-time logs from the processing script for{" "}
                    {selectedProcess.company}. Auto-refresh:{" "}
                    {autoRefreshLogs ? "ON" : "OFF"}
                  </>
                )}

                <br />

                <span className="text-xs text-muted-foreground">
                  Log file: {selectedProcess.log_file || "Not available"} | Logs
                  length = {logs.length}
                </span>
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
                  <div className="p-4 space-y-1 text-left">
                    {logs ? (
                      logs.trim() === "" ? (
                        <div className="text-xs text-muted-foreground font-mono">
                          No logs available yet...
                        </div>
                      ) : (
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
                      )
                    ) : (
                      <div className="text-xs text-muted-foreground font-mono">
                        Loading logs for {selectedProcess.company}...
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
