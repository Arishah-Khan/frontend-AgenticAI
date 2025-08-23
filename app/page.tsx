"use client";
import Image from "next/image";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [agentText, setAgentText] = useState<string>("");
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const router = useRouter();

  // 📡 Send Audio to Backend
  const sendToBackend = useCallback(async () => {
    setLoading(true);
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", audioBlob, "customer_audio.webm");

      const res = await fetch(
        "https://backend-agenticai-production.up.railway.app/agent",
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = (await res.json()) as {
        message?: string;
        audio_url?: string;
        redirect?: boolean;
        redirect_url?: string;
      };

      console.log("Backend response:", data);

      setAgentText(data.message || "");

      if (data.audio_url) {
        const audio = new Audio(
          `https://backend-agenticai-production.up.railway.app${data.audio_url}`
        );
        try {
          await audio.play();
          audio.onended = () => {
            if (data.redirect && data.redirect_url) {
              router.push(data.redirect_url);
            }
          };
        } catch (err) {
          console.warn("⚠️ Audio play blocked:", err);
          if (data.redirect && data.redirect_url) {
            router.push(data.redirect_url);
          }
        }
      } else {
        if (data.redirect && data.redirect_url) {
          router.push(data.redirect_url);
        }
      }
    } catch (err) {
      console.error("❌ Error sending audio:", err);
      alert("Failed to process audio. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // 🎙 Start Recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = sendToBackend;

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error("❌ Mic access error:", err);
      alert("Microphone access is required to use voice features.");
    }
  }, [sendToBackend]);

  // ⏹ Stop Recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, []);

  return (
    <main className="overflow-hidden">
      <section
        className="relative h-screen w-full flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url(/ag_bg.jpg)" }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl px-4 md:px-6">
          {/* LEFT TEXT */}
          <div className="z-10 text-center md:text-left flex items-center justify-center md:justify-start md:ml-12 lg:ml-28 mt-[-50px] md:mt-[-100px]">
            <div className="transform md:-translate-y-16 animate-fade-in-up">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-dark leading-tight animate-buddies">
                W E L C O M E <br /> T O <br />{" "}
                <span className="text-[#c6e452] animate-pulse">
                  S M A R T <br /> A G R I
                </span>
              </h1>
            </div>
          </div>

          {/* VOICE AGENT */}
          <div className="absolute bottom-8 md:bottom-[100px] right-1/2 md:right-[100px] translate-x-1/2 md:translate-x-0 z-10">
            <div className="bg-white w-[90vw] sm:w-[350px] md:w-[400px] md:h-[120px] rounded-xl shadow-gray-800 shadow-lg flex flex-col items-start gap-2 px-4 md:px-6 py-4">
              <div className="flex items-center gap-4">
                <Image
                  src="/ag_logo.png"
                  alt="Logo"
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                <div className="flex flex-col">
                  <span className="text-red-600 font-bold text-lg md:text-xl">
                    FARM-GENIE...
                  </span>
                  <span className="text-black font-bold text-lg md:text-xl">
                    here
                  </span>
                </div>
              </div>

              {/* RECORD BUTTON */}
              {!recording ? (
                <button
                  onClick={startRecording}
                  disabled={loading}
                  className="bg-yellow-500 text-white px-6 md:px-8 py-2 rounded-lg shadow hover:bg-green-600 text-sm disabled:bg-gray-400 transition"
                >
                  🎙 {loading ? "Processing..." : "Start Talking"}
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg shadow hover:bg-red-600 text-sm transition"
                >
                  ⏹ Stop
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* AGENT TEXT DISPLAY */}
      {agentText && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-3 md:p-4 rounded shadow w-[85vw] sm:w-80 text-center">
          <p className="text-green-800 font-medium text-sm md:text-base">
            {agentText}
          </p>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes buddies-bounce {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          50% {
            opacity: 1;
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0);
          }
        }
        .animate-buddies {
          animation: buddies-bounce 2s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fadeInUp 1.5s ease-out forwards;
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
