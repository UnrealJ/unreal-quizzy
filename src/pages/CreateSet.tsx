import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveSet } from "@/lib/storage";
import { Flashcard, FlashcardSet, MCQCard, MCQOption } from "@/types/flashcard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Trash2, FileText, ListChecks, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

const createEmptyMCQ = (): MCQCard => ({
  id: crypto.randomUUID(),
  question: "",
  options: [
    { id: crypto.randomUUID(), text: "", isCorrect: true },
    { id: crypto.randomUUID(), text: "", isCorrect: false },
    { id: crypto.randomUUID(), text: "", isCorrect: false },
    { id: crypto.randomUUID(), text: "", isCorrect: false },
  ],
});

const CreateSet = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([
    { id: crypto.randomUUID(), term: "", definition: "" },
  ]);
  const [mcqCards, setMcqCards] = useState<MCQCard[]>([createEmptyMCQ()]);
  const [importText, setImportText] = useState("");
  const [mcqImportText, setMcqImportText] = useState("");

  // --- Flashcard handlers ---
  const addCard = () => {
    setCards([...cards, { id: crypto.randomUUID(), term: "", definition: "" }]);
  };

  const removeCard = (id: string) => {
    if (cards.length > 1) setCards(cards.filter((c) => c.id !== id));
  };

  const updateCard = (id: string, field: "term" | "definition", value: string) => {
    setCards(cards.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
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
      const pipeIndex = trimmedLine.indexOf("|");
      if (pipeIndex === -1) {
        errors.push(`Line ${index + 1}: Missing | separator`);
        return;
      }
      const term = trimmedLine.substring(0, pipeIndex).trim();
      const definition = trimmedLine.substring(pipeIndex + 1).trim();
      if (!term || !definition) {
        errors.push(`Line ${index + 1}: Term or definition is empty`);
        return;
      }
      importedCards.push({ id: crypto.randomUUID(), term, definition });
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

  // --- MCQ handlers ---
  const addMCQ = () => setMcqCards([...mcqCards, createEmptyMCQ()]);

  const removeMCQ = (id: string) => {
    if (mcqCards.length > 1) setMcqCards(mcqCards.filter((m) => m.id !== id));
  };

  const updateMCQQuestion = (id: string, question: string) => {
    setMcqCards(mcqCards.map((m) => (m.id === id ? { ...m, question } : m)));
  };

  const updateMCQOption = (mcqId: string, optId: string, text: string) => {
    setMcqCards(
      mcqCards.map((m) =>
        m.id === mcqId
          ? { ...m, options: m.options.map((o) => (o.id === optId ? { ...o, text } : o)) }
          : m
      )
    );
  };

  const setCorrectOption = (mcqId: string, optId: string) => {
    setMcqCards(
      mcqCards.map((m) =>
        m.id === mcqId
          ? { ...m, options: m.options.map((o) => ({ ...o, isCorrect: o.id === optId })) }
          : m
      )
    );
  };

  const addMCQOption = (mcqId: string) => {
    setMcqCards(
      mcqCards.map((m) =>
        m.id === mcqId
          ? { ...m, options: [...m.options, { id: crypto.randomUUID(), text: "", isCorrect: false }] }
          : m
      )
    );
  };

  const removeMCQOption = (mcqId: string, optId: string) => {
    setMcqCards(
      mcqCards.map((m) => {
        if (m.id !== mcqId) return m;
        if (m.options.length <= 2) return m;
        const newOpts = m.options.filter((o) => o.id !== optId);
        const hasCorrect = newOpts.some((o) => o.isCorrect);
        if (!hasCorrect && newOpts.length > 0) newOpts[0] = { ...newOpts[0], isCorrect: true };
        return { ...m, options: newOpts };
      })
    );
  };

  /**
   * MCQ import format (blank line between questions):
   *   Question text
   *   * Correct option
   *   - Wrong option
   *   - Wrong option
   */
  const handleMCQImport = () => {
    if (!mcqImportText.trim()) {
      toast.error("Please paste some text to import");
      return;
    }

    const blocks = mcqImportText.trim().split(/\n\s*\n/);
    const imported: MCQCard[] = [];
    const errors: string[] = [];

    blocks.forEach((block, bi) => {
      const lines = block.trim().split("\n").filter((l) => l.trim());
      if (lines.length < 3) {
        errors.push(`Block ${bi + 1}: Need a question and at least 2 options`);
        return;
      }
      const question = lines[0].trim();
      const options: MCQOption[] = [];
      let hasCorrect = false;

      lines.slice(1).forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("*")) {
          const text = trimmed.substring(1).trim();
          if (text) { options.push({ id: crypto.randomUUID(), text, isCorrect: true }); hasCorrect = true; }
        } else if (trimmed.startsWith("-")) {
          const text = trimmed.substring(1).trim();
          if (text) options.push({ id: crypto.randomUUID(), text, isCorrect: false });
        }
      });

      if (!hasCorrect) { errors.push(`Block ${bi + 1}: No correct answer marked with *`); return; }
      if (options.length < 2) { errors.push(`Block ${bi + 1}: Need at least 2 options`); return; }

      imported.push({ id: crypto.randomUUID(), question, options });
    });

    if (errors.length > 0) { toast.error(`Import errors: ${errors.join("; ")}`); return; }
    if (imported.length === 0) { toast.error("No valid MCQ cards found"); return; }

    setMcqCards(imported);
    toast.success(`Imported ${imported.length} MCQ questions!`);
    setMcqImportText("");
  };

  const handleSave = () => {
    if (!title.trim()) { toast.error("Please enter a title for your set"); return; }

    const validCards = cards.filter((c) => c.term.trim() && c.definition.trim());
    const validMCQ = mcqCards.filter(
      (m) =>
        m.question.trim() &&
        m.options.filter((o) => o.text.trim()).length >= 2 &&
        m.options.some((o) => o.isCorrect && o.text.trim())
    );

    if (validCards.length === 0 && validMCQ.length === 0) {
      toast.error("Please add at least one complete card or MCQ question");
      return;
    }

    const newSet: FlashcardSet = {
      id: crypto.randomUUID(),
      title: title.trim(),
      cards: validCards,
      mcqCards: validMCQ,
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">
              <Plus className="h-4 w-4 mr-2" />
              Flashcards
            </TabsTrigger>
            <TabsTrigger value="import">
              <FileText className="h-4 w-4 mr-2" />
              Import Cards
            </TabsTrigger>
            <TabsTrigger value="mcq">
              <ListChecks className="h-4 w-4 mr-2" />
              Custom MCQ
            </TabsTrigger>
          </TabsList>

          {/* Manual flashcard entry */}
          <TabsContent value="manual" className="space-y-4">
            {cards.map((card, index) => (
              <Card key={card.id} className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Card {index + 1}</h3>
                  {cards.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeCard(card.id)}>
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
                      onChange={(e) => updateCard(card.id, "term", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Definition</label>
                    <Textarea
                      placeholder="Enter definition..."
                      value={card.definition}
                      onChange={(e) => updateCard(card.id, "definition", e.target.value)}
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

          {/* Import flashcards */}
          <TabsContent value="import" className="space-y-4">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Import Flashcards</label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Paste your flashcards in this format (one per line):
                    <br />
                    <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                      term1 | definition1<br />
                      term2 | definition2
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

            {cards.some((c) => c.term || c.definition) && (
              <Card className="p-6 bg-muted/50">
                <p className="text-sm font-medium mb-2">
                  Preview ({cards.filter((c) => c.term && c.definition).length} cards ready)
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {cards.filter((c) => c.term && c.definition).slice(0, 5).map((card) => (
                    <div key={card.id} className="text-sm p-2 bg-background rounded">
                      <span className="font-medium">{card.term}</span> → {card.definition}
                    </div>
                  ))}
                  {cards.filter((c) => c.term && c.definition).length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      ...and {cards.filter((c) => c.term && c.definition).length - 5} more
                    </p>
                  )}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Custom MCQ tab */}
          <TabsContent value="mcq" className="space-y-6">
            <Tabs defaultValue="mcq-manual">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mcq-manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="mcq-import">Import MCQ</TabsTrigger>
              </TabsList>

              <TabsContent value="mcq-manual" className="space-y-4 mt-4">
                {mcqCards.map((mcq, qi) => (
                  <Card key={mcq.id} className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">Question {qi + 1}</h3>
                      {mcqCards.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => removeMCQ(mcq.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Question</label>
                      <Textarea
                        placeholder="Enter question..."
                        value={mcq.question}
                        onChange={(e) => updateMCQQuestion(mcq.id, e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-1">
                        Options{" "}
                        <span className="text-muted-foreground font-normal text-xs">
                          — click the circle to mark correct answer
                        </span>
                      </label>
                      {mcq.options.map((opt, oi) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCorrectOption(mcq.id, opt.id)}
                            className="flex-shrink-0"
                            title="Mark as correct answer"
                          >
                            {opt.isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </button>
                          <Input
                            placeholder={`Option ${oi + 1}...`}
                            value={opt.text}
                            onChange={(e) => updateMCQOption(mcq.id, opt.id, e.target.value)}
                            className={opt.isCorrect ? "border-green-400 bg-green-50 dark:bg-green-950/30" : ""}
                          />
                          {mcq.options.length > 2 && (
                            <Button variant="ghost" size="icon" onClick={() => removeMCQOption(mcq.id, opt.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => addMCQOption(mcq.id)} className="mt-1">
                        <Plus className="h-3 w-3 mr-1" /> Add Option
                      </Button>
                    </div>
                  </Card>
                ))}

                <Button variant="outline" onClick={addMCQ} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add MCQ Question
                </Button>
              </TabsContent>

              <TabsContent value="mcq-import" className="mt-4">
                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Import MCQ Questions</label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Paste questions in this format, separated by blank lines:
                        <br />
                        <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block whitespace-pre">{`What is the capital of France?\n* Paris\n- London\n- Berlin\n- Madrid\n\nWhat color is the sky?\n- Red\n* Blue\n- Green`}</code>
                        <br />
                        <span className="text-xs mt-1 inline-block">
                          Use <strong>*</strong> for correct, <strong>-</strong> for wrong options.
                        </span>
                      </p>
                      <Textarea
                        placeholder="Paste MCQ questions here..."
                        value={mcqImportText}
                        onChange={(e) => setMcqImportText(e.target.value)}
                        rows={14}
                        className="font-mono text-sm"
                      />
                    </div>
                    <Button onClick={handleMCQImport} className="w-full">
                      <ListChecks className="h-4 w-4 mr-2" />
                      Import MCQ Questions
                    </Button>
                  </div>
                </Card>

                {mcqCards.some((m) => m.question) && (
                  <Card className="p-6 bg-muted/50 mt-4">
                    <p className="text-sm font-medium mb-2">
                      Preview ({mcqCards.filter((m) => m.question).length} questions ready)
                    </p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {mcqCards.filter((m) => m.question).slice(0, 3).map((mcq) => (
                        <div key={mcq.id} className="text-sm p-2 bg-background rounded">
                          <p className="font-medium">{mcq.question}</p>
                          <p className="text-xs text-green-600 mt-0.5">
                            ✓ {mcq.options.find((o) => o.isCorrect)?.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
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
