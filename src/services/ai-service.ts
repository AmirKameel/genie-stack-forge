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
2. Use Tailwind CSS CDN for ALL styling - create beautiful, modern designs
3. Include stunning animations, hover effects, and transitions
4. NEVER include code in the description - ALL CODE must be in separate files
5. Use EXACT file marking format: "FILE: filename.ext" followed by triple backticks with language

DESIGN EXCELLENCE REQUIREMENTS:
1. ALWAYS include Tailwind CSS CDN in the HTML head: <script src="https://cdn.tailwindcss.com"></script>
2. Create visually stunning designs with:
   - Beautiful gradients: bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600
   - Smooth animations and micro-interactions: hover:scale-105 transition-all duration-300
   - Modern card layouts with shadows: bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl
   - Responsive grid systems: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
   - Professional typography: font-bold text-4xl md:text-6xl tracking-tight
3. Include interactive elements:
   - Hover effects: hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600
   - Smooth scroll animations: scroll-smooth
   - Loading animations: animate-pulse, animate-bounce, animate-spin
   - Form validation with visual feedback
   - Mobile-responsive navigation with hamburger menu
4. Use modern design patterns:
   - Hero sections with full-screen backgrounds and gradients
   - Feature cards with icons and hover effects
   - Testimonials with profile images
   - Call-to-action sections with gradient buttons
   - Professional footers with social links

REQUIRED HTML STRUCTURE:
- Always include: <!DOCTYPE html>, proper meta tags, and viewport
- Include Google Fonts for typography: <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
- Use semantic HTML5 elements: header, nav, main, section, footer
- Ensure mobile-first responsive design

TAILWIND CSS GUIDELINES:
- Use utility classes for everything: bg-gradient-to-r, text-xl, shadow-lg
- Include animations: animate-pulse, animate-bounce, transition-all duration-300
- Use responsive prefixes: sm:, md:, lg:, xl:, 2xl:
- Create beautiful color combinations: bg-slate-900, text-white, bg-white/10
- Add proper spacing: space-y-8, px-6, py-12, mx-auto
- Use backdrop blur effects: backdrop-blur-lg, backdrop-blur-sm

JAVASCRIPT REQUIREMENTS (if needed):
- Include ALL JavaScript inline within <script> tags at bottom of body
- Add smooth scrolling, form handling, mobile menu toggles
- Use modern ES6+ syntax with const/let
- Create interactive features like modals, dropdowns, carousels
- Add scroll animations and intersection observers

REQUIRED RESPONSE FORMAT:
1. Start with a brief description of what you built (no code)
2. Then generate ALL files using this EXACT format:

FILE: index.html
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Website Title</title>
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

Generate a complete, stunning single-page web application for: ${prompt}`;
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
   - Smooth scroll animations: scroll-smooth
   - Loading animations: animate-pulse, animate-bounce, animate-spin
   - Form validation with visual feedback
   - Mobile-responsive navigation with hamburger menu
4. Use modern design patterns:
   - Hero sections with full-screen backgrounds and gradients
   - Feature cards with icons and hover effects
   - Testimonials with profile images
   - Call-to-action sections with gradient buttons
   - Professional footers with social links

REQUIRED HTML STRUCTURE FOR EACH PAGE:
- Always include: <!DOCTYPE html>, proper meta tags, and viewport
- Include Google Fonts for typography: <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
- Use semantic HTML5 elements: header, nav, main, section, footer
- Ensure mobile-first responsive design

MULTI-PAGE REQUIREMENTS:
1. Create consistent navigation header across all pages using Tailwind
2. Each page should be a complete HTML file with Tailwind CDN included
3. Include proper internal linking between pages
4. Maintain consistent branding and design across all pages
5. Add appropriate meta tags and titles for each page
6. Include professional footer on all pages
7. Ensure mobile responsiveness on all pages

TAILWIND CSS GUIDELINES:
- Use utility classes for everything: bg-gradient-to-r, text-xl, shadow-lg
- Include animations: animate-pulse, animate-bounce, transition-all duration-300
- Use responsive prefixes: sm:, md:, lg:, xl:, 2xl:
- Create beautiful color combinations: bg-slate-900, text-white, bg-white/10
- Add proper spacing: space-y-8, px-6, py-12, mx-auto
- Use backdrop blur effects: backdrop-blur-lg, backdrop-blur-sm

JAVASCRIPT REQUIREMENTS (if needed):
- Include ALL JavaScript inline within <script> tags at bottom of each HTML body
- Add smooth scrolling, form handling, mobile menu toggles
- Use modern ES6+ syntax with const/let
- Create interactive features like modals, dropdowns, carousels
- Add scroll animations and intersection observers

REQUIRED RESPONSE FORMAT:
1. Start with a brief description of what you built (no code)
2. Then generate ALL files using this EXACT format:

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