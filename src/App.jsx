import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import axios from "axios";
import { useAppStore } from "./stores/use.store.js";

// Components
import LandingPage from "./components/organisms/LandingPage.jsx";
import QuizPage from "./components/organisms/QuizPage.jsx";
import QuizQuestions from "./components/organisms/QuizQuestions.jsx";
import Login from "./components/organisms/Login.jsx";
import Signup from "./components/organisms/Signup.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import NotificationSystem from "./components/molecules/NotificationSystem.jsx";
import AIChatBot from "./components/organisms/AIChatBot.jsx";
import { API_URL } from "./constants/api";

// Styles
import "./App.css";

// Configure axios base URL
axios.defaults.baseURL = API_URL;

function App() {
  const { auth } = useAppStore();

  useEffect(() => {
    // Check authentication status on app load
    if (auth.token && !auth.isAuthenticated) {
      auth.checkAuth();
    }
  }, [auth]);

  return (
    <Router>
      <div className="App">
        <NotificationSystem />
        <AIChatBot />

        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              auth.isAuthenticated ? <Navigate to="/" replace /> : <Login />
            }
          />
          <Route
            path="/signup"
            element={
              auth.isAuthenticated ? <Navigate to="/" replace /> : <Signup />
            }
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <LandingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/quiz/:module"
            element={
              <ProtectedRoute>
                <QuizQuestions />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
