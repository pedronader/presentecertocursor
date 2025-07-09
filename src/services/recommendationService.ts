import { QuizData, GiftRecommendation } from '../types/quiz';

export class RecommendationService {
  private supabaseUrl: string;
  private supabaseAnonKey: string;

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      throw new Error('Supabase environment variables are required');
    }
  }

  async getRecommendationsBySessionId(sessionId: string): Promise<GiftRecommendation[]> {
    try {
      const functionUrl = `${this.supabaseUrl}/functions/v1/generate-recommendations`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
        },
        body: JSON.stringify({
          quiz_session_id: sessionId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message);
      }

      return this.formatRecommendations(result.recommendations);
    } catch (error) {
      console.error('Error getting recommendations by session ID:', error);
      throw error;
    }
  }

  async getRecommendationsByProfile(quizData: QuizData): Promise<GiftRecommendation[]> {
    try {
      const functionUrl = `${this.supabaseUrl}/functions/v1/generate-recommendations`;
      
      const payload = {
        relationship: quizData.recipientProfile.relationship,
        age: quizData.recipientProfile.age,
        personality: quizData.recipientProfile.personality,
        interests: quizData.recipientProfile.interests,
        occasion: quizData.recipientProfile.occasion,
        budget: quizData.recipientProfile.budget,
        emotional: quizData.answers.find(a => a.questionId === 'emotional')?.answer,
        surprise: quizData.answers.find(a => a.questionId === 'surprise')?.answer
      };

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message);
      }

      return this.formatRecommendations(result.recommendations);
    } catch (error) {
      console.error('Error getting recommendations by profile:', error);
      throw error;
    }
  }

  private formatRecommendations(recommendations: any[]): GiftRecommendation[] {
    return recommendations.map(rec => {
      // Process image URL to handle different formats and sources
      let imageUrl = this.processImageUrl(rec.image_url);

      return {
        id: rec.id,
        name: rec.name,
        price: rec.price,
        image: imageUrl,
        description: rec.description,
        emotionalExplanation: rec.emotional_explanation,
        affiliateLink: rec.affiliate_link,
        category: 'geral' // Default category
      };
    });
  }

  private processImageUrl(url: string | null): string {
    // If no URL provided, return default
    if (!url) {
      return this.getDefaultImage();
    }

    // Clean and validate URL
    const cleanUrl = url.trim();
    
    // Check if it's a valid URL
    if (!this.isValidImageUrl(cleanUrl)) {
      return this.getDefaultImage();
    }

    // Handle Mercado Livre images specifically
    if (cleanUrl.includes('mlstatic.com')) {
      // Try to convert webp to jpg for better compatibility
      if (cleanUrl.includes('.webp')) {
        const jpgUrl = cleanUrl.replace('.webp', '.jpg');
        return jpgUrl;
      }
    }

    return cleanUrl;
  }

  private isValidImageUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private getDefaultImage(): string {
    return 'https://images.pexels.com/photos/264985/pexels-photo-264985.jpeg?auto=compress&cs=tinysrgb&w=400';
  }

  async testRecommendations(testInput: any): Promise<any> {
    try {
      const functionUrl = `${this.supabaseUrl}/functions/v1/generate-recommendations`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
        },
        body: JSON.stringify(testInput),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error testing recommendations:', error);
      throw error;
    }
  }
}