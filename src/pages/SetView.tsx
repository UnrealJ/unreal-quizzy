import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSet } from "@/lib/storage";
import { FlashcardSet } from "@/types/flashcard";
import { FlashcardViewer } from "@/components/FlashcardViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Edit } from "lucide-react";

const SetView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [set, setSet] = useState<FlashcardSet | null>(null);

  useEffect(() => {
    if (id) {
      const foundSet = getSet(id);
      setSet(foundSet || null);
    }
  }, [id]);

  if (!set) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Set not found</p>
          <Button onClick={() => navigate("/")}>Back to Sets</Button>
        </div>
      </div>
    );
  }

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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{set.title}</h1>
              <p className="text-primary-foreground/80">
                {set.cards.length} cards
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => navigate(`/edit/${set.id}`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                onClick={() => navigate(`/quiz/${set.id}`)}
              >
                <Play className="h-4 w-4 mr-2" />
                Quiz Mode
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12">
        <FlashcardViewer cards={set.cards} setId={set.id} />
      </div>
    </div>
  );
};

export default SetView;
