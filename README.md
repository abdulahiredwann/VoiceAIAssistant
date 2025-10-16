# Voice AI Assistant

A real-time voice AI assistant for support ticket creation using **Web Speech API + Groq + Browser TTS**.

## 🎯 Features

- **Push-to-talk** voice interface
- **Real-time conversation** with AI
- **Low latency** voice-to-voice interaction
- **No expensive APIs** - uses free browser technologies
- **WebSocket** real-time communication

## 🏗️ Architecture

### Frontend (React + TypeScript)

- **Web Speech API** - Browser native speech-to-text
- **Browser TTS** - Built-in text-to-speech
- **WebSocket** - Real-time communication
- **Tailwind CSS** - Modern UI

### Backend (Node.js + Express)

- **WebSocket server** - Real-time audio streaming
- **Groq API** - Free LLM integration
- **Session management** - Track conversations
- **REST API** - Session initialization

## 📁 Project Structure

```
VoiceAIAssistant/
├── client/                 # React frontend
│   ├── src/
│   │   ├── VoiceTalk/     # Main voice component
│   │   └── App.tsx        # Root component
│   └── package.json
├── server/                 # Node.js backend
│   ├── services/
│   │   └── groq.service.js # Groq LLM integration
│   ├── Controller/
│   │   └── Voice.controller.js # Voice logic
│   ├── routes/
│   │   └── voice.routes.js # API routes
│   ├── index.js           # Main server
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### 1. Setup Backend

```bash
cd server
npm install
```

### 2. Add Groq API Key

Create `server/.env`:

```
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Start Backend

```bash
cd server
npm run dev
```

### 4. Setup Frontend

```bash
cd client
npm install
```

### 5. Start Frontend

```bash
cd client
npm run dev
```

### 6. Open Browser

Go to `http://localhost:3000`

## 💰 Cost-Free Technologies

- **Web Speech API** - Free browser speech recognition
- **Browser TTS** - Free text-to-speech
- **Groq API** - Free LLM with generous limits
- **WebSocket** - Free real-time communication

## 🎤 How It Works

1. **Start Session** - Click "Start Voice Chat"
2. **Push to Talk** - Hold Space or click button
3. **Speak** - Your voice is transcribed
4. **AI Response** - Groq generates response
5. **Voice Output** - Browser speaks the response

## 🔧 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, WebSocket
- **AI**: Groq (free LLM)
- **Voice**: Web Speech API + Browser TTS
- **Real-time**: WebSocket communication

## 📝 API Endpoints

- `POST /api/voice/session` - Create voice session
- `WebSocket /ws/voice/:sessionId` - Real-time communication

## 🎯 Voice Flow

1. User clicks "Start Voice Chat"
2. Frontend creates session with backend
3. WebSocket connection established
4. User speaks → Web Speech API transcribes
5. Text sent to backend via WebSocket
6. Groq generates AI response
7. Backend sends response to frontend
8. Browser TTS speaks the response

## 🚀 Commands

```bash
# Start everything
npm run dev

# Or start separately
cd server && npm run dev
cd client && npm run dev
```

## 📱 Browser Support

- ✅ Chrome/Edge (full support)
- ✅ Firefox (full support)
- ✅ Safari (full support)

## 🔑 Environment Variables

```bash
# server/.env
GROQ_API_KEY=your_groq_api_key_here
```

## 🎨 Features

- **Real-time voice interaction**
- **Session-based conversations**
- **Low latency communication**
- **Free to use** (no expensive APIs)
- **Modern UI** with Tailwind CSS
- **WebSocket** real-time streaming
