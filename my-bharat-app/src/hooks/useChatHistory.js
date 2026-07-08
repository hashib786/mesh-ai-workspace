import { useState, useEffect } from "react";

export default function useChatHistory({ playAudioUrl, speakText }) {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [error, setError] = useState("");
  const [isStarted, setIsStarted] = useState(false);

  // Load persistent chat history on load
  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch("/api/chat");
        const data = await response.json();
        if (response.ok && data.history) {
          setConversationHistory(data.history);
          if (data.history.length > 0) {
            setIsStarted(true);
          }
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    }
    loadHistory();
  }, []);

  const handleStartConversation = async () => {
    setError("");
    
    const initialGreetingText = "नमस्ते! मेरा नाम सुहानी है, मैं 24 साल की हूँ। क्या मैं आपका नाम और उम्र जान सकती हूँ?";

    try {
      await fetch("/api/chat", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ greeting: initialGreetingText }),
      });
    } catch (err) {
      console.error("Failed to reset and initialize chat history:", err);
    }

    setConversationHistory([{ role: "assistant", content: initialGreetingText }]);
    setIsStarted(true);

    playAudioUrl('/audio/greeting.wav', 0);
  };

  const handleTranscriptionComplete = async (text) => {
    setError("");
    
    playAudioUrl('/audio/wait.wav', null);

    setConversationHistory((prev) => [...prev, { role: "user", content: text }]);
    setIsAiTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "सहायक से जवाब पाने में विफलता (Failed to receive AI response)");
      }

      if (data.response) {
        let newIndex = 0;
        setConversationHistory((prev) => {
          newIndex = prev.length;
          return [...prev, { role: "assistant", content: data.response }];
        });
        speakText(data.response, newIndex);
      }
    } catch (err) {
      console.error("Chat Agent Error:", err);
      setError(
        err.message || "सर्वर से कनेक्ट करने में त्रुटि। कृपया पुनः प्रयास करें। (Failed to connect to chat agent.)"
      );
    } finally {
      setIsAiTyping(false);
    }
  };

  const clearChatHistory = async () => {
    try {
      await fetch("/api/chat", { method: "DELETE" });
    } catch (err) {
      console.error("Failed to clear chat history:", err);
    }

    setConversationHistory([]);
    setError("");
    setIsStarted(false);
  };

  return {
    conversationHistory,
    isAiTyping,
    error,
    setError,
    isStarted,
    handleStartConversation,
    handleTranscriptionComplete,
    clearChatHistory,
  };
}
