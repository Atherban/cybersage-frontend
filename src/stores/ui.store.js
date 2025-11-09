import { create } from "zustand";

export const useUIStore = create((set) => ({
  // Global loading states
  loading: {
    news: false,
    quiz: false,
    questions: false,
    ai: false,
    auth: false,
  },

  isLoadingComplete: false,
  loadingProgress: 0,
  currentLoadingMessage: "Initializing...",

  setLoadingProgress: (value) => set(() => ({ loadingProgress: value })),

  setLoadingMessage: (msg) => set(() => ({ currentLoadingMessage: msg })),

  completeLoading: () => set(() => ({ isLoadingComplete: true })),

  // Notifications
  notifications: [],

  // Modal states
  modals: {
    help: false,
    stats: false,
    settings: false,
    progression: false,
    profile: false,
  },

  // Theme and UI preferences
  preferences: {
    theme: "light",
    animations: true,
    soundEffects: false,
    reduceMotion: false,
  },

  // Actions
  setLoading: (key, isLoading) =>
    set((state) => ({
      loading: {
        ...state.loading,
        [key]: isLoading,
      },
    })),

  addNotification: (message, type = "info", duration = 5000) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: Date.now(),
          message,
          type,
          duration,
          timestamp: new Date().toISOString(),
        },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((notif) => notif.id !== id),
    })),

  clearNotifications: () =>
    set({
      notifications: [],
    }),

  toggleModal: (modalName, isOpen) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: isOpen !== undefined ? isOpen : !state.modals[modalName],
      },
    })),

  // Preferences actions
  setPreference: (key, value) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        [key]: value,
      },
    })),

  toggleTheme: () =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        theme: state.preferences.theme === "light" ? "dark" : "light",
      },
    })),

  toggleAnimations: () =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        animations: !state.preferences.animations,
      },
    })),

  // Batch update preferences
  updatePreferences: (newPreferences) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        ...newPreferences,
      },
    })),

  // Reset all preferences to default
  resetPreferences: () =>
    set({
      preferences: {
        theme: "light",
        animations: true,
        soundEffects: false,
        reduceMotion: false,
      },
    }),
}));
