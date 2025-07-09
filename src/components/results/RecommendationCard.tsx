import React, { useState } from 'react';
import { GiftRecommendation } from '../../types/quiz';
import { ExternalLink, Link2, MessageCircle, Star, ImageIcon } from 'lucide-react';
import { QuizService } from '../../services/quizService';
import { useAnalytics } from '../analytics/AnalyticsProvider';

interface RecommendationCardProps {
  recommendation: GiftRecommendation;
  rank: number;
  quizSessionId?: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  recommendation, 
  rank, 
  quizSessionId,
  
}) => {
  const [quizService] = useState(() => new QuizService());
  const { analytics, consent } = useAnalytics();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [currentImageUrl, setCurrentImageUrl] = useState(
  recommendation.image || recommendation.image_url || 'https://picsum.photos/400/300'
);

  // Map source to store display names
  const storeNames: Record<string, string> = {
    'amazon': 'Amazon',
    'mercadolivre': 'Mercado Livre',
    'shopee': 'Shopee',
    'magalu': 'Magazine Luiza',
    'americanas': 'Americanas',
    'manual': 'Loja Parceira'
  };

  // Get button text based on source
  const getButtonText = () => {
    const source = recommendation.category || recommendation.source || 'unknown';
    const storeName = storeNames[source.toLowerCase()];
    return storeName ? `Comprar na ${storeName}` : 'Comprar agora';
  };
  const handlePurchaseClick = async () => {
    // Track affiliate click
    if (quizSessionId) {
      await quizService.trackAffiliateClick(recommendation.id, quizSessionId);
    }
    
    // Track in Google Analytics
    if (consent.analytics) {
      analytics.trackAffiliateClick(
        recommendation.id,
        recommendation.name,
        quizSessionId
      );
    }
    
    // Open affiliate link
    window.open(recommendation.affiliateLink, '_blank');
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    console.log('Image failed to load:', currentImageUrl);
    setImageLoading(false);
    
    // Try fallback strategies
    if (currentImageUrl === recommendation.image) {
      // First fallback: try to convert webp to jpg if it's a webp image
      if (recommendation.image?.includes('.webp')) {
        const jpgUrl = recommendation.image.replace('.webp', '.jpg');
        console.log('Trying JPG fallback:', jpgUrl);
        setCurrentImageUrl(jpgUrl);
        setImageLoading(true);
        return;
      }
      
      // Second fallback: try to use a proxy service for CORS issues
      if (recommendation.image?.includes('mlstatic.com')) {
        const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(recommendation.image)}&w=400&h=400&fit=cover`;
        console.log('Trying proxy fallback:', proxyUrl);
        setCurrentImageUrl(proxyUrl);
        setImageLoading(true);
        return;
      }
    }

      // ✅ NOVO: Third fallback - try the fallbackImage before giving up
  if (currentImageUrl !== fallbackImage) {
    console.log('Trying fallbackImage:', fallbackImage);
    setCurrentImageUrl(fallbackImage);
    setImageLoading(true);
    return;
  }
    
    // Final fallback: show error state
    setImageError(true);
  };

  // Fallback image URL
  const fallbackImage = 'https://images.pexels.com/photos/264985/pexels-photo-264985.jpeg?auto=compress&cs=tinysrgb&w=400';

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="md:flex">
        {/* Image */}
        <div className="md:w-1/3">
          <div className="h-48 md:h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
            {/* Loading state */}
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
              </div>
            )}
            
            {/* Image or error state */}
            {!imageError ? (
              <img
                src={currentImageUrl || fallbackImage}
                alt={recommendation.name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 p-4">
                <ImageIcon className="w-12 h-12 mb-2" />
                <span className="text-sm text-center">Imagem não disponível</span>
                <span className="text-xs text-gray-300 mt-1 text-center">
                  {recommendation.name}
                </span>
              </div>
            )}
            
            {/* Rank badge */}
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-20">
              #{rank}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="md:w-2/3 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {recommendation.name}
              </h3>
              <p className="text-2xl font-bold text-red-500 mb-2">
                {recommendation.price}
              </p>
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-4">
            {recommendation.description}
          </p>

          <div className="bg-red-50 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-red-900 mb-2">
              Por que é perfeito para você? 💝
            </h4>
            <p className="text-red-800 text-sm">
              {recommendation.emotionalExplanation}
            </p>
          </div>

          <button
            onClick={handlePurchaseClick}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-full font-semibold hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <span>{getButtonText()}</span>
            <ExternalLink className="w-5 h-5" />
          </button>

          {/* Share Buttons */}
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(recommendation.affiliateLink).then(() => {
                  alert('Link copiado para a área de transferência!');
                });
              }}
              className="flex items-center space-x-1 text-gray-500 hover:text-red-500 text-sm focus:outline-none"
            >
              <Link2 className="w-4 h-4" />
              <span>Compartilhar Link</span>
            </button>

            <button
              onClick={() => {
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(recommendation.affiliateLink)}`;
                window.open(whatsappUrl, '_blank');
              }}
              className="flex items-center space-x-1 text-gray-500 hover:text-green-600 text-sm focus:outline-none"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};