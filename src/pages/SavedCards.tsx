import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSets, getSavedCards } from "@/lib/storage";
import { Flashcard } from "@/types/flashcard";
import { FlashcardViewer } from "@/components/FlashcardViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface CardWithSet extends Flashcard {
  setId: string;
  setTitle: string;
}

const SavedCards = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<CardWithSet[]>([]);

  useEffect(() => {
    const sets = getSets();
    const savedRefs = getSavedCards();
    const saved: CardWithSet[] = [];

    savedRefs.forEach(({ setId, cardId }) => {
      const set = sets.find((s) => s.id === setId);
      const card = set?.cards.find((c) => c.id === cardId);
      if (set && card) {
        saved.push({
          ...card,
          setId: set.id,
          setTitle: set.title,
        });
      }
    });

    setCards(saved);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="bg-gradient-brand text-primary-foreground p-6">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Saved Cards</h1>
          <p className="text-primary-foreground/80">
            {cards.length} cards saved for review
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12">
        {cards.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <p className="mb-4">No saved cards yet</p>
            <Button onClick={() => navigate("/scroll")}>
              Browse Cards in Infinite Scroll
            </Button>
          </div>
        ) : (
          <FlashcardViewer cards={cards} />
        )}
      </div>
    </div>
  );
};

export default SavedCards;
