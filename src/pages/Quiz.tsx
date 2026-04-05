import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSet, getSets, getSavedCards } from "@/lib/storage";
import { Flashcard, MCQCard } from "@/types/flashcard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import SpeedMultipleChoice from "@/components/SpeedMultipleChoice";

type QuizMode = "type-in" | "multiple-choice" | "speed" | "custom-mcq";

// Unified question shape used during a quiz session
interface QuizQuestion {
  id: string;
  prompt: string;        // shown to user
  choices: string[];     // options to display
  correctAnswer: string; // the correct choice text
  isCustomMCQ?: boolean;
}

function buildFlashcardQuestion(
  card: Flashcard,
  allCards: Flashcard[]
): QuizQuestion {
  const wrongChoices = allCards
    .filter((c) => c.id !== card.id)
    .map((c) => c.term)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const choices = [card.term, ...wrongChoices].sort(() => Math.random() - 0.5);
  return {
    id: card.id,
    prompt: card.definition,
    choices,
    correctAnswer: card.term,
  };
}

function buildMCQQuestion(mcq: MCQCard): QuizQuestion {
  const choices = [...mcq.options]
    .sort(() => Math.random() - 0.5)
    .map((o) => o.text);
  const correct = mcq.options.find((o) => o.isCorrect)?.text ?? "";
  return {
    id: mcq.id,
    prompt: mcq.question,
    choices,
    correctAnswer: correct,
    isCustomMCQ: true,
  };
}

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [mcqCards, setMcqCards] = useState<MCQCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [setTitle, setSetTitle] = useState("");
  const [quizMode, setQuizMode] = useState<QuizMode | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    if (id === "saved") {
      const sets = getSets();
      const savedRefs = getSavedCards();
      const savedCards: Flashcard[] = [];
      savedRefs.forEach(({ setId, cardId }) => {
        const set = sets.find((s) => s.id === setId);
        const card = set?.cards.find((c) => c.id === cardId);
        if (card) savedCards.push(card);
      });
      setSetTitle("Saved Cards");
      setCards([...savedCards].sort(() => Math.random() - 0.5));
      setMcqCards([]);
    } else if (id) {
      const set = getSet(id);
      if (set) {
        setSetTitle(set.title);
        setCards([...set.cards].sort(() => Math.random() - 0.5));
        setMcqCards([...(set.mcqCards ?? [])].sort(() => Math.random() - 0.5));
      }
    }
  }, [id]);

  const handleModeSelect = (mode: QuizMode) => {
    setQuizMode(mode);

    if (mode === "type-in" || mode === "multiple-choice") {
      // Flashcard-only modes
      setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    } else if (mode === "custom-mcq") {
      // Build unified question list from custom MCQ cards
      const qs = mcqCards.map(buildMCQQuestion);
      setQuestions(qs.sort(() => Math.random() - 0.5));
    }
  };

  // Build MC choices for flashcard multiple-choice mode
  const currentCard = cards[currentIndex] ?? null;
  const [choices, setChoices] = useState<string[]>([]);

  useEffect(() => {
    if (quizMode === "multiple-choice" && cards.length > 0 && currentIndex < cards.length) {
      const q = buildFlashcardQuestion(cards[currentIndex], cards);
      setChoices(q.choices);
    }
  }, [quizMode, currentIndex, cards]);

  const handleSubmit = () => {
    if (quizMode === "custom-mcq") {
      const q = questions[currentIndex];
      const correct = selectedChoice?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      if (correct) { setScore(score + 1); toast.success("Correct!"); }
      else toast.error("Incorrect");
      setShowResult(true);
      return;
    }

    if (!currentCard) return;
    let correct = false;
    if (quizMode === "type-in") {
      correct = userAnswer.toLowerCase().trim() === currentCard.term.toLowerCase().trim();
    } else if (quizMode === "multiple-choice") {
      correct = selectedChoice?.toLowerCase().trim() === currentCard.term.toLowerCase().trim();
    }
    if (correct) { setScore(score + 1); toast.success("Correct!"); }
    else toast.error("Incorrect");
    setShowResult(true);
  };

  const handleNext = () => {
    const total = quizMode === "custom-mcq" ? questions.length : cards.length;
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setSelectedChoice(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setQuestions((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setScore(0);
    setUserAnswer("");
    setSelectedChoice(null);
    setShowResult(false);
    setQuizComplete(false);
    setQuizMode(null);
  };

  const totalCards = cards.length;
  const totalMCQ = mcqCards.length;
  const backPath = id === "saved" ? "/saved" : `/set/${id}`;

  if (totalCards === 0 && totalMCQ === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No cards to quiz</p>
          <Button onClick={() => navigate("/")}>Back to Sets</Button>
        </div>
      </div>
    );
  }

  // Mode selection screen
  if (!quizMode) {
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
            <h1 className="text-3xl font-bold">Quiz: {setTitle}</h1>
            <p className="text-primary-foreground/80 mt-2">
              {totalCards > 0 && `${totalCards} flashcard${totalCards !== 1 ? "s" : ""}`}
              {totalCards > 0 && totalMCQ > 0 && " · "}
              {totalMCQ > 0 && `${totalMCQ} custom MCQ${totalMCQ !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-12">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Choose Quiz Mode</h2>
            <div className={`grid gap-4 ${totalMCQ > 0 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"}`}>
              {totalCards > 0 && (
                <>
                  <Button
                    variant="outline"
                    className="h-auto py-8 flex flex-col gap-3 hover:border-primary hover:bg-primary/5"
                    onClick={() => handleModeSelect("type-in")}
                  >
                    <div className="text-4xl">✍️</div>
                    <div className="text-xl font-semibold">Type In</div>
                    <p className="text-sm text-muted-foreground">Type the correct term</p>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-8 flex flex-col gap-3 hover:border-primary hover:bg-primary/5"
                    onClick={() => handleModeSelect("multiple-choice")}
                  >
                    <div className="text-4xl">🎯</div>
                    <div className="text-xl font-semibold">Multiple Choice</div>
                    <p className="text-sm text-muted-foreground">Choose from 4 options</p>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-8 flex flex-col gap-3 hover:border-primary hover:bg-primary/5"
                    onClick={() => handleModeSelect("speed")}
                  >
                    <div className="text-4xl">⚡</div>
                    <div className="text-xl font-semibold">Speed Mode</div>
                    <p className="text-sm text-muted-foreground">Timed, instant answers</p>
                  </Button>
                </>
              )}
              {totalMCQ > 0 && (
                <Button
                  variant="outline"
                  className="h-auto py-8 flex flex-col gap-3 hover:border-primary hover:bg-primary/5"
                  onClick={() => handleModeSelect("custom-mcq")}
                >
                  <div className="text-4xl">📋</div>
                  <div className="text-xl font-semibold">Custom MCQ</div>
                  <p className="text-sm text-muted-foreground">{totalMCQ} custom question{totalMCQ !== 1 ? "s" : ""}</p>
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Speed mode
  if (quizMode === "speed") {
    return <SpeedMultipleChoice cards={cards} setTitle={setTitle} backPath={backPath} />;
  }

  // Quiz complete screen
  if (quizComplete) {
    const total = quizMode === "custom-mcq" ? questions.length : cards.length;
    const percentage = Math.round((score / total) * 100);
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
            <h1 className="text-3xl font-bold">Quiz Complete!</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-12 text-center">
          <Card className="p-12">
            <div className="mb-8">
              <div className="text-6xl font-bold mb-4 text-primary">{percentage}%</div>
              <p className="text-2xl mb-2">{score} out of {total} correct</p>
              <p className="text-muted-foreground">
                {percentage >= 80 ? "Excellent work! 🎉" : percentage >= 60 ? "Good job! Keep practicing." : "Keep studying, you'll get there!"}
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleRestart} className="bg-primary">Try Again</Button>
              <Button variant="outline" onClick={() => navigate(backPath)}>Review Cards</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ── Custom MCQ quiz ──
  if (quizMode === "custom-mcq") {
    const q = questions[currentIndex];
    if (!q) return null;

    return (
      <div className="min-h-screen bg-background pb-12">
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
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Custom MCQ: {setTitle}</h1>
              <div className="text-xl">{currentIndex + 1} / {questions.length}</div>
            </div>
            <div className="mt-2 text-primary-foreground/80">
              Score: {score} / {currentIndex + (showResult ? 1 : 0)}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-12">
          <Card className="p-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold mb-2">{q.prompt}</h2>
            </div>

            {!showResult ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {q.choices.map((choice, index) => (
                    <Button
                      key={index}
                      variant={selectedChoice === choice ? "default" : "outline"}
                      className="w-full h-auto py-4 px-6 text-left justify-start whitespace-normal"
                      onClick={() => setSelectedChoice(choice)}
                    >
                      <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                      <span>{choice}</span>
                    </Button>
                  ))}
                </div>
                <Button onClick={handleSubmit} disabled={!selectedChoice} className="w-full bg-primary">
                  Submit Answer
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg ${
                    selectedChoice?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
                      ? "bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800"
                      : "bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {selectedChoice?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                    <span className="font-semibold">
                      {selectedChoice?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
                        ? "Correct!"
                        : "Incorrect"}
                    </span>
                  </div>
                  <p className="text-sm"><strong>Correct answer:</strong> {q.correctAnswer}</p>
                  {selectedChoice?.trim().toLowerCase() !== q.correctAnswer.trim().toLowerCase() && (
                    <p className="text-sm mt-1"><strong>Your answer:</strong> {selectedChoice}</p>
                  )}
                </div>
                <Button onClick={handleNext} className="w-full bg-primary">
                  {currentIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // ── Flashcard quiz (type-in / multiple-choice) ──
  if (!currentCard) return null;

  return (
    <div className="min-h-screen bg-background pb-12">
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
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Quiz: {setTitle}</h1>
            <div className="text-xl">{currentIndex + 1} / {cards.length}</div>
          </div>
          <div className="mt-2 text-primary-foreground/80">
            Score: {score} / {currentIndex + (showResult ? 1 : 0)}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-12">
        <Card className="p-8">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-bold mb-4">{currentCard.definition}</h2>
            <p className="text-muted-foreground">What is the term?</p>
          </div>

          {!showResult ? (
            <div className="space-y-4">
              {quizMode === "type-in" ? (
                <>
                  <Input
                    placeholder="Type your answer..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && userAnswer.trim() && handleSubmit()}
                    className="text-lg"
                    autoFocus
                  />
                  <Button onClick={handleSubmit} disabled={!userAnswer.trim()} className="w-full bg-primary">
                    Submit Answer
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    {choices.map((choice, index) => (
                      <Button
                        key={index}
                        variant={selectedChoice === choice ? "default" : "outline"}
                        className="w-full h-auto py-4 px-6 text-left justify-start whitespace-normal"
                        onClick={() => setSelectedChoice(choice)}
                      >
                        <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                        <span>{choice}</span>
                      </Button>
                    ))}
                  </div>
                  <Button onClick={handleSubmit} disabled={!selectedChoice} className="w-full bg-primary">
                    Submit Answer
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-lg ${
                  (quizMode === "type-in"
                    ? userAnswer.toLowerCase().trim() === currentCard.term.toLowerCase().trim()
                    : selectedChoice?.toLowerCase().trim() === currentCard.term.toLowerCase().trim())
                    ? "bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800"
                    : "bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {(quizMode === "type-in"
                    ? userAnswer.toLowerCase().trim() === currentCard.term.toLowerCase().trim()
                    : selectedChoice?.toLowerCase().trim() === currentCard.term.toLowerCase().trim()) ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  )}
                  <span className="font-semibold">
                    {(quizMode === "type-in"
                      ? userAnswer.toLowerCase().trim() === currentCard.term.toLowerCase().trim()
                      : selectedChoice?.toLowerCase().trim() === currentCard.term.toLowerCase().trim())
                      ? "Correct!"
                      : "Incorrect"}
                  </span>
                </div>
                <p className="text-sm"><strong>Correct answer:</strong> {currentCard.term}</p>
                {quizMode === "type-in" && userAnswer.toLowerCase().trim() !== currentCard.term.toLowerCase().trim() && (
                  <p className="text-sm mt-1"><strong>Your answer:</strong> {userAnswer}</p>
                )}
                {quizMode === "multiple-choice" && selectedChoice?.toLowerCase().trim() !== currentCard.term.toLowerCase().trim() && (
                  <p className="text-sm mt-1"><strong>Your answer:</strong> {selectedChoice}</p>
                )}
              </div>
              <Button onClick={handleNext} className="w-full bg-primary">
                {currentIndex < cards.length - 1 ? "Next Question" : "Finish Quiz"}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
