"use client";

import Image from "next/image";
import { useState, useRef, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// ---------------- Type Definitions ----------------
type Weather = {
  location: string;
  condition: string;
  temp_c: number | string;
};

type Soil = {
  moisture: number;
  ph?: number;
  nitrogen?: string;
  phosphorus?: string;
  potassium?: string;
};

type AgentResponse = {
  message?: string;
  audio_url?: string;
  weather?: {
    location?: { name?: string };
    current?: { condition?: { text?: string }; temp_c?: number };
  };
  soil?: {
    moisture?: number;
    ph?: number;
    nitrogen?: string;
    phosphorus?: string;
    potassium?: string;
  };
};


// ---------------- Component ----------------
export default function IrrigationAdvicePage() {
  const [query, setQuery] = useState("");
  const [agentText, setAgentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [soil, setSoil] = useState<Soil | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ----------------- Send audio/text to backend -----------------
  const fetchAgent = useCallback(async (formData: FormData) => {
    setLoading(true);
    setAgentText("");
    setWeather(null);
    setSoil(null);

    try {
      const res = await fetch("https://backend-agenticai-production.up.railway.app/agent", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data: AgentResponse = await res.json(); // API response can still be dynamic

      setAgentText(data.message || "");

      // ---------- Weather ----------
      if (data.weather) {
        setWeather({
          location: data.weather.location?.name || "Unknown",
          condition: data.weather.current?.condition?.text || "N/A",
          temp_c: data.weather.current?.temp_c || 0,
        });
      } else if (data.message) {
        const weatherMatch = data.message.match(
          /Weather in (.*?) is (.*) with temperature ([0-9.]+)°C/
        );
        if (weatherMatch) {
          setWeather({
            location: weatherMatch[1],
            condition: weatherMatch[2],
            temp_c: weatherMatch[3],
          });
        }
      }

      // ---------- Soil ----------
      if (data.soil) {
        setSoil({
          moisture: data.soil.moisture || 0,
          ph: data.soil.ph || 7,
          nitrogen: data.soil.nitrogen || "medium",
          phosphorus: data.soil.phosphorus || "medium",
          potassium: data.soil.potassium || "medium",
        });
      } else if (data.message) {
        const soilMatch = data.message.match(/soil moisture (\d+)%/);
        if (soilMatch) {
          setSoil({ moisture: Number(soilMatch[1]) });
        }
      }

      // ---------- Audio ----------
      if (data.audio_url) {
        const audio = new Audio(`https://backend-agenticai-production.up.railway.app${data.audio_url}`);
        audioRef.current = audio;
        try {
          await audio.play();
        } catch (err) {
          console.warn("Audio autoplay blocked:", err);
        }
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to fetch advice. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ----------------- Start Recording -----------------
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "voice.webm");
        if (query.trim() !== "") formData.append("question", query);
        await fetchAgent(formData);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Mic access error:", err);
      alert("Microphone access is required to use voice features.");
    }
  }, [query, fetchAgent]);

  // ----------------- Stop Recording -----------------
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, []);

  // ----------------- Handle text submit -----------------
  const handleSubmit = async () => {
    if (!query.trim()) return alert("Please enter your question or location");
    const formData = new FormData();
    formData.append("question", query);
    await fetchAgent(formData);
  };

  const COLORS = ["#22c55e", "#e5e7eb"]; // green + gray

  return (
    <main className="min-h-screen bg-green-50 flex flex-col items-center p-6 relative">
      <h1 className="text-3xl font-bold mb-6 text-green-800">🌾 Smart Irrigation Advice</h1>

      {/* Text input */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter location or question"
          className="border rounded px-4 py-2 w-64"
        />
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>

      {/* Voice Agent */}
      <div className="bg-white md:w-[400px] rounded-xl shadow-lg flex flex-col items-center gap-3 px-6 py-4">
        <div className="flex items-center gap-4">
          <Image src="/ag_logo.png" alt="Logo" width={50} height={50} className="rounded-full" />
          <div className="flex flex-col">
            <span className="text-red-600 font-bold text-xl">FARM-GENIE...</span>
            <span className="text-black font-bold text-xl">here</span>
          </div>
        </div>

        {!recording ? (
          <button
            onClick={startRecording}
            disabled={loading}
            className="bg-yellow-500 text-white px-8 py-2 rounded-lg shadow hover:bg-green-600 text-sm"
          >
            🎙 {loading ? "Processing..." : "Start Talking"}
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-500 text-white px-4 py-1 rounded-lg shadow hover:bg-red-600 text-sm"
          >
            ⏹ Stop
          </button>
        )}
      </div>

      {/* Weather + Soil UI */}
      <div className="mt-6 w-full max-w-md space-y-4">
        {weather && (
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <h2 className="text-lg font-bold">🌤️ Weather in {weather.location}</h2>
            <p className="text-gray-700">{weather.condition}</p>
            <p className="text-2xl font-bold text-green-700">{weather.temp_c}°C</p>
          </div>
        )}

        {soil && (
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <h2 className="text-lg font-bold mb-2">💧 Soil Moisture</h2>
            <div className="flex justify-center">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Moisture", value: soil.moisture },
                      { name: "Remaining", value: 100 - soil.moisture },
                    ]}
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                  >
                    <Cell fill={COLORS[0]} />
                    <Cell fill={COLORS[1]} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xl font-bold text-green-700">{soil.moisture}%</p>
          </div>
        )}
      </div>

      {/* Agent Response */}
      {agentText && (
        <div className="mt-6 p-4 bg-white rounded shadow w-full max-w-md text-center">
          <p className="text-green-800 font-medium">{agentText}</p>
        </div>
      )}

      {/* Fixed bottom-right image */}
      <div className="fixed bottom-4 right-4">
        <Image src="/img1.png" alt="Bottom Right Image" width={80} height={80} className="rounded-full shadow-lg" />
      </div>
    </main>
  );
}
