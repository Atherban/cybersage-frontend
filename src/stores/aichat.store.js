import { create } from "zustand";
import { aiAPI, handleAPIError } from "../services/api.service.js";

export const useAIChatStore = create((set, get) => ({
  // Chat state
  isChatOpen: false,
  chatMessages: [],
  isTyping: false,
  currentSessionId: null,

  // Current question context for AI
  currentQuestionContext: null,
  wrongAnswerTriggered: false,

  // Actions
  openChat: (questionContext = null) =>
    set({
      isChatOpen: true,
      currentQuestionContext: questionContext,
      wrongAnswerTriggered: !!questionContext,
    }),

  closeChat: () =>
    set({
      isChatOpen: false,
      wrongAnswerTriggered: false,
    }),

  toggleChat: () =>
    set((state) => ({
      isChatOpen: !state.isChatOpen,
      wrongAnswerTriggered: false,
    })),

  addMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),

  setTyping: (isTyping) => set({ isTyping }),

  clearChat: () =>
    set({
      chatMessages: [],
      currentSessionId: null,
      currentQuestionContext: null,
      wrongAnswerTriggered: false,
    }),

  setSessionId: (sessionId) => set({ currentSessionId: sessionId }),

  // AI Chat API integration
  sendMessage: async (message, quizContext = null) => {
    const state = get();

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      chatMessages: [...state.chatMessages, userMessage],
      isTyping: true,
    }));

    try {
      const response = await aiAPI.chat(
        message,
        state.currentSessionId,
        quizContext
      );
      const data = response.data;

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
        suggested_follow_ups: data.suggested_follow_ups || [],
        is_related_to_quiz: data.is_related_to_quiz || false,
      };

      set((state) => ({
        chatMessages: [...state.chatMessages, aiMessage],
        isTyping: false,
        currentSessionId: data.sessionId || state.currentSessionId,
      }));

      return { success: true, message: aiMessage };
    } catch (error) {
      const apiError = handleAPIError(error);

      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: apiError.message,
        timestamp: new Date().toISOString(),
        isError: true,
      };

      set((state) => ({
        chatMessages: [...state.chatMessages, errorMessage],
        isTyping: false,
      }));

      return { success: false, error: apiError.message };
    }
  },

  sendQuizFollowUp: async (message, quizQuestion, userAnswer, isCorrect) => {
    const state = get();

    try {
      const response = await aiAPI.quizFollowUp(
        message,
        state.currentSessionId,
        quizQuestion,
        userAnswer,
        isCorrect
      );

      return { success: true, data: response.data };
    } catch (error) {
      const apiError = handleAPIError(error);
      return { success: false, error: apiError.message };
    }
  },

  triggerWrongAnswerChat: (question, userAnswer, correctAnswer) => {
    const quizContext = {
      currentQuestion: {
        question: question.question,
        correctAnswer: question.correctAnswer,
        description: question.description,
        difficulty: question.difficulty,
        category: question.category,
        module: question.module,
      },
      userAnswer: userAnswer,
      isCorrect: false,
    };

    set({
      isChatOpen: true,
      currentQuestionContext: quizContext,
      wrongAnswerTriggered: true,
    });

    setTimeout(() => {
      get().sendMessage(
        "I got this question wrong. Can you help me understand why the correct answer is right?",
        quizContext
      );
    }, 1000);
  },

  getHint: async (question, hintCost = 5) => {
    try {
      const response = await aiAPI.chat(
        `Give me a hint for this question without revealing the answer: "${
          question.question
        }". Options: ${question.options.join(", ")}`,
        null,
        { currentQuestion: question, hintRequest: true }
      );

      if (response.data.success) {
        return {
          hint: response.data.response,
          cost: hintCost,
          success: true,
        };
      }
    } catch (error) {
      console.error("Error getting hint from AI:", error);
    }

    return {
      hint: "Consider the key cybersecurity principles mentioned in the question and eliminate obviously wrong options first.",
      cost: hintCost,
      success: false,
    };
  },
}));
