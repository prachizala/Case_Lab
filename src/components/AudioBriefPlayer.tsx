"use client";

import { useEffect, useState, useRef } from "react";
import { AudioBrief } from "@/lib/types";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Headphones,
  ChevronDown,
  ChevronUp,
  FastForward,
} from "lucide-react";

export function AudioBriefPlayer({ caseId }: { caseId: string }) {
  const [brief, setBrief] = useState<AudioBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    fetch(`/api/cases/${caseId}/audio`)
      .then((res) => res.json())
      .then((data) => {
        if (data.audioBrief) setBrief(data.audioBrief);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [caseId]);

  // Speech synthesis reference
  const speakCurrentLine = (lineIdx: number) => {
    if (!brief || !brief.dialogue[lineIdx]) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    if (isMuted) return;

    const utterance = new SpeechSynthesisUtterance(brief.dialogue[lineIdx].text);
    utterance.rate = playbackSpeed;

    utterance.onend = () => {
      if (lineIdx < brief.dialogue.length - 1) {
        setCurrentLineIdx(lineIdx + 1);
        speakCurrentLine(lineIdx + 1);
      } else {
        setIsPlaying(false);
        setCurrentLineIdx(0);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakCurrentLine(currentLineIdx);
    }
  };

  const handleReset = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentLineIdx(0);
  };

  const handleSpeedToggle = () => {
    const nextSpeed = playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : 1;
    setPlaybackSpeed(nextSpeed);
    if (isPlaying) {
      speakCurrentLine(currentLineIdx);
    }
  };

  if (loading || !brief) return null;

  return (
    <div className="p-4 rounded-2xl bg-primary border border-border text-white shadow-lg space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Branding & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 text-on-primary flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-primary">
                Executive Audio Brief • CasePod
              </span>
              <span className="text-white/40">•</span>
              <span className="text-[10px] text-white/70 font-mono">
                {Math.floor(brief.duration_seconds / 60)}:{(brief.duration_seconds % 60).toString().padStart(2, "0")} Debrief
              </span>
            </div>
            <h4 className="text-xs md:text-sm font-semibold text-white line-clamp-1">
              {brief.title}
            </h4>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* Speed Toggle */}
          <button
            onClick={handleSpeedToggle}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-semibold border border-white/20"
            title="Toggle playback speed"
          >
            {playbackSpeed}x
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20"
            title="Reset to beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={handleTogglePlay}
            className="px-4 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Listen (2m)
              </>
            )}
          </button>

          {/* Transcript toggle */}
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="p-1.5 rounded-lg text-white/70 hover:text-white"
            title="Toggle transcript"
          >
            {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Active Speaker Line Highlight */}
      {isPlaying && brief.dialogue[currentLineIdx] && (
        <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs flex items-start gap-2 animate-fadeIn">
          <span className="font-bold text-on-primary shrink-0">
            {brief.dialogue[currentLineIdx].speaker}:
          </span>
          <p className="text-white italic line-clamp-2">
            "{brief.dialogue[currentLineIdx].text}"
          </p>
        </div>
      )}

      {/* Transcript Accordion */}
      {showTranscript && (
        <div className="pt-3 border-t border-white/20 space-y-2.5 text-xs max-h-48 overflow-y-auto pr-1">
          <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
            Synchronized Audio Script:
          </div>
          {brief.dialogue.map((item, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg transition-all ${
                currentLineIdx === idx && isPlaying
                  ? "bg-white/20 border border-white/30 text-white font-medium"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-on-primary">{item.speaker}</span>
                <span className="text-[10px] text-white/50 font-mono">[{item.timestamp}]</span>
              </div>
              <p className="text-white/90">{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
