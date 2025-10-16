import express from "express";
import { v4 as uuidv4 } from "uuid";
import { activeSessions } from "../index.js";

const router = express.Router();

// POST /api/voice/session - Initialize a voice session
router.post("/session", (req, res) => {
  try {
    const sessionId = uuidv4();
    const wsUrl = `ws://localhost:3001/ws/voice/${sessionId}`;

    // Create new session
    const session = {
      sessionId,
      state: "greeting",
      context: {
        product: null,
        issue: null,
        urgency: null,
        ticketId: null,
      },
      metrics: [],
      createdAt: new Date(),
      ws: null,
      connectedAt: null,
    };

    // Store session
    activeSessions.set(sessionId, session);

    console.log(`Created new session: ${sessionId}`);

    res.json({
      sessionId,
      wsUrl,
      token: `token_${sessionId}`, // Simple token for now
      status: "created",
    });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// POST /api/voice/metrics - Log latency measurements
router.post("/metrics", (req, res) => {
  try {
    const {
      sessionId,
      speechEndTime,
      responseStartTime,
      latencyMs,
      processingSteps,
    } = req.body;

    if (!sessionId || !activeSessions.has(sessionId)) {
      return res.status(404).json({ error: "Session not found" });
    }

    const session = activeSessions.get(sessionId);
    const metricsEntry = {
      speechEndTime,
      responseStartTime,
      latencyMs,
      processingSteps,
      timestamp: new Date(),
    };

    session.metrics.push(metricsEntry);

    console.log(`Metrics logged for session ${sessionId}:`, metricsEntry);

    res.json({ status: "logged", metrics: metricsEntry });
  } catch (error) {
    console.error("Error logging metrics:", error);
    res.status(500).json({ error: "Failed to log metrics" });
  }
});

// GET /api/voice/session/:sessionId - Get session info
router.get("/session/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!activeSessions.has(sessionId)) {
      return res.status(404).json({ error: "Session not found" });
    }

    const session = activeSessions.get(sessionId);

    res.json({
      sessionId: session.sessionId,
      state: session.state,
      context: session.context,
      metrics: session.metrics,
      createdAt: session.createdAt,
      connectedAt: session.connectedAt,
      isConnected: !!session.ws,
    });
  } catch (error) {
    console.error("Error getting session:", error);
    res.status(500).json({ error: "Failed to get session" });
  }
});

// DELETE /api/voice/session/:sessionId - End session
router.delete("/session/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!activeSessions.has(sessionId)) {
      return res.status(404).json({ error: "Session not found" });
    }

    const session = activeSessions.get(sessionId);

    // Close WebSocket if connected
    if (session.ws) {
      session.ws.close();
    }

    // Remove session
    activeSessions.delete(sessionId);

    console.log(`Session ended: ${sessionId}`);

    res.json({ status: "ended", sessionId });
  } catch (error) {
    console.error("Error ending session:", error);
    res.status(500).json({ error: "Failed to end session" });
  }
});

export default router;
