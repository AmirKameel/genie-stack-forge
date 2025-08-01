import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import ChatInterface from "./ChatInterface";
import CodeEditor from "./CodeEditor";
import LivePreview from "./LivePreview";
import ProviderSelector from "./ProviderSelector";
import WebMeccanoLogo from "./WebMeccanoLogo";
import { ArrowLeft, Settings, Play } from "lucide-react";

interface AppGeneratorProps {
  initialPrompt: string;
  initialImage?: File;
  onBack: () => void;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface AppState {
  files: GeneratedFile[];
  currentProject: {
    name: string;
    description: string;
  } | null;
  isGenerating: boolean;
}

const AppGenerator = ({ initialPrompt, initialImage, onBack }: AppGeneratorProps) => {
  const [appState, setAppState] = useState<AppState>({
    files: [],
    currentProject: null,
    isGenerating: false,
  });

  const [selectedProvider, setSelectedProvider] = useState<"gemini" | "openai" | "claude">("gemini");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-pro");
  const [activeTab, setActiveTab] = useState("preview");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleFileGenerated = (files: GeneratedFile[]) => {
    setAppState(prev => ({
      ...prev,
      files: files, // Replace all files with new generation
    }));
    
    // Auto-select the first file if none selected
    if (!selectedFile && files.length > 0) {
      setSelectedFile(files[0].path);
    }
    
    // Switch to preview after generation
    if (files.length > 0) {
      setActiveTab("preview");
    }
  };

  const handleProjectUpdate = (project: { name: string; description: string }) => {
    setAppState(prev => ({
      ...prev,
      currentProject: project,
    }));
  };

  const updateFileContent = (path: string, content: string) => {
    setAppState(prev => ({
      ...prev,
      files: prev.files.map(file => 
        file.path === path ? { ...file, content } : file
      ),
    }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="font-body"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="h-6 w-px bg-border" />
            
            <WebMeccanoLogo className="h-8" />
            
            {appState.currentProject && (
              <>
                <div className="h-6 w-px bg-border" />
                <div>
                  <h1 className="font-title font-semibold">{appState.currentProject.name}</h1>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <ProviderSelector
              selectedProvider={selectedProvider}
              selectedModel={selectedModel}
              onProviderChange={setSelectedProvider}
              onModelChange={setSelectedModel}
            />
            
            <Badge variant="secondary" className="font-body">
              {appState.files.length} files
            </Badge>
            
            <Button size="sm" variant="outline" className="font-body">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Chat */}
        <div className="w-1/2 border-r flex flex-col">
          <div className="border-b px-4 py-3">
            <h2 className="font-title font-semibold">Chat & Generation</h2>
          </div>
          
          <div className="flex-1">
            <ChatInterface
              initialPrompt={initialPrompt}
              initialImage={initialImage}
              provider={selectedProvider}
              model={selectedModel}
              onFilesGenerated={handleFileGenerated}
              onProjectUpdate={handleProjectUpdate}
              appState={appState}
              setAppState={setAppState}
            />
          </div>
        </div>

        {/* Right Panel - Code & Preview */}
        <div className="w-1/2 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b px-4 py-0">
              <TabsList className="font-body">
                <TabsTrigger value="preview" className="font-body">Live Preview</TabsTrigger>
                <TabsTrigger value="code" className="font-body">Code Editor</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="preview" className="flex-1 m-0">
              <LivePreview files={appState.files} />
            </TabsContent>

            <TabsContent value="code" className="flex-1 flex flex-col m-0">
              <div className="flex-1 flex">
                {/* File Explorer */}
                <div className="w-64 border-r bg-muted/30">
                  <div className="p-4 border-b">
                    <h3 className="font-title font-medium text-sm">Project Files</h3>
                  </div>
                  
                  <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                      {appState.files.map((file) => (
                        <Button
                          key={file.path}
                          variant={selectedFile === file.path ? "secondary" : "ghost"}
                          size="sm"
                          className="w-full justify-start font-body text-sm"
                          onClick={() => setSelectedFile(file.path)}
                        >
                          {file.path}
                        </Button>
                      ))}
                      
                      {appState.files.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground font-body text-sm">
                          No files generated yet
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Code Editor */}
                <div className="flex-1">
                  {selectedFile ? (
                    <CodeEditor
                      file={appState.files.find(f => f.path === selectedFile)!}
                      onContentChange={(content) => updateFileContent(selectedFile, content)}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground font-body">
                      Select a file to edit
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AppGenerator;