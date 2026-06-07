"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const MIN_DISPLAY_MS = 500;
const FADE_MS = 600;

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const start = performance.now();

    const finish = () => {
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
      return () => window.removeEventListener("load", finish);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`loading-overlay fixed inset-0 z-[100] flex items-center justify-center bg-bg ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden
    >
      <Image
        src="/images/logo.png"
        alt=""
        width={120}
        height={120}
        priority
        className="loading-emblem h-28 w-28 rounded-full object-cover"
      />
    </div>
  );
}
