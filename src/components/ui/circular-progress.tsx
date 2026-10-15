"use client";

import React from "react";
import { Check } from "lucide-react";

interface CircularProgressProps {
  progress: number; // 0 to 100
  size?: number;    // default 24
  strokeWidth?: number; // default 2.5
  className?: string;
  onClick?: () => void;
  title?: string;
}

export function CircularProgress({
  progress,
  size = 24,
  strokeWidth = 2.5,
  className = "",
  onClick,
  title,
}: CircularProgressProps) {
  const isComplete = progress >= 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  if (isComplete) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title || "100% Selesai — Klik untuk opsi"}
        className={`inline-flex items-center justify-center rounded-full bg-emerald-600 text-white transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-500 shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <Check className="w-3.5 h-3.5 stroke-[3]" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={title || `${progress}% Selesai`}
      className={`relative inline-flex items-center justify-center rounded-full bg-transparent transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border-strong)"
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-40"
        />
        {/* Animated Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--brand)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      {/* Optional tiny inner dot for non-zero progress */}
      {progress > 0 && progress < 100 && (
        <span className="absolute text-[8px] font-bold text-[var(--text-secondary)] scale-90">
          {Math.round(progress)}
        </span>
      )}
    </button>
  );
}
