"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { CheckCircle, Circle, Loader2 } from "lucide-react"

export default function AddCompanyForm() {
  const [companyName, setCompanyName] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [steps, setSteps] = useState([
    { id: "scraping", name: "Scraping", status: "pending" },
    { id: "gathering", name: "Info Gathering", status: "pending" },
    { id: "preprocessing", name: "Preprocessing", status: "pending" },
    { id: "populating", name: "Populating Mentions", status: "pending" },
    { id: "vectorstore", name: "Building Vector Store", status: "pending" },
  ])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!companyName.trim()) return

    setIsProcessing(true)

    // Simulate processing steps
    for (let i = 0; i < steps.length; i++) {
      setSteps((prev) =>
        prev.map((step, index) => ({
          ...step,
          status: index === i ? "processing" : index < i ? "completed" : "pending",
        })),
      )

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setSteps((prev) =>
        prev.map((step, index) => ({
          ...step,
          status: index <= i ? "completed" : "pending",
        })),
      )
    }

    setIsProcessing(false)
    setCompanyName("")
  }

  const completedSteps = steps.filter((step) => step.status === "completed").length
  const progress = (completedSteps / steps.length) * 100

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
            <div className="flex space-x-2">
              <Input
                placeholder="Enter company name..."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isProcessing}
                className="flex-1"
              />
              <Button type="submit" disabled={isProcessing || !companyName.trim()}>
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
          </form>
        </CardContent>
      </Card>

      {isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle>Intelligence Gathering in Progress</CardTitle>
            <CardDescription>Processing {companyName}... Please wait while we gather and analyze data.</CardDescription>
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
                  {step.status === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {step.status === "processing" && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
                  {step.status === "pending" && <Circle className="h-5 w-5 text-gray-400" />}
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
  )
}
