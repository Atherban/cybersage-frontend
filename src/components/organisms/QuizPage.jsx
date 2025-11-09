import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../stores/use.store.js";
import "./QuizPage.css";

const QuizPage = () => {
  const navigate = useNavigate();

  const [selectedModule, setSelectedModule] = useState(null);
  const { user, quiz, ui } = useAppStore();

  // Security modules defined in component
  const securityModules = useMemo(
    () => [
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
    ],
    []
  );

  // Simple module status tracking
  const [moduleStatuses, setModuleStatuses] = useState({});

  // Update module statuses
  const updateModuleStatuses = useCallback(() => {
    if (!quiz.getModuleStatus) return;

    const newStatuses = {};
    securityModules.forEach((module) => {
      newStatuses[module.id] = quiz.getModuleStatus(module.id) || {};
    });
    setModuleStatuses(newStatuses);
  }, [quiz, securityModules]);

  // Initialize module statuses
  useEffect(() => {
    if (quiz.getModuleStatus) {
      updateModuleStatuses();
    }
  }, [quiz.getModuleStatus, updateModuleStatuses]);

  // Get module status
  const getModuleStatus = useCallback(
    (moduleId) => {
      return moduleStatuses[moduleId] || {};
    },
    [moduleStatuses]
  );

  // Get all module statuses as array
  const getAllModuleStatuses = useCallback(() => {
    return securityModules.map((module) => getModuleStatus(module.id));
  }, [securityModules, getModuleStatus]);

  const userStats = user.getStats?.() || { points: 0 };

  const handleModuleSelect = useCallback(
    (module) => {
      const goToQuiz = () => {
        setSelectedModule(module);
        ui.addNotification?.(`Starting ${module.name} assessment`, "info");
        navigate(`/quiz/${module.id}`);
      };

      // If locked, block entry
      if (quiz.getModuleStatus) {
        const status = getModuleStatus(module.id);
        if (!status?.isUnlocked) {
          ui.addNotification?.(
            `Complete prerequisites to unlock ${module.name}`,
            "warning"
          );
          return;
        }
      }

      // Enter fullscreen on module start
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();

      goToQuiz();
    },
    [quiz.getModuleStatus, ui, navigate, getModuleStatus]
  );

  const handleDownloadCertificate = useCallback(
    async (moduleId, event) => {
      event.stopPropagation();

      if (!quiz.generateCertificate) {
        ui.addNotification?.("Certificate feature not available yet", "info");
        return;
      }

      try {
        const result = await quiz.generateCertificate(moduleId);
        if (result.success) {
          const link = document.createElement("a");
          link.href = result.downloadUrl;
          link.download = `cybersage-certificate-${moduleId}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          ui.addNotification?.(
            "Certificate downloaded successfully!",
            "success"
          );
        }
      } catch (error) {
        ui.addNotification?.("Failed to download certificate", "error");
      }
    },
    [quiz, ui]
  );

  const handleResetProgress = useCallback(() => {
    if (
      window.confirm(
        "Are you sure you want to reset all your progress? This will lock all modules except the first one. This cannot be undone."
      )
    ) {
      user.resetProgress?.();
      quiz.resetQuiz?.();
      ui.addNotification?.("Progress reset successfully", "success");

      // Refresh module statuses
      setTimeout(updateModuleStatuses, 100);
    }
  }, [user, quiz, ui, updateModuleStatuses]);

  // Get completion percentage for progress bar
  const getOverallProgress = useCallback(() => {
    if (!quiz.getModuleStatus) {
      const completed = user.modulesCompleted?.length || 0;
      return Math.round((completed / securityModules.length) * 100);
    }

    const completed = getAllModuleStatuses().filter(
      (status) => status.isCompleted
    ).length;
    return Math.round((completed / securityModules.length) * 100);
  }, [
    quiz.getModuleStatus,
    user.modulesCompleted,
    securityModules.length,
    getAllModuleStatuses,
  ]);

  // Get locked modules that can be unlocked (dependencies met)
  const getReadyToUnlockModules = useCallback(() => {
    if (!quiz.getModuleStatus) return [];

    return getAllModuleStatuses().filter(
      (status) => !status.isUnlocked && status.canUnlock && !status.isCompleted
    );
  }, [quiz.getModuleStatus, getAllModuleStatuses]);

  // Check if module is completed
  const isModuleCompleted = useCallback(
    (moduleId) => {
      if (quiz.getModuleStatus) {
        const status = getModuleStatus(moduleId);
        return status?.isCompleted || false;
      }
      return user.modulesCompleted?.find((m) => m.id === moduleId);
    },
    [quiz.getModuleStatus, getModuleStatus, user.modulesCompleted]
  );

  // Check if module is unlocked
  const isModuleUnlocked = useCallback(
    (moduleId) => {
      if (!quiz.getModuleStatus) return true;

      const status = getModuleStatus(moduleId);
      return status?.isUnlocked || false;
    },
    [quiz.getModuleStatus, getModuleStatus]
  );

  // Simple real-time stats without complex notifications
  const realTimeStats = useMemo(() => {
    const allStatuses = getAllModuleStatuses();
    return {
      completed: allStatuses.filter((s) => s.isCompleted).length,
      unlocked: allStatuses.filter((s) => s.isUnlocked).length,
      certificates: allStatuses.filter((s) => s.certificate).length,
      readyToUnlock: getReadyToUnlockModules().length,
      overallProgress: getOverallProgress(),
    };
  }, [getAllModuleStatuses, getReadyToUnlockModules, getOverallProgress]);

  return (
    <div className="quiz-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <div className="font-title">CyberSage</div>
            <div className="nav-right">
              <div className="user-points">
                <span className="points-badge">{user.points || 0} pts</span>
              </div>
              <ul className="nav-links">
                <li>
                  <a className="font-hero" onClick={() => navigate("/")}>
                    Home
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
            <div className="main-section">
              <h1 className="font-hero">CyberSage Training</h1>
              <p className="font-body">
                Master cybersecurity through progressive learning.{" "}
                {quiz.getModuleStatus
                  ? "Complete modules to unlock advanced topics."
                  : "Test your knowledge across different security domains."}
              </p>
            </div>

            {/* Overall Progress */}
            <div className="overall-progress">
              <div className="progress-header">
                <span>Training Progress: {realTimeStats.overallProgress}%</span>
                <span>
                  {quiz.getModuleStatus
                    ? `${realTimeStats.completed}/${securityModules.length} Modules`
                    : `${user.modulesCompleted?.length || 0}/${
                        securityModules.length
                      } Modules`}
                </span>
              </div>
              <div className="upper-progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${realTimeStats.overallProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Progression Alert - Only show if progression system is active */}
          {quiz.getModuleStatus && getReadyToUnlockModules().length > 0 && (
            <div className="unlock-alert">
              <div className="alert-icon">🎉</div>
              <div className="alert-content">
                <strong>New modules available!</strong>
                <span>
                  You've unlocked {getReadyToUnlockModules().length} new
                  module(s). Complete prerequisites to access them.
                </span>
              </div>
            </div>
          )}

          {/* Quiz Rules & Scoring */}
          <div className="quiz-rules-section">
            <div className="rules-card">
              <h3 className="font-title">Training System</h3>
              <div className="rules-grid">
                {quiz.getModuleStatus ? (
                  <>
                    <div className="rule-item">
                      <span className="rule-icon">🔓</span>
                      <div className="rule-content">
                        <strong>Progressive Unlocking</strong>
                        <span>Complete modules to unlock advanced topics</span>
                      </div>
                    </div>
                    <div className="rule-item">
                      <span className="rule-icon">📜</span>
                      <div className="rule-content">
                        <strong>Certificates</strong>
                        <span>Earn certificates for each completed module</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}
                <div className="rule-item">
                  <span className="rule-icon">🎯</span>
                  <div className="rule-content">
                    <strong>Scenario-based</strong>
                    <span>Real-world security situations</span>
                  </div>
                </div>
                <div className="rule-item">
                  <span className="rule-icon">📈</span>
                  <div className="rule-content">
                    <strong>Skill Progression</strong>
                    <span>Build knowledge step by step</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Module Selection */}
          <div className="modules-section">
            <div className="section-header">
              <h2 className="font-hero">Security Training Modules</h2>
              <p className="font-body">
                {quiz.getModuleStatus
                  ? "Start with basic concepts and progress to advanced cybersecurity topics"
                  : "Choose a specific cybersecurity area to test your knowledge"}
              </p>
            </div>

            <div className="modules-grid">
              {securityModules.map((module) => {
                const isCompleted = isModuleCompleted(module.id);
                const isUnlocked = isModuleUnlocked(module.id);
                const completion = user.modulesCompleted?.find(
                  (m) => m.id === module.id
                );
                const status = getModuleStatus(module.id);

                return (
                  <div
                    key={module.id}
                    className={`module-card ${
                      selectedModule?.id === module.id ? "selected" : ""
                    } ${isCompleted ? "completed" : ""} ${
                      !isUnlocked ? "locked" : "unlocked"
                    }`}
                    onClick={() => isUnlocked && handleModuleSelect(module)}
                  >
                    {/* Module Status Badge - Only show if progression system active */}
                    {quiz.getModuleStatus && (
                      <div className="module-status-badge">
                        {!isUnlocked && (
                          <span className="badge locked">🔒 Locked</span>
                        )}
                        {isCompleted && (
                          <span className="badge completed">✅ Completed</span>
                        )}
                        {isUnlocked && !isCompleted && (
                          <span className="badge available">🎯 Available</span>
                        )}
                      </div>
                    )}

                    <div
                      className="module-icon"
                      style={{ backgroundColor: module.color }}
                    >
                      {module.icon}
                      {!isUnlocked && <div className="lock-overlay">🔒</div>}
                    </div>

                    <div className="module-content">
                      <h3 className="module-name">{module.name}</h3>
                      <p className="module-description">{module.description}</p>

                      {/* Module Meta Information */}
                      <div className="module-meta">
                        {/* Dependencies for locked modules */}
                        {!isUnlocked && status?.dependencies && (
                          <div className="dependencies">
                            <strong>Requires:</strong>
                            <div className="dependency-list">
                              {status.dependencies
                                .map((depId) => {
                                  const depModule = securityModules.find(
                                    (m) => m.id === depId
                                  );
                                  return depModule ? depModule.name : depId;
                                })
                                .join(" + ")}
                            </div>
                          </div>
                        )}

                        {/* Completion info */}
                        {isCompleted && completion && (
                          <div className="completion-info">
                            <span className="score">
                              Score: {completion.score}%
                            </span>
                            {status?.requirements && (
                              <span className="requirement">
                                Required: {status.requirements}%
                              </span>
                            )}
                          </div>
                        )}

                        {/* Requirements for available modules */}
                        {isUnlocked && !isCompleted && status?.requirements && (
                          <div className="module-requirements">
                            <span>Passing Score: {status.requirements}%</span>
                          </div>
                        )}
                      </div>

                      {/* Certificate Download - Only show if progression system active and module completed */}
                      {quiz.getModuleStatus &&
                        isCompleted &&
                        status?.certificate && (
                          <button
                            className="certificate-btn"
                            onClick={(e) =>
                              handleDownloadCertificate(module.id, e)
                            }
                          >
                            📜 Download Certificate
                          </button>
                        )}
                    </div>

                    <div className="module-arrow">
                      {!isUnlocked ? "🔒" : "→"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Stats */}
          <div className="bottom-progress-section">
            <div className="progress-card">
              <div className="progress-header">
                <h3>Training Progress</h3>
                <button
                  className="reset-button"
                  onClick={handleResetProgress}
                  title="Reset all progress"
                >
                  Reset Progress
                </button>
              </div>

              <div className="progress-stats">
                <div className="stat-item">
                  <span className="stat-number">{realTimeStats.completed}</span>
                  <span className="stat-label">Modules Completed</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{realTimeStats.unlocked}</span>
                  <span className="stat-label">Modules Unlocked</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {realTimeStats.overallProgress}%
                  </span>
                  <span className="stat-label">Overall Progress</span>
                </div>
              </div>

              <div className="additional-stats">
                <div className="stat-row">
                  <span>Available Certificates:</span>
                  <strong>{realTimeStats.certificates}</strong>
                </div>
                <div className="stat-row">
                  <span>Ready to Unlock:</span>
                  <strong>{realTimeStats.readyToUnlock}</strong>
                </div>
                <div className="stat-row">
                  <span>Total Points:</span>
                  <strong>{userStats.points}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Path Visualization - Only show if progression system active */}
          {quiz.getModuleStatus && (
            <div className="learning-path">
              <h3>Learning Path</h3>
              <div className="path-visualization">
                {securityModules.map((module, index) => {
                  const status = getModuleStatus(module.id);

                  return (
                    <div key={module.id} className="path-node">
                      <div
                        className={`node ${
                          status.isCompleted
                            ? "completed"
                            : status.isUnlocked
                            ? "unlocked"
                            : "locked"
                        }`}
                      >
                        {status.isCompleted
                          ? "✓"
                          : status.isUnlocked
                          ? `${module.icon}`
                          : "🔒"}
                      </div>
                      <span className="node-label">{module.name}</span>
                      {index < securityModules.length - 1 && (
                        <div
                          className={`path-connector ${
                            status.isCompleted ? "completed" : ""
                          }`}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default QuizPage;
