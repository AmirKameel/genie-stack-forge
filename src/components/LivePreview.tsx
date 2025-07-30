import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react";
import { GeneratedFile } from "./AppGenerator";

interface LivePreviewProps {
  files: GeneratedFile[];
}

type DeviceMode = "desktop" | "tablet" | "mobile";

const LivePreview = ({ files }: LivePreviewProps) => {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const htmlFile = files.find(f => f.path.endsWith('.html') || f.path === 'index.html');
  const cssFiles = files.filter(f => f.path.endsWith('.css'));
  const jsFiles = files.filter(f => f.path.endsWith('.js'));

  useEffect(() => {
    updatePreview();
  }, [files]);

  const updatePreview = () => {
    if (!iframeRef.current || !htmlFile) return;

    setIsLoading(true);

    // Create a complete HTML document
    let htmlContent = htmlFile.content;

    // Inject CSS files
    cssFiles.forEach(cssFile => {
      const styleTag = `<style>${cssFile.content}</style>`;
      if (htmlContent.includes('</head>')) {
        htmlContent = htmlContent.replace('</head>', `${styleTag}\n</head>`);
      } else {
        htmlContent = styleTag + htmlContent;
      }
    });

    // Inject JS files
    jsFiles.forEach(jsFile => {
      const scriptTag = `<script>${jsFile.content}</script>`;
      if (htmlContent.includes('</body>')) {
        htmlContent = htmlContent.replace('</body>', `${scriptTag}\n</body>`);
      } else {
        htmlContent = htmlContent + scriptTag;
      }
    });

    // Add responsive meta tag if not present
    if (!htmlContent.includes('viewport')) {
      const metaTag = '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
      if (htmlContent.includes('<head>')) {
        htmlContent = htmlContent.replace('<head>', `<head>\n${metaTag}`);
      } else {
        htmlContent = `<!DOCTYPE html><html><head>${metaTag}</head><body>${htmlContent}</body></html>`;
      }
    }

    // Write to iframe
    const iframe = iframeRef.current;
    iframe.srcdoc = htmlContent;

    iframe.onload = () => {
      setIsLoading(false);
    };
  };

  const handleRefresh = () => {
    updatePreview();
  };

  const handleOpenInNewTab = () => {
    if (!htmlFile) return;
    
    const blob = new Blob([iframeRef.current?.srcdoc || htmlFile.content], { 
      type: 'text/html' 
    });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const getDeviceStyles = () => {
    switch (deviceMode) {
      case "mobile":
        return "w-[375px] h-[667px]";
      case "tablet":
        return "w-[768px] h-[1024px]";
      default:
        return "w-full h-full";
    }
  };

  const getDeviceIcon = (mode: DeviceMode) => {
    switch (mode) {
      case "mobile":
        return Smartphone;
      case "tablet":
        return Tablet;
      default:
        return Monitor;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center space-x-3">
          <h3 className="font-title font-medium">Live Preview</h3>
          {files.length > 0 && (
            <Badge variant="secondary" className="font-body">
              {files.length} file{files.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Device Mode Selector */}
          <div className="flex items-center border rounded-md">
            {(["desktop", "tablet", "mobile"] as DeviceMode[]).map((mode) => {
              const Icon = getDeviceIcon(mode);
              return (
                <Button
                  key={mode}
                  variant={deviceMode === mode ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setDeviceMode(mode)}
                  className="rounded-none first:rounded-l-md last:rounded-r-md px-3 font-body"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="font-body"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInNewTab}
            disabled={!htmlFile}
            className="font-body"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-4 bg-muted/10">
        {htmlFile ? (
          <div className="h-full flex items-center justify-center">
            <Card className={`${getDeviceStyles()} border-2 overflow-hidden bg-white shadow-lg`}>
              {isLoading && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                    <p className="font-body text-sm text-muted-foreground">Loading preview...</p>
                  </div>
                </div>
              )}
              <iframe
                ref={iframeRef}
                className={`w-full h-full border-0 ${isLoading ? 'hidden' : 'block'}`}
                title="Live Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </Card>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Monitor className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-title font-medium mb-2">No HTML file found</h3>
              <p className="font-body text-sm text-muted-foreground max-w-md">
                Generate an app with HTML content to see the live preview here.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground font-body">
        {htmlFile ? (
          <span>Previewing: {htmlFile.path}</span>
        ) : (
          <span>No preview available</span>
        )}
        {deviceMode !== "desktop" && (
          <span className="ml-4">• {deviceMode} view</span>
        )}
      </div>
    </div>
  );
};

export default LivePreview;