import { QuizData, GiftRecommendation } from '../types/quiz';

export interface AIRecommendationInput {
  relationship: string;
  personality: string;
  occasion: string;
  budget_range: string;
  emotional_tags: string[];
  age?: string;
  interests?: string[];
}

export interface ProductForAI {
  name: string;
  price_brl: number;
  affiliate_link: string;
  image_url: string;
  emotional_tags: string[];
  personality_match: string[];
  relationship_types: string[];
  occasion_tags: string[];
  source: string;
  description?: string;
}

export interface AIRecommendationResponse {
  product: string;
  reason: string;
  emotional_score?: number;
}

export interface PerplexityResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class PerplexityRecommender {
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai/chat/completions';
  private model = 'sonar';
  private maxProducts = 15;
  private maxTokens = 1000;

  constructor() {
    this.apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
    if (!this.apiKey) {
      console.warn('VITE_PERPLEXITY_API_KEY not found. AI recommendations will be disabled.');
    }
  }

  async recommendWithAI(
    profile: AIRecommendationInput,
    products: ProductForAI[]
  ): Promise<AIRecommendationResponse[]> {
    if (!this.apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    try {
      // Limit products to avoid token overflow
      const limitedProducts = products.slice(0, this.maxProducts);

      // Create the prompt
      const systemPrompt = this.createSystemPrompt();
      const userPrompt = this.createUserPrompt(profile, limitedProducts);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: this.maxTokens,
          temperature: 0.7,
          top_p: 0.9
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
      }

      const data: PerplexityResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No recommendations received from Perplexity API');
      }

      const content = data.choices[0].message.content;
      return this.parseAIResponse(content, limitedProducts);

    } catch (error) {
      console.error('Error calling Perplexity API:', error);
      throw error;
    }
  }

  private createSystemPrompt(): string {
    return `Você é um especialista em recomendação de presentes personalizados com profundo conhecimento em psicologia emocional e relacionamentos humanos.

Sua missão é analisar o perfil emocional de uma pessoa e uma lista de produtos disponíveis para sugerir os 3 presentes mais adequados.

CRITÉRIOS DE ANÁLISE:
1. Compatibilidade emocional com a personalidade
2. Adequação ao tipo de relacionamento
3. Relevância para a ocasião
4. Impacto emocional positivo
5. Valor simbólico do presente

FORMATO DE RESPOSTA (JSON válido):
[
  {
    "product": "Nome exato do produto da lista",
    "reason": "Explicação emocional de 1-2 frases sobre por que é perfeito",
    "emotional_score": 95
  }
]

REGRAS:
- Use APENAS produtos da lista fornecida
- Nomes dos produtos devem ser EXATOS
- Explicações devem ser calorosas e pessoais
- Foque no impacto emocional, não apenas nas características
- Ordene por relevância emocional (maior score primeiro)
- Retorne exatamente 3 recomendações`;
  }

  private createUserPrompt(profile: AIRecommendationInput, products: ProductForAI[]): string {
    const profileText = `
PERFIL DA PESSOA:
- Relacionamento: ${profile.relationship}
- Personalidade: ${profile.personality}
- Ocasião: ${profile.occasion}
- Orçamento: ${profile.budget_range}
- Tags emocionais: ${profile.emotional_tags.join(', ')}
${profile.age ? `- Idade: ${profile.age}` : ''}
${profile.interests ? `- Interesses: ${profile.interests.join(', ')}` : ''}

PRODUTOS DISPONÍVEIS:`;

    const productsText = products.map((product, index) => {
      const price = `R$ ${product.price_brl.toFixed(2).replace('.', ',')}`;
      const tags = product.emotional_tags.length > 0 ? ` (Tags: ${product.emotional_tags.join(', ')})` : '';
      const personality = product.personality_match.length > 0 ? ` (Personalidade: ${product.personality_match.join(', ')})` : '';
      
      return `${index + 1}. ${product.name} - ${price} - ${product.source}${tags}${personality}`;
    }).join('\n');

    return `${profileText}\n${productsText}\n\nAnalise este perfil e sugira os 3 presentes mais emocionalmente adequados da lista, explicando por que cada um é perfeito para esta pessoa específica.`;
  }

  private parseAIResponse(content: string, products: ProductForAI[]): AIRecommendationResponse[] {
    try {
      // Remove markdown code block wrappers if present
      let jsonContent = content.trim();
      
      // Remove ```json at the beginning
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.substring(7);
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.substring(3);
      }
      
      // Remove ``` at the end
      if (jsonContent.endsWith('```')) {
        jsonContent = jsonContent.substring(0, jsonContent.length - 3);
      }
      
      // Trim again after removing markdown wrappers
      jsonContent = jsonContent.trim();
      
      // Find the first '[' and last ']' to extract the JSON array
      const startIndex = jsonContent.indexOf('[');
      const lastIndex = jsonContent.lastIndexOf(']');
      
      if (startIndex === -1 || lastIndex === -1 || startIndex >= lastIndex) {
        throw new Error('No valid JSON array found in response');
      }
      
      // Extract only the JSON part
      const jsonString = jsonContent.substring(startIndex, lastIndex + 1);
      
      // Clean up any potential formatting issues
      const cleanedJson = jsonString
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .replace(/,\s*}/g, '}') // Remove trailing commas in objects
        .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
      
      console.log('Attempting to parse JSON:', cleanedJson);
      
      const parsed = JSON.parse(cleanedJson);
      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      // Validate and clean the recommendations
      const validRecommendations: AIRecommendationResponse[] = [];
      
      for (const rec of parsed) {
        if (!rec.product || !rec.reason) {
          continue;
        }

        // Find matching product (fuzzy match)
        const matchingProduct = this.findMatchingProduct(rec.product, products);
        if (matchingProduct) {
          validRecommendations.push({
            product: matchingProduct.name, // Use exact product name
            reason: rec.reason,
            emotional_score: rec.emotional_score || 85
          });
        }
      }

      if (validRecommendations.length === 0) {
        throw new Error('No valid recommendations found');
      }

      return validRecommendations.slice(0, 3); // Ensure max 3 recommendations

    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('Raw response:', content);
      
      // Fallback: try to extract recommendations from text
      return this.parseTextResponse(content, products);
    }
  }

  private findMatchingProduct(productName: string, products: ProductForAI[]): ProductForAI | null {
    // Exact match first
    let match = products.find(p => p.name === productName);
    if (match) return match;

    // Fuzzy match - check if product name contains the AI suggestion or vice versa
    const normalizedName = productName.toLowerCase().trim();
    match = products.find(p => {
      const normalizedProductName = p.name.toLowerCase().trim();
      return normalizedProductName.includes(normalizedName) || 
             normalizedName.includes(normalizedProductName);
    });

    return match || null;
  }

  private parseTextResponse(content: string, products: ProductForAI[]): AIRecommendationResponse[] {
    // Fallback parser for non-JSON responses
    const recommendations: AIRecommendationResponse[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      for (const product of products) {
        if (line.toLowerCase().includes(product.name.toLowerCase())) {
          recommendations.push({
            product: product.name,
            reason: 'Recomendado pela análise de IA baseada no seu perfil emocional.',
            emotional_score: 80
          });
          break;
        }
      }
      
      if (recommendations.length >= 3) break;
    }

    return recommendations;
  }

  // Convert AI recommendations to GiftRecommendation format
  async convertToGiftRecommendations(
    aiRecommendations: AIRecommendationResponse[],
    products: ProductForAI[]
  ): Promise<GiftRecommendation[]> {
    const giftRecommendations: GiftRecommendation[] = [];

    for (const aiRec of aiRecommendations) {
      const product = products.find(p => p.name === aiRec.product);
      if (product) {
        giftRecommendations.push({
          id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: product.name,
          price: `R$ ${product.price_brl.toFixed(2).replace('.', ',')}`,
          image: product.image_url || 'https://images.pexels.com/photos/264985/pexels-photo-264985.jpeg?auto=compress&cs=tinysrgb&w=400',
          description: product.description || `Produto ${product.source} com excelente qualidade e avaliações.`,
          emotionalExplanation: aiRec.reason,
          affiliateLink: product.affiliate_link,
          category: product.source
        });
      }
    }

    return giftRecommendations;
  }

  // Test the AI recommendation with sample data
  async testRecommendation(): Promise<{
    success: boolean;
    recommendations?: AIRecommendationResponse[];
    error?: string;
  }> {
    try {
      const testProfile: AIRecommendationInput = {
        relationship: 'Mãe',
        personality: 'Criativa e artística',
        occasion: 'Aniversário',
        budget_range: 'R$ 51 - R$ 150',
        emotional_tags: ['Amor e carinho', 'Criatividade'],
        age: '45-55 anos',
        interests: ['Arte', 'Decoração']
      };

      const testProducts: ProductForAI[] = [
        {
          name: 'Kit Spa Relaxante Casa',
          price_brl: 89.90,
          affiliate_link: 'https://amazon.com.br/kit-spa-casa',
          emotional_tags: ['relaxamento', 'autocuidado'],
          personality_match: ['Calma e reflexiva'],
          relationship_types: ['Mãe/Pai'],
          occasion_tags: ['Aniversário'],
          source: 'amazon'
        },
        {
          name: 'Livro de Receitas Gourmet',
          price_brl: 45.90,
          affiliate_link: 'https://amazon.com.br/livro-receitas',
          emotional_tags: ['criatividade', 'culinária'],
          personality_match: ['Criativa e artística'],
          relationship_types: ['Mãe/Pai'],
          occasion_tags: ['Aniversário'],
          source: 'amazon'
        }
      ];

      const recommendations = await this.recommendWithAI(testProfile, testProducts);
      
      return {
        success: true,
        recommendations
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Check if API is available
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  // Get usage info
  getUsageInfo(): { hasApiKey: boolean; model: string; maxProducts: number } {
    return {
      hasApiKey: !!this.apiKey,
      model: this.model,
      maxProducts: this.maxProducts
    };
  }
}