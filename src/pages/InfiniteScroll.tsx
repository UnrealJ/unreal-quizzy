import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getSets, saveCardForLater, unsaveCard, isCardSaved } from "@/lib/storage";
import { Flashcard } from "@/types/flashcard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

interface CardWithSet extends Flashcard {
  setId: string;
  setTitle: string;
}

const InfiniteScroll = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<CardWithSet[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [savedCards, setSavedCards] = useState<Set<string>>(new Set());
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const sets = getSets();
    const allCards: CardWithSet[] = [];
    
    sets.forEach((set) => {
      set.cards.forEach((card) => {
        allCards.push({
          ...card,
          setId: set.id,
          setTitle: set.title,
        });
      });
    });

    // Shuffle cards
    const shuffled = allCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);

    // Load saved cards
    const saved = new Set<string>();
    allCards.forEach((card) => {
      if (isCardSaved(card.setId, card.id)) {
        saved.add(card.id);
      }
    });
    setSavedCards(saved);
  }, []);

  // Auto-flip cards back when scrolled away
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cardId = entry.target.getAttribute("data-card-id");
          if (cardId && !entry.isIntersecting && flippedCards.has(cardId)) {
            setFlippedCards((prev) => {
              const next = new Set(prev);
              next.delete(cardId);
              return next;
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    cardRefs.current.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [flippedCards]);

  const setCardRef = useCallback((cardId: string, element: HTMLDivElement | null) => {
    if (element) {
      cardRefs.current.set(cardId, element);
    } else {
      cardRefs.current.delete(cardId);
    }
  }, []);

  const handleFlip = (cardId: string) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const handleSave = (card: CardWithSet) => {
    if (savedCards.has(card.id)) {
      unsaveCard(card.setId, card.id);
      setSavedCards((prev) => {
        const next = new Set(prev);
        next.delete(card.id);
        return next;
      });
      toast.success("Card removed from saved");
    } else {
      saveCardForLater(card.setId, card.id);
      setSavedCards((prev) => new Set(prev).add(card.id));
      toast.success("Card saved for later");
    }
  };

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6">
          <p className="text-muted-foreground mb-4">No cards available</p>
          <Button onClick={() => navigate("/")}>Back to Sets</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-brand p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="text-primary-foreground hover:bg-primary-foreground/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold text-primary-foreground">Infinite Scroll</h1>
        <div className="w-10" />
      </div>

      <div className="h-full overflow-y-scroll snap-y snap-mandatory pt-16">
        {cards.map((card) => {
          const isFlipped = flippedCards.has(card.id);
          const isSaved = savedCards.has(card.id);

          return (
            <div
              key={`${card.setId}-${card.id}`}
              ref={(el) => setCardRef(card.id, el)}
              data-card-id={card.id}
              className="h-screen snap-start snap-always flex items-center justify-center p-4 relative"
            >
              <div
                className="w-full max-w-2xl h-[80vh] bg-card rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 cursor-pointer relative border border-border/20"
                onClick={() => handleFlip(card.id)}
              >
                <div className="text-center space-y-4 max-w-xl">
                  {!isFlipped ? (
                    <>
                      <h2 className="text-4xl md:text-6xl font-bold text-foreground">
                        {card.term}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Tap to reveal definition
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-semibold text-muted-foreground mb-4">
                        Definition
                      </h3>
                      <p className="text-2xl md:text-3xl text-foreground">
                        {card.definition}
                      </p>
                    </>
                  )}
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {card.setTitle}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave(card);
                    }}
                    className="hover:bg-background/50"
                  >
                    {isSaved ? (
                      <BookmarkCheck className="h-5 w-5 text-primary fill-primary" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InfiniteScroll;
