# Voice AI Assistant - Real-Time Voice Support System

A real-time voice AI assistant that helps users create support tickets through natural voice conversations. Built with React, Node.js, WebSocket, and Web Speech API.

## 🎯 Features

- **Real-time Voice Interaction**: Speak naturally to create support tickets
- **Low Latency**: Text-based WebSocket communication for fast responses
- **Conversation Flow**: Guided conversation to collect product, issue, and urgency
- **Live Transcription**: See what you say in real-time
- **Browser TTS**: Natural voice responses using browser speech synthesis
- **Session Management**: Persistent sessions with state tracking
- **Metrics Logging**: Track voice-to-voice latency and performance

## 🏗️ Architecture

### Frontend (React + TypeScript)

- **Speech Recognition**: Web Speech API for real-time voice-to-text
- **Text-to-Speech**: Browser SpeechSynthesis API for voice responses
- **WebSocket Client**: Real-time bidirectional communication
- **State Management**: React hooks for conversation state

### Backend (Node.js + Express + WebSocket)

- **Express Server**: REST API endpoints for session management
- **WebSocket Server**: Real-time text communication
- **Conversation State Machine**: Manages ticket creation flow
- **Hardcoded Responses**: Smart responses based on conversation context (ready for LLM integration)

### Communication Flow

```
User Speech → Web Speech API → Text → WebSocket → Server
Server → Process → Generate Response → WebSocket → Text → Browser TTS → Voice
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Modern browser (Chrome recommended for best speech recognition)

### Installation

1. **Clone the repository**

```bash
cd VoiceAIAssistant
```

2. **Install Backend Dependencies**

```bash
cd server
npm install
```

3. **Install Frontend Dependencies**

```bash
cd ../client
npm install
```

### Running the Application

1. **Start Backend Server** (Terminal 1)

```bash
cd server
npm run dev
```

Server will run on `http://localhost:3001`

2. **Start Frontend** (Terminal 2)

```bash
cd client
npm run dev
```

Frontend will run on `http://localhost:5173`

3. **Open Browser**

- Navigate to `http://localhost:5173`
- Click "Start Voice Chat"
- Allow microphone permissions
- Start speaking!

## 📋 Conversation Flow

The assistant guides you through creating a support ticket:

1. **Greeting**: "Hi, I'm your support assistant. What product are you calling about today?"
2. **Product Collection**: User mentions "mobile app" or "website"
3. **Issue Collection**: "What specific problem are you experiencing?"
4. **Urgency Collection**: "How urgent is this? (low/medium/high)"
5. **Confirmation**: "I've created ticket #T-1234. Should I submit this now?"
6. **Completion**: "Perfect! Your ticket has been submitted."

## 🔧 API Endpoints

### REST Endpoints

- `POST /api/voice/session` - Create new voice session

  - Response: `{ sessionId, wsUrl, token, status }`

- `GET /api/voice/session/:sessionId` - Get session details

  - Response: Session state, context, metrics

- `POST /api/voice/metrics` - Log performance metrics

  - Body: `{ sessionId, latencyMs, processingSteps }`

- `DELETE /api/voice/session/:sessionId` - End session

- `GET /health` - Health check

### WebSocket Messages

**Client → Server:**

```json
{
  "type": "text",
  "data": {
    "text": "user speech transcript",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Server → Client:**

```json
{
  "type": "response",
  "data": {
    "text": "assistant response",
    "state": "collecting_issue",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## 📊 Session State Machine

```
greeting → collecting_product → collecting_issue → collecting_urgency → confirming → complete
```

Each state tracks context:

- `product`: mobile app, website, etc.
- `issue`: User's problem description
- `urgency`: low, medium, high
- `ticketId`: Generated ticket number

## 🎨 Frontend Components

### VoiceTalk Component

- **Push-to-Talk Button**: Large, color-coded button for voice interaction
- **Conversation Log**: Chat-style display of conversation history
- **Status Indicators**: Voice state, connection status, session ID
- **Error Handling**: User-friendly error messages

### Voice States

- `idle` - Blue button, ready to listen
- `listening` - Red pulsing, recording user speech
- `processing` - Yellow spinning, sending to server
- `speaking` - Green, playing assistant response
- `error` - Red, showing error message

## 🔒 Security Considerations

- WebSocket connections validated with session IDs
- CORS enabled for local development
- No sensitive data in logs
- Session-based isolation

## 🚧 Next Steps (LLM Integration)

The current implementation uses hardcoded responses. To integrate with Groq or other LLMs:

1. Add Groq API key to environment variables
2. Update `Voice.controller.js` to call Groq API
3. Replace hardcoded responses with LLM-generated responses
4. Add conversation history to LLM prompts
5. Implement streaming responses for lower latency

## 📈 Performance Metrics

The system logs:

- Voice-to-voice latency
- Processing time per step
- Session duration
- Turn count per conversation

## 🐛 Troubleshooting

### Speech Recognition Not Working

- Use Chrome browser (best support)
- Allow microphone permissions
- Check if on HTTPS (required for speech recognition)

### TTS Not Working

- Check browser console for errors
- Try "Replay Greeting" button
- Ensure audio is not muted

### WebSocket Connection Failed

- Ensure backend server is running on port 3001
- Check console for connection errors
- Verify CORS settings

## 🛠️ Tech Stack

**Frontend:**

- React 19
- TypeScript
- Tailwind CSS
- Web Speech API
- WebSocket API

**Backend:**

- Node.js
- Express
- ws (WebSocket library)
- UUID

## 📝 License

MIT

## 👥 Contributing

This is a demo project for voice AI integration. Feel free to fork and modify!
