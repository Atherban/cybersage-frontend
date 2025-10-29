import { create } from "zustand";
import { persist } from "zustand/middleware";
import { progressAPI, handleAPIError } from "../services/api.service.js";

const getNextDifficulty = (currentDifficulty) => {
  const difficulties = ["easy", "medium", "hard"];
  const currentIndex = difficulties.indexOf(currentDifficulty);
  return currentIndex < difficulties.length - 1
    ? difficulties[currentIndex + 1]
    : null;
};

export const useUserStore = create(
  persist(
    (set, get) => ({
      // User points and progress
      points: 10,
      totalCorrect: 0,
      totalWrong: 0,
      modulesCompleted: [],
      currentStreak: 0,
      bestStreak: 0,
      hintsUsed: 0,

      // Progressive difficulty system
      progression: {
        modules: {},
        currentDifficulties: {},
      },

      // Points management
      addPoints: (pointsToAdd) =>
        set((state) => ({
          points: state.points + pointsToAdd,
          totalCorrect: state.totalCorrect + 1,
          currentStreak: state.currentStreak + 1,
          bestStreak: Math.max(state.bestStreak, state.currentStreak + 1),
        })),

      deductPoint: () =>
        set((state) => ({
          points: Math.max(0, state.points - 1),
          totalWrong: state.totalWrong + 1,
          currentStreak: 0,
        })),

      // Hint system
      useHint: (hintCost = 5) =>
        set((state) => {
          if (state.points >= hintCost) {
            return {
              points: state.points - hintCost,
              hintsUsed: state.hintsUsed + 1,
            };
          }
          return state;
        }),

      canUseHint: (hintCost = 5) => {
        const state = get();
        return state.points >= hintCost;
      },

      // Module progression
      completeModule: (moduleId, score) =>
        set((state) => ({
          modulesCompleted: [
            ...state.modulesCompleted.filter((m) => m.id !== moduleId),
            {
              id: moduleId,
              score,
              completedAt: new Date().toISOString(),
              attempts:
                (state.modulesCompleted.find((m) => m.id === moduleId)
                  ?.attempts || 0) + 1,
            },
          ],
        })),

      updateModuleProgression: (
        moduleId,
        difficulty,
        completed,
        perfectScore
      ) =>
        set((state) => {
          const moduleProgression = state.progression.modules[moduleId] || {
            easy: {
              attempts: 0,
              completions: 0,
              perfectRuns: 0,
              currentStreak: 0,
              bestStreak: 0,
            },
            medium: {
              attempts: 0,
              completions: 0,
              perfectRuns: 0,
              currentStreak: 0,
              bestStreak: 0,
            },
            hard: {
              attempts: 0,
              completions: 0,
              perfectRuns: 0,
              currentStreak: 0,
              bestStreak: 0,
            },
          };

          const currentLevelStats = moduleProgression[difficulty];
          const newStreak = perfectScore
            ? currentLevelStats.currentStreak + 1
            : 0;

          const updatedProgression = {
            ...moduleProgression,
            [difficulty]: {
              attempts: currentLevelStats.attempts + 1,
              completions: currentLevelStats.completions + (completed ? 1 : 0),
              perfectRuns:
                currentLevelStats.perfectRuns + (perfectScore ? 1 : 0),
              currentStreak: newStreak,
              bestStreak: Math.max(currentLevelStats.bestStreak, newStreak),
            },
          };

          let currentDifficulties = {
            ...state.progression.currentDifficulties,
          };
          if (perfectScore && completed) {
            const nextDifficulty = getNextDifficulty(difficulty);
            if (nextDifficulty) {
              currentDifficulties[moduleId] = nextDifficulty;
            } else {
              currentDifficulties[moduleId] = "hard";
            }
          }

          return {
            progression: {
              ...state.progression,
              modules: {
                ...state.progression.modules,
                [moduleId]: updatedProgression,
              },
              currentDifficulties,
            },
          };
        }),

      // Getters
      getCurrentDifficulty: (moduleId) => {
        const state = get();
        return state.progression.currentDifficulties[moduleId] || "easy";
      },

      getModuleProgression: (moduleId) => {
        const state = get();
        return (
          state.progression.modules[moduleId] || {
            easy: {
              attempts: 0,
              completions: 0,
              perfectRuns: 0,
              currentStreak: 0,
              bestStreak: 0,
            },
            medium: {
              attempts: 0,
              completions: 0,
              perfectRuns: 0,
              currentStreak: 0,
              bestStreak: 0,
            },
            hard: {
              attempts: 0,
              completions: 0,
              perfectRuns: 0,
              currentStreak: 0,
              bestStreak: 0,
            },
          }
        );
      },

      getNextDifficulty: (currentDifficulty) =>
        getNextDifficulty(currentDifficulty),

      // API integration for progress saving
      saveProgressToServer: async (userId) => {
        const state = get();
        try {
          const progressData = {
            userId,
            points: state.points,
            totalCorrect: state.totalCorrect,
            totalWrong: state.totalWrong,
            modulesCompleted: state.modulesCompleted,
            progression: state.progression,
            currentStreak: state.currentStreak,
            bestStreak: state.bestStreak,
            hintsUsed: state.hintsUsed,
          };

          await progressAPI.saveProgress(progressData);
          return { success: true };
        } catch (error) {
          const apiError = handleAPIError(error);
          return { success: false, error: apiError.message };
        }
      },

      loadProgressFromServer: async (userId) => {
        try {
          const response = await progressAPI.getProgress(userId);
          const progressData = response.data;

          set({
            points: progressData.points,
            totalCorrect: progressData.totalCorrect,
            totalWrong: progressData.totalWrong,
            modulesCompleted: progressData.modulesCompleted,
            progression: progressData.progression,
            currentStreak: progressData.currentStreak,
            bestStreak: progressData.bestStreak,
            hintsUsed: progressData.hintsUsed,
          });

          return { success: true };
        } catch (error) {
          const apiError = handleAPIError(error);
          return { success: false, error: apiError.message };
        }
      },

      // Stats
      getStats: () => {
        const state = get();
        const totalQuestions = state.totalCorrect + state.totalWrong;
        const accuracy =
          totalQuestions > 0 ? (state.totalCorrect / totalQuestions) * 100 : 0;

        const activeModules = Object.keys(state.progression.modules);
        const masteredModules = activeModules.filter((moduleId) => {
          const progression = state.getModuleProgression(moduleId);
          return progression.hard.perfectRuns > 0;
        });

        return {
          points: state.points,
          totalCorrect: state.totalCorrect,
          totalWrong: state.totalWrong,
          totalQuestions,
          accuracy: Math.round(accuracy),
          currentStreak: state.currentStreak,
          bestStreak: state.bestStreak,
          modulesCompleted: state.modulesCompleted.length,
          hintsUsed: state.hintsUsed,
          activeModules: activeModules.length,
          masteredModules: masteredModules.length,
        };
      },

      resetProgress: () =>
        set({
          points: 10,
          totalCorrect: 0,
          totalWrong: 0,
          modulesCompleted: [],
          currentStreak: 0,
          bestStreak: 0,
          hintsUsed: 0,
          progression: {
            modules: {},
            currentDifficulties: {},
          },
        }),
    }),
    {
      name: "cybersage-user-storage",
      version: 1,
    }
  )
);
