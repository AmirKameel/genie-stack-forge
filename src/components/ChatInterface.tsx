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

      // Generate app content
      const result = await aiService.generateApp(prompt, imageBase64);
      
      // Parse files from the response content
      let files = result.files || [];
      let cleanDescription = result.content;
      
      // Additional parsing in case the AI service parsing didn't catch everything
      if (files.length === 0) {
        const fileRegex = /FILE:\s*([^\n]+)\n```(\w+)?\n([\s\S]*?)```/g;
        let match;
        
        while ((match = fileRegex.exec(result.content)) !== null) {
          const [fullMatch, path, language = 'text', fileContent] = match;
          files.push({
            path: path.trim(),
            content: fileContent.trim(),
            language: language.toLowerCase()
          });
          // Remove the file block from the description
          cleanDescription = cleanDescription.replace(fullMatch, '');
        }
      }
      
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

      // Try to fetch relevant images from Unsplash
      try {
        const searchTerms = unsplashService.generateSearchTerms(prompt);
        const images = await unsplashService.searchImages(searchTerms[0], 3);
        
        if (images.length > 0) {
          // You could inject images into the generated HTML here
          console.log("Found relevant images:", images);
        }
      } catch (error) {
        console.warn("Failed to fetch images from Unsplash:", error);
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: cleanDescription.trim() || `I've generated your app based on your request! Here's what I created:

${files.map(f => `- **${f.path}**: ${f.language.toUpperCase()} file`).join('\n')}

The app includes:
- Responsive design with WebMeccano branding
- Professional typography using Source Sans Pro and IBM Plex Sans
- WebMeccano color scheme (#34bfc2 blue and #F78D2B orange)
- Interactive elements and modern styling

You can now edit the code or ask me to make changes!`,
        timestamp: new Date(),
        files
      };

      setMessages(prev => [...prev, assistantMessage]);
      onFilesGenerated(files);
      
      // Extract app name from prompt or use default
      const appName = prompt.match(/(?:create|build|make)\s+(?:a|an)?\s*([^.]+)/i)?.[1]?.trim() || "Generated App";
      
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

    await generateResponse(messageToProcess);
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