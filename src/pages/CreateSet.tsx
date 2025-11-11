import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveSet } from "@/lib/storage";
import { Flashcard, FlashcardSet } from "@/types/flashcard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";

const CreateSet = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([
    { id: crypto.randomUUID(), term: "", definition: "" },
  ]);
  const [importText, setImportText] = useState("");

  const addCard = () => {
    setCards([...cards, { id: crypto.randomUUID(), term: "", definition: "" }]);
  };

  const removeCard = (id: string) => {
    if (cards.length > 1) {
      setCards(cards.filter((card) => card.id !== id));
    }
  };

  const updateCard = (id: string, field: "term" | "definition", value: string) => {
    setCards(
      cards.map((card) =>
        card.id === id ? { ...card, [field]: value } : card
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

    setCards(importedCards);
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

    const newSet: FlashcardSet = {
      id: crypto.randomUUID(),
      title: title.trim(),
      cards: validCards,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveSet(newSet);
    toast.success("Set created successfully!");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="bg-gradient-brand text-primary-foreground p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Create New Set</h1>
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
                  Import Cards
                </Button>
              </div>
            </Card>

            {cards.length > 0 && cards.some(c => c.term || c.definition) && (
              <Card className="p-6 bg-muted/50">
                <p className="text-sm font-medium mb-2">
                  Preview ({cards.filter(c => c.term && c.definition).length} cards ready)
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {cards.filter(c => c.term && c.definition).slice(0, 5).map((card, idx) => (
                    <div key={card.id} className="text-sm p-2 bg-background rounded">
                      <span className="font-medium">{card.term}</span> → {card.definition}
                    </div>
                  ))}
                  {cards.filter(c => c.term && c.definition).length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      ...and {cards.filter(c => c.term && c.definition).length - 5} more
                    </p>
                  )}
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <Button onClick={handleSave} className="w-full bg-primary">
          Save Set
        </Button>
      </div>
    </div>
  );
};

export default CreateSet;
