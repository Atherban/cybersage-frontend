import React from "react";
import "./LandingPage.css";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store.js"; // Adjust path as needed
import { useAppStore } from "../../stores/use.store.js"; // If you have other stores
import NewsSection from "../molecules/NewsSection";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();

  // If you have other stores, you can include them too
  const { quiz, ui } = useAppStore?.() || {};

  const handleStartQuiz = () => {
    navigate("/quiz");
  };

  const handleLogout = async () => {
    try {
      // Show loading state if you have a UI store
      if (ui?.setLoading) {
        ui.setLoading("auth", true);
      }

      // Call the logout function from auth store
      await logout();

      // Clear any additional store data if needed
      if (quiz?.resetQuiz) {
        quiz.resetQuiz();
      }

      // Clear any additional localStorage items
      localStorage.removeItem("quizProgress");
      localStorage.removeItem("userPreferences");
      localStorage.removeItem("cybersage-app-storage"); // If you have other stores

      // Show success notification
      if (ui?.addNotification) {
        ui.addNotification("Logged out successfully", "success");
      }

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);

      // Show error notification
      if (ui?.addNotification) {
        ui.addNotification("Error during logout", "error");
      }
    } finally {
      // Clear loading state
      if (ui?.setLoading) {
        ui.setLoading("auth", false);
      }
    }
  };

  const handleConfirmLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      handleLogout();
    }
  };

  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo-container">
            <h4 className="font-title">CyberSage</h4>
          </div>
          <div className="nav-links-container">
            <ul className="nav-links">
              <li className="font-hero" onClick={() => navigate("/about")}>
                about
              </li>
              <li onClick={() => navigate("/quiz")} className="font-hero">
                quiz
              </li>
            </ul>
          </div>
          <div className="logout-container">
            <button className="logout-btn" onClick={handleConfirmLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-content">
          {/* Left - Hero Text */}
          <div className="hero-text">
            <p className="hero-sub">
              Enhance your security <span>"awareness"</span>
              <br />
              through
              <br />
              <span> "interactive learning"</span>
              <button className="cta-button" onClick={handleStartQuiz}>
                Begin Security Assessment
              </button>
            </p>
          </div>
          <div className="right-news" data-lenis-prevent>
            <NewsSection />
          </div>
          <div className="quote font-body">
            Begin your transformation in our security training ground: level up
            your cyber defense, and evolve from thinking like a hacker to
            defending like a professional.
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
