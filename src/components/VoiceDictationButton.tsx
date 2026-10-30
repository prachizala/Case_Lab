"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

interface VoiceDictationButtonProps {
  onTranscript: (text: string) => void;
  language?: string;
}

// Minimal type definition for Web Speech API
interface SpeechRecognitionEventLike extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

export function VoiceDictationButton({
  onTranscript,
  language = "en-US",
}: VoiceDictationButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = language === "hi" ? "hi-IN" : language === "gu" ? "gu-IN" : "en-US";

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        const lastResult = event.results[Object.keys(event.results).length - 1];
        if (lastResult && lastResult[0]) {
          const spoken = lastResult[0].transcript;
          onTranscript(spoken);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language, onTranscript]);

  const toggleListening = () => {
    if (!supported || !recognitionRef.current) {
      alert("Voice dictation is supported in modern Chrome, Edge, and Safari browsers.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Speech recognition error:", err);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
        isListening
          ? "bg-danger text-accent-text border-danger animate-pulse shadow-md"
          : "bg-surface border-border text-text hover:border-accent hover:text-accent"
      }`}
      title={isListening ? "Stop voice dictation" : "Dictate source notes via microphone"}
    >
      {isListening ? (
        <>
          <MicOff className="w-3.5 h-3.5 text-accent-text" />
          <span>Listening...</span>
        </>
      ) : (
        <>
          <Mic className="w-3.5 h-3.5 text-accent" />
          <span>Voice Dictate</span>
        </>
      )}
    </button>
  );
}
