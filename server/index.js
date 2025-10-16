import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import voiceRoutes from "./routes/voice.routes.js";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Store active sessions
const activeSessions = new Map();

// WebSocket connection handling
wss.on("connection", (ws, req) => {
  console.log("New WebSocket connection");

  // Extract session ID from URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  const sessionId = url.pathname.split("/").pop();

  if (!sessionId || !activeSessions.has(sessionId)) {
    console.log("Invalid session ID:", sessionId);
    ws.close(1008, "Invalid session");
    return;
  }

  // Store WebSocket connection in session
  const session = activeSessions.get(sessionId);
  session.ws = ws;
  session.connectedAt = new Date();

  console.log(`WebSocket connected for session: ${sessionId}`);

  // Handle incoming messages
  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log("Received message:", message);

      // Handle different message types
      switch (message.type) {
        case "text":
          handleTextMessage(sessionId, message.data);
          break;
        case "metrics":
          handleMetricsMessage(sessionId, message.data);
          break;
        default:
          console.log("Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  // Handle connection close
  ws.on("close", () => {
    console.log(`WebSocket disconnected for session: ${sessionId}`);
    if (activeSessions.has(sessionId)) {
      const session = activeSessions.get(sessionId);
      session.ws = null;
    }
  });

  // Handle errors
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Handle text messages from client
function handleTextMessage(sessionId, textData) {
  const session = activeSessions.get(sessionId);
  if (!session || !session.ws) return;

  console.log(`Processing text for session ${sessionId}:`, textData.text);

  // Generate response based on conversation state
  const response = generateResponse(session, textData.text);

  // Send response back to client
  session.ws.send(
    JSON.stringify({
      type: "response",
      data: {
        text: response.text,
        state: response.state,
        timestamp: new Date().toISOString(),
      },
    })
  );
}

// Handle metrics messages
function handleMetricsMessage(sessionId, metricsData) {
  console.log(`Metrics for session ${sessionId}:`, metricsData);
  // Store metrics for analysis
  const session = activeSessions.get(sessionId);
  if (session) {
    session.metrics = session.metrics || [];
    session.metrics.push({
      ...metricsData,
      timestamp: new Date(),
    });
  }
}

// Generate hardcoded responses based on conversation state
function generateResponse(session, userText) {
  const text = userText.toLowerCase();

  // Update conversation state based on user input
  if (session.state === "greeting" || session.state === "collecting_product") {
    if (text.includes("mobile") || text.includes("app")) {
      session.context.product = "mobile app";
      session.state = "collecting_issue";
      return {
        text: "I understand you're having issues with the mobile app. What specific problem are you experiencing?",
        state: session.state,
      };
    } else if (text.includes("website") || text.includes("web")) {
      session.context.product = "website";
      session.state = "collecting_issue";
      return {
        text: "I see you're having problems with the website. What specific issues are you experiencing?",
        state: session.state,
      };
    } else {
      return {
        text: "I understand. What product or service are you calling about today?",
        state: session.state,
      };
    }
  } else if (session.state === "collecting_issue") {
    session.context.issue = userText;
    session.state = "collecting_urgency";
    return {
      text: "I understand the issue. How urgent is this for you - low, medium, or high priority?",
      state: session.state,
    };
  } else if (session.state === "collecting_urgency") {
    if (text.includes("high") || text.includes("urgent")) {
      session.context.urgency = "high";
    } else if (text.includes("medium")) {
      session.context.urgency = "medium";
    } else {
      session.context.urgency = "low";
    }

    // Generate ticket ID
    session.context.ticketId = `T-${Math.floor(Math.random() * 10000)}`;
    session.state = "confirming";

    return {
      text: `I've created ticket #${session.context.ticketId} for ${session.context.product} with ${session.context.urgency} priority. Should I submit this now?`,
      state: session.state,
    };
  } else if (session.state === "confirming") {
    if (text.includes("yes") || text.includes("submit")) {
      session.state = "complete";
      return {
        text: `Perfect! Your ticket #${session.context.ticketId} has been submitted. Our team will contact you within 2 hours for high priority issues.`,
        state: session.state,
      };
    } else {
      session.state = "complete";
      return {
        text: "No problem. Your ticket has been saved but not submitted. You can contact us again anytime.",
        state: session.state,
      };
    }
  }

  // Default response
  return {
    text: "I understand. Can you provide more details?",
    state: session.state,
  };
}

// Routes
app.use("/api/voice", voiceRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    activeSessions: activeSessions.size,
    timestamp: new Date().toISOString(),
  });
});

// Export for routes
export { activeSessions };

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Voice AI Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
});
