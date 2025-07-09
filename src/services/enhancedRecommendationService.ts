import { QuizData, GiftRecommendation } from '../types/quiz';
import { ProductService } from './productService';
import { PerplexityRecommender, AIRecommendationInput, ProductForAI } from './perplexityRecommender';

export class EnhancedRecommendationService {
  private productService: ProductService;
  private perplexityRecommender: PerplexityRecommender;

  constructor() {
    this.productService = new ProductService();
    this.perplexityRecommender = new PerplexityRecommender();
  }

  async getAIEnhancedRecommendations(quizData: QuizData): Promise<GiftRecommendation[]> {
    try {
      // Step 1: Get filtered products from database
      const allProducts = await this.productService.getProducts();
      const filteredProducts = this.filterProductsByProfile(allProducts, quizData);

      // Step 2: Check if AI is available
      if (!this.perplexityRecommender.isAvailable()) {
        console.warn('Perplexity API not available, falling back to standard recommendations');
        return this.getFallbackRecommendations(filteredProducts, quizData);
      }

      // Step 3: Convert to AI format
      const aiProfile = this.convertToAIProfile(quizData);
      const aiProducts = this.convertToAIProducts(filteredProducts);

      if (aiProducts.length === 0) {
        console.warn('No products available for AI analysis');
        return this.getFallbackRecommendations(filteredProducts, quizData);
      }

      // Step 4: Get AI recommendations
      const aiRecommendations = await this.perplexityRecommender.recommendWithAI(aiProfile, aiProducts);

      // Step 5: Convert back to GiftRecommendation format
      const giftRecommendations = await this.perplexityRecommender.convertToGiftRecommendations(
        aiRecommendations,
        aiProducts
      );

      // Step 6: Ensure we have at least 3 recommendations
      if (giftRecommendations.length < 3) {
        const fallbackRecs = this.getFallbackRecommendations(filteredProducts, quizData);
        const combined = [...giftRecommendations];
        
        // Add fallback recommendations that aren't already included
        for (const fallback of fallbackRecs) {
          if (!combined.find(rec => rec.name === fallback.name) && combined.length < 5) {
            combined.push(fallback);
          }
        }
        
        return combined;
      }

      return giftRecommendations;

    } catch (error) {
      console.error('Error getting AI-enhanced recommendations:', error);
      
      // Fallback to standard recommendations
      const allProducts = await this.productService.getProducts();
      const filteredProducts = this.filterProductsByProfile(allProducts, quizData);
      return this.getFallbackRecommendations(filteredProducts, quizData);
    }
  }

  private convertToAIProfile(quizData: QuizData): AIRecommendationInput {
    const emotionalAnswer = quizData.answers.find(a => a.questionId === 'emotional')?.answer;
    const surpriseAnswer = quizData.answers.find(a => a.questionId === 'surprise')?.answer;

    return {
      relationship: quizData.recipientProfile.relationship,
      personality: quizData.recipientProfile.personality,
      occasion: quizData.recipientProfile.occasion,
      budget_range: quizData.recipientProfile.budget,
      emotional_tags: [
        emotionalAnswer,
        surpriseAnswer,
        ...quizData.recipientProfile.interests
      ].filter(Boolean) as string[],
      age: quizData.recipientProfile.age,
      interests: quizData.recipientProfile.interests
    };
  }

  private convertToAIProducts(products: any[]): ProductForAI[] {
    return products.map(product => ({
      name: product.name,
      price_brl: product.price_brl,
      affiliate_link: product.affiliate_link,
      image_url: product.image_url,
      emotional_tags: product.emotional_tags || [],
      personality_match: product.personality_match || [],
      relationship_types: product.relationship_types || [],
      occasion_tags: product.occasion_tags || [],
      source: product.source || 'unknown',
      description: product.description
    }));
  }

  private filterProductsByProfile(products: any[], quizData: QuizData): any[] {
    const { recipientProfile } = quizData;
    
    return products.filter(product => {
      // Budget filter
      const budgetMatch = this.checkBudgetMatch(product.price_brl, recipientProfile.budget);
      if (!budgetMatch) return false;

      // Basic filters
      if (!product.is_active || product.stock_status !== 'available') return false;

      // Scoring for relevance
      let score = 0;

      // Relationship match
      if (product.relationship_types?.includes(recipientProfile.relationship)) {
        score += 25;
      }

      // Age match
      if (product.age_range?.includes(recipientProfile.age)) {
        score += 15;
      }

      // Personality match
      if (product.personality_match?.includes(recipientProfile.personality)) {
        score += 20;
      }

      // Occasion match
      if (product.occasion_tags?.includes(recipientProfile.occasion)) {
        score += 15;
      }

      // Interest/emotional tag fuzzy matching
      const allUserTags = [
        ...recipientProfile.interests,
        quizData.answers.find(a => a.questionId === 'emotional')?.answer,
        quizData.answers.find(a => a.questionId === 'surprise')?.answer
      ].filter(Boolean).map(tag => tag?.toLowerCase());

      const productTags = (product.emotional_tags || []).map((tag: string) => tag.toLowerCase());
      
      let tagMatches = 0;
      allUserTags.forEach(userTag => {
        productTags.forEach(productTag => {
          if (userTag?.includes(productTag) || productTag.includes(userTag || '')) {
            tagMatches++;
          }
        });
      });

      score += Math.min(tagMatches * 5, 20);

      // Only include products with some relevance
      return score >= 10;
    })
    .sort((a, b) => {
      // Sort by priority and rating
      const aPriority = a.priority || 0;
      const bPriority = b.priority || 0;
      const aRating = a.rating || 5;
      const bRating = b.rating || 5;
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      return bRating - aRating;
    })
    .slice(0, 15); // Limit to 15 products for AI analysis
  }

  private checkBudgetMatch(price: number, budgetRange: string): boolean {
    const budgetRanges: Record<string, { min: number; max: number }> = {
      'Até R$ 50': { min: 0, max: 50 },
      'R$ 51 - R$ 150': { min: 51, max: 150 },
      'R$ 151 - R$ 300': { min: 151, max: 300 },
      'R$ 301 - R$ 500': { min: 301, max: 500 },
      'Acima de R$ 500': { min: 501, max: 10000 }
    };

    const range = budgetRanges[budgetRange];
    if (!range) return true; // If unknown range, include product

    return price >= range.min && price <= range.max;
  }

  private getFallbackRecommendations(products: any[], quizData: QuizData): GiftRecommendation[] {
    // Use top 3 filtered products as fallback
    const topProducts = products.slice(0, 3);
    
    return topProducts.map(product => 
      this.productService.convertToGiftRecommendation(product)
    );
  }

  // Test AI recommendations
  async testAIRecommendations(testProfile?: any): Promise<any> {
    if (testProfile) {
      // Use provided test profile
      const allProducts = await this.productService.getProducts();
      const filteredProducts = this.filterProductsByProfile(allProducts, testProfile);
      const aiProfile = this.convertToAIProfile(testProfile);
      const aiProducts = this.convertToAIProducts(filteredProducts);

      return await this.perplexityRecommender.recommendWithAI(aiProfile, aiProducts);
    } else {
      // Use built-in test
      return await this.perplexityRecommender.testRecommendation();
    }
  }

  // Get service status
  getServiceStatus(): {
    aiAvailable: boolean;
    productCount: Promise<number>;
    usageInfo: any;
  } {
    return {
      aiAvailable: this.perplexityRecommender.isAvailable(),
      productCount: this.productService.getProducts().then(products => products.length),
      usageInfo: this.perplexityRecommender.getUsageInfo()
    };
  }
}