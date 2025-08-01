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
2. MANDATORY: Create at least one CSS file (style.css or styles.css) for ALL styling
3. NEVER include ANY code in the description - ALL CODE must be in separate files using the FILE format
4. Use EXACT file marking format: "FILE: filename.ext" followed by triple backticks with language
5. Always create separate CSS files for styling, never inline styles in HTML
6. Create separate JavaScript files for functionality when needed
7. For multi-page websites, create ALL necessary files including shared CSS files
8. NEVER put CSS code in the chat response - it must be in separate .css files
9. NEVER include any code snippets, CSS rules, or technical syntax in your description
10. Keep your description brief and non-technical - just explain what you built
11. MANDATORY: Every website MUST have at least one .css file with complete styling

IMPORTANT DESIGN GUIDELINES:
1. Always use WebMeccano brand colors: #34bfc2 (blue) and #F78D2B (orange)
2. Use fonts: 'Source Sans Pro' for headings, 'IBM Plex Sans' for body text
3. Create responsive, modern designs with proper CSS styling
4. Include interactive elements and functionality
5. Make apps visually appealing and professional
6. Use modern CSS features like flexbox, grid, and animations

REQUIRED RESPONSE FORMAT:
1. Start with a brief, simple description of what you built (NO CODE, NO TECHNICAL DETAILS, NO CSS)
2. Then generate ALL files using this EXACT format:

FILE: filename.ext
\`\`\`language
file content here
\`\`\`

CRITICAL: 
- Every single piece of code must be inside a FILE block
- Do not include any code outside of FILE blocks
- Do not include CSS rules, selectors, or any technical syntax in your description
- Keep description simple and user-friendly
- MANDATORY: Always generate at least one CSS file with complete styling
- For multi-page sites, create a shared CSS file that all pages link to

EXAMPLE:
Description: I've created a modern website with multiple pages and professional styling.

FILE: index.html
\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="styles.css">
</head>
<body>...</body>
</html>
\`\`\`

FILE: styles.css
\`\`\`css
body { ... }
/* Complete styling here */
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
    
    // Enhanced regex to catch all file formats
    const fileRegex = /FILE:\s*([^\n\r]+)[\n\r]*```(\w+)?[\n\r]+([\s\S]*?)```/g;
    let match;
    
    while ((match = fileRegex.exec(content)) !== null) {
      const [fullMatch, path, language = 'text', fileContent] = match;
      files.push({
        path: path.trim(),
        content: fileContent.trim(),
        language: language.toLowerCase()
      });
    }
    
    // Remove ALL file blocks, code blocks, and any remaining code from content
    let description = content
      .replace(/FILE:\s*[^\n\r]+[\n\r]*```[\w]*[\n\r]+[\s\S]*?```/g, '') // Remove FILE blocks
      .replace(/```[\s\S]*?```/g, '') // Remove any remaining code blocks
      .replace(/```[\w]*[\s\S]*?```/g, '') // Remove code blocks without closing
      .replace(/```[\w]*[\s\S]*$/g, '') // Remove unclosed code blocks at end
      .replace(/###\s*/g, '') // Remove markdown headers
      .replace(/\*\*\*/g, '') // Remove markdown separators
      .replace(/^\s*[\n\r]+/gm, '') // Remove empty lines at start
      .replace(/[\n\r]{3,}/g, '\n\n') // Reduce multiple newlines
      .replace(/Generated Files?:?[\s\S]*$/i, '') // Remove "Generated Files" section
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove CSS comments
      .replace(/\{[\s\S]*?\}/g, '') // Remove CSS rule blocks
      .replace(/[.#][\w-]+[\s\S]*?(?=\n|$)/g, '') // Remove CSS selectors
      .replace(/--[\w-]+:\s*[^;]+;/g, '') // Remove CSS variables
      .replace(/:root\s*\{[\s\S]*?\}/g, '') // Remove :root blocks
      .replace(/\*\s*\{[\s\S]*?\}/g, '') // Remove universal selector blocks
      .replace(/html\s*\{[\s\S]*?\}/g, '') // Remove html selector blocks
      .replace(/body\s*\{[\s\S]*?\}/g, '') // Remove body selector blocks
      .trim();
    
    // If description is too short, mostly technical, or contains code remnants, provide a better one
    if (description.length < 30 || description.match(/^(Generated Files?:?|Here|The|###|:root|body|html|\.|#)/i) || description.includes('{') || description.includes('}')) {
      description = files.length > 0 
        ? `I've created a complete application with ${files.length} file${files.length > 1 ? 's' : ''} including all the requested features and professional styling.`
        : 'Application generated successfully.';
    }
    
    // Ensure we have at least one CSS file for styling
    const hasCssFile = files.some(file => file.path.endsWith('.css'));
    if (!hasCssFile && files.length > 0) {
      console.warn('No CSS file detected in generated files. This may cause styling issues.');
    }
    
    return {
      content: description,
      files
    };
  }
}