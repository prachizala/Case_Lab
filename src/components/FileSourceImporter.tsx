"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface FileSourceImporterProps {
  onExtracted: (text: string, filename: string) => void;
}

export function FileSourceImporter({ onExtracted }: FileSourceImporterProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    wordCount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Text extraction failed.");
      }

      setUploadedFile({
        name: data.filename,
        wordCount: data.wordCount,
      });

      onExtracted(data.extractedText, data.filename);
    } catch (err: unknown) {
      console.error("Extraction error:", err);
      const msg = err instanceof Error ? err.message : "Failed to extract text from document.";
      setError(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleFileChange}
        className="hidden"
        id="file-source-upload"
      />

      <label
        htmlFor="file-source-upload"
        className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
          isUploading
            ? "border-accent bg-accent/10"
            : "border-border hover:border-accent bg-primary-soft/30"
        }`}
      >
        <div className="flex items-center gap-3">
          {isUploading ? (
            <Loader2 className="w-5 h-5 text-accent animate-spin" />
          ) : (
            <UploadCloud className="w-5 h-5 text-accent" />
          )}
          <span className="text-xs font-semibold text-text">
            {isUploading ? "Extracting Text Server-Side..." : "Upload Document (PDF, DOCX, TXT)"}
          </span>
          <span className="text-[11px] text-muted bg-primary-soft px-2 py-0.5 rounded">
            Auto-fills source notes
          </span>
        </div>
      </label>

      {uploadedFile && (
        <div className="mt-2 flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-success/10 border border-success/30 text-success">
          <div className="flex items-center gap-2 truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
            <span className="font-medium truncate">{uploadedFile.name}</span>
          </div>
          <span className="shrink-0 text-[11px] opacity-80">
            {uploadedFile.wordCount} words extracted
          </span>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-2 text-xs text-danger bg-danger/10 p-2 rounded border border-danger/30">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
