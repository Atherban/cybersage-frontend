import { useAuthStore } from "./auth.store.js";
import { useUserStore } from "./user.store.js";
import { useQuizStore } from "./quiz.store.js";
import { useAIChatStore } from "./aichat.store.js";
import { useUIStore } from "./ui.store.js";

// Combined store for easy access
export const useAppStore = () => {
  const auth = useAuthStore();
  const user = useUserStore();
  const quiz = useQuizStore();
  const aiChat = useAIChatStore();
  const ui = useUIStore();

  return {
    auth,
    user,
    quiz,
    aiChat,
    ui,
  };
};

// Export individual stores
export { useAuthStore, useUserStore, useQuizStore, useAIChatStore, useUIStore };
