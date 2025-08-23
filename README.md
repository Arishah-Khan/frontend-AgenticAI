# 🌾 Smart Agri – Farm-Genie

An AI-powered Smart Agriculture Assistant built with FastAPI (backend) and Next.js (frontend).
Farmers can interact with Farm-Genie using voice or text, and get personalized irrigation advice powered by real-time weather data + soil analysis.

# 🚀 Features

✅ Conversational AI (Farm-Genie) – Talk to your AI farm assistant using voice or text.
✅ Greeting Assistant – Responds to greetings and welcomes farmers.
✅ Irrigation Assistant – Redirects users to the Smart Irrigation Agent.
✅ Smart Irrigation Advice –

Fetches live weather data 🌤 (via WeatherAPI).

Uses soil dataset (dummy_data.json) 🌱.

Decides when & how much to irrigate crops 💧.

Recommends best irrigation time (morning/evening).


# ✅ Voice Support –

🎤 Speech-to-Text: Record your query.

🔊 Text-to-Speech: AI replies with voice.
# ✅ Rich Frontend UI –

Next.js + TailwindCSS for modern design.

Weather & soil moisture visualization (Recharts PieChart).

Smooth UI animations + responsive layout.

# 🏗 Project Structure
smart-agri/
│
├── backend/                 # FastAPI backend
│   ├── main.py              # Agents & API
│   ├── dummy_data.json      # Soil dataset
│   ├── requirements.txt     # Backend dependencies
│   └── .env                 # API keys (not committed)
│
├── frontend/                # Next.js frontend
│   ├── app/
│   │   ├── page.tsx         # Home page
│   │   └── irrigation_advice/page.tsx   # Irrigation Advice page
│   ├── public/              # Static assets (logos, bg, images)
│   │   ├── ag_bg.jpg
│   │   ├── ag_logo.png
│   │   └── img1.png
│   └── package.json         # Frontend dependencies
│
└── README.md                # Documentation

# ⚙ Installation
🔹 1. Backend (FastAPI)
cd backend
uv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

pip install -r requirements.txt


Create a .env file:

GEMINI_API_KEY=your_gemini_api_key
WEATHER_API_KEY=your_weatherapi_key
PORT=8000


Run backend server:

uvicorn main:app --reload



🔹 2. Frontend (Next.js)
cd frontend
npm install
npm run dev



# 🔗 API Endpoints
1️⃣ Ask Agent

POST /agent

Input: question (text) OR audio (voice file).

Output: AI response, redirect flag, irrigation advice, and audio reply.

Sample Response:

{
  "message": "🌤 Weather in Lahore is 32°C, soil moisture 22%. You should irrigate today with heavy water. Best time is evening.",
  "redirect": false,
  "redirect_url": null,
  "audio_url": "/agent-audio?file=xyz.mp3",
  "weather": { ... },
  "soil": { ... }
}

2️⃣ Get Agent Audio

GET /agent-audio?file=xyz.mp3

Streams AI-generated reply audio 🎧

🖥 Frontend Pages
🏠 Home Page (/)

Background with welcome animation.

Voice assistant interface.

Start/Stop recording buttons.

AI responds with audio + optional redirect to /irrigation_advice.

💧 Irrigation Advice Page (/irrigation_advice)

Text input OR voice query.

Displays:

🌤 Weather info (location, condition, temperature).

💧 Soil moisture chart (PieChart).

📢 Farm-Genie’s irrigation advice.

AI auto-speaks advice.

# 📦 Requirements
Backend

FastAPI

Agents Framework

SpeechRecognition

gTTS

httpx

ffmpeg (for audio conversion)

Install ffmpeg:

# Ubuntu
sudo apt install ffmpeg
# macOS
brew install ffmpeg
# Windows
choco install ffmpeg

Frontend

Next.js 13+ (App Router)

TailwindCSS

Recharts (for soil moisture PieChart)

# 🌱 Example Interaction

User (voice):
🎤 “Should I irrigate my crops in Karachi today?”

Farm-Genie (reply):

🌤 Weather in Karachi: 29°C, soil moisture 25%.  
💧 You should irrigate today with moderate water. Best time is evening.


And the response is also spoken aloud 🎧

# 👩‍💻 Author

Developed by Amna Aftab Kifayat and Arishah ✨