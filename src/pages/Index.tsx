import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import AppGenerator from "@/components/AppGenerator";

const Index = () => {
  const [currentView, setCurrentView] = useState<"landing" | "generator">("landing");
  const [generationData, setGenerationData] = useState<{
    prompt: string;
    image?: File;
  } | null>(null);

  const handleStartGeneration = (prompt: string, image?: File) => {
    setGenerationData({ prompt, image });
    setCurrentView("generator");
  };

  const handleBackToLanding = () => {
    setCurrentView("landing");
    setGenerationData(null);
  };

  if (currentView === "generator" && generationData) {
    return (
      <AppGenerator
        initialPrompt={generationData.prompt}
        initialImage={generationData.image}
        onBack={handleBackToLanding}
      />
    );
  }

  return (
    <LandingPage onStartGeneration={handleStartGeneration} />
  );
};

export default Index;
