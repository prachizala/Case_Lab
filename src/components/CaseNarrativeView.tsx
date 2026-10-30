"use client";

import React from "react";
import { Quote } from "lucide-react";

interface CaseNarrativeViewProps {
  content: string;
  className?: string;
}

export function CaseNarrativeView({ content, className = "" }: CaseNarrativeViewProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let currentList: string[] = [];
  let currentKey = 0;

  const renderInlineFormatting = (text: string) => {
    // Replace **bold** with <strong>
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-semibold text-text">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Replace *italic* with <em>
      const italicParts = part.split(/(\*[^*]+\*)/g);
      return italicParts.map((sub, sIdx) => {
        if (sub.startsWith("*") && sub.endsWith("*")) {
          return (
            <em key={sIdx} className="italic text-text">
              {sub.slice(1, -1)}
            </em>
          );
        }
        return sub;
      });
    });
  };

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push(
        <ul key={`list-${currentKey++}`} className="my-3 space-y-1.5 pl-2 sm:pl-4">
          {currentList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-text">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
              <span className="flex-1 leading-relaxed">{renderInlineFormatting(item)}</span>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    // Heading 3: ### Title
    if (line.startsWith("### ")) {
      flushList();
      blocks.push(
        <div key={`h3-${currentKey++}`} className="pt-4 pb-1 mt-4 first:mt-0 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 bg-accent rounded-full shrink-0" />
            <h3 className="font-serif text-base sm:text-lg font-bold text-text tracking-tight">
              {line.replace(/^###\s+/, "")}
            </h3>
          </div>
        </div>
      );
      continue;
    }

    // Heading 4 or 2
    if (line.startsWith("## ") || line.startsWith("#### ")) {
      flushList();
      blocks.push(
        <h4 key={`h4-${currentKey++}`} className="font-serif text-sm sm:text-base font-bold text-accent pt-3 pb-1">
          {line.replace(/^#{2,4}\s+/, "")}
        </h4>
      );
      continue;
    }

    // Blockquote: > Quote
    if (line.startsWith("> ")) {
      flushList();
      const quoteText = line.replace(/^>\s+/, "");
      blocks.push(
        <div
          key={`quote-${currentKey++}`}
          className="my-3 p-3.5 sm:p-4 rounded-xl bg-primary-soft/40 dark:bg-primary-soft/20 border-l-4 border-accent text-text text-xs sm:text-sm italic leading-relaxed flex items-start gap-3 shadow-2xs"
        >
          <Quote className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div className="flex-1">{renderInlineFormatting(quoteText)}</div>
        </div>
      );
      continue;
    }

    // Bullet List Item: - or *
    if (line.startsWith("- ") || line.startsWith("* ")) {
      currentList.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }

    // Regular paragraph
    flushList();
    blocks.push(
      <p key={`p-${currentKey++}`} className="my-2.5 leading-relaxed text-text">
        {renderInlineFormatting(line)}
      </p>
    );
  }

  flushList();

  return <div className={`space-y-1 ${className}`}>{blocks}</div>;
}
