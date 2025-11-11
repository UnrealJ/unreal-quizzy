import React from "react";
import { FlashcardSet } from "@/types/flashcard";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface SetCardProps {
  set: FlashcardSet;
}

export const SetCard = ({ set }: SetCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-border"
      onClick={() => navigate(`/set/${set.id}`)}
    >
      <h3 className="text-xl font-bold mb-2">{set.title}</h3>
      <p className="text-muted-foreground">
        {set.cards.length} {set.cards.length === 1 ? "card" : "cards"}
      </p>
    </Card>
  );
};
