import { create } from "zustand";

export const useChatbotStore = create((set) => ({
  isOpen: false,
  sessionId: "session_default",
  messages: [
    {
      id: "welcome-1",
      role: "assistant",
      content: "Hello! I am your AI Counseling Assistant. How can I assist with student risk analysis or parent communication today?",
    },
  ],
  isStreaming: false,
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  setSessionId: (id) => set({ sessionId: id }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessageContent: (contentChunk) =>
    set((state) => {
      const newMessages = [...state.messages];
      if (newMessages.length > 0) {
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg.role === "assistant") {
          lastMsg.content += contentChunk;
        }
      }
      return { messages: newMessages };
    }),
  setIsStreaming: (status) => set({ isStreaming: status }),
  clearHistory: () => set({ messages: [] }),
}));
