"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";
import { CheckCircle, Circle, Loader2, AlertCircle } from "lucide-react";
import { processNewCompany } from "../api/mockApi";

export default function AddCompanyForm() {
  const [companyName, setCompanyName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [processInfo, setProcessInfo] = useState(null);
  const [steps, setSteps] = useState([
    { id: "scraping", name: "Scraping", status: "pending" },
    { id: "gathering", name: "Info Gathering", status: "pending" },
    { id: "preprocessing", name: "Preprocessing", status: "pending" },
    { id: "populating", name: "Populating Mentions", status: "pending" },
    { id: "vectorstore", name: "Building Vector Store", status: "pending" },
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsProcessing(true);
    setError("");

    try {
      // Start the processing
      const result = await processNewCompany(companyName, {
        limit: 100,
        allSteps: true,
      });
      setProcessInfo(result);

      // Simulate progress updates (in a real app, you might poll the status endpoint)
      simulateProgress();
    } catch (err) {
      setError(err.message || "Failed to start processing");
      setIsProcessing(false);
    }
  };

  const simulateProgress = async () => {
    // This is a simulation - in a real app, you'd poll the status endpoint
    for (let i = 0; i < steps.length; i++) {
      setSteps((prev) =>
        prev.map((step, index) => ({
          ...step,
          status:
            index === i ? "processing" : index < i ? "completed" : "pending",
        }))
      );

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 3000));

      setSteps((prev) =>
        prev.map((step, index) => ({
          ...step,
          status: index <= i ? "completed" : "pending",
        }))
      );
    }

    setIsProcessing(false);
    setCompanyName("");
    setProcessInfo(null);
  };

  const completedSteps = steps.filter(
    (step) => step.status === "completed"
  ).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monitor New Company</CardTitle>
          <CardDescription>
            Add a new company to your monitoring dashboard and start gathering
            intelligence data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter company name..."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isProcessing}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isProcessing || !companyName.trim()}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Begin Monitoring"
                )}
              </Button>
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

      {isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle>Intelligence Gathering in Progress</CardTitle>
            <CardDescription>
              Processing {companyName}... Please wait while we gather and
              analyze data.
              {processInfo && (
                <span className="block mt-1 text-xs">
                  Process ID: {processInfo.pid} | Log: {processInfo.log_file}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>

            <div className="space-y-3">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center space-x-3">
                  {step.status === "completed" && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {step.status === "processing" && (
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  )}
                  {step.status === "pending" && (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <span
                    className={`text-sm ${
                      step.status === "completed"
                        ? "text-green-700"
                        : step.status === "processing"
                        ? "text-blue-700"
                        : "text-gray-500"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
