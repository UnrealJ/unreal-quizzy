import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe } from "lucide-react";

const PublicSets = () => {
  const navigate = useNavigate();

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
          <h1 className="text-3xl font-bold mb-2">Public Sets</h1>
          <p className="text-primary-foreground/80">
            Browse sets shared by the community
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-16 text-center">
        <Globe className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No public sets yet</h2>
        <p className="text-muted-foreground">
          Check back later — community sets will appear here.
        </p>
      </div>
    </div>
  );
};

export default PublicSets;
