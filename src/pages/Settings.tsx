import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { getTheme, setTheme, Theme } from "@/lib/theme";

const Settings = () => {
  const navigate = useNavigate();
  const [currentTheme, setCurrentTheme] = useState<Theme>(getTheme());

  const handleToggle = () => {
    const next: Theme = currentTheme === "dark" ? "light" : "dark";
    setCurrentTheme(next);
    setTheme(next);
  };

  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentTheme === "dark" ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-semibold">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  {currentTheme === "dark" ? "Dark theme enabled" : "Light theme enabled"}
                </p>
              </div>
            </div>
            <Switch checked={currentTheme === "dark"} onCheckedChange={handleToggle} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
