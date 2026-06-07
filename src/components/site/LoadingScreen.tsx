"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const MIN_DISPLAY_MS = 1600;
const FADE_MS = 700;

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Sourcing organic cotton...");

  useEffect(() => {
    let progressTimer = 0;
    let textTimer = 0;

    const start = performance.now();

    // Rotational messages
    const texts = [
      "Sourcing pure organic cotton...",
      "Weaving traditional threads...",
      "Optimizing capillary action...",
      "Preparing steady burn...",
      "Lighting the inner flame..."
    ];
    let textIdx = 0;
    textTimer = window.setInterval(() => {
      textIdx = (textIdx + 1) % texts.length;
      setLoadingText(texts[textIdx]);
    }, 1200);

    // Simulated progress bar increment
    progressTimer = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) {
          clearInterval(progressTimer);
          return 92;
        }
        const diff = Math.max(1, Math.floor((95 - prev) * 0.15));
        return prev + diff;
      });
    }, 100);

    const finish = () => {
      clearInterval(progressTimer);
      clearInterval(textTimer);
      setProgress(100);
      setLoadingText("Ready.");

      const elapsed = performance.now() - start;
      const wait = Math.max(0, MIN_DISPLAY_MS - elapsed);

      window.setTimeout(() => {
        setFading(true);
        window.setTimeout(() => setVisible(false), FADE_MS);
      }, wait);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      return () => {
        window.removeEventListener("load", finish);
        clearInterval(progressTimer);
        clearInterval(textTimer);
      };
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`loading-overlay fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--color-surface-2)_0%,_var(--color-bg)_100%)] select-none ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ transition: `opacity ${FADE_MS}ms cubic-bezier(0.16, 1, 0.3, 1)` }}
      aria-hidden
    >
      {/* Background Radial Glow */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-gold/5 blur-[80px] animate-glow-pulse pointer-events-none z-0" />

      <div className="flex flex-col items-center z-10 text-center px-4">
        {/* Diya SVG */}
        <div className="relative mb-8 w-28 h-28 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-[0_4px_12px_rgba(179,126,51,0.15)]"
          >
            <defs>
              <radialGradient id="outerFlameGrad" cx="50%" cy="75%" r="75%">
                <stop offset="0%" stopColor="#ffeec2" />
                <stop offset="25%" stopColor="#ffa621" />
                <stop offset="100%" stopColor="#e55000" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="innerFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#e55000" />
                <stop offset="50%" stopColor="#ffdd55" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
              <linearGradient id="diyaGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f7d488" />
                <stop offset="50%" stopColor="#b37e33" />
                <stop offset="100%" stopColor="#6e4d1e" />
              </linearGradient>
            </defs>

            {/* Inner glow under the flame */}
            <circle cx="50" cy="45" r="15" fill="rgba(255, 166, 33, 0.15)" className="animate-glow-pulse" />

            {/* Diya Base/Bowl */}
            <path
              d="M12 60 C 12 82, 88 82, 88 60 C 88 52, 76 49, 50 49 C 24 49, 12 52, 12 60 Z"
              fill="url(#diyaGoldGrad)"
            />
            {/* Diya Inner Shadow/Rim */}
            <path
              d="M18 58 C 18 73, 82 73, 82 58 C 82 55, 72 53, 50 53 C 28 53, 18 55, 18 58 Z"
              fill="rgba(0,0,0,0.25)"
            />
            {/* Cotton Wick tip */}
            <path d="M48 53 C 49 46, 51 46, 52 53 Z" fill="#2c221a" />

            {/* Outer Flame (Flickering) */}
            <path
              d="M50 12 C 54 28, 63 36, 50 48 C 37 36, 46 28, 50 12 Z"
              fill="url(#outerFlameGrad)"
              className="animate-flicker-outer origin-bottom"
            />
            {/* Inner Flame (Flickering) */}
            <path
              d="M50 22 C 52 32, 57 36, 50 47 C 43 36, 48 32, 50 22 Z"
              fill="url(#innerFlameGrad)"
              className="animate-flicker-inner origin-bottom"
            />
          </svg>
        </div>

        {/* Brand Logo inside Glowing Orbital Ring */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Rotating Orbital Ring */}
          <div className="absolute w-20 h-20 rounded-full border border-dashed border-gold/40 animate-orbit-ring" />
          {/* Static Gold Border Ring */}
          <div className="absolute w-16 h-16 rounded-full border border-gold/20 shadow-[0_0_15px_rgba(232,183,101,0.05)]" />
          
          <Image
            src="/images/logo.png"
            alt=""
            width={52}
            height={52}
            priority
            className="rounded-full object-cover z-10 w-12 h-12 shadow-md relative"
          />
        </div>

        {/* Title */}
        <h2 className="font-display text-2xl md:text-3xl font-semibold uppercase tracking-widest text-gold animate-tracking-in mt-2 select-none">
          Thilak Products
        </h2>
        <span className="text-xs uppercase tracking-widest text-muted/60 mt-1 block font-medium">
          Pure Devotional Light
        </span>

        {/* Loading progress elements */}
        <div className="mt-10 flex flex-col items-center">
          {/* Progress track */}
          <div className="w-48 h-[2px] bg-gold/10 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-gold/70 to-gold rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Dynamic loading text */}
          <p className="mt-3 text-xs tracking-wider text-muted font-medium transition-opacity duration-300 ease-in-out h-4">
            {loadingText}
          </p>
        </div>
      </div>
    </div>
  );
}
