import React, { useEffect } from "react";
import "./Loader.css";
import { useAppStore } from "../../stores/use.store.js";

const Loader = () => {
  const { ui, user } = useAppStore();

  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      if (p < 100) {
        p += Math.random() * 10;
        ui.setLoadingProgress(p);
      } else {
        ui.completeLoading();
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // Default loading messages if store doesn't have them
  const loadingMessages = ui?.loadingMessages || [
    "Initializing security protocols...",
    "Analyzing threat landscape...",
    "Loading cyber defense modules...",
    "Calibrating AI systems...",
    "Establishing secure connection...",
    "Scanning for vulnerabilities...",
    "Encrypting data channels...",
    "Loading intelligence database...",
  ];

  const currentMessage = ui?.currentLoadingMessage || loadingMessages[0];
  const progress = ui?.loadingProgress || 0;
  const isLoadingComplete = ui?.isLoadingComplete || false;
  const userLevel = user ? Math.floor((user.points || 0) / 100) + 1 : 1;

  // Get random tip from store or use defaults
  const tips = ui?.loadingTips || [
    "Strong passwords are your first line of defense",
    "Always enable two-factor authentication",
    "Regular updates patch security vulnerabilities",
    "Phishing attacks often use urgent language",
    "Backup your data regularly",
  ];

  const currentTip =
    ui?.currentTip || tips[Math.floor(Math.random() * tips.length)];

  if (isLoadingComplete) {
    return <div className="loader-container hidden"></div>;
  }

  return (
    <div className="loader-container">
      {/* Animated Background */}
      <div className="loader-bg">
        <div className="cyber-grid"></div>
        <div className="scanline"></div>
      </div>

      {/* Main Content */}
      <div className="loader-content">
        {/* Logo & Title */}
        <div className="loader-header">
          <div className="logo-container">
            <h1 className="loader-title">CyberSage</h1>
            <div className="logo-subtitle">Security AI</div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="progress-section">
          <div className="loading-message">
            <span className="message-text">{currentMessage}</span>
          </div>

          {/* Progress Bar */}
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
            <div className="progress-text">{Math.round(progress)}%</div>
          </div>

          {/* Loading Stats */}
          <div className="loading-stats">
            {user && (
              <div className="user-stats">
                <div className="stat-item">
                  <span className="stat-label">Level</span>
                  <span className="stat-value">Lvl {userLevel}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">XP</span>
                  <span className="stat-value">{user.points || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Modules</span>
                  <span className="stat-value">
                    {user.modulesCompleted?.length || 0}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Tip */}
        <div className="tip-section">
          <div className="tip-header">
            <span className="tip-icon">💡</span>
            <span className="tip-title">Security Tip</span>
          </div>
          <p className="tip-content">{currentTip}</p>
        </div>

        {/* Loading Animation */}
        <div className="animation-section">
          <div className="cyber-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-core"></div>
            <div className="spinner-pulse"></div>
          </div>
          <div className="binary-stream">
            {Array.from({ length: 20 }).map((_, i) => (
              <span key={i} className="binary-digit">
                {Math.random() > 0.5 ? "1" : "0"}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="loader-footer">
          <div className="system-info">
            <span className="system-text">Initializing Defense Systems</span>
            <span className="system-status">Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
