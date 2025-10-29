import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../stores/use.store.js";
import "./QuizPage.css";

const QuizPage = () => {
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState(null);

  const { user, ui } = useAppStore();
  const userStats = user.getStats();

  // Security modules matching the backend
  const securityModules = [
    {
      id: "digital_arrest",
      name: "Digital Arrest",
      description: "Virtual kidnapping and online extortion tactics",
      icon: "🔒",
      color: "#000000",
    },
    {
      id: "cyber_attacks",
      name: "Cyber Attacks",
      description: "Malware, ransomware, DDoS, and attack vectors",
      icon: "⚡",
      color: "#000000",
    },
    {
      id: "social_media",
      name: "Social Media",
      description: "Platform security and impersonation threats",
      icon: "📱",
      color: "#000000",
    },
    {
      id: "account_security",
      name: "Account Security",
      description: "Passwords, MFA, and credential management",
      icon: "👤",
      color: "#000000",
    },
    {
      id: "cloud_security",
      name: "Cloud Security",
      description: "Cloud infrastructure and data protection",
      icon: "☁️",
      color: "#000000",
    },
    {
      id: "device_security",
      name: "Device Security",
      description: "Mobile and endpoint protection",
      icon: "💻",
      color: "#000000",
    },
  ];

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    ui.addNotification(`Starting ${module.name} assessment`, "info");
    // Navigate to quiz questions for this module
    navigate(`/quiz/${module.id}`);
  };

  const handleResetProgress = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all your progress? This cannot be undone."
      )
    ) {
      user.resetProgress();
      ui.addNotification("Progress reset successfully", "success");
    }
  };

  // Get module completion status
  const getModuleCompletion = (moduleId) => {
    return user.modulesCompleted.find((m) => m.id === moduleId);
  };

  return (
    <div className="quiz-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <div className="logo">Cybersage</div>
            <div className="nav-right">
              <div className="user-points">
                <span className="points-badge">{user.points} pts</span>
              </div>
              <ul className="nav-links">
                <li>
                  <a href="#" onClick={() => navigate("/")}>
                    Home
                  </a>
                </li>
                <li>
                  <a href="#quiz" className="active">
                    Quiz
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Quiz Section */}
      <section className="quiz-hero-section">
        <div className="container">
          <div className="quiz-header">
            <h1 className="quiz-title">Security Assessment</h1>
            <p className="quiz-subtitle">
              Test your cybersecurity knowledge across different domains
            </p>
          </div>

          {/* Quiz Rules & Scoring */}
          <div className="quiz-rules-section">
            <div className="rules-card">
              <h3>Assessment Rules</h3>
              <div className="rules-grid">
                <div className="rule-item">
                  <span className="rule-icon">✅</span>
                  <div className="rule-content">
                    <strong>+5 Points</strong>
                    <span>Per correct answer</span>
                  </div>
                </div>
                <div className="rule-item">
                  <span className="rule-icon">❌</span>
                  <div className="rule-content">
                    <strong>-1 Point</strong>
                    <span>Per wrong answer</span>
                  </div>
                </div>
                <div className="rule-item">
                  <span className="rule-icon">🔥</span>
                  <div className="rule-content">
                    <strong>Streak Bonus</strong>
                    <span>Maintain correct answers</span>
                  </div>
                </div>
                <div className="rule-item">
                  <span className="rule-icon">🎯</span>
                  <div className="rule-content">
                    <strong>Scenario-based</strong>
                    <span>Real-world situations</span>
                  </div>
                </div>
              </div>
              <div className="scoring-info">
                <p>
                  <strong>Current Streak:</strong> {user.currentStreak} correct
                  answers in a row
                  {user.bestStreak > 0 && ` (Best: ${user.bestStreak})`}
                </p>
              </div>
            </div>
          </div>

          {/* Module Selection */}
          <div className="modules-section">
            <div className="section-header">
              <h2>Select Security Domain</h2>
              <p>Choose a specific cybersecurity area to test your knowledge</p>
            </div>

            <div className="modules-grid">
              {securityModules.map((module) => {
                const completion = getModuleCompletion(module.id);

                return (
                  <div
                    key={module.id}
                    className={`module-card ${
                      selectedModule?.id === module.id ? "selected" : ""
                    } ${completion ? "completed" : ""}`}
                    onClick={() => handleModuleSelect(module)}
                  >
                    <div
                      className="module-icon"
                      style={{ backgroundColor: module.color }}
                    >
                      {module.icon}
                    </div>
                    <div className="module-content">
                      <h3 className="module-name">{module.name}</h3>
                      <p className="module-description">{module.description}</p>
                      <div className="module-difficulty">
                        <span className="difficulty-tag">
                          Multiple Difficulty Levels
                        </span>
                        {completion && (
                          <span className="completion-badge">
                            Score: {completion.score} pts
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="module-arrow">→</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Stats */}
          <div className="progress-section">
            <div className="progress-card">
              <div className="progress-header">
                <h3>Your Progress</h3>
                <button
                  className="reset-button"
                  onClick={handleResetProgress}
                  title="Reset all progress"
                >
                  Reset
                </button>
              </div>
              <div className="progress-stats">
                <div className="stat-item">
                  <span className="stat-number">
                    {userStats.modulesCompleted}
                  </span>
                  <span className="stat-label">Modules Completed</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{userStats.points}</span>
                  <span className="stat-label">Total Points</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{userStats.accuracy}%</span>
                  <span className="stat-label">Accuracy</span>
                </div>
              </div>
              <div className="additional-stats">
                <div className="stat-row">
                  <span>Correct Answers:</span>
                  <strong>{userStats.totalCorrect}</strong>
                </div>
                <div className="stat-row">
                  <span>Current Streak:</span>
                  <strong>{userStats.currentStreak}</strong>
                </div>
                <div className="stat-row">
                  <span>Best Streak:</span>
                  <strong>{userStats.bestStreak}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QuizPage;
