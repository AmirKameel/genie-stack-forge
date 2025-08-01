// AI Service for handling different providers
import { TemplateService, WebsiteTemplate } from './template-service';

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
  private templateService: TemplateService;

  constructor(apiKey: string, model: string, provider: "gemini" | "openai" | "claude") {
    this.apiKey = apiKey;
    this.model = model;
    this.provider = provider;
    this.templateService = new TemplateService();
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
    // Detect if this is single page or multi-page and get appropriate template
    const isSinglePage = this.templateService.isSinglePage(prompt);
    const template = this.templateService.detectTemplateFromPrompt(prompt);
    
    let systemPrompt: string;
    
    if (isSinglePage) {
      systemPrompt = this.getSinglePageSystemPrompt(prompt);
    } else {
      systemPrompt = this.getMultiPageSystemPrompt(prompt, template);
    }

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
  
  private getSinglePageSystemPrompt(prompt: string): string {
    return `You are WebMeccano, an expert full-stack web developer. Generate a complete, production-ready SINGLE PAGE web application based on user requirements.

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

SINGLE PAGE STRUCTURE:
- Hero section with compelling headline
- Features/benefits section
- Testimonials or social proof
- Call-to-action sections
- Contact information
- Footer

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

Generate a complete, functional single-page web application for: ${prompt}`;
  }
  
  private getMultiPageSystemPrompt(prompt: string, template: WebsiteTemplate): string {
    const systemPrompt = `You are WebMeccano, an expert full-stack web developer. Generate complete, production-ready web applications based on user requirements.

CRITICAL INSTRUCTIONS FOR FILE GENERATION:
1. ALWAYS generate multiple files (HTML, CSS, JS) for complete applications
2. NEVER include code in the description - ALL CODE must be in separate files
3. Use EXACT file marking format: "FILE: filename.ext" followed by triple backticks with language
4. Always create separate CSS files for styling, never inline styles in HTML (except for critical styles)
5. Create separate JavaScript files for functionality when needed

MULTI-PAGE WEBSITE TEMPLATE: ${template.name}
Template Description: ${template.description}
Template Category: ${template.category}

REQUIRED PAGES TO GENERATE:
${template.pages.map(page => `- ${page.name} (${page.filename}): ${page.sections.join(', ')}`).join('\n')}

SHARED STYLES TEMPLATE:
Create a shared.css file with the following base structure and expand upon it:
${template.sharedStyles}

IMPORTANT DESIGN GUIDELINES:
1. Always use WebMeccano brand colors: #34bfc2 (blue) and #F78D2B (orange)
2. Use fonts: 'Source Sans Pro' for headings, 'IBM Plex Sans' for body text
3. Create responsive, modern designs with proper CSS styling
4. Include interactive elements and functionality
5. Make apps visually appealing and professional
6. Use modern CSS features like flexbox, grid, and animations

MULTI-PAGE REQUIREMENTS:
1. Create a consistent navigation header across all pages
2. Generate a shared.css file for common styles
3. Each page should have its own HTML file
4. Include proper internal linking between pages
5. Maintain consistent branding and design across all pages
6. Add appropriate meta tags and titles for each page
7. Include a professional footer on all pages

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

FILE: shared.css
\`\`\`css
body { ... }
\`\`\`

FILE: about.html
\`\`\`html
<!DOCTYPE html>
<html>...
\`\`\`

FILE: script.js
\`\`\`javascript
document.addEventListener('DOMContentLoaded', function() {
  // functionality here
});
\`\`\`

Generate a complete, functional multi-page web application for: ${prompt}`;
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
    const fileRegex = /FILE:\s*([^\n\r]+)[\n\r]+```(\w+)?[\n\r]+([\s\S]*?)```/g;
    let match;
    
    while ((match = fileRegex.exec(content)) !== null) {
      const [fullMatch, path, language = 'text', fileContent] = match;
      files.push({
        path: path.trim(),
        content: fileContent.trim(),
        language: language.toLowerCase()
      });
    }
    
    // Remove ALL file blocks and code blocks from content to get clean description
    let description = content
      .replace(/FILE:\s*[^\n\r]+[\n\r]+```[\w]*[\n\r]+[\s\S]*?```/g, '') // Remove FILE blocks
      .replace(/```[\s\S]*?```/g, '') // Remove any remaining code blocks
      .replace(/^\s*[\n\r]+/gm, '') // Remove empty lines at start
      .replace(/[\n\r]{3,}/g, '\n\n') // Reduce multiple newlines
      .trim();
    
    // If description is too short or mostly technical, provide a better one
    if (description.length < 50 || description.match(/^(Generated Files?:?|Here|The)/i)) {
      description = files.length > 0 
        ? `I've generated ${files.length} file${files.length > 1 ? 's' : ''} for your application with all the requested features and styling.`
        : '';
    }
    
    return {
      content: description,
      files
    };
  }
}