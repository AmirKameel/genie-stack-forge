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
    
    // Generate initial response
    const initialResponse = await this.generateInitialResponse(prompt, imageBase64, isSinglePage, template);
    
    // Check if response is complete and auto-complete if needed
    const completeResponse = await this.ensureCompleteResponse(initialResponse, prompt, isSinglePage, template);
    
    return this.parseResponse(completeResponse, template, isSinglePage);
  }

  private async generateInitialResponse(prompt: string, imageBase64: string | undefined, isSinglePage: boolean, template: WebsiteTemplate): Promise<string> {
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
      
      return content;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate with Gemini API');
    }
  }

  private async ensureCompleteResponse(initialContent: string, prompt: string, isSinglePage: boolean, template: WebsiteTemplate): Promise<string> {
    // Check if the response seems incomplete
    if (this.isResponseIncomplete(initialContent)) {
      console.log('Response appears incomplete, attempting to complete...');
      
      // Extract the last few lines to understand where it cut off
      const lines = initialContent.split('\n');
      const lastLines = lines.slice(-10).join('\n');
      
      // Create completion prompt
      const completionPrompt = `You are continuing a web development response that was cut off. Here are the last few lines:

${lastLines}

CRITICAL INSTRUCTIONS:
1. Continue EXACTLY from where the previous response ended
2. Complete ALL remaining HTML/CSS/JavaScript code
3. Ensure all tags are properly closed
4. Do NOT repeat any existing code
5. Do NOT include any description text - ONLY code
6. Use the same FILE: format for any new files needed

Continue and complete the response:`;

      try {
        const completionResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: completionPrompt }]
            }],
            generationConfig: {
              temperature: 0.3,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            }
          })
        });

        if (completionResponse.ok) {
          const completionData = await completionResponse.json();
          const completionContent = completionData.candidates[0].content.parts[0].text;
          
          // Merge the responses
          return initialContent + '\n' + completionContent;
        }
      } catch (error) {
        console.error('Completion request failed:', error);
      }
    }
    
    return initialContent;
  }

  private isResponseIncomplete(content: string): boolean {
    // Check for common signs of incomplete responses
    const incompleteSigns = [
      // HTML not properly closed
      /<[^>]*$/,  // Tag not closed at end
      /```[^`]*$/,  // Code block not closed
      // JavaScript/CSS not completed
      /function\s+\w+\s*\([^)]*\)\s*\{[^}]*$/,  // Unclosed function
      /\{\s*$/,  // Hanging opening brace
      // Common cutoff patterns
      /class="[^"]*$/,  // Unclosed class attribute
      /style="[^"]*$/,  // Unclosed style attribute
      /\s+$/, // Ends with whitespace (often a sign of cutoff)
    ];

    // Check if content ends abruptly
    const lastLine = content.trim().split('\n').pop() || '';
    
    // Look for incomplete patterns
    for (const pattern of incompleteSigns) {
      if (pattern.test(lastLine)) {
        return true;
      }
    }

    // Check if HTML tags are balanced
    const htmlTagMatches = content.match(/<\/?[^>]+>/g) || [];
    const openTags = htmlTagMatches.filter(tag => !tag.startsWith('</')).length;
    const closeTags = htmlTagMatches.filter(tag => tag.startsWith('</')).length;
    
    // If there's a significant imbalance, it's likely incomplete
    if (openTags - closeTags > 3) {
      return true;
    }

    // Check for incomplete code blocks
    const codeBlockCount = (content.match(/```/g) || []).length;
    return false;
  }
  
  private getMultiPageSystemPrompt(prompt: string, template: WebsiteTemplate): string {
    return `You are an expert full-stack web developer specializing in creating stunning, modern web applications. Generate a complete, production-ready MULTI-PAGE web application using inline Tailwind CSS and JavaScript.

CRITICAL INSTRUCTIONS FOR FILE GENERATION:
1. Generate ONLY HTML files with ALL styling and JavaScript INLINE
2. Use Tailwind CSS CDN for ALL styling - create beautiful, modern designs
3. Include stunning animations, hover effects, and transitions
4. NEVER include code in the description - ALL CODE must be in separate files
5. Use EXACT file marking format: "FILE: filename.ext" followed by triple backticks with language

DESIGN EXCELLENCE REQUIREMENTS:
1. ALWAYS include Tailwind CSS CDN in every HTML head: <script src="https://cdn.tailwindcss.com"></script>
2. Create visually stunning designs with:
   - Beautiful gradients: bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600
   - Smooth animations and micro-interactions: hover:scale-105 transition-all duration-300
   - Modern card layouts with shadows: bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl
   - Responsive grid systems: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
   - Professional typography: font-bold text-4xl md:text-6xl tracking-tight
3. Include interactive elements:
   - Hover effects: hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600
   - Form validation with visual feedback
   - Mobile-responsive navigation with hamburger menu
4. Use modern design patterns:
   - Hero sections with full-screen backgrounds and gradients
   - Feature cards with icons and hover effects
   - Testimonials with profile images
   - Call-to-action sections with gradient buttons
REQUIRED HTML STRUCTURE FOR EACH PAGE:
MULTI-PAGE REQUIREMENTS:
1. Create consistent navigation header across all pages using Tailwind
2. Each page should be a complete HTML file with Tailwind CDN included
3. Include proper internal linking between pages
7. Ensure mobile responsiveness on all pages

TAILWIND CSS GUIDELINES:
- Use utility classes for everything: bg-gradient-to-r, text-xl, shadow-lg
- Include animations: animate-pulse, animate-bounce, transition-all duration-300
- Use responsive prefixes: sm:, md:, lg:, xl:, 2xl:
- Create beautiful color combinations: bg-slate-900, text-white, bg-white/10
- Add proper spacing: space-y-8, px-6, py-12, mx-auto
- Create interactive features like modals, dropdowns, carousels
- Add scroll animations and intersection observers

REQUIRED RESPONSE FORMAT:
FILE: index.html
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body>
    <!-- Your beautiful website content here -->
</body>
</html>
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
    
    // Enhanced regex to catch all file formats and handle incomplete responses
    const fileRegex = /FILE:\s*([^\n\r]+)[\n\r]+```(\w+)?[\n\r]+([\s\S]*?)(?=```|$)/g;
    let match;
    
    while ((match = fileRegex.exec(content)) !== null) {
      const [fullMatch, path, language = 'html', fileContent] = match;
      
      // Clean up the file content
      let cleanContent = fileContent
        .replace(/```\s*$/, '') // Remove trailing backticks
        .replace(/^\s+|\s+$/g, '') // Trim whitespace
        .replace(/\n\s*$/, ''); // Remove trailing newlines
      
      // Only add non-empty files
      if (cleanContent && path) {
        files.push({
          path: path.trim(),
          content: cleanContent,
          language: language.toLowerCase() || 'html'
        });
      }
    }
    
    // If no files found, try alternative parsing methods
    if (files.length === 0) {
      // Try to find HTML content even without FILE: markers
      const simpleFileRegex = /```html\s*([\s\S]*?)(?:```|$)/g;
      let htmlMatch;
      let fileIndex = 0;
      
      while ((htmlMatch = simpleFileRegex.exec(content)) !== null) {
        const [fullMatch, fileContent] = htmlMatch;
        const fileName = fileIndex === 0 ? 'index.html' : 
                        fileIndex === 1 ? 'about.html' : 
                        fileIndex === 2 ? 'contact.html' : 
                        `page${fileIndex + 1}.html`;
        
        files.push({
          path: fileName,
          content: fileContent.replace(/^\s+|\s+$/g, ''),
          language: 'html'
        });
        fileIndex++;
      }
    }
    
    // COMPLETELY remove ALL code from description - this is critical
    let description = content
      .replace(/FILE:\s*[^\n\r]+[\n\r]+```[\w]*[\n\r]+[\s\S]*?(?:```|$)/g, '') // Remove FILE blocks
      .replace(/```[\s\S]*?(?:```|$)/g, '') // Remove ALL code blocks
      .replace(/^\s*[\n\r]+/gm, '') // Remove empty lines
      .replace(/[\n\r]{3,}/g, '\n\n') // Reduce multiple newlines
      .replace(/Generated Files?:?[\s\S]*$/i, '') // Remove "Generated Files" sections
      .replace(/\*\*Generated Files?\*\*[\s\S]*$/i, '') // Remove markdown file lists
      .replace(/- \*\*[^*]+\*\*:[\s\S]*$/gm, '') // Remove file descriptions
      .trim();
    
    // Ensure description has NO code and is clean
    if (description.length < 50 || description.includes('```') || description.includes('FILE:') || description.match(/^(Generated Files?:?|Here|The)/i)) {
      description = `I've generated a complete ${isSinglePage ? 'single-page' : 'multi-page'} website based on your request!

**Template Used:** ${template.name}
**Files Generated:** ${files.length} ${files.length === 1 ? 'file' : 'files'}

**Features Included:**
${template.features.map(feature => `- ${feature}`).join('\n')}
- WebMeccano branding with custom colors (#34bfc2 blue, #F78D2B orange)
- Responsive design that works on all devices
- Modern animations and interactive elements
- Professional typography using Source Sans Pro and IBM Plex Sans

You can now view the live preview or edit the code in the Code Editor. All styling and JavaScript is included inline for easy customization!`;
    }
    
    return {
      content: description,
      files
    };
  }
}