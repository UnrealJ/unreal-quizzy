import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Flashcard } from "@/types/flashcard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, XCircle, Zap } from "lucide-react";

interface SpeedQuizProps {
  cards: Flashcard[];
  setTitle: string;
  backPath: string;
}

const SpeedMultipleChoice: React.FC<SpeedQuizProps> = ({ cards, setTitle, backPath }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [startTime] = useState(Date.now());
  const [totalTime, setTotalTime] = useState(0);
  const [lastResult, setLastResult] = useState<{ correct: boolean; answer: string } | null>(null);
  const [results, setResults] = useState<Array<{ card: Flashcard; correct: boolean; userAnswer: string }>>([]);

  // Generate choices
  useEffect(() => {
    if (currentIndex < cards.length) {
      const currentCard = cards[currentIndex];
      const wrongChoices = cards
        .filter((c) => c.id !== currentCard.id)
        .map((c) => c.term)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      setChoices([currentCard.term, ...wrongChoices].sort(() => Math.random() - 0.5));
      setLastResult(null);
    }
  }, [currentIndex, cards]);

  const handleAnswer = useCallback((choice: string) => {
    if (lastResult) return; // prevent double-click
    const currentCard = cards[currentIndex];
    const correct = choice.toLowerCase().trim() === currentCard.term.toLowerCase().trim();

    if (correct) setScore((s) => s + 1);

    setResults((r) => [...r, { card: currentCard, correct, userAnswer: choice }]);
    setLastResult({ correct, answer: choice });

    // Brief flash then auto-advance
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setTotalTime(Date.now() - startTime);
        setQuizComplete(true);
      }
    }, 300);
  }, [currentIndex, cards, lastResult, startTime]);

  // Keyboard shortcuts: 1-4
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (quizComplete || lastResult) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 4 && num <= choices.length) {
        handleAnswer(choices[num - 1]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [choices, quizComplete, lastResult, handleAnswer]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    if (minutes > 0) return `${minutes}m ${remainingSeconds}.${tenths}s`;
    return `${seconds}.${tenths}s`;
  };

  if (quizComplete) {
    const percentage = Math.round((score / cards.length) * 100);
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-brand text-primary-foreground p-6">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate(backPath)}
              className="mb-4 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">⚡ Speed Quiz Complete!</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-12 text-center">
          <Card className="p-12">
            <div className="mb-8">
              <div className="text-6xl font-bold mb-2 text-primary">{formatTime(totalTime)}</div>
              <p className="text-muted-foreground mb-4">Total Time</p>
              <div className="text-4xl font-bold mb-2">{percentage}%</div>
              <p className="text-xl mb-2">
                {score} out of {cards.length} correct
              </p>
              <p className="text-muted-foreground text-sm">
                Average: {formatTime(totalTime / cards.length)} per question
              </p>
            </div>

            {/* Results breakdown */}
            <div className="text-left mb-8 max-h-64 overflow-y-auto">
              {results.map((r, i) => (
                <div key={i} className={`flex items-center gap-2 p-2 rounded text-sm ${
                  r.correct 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                }`}>
                  {r.correct ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
                  <span className="truncate"><strong>{r.card.definition}</strong> → {r.card.term}</span>
                  {!r.correct && <span className="text-muted-foreground ml-auto shrink-0">(you: {r.userAnswer})</span>}
                </div>
              ))}
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => {
                setCurrentIndex(0);
                setScore(0);
                setQuizComplete(false);
                setResults([]);
                setLastResult(null);
              }} className="bg-primary">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate(backPath)}>
                Back
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const elapsed = Date.now() - startTime;

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="bg-gradient-brand text-primary-foreground p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <span className="font-bold">Speed Quiz: {setTitle}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span>{currentIndex + 1}/{cards.length}</span>
              <span>Score: {score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <Card className="p-8 mb-6">
          <h2 className="text-3xl font-bold text-center mb-2">{currentCard.definition}</h2>
          <p className="text-muted-foreground text-center text-sm">What is the term?</p>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          {choices.map((choice, index) => {
            const isSelected = lastResult?.answer === choice;
            const isCorrect = choice.toLowerCase().trim() === currentCard.term.toLowerCase().trim();
            let variant: "outline" | "default" | "destructive" = "outline";
            let extraClass = "h-auto py-6 text-left justify-start whitespace-normal relative";

            if (lastResult) {
              if (isCorrect) {
                extraClass += " border-green-500 bg-green-50 dark:bg-green-950";
              } else if (isSelected && !lastResult.correct) {
                extraClass += " border-red-500 bg-red-50 dark:bg-red-950";
              }
            } else {
              extraClass += " hover:border-primary hover:bg-primary/5";
            }

            return (
              <Button
                key={index}
                variant={variant}
                className={extraClass}
                onClick={() => handleAnswer(choice)}
                disabled={!!lastResult}
              >
                <span className="absolute top-2 left-3 text-xs text-muted-foreground font-mono">
                  {index + 1}
                </span>
                <span className="mt-2">{choice}</span>
              </Button>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">1</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono ml-1">2</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono ml-1">3</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono ml-1">4</kbd> for quick selection
        </p>
      </div>
    </div>
  );
};

export default SpeedMultipleChoice;
