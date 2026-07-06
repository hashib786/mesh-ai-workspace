"use client";

import { useState, useRef, useEffect } from "react";

export default function VoiceRecorder({ onTranscriptionComplete }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  
  // Visualizer refs
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  useEffect(() => {
    return () => {
      cleanupStreams();
    };
  }, []);

  const cleanupStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const startRecording = async () => {
    setError("");
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let options = {};
      if (MediaRecorder.isTypeSupported("audio/webm")) {
        options = { mimeType: "audio/webm" };
      } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
        options = { mimeType: "audio/ogg" };
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        options = { mimeType: "audio/mp4" };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        await uploadAudio(audioBlob);
      };

      setupVisualizer(stream);

      mediaRecorder.start();
      setStatus("recording");
    } catch (err) {
      console.error("Failed to start recording:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError(
          "माइक्रोफोन उपयोग की अनुमति नहीं है। कृपया ब्राउज़र सेटिंग में अनुमति चालू करें। (Microphone permission denied.)"
        );
      } else {
        setError("माइक प्रारंभ करने में त्रुटि: " + err.message);
      }
      setStatus("idle");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop();
      cleanupStreams();
      setStatus("processing");
    }
  };

  const setupVisualizer = (stream) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);

      source.connect(analyser);
      analyser.fftSize = 64;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      const draw = () => {
        if (!analyserRef.current) return;
        animationFrameIdRef.current = requestAnimationFrame(draw);
        analyserRef.current.getByteFrequencyData(dataArray);

        ctx.fillStyle = "#F0F9FF"; // Light Sky Blue
        ctx.fillRect(0, 0, width, height);

        const barWidth = (width / bufferLength) * 1.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * height * 0.8;

          const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
          gradient.addColorStop(0, "#FF9933"); // Saffron
          gradient.addColorStop(0.5, "#38BDF8"); // Sky Blue
          gradient.addColorStop(1, "#10B981"); // Green

          ctx.fillStyle = gradient;
          ctx.fillRect(x, height / 2 - barHeight / 2, barWidth - 4, barHeight);

          x += barWidth;
        }
      };

      draw();
    } catch (e) {
      console.error("Failed to initialize audio visualizer:", e);
    }
  };

  const uploadAudio = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      const response = await fetch("/api/voice-to-text", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "ट्रांसक्रिप्शन विफल रहा (Transcription failed)");
      }

      if (data.text) {
        onTranscriptionComplete(data.text);
      }
      setStatus("idle");
    } catch (err) {
      console.error("Transcribe API Error:", err);
      setError(
        err.message || "सर्वर से कनेक्ट करने में विफल। कृपया पुनः प्रयास करें। (Failed to connect to server.)"
      );
      setStatus("idle");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative flex items-center justify-center">
        {/* Pulsing ring during recording */}
        {status === "recording" && (
          <>
            <span className="animate-ping absolute inline-flex h-40 w-40 rounded-full bg-sky-400 opacity-20"></span>
            <span className="animate-pulse absolute inline-flex h-48 w-48 rounded-full bg-sky-200 opacity-30"></span>
          </>
        )}

        {/* Central Button */}
        <button
          onClick={status === "recording" ? stopRecording : startRecording}
          disabled={status === "processing"}
          className={`relative z-10 w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-xl border-4 transition-all duration-300 ${
            status === "recording"
              ? "bg-red-500 border-red-200 text-white hover:bg-red-600 active:scale-95 animate-pulse"
              : status === "processing"
              ? "bg-sky-100 border-sky-300 text-sky-500 cursor-not-allowed"
              : "bg-gradient-to-tr from-sky-500 to-sky-600 border-sky-200 text-white hover:shadow-2xl hover:scale-105 active:scale-95"
          }`}
          title={status === "recording" ? "Stop recording" : "Start recording"}
          id="mic-button"
        >
          {status === "processing" ? (
            <svg className="animate-spin h-10 w-10 text-sky-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : status === "recording" ? (
            <svg className="h-10 w-10 fill-current" viewBox="0 0 24 24">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          ) : (
            <svg className="h-12 w-12 fill-current" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
            </svg>
          )}
        </button>
      </div>

      {/* State Text labels */}
      <div className="mt-6 text-center min-h-[2.5rem] flex flex-col justify-center select-none">
        {status === "recording" && (
          <>
            <p className="text-base font-bold text-red-500">सुन रहे हैं... बोलना जारी रखें</p>
            <p className="text-xxs text-slate-400">Listening... Tap button to stop</p>
          </>
        )}
        {status === "processing" && (
          <>
            <p className="text-base font-bold text-sky-600 animate-pulse">अनुवाद कर रहे हैं...</p>
            <p className="text-xxs text-slate-400">Processing audio to text...</p>
          </>
        )}
        {status === "idle" && (
          <>
            <p className="text-base font-bold text-slate-700">बोलने के लिए माइक दबाएं</p>
            <p className="text-xxs text-slate-400">Tap microphone to start speaking</p>
          </>
        )}
      </div>

      {/* Visualizer Waveform Canvas */}
      <div className="w-full h-10 bg-sky-50 rounded-xl overflow-hidden mt-2 border border-sky-100/70 relative flex items-center justify-center">
        <canvas ref={canvasRef} width={400} height={40} className="w-full h-full block" />
        {status !== "recording" && (
          <div className="absolute text-[10px] text-sky-300 font-bold tracking-widest uppercase select-none pointer-events-none">
            Waveform Visualizer
          </div>
        )}
      </div>

      {/* Display error if any */}
      {error && (
        <div className="w-full bg-red-50 border-l-4 border-red-500 rounded-lg p-3 mt-4 flex items-start gap-2 relative">
          <div className="text-xs text-red-700 font-medium pr-5">{error}</div>
          <button
            onClick={() => setError("")}
            className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
