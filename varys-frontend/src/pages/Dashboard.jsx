"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import CompanySelector from "../components/CompanySelector";
import AddCompanyForm from "../components/AddCompanyForm";
import DataView from "../components/DataView";
import Visualizations from "../components/Visualizations";
import ChatInterface from "../components/ChatInterface";
import ProcessingMonitor from "../components/ProcessingMonitor";
import DashboardHome from "../views/DashboardHome";
import {
  Building2,
  BarChart3,
  MessageSquare,
  Plus,
  Monitor,
} from "lucide-react";

export default function Dashboard() {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const handleProcessStarted = (companyName, processInfo) => {
    // Switch to monitor tab and select the company
    setSelectedCompany(companyName);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setSelectedCompany("");
              setActiveTab("overview");
              navigate("/");
            }}
          >
            <Building2 className="mr-2 h-6 w-6" />
            <h1 className="text-xl font-semibold">Varys</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Intelligence Dashboard
          </h2>
          {activeTab !== "add-company" && activeTab !== "monitor" && (
            <CompanySelector
              selectedCompany={selectedCompany}
              onCompanyChange={setSelectedCompany}
            />
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="overview">
              <BarChart3 className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="data">
              <Building2 className="mr-2 h-4 w-4" />
              Data View
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="mr-2 h-4 w-4" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="add-company">
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </TabsTrigger>
            <TabsTrigger value="monitor">
              <Monitor className="mr-2 h-4 w-4" />
              Processing Monitor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {selectedCompany ? (
              <Visualizations company={selectedCompany} />
            ) : (
              <DashboardHome
                onCompanySelect={setSelectedCompany}
                onTabChange={setActiveTab}
              />
            )}
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            {selectedCompany ? (
              <DataView company={selectedCompany} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Company Selected</CardTitle>
                  <CardDescription>
                    Please select a company to view mention data and analytics.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <ChatInterface selectedCompany={selectedCompany} />
          </TabsContent>

          <TabsContent value="add-company" className="space-y-4">
            <AddCompanyForm
              onCompanySelect={setSelectedCompany}
              onTabChange={setActiveTab}
              onProcessStarted={handleProcessStarted}
            />
          </TabsContent>

          <TabsContent value="monitor" className="space-y-4">
            <ProcessingMonitor
              selectedCompany={selectedCompany}
              onCompanySelect={setSelectedCompany}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
