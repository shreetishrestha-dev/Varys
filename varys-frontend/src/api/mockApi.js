const API_BASE_URL = "http://localhost:8000";

// Fetch companies from the backend
export const fetchCompanies = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/companies`);
    if (!response.ok) throw new Error("Failed to fetch companies");
    const companies = await response.json();

    // Transform the response to match the expected format
    return companies.map((company) => ({
      id: company.toLowerCase().replace(/\s+/g, "-"),
      name: company,
    }));
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
};

// Check if company exists in database
export const checkCompanyExists = async (companyName) => {
  try {
    const companies = await fetchCompanies();
    return companies.some(
      (company) => company.name.toLowerCase() === companyName.toLowerCase()
    );
  } catch (error) {
    console.error("Error checking company existence:", error);
    return false;
  }
};

// Fetch mentions for a specific company
export const fetchCompanyMentions = async (companyId, filters = {}) => {
  try {
    const params = new URLSearchParams({
      company: companyId,
      limit: filters.limit || 50,
    });

    if (filters.type) params.append("type", filters.type);
    if (filters.sentiment) params.append("sentiment", filters.sentiment);
    if (filters.keyword) params.append("keyword", filters.keyword);

    const response = await fetch(`${API_BASE_URL}/mentions?${params}`);
    if (!response.ok) throw new Error("Failed to fetch mentions");

    return await response.json();
  } catch (error) {
    console.error("Error fetching mentions:", error);
    return [];
  }
};

// Fetch sentiment breakdown
export const fetchSentimentBreakdown = async (company) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/sentiment-breakdown?company=${encodeURIComponent(
        company
      )}`
    );
    if (!response.ok) throw new Error("Failed to fetch sentiment breakdown");
    return await response.json();
  } catch (error) {
    console.error("Error fetching sentiment breakdown:", error);
    return [];
  }
};

// Fetch mention types breakdown
export const fetchMentionTypes = async (company) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/mention-types?company=${encodeURIComponent(company)}`
    );
    if (!response.ok) throw new Error("Failed to fetch mention types");
    return await response.json();
  } catch (error) {
    console.error("Error fetching mention types:", error);
    return [];
  }
};

// Fetch keywords breakdown
export const fetchKeywords = async (company) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/keywords-breakdown?company=${encodeURIComponent(
        company
      )}`
    );
    if (!response.ok) throw new Error("Failed to fetch keywords");
    return await response.json();
  } catch (error) {
    console.error("Error fetching keywords:", error);
    return [];
  }
};

// Process new company (run script)
export const processNewCompany = async (companyName, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/run-script`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company: companyName,
        limit: options.limit || 100,
        all_steps: options.allSteps || true,
      }),
    });

    if (!response.ok) throw new Error("Failed to start processing");
    const result = await response.json();

    return result;
  } catch (error) {
    console.error("Error processing company:", error);
    throw error;
  }
};

// Check company processing status
export const checkCompanyStatus = async (company) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/company/status?company=${encodeURIComponent(company)}`
    );
    if (!response.ok) throw new Error("Failed to check status");
    return await response.json();
  } catch (error) {
    console.error("Error checking company status:", error);
    return { status: "unknown" };
  }
};

// Send chat message
export const sendChatMessage = async (message, sessionId, company) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: message,
        company: company,
        session_id: sessionId,
      }),
    });

    if (!response.ok) throw new Error("Failed to send message");
    const data = await response.json();

    return {
      id: Date.now().toString(),
      role: "assistant",
      content: data.answer,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
};

// Get chat history
export const getChatHistory = async (company, sessionId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/chat/history?company=${encodeURIComponent(
        company
      )}&session_id=${sessionId}`
    );
    if (!response.ok) throw new Error("Failed to fetch chat history");
    const data = await response.json();

    return data.history.map((item, index) => ({
      id: index.toString(),
      role: item.role === "human" ? "user" : "assistant",
      content: item.message,
      timestamp: new Date(),
    }));
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
};

// Get all chat histories for a company
export const getAllChatHistories = async (company) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/chat/all-history?company=${encodeURIComponent(company)}`
    );
    if (!response.ok) throw new Error("Failed to fetch all chat histories");
    return await response.json();
  } catch (error) {
    console.error("Error fetching all chat histories:", error);
    return { histories: {} };
  }
};

// Get recent questions for a company
export const getRecentQuestions = async (company, limit = 10) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/chat/recent-questions?company=${encodeURIComponent(
        company
      )}&limit=${limit}`
    );
    if (!response.ok) throw new Error("Failed to fetch recent questions");
    return await response.json();
  } catch (error) {
    console.error("Error fetching recent questions:", error);
    return { questions: [] };
  }
};

// Get dashboard stats - aggregate data for all companies
export const getDashboardStats = async () => {
  try {
    const companies = await fetchCompanies();

    let totalMentions = 0;
    let totalSentimentScore = 0;
    let sentimentCount = 0;
    const activeCompanies = companies.length;

    // Get stats for each company
    for (const company of companies) {
      try {
        const [mentions, sentiment] = await Promise.all([
          fetchCompanyMentions(company.name, { limit: 1000 }),
          fetchSentimentBreakdown(company.name),
        ]);

        totalMentions += mentions.length;

        // Calculate average sentiment score
        const sentimentScores = { positive: 8, neutral: 5, negative: 2 };
        sentiment.forEach((item) => {
          totalSentimentScore +=
            (sentimentScores[item.sentiment] || 5) * item.count;
          sentimentCount += item.count;
        });
      } catch (error) {
        console.error(`Error fetching stats for ${company.name}:`, error);
      }
    }

    const avgSentiment =
      sentimentCount > 0
        ? (totalSentimentScore / sentimentCount).toFixed(1)
        : "0";

    return {
      totalCompanies: companies.length,
      totalMentions,
      avgSentimentScore: `${avgSentiment}/10`,
      activeCompanies,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalCompanies: 0,
      totalMentions: 0,
      avgSentimentScore: "0/10",
      activeCompanies: 0,
    };
  }
};

// Get recent company activity
export const getRecentCompanyActivity = async () => {
  try {
    const companies = await fetchCompanies();
    const recentActivity = [];

    for (const company of companies.slice(0, 5)) {
      // Limit to first 5 companies
      try {
        const [mentions, sentiment] = await Promise.all([
          fetchCompanyMentions(company.name, { limit: 100 }),
          fetchSentimentBreakdown(company.name),
        ]);

        // Determine overall sentiment
        let overallSentiment = "neutral";
        if (sentiment.length > 0) {
          const maxSentiment = sentiment.reduce((prev, current) =>
            prev.count > current.count ? prev : current
          );
          overallSentiment = maxSentiment.sentiment;
        }

        recentActivity.push({
          id: company.id,
          name: company.name,
          mentions: mentions.length,
          sentiment: overallSentiment,
          lastUpdated: "Recently", // You could add actual timestamps from your data
        });
      } catch (error) {
        console.error(`Error fetching activity for ${company.name}:`, error);
      }
    }

    return recentActivity;
  } catch (error) {
    console.error("Error fetching recent company activity:", error);
    return [];
  }
};

// Get log file content with better error handling and fallback
export const getLogFile = async (logFile) => {
  try {
    if (!logFile) {
      throw new Error("No log file specified");
    }

    // Extract just the filename if it's a full path
    const filename = logFile.includes("/") ? logFile.split("/").pop() : logFile;
    const url = `${API_BASE_URL}/logs/${filename}`;

    console.log("=== API LOG REQUEST ===");
    console.log("Original log file:", logFile);
    console.log("Extracted filename:", filename);
    console.log("Request URL:", url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch log file: ${response.status} ${response.statusText}`
      );
    }

    const logContent = await response.text();
    console.log("API Response length:", logContent.length);
    console.log("API Response preview:", logContent.substring(0, 200));

    return logContent;
  } catch (error) {
    console.error("Error fetching log file:", error);
    throw error;
  }
};

// Helper function to find log files for a company
export const findLogFilesForCompany = async (companyName) => {
  try {
    // This would require a new backend endpoint to list log files
    const response = await fetch(
      `${API_BASE_URL}/logs/list?company=${encodeURIComponent(companyName)}`
    );
    if (response.ok) {
      const logFiles = await response.json();
      return logFiles;
    }
    return [];
  } catch (error) {
    console.error("Error finding log files:", error);
    return [];
  }
};

export const getActiveProcesses = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/companies/active-processes`);
    if (!response.ok) throw new Error("Failed to fetch active processes");
    const data = await response.json();

    return data.map((item) => ({
      company: item.company,
      currentStatus: item.currentStatus,
      isCompleted: item.isCompleted,
      startTime: item.startTime,
      log_file: item.log_file,
    }));
  } catch (error) {
    console.error("Error fetching active processes:", error);
    return [];
  }
};
