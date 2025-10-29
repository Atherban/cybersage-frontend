import { create } from "zustand";
import { questionsAPI, handleAPIError } from "../services/api.service.js";

export const useQuizStore = create((set, get) => ({
  // Current quiz state
  currentQuiz: null,
  currentQuestionIndex: 0,
  userAnswers: [],
  quizStarted: false,
  quizCompleted: false,
  timeStarted: null,
  timeCompleted: null,

  // Hint system
  currentHint: null,
  hintUsed: false,

  // Quiz configuration
  currentModule: null,
  difficulty: "easy",
  questionCount: 5,

  // API Actions
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
        // Use generic difficulty routes for random modules
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

  // Quiz management actions
  startQuiz: (module, difficulty = "easy", questionCount = 5) =>
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
    }),

  setQuizQuestions: (questions) =>
    set({
      currentQuiz: questions,
    }),

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

  setHint: (hint) =>
    set({
      currentHint: hint,
      hintUsed: true,
    }),

  clearHint: () =>
    set({
      currentHint: null,
    }),

  nextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: state.currentQuestionIndex + 1,
      currentHint: null,
      hintUsed: false,
    })),

  completeQuiz: () =>
    set({
      quizCompleted: true,
      timeCompleted: new Date().toISOString(),
    }),

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

  updateDifficulty: (newDifficulty) =>
    set({
      difficulty: newDifficulty,
    }),

  // Getters
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
