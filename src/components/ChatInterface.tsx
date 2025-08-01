import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, User, Bot, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { GeneratedFile, AppState } from "./AppGenerator";
import { AIService } from "@/services/ai-service";
import { UnsplashService } from "@/services/unsplash-service";
import { TemplateService } from "@/services/template-service";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  image?: string;
  files?: GeneratedFile[];
}

interface ChatInterfaceProps {
  initialPrompt: string;
  initialImage?: File;
  provider: "gemini" | "openai" | "claude";
  model: string;
  onFilesGenerated: (files: GeneratedFile[]) => void;
  onProjectUpdate: (project: { name: string; description: string }) => void;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const ChatInterface = ({ 
  initialPrompt, 
  initialImage, 
  provider, 
  model,
  onFilesGenerated,
  onProjectUpdate,
  appState,
  setAppState
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const templateService = new TemplateService();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with the first message
    if (initialPrompt && messages.length === 0) {
      handleInitialGeneration();
    }
  }, [initialPrompt]);

  const handleInitialGeneration = async () => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: initialPrompt,
      timestamp: new Date(),
      image: initialImage ? URL.createObjectURL(initialImage) : undefined,
    };

    setMessages([userMessage]);
    await generateResponse(initialPrompt, initialImage);
  };

  const generateResponse = async (prompt: string, image?: File) => {
    setIsGenerating(true);
    setAppState(prev => ({ ...prev, isGenerating: true }));

    try {
      // Convert image to base64 if provided
      let imageBase64: string | undefined;
      if (image) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
          };
          reader.readAsDataURL(image);
        });
      }

      // Initialize AI service with Gemini (hardcoded for now)
      const aiService = new AIService(
        "AIzaSyCdN7JK1hpDaziMTfqY8V6GcYq00ufd-UI", // Gemini API key
        model,
        provider
      );

      // Initialize Unsplash service
      const unsplashService = new UnsplashService("LJRrYs6fCK-tsxV_Xx6azh4UWidQVlEQsmpnRkQqrgg");

      // Detect template and page type
      const isSinglePage = templateService.isSinglePage(prompt);
      const detectedTemplate = templateService.detectTemplateFromPrompt(prompt);
      
      // Generate app content
      const result = await aiService.generateApp(prompt, imageBase64);
      
      // Parse files from the response content
      let files = result.files || [];
      let cleanDescription = result.content;
      
      // Enhanced parsing to catch all file formats and clean description
      const fileRegex = /FILE:\s*([^\n]+)\n```(\w+)?\n([\s\S]*?)```/g;
      let match;
      const parsedFiles: GeneratedFile[] = [];
      
      while ((match = fileRegex.exec(result.content)) !== null) {
        const [fullMatch, path, language = 'text', fileContent] = match;
        parsedFiles.push({
          path: path.trim(),
          content: fileContent.trim(),
          language: language.toLowerCase()
        });
        // Remove the file block from the description
        cleanDescription = cleanDescription.replace(fullMatch, '');
      }
      
      // Use parsed files if we found any, otherwise use files from AI service
      if (parsedFiles.length > 0) {
        files = parsedFiles;
      } else if (result.files) {
        files = result.files;
      }
      
      // Clean up any remaining code blocks or file references from description
      cleanDescription = cleanDescription
        .replace(/```[\s\S]*?```/g, '') // Remove any remaining code blocks
        .replace(/FILE:\s*[^\n]+/g, '') // Remove any FILE: markers
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive newlines
        .trim();
      
      // If still no files generated, create a basic template
      if (files.length === 0) {
        files = [{
          path: "index.html",
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App</title>
    <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        body { 
            font-family: 'IBM Plex Sans', sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(135deg, #34bfc2, #F78D2B);
            min-height: 100vh;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 12px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        h1 { 
            color: #34bfc2; 
            font-family: 'Source Sans Pro', sans-serif;
            font-size: 2.5rem;
            margin-bottom: 20px;
        }
        .btn {
            background: linear-gradient(135deg, #34bfc2, #F78D2B);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-family: 'IBM Plex Sans', sans-serif;
            font-weight: 500;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Your Generated App</h1>
        <p>This app was generated based on your prompt: "${prompt}"</p>
        <button class="btn" onclick="alert('Hello from your WebMeccano generated app!')">Try it out!</button>
    </div>
</body>
</html>`,
          language: "html"
        }];
      }

      // Try to fetch relevant images from Unsplash and inject them
      try {
        const searchTerms = unsplashService.generateSearchTerms(prompt);
        const images = await unsplashService.searchImages(searchTerms[0], 6);
        
        if (images.length > 0) {
          // Inject images into HTML files
          files = files.map(file => {
            if (file.path.endsWith('.html') && file.content.includes('<body')) {
              let updatedContent = file.content;
              
              // Replace placeholder image URLs with Unsplash images
              const placeholderPatterns = [
                /https:\/\/via\.placeholder\.com\/[\d]+x?[\d]*[^"']*/g,
                /https:\/\/images\.unsplash\.com\/[^"']*/g,
                /placeholder\.(jpg|jpeg|png|gif)/gi,
                /image\d*\.(jpg|jpeg|png|gif)/gi
              ];
              
              let imageIndex = 0;
              placeholderPatterns.forEach(pattern => {
                updatedContent = updatedContent.replace(pattern, () => {
                  if (imageIndex < images.length) {
                    return images[imageIndex++ % images.length].url;
                  }
                  return images[0].url;
                });
              });
              
              // If no placeholders found, try to inject images into common patterns
              if (updatedContent === file.content && images.length > 0) {
                // Add hero background image
                updatedContent = updatedContent.replace(
                  /(background[^;]*:\s*)(url\([^)]*\)|[^;]*)(;|$)/gi,
                  `$1url('${images[0].url}')$3`
                );
                
                // Replace generic image sources
                updatedContent = updatedContent.replace(
                  /<img[^>]+src=["'][^"']*["']/gi,
                  (match) => {
                    if (imageIndex < images.length) {
                      return match.replace(/src=["'][^"']*["']/, `src="${images[imageIndex++ % images.length].url}"`);
                    }
                    return match;
                  }
                );
              }
              
              return { ...file, content: updatedContent };
            }
            return file;
          });
        }
      } catch (error) {
        console.warn("Failed to fetch images from Unsplash:", error);
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: cleanDescription || `I've generated your ${isSinglePage ? 'single-page' : 'multi-page'} ${detectedTemplate.name.toLowerCase()} based on your request! 

**Generated Files:**
${files.map(f => `- **${f.path}**: ${f.language.toUpperCase()} file`).join('\n')}

**Template Used:** ${detectedTemplate.name}
**Features included:**
${detectedTemplate.features.map(feature => `- ${feature}`).join('\n')}

**Features included:**
- Responsive design with WebMeccano branding
- Professional typography using Source Sans Pro and IBM Plex Sans  
- WebMeccano color scheme (#34bfc2 blue and #F78D2B orange)
- Interactive elements and modern styling
- Proper separation of HTML, CSS, and JavaScript

You can now view the live preview or edit the code. Ask me to make any changes you'd like!`,
        timestamp: new Date(),
        files
      };

      setMessages(prev => [...prev, assistantMessage]);
      onFilesGenerated(files);
      
      // Extract app name from prompt or use default
      const appName = prompt.match(/(?:create|build|make)\s+(?:a|an)?\s*([^.]+)/i)?.[1]?.trim() || detectedTemplate.name;
      
      onProjectUpdate({
        name: appName.charAt(0).toUpperCase() + appName.slice(1),
        description: prompt.slice(0, 100) + (prompt.length > 100 ? "..." : "")
      });

    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate app. Please check your API keys and try again.");
      
      // Show mock response as fallback
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I encountered an issue with the AI service. Here's a basic template to get you started:",
        timestamp: new Date(),
        files: [{
          path: "index.html",
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebMeccano App</title>
    <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        body { 
            font-family: 'IBM Plex Sans', sans-serif; 
            margin: 0; 
            background: linear-gradient(135deg, #34bfc2, #F78D2B);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .app { 
            background: white; 
            padding: 40px; 
            border-radius: 16px; 
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
        }
        h1 { 
            color: #34bfc2; 
            font-family: 'Source Sans Pro', sans-serif;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="app">
        <h1>WebMeccano App</h1>
        <p>Ready to build something amazing!</p>
    </div>
</body>
</html>`,
          language: "html"
        }]
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      onFilesGenerated(fallbackMessage.files!);
    } finally {
      setIsGenerating(false);
      setAppState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = currentMessage;
    setCurrentMessage("");

    // Check if this is an edit request and we have existing files
    if (appState.files.length > 0 && isEditRequest(messageToProcess)) {
      await handleEditRequest(messageToProcess);
    } else {
      await generateResponse(messageToProcess);
    }
  };
  
  const isEditRequest = (message: string): boolean => {
    const editKeywords = ['edit', 'change', 'modify', 'update', 'fix', 'adjust', 'add to', 'remove from'];
    return editKeywords.some(keyword => message.toLowerCase().includes(keyword));
  };
  
  const handleEditRequest = async (editPrompt: string) => {
    setIsGenerating(true);
    setAppState(prev => ({ ...prev, isGenerating: true }));
    
    try {
      const aiService = new AIService(
        "AIzaSyCdN7JK1hpDaziMTfqY8V6GcYq00ufd-UI",
        model,
        provider
      );
      
      // Create a context about current files for editing
      const filesContext = appState.files.map(f => `${f.path}:\n${f.content}`).join('\n\n---\n\n');
      const editPromptWithContext = `You are editing an existing web application. Here are the current files:

${filesContext}

USER REQUEST: ${editPrompt}

IMPORTANT: Only return the MODIFIED files that need changes. Do not regenerate unchanged files. Use the same FILE: format.`;

      const result = await aiService.generateApp(editPromptWithContext);
      
      // Parse the edited files
      let editedFiles: GeneratedFile[] = [];
      const fileRegex = /FILE:\s*([^\n]+)\n```(\w+)?\n([\s\S]*?)```/g;
      let match;
      
      while ((match = fileRegex.exec(result.content)) !== null) {
        const [, path, language = 'text', fileContent] = match;
        editedFiles.push({
          path: path.trim(),
          content: fileContent.trim(),
          language: language.toLowerCase()
        });
      }
      
      // Update existing files with edits
      if (editedFiles.length > 0) {
        setAppState(prev => ({
          ...prev,
          files: prev.files.map(existingFile => {
            const editedFile = editedFiles.find(ef => ef.path === existingFile.path);
            return editedFile || existingFile;
          })
        }));
        
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: `I've updated the following files based on your request:

${editedFiles.map(f => `- **${f.path}**: Modified`).join('\n')}

The changes have been applied to your existing app. You can see the updates in the live preview!`,
          timestamp: new Date(),
          files: editedFiles
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error("No files were generated for the edit request");
      }
      
    } catch (error) {
      console.error("Edit error:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I had trouble processing your edit request. Could you be more specific about what you'd like to change?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
      setAppState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-orange text-orange-foreground"
              }`}>
                {message.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-title font-medium text-sm">
                    {message.role === "user" ? "You" : "AI Assistant"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                
                <Card className="p-4">
                  {message.image && (
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground font-body">
                          Uploaded image
                        </span>
                      </div>
                      <img 
                        src={message.image} 
                        alt="Uploaded" 
                        className="max-w-sm rounded-lg border"
                      />
                    </div>
                  )}
                  
                  <div className="font-body whitespace-pre-wrap">{message.content}</div>
                  
                  {message.files && message.files.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium font-body">Generated Files:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {message.files.map((file) => (
                          <Badge key={file.path} variant="secondary" className="font-body">
                            {file.path}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          ))}
          
          {isGenerating && (
            <div className="flex space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange text-orange-foreground flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <Card className="p-4">
                  <div className="flex items-center space-x-2 text-muted-foreground font-body">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating your app...
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to modify the app or add new features..."
            className="font-body min-h-[60px] resize-none"
            disabled={isGenerating}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isGenerating}
            size="lg"
            className="px-6 font-body"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;