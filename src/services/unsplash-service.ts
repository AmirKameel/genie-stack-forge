// Unsplash service for fetching relevant images
export interface UnsplashImage {
  id: string;
  url: string;
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
        url: photo.urls.regular,
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
        url: photo.urls.regular,
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
}