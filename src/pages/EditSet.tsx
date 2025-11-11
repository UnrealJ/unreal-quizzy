import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { saveSet, getSet, deleteSet } from "@/lib/storage";
import { Flashcard, FlashcardSet } from "@/types/flashcard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";

const EditSet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [importText, setImportText] = useState("");

  useEffect(() => {
    if (id) {
      const set = getSet(id);
      if (set) {
        setTitle(set.title);
        setCards(set.cards);
      }
      setLoading(false);
    }
  }, [id]);

  const addCard = () => {
    setCards([...cards, { id: crypto.randomUUID(), term: "", definition: "" }]);
  };

  const removeCard = (cardId: string) => {
    if (cards.length > 1) {
      setCards(cards.filter((card) => card.id !== cardId));
    }
  };

  const updateCard = (cardId: string, field: "term" | "definition", value: string) => {
    setCards(
      cards.map((card) =>
        card.id === cardId ? { ...card, [field]: value } : card
      )
    );
  };

  const handleImport = () => {
    if (!importText.trim()) {
      toast.error("Please paste some text to import");
      return;
    }

    const lines = importText.trim().split("\n");
    const importedCards: Flashcard[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      const commaIndex = trimmedLine.indexOf(",");
      if (commaIndex === -1) {
        errors.push(`Line ${index + 1}: Missing comma separator`);
        return;
      }

      const term = trimmedLine.substring(0, commaIndex).trim();
      const definition = trimmedLine.substring(commaIndex + 1).trim();

      if (!term || !definition) {
        errors.push(`Line ${index + 1}: Term or definition is empty`);
        return;
      }

      importedCards.push({
        id: crypto.randomUUID(),
        term,
        definition,
      });
    });

    if (errors.length > 0) {
      toast.error(`Import errors: ${errors.join("; ")}`);
      return;
    }

    if (importedCards.length === 0) {
      toast.error("No valid cards found to import");
      return;
    }

    setCards([...cards, ...importedCards]);
    toast.success(`Imported ${importedCards.length} cards successfully!`);
    setImportText("");
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Please enter a title for your set");
      return;
    }

    const validCards = cards.filter(
      (card) => card.term.trim() && card.definition.trim()
    );

    if (validCards.length === 0) {
      toast.error("Please add at least one complete card");
      return;
    }

    if (id) {
      const existingSet = getSet(id);
      const updatedSet: FlashcardSet = {
        id,
        title: title.trim(),
        cards: validCards,
        createdAt: existingSet?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveSet(updatedSet);
      toast.success("Set updated successfully!");
      navigate(`/set/${id}`);
    }
  };

  const handleDelete = () => {
    if (id && confirm("Are you sure you want to delete this set?")) {
      deleteSet(id);
      toast.success("Set deleted successfully");
      navigate("/");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

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
          <h1 className="text-3xl font-bold">Edit Set</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">Set Title</label>
          <Input
            placeholder="Enter set title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg"
          />
        </div>

        <Tabs defaultValue="manual" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">
              <Plus className="h-4 w-4 mr-2" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="import">
              <FileText className="h-4 w-4 mr-2" />
              Import Mode
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            {cards.map((card, index) => (
              <Card key={card.id} className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Card {index + 1}</h3>
                  {cards.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCard(card.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Term</label>
                    <Input
                      placeholder="Enter term..."
                      value={card.term}
                      onChange={(e) =>
                        updateCard(card.id, "term", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Definition
                    </label>
                    <Textarea
                      placeholder="Enter definition..."
                      value={card.definition}
                      onChange={(e) =>
                        updateCard(card.id, "definition", e.target.value)
                      }
                      rows={3}
                    />
                  </div>
                </div>
              </Card>
            ))}

            <Button variant="outline" onClick={addCard} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Import Cards
                  </label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Paste your flashcards in this format (one per line):
                    <br />
                    <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                      term1, definition1<br />
                      term2, definition2
                    </code>
                  </p>
                  <Textarea
                    placeholder="Paste your cards here..."
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>
                <Button onClick={handleImport} className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Import Cards (will add to existing)
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 mb-4">
          <Button onClick={handleSave} className="flex-1 bg-primary">
            Save Changes
          </Button>
        </div>

        <Button
          variant="destructive"
          onClick={handleDelete}
          className="w-full"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Set
        </Button>
      </div>
    </div>
  );
};

export default EditSet;
