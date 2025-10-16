# Voice AI Assistant - Server

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the server directory:
```bash
cp .env.example .env
```

3. Add your Groq API key to the `.env` file:
```
GROQ_API_KEY=your_actual_groq_api_key_here
```

4. Start the server:
```bash
npm run dev
```

## API Endpoints

- `POST /api/voice/session` - Initialize a voice session
- `WebSocket /ws/voice/:sessionId` - Real-time voice communication

## Security Note

Never commit your `.env` file or API keys to version control!
