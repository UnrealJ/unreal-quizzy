import React, { useState, useEffect } from "react";
import { Flashcard } from "@/types/flashcard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Check } from "lucide-react";
import {
  saveCardForLater,
  unsaveCard,
  isCardSaved,
  isCardKnown,
  markCardKnown,
  unmarkCardKnown,
} from "@/lib/storage";
import { toast } from "sonner";

interface CardGridProps {
  cards: Flashcard[];
  setId: string;
}

interface FlipCardProps {
  card: Flashcard;
  setId: string;
}

const FlipCard = ({ card, setId }: FlipCardProps) => {
  const [flipped, setFlipped] = useState(false);
  const [saved, setSaved] = useState(false);
  const [known, setKnown] = useState(false);

  useEffect(() => {
    setSaved(isCardSaved(setId, card.id));
    setKnown(isCardKnown(setId, card.id));
  }, [setId, card.id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved) {
      unsaveCard(setId, card.id);
      toast.success("Card removed from saved");
      setSaved(false);
    } else {
      saveCardForLater(setId, card.id);
      toast.success("Card saved for later");
      setSaved(true);
    }
  };

  const toggleKnown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (known) {
      unmarkCardKnown(setId, card.id);
      toast.success("Card unmarked");
      setKnown(false);
    } else {
      markCardKnown(setId, card.id);
      toast.success("Marked as known");
      setKnown(true);
    }
  };

  return (
    <Card
      onClick={() => setFlipped((f) => !f)}
      className="relative cursor-pointer p-4 min-h-[160px] flex items-center justify-center text-center transition-all hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="absolute top-2 right-2 flex gap-1">
        <Button
          size="icon"
          onClick={toggleKnown}
          className={`h-8 w-8 ${
            known
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-transparent border border-input text-foreground hover:bg-green-600/10 hover:text-green-600"
          }`}
          title={known ? "Unmark as known" : "Mark as known"}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant={saved ? "default" : "outline"}
          size="icon"
          onClick={toggleSave}
          className="h-8 w-8"
          title={saved ? "Remove from saved" : "Save for later"}
        >
          {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </Button>
      </div>
      <div className="px-2">
        {!flipped ? (
          <p className="font-semibold text-lg break-words">{card.term}</p>
        ) : (
          <p className="text-sm break-words">{card.definition}</p>
        )}
      </div>
    </Card>
  );
};

export const CardGrid = ({ cards, setId }: CardGridProps) => {
  if (cards.length === 0) {
    return (
      <div className="text-center text-muted-foreground mt-12">
        No cards in this set yet
      </div>
    );
  }

  return (
    <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-3">
        {cards.map((card) => (
          <FlipCard key={card.id} card={card} setId={setId} />
        ))}
      </div>
    </div>
  );
};
