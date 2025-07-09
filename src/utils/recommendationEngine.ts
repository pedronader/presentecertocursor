import { QuizData, GiftRecommendation } from '../types/quiz';
import { RecommendationService } from '../services/recommendationService';
import { EnhancedRecommendationService } from '../services/enhancedRecommendationService';

const recommendationService = new RecommendationService();
const enhancedRecommendationService = new EnhancedRecommendationService();

export const getGiftRecommendations = async (quizData: QuizData): Promise<GiftRecommendation[]> => {
  try {
    // Try AI-enhanced recommendations first
    const aiRecommendations = await enhancedRecommendationService.getAIEnhancedRecommendations(quizData);
    
    if (aiRecommendations.length > 0) {
      console.log('Using AI-enhanced recommendations');
      return aiRecommendations;
    }

    // Fallback to edge function recommendations
    console.log('Falling back to edge function recommendations');
    const edgeRecommendations = await recommendationService.getRecommendationsByProfile(quizData);
    
    if (edgeRecommendations.length > 0) {
      return edgeRecommendations;
    }

    // Final fallback to mock data
    console.log('Using mock recommendations as final fallback');
    return getMockRecommendations(quizData);
      
  } catch (error) {
    console.error('Error getting recommendations:', error);
    // Fallback to mock data on any error
    return getMockRecommendations(quizData);
  }
};

// Enhanced fallback mock recommendations with better matching
const getMockRecommendations = (quizData: QuizData): GiftRecommendation[] => {
  const { recipientProfile } = quizData;
  
  // Base mock products with proper image URLs
  const allMockProducts: GiftRecommendation[] = [
    {
      id: '1',
      name: 'Kit de Cuidados Spa em Casa',
      price: 'R$ 89,90',
      image: 'https://images.pexels.com/photos/3188799/pexels-photo-3188799.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Kit completo com óleos essenciais, velas aromáticas e produtos para um spa relaxante em casa.',
      emotionalExplanation: 'Este presente demonstra que você se preocupa com o bem-estar e relaxamento dela. É um convite para ela se cuidar e ter momentos especiais de autocuidado.',
      affiliateLink: 'https://amazon.com.br/kit-spa-casa',
      category: 'bem-estar'
    },
    {
      id: '2',
      name: 'Smartwatch Fitness',
      price: 'R$ 299,00',
      image: 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Smartwatch com monitoramento de saúde, GPS e resistência à água para acompanhar atividades físicas.',
      emotionalExplanation: 'Mostra que você apoia os objetivos de saúde dela e quer fazer parte da jornada de bem-estar. É um presente que diz "eu acredito em você".',
      affiliateLink: 'https://amazon.com.br/smartwatch-fitness',
      category: 'tecnologia'
    },
    {
      id: '3',
      name: 'Livro de Receitas Gourmet',
      price: 'R$ 45,90',
      image: 'https://images.pexels.com/photos/1391653/pexels-photo-1391653.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Livro com receitas sofisticadas e fáceis de fazer, perfeito para quem gosta de cozinhar.',
      emotionalExplanation: 'Reconhece e valoriza o talento culinário dela. É um presente que incentiva a criatividade e promete momentos deliciosos juntos.',
      affiliateLink: 'https://amazon.com.br/livro-receitas-gourmet',
      category: 'culinaria'
    },
    {
      id: '4',
      name: 'Kit de Maquiagem Profissional',
      price: 'R$ 159,90',
      image: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Kit completo com pincéis, paleta de cores e produtos de alta qualidade.',
      emotionalExplanation: 'Este presente celebra a beleza única dela e oferece ferramentas para expressar sua criatividade. Mostra que você valoriza sua autoestima e confiança.',
      affiliateLink: 'https://amazon.com.br/kit-maquiagem-profissional',
      category: 'beleza'
    },
    {
      id: '5',
      name: 'Planta Suculenta Decorativa',
      price: 'R$ 35,90',
      image: 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Conjunto de suculentas em vasos decorativos, perfeito para decorar qualquer ambiente.',
      emotionalExplanation: 'Um presente que cresce e floresce como o carinho entre vocês. Representa vida, cuidado e a beleza das coisas simples.',
      affiliateLink: 'https://amazon.com.br/plantas-suculentas',
      category: 'decoracao'
    },
    {
      id: '6',
      name: 'Fone de Ouvido Bluetooth Premium',
      price: 'R$ 199,90',
      image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Fone wireless com cancelamento de ruído e qualidade de som excepcional.',
      emotionalExplanation: 'Para momentos de música e relaxamento. Este presente mostra que você valoriza os momentos de paz e prazer dela.',
      affiliateLink: 'https://amazon.com.br/fone-bluetooth-premium',
      category: 'tecnologia'
    }
  ];

  // Simple scoring based on profile
  const scoredProducts = allMockProducts.map(product => {
    let score = Math.random() * 10; // Base random score
    
    // Budget matching
    const price = parseFloat(product.price.replace('R$ ', '').replace(',', '.'));
    if (recipientProfile.budget === 'Até R$ 50' && price <= 50) score += 20;
    else if (recipientProfile.budget === 'R$ 51 - R$ 150' && price >= 51 && price <= 150) score += 20;
    else if (recipientProfile.budget === 'R$ 151 - R$ 300' && price >= 151 && price <= 300) score += 20;
    
    // Interest matching
    if (recipientProfile.interests.some(interest => 
      product.category.includes(interest.toLowerCase()) || 
      interest.toLowerCase().includes(product.category)
    )) {
      score += 15;
    }
    
    return { ...product, score };
  });

  // Return top 3 scored products
  return scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
};