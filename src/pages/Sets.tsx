import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSets } from "@/lib/storage";
import { FlashcardSet } from "@/types/flashcard";
import { SetCard } from "@/components/SetCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Plus, Search, Infinity, Bookmark, Settings } from "lucide-react";

const Sets = () => {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setSets(getSets());
  }, []);

  const handleLoadComplete = () => {
    setIsLoading(false);
    setTimeout(() => setShowContent(true), 100);
  };

  if (isLoading) {
    return <LoadingScreen onLoadComplete={handleLoadComplete} />;
  }

  const filteredSets = sets.filter((set) =>
    set.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-brand text-primary-foreground p-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold mb-2">Quizzy</h1>
          <p className="text-primary-foreground/80 mb-6">Your flashcard study companion</p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate("/scroll")}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Infinity className="h-4 w-4 mr-2" />
              Infinite Scroll
            </Button>
            <Button
              onClick={() => navigate("/saved")}
              variant="secondary"
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Saved Cards
            </Button>
            <Button
              onClick={() => navigate("/settings")}
              variant="secondary"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search sets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Sets</h2>
          <Button onClick={() => navigate("/create")} className="bg-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Set
          </Button>
        </div>

        {!showContent ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-lg p-6 border">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        ) : filteredSets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "No sets found" : "No sets yet. Create your first set!"}
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate("/create")} className="bg-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Set
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSets.map((set) => (
              <SetCard key={set.id} set={set} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sets;
