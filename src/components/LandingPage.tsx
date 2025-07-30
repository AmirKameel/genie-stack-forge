import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Sparkles, Code, Zap } from "lucide-react";
import WebMeccanoLogo from "./WebMeccanoLogo";

interface LandingPageProps {
  onStartGeneration: (prompt: string, image?: File) => void;
}

const LandingPage = ({ onStartGeneration }: LandingPageProps) => {
  const [prompt, setPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() || uploadedImage) {
      onStartGeneration(prompt, uploadedImage || undefined);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      setUploadedImage(files[0]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 flex flex-col items-center justify-center p-6">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="flex items-center justify-center mb-8">
          <WebMeccanoLogo className="h-16 mr-4" />
        </div>
        
        <h1 className="font-title text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-orange bg-clip-text text-transparent">
          Build Apps with AI
        </h1>
        
        <p className="font-body text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Generate full-stack web applications in seconds. Just describe what you want to build, 
          or upload a screenshot for inspiration.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="flex flex-col items-center p-6 rounded-lg bg-card shadow-sm">
            <Sparkles className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-title font-semibold mb-2">AI-Powered</h3>
            <p className="font-body text-sm text-muted-foreground">Advanced AI generates complete applications</p>
          </div>
          <div className="flex flex-col items-center p-6 rounded-lg bg-card shadow-sm">
            <Code className="h-8 w-8 text-orange mb-3" />
            <h3 className="font-title font-semibold mb-2">Full-Stack</h3>
            <p className="font-body text-sm text-muted-foreground">Frontend, backend, and database included</p>
          </div>
          <div className="flex flex-col items-center p-6 rounded-lg bg-card shadow-sm">
            <Zap className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-title font-semibold mb-2">Instant Preview</h3>
            <p className="font-body text-sm text-muted-foreground">See your app come to life in real-time</p>
          </div>
        </div>
      </div>

      {/* Main Input Form */}
      <div className="w-full max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the app you want to build... (e.g., 'Create a todo app with user authentication' or 'Build an e-commerce store for selling books')"
              className="font-body min-h-[120px] text-lg border-2 border-primary/20 focus:border-primary shadow-elegant resize-none"
            />
          </div>

          {/* Image Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : uploadedImage
                ? "border-green-500 bg-green-50"
                : "border-muted-foreground/30 hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center">
              {uploadedImage ? (
                <div className="space-y-3">
                  <div className="text-green-600 font-medium">
                    ✓ Image uploaded: {uploadedImage.name}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUploadedImage(null)}
                    className="font-body"
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div className="font-body">
                    <p className="text-lg font-medium mb-1">Upload a screenshot for inspiration</p>
                    <p className="text-sm text-muted-foreground">
                      Drag and drop an image here, or{" "}
                      <label className="text-primary cursor-pointer hover:underline">
                        browse files
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={!prompt.trim() && !uploadedImage}
            className="w-full font-title text-lg h-14 bg-gradient-to-r from-primary to-orange hover:from-primary-hover hover:to-orange-hover shadow-elegant"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Generate App
          </Button>
        </form>

        <div className="text-center mt-8">
          <p className="font-body text-sm text-muted-foreground">
            Powered by advanced AI models • Multiple providers supported
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;