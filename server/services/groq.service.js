import Groq from "groq-sdk";

// Debug environment variable
console.log(
  "GROQ_API_KEY from env:",
  process.env.GROQ_API_KEY ? "SET" : "NOT SET"
);

// Initialize Groq client with API key (with fallback)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// System prompt for the support assistant
const SYSTEM_PROMPT = `You are a helpful support assistant for a technology company. Your role is to help users create support tickets through natural conversation.

Conversation flow:
1. Greet and ask what product they need help with
2. Ask about the specific issue
3. Ask about urgency (low, medium, or high)
4. Summarize and create a ticket with format "T-####" (use random numbers)
5. Confirm if they want to submit
6. Complete and tell them response time (2 hours for high, 24 hours for medium, 48 hours for low)

Keep responses:
- Natural and conversational (like the examples below)
- Short and concise (1-2 sentences max)
- Empathetic and professional
- Guide the conversation but don't be robotic

Example conversation:
User: "Um, the mobile app"
You: "Got it, the mobile app. What issue are you experiencing?"

User: "It crashes when I try to upload photos"
You: "I understand - the app crashes during photo uploads. How urgent is this for you - low, medium, or high?"

User: "It's pretty urgent, high"
You: "I've created ticket #T-3847 for the mobile app crash during photo uploads with high priority. Should I submit this now?"

User: "Yes please"
You: "Perfect! Your ticket has been submitted. Our team will contact you within 2 hours for high priority issues."`;

export class GroqService {
  /**
   * Generate AI response based on conversation history
   * @param {Array} conversationHistory - Array of messages with role and content
   * @returns {Promise<string>} - AI generated response
   */
  static async generateResponse(conversationHistory) {
    try {
      console.log(
        "Calling Groq API with conversation history:",
        conversationHistory.length,
        "messages"
      );

      // Build messages array for Groq - just system prompt + conversation
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversationHistory,
      ];

      console.log("Sending to Groq:", JSON.stringify(messages, null, 2));

      // Call Groq API
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile", // Updated to current model
        messages: messages,
        temperature: 0.7,
        max_tokens: 150,
        top_p: 1,
        stream: false,
      });

      const response =
        completion.choices[0]?.message?.content ||
        "I understand. Can you tell me more?";

      console.log("Groq response:", response);

      return response;
    } catch (error) {
      console.error("Error calling Groq API:", error);
      throw new Error("Failed to generate AI response");
    }
  }
}
