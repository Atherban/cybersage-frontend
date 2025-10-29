import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "../../stores/use.store.js";
import AIChatBot from "./AIChatBot";
import "./QuizQuestions.css";

// Custom hook for quiz effects
const useQuizEffects = (effectsContainerRef) => {
  const createConfetti = useCallback(() => {
    if (!effectsContainerRef.current) return;

    const container = effectsContainerRef.current;
    const colors = ["#000000", "#333333", "#666666", "#999999"];

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.background =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
      confetti.style.animationDelay = Math.random() * 0.5 + "s";
      container.appendChild(confetti);

      setTimeout(() => {
        if (confetti.parentNode === container) {
          container.removeChild(confetti);
        }
      }, 5000);
    }
  }, [effectsContainerRef]);

  const createFloatingPoints = useCallback(
    (points) => {
      if (!effectsContainerRef.current) return;

      const container = effectsContainerRef.current;
      const pointsElement = document.createElement("div");
      pointsElement.className = "floating-points";
      pointsElement.textContent = `+${points}`;
      pointsElement.style.left = Math.random() * 50 + 25 + "vw";
      pointsElement.style.top = "60vh";
      container.appendChild(pointsElement);

      setTimeout(() => {
        if (pointsElement.parentNode === container) {
          container.removeChild(pointsElement);
        }
      }, 1500);
    },
    [effectsContainerRef]
  );

  const createSparkles = useCallback(() => {
    if (!effectsContainerRef.current) return;

    const container = effectsContainerRef.current;
    for (let i = 0; i < 20; i++) {
      const sparkle = document.createElement("div");
      sparkle.className = "sparkle";
      sparkle.style.left = Math.random() * 100 + "vw";
      sparkle.style.top = Math.random() * 100 + "vh";
      sparkle.style.animationDelay = Math.random() * 0.5 + "s";
      container.appendChild(sparkle);

      setTimeout(() => {
        if (sparkle.parentNode === container) {
          container.removeChild(sparkle);
        }
      }, 1000);
    }
  }, [effectsContainerRef]);

  const showSuccessMessage = useCallback(() => {
    if (!effectsContainerRef.current) return;

    const container = effectsContainerRef.current;
    const message = document.createElement("div");
    message.className = "success-message";
    message.textContent = "Correct!";
    container.appendChild(message);

    setTimeout(() => {
      if (message.parentNode === container) {
        container.removeChild(message);
      }
    }, 2000);
  }, [effectsContainerRef]);

  const showStreakCelebration = useCallback(
    (currentStreak) => {
      if (currentStreak < 2) return;
      if (!effectsContainerRef.current) return;

      const container = effectsContainerRef.current;
      const celebration = document.createElement("div");
      celebration.className = "streak-celebration";
      celebration.textContent = `🔥 ${currentStreak} in a row!`;
      container.appendChild(celebration);

      setTimeout(() => {
        if (celebration.parentNode === container) {
          container.removeChild(celebration);
        }
      }, 3000);
    },
    [effectsContainerRef]
  );

  const triggerCorrectAnswerEffects = useCallback(
    (user) => {
      createConfetti();
      createFloatingPoints(5);
      createSparkles();
      showSuccessMessage();

      if (user.currentStreak >= 2) {
        showStreakCelebration(user.currentStreak);
      }

      const pointsBadge = document.querySelector(".points-badge");
      if (pointsBadge) {
        pointsBadge.classList.add("updated");
        setTimeout(() => {
          pointsBadge.classList.remove("updated");
        }, 1000);
      }

      const progressFill = document.querySelector(".progress-fill");
      if (progressFill) {
        progressFill.classList.add("updated");
        setTimeout(() => {
          progressFill.classList.remove("updated");
        }, 1000);
      }
    },
    [
      createConfetti,
      createFloatingPoints,
      createSparkles,
      showSuccessMessage,
      showStreakCelebration,
    ]
  );

  const showLevelUpEffect = useCallback(
    (newDifficulty) => {
      if (!effectsContainerRef.current) return;

      const container = effectsContainerRef.current;
      const levelUpMessage = document.createElement("div");
      levelUpMessage.className = "level-up-message";
      levelUpMessage.textContent = `Level Up! ${newDifficulty.toUpperCase()}`;
      container.appendChild(levelUpMessage);

      setTimeout(() => {
        if (levelUpMessage.parentNode === container) {
          container.removeChild(levelUpMessage);
        }
      }, 3000);
    },
    [effectsContainerRef]
  );

  return {
    triggerCorrectAnswerEffects,
    showLevelUpEffect,
  };
};

const QuizQuestions = () => {
  const navigate = useNavigate();
  const { module } = useParams();
  const { user, quiz, aiChat, ui } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState("easy");
  const [moduleProgression, setModuleProgression] = useState(null);
  const [initializing, setInitializing] = useState(false);

  const effectsContainerRef = useRef(null);
  const mountedRef = useRef(true);

  const { triggerCorrectAnswerEffects, showLevelUpEffect } =
    useQuizEffects(effectsContainerRef);

  // Get current question from store
  const currentQuestion = quiz.getCurrentQuestion();
  const progress = quiz.getProgress();
  const score = quiz.getScore();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      // Cleanup effects container
      if (effectsContainerRef.current) {
        effectsContainerRef.current.innerHTML = "";
      }
    };
  }, []);

  // Combined initialization effect
  useEffect(() => {
    const initializeQuizData = async () => {
      if (initializing) return;

      setInitializing(true);
      try {
        setLoading(true);
        setError(null);

        // Set module progression and difficulty
        if (module && module !== "random") {
          const progression = user.getModuleProgression(module);
          setModuleProgression(progression);
          const difficulty = user.getCurrentDifficulty(module);
          setCurrentDifficulty(difficulty);
          await initializeQuiz(difficulty);
        } else {
          await initializeQuiz("easy");
        }
      } catch (err) {
        console.error("Error initializing quiz data:", err);
        if (mountedRef.current) {
          setError("Failed to initialize quiz");
        }
      } finally {
        if (mountedRef.current) {
          setInitializing(false);
          setLoading(false);
        }
      }
    };

    initializeQuizData();
  }, [module]);

  const initializeQuiz = async (difficulty = currentDifficulty) => {
    try {
      // Start quiz session in store
      quiz.startQuiz(module, difficulty, 5);

      // Fetch questions using the new API service
      const result = await quiz.fetchQuestions(module, difficulty, 5);

      if (result.success) {
        ui.addNotification(
          `${
            result.data.questions.length
          } ${difficulty} questions loaded for ${getModuleName()}`,
          "success"
        );
      } else {
        throw new Error(result.error || "Failed to load questions");
      }
    } catch (err) {
      console.error("Error initializing quiz:", err);
      if (mountedRef.current) {
        setError(`Failed to load ${difficulty} questions. Please try again.`);
      }
      ui.addNotification("Failed to load questions", "error");

      // Fallback to mock questions
      loadMockQuestions(difficulty);
    }
  };

  const loadMockQuestions = (difficulty) => {
    const mockQuestions = {
      questions: [
        {
          id: "1",
          question: `What is the primary purpose of multi-factor authentication (MFA)? ${
            difficulty === "medium" ? "Consider enterprise scenarios." : ""
          } ${
            difficulty === "hard"
              ? "Evaluate against advanced persistent threats."
              : ""
          }`,
          options: [
            "To speed up login process",
            "To add extra layers of security",
            "To reduce password complexity",
            "To monitor user activity",
          ],
          correctAnswer: "To add extra layers of security",
          description:
            "MFA adds additional authentication factors beyond just passwords, making unauthorized access significantly more difficult.",
          difficulty: difficulty,
          category: module || "account_security",
          module: module || "account_security",
        },
        {
          id: "2",
          question: `Which of the following is NOT a common phishing technique? ${
            difficulty === "hard" ? "Consider recent attack trends." : ""
          }`,
          options: [
            "Email spoofing",
            "Website cloning",
            "Network scanning",
            "SMShing",
          ],
          correctAnswer: "Network scanning",
          description:
            "Network scanning is a reconnaissance technique used for gathering information about networks, not typically used in phishing attacks.",
          difficulty: difficulty,
          category: module || "cyber_attacks",
          module: module || "cyber_attacks",
        },
        {
          id: "3",
          question: `What should you do if you receive a digital arrest scam call? ${
            difficulty === "medium" ? "Consider legal implications." : ""
          }`,
          options: [
            "Immediately pay the demanded amount",
            "Share personal information to verify identity",
            "Stay on the call and follow instructions",
            "Hang up and report to authorities",
          ],
          correctAnswer: "Hang up and report to authorities",
          description:
            "Digital arrest scams rely on fear and intimidation. Always hang up and report such incidents to legitimate authorities.",
          difficulty: difficulty,
          category: module || "digital_arrest",
          module: module || "digital_arrest",
        },
        {
          id: "4",
          question: `What is the main risk of oversharing on social media? ${
            difficulty === "hard"
              ? "Analyze long-term privacy implications."
              : ""
          }`,
          options: [
            "Increased followers",
            "Identity theft and social engineering",
            "Better algorithm visibility",
            "More engagement on posts",
          ],
          correctAnswer: "Identity theft and social engineering",
          description:
            "Oversharing personal information on social media can lead to identity theft and make you vulnerable to social engineering attacks.",
          difficulty: difficulty,
          category: module || "social_media",
          module: module || "social_media",
        },
        {
          id: "5",
          question: `Which cloud security practice helps protect data at rest? ${
            difficulty === "medium" ? "Consider compliance requirements." : ""
          }`,
          options: [
            "Load balancing",
            "Data encryption",
            "Auto-scaling",
            "Content delivery networks",
          ],
          correctAnswer: "Data encryption",
          description:
            "Data encryption is essential for protecting sensitive information stored in cloud services from unauthorized access.",
          difficulty: difficulty,
          category: module || "cloud_security",
          module: module || "cloud_security",
        },
      ],
      total_questions: 5,
      difficulty_level: difficulty,
      security_module: module || "general",
      module_name: getModuleName(),
      generated_at: new Date().toISOString(),
    };

    quiz.setQuizQuestions(mockQuestions);
    ui.addNotification(
      `Using ${difficulty} demo questions for ${getModuleName()}`,
      "info"
    );
  };

  const handleOptionSelect = useCallback(
    (option) => {
      if (!showExplanation && !isSubmitting) {
        setSelectedOption(option);
      }
    },
    [showExplanation, isSubmitting]
  );

  const handleGetHint = async () => {
    if (!user.canUseHint(5)) {
      ui.addNotification(
        "You need at least 5 points to use a hint!",
        "warning"
      );
      return;
    }

    const currentQuestion = quiz.getCurrentQuestion();
    if (!currentQuestion) return;

    try {
      ui.setLoading("ai", true);
      const hintResult = await aiChat.getHint(currentQuestion, 5);

      if (hintResult) {
        user.useHint(5);
        quiz.setHint(hintResult.hint);
        ui.addNotification(`Hint used! -5 points`, "info");
      }
    } catch (error) {
      ui.addNotification("Failed to get hint", error);
    } finally {
      ui.setLoading("ai", false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || isSubmitting) return;

    setIsSubmitting(true);
    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    // Update store with answer
    quiz.submitAnswer(currentQuestion.id, selectedOption, isCorrect);

    // Update user points and trigger effects if correct
    if (isCorrect) {
      user.addPoints(5);
      setShowEffects(true);
      triggerCorrectAnswerEffects(user, quiz);
      ui.addNotification("+5 points! Correct answer!", "success");

      setTimeout(() => {
        if (mountedRef.current) {
          setShowEffects(false);
        }
      }, 2000);
    } else {
      user.deductPoint();
      ui.addNotification("-1 point. Better luck next time!", "warning");

      // Trigger AI chat for wrong answers
      aiChat.triggerWrongAnswerChat(
        currentQuestion,
        selectedOption,
        currentQuestion.correctAnswer
      );
    }

    setShowExplanation(true);
    setIsSubmitting(false);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);

    if (quiz.currentQuestionIndex + 1 < quiz.currentQuiz.questions.length) {
      quiz.nextQuestion();
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    const finalScore = score.score;
    const isPerfectScore =
      score.wrong === 0 && score.correct === quiz.currentQuiz.questions.length;
    const completed = score.correct > 0; // At least one correct answer

    // Update module progression for specific modules
    if (module && module !== "random") {
      user.updateModuleProgression(
        module,
        currentDifficulty,
        completed,
        isPerfectScore
      );

      if (isPerfectScore) {
        const nextDifficulty = user.getNextDifficulty(currentDifficulty);
        if (nextDifficulty) {
          showLevelUpEffect(nextDifficulty);
          ui.addNotification(
            `Perfect score! Advanced to ${nextDifficulty} difficulty!`,
            "success"
          );
        } else {
          ui.addNotification(
            "Perfect score! You have mastered all difficulty levels!",
            "success"
          );
        }
      } else if (completed) {
        ui.addNotification(
          `Good job! Try again to get a perfect score and advance to the next level.`,
          "info"
        );
      } else {
        ui.addNotification(
          `Keep practicing! You'll get it next time.`,
          "warning"
        );
      }
    }

    quiz.completeQuiz();
    ui.addNotification(
      `Quiz completed! Final score: ${finalScore} points (${currentDifficulty} difficulty)`,
      "success"
    );
  };

  const handleRestartSameDifficulty = () => {
    quiz.resetQuiz();
    initializeQuiz(currentDifficulty);
  };

  const handleExitQuiz = () => {
    if (
      window.confirm(
        "Are you sure you want to exit? Your progress will be saved."
      )
    ) {
      navigate("/quiz");
    }
  };

  const getModuleName = () => {
    if (!module || module === "random") return "Mixed Domains";

    const moduleMap = {
      digital_arrest: "Digital Arrest",
      cyber_attacks: "Cyber Attacks",
      social_media: "Social Media",
      account_security: "Account Security",
      cloud_security: "Cloud Security",
      device_security: "Device Security",
    };

    return (
      moduleMap[module] ||
      module
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  const getProgressionStats = () => {
    if (!moduleProgression || !module) return null;

    const stats = moduleProgression[currentDifficulty];
    return {
      attempts: stats.attempts,
      completions: stats.completions,
      perfectRuns: stats.perfectRuns,
      currentStreak: stats.currentStreak,
    };
  };

  // Navigation button component
  const NavButton = ({ onClick, children, className = "" }) => (
    <button
      className={`nav-button ${className}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );

  if (loading) {
    return (
      <div className="quiz-questions-page">
        <nav className="navbar">
          <div className="container">
            <div className="nav-content">
              <div className="logo">Cybersage</div>
              <div className="nav-links">
                <NavButton onClick={() => navigate("/quiz")}>Exit</NavButton>
              </div>
            </div>
          </div>
        </nav>
        <div className="quiz-loading">
          <div className="loading-spinner-large"></div>
          <h2>Preparing Your Assessment</h2>
          <p>
            Loading {currentDifficulty} questions for {getModuleName()}...
          </p>
          {moduleProgression && (
            <div className="progression-info">
              <p>
                Current Level:{" "}
                <strong>{currentDifficulty.toUpperCase()}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error && !quiz.currentQuiz) {
    return (
      <div className="quiz-questions-page">
        <nav className="navbar">
          <div className="container">
            <div className="nav-content">
              <div className="logo">Cybersage</div>
              <div className="nav-links">
                <NavButton onClick={() => navigate("/quiz")}>
                  Back to Quiz
                </NavButton>
              </div>
            </div>
          </div>
        </nav>
        <div className="quiz-error">
          <h2>Unable to Load Questions</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button
              className="cta-button"
              onClick={() => initializeQuiz(currentDifficulty)}
            >
              Try Again
            </button>
            <button
              className="cta-button secondary"
              onClick={() => navigate("/quiz")}
            >
              Back to Quiz Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quiz.quizCompleted) {
    const isPerfectScore =
      score.wrong === 0 && score.correct === quiz.currentQuiz.questions.length;
    const progressionStats = getProgressionStats();

    return (
      <div className="quiz-questions-page">
        <nav className="navbar">
          <div className="container">
            <div className="nav-content">
              <div className="logo">Cybersage</div>
              <div className="nav-links">
                <NavButton onClick={() => navigate("/quiz")}>
                  Back to Quiz
                </NavButton>
              </div>
            </div>
          </div>
        </nav>
        <div className="quiz-completed">
          <div className="completion-card">
            <div className="completion-icon">
              {isPerfectScore ? "🎉" : "📝"}
            </div>
            <h1>
              {isPerfectScore ? "Perfect Score!" : "Assessment Complete!"}
            </h1>
            <p className="completion-subtitle">
              {getModuleName()} -{" "}
              {currentDifficulty.charAt(0).toUpperCase() +
                currentDifficulty.slice(1)}{" "}
              Difficulty
            </p>

            <div className="score-breakdown">
              <div className="score-item correct">
                <span className="score-label">Correct Answers</span>
                <span className="score-value">{score.correct}</span>
              </div>
              <div className="score-item wrong">
                <span className="score-label">Wrong Answers</span>
                <span className="score-value">{score.wrong}</span>
              </div>
              <div className="score-item total">
                <span className="score-label">Total Score</span>
                <span className="score-value">{score.score} points</span>
              </div>
            </div>

            {progressionStats && (
              <div className="progression-stats">
                <h4>Your Progress</h4>
                <div className="progression-grid">
                  <div className="progression-item">
                    <span>Attempts:</span>
                    <strong>{progressionStats.attempts}</strong>
                  </div>
                  <div className="progression-item">
                    <span>Perfect Runs:</span>
                    <strong>{progressionStats.perfectRuns}</strong>
                  </div>
                  <div className="progression-item">
                    <span>Current Streak:</span>
                    <strong>{progressionStats.currentStreak}</strong>
                  </div>
                </div>
              </div>
            )}

            <div className="completion-message">
              {isPerfectScore ? (
                <p>
                  Excellent! You've mastered this level. Ready for the next
                  challenge?
                </p>
              ) : score.correct === 0 ? (
                <p>Don't give up! Review the concepts and try again.</p>
              ) : (
                <p>
                  Good effort! Practice more to achieve a perfect score and
                  advance.
                </p>
              )}
            </div>

            <div className="completion-actions">
              <button
                className="cta-button"
                onClick={() => {
                  quiz.resetQuiz();
                  navigate("/quiz");
                }}
              >
                Back to Quiz Selection
              </button>
              <button
                className="cta-button secondary"
                onClick={handleRestartSameDifficulty}
              >
                {isPerfectScore ? "Try Next Level" : "Try Again Same Level"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="quiz-questions-page">
        <div className="quiz-error">
          <h2>No Questions Available</h2>
          <button className="cta-button" onClick={() => navigate("/quiz")}>
            Back to Quiz Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-questions-page">
      {/* Effects Container */}
      {showEffects && (
        <div ref={effectsContainerRef} className="correct-answer-effect" />
      )}

      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <div className="logo">Cybersage</div>
            <div className="nav-right">
              <div className="quiz-stats">
                <span className="points-badge">Points: {user.points}</span>
                <span className="streak">Streak: {user.currentStreak}</span>
                {moduleProgression && (
                  <span className="difficulty-level">
                    {currentDifficulty.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="nav-links">
                <NavButton onClick={handleExitQuiz}>Exit</NavButton>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Quiz Content */}
      <div className="quiz-container">
        <div className="container">
          {/* Progress Header */}
          <div className="quiz-header">
            <div className="quiz-info">
              <h1>{getModuleName()} Assessment</h1>
              <div className="quiz-meta">
                <p>
                  Question {quiz.currentQuestionIndex + 1} of{" "}
                  {quiz.currentQuiz.questions.length}
                </p>
                <div className="difficulty-info">
                  <span className="current-difficulty">
                    Level: {currentDifficulty.toUpperCase()}
                  </span>
                  {moduleProgression && (
                    <span className="progression-streak">
                      Perfect Streak:{" "}
                      {moduleProgression[currentDifficulty]?.currentStreak || 0}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="question-card">
            <div className="question-header">
              <span className="difficulty-badge">
                {currentQuestion.difficulty}
              </span>
              <span className="category-badge">{currentQuestion.category}</span>
            </div>

            <h2 className="question-text">{currentQuestion.question}</h2>

            <div className="options-grid">
              {currentQuestion.options.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index);
                const isSelected = selectedOption === option;
                const isCorrect = option === currentQuestion.correctAnswer;

                let optionClass = "option";
                if (showExplanation) {
                  if (isCorrect) {
                    optionClass += " correct";
                  } else if (isSelected && !isCorrect) {
                    optionClass += " wrong";
                  }
                } else if (isSelected) {
                  optionClass += " selected";
                }

                return (
                  <div
                    key={index}
                    className={optionClass}
                    onClick={() => handleOptionSelect(option)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleOptionSelect(option)
                    }
                    tabIndex={0}
                    role="button"
                    aria-pressed={isSelected}
                  >
                    <div className="option-indicator">
                      <span className="option-letter">{optionLetter}</span>
                    </div>
                    <div className="option-text">{option}</div>
                    {showExplanation && isCorrect && (
                      <div className="correct-indicator">✓</div>
                    )}
                    {showExplanation && isSelected && !isCorrect && (
                      <div className="wrong-indicator">✗</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Hint Section */}
            {!showExplanation && user.canUseHint(5) && (
              <div className="hint-section">
                <button
                  className="hint-button"
                  onClick={handleGetHint}
                  disabled={quiz.hintUsed || ui.loading.ai}
                >
                  {ui.loading.ai
                    ? "Getting Hint..."
                    : quiz.hintUsed
                    ? "Hint Used"
                    : "Get Hint (5 points)"}
                </button>
                {quiz.currentHint && (
                  <div className="hint-content">
                    <strong>Hint:</strong> {quiz.currentHint}
                  </div>
                )}
              </div>
            )}

            {/* Explanation */}
            {showExplanation && (
              <div className="explanation-section">
                <h3>Explanation</h3>
                <p>{currentQuestion.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              {!showExplanation ? (
                <button
                  className={`submit-button ${
                    !selectedOption ? "disabled" : ""
                  }`}
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption || isSubmitting}
                >
                  {isSubmitting ? "Checking..." : "Submit Answer"}
                </button>
              ) : (
                <button className="next-button" onClick={handleNextQuestion}>
                  {quiz.currentQuestionIndex + 1 <
                  quiz.currentQuiz.questions.length
                    ? "Next Question"
                    : "Complete Assessment"}
                </button>
              )}
            </div>
          </div>

          {/* Current Score */}
          <div className="current-score">
            <div className="score-item">
              <span>Correct: </span>
              <strong>{score.correct}</strong>
            </div>
            <div className="score-item">
              <span>Wrong: </span>
              <strong>{score.wrong}</strong>
            </div>
            <div className="score-item">
              <span>Current Score: </span>
              <strong>{score.score} points</strong>
            </div>
            <div className="score-item">
              <span>Level: </span>
              <strong>{currentDifficulty}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Bot */}
      <AIChatBot />
    </div>
  );
};

export default QuizQuestions;
