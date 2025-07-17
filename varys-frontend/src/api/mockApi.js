// Mock API functions for demonstration
export const fetchCompanies = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: "leapfrog", name: "Leapfrog Technology" },
        { id: "cloudfactory", name: "CloudFactory" },
        { id: "fusemachines", name: "FUSEmachines" },
        { id: "verisk", name: "Verisk Nepal" },
        { id: "deerwalk", name: "Deerwalk" },
      ]);
    }, 1000);
  });
};

export const fetchCompanyMentions = async (companyId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "1",
          source: "Glassdoor",
          type: "Review",
          sentiment: "positive",
          keywords: ["salary", "benefits", "culture"],
          text: "Great company culture and competitive salary. The benefits package is excellent.",
          date: "2024-01-15",
        },
        // Add more mock data as needed
      ]);
    }, 1000);
  });
};

export const processNewCompany = async (companyName) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Successfully processed ${companyName}`,
        companyId: companyName.toLowerCase().replace(/\s+/g, "-"),
      });
    }, 10000); // 10 seconds for full processing simulation
  });
};

export const sendChatMessage = async (message, sessionId, companyId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now().toString(),
        role: "assistant",
        content: `This is a mock response to: "${message}". In a real implementation, this would be processed by your FastAPI backend.`,
        timestamp: new Date(),
      });
    }, 1500);
  });
};
