import { useState, useRef, useEffect } from "react";

type VoiceState = "idle" | "listening" | "processing" | "speaking" | "error";

// TypeScript declaration for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

function VoiceTalk() {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [conversationLog, setConversationLog] = useState<
    Array<{ speaker: "user" | "assistant"; text: string; timestamp: Date }>
  >([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any | null>(null);

  // Browser TTS for greeting message - simplified approach
  const speakGreeting = () => {
    console.log("Attempting to speak greeting...");

    if ("speechSynthesis" in window) {
      const text =
        "Hi, I'm your support assistant. What product are you calling about today?";

      // Simple, direct approach without retry
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.onstart = () => {
        console.log("Speech started successfully");
        setVoiceState("speaking");
        setError(null);
        // Add assistant message to conversation log
        setConversationLog((prev) => [
          ...prev,
          {
            speaker: "assistant",
            text: "Hi, I'm your support assistant. What product are you calling about today?",
            timestamp: new Date(),
          },
        ]);
      };

      utterance.onend = () => {
        console.log("Speech ended");
        setVoiceState("idle");
      };

      utterance.onerror = (event) => {
        console.error("Speech error:", event.error);
        console.log("Trying alternative method...");

        // Fallback: Try speaking immediately without any settings
        speechSynthesis.cancel();
        const simpleUtterance = new SpeechSynthesisUtterance(text);
        simpleUtterance.onstart = () => {
          setVoiceState("speaking");
          setError(null);
        };
        simpleUtterance.onend = () => setVoiceState("idle");
        simpleUtterance.onerror = () => {
          setVoiceState("idle");
          setError("Speech synthesis failed. You can still use voice input.");
          console.error("All speech methods failed");
        };

        // Try immediately
        setTimeout(() => speechSynthesis.speak(simpleUtterance), 50);
      };

      console.log("Starting speech synthesis...");
      setVoiceState("speaking");
      speechSynthesis.speak(utterance);
    } else {
      console.error("Speech synthesis not supported");
      setError("Speech synthesis not supported in this browser");
      setVoiceState("idle");
    }
  };

  // Generate assistant response based on user input
  const generateAssistantResponse = (userInput: string) => {
    const input = userInput.toLowerCase();

    if (input.includes("mobile app") || input.includes("app")) {
      return "I understand you're having issues with the mobile app. Can you tell me more about what's happening?";
    } else if (input.includes("website") || input.includes("web")) {
      return "I see you're having problems with the website. What specific issues are you experiencing?";
    } else if (input.includes("login") || input.includes("password")) {
      return "It sounds like you're having trouble logging in. Are you getting any error messages?";
    } else if (input.includes("payment") || input.includes("billing")) {
      return "I can help with payment and billing issues. What exactly is the problem?";
    } else {
      return "I understand. Can you provide more details about the issue you're experiencing?";
    }
  };

  // Start speech recognition
  const startRecording = () => {
    try {
      setError(null);
      setVoiceState("listening");

      // Check if Speech Recognition is available
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError("Speech recognition not supported in this browser");
        setVoiceState("error");
        return;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        console.log("Speech recognition started");
        setVoiceState("listening");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("User said:", transcript);

        // Add user message to conversation log
        setConversationLog((prev) => [
          ...prev,
          {
            speaker: "user",
            text: transcript,
            timestamp: new Date(),
          },
        ]);

        setVoiceState("processing");

        // Generate and speak assistant response
        setTimeout(() => {
          const assistantResponse = generateAssistantResponse(transcript);

          // Add assistant response to conversation log
          setConversationLog((prev) => [
            ...prev,
            {
              speaker: "assistant",
              text: assistantResponse,
              timestamp: new Date(),
            },
          ]);

          // Speak the response
          const responseUtterance = new SpeechSynthesisUtterance(
            assistantResponse
          );
          responseUtterance.onstart = () => setVoiceState("speaking");
          responseUtterance.onend = () => setVoiceState("idle");
          speechSynthesis.speak(responseUtterance);
        }, 1000);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setError(`Speech recognition error: ${event.error}`);
        setVoiceState("error");
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        if (voiceState === "listening") {
          setVoiceState("idle");
        }
      };

      recognition.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting speech recognition:", err);
      setError("Speech recognition failed. Please try again.");
      setVoiceState("error");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle push-to-talk button
  const handleVoiceToggle = () => {
    if (voiceState === "idle") {
      startRecording();
    } else if (voiceState === "listening") {
      stopRecording();
    }
  };

  // Keyboard support (only when conversation started)
  useEffect(() => {
    if (!conversationStarted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && voiceState === "idle") {
        event.preventDefault();
        startRecording();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space" && voiceState === "listening") {
        event.preventDefault();
        stopRecording();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [voiceState, conversationStarted]);

  // Load voices on component mount (but don't auto-speak due to browser restrictions)
  useEffect(() => {
    // Check if speech synthesis is available
    if ("speechSynthesis" in window) {
      console.log("Speech synthesis available, loading voices...");
      console.log("Browser:", navigator.userAgent);
      console.log("Platform:", navigator.platform);

      // Load voices first
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        console.log("Available voices:", voices.length);
        if (voices.length > 0) {
          voices.forEach((voice) => {
            console.log(
              `- ${voice.name} (${voice.lang}) - ${
                voice.localService ? "Local" : "Remote"
              }`
            );
          });
        } else {
          console.warn("No voices available yet, they may still be loading...");
        }
      };

      // Load voices immediately and on voice change
      loadVoices();

      // Some browsers need time to load voices
      setTimeout(loadVoices, 100);
      setTimeout(loadVoices, 500);

      speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        speechSynthesis.onvoiceschanged = null;
      };
    } else {
      console.error("Speech synthesis not supported in this browser");
      setError("Speech synthesis not supported in this browser");
      setVoiceState("error");
    }
  }, []);

  const getButtonText = () => {
    switch (voiceState) {
      case "idle":
        return "Push to Talk";
      case "listening":
        return "Release to Stop";
      case "processing":
        return "Processing...";
      case "speaking":
        return "Speaking...";
      case "error":
        return "Try Again";
      default:
        return "Push to Talk";
    }
  };

  const getButtonClass = () => {
    const baseClass =
      "w-64 h-64 rounded-full text-white font-bold text-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50";

    switch (voiceState) {
      case "idle":
        return `${baseClass} bg-blue-500 hover:bg-blue-600 focus:ring-blue-300`;
      case "listening":
        return `${baseClass} bg-red-500 hover:bg-red-600 focus:ring-red-300 animate-pulse`;
      case "processing":
        return `${baseClass} bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300 animate-spin`;
      case "speaking":
        return `${baseClass} bg-green-500 hover:bg-green-600 focus:ring-green-300`;
      case "error":
        return `${baseClass} bg-red-600 hover:bg-red-700 focus:ring-red-300`;
      default:
        return `${baseClass} bg-blue-500 hover:bg-blue-600 focus:ring-blue-300`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Voice AI Assistant
        </h1>

        {!conversationStarted ? (
          <div className="mb-8">
            <button
              onClick={() => {
                setConversationStarted(true);
                speakGreeting();
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xl px-12 py-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              🎤 Start Voice Chat
            </button>
            <p className="text-gray-600 mt-4 text-sm">
              Click to begin your conversation with the support assistant
            </p>
          </div>
        ) : (
          <div className="mb-8">
            <button
              onClick={handleVoiceToggle}
              disabled={
                voiceState === "processing" || voiceState === "speaking"
              }
              className={getButtonClass()}
              aria-label={getButtonText()}
            >
              {voiceState === "processing" ? (
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                getButtonText()
              )}
            </button>
          </div>
        )}

        {/* Conversation Log */}
        {conversationLog.length > 0 && (
          <div className="mb-6 max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Conversation
            </h3>
            <div className="space-y-3">
              {conversationLog.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.speaker === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.speaker === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-800 border"
                    }`}
                  >
                    <div className="font-semibold text-xs mb-1">
                      {message.speaker === "user" ? "You" : "Assistant"}
                    </div>
                    <div>{message.text}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Hold{" "}
            <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Space</kbd>{" "}
            to talk
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="text-sm text-gray-500">
          <p>
            State:{" "}
            <span className="font-semibold capitalize">{voiceState}</span>
          </p>
          <p className="text-xs mt-1">
            Speech Synthesis:{" "}
            {"speechSynthesis" in window ? "✅ Available" : "❌ Not Available"}
          </p>
          <p className="text-xs">
            Microphone:{" "}
            {navigator.mediaDevices ? "✅ Available" : "❌ Not Available"}
          </p>
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={speakGreeting}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Replay Greeting
            </button>

            <button
              onClick={() => {
                // Simple fallback - try with very basic settings
                if ("speechSynthesis" in window) {
                  speechSynthesis.cancel();
                  const utterance = new SpeechSynthesisUtterance(
                    "Hi, I'm your support assistant. What product are you calling about today?"
                  );
                  utterance.onstart = () => setVoiceState("speaking");
                  utterance.onend = () => setVoiceState("idle");
                  utterance.onerror = () => setVoiceState("error");
                  speechSynthesis.speak(utterance);
                }
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Simple TTS
            </button>
          </div>

          {voiceState === "error" && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded text-sm">
              <p className="font-semibold">
                Fallback: Read the greeting below:
              </p>
              <p className="mt-1 italic">
                "Hi, I'm your support assistant. What product are you calling
                about today?"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VoiceTalk;
