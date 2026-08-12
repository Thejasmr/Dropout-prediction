"use client";

import { useChatbotStore } from "@/store/useChatbotStore";

export function useChatbot() {
  const {
    sessionId,
    messages,
    isStreaming,
    addMessage,
    updateLastMessageContent,
    setIsStreaming,
  } = useChatbotStore();

  const sendQuery = async (queryText, contextStudentId = null) => {
    if (!queryText.trim() || isStreaming) return;

    // Add user message
    addMessage({
      id: `user-${Date.now()}`,
      role: "user",
      content: queryText,
    });

    // Add empty assistant message placeholder
    addMessage({
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "",
    });

    setIsStreaming(true);

    try {
      const response = await fetch("/api/proxy/api/v1/chatbot/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: JSON.stringify({
          query: queryText,
          session_id: sessionId,
          context_student_id: contextStudentId,
        }),
      });

      if (!response.body) {
        setIsStreaming(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                updateLastMessageContent(data.content);
              }
              if (data.event === "done") {
                setIsStreaming(false);
                break;
              }
            } catch (err) {
              // ignore parse errors for partial chunks
            }
          }
        }
      }
    } catch (err) {
      updateLastMessageContent("\n[Error connecting to AI service]");
    } finally {
      setIsStreaming(false);
    }
  };

  return { messages, isStreaming, sendQuery };
}
