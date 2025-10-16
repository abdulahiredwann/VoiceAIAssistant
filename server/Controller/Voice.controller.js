// Voice controller with hardcoded responses for testing
export class VoiceController {
  // Generate response based on conversation state and user input
  static generateResponse(session, userText) {
    const text = userText.toLowerCase();

    console.log(
      `Generating response for state: ${session.state}, input: "${userText}"`
    );

    // Update conversation state based on user input
    if (
      session.state === "greeting" ||
      session.state === "collecting_product"
    ) {
      if (text.includes("mobile") || text.includes("app")) {
        session.context.product = "mobile app";
        session.state = "collecting_issue";
        return {
          text: "I understand you're having issues with the mobile app. What specific problem are you experiencing?",
          state: session.state,
          context: session.context,
        };
      } else if (text.includes("website") || text.includes("web")) {
        session.context.product = "website";
        session.state = "collecting_issue";
        return {
          text: "I see you're having problems with the website. What specific issues are you experiencing?",
          state: session.state,
          context: session.context,
        };
      } else {
        return {
          text: "I understand. What product or service are you calling about today?",
          state: session.state,
          context: session.context,
        };
      }
    } else if (session.state === "collecting_issue") {
      session.context.issue = userText;
      session.state = "collecting_urgency";
      return {
        text: "I understand the issue. How urgent is this for you - low, medium, or high priority?",
        state: session.state,
        context: session.context,
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
        context: session.context,
      };
    } else if (session.state === "confirming") {
      if (text.includes("yes") || text.includes("submit")) {
        session.state = "complete";
        return {
          text: `Perfect! Your ticket #${session.context.ticketId} has been submitted. Our team will contact you within 2 hours for high priority issues.`,
          state: session.state,
          context: session.context,
        };
      } else {
        session.state = "complete";
        return {
          text: "No problem. Your ticket has been saved but not submitted. You can contact us again anytime.",
          state: session.state,
          context: session.context,
        };
      }
    }

    // Default response for unknown states
    return {
      text: "I understand. Can you provide more details?",
      state: session.state,
      context: session.context,
    };
  }

  // Process incoming text message
  static processTextMessage(session, textData) {
    const startTime = Date.now();

    // Generate response
    const response = this.generateResponse(session, textData.text);

    // Calculate processing time
    const processingTime = Date.now() - startTime;

    return {
      ...response,
      processingTime,
      timestamp: new Date().toISOString(),
    };
  }

  // Handle metrics logging
  static logMetrics(session, metricsData) {
    const metricsEntry = {
      ...metricsData,
      timestamp: new Date(),
      sessionId: session.sessionId,
    };

    session.metrics = session.metrics || [];
    session.metrics.push(metricsEntry);

    console.log(
      `Metrics logged for session ${session.sessionId}:`,
      metricsEntry
    );

    return metricsEntry;
  }
}
