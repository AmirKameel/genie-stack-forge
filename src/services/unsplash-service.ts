// Unsplash service for fetching relevant images
export interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  description: string;
  alt_description: string;
  width: number;
  height: number;
  download_url: string;
}

export class UnsplashService {
  private accessKey: string;

  constructor(accessKey: string) {
    this.accessKey = accessKey;
  }

  async searchImages(query: string, count: number = 10): Promise<UnsplashImage[]> {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${this.accessKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.results.map((photo: any) => ({
        id: photo.id,
        urls: {
          regular: photo.urls.regular,
          small: photo.urls.small,
          thumb: photo.urls.thumb,
        },
        description: photo.description || photo.alt_description || '',
        alt_description: photo.alt_description || '',
        width: photo.width,
        height: photo.height,
        download_url: photo.links.download_location,
      }));
    } catch (error) {
      console.error('Unsplash API error:', error);
      throw new Error('Failed to fetch images from Unsplash');
    }
  }

  async getRandomImages(count: number = 10): Promise<UnsplashImage[]> {
    try {
      const response = await fetch(
        `https://api.unsplash.com/photos/random?count=${count}&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${this.accessKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.statusText}`);
      }

      const data = await response.json();
      const photos = Array.isArray(data) ? data : [data];
      
      return photos.map((photo: any) => ({
        id: photo.id,
        urls: {
          regular: photo.urls.regular,
          small: photo.urls.small,
          thumb: photo.urls.thumb,
        },
        description: photo.description || photo.alt_description || '',
        alt_description: photo.alt_description || '',
        width: photo.width,
        height: photo.height,
        download_url: photo.links.download_location,
      }));
    } catch (error) {
      console.error('Unsplash API error:', error);
      throw new Error('Failed to fetch random images from Unsplash');
    }
  }

  // Generate relevant search terms based on app description
  generateSearchTerms(appDescription: string): string[] {
    const terms = [];
    
    // Extract key words from the description
    const keywords = appDescription.toLowerCase().match(/\b\w+\b/g) || [];
    
    // Common app-related terms
    const appTerms = ['dashboard', 'website', 'interface', 'design', 'technology', 'business'];
    
    // Add specific terms based on content
    if (keywords.some(k => ['shop', 'store', 'ecommerce', 'buy', 'sell'].includes(k))) {
      terms.push('ecommerce', 'shopping', 'retail');
    }
    
    if (keywords.some(k => ['blog', 'article', 'news', 'content'].includes(k))) {
      terms.push('writing', 'journalism', 'content');
    }
    
    if (keywords.some(k => ['portfolio', 'gallery', 'photo', 'image'].includes(k))) {
      terms.push('photography', 'portfolio', 'creative');
    }
    
    if (keywords.some(k => ['dashboard', 'admin', 'management', 'analytics'].includes(k))) {
      terms.push('dashboard', 'analytics', 'business');
    }

    if (keywords.some(k => ['game', 'play', 'fun', 'entertainment'].includes(k))) {
      terms.push('gaming', 'entertainment', 'fun');
    }

    // Default terms if no specific matches
    if (terms.length === 0) {
      terms.push(...appTerms);
    }
    
    return terms.slice(0, 3); // Return top 3 terms
  }
  
  // Inject images into HTML content
  injectImagesIntoHTML(htmlContent: string, images: UnsplashImage[]): string {
    if (images.length === 0) return htmlContent;
    
    let modifiedHTML = htmlContent;
    
    // Try to inject hero image
    if (images[0]) {
      const heroImageUrl = `${images[0].urls.regular}&w=1200&h=600&fit=crop`;
      
      // Look for existing hero sections or main content areas
      const heroPatterns = [
        /<div[^>]*class="[^"]*hero[^"]*"[^>]*>/gi,
        /<section[^>]*class="[^"]*hero[^"]*"[^>]*>/gi,
        /<div[^>]*class="[^"]*banner[^"]*"[^>]*>/gi,
        /<header[^>]*>/gi
      ];
      
      let heroInjected = false;
      for (const pattern of heroPatterns) {
        if (pattern.test(modifiedHTML) && !heroInjected) {
          modifiedHTML = modifiedHTML.replace(pattern, (match) => {
            heroInjected = true;
            return `${match}
          <div style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${heroImageUrl}'); background-size: cover; background-position: center; min-height: 400px; display: flex; align-items: center; justify-content: center;">`;
          });
          
          // Close the background div after the next closing div
          let divsClosed = 0;
          modifiedHTML = modifiedHTML.replace(/<\/div>/g, (match) => {
            if (heroInjected && divsClosed === 0) {
              divsClosed++;
              return '</div></div>';
            }
            return match;
          });
        }
      }
      
      // If no hero section found, inject at the top of body
      if (!heroInjected) {
        modifiedHTML = modifiedHTML.replace(/<body[^>]*>/i, (match) => {
          return `${match}
        <div style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${heroImageUrl}'); background-size: cover; background-position: center; min-height: 300px; display: flex; align-items: center; justify-content: center; color: white; text-align: center;">
          <div style="max-width: 800px; padding: 40px 20px;">
            <h1 style="font-size: 3rem; margin-bottom: 20px; font-weight: bold;">Welcome</h1>
            <p style="font-size: 1.2rem; opacity: 0.9;">Discover amazing possibilities</p>
          </div>
        </div>`;
        });
      }
    }
    
    // Inject additional images into gallery or content sections
    if (images.length > 1) {
      const additionalImages = images.slice(1, 4); // Use up to 3 more images
      
      // Look for image placeholders or content sections
      additionalImages.forEach((image, index) => {
        const imageUrl = `${image.urls.regular}&w=800&h=400&fit=crop`;
        const patterns = [
          /<img[^>]*src="[^"]*placeholder[^"]*"[^>]*>/gi,
          /<div[^>]*class="[^"]*gallery[^"]*"[^>]*>/gi,
          /<div[^>]*class="[^"]*features[^"]*"[^>]*>/gi,
          /<div[^>]*class="[^"]*content[^"]*"[^>]*>/gi
        ];
        
        if (patterns[index] && patterns[index].test(modifiedHTML)) {
          modifiedHTML = modifiedHTML.replace(patterns[index], (match) => {
            if (match.includes('<img')) {
              return `<img src="${imageUrl}" alt="${image.alt_description || 'Featured image'}" style="width: 100%; height: auto; border-radius: 8px;">`;
            } else {
              return `${match}
            <img src="${imageUrl}" alt="${image.alt_description || 'Featured image'}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin: 20px 0;">`;
            }
          });
        }
      });
    }
    
    return modifiedHTML;
  }
}