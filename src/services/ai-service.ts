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
      
      return this.parseResponse(content, template, isSinglePage);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate with Gemini API');
    }
  }
  
  private getSinglePageSystemPrompt(prompt: string): string {
    return `You are an expert full-stack web developer specializing in creating stunning, modern web applications. Generate a complete, production-ready SINGLE PAGE web application using inline Tailwind CSS and JavaScript.

CRITICAL INSTRUCTIONS FOR FILE GENERATION:
1. Generate ONLY HTML files with ALL styling and JavaScript INLINE
2. Use Tailwind CSS for ALL styling - create beautiful, modern designs
3. Include stunning animations, hover effects, and transitions
4. NEVER include code in the description - ALL CODE must be in separate files
5. Use EXACT file marking format: "FILE: filename.ext" followed by triple backticks with language

DESIGN EXCELLENCE REQUIREMENTS:
1. Use Tailwind CSS exclusively for styling - NO external CSS files
2. Create visually stunning designs with:
   - Beautiful gradients and color schemes
   - Smooth animations and micro-interactions
   - Modern card layouts and components
   - Responsive grid systems
   - Professional typography and spacing
3. Include interactive elements:
   - Hover effects on buttons and cards
   - Smooth scroll animations
   - Loading animations
   - Form validation with visual feedback
   - Mobile-responsive navigation
4. Use modern design patterns:
   - Hero sections with compelling visuals
   - Feature cards with icons
   - Testimonials and social proof
   - Call-to-action sections
   - Professional footers

TAILWIND CSS GUIDELINES:
- Use utility classes for everything: bg-gradient-to-r, text-xl, shadow-lg, etc.
- Include animations: animate-pulse, animate-bounce, transition-all
- Use responsive prefixes: sm:, md:, lg:, xl:
- Create beautiful color combinations with opacity: bg-blue-500/20
- Add proper spacing and typography: space-y-6, text-gray-600

JAVASCRIPT REQUIREMENTS (if needed):
- Include ALL JavaScript inline within <script> tags
- Add smooth scrolling, form handling, animations
- Use modern ES6+ syntax
- Create interactive features like modals, dropdowns, carousels

REQUIRED RESPONSE FORMAT:
1. Start with a brief description of what you built (no code)
2. Then generate ALL files using this EXACT format:

FILE: filename.ext
\`\`\`language
file content here
\`\`\`

Generate a complete, stunning single-page web application for: ${prompt}`;
  }
  
  private getMultiPageSystemPrompt(prompt: string, template: WebsiteTemplate): string {
    return `You are an expert full-stack web developer specializing in creating stunning, modern web applications. Generate a complete, production-ready MULTI-PAGE web application using inline Tailwind CSS and JavaScript.

CRITICAL INSTRUCTIONS FOR FILE GENERATION:
1. Generate ONLY HTML files with ALL styling and JavaScript INLINE
2. Use Tailwind CSS for ALL styling - create beautiful, modern designs
3. Include stunning animations, hover effects, and transitions
4. NEVER include code in the description - ALL CODE must be in separate files
5. Use EXACT file marking format: "FILE: filename.ext" followed by triple backticks with language

DESIGN EXCELLENCE REQUIREMENTS:
1. Use Tailwind CSS exclusively for styling - NO external CSS files
2. Create visually stunning designs with:
   - Beautiful gradients and color schemes
   - Smooth animations and micro-interactions
   - Modern card layouts and components
   - Responsive grid systems
   - Professional typography and spacing
3. Include interactive elements:
   - Hover effects on buttons and cards
   - Smooth scroll animations
   - Loading animations
   - Form validation with visual feedback
   - Mobile-responsive navigation
4. Use modern design patterns:
   - Hero sections with compelling visuals
   - Feature cards with icons
   - Testimonials and social proof
   - Call-to-action sections
   - Professional footers

MULTI-PAGE REQUIREMENTS:
1. Create consistent navigation header across all pages using Tailwind
2. Each page should be a complete HTML file with inline Tailwind styles
3. Include proper internal linking between pages
4. Maintain consistent branding and design across all pages
5. Add appropriate meta tags and titles for each page
6. Include professional footer on all pages
7. Ensure mobile responsiveness on all pages

TAILWIND CSS GUIDELINES:
- Use utility classes for everything: bg-gradient-to-r, text-xl, shadow-lg, etc.
- Include animations: animate-pulse, animate-bounce, transition-all, duration-300
- Use responsive prefixes: sm:, md:, lg:, xl:
- Create beautiful color combinations with opacity: bg-blue-500/20
- Add proper spacing and typography: space-y-6, text-gray-600
- Use hover states: hover:bg-blue-600, hover:scale-105, hover:shadow-xl

JAVASCRIPT REQUIREMENTS (if needed):
- Include ALL JavaScript inline within <script> tags in each HTML file
- Add smooth scrolling, form handling, animations
- Use modern ES6+ syntax
- Create interactive features like modals, dropdowns, carousels
- Ensure mobile menu functionality

REQUIRED RESPONSE FORMAT:
1. Start with a brief description of what you built (no code)
2. Then generate ALL files using this EXACT format:

FILE: filename.ext
\`\`\`language
file content here
\`\`\`

Generate a complete, stunning ${template.name.toLowerCase()} for: ${prompt}`;
  }

  private async generateWithOpenAI(prompt: string, imageBase64?: string): Promise<AIResponse> {
    // OpenAI implementation would go here
    throw new Error('OpenAI provider not implemented yet');
  }

  private async generateWithClaude(prompt: string, imageBase64?: string): Promise<AIResponse> {
    // Claude implementation would go here
    throw new Error('Claude provider not implemented yet');
  }

  private parseResponse(content: string, template: WebsiteTemplate, isSinglePage: boolean): AIResponse {
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
    
    // Create a better description based on template
    if (description.length < 50 || description.match(/^(Generated Files?:?|Here|The)/i)) {
      description = `I've generated a complete ${isSinglePage ? 'single-page' : 'multi-page'} ${template.name.toLowerCase()} based on your request!

**Template Used:** ${template.name}
**Category:** ${template.category}
**Generated Files:** ${files.length} files

**Features Included:**
${template.features.map(feature => `- ${feature}`).join('\n')}

**Pages Generated:**
${isSinglePage ? '- Single responsive page with all sections' : template.pages.map(page => `- **${page.name}** (${page.filename}): ${page.sections.join(', ')}`).join('\n')}

The application uses WebMeccano's signature colors (#34bfc2 blue and #F78D2B orange) with professional typography (Source Sans Pro for headings, IBM Plex Sans for body text). All files are properly structured with responsive design and modern styling.

You can now view the live preview or edit the code. Ask me to make any changes you'd like!`;
    }
    
    return {
      content: description,
      files
    };
  }
}