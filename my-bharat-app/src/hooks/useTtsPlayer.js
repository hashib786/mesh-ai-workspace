import { useState, useEffect, useRef } from "react";

// Helper function to split text into sentence-sized chunks under maxLen characters
export const splitTextIntoSentenceChunks = (text, maxLen = 400) => {
  if (!text) return [];
  const sentences = text.split(/([।!?\n.।]+)/);
  const chunks = [];
  let currentChunk = "";

  for (let i = 0; i < sentences.length; i++) {
    let part = sentences[i];
    if (!part) continue;

    if (part.length > maxLen) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      const words = part.split(/(\s+)/);
      for (const word of words) {
        if ((currentChunk + word).length > maxLen) {
          if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
          }
          currentChunk = word;
        } else {
          currentChunk += word;
        }
      }
    } else if ((currentChunk + part).length > maxLen) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = part;
    } else {
      currentChunk += part;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

export default function useTtsPlayer() {
  const [activeSpeechIndex, setActiveSpeechIndex] = useState(null);
  const activeSpeechIndexRef = useRef(null);
  const audioRef = useRef(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setActiveSpeechIndex(null);
    activeSpeechIndexRef.current = null;
  };

  const playAudioUrl = (url, index = null) => {
    stopPlayback();

    const audio = new Audio(url);
    audioRef.current = audio;

    if (index !== null) {
      setActiveSpeechIndex(index);
      activeSpeechIndexRef.current = index;
      audio.onended = () => {
        setActiveSpeechIndex(null);
        activeSpeechIndexRef.current = null;
        audioRef.current = null;
      };
      audio.onerror = () => {
        setActiveSpeechIndex(null);
        activeSpeechIndexRef.current = null;
        audioRef.current = null;
      };
    } else {
      audio.onended = () => {
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
      };
      audio.onerror = () => {
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
      };
    }

    audio.play().catch((err) => console.error("Audio playback failed:", err));
  };

  const speakText = async (text, index) => {
    if (!text) return;

    if (activeSpeechIndexRef.current === index) {
      stopPlayback();
      return;
    }

    stopPlayback();

    const chunks = splitTextIntoSentenceChunks(text, 400);
    if (chunks.length === 0) return;

    try {
      setActiveSpeechIndex(index);
      activeSpeechIndexRef.current = index;
      let currentChunkIndex = 0;

      const playNextChunk = async () => {
        // Guard check: if user clicked stop or started another query, abort!
        if (activeSpeechIndexRef.current !== index) {
          return;
        }

        if (currentChunkIndex >= chunks.length) {
          stopPlayback();
          return;
        }

        const chunkText = chunks[currentChunkIndex];
        currentChunkIndex++;

        try {
          const response = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: chunkText }),
          });

          if (!response.ok) {
            throw new Error("Failed to synthesize speech chunk");
          }

          const blob = await response.blob();
          const audioUrl = URL.createObjectURL(blob);

          if (activeSpeechIndexRef.current !== index) {
            URL.revokeObjectURL(audioUrl);
            return;
          }

          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            playNextChunk();
          };

          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            stopPlayback();
          };

          await audio.play();
        } catch (err) {
          console.error("Error playing chunk:", err);
          stopPlayback();
        }
      };

      await playNextChunk();
    } catch (err) {
      console.error("TTS playback error:", err);
      stopPlayback();
    }
  };

  return {
    activeSpeechIndex,
    speakText,
    playAudioUrl,
    stopPlayback,
  };
}
