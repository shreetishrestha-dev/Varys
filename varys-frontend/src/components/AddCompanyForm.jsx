"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Loader2,
  AlertCircle,
  Play,
  Building2,
  ArrowRight,
  CheckCircle,
  Monitor,
  X,
} from "lucide-react";
import { processNewCompany, checkCompanyExists } from "../api/appApi";

export default function AddCompanyForm({
  onCompanySelect,
  onTabChange,
  onProcessStarted,
}) {
  const [companyName, setCompanyName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingExistence, setIsCheckingExistence] = useState(false);
  const [error, setError] = useState("");
  const [companyExists, setCompanyExists] = useState(false);
  const [limit, setLimit] = useState(100);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [processedCompanyName, setProcessedCompanyName] = useState("");

  // Use useRef instead of useState for timeout ref
  const checkExistenceTimeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (checkExistenceTimeoutRef.current) {
        clearTimeout(checkExistenceTimeoutRef.current);
      }
    };
  }, []);

  // Check if company exists when user types
  useEffect(() => {
    if (checkExistenceTimeoutRef.current) {
      clearTimeout(checkExistenceTimeoutRef.current);
    }

    if (companyName.trim().length > 2) {
      checkExistenceTimeoutRef.current = setTimeout(async () => {
        setIsCheckingExistence(true);
        try {
          const exists = await checkCompanyExists(companyName.trim());
          setCompanyExists(exists);
        } catch (error) {
          console.error("Error checking company existence:", error);
          setCompanyExists(false);
        } finally {
          setIsCheckingExistence(false);
        }
      }, 500); // Debounce for 500ms
    } else {
      setCompanyExists(false);
    }
  }, [companyName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName.trim() || companyExists) return;

    setIsProcessing(true);
    setError("");

    try {
      // Double-check company existence before processing
      const exists = await checkCompanyExists(companyName.trim());
      if (exists) {
        setError(
          "This company already exists in the database. Please choose a different company."
        );
        setCompanyExists(true);
        setIsProcessing(false);
        return;
      }

      // Start the processing
      const result = await processNewCompany(companyName, {
        limit,
        allSteps: true,
      });

      // Store the processed company name for the modal
      setProcessedCompanyName(companyName);

      // Clear form
      setCompanyName("");
      setLimit(100);
      setCompanyExists(false);

      // Notify parent component if callback provided
      if (onProcessStarted) {
        onProcessStarted(companyName, result);
      }

      // Show success modal (do not auto-redirect)
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message || "Failed to start processing");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewExistingCompany = () => {
    if (onCompanySelect && onTabChange) {
      onCompanySelect(companyName.trim());
      onTabChange("overview");
    }
  };

  // Only go to monitor tab if user clicks button in modal
  const [isRedirecting, setIsRedirecting] = useState(false);
  const handleGoToMonitor = () => {
    setIsRedirecting(true);
    setShowSuccessModal(false);
    if (onCompanySelect) {
      onCompanySelect(processedCompanyName.trim());
    }
    setTimeout(() => {
      setIsRedirecting(false);
      if (onTabChange) {
        onTabChange("monitor");
      }
    }, 5000);
  };

  const handleStayHere = () => {
    setShowSuccessModal(false);
    setProcessedCompanyName("");
  };

  return (
    <>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                  <Input
                    placeholder="Enter company name..."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={isProcessing}
                    className={`w-full ${
                      companyExists ? "border-amber-300 bg-amber-50" : ""
                    }`}
                  />
                  {isCheckingExistence && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Limit (default: 100)"
                    value={limit}
                    onChange={(e) =>
                      setLimit(Number.parseInt(e.target.value) || 100)
                    }
                    disabled={isProcessing}
                    min="10"
                    max="1000"
                  />
                </div>
              </div>

              {/* Company exists warning */}
              {companyExists && (
                <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        Company "{companyName}" already exists in the database
                      </p>
                      <p className="text-xs text-amber-700">
                        You can view the existing data or choose a different
                        company to monitor.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleViewExistingCompany}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100 bg-transparent"
                  >
                    View Data
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={
                    isProcessing ||
                    !companyName.trim() ||
                    companyExists ||
                    isCheckingExistence
                  }
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting Process...
                    </>
                  ) : isCheckingExistence ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Begin Monitoring
                    </>
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

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Understanding the company monitoring process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Processing Steps</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Data scraping and collection</li>
                    <li>• Information gathering and analysis</li>
                    <li>• Data preprocessing and cleaning</li>
                    <li>• Database population</li>
                    <li>• Embedding generation</li>
                    <li>• RAG retriever setup</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Monitoring Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Real-time progress tracking</li>
                    <li>• Live log streaming</li>
                    <li>• Process persistence across sessions</li>
                    <li>• Multiple company processing</li>
                    <li>• Detailed status reporting</li>
                    <li>• Log filtering and download</li>
                  </ul>
                </div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Once you start monitoring a company,
                  you can navigate away from this page and return to the
                  Processing Monitor to check progress at any time. All
                  processing tasks are tracked persistently.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal || isRedirecting} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900">
          <DialogHeader>
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <DialogTitle className="text-green-800">
                Processing Started!
              </DialogTitle>
            </div>
            <DialogDescription className="text-left">
              <div className="space-y-3">
                <p>
                  We've started processing{" "}
                  <strong>"{processedCompanyName}"</strong> and gathering
                  intelligence data.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Monitor className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800 mb-1">
                        Next Steps
                      </p>
                      <ul className="text-blue-700 space-y-1 text-xs">
                        <li>• Data scraping and collection has begun</li>
                        <li>• Real-time progress tracking is available</li>
                        <li>• You can monitor logs and status updates</li>
                        <li>• Process continues even if you navigate away</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Go to the <strong>Processing Monitor</strong> tab to visualize progress, or stay here to add more companies.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {isRedirecting ? (
              <div className="flex items-center justify-center w-full py-4">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-green-600" />
                <span className="text-green-700 text-sm">Redirecting to Processing Monitor...</span>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleStayHere}
                  className="w-full sm:w-auto bg-transparent"
                >
                  <X className="mr-2 h-4 w-4" />
                  Stay Here
                </Button>
                <Button onClick={handleGoToMonitor} className="w-full sm:w-auto">
                  <Monitor className="mr-2 h-4 w-4" />
                  Go to Processing Monitor
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
