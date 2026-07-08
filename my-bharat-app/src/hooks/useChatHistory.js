import { useState, useEffect } from "react";

export default function useChatHistory({ playAudioUrl, speakText, stopPlayback }) {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [error, setError] = useState("");
  const [isStarted, setIsStarted] = useState(false);

  const [activeChatId, setActiveChatId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [creditLimit, setCreditLimit] = useState(0.10);

  const fetchCreditsAndSessions = async () => {
    try {
      const syncRes = await fetch("/api/auth/sync");
      const syncData = await syncRes.json();
      if (syncRes.ok && syncData.user) {
        setCreditsUsed(syncData.user.creditsUsed || 0);
        setCreditLimit(syncData.user.creditLimit || 0.10);
      }
      const sessionsRes = await fetch("/api/chats");
      const sessionsData = await sessionsRes.json();
      if (sessionsRes.ok && sessionsData.sessions) {
        setSessions(sessionsData.sessions);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchCreditsAndSessions();
  }, []);

  const selectChatSession = async (id) => {
    setError("");
    if (stopPlayback) stopPlayback();
    if (!id) {
      setActiveChatId(null);
      setConversationHistory([]);
      setIsStarted(false);
      return;
    }
    setActiveChatId(id);
    try {
      const res = await fetch(`/api/chats/${id}`);
      const data = await res.json();
      if (res.ok) {
        setConversationHistory(data.messages || []);
        setIsStarted(true);
      }
    } catch (err) {
      console.error("Failed to load chat session:", err);
    }
  };

  const startNewChat = () => {
    if (stopPlayback) stopPlayback();
    setActiveChatId(null);
    setConversationHistory([]);
    setIsStarted(false);
    setError("");
  };

  const handleStartConversation = async () => {
    setError("");
    const greetingText = "नमस्ते! मेरा नाम सुहानी है, मैं 24 साल की हूँ। क्या मैं आपका नाम और उम्र जान सकती हूँ?";
    setConversationHistory([{ role: "assistant", content: greetingText }]);
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
        body: JSON.stringify({ text, chatId: activeChatId }),
      });
      const data = await response.json();

      if (response.status === 403) {
        throw new Error(data.error || "माफ़ करें, आपकी फ्री क्रेडिट लिमिट ($0.10) खत्म हो गई है।");
      }
      if (!response.ok) {
        throw new Error(data.error || "सहायक से जवाब पाने में विफलता");
      }
      if (data.response) {
        let newIndex = 0;
        setConversationHistory((prev) => {
          newIndex = prev.length;
          return [...prev, { role: "assistant", content: data.response }];
        });
        speakText(data.response, newIndex);
      }
      if (data.chatId && data.chatId !== activeChatId) {
        setActiveChatId(data.chatId);
      }
      await fetchCreditsAndSessions();
    } catch (err) {
      console.error("Chat Agent Error:", err);
      setError(err.message || "सर्वर से कनेक्ट करने में त्रुटि।");
    } finally {
      setIsAiTyping(false);
    }
  };

  const clearChatHistory = () => {
    setConversationHistory([]);
    setError("");
    setIsStarted(false);
    setActiveChatId(null);
    fetchCreditsAndSessions();
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
    activeChatId,
    sessions,
    creditsUsed,
    creditLimit,
    selectChatSession,
    startNewChat,
  };
}
