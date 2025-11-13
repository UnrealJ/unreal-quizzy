import React, { useState, useEffect } from "react";
import { Flashcard } from "@/types/flashcard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Bookmark, BookmarkCheck } from "lucide-react";
import { saveCardForLater, unsaveCard, isCardSaved } from "@/lib/storage";
import { toast } from "sonner";

interface FlashcardViewerProps {
  cards: Flashcard[];
  setId?: string;
}

export const FlashcardViewer = ({ cards, setId }: FlashcardViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (setId && cards[currentIndex]) {
      setSaved(isCardSaved(setId, cards[currentIndex].id));
    }
  }, [currentIndex, setId, cards]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleToggleSave = () => {
    if (!setId) return;
    
    const currentCard = cards[currentIndex];
    if (saved) {
      unsaveCard(setId, currentCard.id);
      toast.success("Card removed from saved");
      setSaved(false);
    } else {
      saveCardForLater(setId, currentCard.id);
      toast.success("Card saved for later");
      setSaved(true);
    }
  };

  if (cards.length === 0) {
    return (
      <div className="text-center text-muted-foreground mt-12">
        No cards in this set yet
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto px-4">
      <div className="text-sm text-muted-foreground">
        {currentIndex + 1} / {cards.length}
      </div>

      <Card
        className="w-full min-h-[400px] flex items-center justify-center p-8 cursor-pointer transition-all hover:shadow-xl"
        onClick={handleFlip}
      >
        <div className="text-center">
          {!isFlipped ? (
            <div>
              <h2 className="text-5xl font-bold mb-4">{currentCard.term}</h2>
              <p className="text-muted-foreground">Tap to reveal definition</p>
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-muted-foreground">
                Definition
              </h3>
              <p className="text-xl">{currentCard.definition}</p>
            </div>
          )}
        </div>
      </Card>

      <div className="flex gap-4 items-center">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {setId && (
          <Button
            variant={saved ? "default" : "outline"}
            size="icon"
            onClick={handleToggleSave}
            title={saved ? "Remove from saved" : "Save for later"}
          >
            {saved ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
