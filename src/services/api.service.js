import axios from "axios";

// Configure axios base URL
axios.defaults.baseURL = "http://localhost:3000/api";

// Request interceptor to add auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("cybersage-auth-storage");
    if (token) {
      try {
        const authData = JSON.parse(token);
        if (authData.state?.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`;
        }
      } catch (error) {
        console.error("Error parsing auth token:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem("cybersage-auth-storage");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (email, password) => axios.post("/auth/login", { email, password }),

  register: (username, email, password) =>
    axios.post("/auth/register", { username, email, password }),

  logout: () => axios.get("/auth/logout"),

  checkAuth: () => axios.get("/auth/me"),

  getUser: () => axios.get("/auth/user"),
};

// News API calls
export const newsAPI = {
  getNews: () => axios.get("/news"),

  getLatestThreats: (count = 3) => axios.get("/news", { params: { count } }),
};

// Questions API calls
export const questionsAPI = {
  // Generic difficulty routes
  getEasyQuestions: (count = 5, module = null) =>
    axios.get("/questions/easy", { params: { count, module } }),

  getMediumQuestions: (count = 5, module = null) =>
    axios.get("/questions/medium", { params: { count, module } }),

  getHardQuestions: (count = 5, module = null) =>
    axios.get("/questions/hard", { params: { count, module } }),

  // Module-specific routes
  getModuleQuestions: (module, difficulty, count = 5) => {
    const modulePath = module.replace("_", "-");
    return axios.get(`/questions/${modulePath}/${difficulty}`, {
      params: { count },
    });
  },

  // Available modules
  getAvailableModules: () => axios.get("/questions/modules"),

  // Cache management
  clearCache: () => axios.delete("/questions/cache"),

  getCacheStats: () => axios.get("/questions/cache/stats"),
};

// AI Chat API calls
export const aiAPI = {
  chat: (message, sessionId = null, quizContext = null) =>
    axios.post("/ai/chat", { message, sessionId, quizContext }),

  quizFollowUp: (message, sessionId, quizQuestion, userAnswer, isCorrect) =>
    axios.post("/ai/quiz-followup", {
      message,
      sessionId,
      quizQuestion,
      userAnswer,
      isCorrect,
    }),
};

// User Progress API calls
export const progressAPI = {
  saveProgress: (progressData) => axios.post("/progress/save", progressData),

  getProgress: (userId) => axios.get(`/progress/${userId}`),

  getLeaderboard: () => axios.get("/progress/leaderboard"),
};

// Utility function for error handling
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || "Server error occurred",
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Network error
    return {
      message: "Network error. Please check your connection.",
      status: 0,
    };
  } else {
    // Other errors
    return {
      message: error.message || "An unexpected error occurred",
      status: -1,
    };
  }
};
