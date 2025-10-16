import Groq from "groq-sdk";

// Initialize Groq client with API key from environment
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful support assistant for a technology company. Your role is to help users create support tickets through natural conversation.

Your conversation flow should be:
1. Greet the user and ask what product they're calling about
2. Ask about the specific issue they're experiencing  
3. Ask about urgency level (low/medium/high)
4. Confirm the ticket details and ask if they want to submit
5. Provide confirmation when submitted

Keep responses conversational, helpful, and concise. Always ask for clarification if needed.`;

export class GroqService {
  static async generateResponse(conversationHistory) {
    try {
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversationHistory
      ];

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.7,
        max_tokens: 150,
        top_p: 1,
        stream: false,
      });

      return completion.choices[0]?.message?.content || "I understand. Can you tell me more?";
    } catch (error) {
      console.error("Error calling Groq API:", error);
      throw new Error("Failed to generate AI response");
    }
  }
}
