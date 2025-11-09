import { create } from "zustand";
import { questionsAPI, handleAPIError } from "../services/api.service.js";

// Module progression dependencies
const moduleDependencies = {
  digital_arrest: [], // Always unlocked
  cyber_attacks: [],
  social_media: ["digital_arrest"],
  account_security: ["cyber_attacks"],
  cloud_security: ["account_security"],
  device_security: ["social_media", "account_security"],
};

// Module completion requirements (min score to pass)
const moduleRequirements = {
  digital_arrest: 60,
  cyber_attacks: 65,
  social_media: 70,
  account_security: 75,
  cloud_security: 80,
  device_security: 85,
};

export const useQuizStore = create((set, get) => ({
  // Current quiz state (existing)
  currentQuiz: null,
  currentQuestionIndex: 0,
  userAnswers: [],
  quizStarted: false,
  quizCompleted: false,
  timeStarted: null,
  timeCompleted: null,

  // Hint system (existing)
  currentHint: null,
  hintUsed: false,

  // Quiz configuration (existing)
  currentModule: null,
  difficulty: "easy",
  questionCount: 5,

  // NEW: Progression system
  moduleProgress: {},
  unlockedModules: ["digital_arrest", "cyber_attacks"], // Start with first module
  completedModules: [],
  certificates: {},
  userScores: {},

  // NEW: Get next unlockable modules
  getNextUnlockableModules: (completedModule) => {
    const { completedModules } = get();
    const allCompleted = [...completedModules, completedModule];

    return Object.entries(moduleDependencies)
      .filter(
        ([module, deps]) =>
          deps.includes(completedModule) &&
          deps.every((dep) => allCompleted.includes(dep))
      )
      .map(([module]) => module);
  },

  // NEW: Check if module can be unlocked
  canUnlockModule: (moduleId) => {
    const { completedModules } = get();
    const dependencies = moduleDependencies[moduleId] || [];
    return dependencies.every((dep) => completedModules.includes(dep));
  },

  // MODIFIED: Start quiz with unlock check
  startQuiz: (module, difficulty = "easy", questionCount = 5) => {
    const state = get();

    // Check if module is unlocked
    if (!state.unlockedModules.includes(module)) {
      throw new Error(
        `Module "${module}" is locked. Complete prerequisites first.`
      );
    }

    set({
      currentModule: module,
      difficulty,
      questionCount,
      quizStarted: true,
      quizCompleted: false,
      currentQuestionIndex: 0,
      userAnswers: [],
      currentHint: null,
      hintUsed: false,
      timeStarted: new Date().toISOString(),
    });
  },

  // NEW: Complete module and handle progression
  completeModule: () => {
    const state = get();
    const { currentModule, getScore, userAnswers, timeStarted } = state;

    if (!currentModule || !state.quizCompleted) return;

    const score = getScore();
    const minScoreRequired = moduleRequirements[currentModule] || 60;
    const isModulePassed = score.accuracy >= minScoreRequired;

    set((state) => {
      const newState = {
        userScores: {
          ...state.userScores,
          [currentModule]: {
            score: score.accuracy,
            passed: isModulePassed,
            date: new Date().toISOString(),
            answers: userAnswers,
            timeTaken: timeStarted
              ? Date.now() - new Date(timeStarted).getTime()
              : 0,
          },
        },
      };

      // If module passed, handle completion and unlocking
      if (isModulePassed) {
        const completedModules = [
          ...new Set([...state.completedModules, currentModule]),
        ];
        const nextModules = get().getNextUnlockableModules(currentModule);
        const unlockedModules = [
          ...new Set([...state.unlockedModules, ...nextModules]),
        ];

        // Generate certificate
        const certificate = {
          id: `cert_${currentModule}_${Date.now()}`,
          moduleId: currentModule,
          moduleName:
            securityModules.find((m) => m.id === currentModule)?.name ||
            currentModule,
          score: score.accuracy,
          completionDate: new Date().toISOString(),
          userName: "CyberSage Trainee", // You can integrate with user store
          certificateUrl: null,
        };

        newState.completedModules = completedModules;
        newState.unlockedModules = unlockedModules;
        newState.certificates = {
          ...state.certificates,
          [currentModule]: certificate,
        };
      }

      return newState;
    });

    return {
      passed: isModulePassed,
      score: score.accuracy,
      minRequired: minScoreRequired,
    };
  },

  // NEW: Generate certificate download
  generateCertificate: async (moduleId) => {
    const state = get();
    const certificate = state.certificates[moduleId];

    if (!certificate) {
      throw new Error(`No certificate found for module: ${moduleId}`);
    }

    try {
      // Here you would typically call your certificate generation API
      // For now, we'll create a mock download
      const certificateData = {
        ...certificate,
        issuedBy: "CyberSage Security Academy",
        credentialId: `CS-${moduleId.toUpperCase()}-${Date.now()}`,
        verificationUrl: `https://cybersage/verify/${certificate.id}`,
      };

      // Create downloadable certificate (mock implementation)
      const certificateBlob = new Blob(
        [JSON.stringify(certificateData, null, 2)],
        { type: "application/json" }
      );

      const downloadUrl = URL.createObjectURL(certificateBlob);

      set((state) => ({
        certificates: {
          ...state.certificates,
          [moduleId]: {
            ...state.certificates[moduleId],
            downloadUrl,
          },
        },
      }));

      return { success: true, downloadUrl, certificate: certificateData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // NEW: Get module status
  getModuleStatus: (moduleId) => {
    const state = get();
    const isCompleted = state.completedModules.includes(moduleId);
    const isUnlocked = state.unlockedModules.includes(moduleId);
    const canUnlock = state.canUnlockModule(moduleId);
    const score = state.userScores[moduleId];
    const certificate = state.certificates[moduleId];

    return {
      id: moduleId,
      isCompleted,
      isUnlocked,
      canUnlock,
      score,
      certificate,
      requirements: moduleRequirements[moduleId] || 60,
      dependencies: moduleDependencies[moduleId] || [],
    };
  },

  // NEW: Get all modules with status
  getAllModuleStatus: () => {
    const state = get();
    return securityModules.map((module) => state.getModuleStatus(module.id));
  },

  // MODIFIED: Complete quiz and trigger module completion
  completeQuiz: () => {
    set({
      quizCompleted: true,
      timeCompleted: new Date().toISOString(),
    });

    // Auto-complete module after quiz completion
    setTimeout(() => {
      get().completeModule();
    }, 100);
  },

  // Existing API Actions (unchanged)
  fetchQuestions: async (module, difficulty = "easy", count = 5) => {
    try {
      let response;

      if (module && module !== "random") {
        response = await questionsAPI.getModuleQuestions(
          module,
          difficulty,
          count
        );
      } else {
        switch (difficulty) {
          case "easy":
            response = await questionsAPI.getEasyQuestions(count, module);
            break;
          case "medium":
            response = await questionsAPI.getMediumQuestions(count, module);
            break;
          case "hard":
            response = await questionsAPI.getHardQuestions(count, module);
            break;
          default:
            response = await questionsAPI.getEasyQuestions(count, module);
        }
      }

      const quizData = response.data;
      set({ currentQuiz: quizData });
      return { success: true, data: quizData };
    } catch (error) {
      const apiError = handleAPIError(error);
      return { success: false, error: apiError.message };
    }
  },

  fetchAvailableModules: async () => {
    try {
      const response = await questionsAPI.getAvailableModules();
      return { success: true, data: response.data };
    } catch (error) {
      const apiError = handleAPIError(error);
      return { success: false, error: apiError.message };
    }
  },

  // Existing actions (unchanged)
  setQuizQuestions: (questions) => set({ currentQuiz: questions }),

  submitAnswer: (questionId, selectedAnswer, isCorrect) =>
    set((state) => ({
      userAnswers: [
        ...state.userAnswers,
        {
          questionId,
          selectedAnswer,
          isCorrect,
          answeredAt: new Date().toISOString(),
          hintUsed: state.hintUsed,
        },
      ],
      hintUsed: false,
    })),

  setHint: (hint) => set({ currentHint: hint, hintUsed: true }),
  clearHint: () => set({ currentHint: null }),

  nextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: state.currentQuestionIndex + 1,
      currentHint: null,
      hintUsed: false,
    })),

  resetQuiz: () =>
    set({
      currentQuiz: null,
      currentQuestionIndex: 0,
      userAnswers: [],
      quizStarted: false,
      quizCompleted: false,
      currentHint: null,
      hintUsed: false,
      timeStarted: null,
      timeCompleted: null,
    }),

  updateDifficulty: (newDifficulty) => set({ difficulty: newDifficulty }),

  // Existing getters (unchanged)
  getCurrentQuestion: () => {
    const state = get();
    return state.currentQuiz?.questions?.[state.currentQuestionIndex] || null;
  },

  getProgress: () => {
    const state = get();
    if (!state.currentQuiz?.questions) return 0;
    return (
      (state.currentQuestionIndex / state.currentQuiz.questions.length) * 100
    );
  },

  getScore: () => {
    const state = get();
    const correctAnswers = state.userAnswers.filter(
      (answer) => answer.isCorrect
    ).length;
    const wrongAnswers = state.userAnswers.filter(
      (answer) => !answer.isCorrect
    ).length;
    const totalQuestions = state.userAnswers.length;

    const score = correctAnswers * 5 - wrongAnswers;
    const isPerfect =
      wrongAnswers === 0 &&
      correctAnswers === totalQuestions &&
      totalQuestions > 0;
    const accuracy =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    return {
      correct: correctAnswers,
      wrong: wrongAnswers,
      score: score,
      totalQuestions,
      accuracy: Math.round(accuracy),
      isPerfect: isPerfect,
      completed: correctAnswers > 0,
    };
  },
}));
