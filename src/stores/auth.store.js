import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI, handleAPIError } from "../services/api.service.js";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Auth actions
      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authAPI.login(email, password);
          const { user, token } = response.data;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true, user };
        } catch (error) {
          const apiError = handleAPIError(error);
          set({
            isLoading: false,
            error: apiError.message,
            isAuthenticated: false,
          });
          return { success: false, error: apiError.message };
        }
      },

      register: async (username, email, password) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authAPI.register(username, email, password);
          const { user, token } = response.data;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true, user };
        } catch (error) {
          const apiError = handleAPIError(error);
          set({
            isLoading: false,
            error: apiError.message,
            isAuthenticated: false,
          });
          return { success: false, error: apiError.message };
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });

        try {
          const response = await authAPI.checkAuth();
          const { user } = response.data;

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true, user };
        } catch (error) {
          set({
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          return { success: false };
        }
      },

      fetchUser: async () => {
        try {
          const response = await authAPI.getUser();
          const { user } = response.data;

          set({ user });
          return { success: true, user };
        } catch (error) {
          const apiError = handleAPIError(error);
          return { success: false, error: apiError.message };
        }
      },

      clearError: () => set({ error: null }),

      updateUser: (userData) =>
        set((state) => ({
          user: { ...state.user, ...userData },
        })),
    }),
    {
      name: "cybersage-auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
