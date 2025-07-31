// AI Service for handling different providers
export interface AIResponse {
  content: string;
  files?: Array<{
    path: string;
    content: string;
    language: string;
  }>;
}

export class AIService {
  private apiKey: string;
  private model: string;
  private provider: "gemini" | "openai" | "claude";

  constructor(apiKey: string, model: string, provider: "gemini" | "openai" | "claude") {
    this.apiKey = apiKey;
    this.model = model;
    this.provider = provider;
  }

  async generateApp(prompt: string, imageBase64?: string): Promise<AIResponse> {
    switch (this.provider) {
      case "gemini":
        return this.generateWithGemini(prompt, imageBase64);
      case "openai":
        return this.generateWithOpenAI(prompt, imageBase64);
      case "claude":
        return this.generateWithClaude(prompt, imageBase64);
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  private async generateWithGemini(prompt: string, imageBase64?: string): Promise<AIResponse> {
    const systemPrompt = `You are WebMeccano, an expert full-stack web developer. Generate complete, production-ready web applications based on user requirements.

CRITICAL INSTRUCTIONS FOR FILE GENERATION:
1. ALWAYS generate multiple files (HTML, CSS, JS) for complete applications
2. NEVER include code in the description - ALL CODE must be in separate files
3. Use EXACT file marking format: "FILE: filename.ext" followed by triple backticks with language
4. Always create separate CSS files for styling, never inline styles in HTML (except for critical styles)
5. Create separate JavaScript files for functionality when needed

IMPORTANT DESIGN GUIDELINES:
1. Always use WebMeccano brand colors: #34bfc2 (blue) and #F78D2B (orange)
2. Use fonts: 'Source Sans Pro' for headings, 'IBM Plex Sans' for body text
3. Create responsive, modern designs with proper CSS styling
4. Include interactive elements and functionality
5. Make apps visually appealing and professional
6. Use modern CSS features like flexbox, grid, and animations

REQUIRED RESPONSE FORMAT:
1. Start with a brief description of what you built (no code)
2. Then generate ALL files using this EXACT format:

FILE: filename.ext
\`\`\`language
file content here
\`\`\`

EXAMPLE:
FILE: index.html
\`\`\`html
<!DOCTYPE html>
<html>...
\`\`\`

FILE: style.css
\`\`\`css
body { ... }
\`\`\`

FILE: script.js
\`\`\`javascript
document.addEventListener('DOMContentLoaded', function() {
  // functionality here
});
\`\`\`

Generate a complete, functional web application for: ${prompt}`;

    const parts: any[] = [{ text: systemPrompt }];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64
        }
      });
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: parts
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      
      return this.parseResponse(content);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate with Gemini API');
    }
  }

  private async generateWithOpenAI(prompt: string, imageBase64?: string): Promise<AIResponse> {
    // OpenAI implementation would go here
    throw new Error('OpenAI provider not implemented yet');
  }

  private async generateWithClaude(prompt: string, imageBase64?: string): Promise<AIResponse> {
    // Claude implementation would go here
    throw new Error('Claude provider not implemented yet');
  }

  private parseResponse(content: string): AIResponse {
    const files: Array<{ path: string; content: string; language: string }> = [];
    
    // Parse files from the response
    const fileRegex = /FILE:\s*([^\n]+)\n```(\w+)?\n([\s\S]*?)```/g;
    let match;
    
    while ((match = fileRegex.exec(content)) !== null) {
      const [, path, language = 'text', fileContent] = match;
      files.push({
        path: path.trim(),
        content: fileContent.trim(),
        language: language.toLowerCase()
      });
    }
    
    // Remove file blocks from content to get the description
    const description = content.replace(fileRegex, '').trim();
    
    return {
      content: description,
      files
    };
  }
}