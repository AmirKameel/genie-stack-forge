import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Copy, Save, FileCode } from "lucide-react";
import { toast } from "sonner";
import { GeneratedFile } from "./AppGenerator";

interface CodeEditorProps {
  file: GeneratedFile;
  onContentChange: (content: string) => void;
}

const CodeEditor = ({ file, onContentChange }: CodeEditorProps) => {
  const [content, setContent] = useState(file.content);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setContent(file.content);
    setHasUnsavedChanges(false);
  }, [file]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(newContent !== file.content);
  };

  const handleSave = () => {
    onContentChange(content);
    setHasUnsavedChanges(false);
    toast.success("File saved successfully!");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Code copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  const getLanguageColor = (language: string) => {
    switch (language.toLowerCase()) {
      case "html":
        return "bg-orange-100 text-orange-800";
      case "css":
        return "bg-blue-100 text-blue-800";
      case "javascript":
      case "js":
        return "bg-yellow-100 text-yellow-800";
      case "typescript":
      case "ts":
        return "bg-blue-100 text-blue-800";
      case "json":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center space-x-3">
          <FileCode className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="font-title font-medium">{file.path}</h3>
            <div className="flex items-center space-x-2">
              <Badge 
                variant="secondary" 
                className={`text-xs font-body ${getLanguageColor(file.language)}`}
              >
                {file.language.toUpperCase()}
              </Badge>
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-xs font-body">
                  Unsaved changes
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="font-body"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          
          <Button
            variant={hasUnsavedChanges ? "default" : "outline"}
            size="sm"
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="font-body"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4">
        <Card className="h-full">
          <Textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="h-full min-h-[400px] font-mono text-sm border-0 resize-none focus-visible:ring-0"
            placeholder="Edit your code here..."
            spellCheck={false}
          />
        </Card>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground font-body">
        Lines: {content.split('\n').length} | Characters: {content.length}
        {hasUnsavedChanges && (
          <span className="ml-4 text-orange-600">• Unsaved changes</span>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;