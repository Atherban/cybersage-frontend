import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "../../stores/use.store.js";
import AIChatBot from "./AIChatBot";
import "./QuizQuestions.css";

/* ---------- Constants ---------- */
const TIME_LIMITS = {
  easy: 1 * 60 * 1000,
  medium: 2 * 60 * 1000,
  hard: 3 * 60 * 1000,
};

const DIFFICULTY_ORDER = ["easy", "medium", "hard"];

/* ---------- Effects helper ---------- */
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
        if (confetti.parentNode === container) container.removeChild(confetti);
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
        if (pointsElement.parentNode === container)
          container.removeChild(pointsElement);
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
        if (sparkle.parentNode === container) container.removeChild(sparkle);
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
      if (message.parentNode === container) container.removeChild(message);
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
        if (celebration.parentNode === container)
          container.removeChild(celebration);
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
      if (user?.currentStreak >= 2) {
        showStreakCelebration(user.currentStreak);
      }
      const pointsBadge = document.querySelector(".points-badge");
      if (pointsBadge) {
        pointsBadge.classList.add("updated");
        setTimeout(() => pointsBadge.classList.remove("updated"), 1000);
      }
      const progressFill = document.querySelector(".progress-fill");
      if (progressFill) {
        progressFill.classList.add("updated");
        setTimeout(() => progressFill.classList.remove("updated"), 1000);
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
      levelUpMessage.textContent = `Level Up! ${newDifficulty?.toUpperCase?.()}`;
      container.appendChild(levelUpMessage);
      setTimeout(() => {
        if (levelUpMessage.parentNode === container)
          container.removeChild(levelUpMessage);
      }, 3000);
    },
    [effectsContainerRef]
  );

  return {
    triggerCorrectAnswerEffects,
    showLevelUpEffect,
  };
};

/* ---------- Timer Hook ---------- */
const useTimer = (timeLimit, onTimeUp) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [timeLimit]);

  useEffect(() => {
    if (!isRunning) return;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(timerRef.current);
          onTimeUp?.();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [isRunning, onTimeUp]);

  const startTimer = useCallback(() => setIsRunning(true), []);
  const pauseTimer = useCallback(() => setIsRunning(false), []);
  const resetTimer = useCallback(
    (newTime) => {
      setIsRunning(false);
      setTimeLeft(newTime ?? timeLimit);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    },
    [timeLimit]
  );

  const formatTime = useCallback((milliseconds) => {
    const seconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  const percentage = useMemo(() => {
    return timeLimit > 0 ? (timeLeft / timeLimit) * 100 : 0;
  }, [timeLeft, timeLimit]);

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    percentage,
  };
};

/* ---------- Main Component ---------- */
const QuizQuestions = () => {
  const navigate = useNavigate();
  const { module } = useParams();
  const { user, quiz, aiChat, ui } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState("easy");
  const [timeUp, setTimeUp] = useState(false);
  const [isLastLevel, setIsLastLevel] = useState(false);

  const effectsContainerRef = useRef(null);
  const mountedRef = useRef(true);

  const { triggerCorrectAnswerEffects, showLevelUpEffect } =
    useQuizEffects(effectsContainerRef);

  const {
    timeLeft,
    formattedTime,
    startTimer,
    pauseTimer,
    resetTimer,
    percentage: timePercentage,
  } = useTimer(
    TIME_LIMITS[currentDifficulty],
    useCallback(() => {
      if (!quiz || !mountedRef.current) return;
      const currentQuestion = quiz.getCurrentQuestion?.();
      if (!currentQuestion) return;
      setTimeUp(true);
      quiz.submitAnswer?.(
        currentQuestion.id,
        "Time's Up - Skipped",
        false,
        true
      );
      setShowExplanation(true);
      ui?.addNotification?.("Time's up! Question skipped.", "info");
    }, [quiz, ui])
  );

  const getModuleName = useCallback(() => {
    if (!module || module === "random") return "Mixed Domains";
    const moduleMap = {
      digital_arrest: "Digital Arrest",
      cyber_attacks: "Cyber Attacks",
      social_media: "Social Media",
      account_security: "Account Security",
      cloud_security: "Cloud Security",
      device_security: "Device Security",
    };
    if (moduleMap[module]) return moduleMap[module];
    return module
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, [module]);

  const getNextDifficulty = useCallback((currentDiff) => {
    const currentIndex = DIFFICULTY_ORDER.indexOf(currentDiff);
    const nextDifficulty =
      currentIndex < DIFFICULTY_ORDER.length - 1
        ? DIFFICULTY_ORDER[currentIndex + 1]
        : null;
    setIsLastLevel(nextDifficulty === null);
    return nextDifficulty;
  }, []);

  const loadMockQuestions = useCallback(
    (difficulty) => {
      const mockQuestions = {
        questions: [
          {
            id: "1",
            question: `What is the primary purpose of multi-factor authentication (MFA)?`,
            options: [
              "To speed up login process",
              "To add extra layers of security",
              "To reduce password complexity",
              "To monitor user activity",
            ],
            correctAnswer: "To add extra layers of security",
            description:
              "MFA adds additional authentication factors beyond just passwords, making unauthorized access significantly more difficult.",
            difficulty,
            category: module || "account_security",
            module: module || "account_security",
          },
          {
            id: "2",
            question: `Which of the following is NOT a common phishing technique?`,
            options: [
              "Email spoofing",
              "Website cloning",
              "Network scanning",
              "SMShing",
            ],
            correctAnswer: "Network scanning",
            description:
              "Network scanning is used for network reconnaissance, not phishing. Phishing uses trick messages to steal information.",
            difficulty,
            category: module || "cyber_attacks",
            module: module || "cyber_attacks",
          },
          {
            id: "3",
            question: `What should you do if you receive a digital arrest scam call?`,
            options: [
              "Immediately pay the demanded amount",
              "Share personal information to verify identity",
              "Stay on the call and follow instructions",
              "Hang up and report to authorities",
            ],
            correctAnswer: "Hang up and report to authorities",
            description:
              "Digital arrest scams use fear. Never comply — hang up and report it.",
            difficulty,
            category: module || "digital_arrest",
            module: module || "digital_arrest",
          },
        ],
        total_questions: 3,
        difficulty_level: difficulty,
        security_module: module || "general",
        module_name: getModuleName(),
        generated_at: new Date().toISOString(),
      };

      quiz?.setQuizQuestions?.(mockQuestions);
      ui?.addNotification?.(
        `Using ${difficulty} demo questions for ${getModuleName()}`,
        "info"
      );
    },
    [module, quiz, ui, getModuleName]
  );

  const initializeQuiz = useCallback(
    async (difficulty = "easy", force = false) => {
      try {
        setLoading(true);
        setError(null);
        setTimeUp(false);

        const cached = quiz?.currentQuiz;
        if (
          !force &&
          cached &&
          cached.module === module &&
          cached.difficulty_level === difficulty &&
          cached.questions?.length > 0
        ) {
          resetTimer(TIME_LIMITS[difficulty]);
          setTimeout(startTimer, 200);
          setLoading(false);
          return;
        }

        quiz?.resetQuiz?.();
        resetTimer(TIME_LIMITS[difficulty]);
        quiz?.startQuiz?.(module, difficulty, 5);

        const result = await quiz?.fetchQuestions?.(module, difficulty, 5);

        if (!result?.success) throw new Error(result?.error || "Failed");
        setTimeout(startTimer, 200);
      } catch (err) {
        setError("Failed to load questions.");
        loadMockQuestions(difficulty);
        setTimeout(startTimer, 200);
      } finally {
        setLoading(false);
      }
    },
    [quiz, ui, module, resetTimer, startTimer, loadMockQuestions]
  );

  useEffect(() => {
    mountedRef.current = true;
    const cached = quiz?.currentQuiz;
    if (cached && cached.module === module && cached.questions?.length > 0) {
      setCurrentDifficulty(cached.difficulty_level || "easy");
      resetTimer(TIME_LIMITS[cached.difficulty_level || "easy"]);
      setTimeout(startTimer, 200);
      setLoading(false);
      return;
    }
    initializeQuiz("easy");
    return () => {
      mountedRef.current = false;
    };
  }, [module]);

  const questionIndex = quiz?.currentQuestionIndex ?? 0;

  useEffect(() => {
    const currentQuestion = quiz?.getCurrentQuestion?.();
    if (!currentQuestion) {
      pauseTimer();
      resetTimer(TIME_LIMITS[currentDifficulty]);
      return;
    }

    if (!showExplanation && !quiz?.quizCompleted) {
      resetTimer(TIME_LIMITS[currentDifficulty]);
      const t = setTimeout(() => {
        if (!mountedRef.current) return;
        startTimer();
      }, 50);

      setTimeUp(false);
      return () => clearTimeout(t);
    }

    if (showExplanation) pauseTimer();
  }, [
    questionIndex,
    showExplanation,
    currentDifficulty,
    pauseTimer,
    resetTimer,
    startTimer,
    quiz?.quizCompleted,
  ]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (effectsContainerRef.current) {
        effectsContainerRef.current.innerHTML = "";
      }
    };
  }, []);

  const currentQuestion = quiz?.getCurrentQuestion?.();
  const progress = quiz?.getProgress?.() ?? 0;
  const score = quiz?.getScore?.() ?? { correct: 0, wrong: 0, score: 0 };

  /* ---------- ORDERED HANDLERS ---------- */

  /* 1️⃣ OPTION SELECT */
  const handleOptionSelect = useCallback(
    (option) => {
      if (!showExplanation && !isSubmitting && !timeUp) {
        setSelectedOption(option);
      }
    },
    [showExplanation, isSubmitting, timeUp]
  );

  /* 2️⃣ GET HINT */
  const handleGetHint = useCallback(async () => {
    if (!user?.canUseHint?.(5)) {
      ui?.addNotification?.(
        "You need at least 5 points to use a hint!",
        "warning"
      );
      return;
    }
    const current = quiz?.getCurrentQuestion?.();
    if (!current) return;
    try {
      ui?.setLoading?.("ai", true);
      const hintResult = await aiChat?.getHint?.(current, 5);
      if (hintResult) {
        user?.useHint?.(5);
        quiz?.setHint?.(hintResult.hint);
        ui?.addNotification?.("Hint used! -5 points", "info");
      }
    } catch (err) {
      ui?.addNotification?.("Failed to get hint", "error");
    } finally {
      ui?.setLoading?.("ai", false);
    }
  }, [user, quiz, aiChat, ui]);

  /* 3️⃣ EXIT QUIZ */
  const handleExitQuiz = useCallback(() => {
    if (
      window.confirm(
        "Are you sure you want to exit? Your progress will be saved."
      )
    ) {
      navigate("/quiz");
    }
  }, [navigate]);

  /* 4️⃣ MODULE COMPLETION */
  const handleModuleCompletion = useCallback(() => {
    if (module && module !== "random") {
      user?.completeModule?.(module);
      const nextModules = user?.unlockNextModules?.(module) || [];
      if (nextModules.length > 0) {
        ui?.addNotification?.(
          `New modules unlocked: ${nextModules.join(", ")}`,
          "success"
        );
      }
      setTimeout(() => navigate("/quiz"), 3000);
    } else {
      navigate("/quiz");
    }
  }, [module, user, ui, navigate]);

  /* 5️⃣ RESTART NEXT DIFFICULTY */
  const handleRestartWithNextDifficulty = useCallback(
    async (nextDifficulty) => {
      setLoading(true);
      aiChat.clearChat?.();
      aiChat.closeChat?.();
      try {
        setCurrentDifficulty(nextDifficulty);
        await initializeQuiz(nextDifficulty, true);
      } finally {
        setLoading(false);
      }
    },
    [initializeQuiz, aiChat]
  );

  /* ✅ 6️⃣ COMPLETE QUIZ — must come BEFORE nextQuestion */
  const completeQuiz = useCallback(() => {
    pauseTimer();
    aiChat.clearChat?.();
    aiChat.cloaeChat?.();

    const isPerfectScore =
      score?.wrong === 0 &&
      score?.correct === (quiz?.currentQuiz?.questions?.length || 0);
    const completed = score?.correct > 0;

    if (module && module !== "random") {
      user?.updateModuleProgression?.(
        module,
        currentDifficulty,
        completed,
        isPerfectScore
      );

      if (isPerfectScore) {
        const nextLevel = getNextDifficulty(currentDifficulty);
        if (nextLevel) {
          showLevelUpEffect(nextLevel);
          ui?.addNotification?.(
            `Perfect score! Advanced to ${nextLevel} difficulty!`,
            "success"
          );
          setTimeout(() => handleRestartWithNextDifficulty(nextLevel), 2000);
        } else {
          ui?.addNotification?.(
            "Perfect score! You have mastered all difficulty levels!",
            "success"
          );
          handleModuleCompletion();
        }
      } else if (completed) {
        ui?.addNotification?.(
          `Good job! Try again to get a perfect score and advance to the next level.`,
          "info"
        );
      } else {
        ui?.addNotification?.(
          `Keep practicing! You'll get it next time.`,
          "warning"
        );
      }
    }

    quiz?.completeQuiz?.();
  }, [
    pauseTimer,
    score,
    quiz,
    module,
    currentDifficulty,
    getNextDifficulty,
    showLevelUpEffect,
    ui,
    handleRestartWithNextDifficulty,
    handleModuleCompletion,
    aiChat,
    user,
  ]);

  /* ✅ 7️⃣ NEXT QUESTION — now AFTER completeQuiz */
  const handleNextQuestion = useCallback(() => {
    setSelectedOption(null);
    setShowExplanation(false);
    setTimeUp(false);

    aiChat.closeChat?.();
    aiChat.clearChat?.();

    if (
      quiz?.currentQuestionIndex + 1 <
      (quiz?.currentQuiz?.questions?.length || 0)
    ) {
      quiz?.nextQuestion?.();
    } else {
      completeQuiz();
    }
  }, [quiz, aiChat, completeQuiz]);

  /* ✅ 8️⃣ SUBMIT ANSWER comes AFTER nextQuestion is safe */
  const handleSubmitAnswer = useCallback(async () => {
    if (!selectedOption || isSubmitting || timeUp || !currentQuestion) return;
    setIsSubmitting(true);
    pauseTimer();

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    quiz?.submitAnswer?.(currentQuestion.id, selectedOption, isCorrect);

    if (isCorrect) {
      user?.addPoints?.(5);
      triggerCorrectAnswerEffects(user);
      ui?.addNotification?.("+5 points! Correct answer!", "success");
    } else {
      user?.deductPoint?.();
      ui?.addNotification?.("-1 point. Incorrect answer!", "warning");

      const current = quiz?.getCurrentQuestion?.();
      if (current && aiChat?.sendMessage) {
        aiChat.sendMessage(
          `I answered this wrong: "${current.question}". Correct was "${current.correctAnswer}". Explain briefly and add 2 follow-up practice questions.`
        );
        if (!aiChat.isChatOpen) aiChat.toggleChat();
      }
    }

    setShowExplanation(true);
    setIsSubmitting(false);
  }, [
    selectedOption,
    isSubmitting,
    timeUp,
    currentQuestion,
    quiz,
    user,
    triggerCorrectAnswerEffects,
    ui,
    pauseTimer,
    aiChat,
  ]);

  /* ✅ 9️⃣ Restart Same Difficulty */
  const handleRestartSameDifficulty = useCallback(async () => {
    setLoading(true);
    aiChat.clearChat?.();
    aiChat.closeChat?.();
    try {
      await initializeQuiz(currentDifficulty, true);
    } finally {
      setLoading(false);
    }
  }, [initializeQuiz, currentDifficulty, aiChat]);

  /* ---------- UI ---------- */

  const NavButton = ({ onClick, children, className = "" }) => (
    <button
      className={`nav-button ${className}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );

  /* ---------- RENDER STATES ---------- */

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
          {isLastLevel && (
            <div className="progression-info">
              <p>
                🎯 <strong>Final Level</strong> - Complete this to unlock next
                modules!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error && !quiz?.currentQuiz) {
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

  if (quiz?.quizCompleted) {
    const isPerfectScore =
      score?.wrong === 0 &&
      score?.correct === (quiz?.currentQuiz?.questions?.length || 0);
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
                <span className="score-value">{score?.correct || 0}</span>
              </div>
              <div className="score-item wrong">
                <span className="score-label">Wrong Answers</span>
                <span className="score-value">{score?.wrong || 0}</span>
              </div>
              <div className="score-item total">
                <span className="score-label">Total Score</span>
                <span className="score-value">{score?.score || 0} points</span>
              </div>
            </div>

            <div className="completion-message">
              {isPerfectScore ? (
                <p>
                  {isLastLevel
                    ? "🎊 Congratulations! You've mastered all difficulty levels! New modules have been unlocked."
                    : "Excellent! You've mastered this level. Ready for the next challenge?"}
                </p>
              ) : score?.correct === 0 ? (
                <p>Don't give up! Review the concepts and try again.</p>
              ) : (
                <p>
                  Good effort! Practice more to achieve a perfect score and
                  advance.
                </p>
              )}
            </div>

            <div className="completion-actions">
              <button className="cta-button" onClick={() => navigate("/quiz")}>
                Back to Quiz Selection
              </button>
              {!isPerfectScore && (
                <button
                  className="cta-button secondary"
                  onClick={handleRestartSameDifficulty}
                >
                  Try Again Same Level
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion || !quiz?.currentQuiz) {
    return (
      <div className="quiz-questions-page">
        <div className="quiz-error">
          <h2>No Questions Available</h2>
          <p>Failed to load questions. Please try again.</p>
          <div className="error-actions">
            <button
              className="cta-button"
              onClick={() => initializeQuiz(currentDifficulty)}
            >
              Reload Questions
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

  return (
    <div className="quiz-questions-page">
      <div
        ref={effectsContainerRef}
        className="correct-answer-effect"
        aria-hidden="true"
      />

      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <div className="logo">Cybersage</div>
            <div className="nav-right">
              <div className="quiz-stats">
                <span className="points-badge">
                  Points: {user?.points || 0}
                </span>
                <span className="streak">
                  Streak: {user?.currentStreak || 0}
                </span>
                <span className="difficulty-level">
                  {currentDifficulty.toUpperCase()}
                  {isLastLevel && " 🏆"}
                </span>
              </div>
              <div className="nav-links">
                <NavButton onClick={handleExitQuiz}>Exit</NavButton>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="quiz-container">
        <div className="container">
          <div className="quiz-header">
            <div className="quiz-info">
              <h1>{getModuleName()} Assessment</h1>
              <div className="quiz-meta">
                <p>
                  Question {quiz?.currentQuestionIndex + 1} of{" "}
                  {quiz?.currentQuiz?.questions?.length}
                </p>
                <div className="difficulty-info">
                  <span className="current-difficulty">
                    Level: {currentDifficulty.toUpperCase()}
                    {isLastLevel && " (Final)"}
                  </span>
                </div>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="timer-section">
                <div className="timer-display">
                  <span className="timer-label">Time Left:</span>
                  <span
                    className={`timer-value ${
                      timeLeft < 10000 ? "warning" : ""
                    }`}
                  >
                    {formattedTime}
                  </span>
                </div>
                <div className="timer-bar">
                  <div
                    className="timer-fill"
                    style={{ width: `${timePercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="question-card">
            <div className="question-header">
              <span className="difficulty-badge">
                {currentQuestion.difficulty}
              </span>
              <span className="category-badge">{currentQuestion.category}</span>
              {timeUp && <span className="time-up-badge">Time's Up!</span>}
            </div>

            <h2 className="question-text">{currentQuestion.question}</h2>

            <div className="options-grid">
              {currentQuestion.options.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index);
                const isSelected = selectedOption === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                let optionClass = "option";
                if (showExplanation || timeUp) {
                  if (isCorrect) optionClass += " correct";
                  else if (isSelected && !isCorrect) optionClass += " wrong";
                } else if (isSelected) optionClass += " selected";

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
                    {(showExplanation || timeUp) && isCorrect && (
                      <div className="correct-indicator">✓</div>
                    )}
                    {(showExplanation || timeUp) &&
                      isSelected &&
                      !isCorrect && <div className="wrong-indicator">✗</div>}
                  </div>
                );
              })}
            </div>

            {!showExplanation && !timeUp && user?.canUseHint?.(5) && (
              <div className="hint-section">
                <button
                  className="hint-button"
                  onClick={handleGetHint}
                  disabled={quiz?.hintUsed || ui?.loading?.ai}
                >
                  {ui?.loading?.ai
                    ? "Getting Hint..."
                    : quiz?.hintUsed
                    ? "Hint Used"
                    : "Get Hint (5 points)"}
                </button>
                {quiz?.currentHint && (
                  <div className="hint-content">
                    <strong>Hint:</strong> {quiz.currentHint}
                  </div>
                )}
              </div>
            )}

            {(showExplanation || timeUp) && (
              <div className="explanation-section">
                <h3>{timeUp ? "Time's Up! " : ""}Explanation</h3>
                <p>{currentQuestion.description}</p>
                {timeUp && (
                  <p className="time-up-message">
                    ⏰ You ran out of time! Question skipped - no points
                    deducted.
                  </p>
                )}
              </div>
            )}

            <div className="action-buttons">
              {!showExplanation && !timeUp ? (
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
                  {quiz?.currentQuestionIndex + 1 <
                  (quiz?.currentQuiz?.questions?.length || 0)
                    ? "Next Question"
                    : "Complete Assessment"}
                </button>
              )}
            </div>
          </div>

          <div className="current-score">
            <div className="score-item">
              <span>Correct: </span>
              <strong>{score?.correct || 0}</strong>
            </div>
            <div className="score-item">
              <span>Wrong: </span>
              <strong>{score?.wrong || 0}</strong>
            </div>
            <div className="score-item">
              <span>Current Score: </span>
              <strong>{score?.score || 0} points</strong>
            </div>
            <div className="score-item">
              <span>Level: </span>
              <strong>{currentDifficulty}</strong>
            </div>
          </div>
        </div>
      </div>

      <AIChatBot />
    </div>
  );
};

export default QuizQuestions;
