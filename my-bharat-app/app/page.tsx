"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [status, setStatus] = useState<"idle" | "recording" | "processing">("idle");
  const [transcription, setTranscription] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Ref elements for real-time waveform visualizer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Clean up recording/visualization streams on component unmount
  useEffect(() => {
    return () => {
      cleanupStreams();
    };
  }, []);

  const cleanupStreams = () => {
    // Stop recording tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    // Cancel canvas animation
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    // Close AudioContext
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const startRecording = async () => {
    setError("");
    setTranscription("");
    audioChunksRef.current = [];

    try {
      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 2. Select compatible mimeType
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

      // 3. Setup real-time Canvas Waveform Visualizer
      setupVisualizer(stream);

      // 4. Start recording
      mediaRecorder.start();
      setStatus("recording");
    } catch (err: any) {
      console.error("Failed to start recording:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError(
          "माइक्रोफोन उपयोग की अनुमति नहीं है। कृपया ब्राउज़र सेटिंग में अनुमति चालू करें। (Microphone permission denied. Please allow microphone access in settings.)"
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

  const setupVisualizer = (stream: MediaStream) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);

      source.connect(analyser);
      analyser.fftSize = 64; // Balanced frequency resolution for visual aesthetics

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

        // Background color matched to sky-50
        ctx.fillStyle = "#F0F9FF";
        ctx.fillRect(0, 0, width, height);

        const barWidth = (width / bufferLength) * 1.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          // Normalize values
          barHeight = (dataArray[i] / 255) * height * 0.8;

          // Gradient color palette representing Saffron to Green
          const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
          gradient.addColorStop(0, "#FF9933"); // Saffron
          gradient.addColorStop(0.5, "#38BDF8"); // Sky Blue transition
          gradient.addColorStop(1, "#10B981"); // Emerald Green

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

  const uploadAudio = async (audioBlob: Blob) => {
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

      setTranscription(data.text);
      setStatus("idle");
    } catch (err: any) {
      console.error("Transcribe API Error:", err);
      setError(
        err.message || "सर्वर से कनेक्ट करने में विफल। कृपया पुनः प्रयास करें। (Failed to connect to server.)"
      );
      setStatus("idle");
    }
  };

  const copyToClipboard = () => {
    if (!transcription) return;
    navigator.clipboard.writeText(transcription);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const readAloud = () => {
    if (!transcription) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // Reset active speech
    const utterance = new SpeechSynthesisUtterance(transcription);
    utterance.lang = "hi-IN"; // Native Hindi voice engine

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-sky-50 via-white to-sky-100 flex flex-col justify-between font-sans">
      {/* Top Accent Flag Borders */}
      <div className="flex h-1.5 w-full">
        <div className="bg-[#FF9933] flex-1"></div>
        <div className="bg-white flex-1"></div>
        <div className="bg-[#138808] flex-1"></div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-sky-100/50 p-8 flex flex-col items-center relative overflow-hidden">
          
          {/* Subtle design accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 rounded-full filter blur-2xl opacity-40 -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-100 rounded-full filter blur-2xl opacity-40 -ml-16 -mb-16"></div>

          {/* App Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 flex items-center justify-center gap-2">
              <span className="text-[#FF9933]">जन</span>
              <span className="text-slate-400 font-light">-</span>
              <span className="text-[#138808]">साथी</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium tracking-wide mt-1 uppercase">
              Jan-Sathi Voice Assistant
            </p>
            <p className="text-base text-slate-600 mt-2 font-medium">
              बोलें और अपनी भाषा में सहायता पाएं
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Speak and get help instantly
            </p>
          </div>

          {/* Interactive Microphone Section */}
          <div className="flex flex-col items-center justify-center w-full my-6">
            <div className="relative flex items-center justify-center">
              
              {/* Outer pulsing ring for recording */}
              {status === "recording" && (
                <>
                  <span className="animate-ping absolute inline-flex h-44 w-44 rounded-full bg-sky-400 opacity-20"></span>
                  <span className="animate-pulse absolute inline-flex h-52 w-52 rounded-full bg-sky-200 opacity-30"></span>
                </>
              )}

              {/* Central Mic Button */}
              <button
                onClick={status === "recording" ? stopRecording : startRecording}
                disabled={status === "processing"}
                className={`relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-xl border-4 transition-all duration-300 ${
                  status === "recording"
                    ? "bg-red-500 border-red-200 text-white hover:bg-red-600 active:scale-95"
                    : status === "processing"
                    ? "bg-sky-100 border-sky-300 text-sky-500 cursor-not-allowed"
                    : "bg-gradient-to-tr from-sky-500 to-sky-600 border-sky-200 text-white hover:shadow-2xl hover:scale-105 active:scale-95"
                }`}
                title={status === "recording" ? "Stop recording" : "Start recording"}
                id="mic-button"
              >
                {status === "processing" ? (
                  // Spinning Loader Icon
                  <svg className="animate-spin h-12 w-12 text-sky-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : status === "recording" ? (
                  // Recording Stop Square Icon
                  <svg className="h-12 w-12 fill-current" viewBox="0 0 24 24">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                  </svg>
                ) : (
                  // Microphone Icon
                  <svg className="h-14 w-14 fill-current" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Instruction Label */}
            <div className="mt-8 text-center min-h-[3rem] flex flex-col justify-center">
              {status === "recording" && (
                <>
                  <p className="text-lg font-bold text-red-500 animate-pulse">सुन रहे हैं... बोलना जारी रखें</p>
                  <p className="text-xs text-slate-400">Listening... Keep speaking. Tap to stop.</p>
                </>
              )}
              {status === "processing" && (
                <>
                  <p className="text-lg font-bold text-sky-600">प्रोसेस कर रहे हैं...</p>
                  <p className="text-xs text-slate-400">Processing transcription...</p>
                </>
              )}
              {status === "idle" && (
                <>
                  <p className="text-lg font-bold text-slate-700">बात करने के लिए बटन दबाएं</p>
                  <p className="text-xs text-slate-400">Tap button to start speaking</p>
                </>
              )}
            </div>

            {/* Audio Waveform Canvas */}
            <div className="w-full h-12 bg-sky-50 rounded-xl overflow-hidden mt-2 border border-sky-100 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={400}
                height={48}
                className="w-full h-full block"
              />
              {status !== "recording" && (
                <div className="absolute text-xs text-sky-300 font-medium tracking-widest uppercase select-none pointer-events-none">
                  Waveform Visualizer
                </div>
              )}
            </div>
          </div>

          {/* Error Message Box */}
          {error && (
            <div className="w-full bg-red-50 border-l-4 border-red-500 rounded-lg p-4 my-4 flex items-start gap-2 relative">
              <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-xs text-red-700 font-medium pr-6">{error}</div>
              <button
                onClick={() => setError("")}
                className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"
                title="Dismiss"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Output Transcription Text Area */}
          <div className="w-full mt-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>अनुवादित हिंदी पाठ (Transcription in Hindi)</span>
              {transcription && (
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                  सफल (Success)
                </span>
              )}
            </h3>
            
            <div className="w-full min-h-[120px] bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between transition-all duration-300">
              {transcription ? (
                <>
                  <p className="text-slate-800 text-lg font-medium leading-relaxed break-words whitespace-pre-wrap select-all">
                    {transcription}
                  </p>
                  
                  {/* Actions Bar for result */}
                  <div className="flex gap-2 justify-end items-center mt-4 pt-3 border-t border-slate-200/60">
                    {/* Read Aloud Button */}
                    <button
                      onClick={readAloud}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 ${
                        isSpeaking
                          ? "bg-red-100 text-red-600 hover:bg-red-200"
                          : "bg-sky-50 text-sky-600 hover:bg-sky-100"
                      }`}
                      title={isSpeaking ? "रूकें (Stop)" : "सुनें (Speak)"}
                    >
                      {isSpeaking ? (
                        <>
                          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                            <rect x="6" y="6" width="12" height="12" rx="1" />
                          </svg>
                          <span>रोकें (Stop)</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                          </svg>
                          <span>सुनें (Listen)</span>
                        </>
                      )}
                    </button>

                    {/* Copy Text Button */}
                    <button
                      onClick={copyToClipboard}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 ${
                        isCopied
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                      title="Copy to clipboard"
                    >
                      {isCopied ? (
                        <>
                          <svg className="h-3.5 w-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>कॉपी हुआ!</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                          </svg>
                          <span>कॉपी करें (Copy)</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-slate-400 select-none">
                  <svg className="h-8 w-8 stroke-current mb-2 opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v3.75m-9.75-3h.008v.008H12V6.75z" />
                  </svg>
                  <span className="text-xs text-center font-medium leading-relaxed">
                    आपका अनुवादित पाठ यहाँ दिखाई देगा...<br />
                    (Your transcribed text will appear here...)
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Footer Branding */}
      <footer className="text-center py-6 text-xs text-slate-400 font-medium">
        <p>© 2026 जन-साथी (Jan-Sathi). राष्ट्रीय डिजिटल ग्रामीण मिशन पहल</p>
        <p className="mt-0.5 text-[10px]">National Digital Rural Mission Initiative</p>
      </footer>
    </div>
  );
}
