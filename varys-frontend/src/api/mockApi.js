const API_BASE_URL = "http://localhost:8000"

// Fetch companies from the backend
export const fetchCompanies = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/companies`)
    if (!response.ok) throw new Error("Failed to fetch companies")
    const companies = await response.json()

    // Transform the response to match the expected format
    return companies.map((company) => ({
      id: company.toLowerCase().replace(/\s+/g, "-"),
      name: company,
    }))
  } catch (error) {
    console.error("Error fetching companies:", error)
    return []
  }
}

// Fetch mentions for a specific company
export const fetchCompanyMentions = async (companyId, filters = {}) => {
  try {
    const params = new URLSearchParams({
      company: companyId,
      limit: filters.limit || 50,
    })

    if (filters.type) params.append("type", filters.type)
    if (filters.sentiment) params.append("sentiment", filters.sentiment)
    if (filters.keyword) params.append("keyword", filters.keyword)

    const response = await fetch(`${API_BASE_URL}/mentions?${params}`)
    if (!response.ok) throw new Error("Failed to fetch mentions")

    return await response.json()
  } catch (error) {
    console.error("Error fetching mentions:", error)
    return []
  }
}

// Fetch sentiment breakdown
export const fetchSentimentBreakdown = async (company) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sentiment-breakdown?company=${encodeURIComponent(company)}`)
    if (!response.ok) throw new Error("Failed to fetch sentiment breakdown")
    return await response.json()
  } catch (error) {
    console.error("Error fetching sentiment breakdown:", error)
    return []
  }
}

// Fetch mention types breakdown
export const fetchMentionTypes = async (company) => {
  try {
    const response = await fetch(`${API_BASE_URL}/mention-types?company=${encodeURIComponent(company)}`)
    if (!response.ok) throw new Error("Failed to fetch mention types")
    return await response.json()
  } catch (error) {
    console.error("Error fetching mention types:", error)
    return []
  }
}

// Fetch keywords breakdown
export const fetchKeywords = async (company) => {
  try {
    const response = await fetch(`${API_BASE_URL}/keywords-breakdown?company=${encodeURIComponent(company)}`)
    if (!response.ok) throw new Error("Failed to fetch keywords")
    return await response.json()
  } catch (error) {
    console.error("Error fetching keywords:", error)
    return []
  }
}

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
    })

    if (!response.ok) throw new Error("Failed to start processing")
    return await response.json()
  } catch (error) {
    console.error("Error processing company:", error)
    throw error
  }
}

// Check company processing status
export const checkCompanyStatus = async (company) => {
  try {
    const response = await fetch(`${API_BASE_URL}/company/status?company=${encodeURIComponent(company)}`)
    if (!response.ok) throw new Error("Failed to check status")
    return await response.json()
  } catch (error) {
    console.error("Error checking company status:", error)
    return { status: "unknown" }
  }
}

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
    })

    if (!response.ok) throw new Error("Failed to send message")
    const data = await response.json()

    return {
      id: Date.now().toString(),
      role: "assistant",
      content: data.answer,
      timestamp: new Date(),
    }
  } catch (error) {
    console.error("Error sending chat message:", error)
    throw error
  }
}

// Get chat history
export const getChatHistory = async (company, sessionId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/chat/history?company=${encodeURIComponent(company)}&session_id=${sessionId}`,
    )
    if (!response.ok) throw new Error("Failed to fetch chat history")
    const data = await response.json()

    return data.history.map((item, index) => ({
      id: index.toString(),
      role: item.role === "human" ? "user" : "assistant",
      content: item.message,
      timestamp: new Date(),
    }))
  } catch (error) {
    console.error("Error fetching chat history:", error)
    return []
  }
}

// Get all chat histories for a company
export const getAllChatHistories = async (company) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/all-history?company=${encodeURIComponent(company)}`)
    if (!response.ok) throw new Error("Failed to fetch all chat histories")
    return await response.json()
  } catch (error) {
    console.error("Error fetching all chat histories:", error)
    return { histories: {} }
  }
}

// Get recent questions for a company
export const getRecentQuestions = async (company, limit = 10) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/chat/recent-questions?company=${encodeURIComponent(company)}&limit=${limit}`,
    )
    if (!response.ok) throw new Error("Failed to fetch recent questions")
    return await response.json()
  } catch (error) {
    console.error("Error fetching recent questions:", error)
    return { questions: [] }
  }
}

// Get log file content
export const getLogFile = async (logFile) => {
  try {
    const response = await fetch(`${API_BASE_URL}/logs/${logFile}`)
    if (!response.ok) throw new Error("Failed to fetch log file")
    return await response.text()
  } catch (error) {
    console.error("Error fetching log file:", error)
    return ""
  }
}
