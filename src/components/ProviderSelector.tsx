import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Sparkles } from "lucide-react";

interface ProviderSelectorProps {
  selectedProvider: "gemini" | "openai" | "claude";
  selectedModel: string;
  onProviderChange: (provider: "gemini" | "openai" | "claude") => void;
  onModelChange: (model: string) => void;
}

const providers = {
  gemini: {
    name: "Google Gemini",
    icon: Brain,
    models: ["gemini-2.5-pro", "gemini-1.5-pro", "gemini-1.5-flash"],
    color: "text-blue-600"
  },
  openai: {
    name: "OpenAI",
    icon: Zap,
    models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
    color: "text-green-600"
  },
  claude: {
    name: "Anthropic Claude",
    icon: Sparkles,
    models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    color: "text-purple-600"
  }
};

const ProviderSelector = ({ 
  selectedProvider, 
  selectedModel, 
  onProviderChange, 
  onModelChange 
}: ProviderSelectorProps) => {
  const currentProvider = providers[selectedProvider];
  const Icon = currentProvider.icon;

  const handleProviderChange = (value: string) => {
    const provider = value as "gemini" | "openai" | "claude";
    onProviderChange(provider);
    // Set default model for the new provider
    onModelChange(providers[provider].models[0]);
  };

  return (
    <div className="flex items-center space-x-2">
      <Badge variant="outline" className="font-body">
        <Icon className={`h-3 w-3 mr-1 ${currentProvider.color}`} />
        {currentProvider.name}
      </Badge>
      
      <Select value={selectedProvider} onValueChange={handleProviderChange}>
        <SelectTrigger className="w-32 font-body">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(providers).map(([key, provider]) => {
            const ProviderIcon = provider.icon;
            return (
              <SelectItem key={key} value={key} className="font-body">
                <div className="flex items-center">
                  <ProviderIcon className={`h-4 w-4 mr-2 ${provider.color}`} />
                  {provider.name}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-40 font-body">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {currentProvider.models.map((model) => (
            <SelectItem key={model} value={model} className="font-body">
              {model}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProviderSelector;