import React from "react";
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
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <div className="logo">Cybersage</div>
            <ul className="nav-links">
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="/quiz">Quiz</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>

            {/* User Section with Logout */}
            <div className="user-section">
              {isAuthenticated && user && (
                <span className="user-welcome">
                  Welcome, {user.username || user.email}!
                </span>
              )}
              <button className="logout-button" onClick={handleConfirmLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="container">
          <div className="hero-content">
            {/* Left - Hero Text */}
            <div className="hero-text">
              <h1 className="hero-title">
                Cybersecurity
                <br />
                Intelligence
                <br />
                Platform
              </h1>
              <p className="hero-subtitle">
                Enhance your security awareness through interactive learning and
                stay informed about the latest cyber threats. Test your
                knowledge with scenario-based challenges.
              </p>
              <div className="quote">
                "The only truly secure system is one that is powered off, cast
                in a block of concrete and sealed in a lead-lined room with
                armed guards - and even then I have my doubts."
                <span className="quote-author">— Gene Spafford</span>
              </div>
              <button className="cta-button" onClick={handleStartQuiz}>
                Begin Security Assessment
              </button>
            </div>

            {/* Right - News Section */}
            <NewsSection />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
