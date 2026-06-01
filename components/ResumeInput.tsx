"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function ResumeInput({ value, onChange, error }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [parseWarning, setParseWarning] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = value.length;

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setUploadError(null);
    setParseWarning(null);

    const allowedExtensions = [".txt", ".pdf", ".docx"];
    const fileExtension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      setUploadError(`Unsupported file type "${fileExtension}". Please upload a .txt, .pdf, or .docx file.`);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size exceeds the 5MB limit. Please upload a smaller file.");
      return;
    }

    // Initialize progress bar indicator (EC-P5-24)
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Animate progress smoothly up to 90% while waiting for network response
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null) return null;
          if (prev >= 90) {
            clearInterval(progressTimer);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const res = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressTimer);
      setUploadProgress(100);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to extract text from file.");
      }

      // Hide progress bar and set extracted text (EC-P5-20)
      setUploadProgress(null);
      onChange(data.text);

      // Show layout warning per EC-P5-21 for binary formats
      if (fileExtension !== ".txt") {
        setParseWarning(
          "Automatic text extraction from binary PDF/DOCX layouts can result in garbled text ordering or missing sections. We have extracted the text below. Please review and verify its accuracy."
        );
      }
    } catch (err) {
      setUploadProgress(null);
      setUploadError(err instanceof Error ? err.message : "Failed to upload and parse file.");
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      void processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="resume" className="text-sm font-semibold text-slate-800">
            Resume Source
          </Label>
          <span className="text-xs text-muted-foreground">{charCount} characters</span>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200",
            dragActive
              ? "border-teal-500 bg-teal-50/30 scale-[0.99]"
              : "border-slate-300 hover:border-slate-400 bg-slate-50/30 hover:bg-slate-50/50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".txt,.pdf,.docx"
            className="hidden"
          />

          {uploadProgress !== null ? (
            <div className="w-full max-w-xs space-y-2.5 py-2">
              <div className="flex items-center justify-between text-xs font-semibold text-teal-700">
                <span>Extracting resume sections...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-teal-500 transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Drag & drop resume file here, or <span className="text-teal-600 hover:underline">browse</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Supports PDF, DOCX, or TXT up to 5MB</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="rounded-lg border border-red-200 bg-red-50/50 p-2.5 text-xs text-red-700 font-medium flex items-center gap-2 animate-fade-in">
          <svg className="h-4 w-4 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {uploadError}
        </div>
      )}

      {parseWarning && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-800 leading-normal font-medium flex items-start gap-2 animate-fade-in animate-pulse">
          <svg className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <strong>Text Extraction Warning:</strong> {parseWarning}
          </div>
        </div>
      )}

      <div className="space-y-1">
        <Textarea
          id="resume"
          placeholder="Paste your resume text here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[260px] font-mono text-xs sm:text-sm border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl"
          aria-invalid={!!error || !!uploadError}
          aria-describedby={error ? "resume-error" : undefined}
        />
        {error && (
          <p id="resume-error" className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
