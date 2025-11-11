import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSet } from "@/lib/storage";
import { Flashcard } from "@/types/flashcard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [setTitle, setSetTitle] = useState("");

  useEffect(() => {
    if (id) {
      const set = getSet(id);
      if (set) {
        setSetTitle(set.title);
        // Shuffle cards for quiz
        const shuffled = [...set.cards].sort(() => Math.random() - 0.5);
        setCards(shuffled);
      }
    }
  }, [id]);

  const handleSubmit = () => {
    const correct = userAnswer.toLowerCase().trim() === 
                    cards[currentIndex].definition.toLowerCase().trim();
    
    if (correct) {
      setScore(score + 1);
      toast.success("Correct!");
    } else {
      toast.error("Incorrect");
    }

    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestart = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setUserAnswer("");
    setShowResult(false);
    setQuizComplete(false);
  };

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No cards to quiz</p>
          <Button onClick={() => navigate("/")}>Back to Sets</Button>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((score / cards.length) * 100);
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-brand text-primary-foreground p-6">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate(`/set/${id}`)}
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
              <div className="text-6xl font-bold mb-4 text-primary">
                {percentage}%
              </div>
              <p className="text-2xl mb-2">
                {score} out of {cards.length} correct
              </p>
              <p className="text-muted-foreground">
                {percentage >= 80
                  ? "Excellent work! 🎉"
                  : percentage >= 60
                  ? "Good job! Keep practicing."
                  : "Keep studying, you'll get there!"}
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleRestart} className="bg-primary">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate(`/set/${id}`)}>
                Review Cards
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="bg-gradient-brand text-primary-foreground p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(`/set/${id}`)}
            className="mb-4 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Quiz: {setTitle}</h1>
            <div className="text-xl">
              {currentIndex + 1} / {cards.length}
            </div>
          </div>
          <div className="mt-2 text-primary-foreground/80">
            Score: {score} / {currentIndex + (showResult ? 1 : 0)}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-12">
        <Card className="p-8">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-bold mb-4">{currentCard.term}</h2>
            <p className="text-muted-foreground">What is the definition?</p>
          </div>

          {!showResult ? (
            <div className="space-y-4">
              <Input
                placeholder="Type your answer..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                className="text-lg"
                autoFocus
              />
              <Button
                onClick={handleSubmit}
                disabled={!userAnswer.trim()}
                className="w-full bg-primary"
              >
                Submit Answer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-lg ${
                  userAnswer.toLowerCase().trim() ===
                  currentCard.definition.toLowerCase().trim()
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {userAnswer.toLowerCase().trim() ===
                  currentCard.definition.toLowerCase().trim() ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-semibold">
                    {userAnswer.toLowerCase().trim() ===
                    currentCard.definition.toLowerCase().trim()
                      ? "Correct!"
                      : "Incorrect"}
                  </span>
                </div>
                <p className="text-sm">
                  <strong>Correct answer:</strong> {currentCard.definition}
                </p>
                {userAnswer.toLowerCase().trim() !==
                  currentCard.definition.toLowerCase().trim() && (
                  <p className="text-sm mt-1">
                    <strong>Your answer:</strong> {userAnswer}
                  </p>
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
