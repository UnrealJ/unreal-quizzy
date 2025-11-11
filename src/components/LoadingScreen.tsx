import React, { useEffect, useState } from "react";

const tips = [
  "Tap any card to reveal its definition",
  "Use Import Mode to add multiple cards at once",
  "Save cards in Infinite Scroll for later review",
  "Quiz Mode helps you test your knowledge",
  "Swipe through cards like your favorite app",
];

interface LoadingScreenProps {
  onLoadComplete: () => void;
}

export const LoadingScreen = ({ onLoadComplete }: LoadingScreenProps) => {
  const [tip] = useState(() => tips[Math.floor(Math.random() * tips.length)]);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    const minLoadTime = 500 + Math.random() * 300; // 500-800ms
    const retryTimer = setTimeout(() => setShowRetry(true), 10000);
    const loadTimer = setTimeout(() => {
      onLoadComplete();
    }, minLoadTime);

    return () => {
      clearTimeout(loadTimer);
      clearTimeout(retryTimer);
    };
  }, [onLoadComplete]);

  const handleRetry = () => {
    setShowRetry(false);
    window.location.reload();
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))]">
      <div className="flex flex-col items-center gap-8 px-6">
        <img
          src="/icon-192.png"
          alt="Quizzy Logo"
          className={`w-24 h-24 ${!prefersReducedMotion ? "animate-pulse" : ""}`}
        />
        <h1 className="text-6xl font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
          Quizzy
        </h1>
        <p className="text-white/90 text-center text-sm max-w-xs">{tip}</p>
        {showRetry && (
          <button
            onClick={handleRetry}
            className="mt-4 px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};
