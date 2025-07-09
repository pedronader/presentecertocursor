import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizData, GiftRecommendation } from '../../types/quiz';
import { getGiftRecommendations } from '../../utils/recommendationEngine';
import { RecommendationCard } from './RecommendationCard';
import { EmailCapture } from './EmailCapture';
import { SEOService } from '../../services/seoService';
import { RefreshCw, Share2 } from 'lucide-react';
import { useAnalytics } from '../analytics/AnalyticsProvider';

interface ResultsProps {
  quizData: QuizData;
  sessionId: string;
  onRestart: () => void;
}

export const Results: React.FC<ResultsProps> = ({ quizData, sessionId, onRestart }) => {
  const navigate = useNavigate();
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [recommendations, setRecommendations] = useState<GiftRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true); // initial load spinner
  const [isFetchingMore, setIsFetchingMore] = useState(false); // spinner only for "show more"
  const [reloadCount, setReloadCount] = useState(0);
  const MAX_RELOADS = 2;
  const { analytics } = useAnalytics();
  const [seoUrl, setSeoUrl] = useState<string>('');

  const seoService = new SEOService();

  useEffect(() => {
  const loadRecommendations = async () => {
    setIsLoading(true);
    
    try {
      const recs = await getGiftRecommendations(quizData);
      setRecommendations(recs);

      // Generate SEO URL for sharing
      const profile = {
        relationship: quizData.recipientProfile.relationship,
        personality: quizData.recipientProfile.personality,
        occasion: quizData.recipientProfile.occasion
      };
      const slug = seoService.generateSlugFromProfile(profile);
      if (slug) {
        const baseUrl = window.location.origin;
        setSeoUrl(`${baseUrl}/presente-para-${slug}`);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
    
    // Moved outside try-catch
    setIsLoading(false);
  };

  loadRecommendations();
}, [quizData]);

  const handleShare = async () => {
    if (seoUrl) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Encontrei presentes perfeitos no PresenteCerto!',
            text: 'Veja essas recomendações personalizadas de presentes',
            url: seoUrl,
          });
        } catch (error) {
          // Fallback to clipboard
          copyToClipboard();
        }
      } else {
        copyToClipboard();
      }
    }
  };

  const copyToClipboard = () => {
    if (seoUrl) {
      navigator.clipboard.writeText(seoUrl).then(() => {
        alert('Link copiado para a área de transferência!');
      });
    }
  };

  const handleShowMore = async () => {
    if (reloadCount >= MAX_RELOADS) return;

    analytics.trackEvent('more_recommendations_click', {
      quiz_session_id: sessionId,
      reload_count: reloadCount + 1
    });

    setReloadCount(reloadCount + 1);
    setIsFetchingMore(true);
    try {
      const newRecs = await getGiftRecommendations(quizData);
      const existingIds = new Set(recommendations.map((r) => r.id));
      const filtered = newRecs.filter((r) => !existingIds.has(r.id));
      if (filtered.length > 0) {
        setRecommendations(prev => [...prev, ...filtered]);
      }
    } catch (error) {
      console.error('Error fetching new recommendations:', error);
    }
    setIsFetchingMore(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Encontrando os presentes perfeitos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Encontramos os presentes perfeitos! 🎁
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Baseado no perfil de <strong>{quizData.recipientProfile.relationship}</strong> que você descreveu, 
          aqui estão nossas recomendações personalizadas:
        </p>
      </div>

      {/* Profile Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Perfil do Presente</h3>
          {seoUrl && (
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm">Compartilhar</span>
            </button>
          )}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Relacionamento</p>
            <p className="font-medium text-gray-900">{quizData.recipientProfile.relationship}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Faixa Etária</p>
            <p className="font-medium text-gray-900">{quizData.recipientProfile.age}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Personalidade</p>
            <p className="font-medium text-gray-900">{quizData.recipientProfile.personality}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Orçamento</p>
            <p className="font-medium text-gray-900">{quizData.recipientProfile.budget}</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-6 mb-4">
        {recommendations.map((recommendation, index) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            rank={index + 1}
            quizSessionId={sessionId}
          />
        ))}
      </div>

      {/* Show More Recommendations Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={handleShowMore}
          disabled={reloadCount >= MAX_RELOADS || isFetchingMore}
          className={`flex items-center space-x-2 px-8 py-3 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
            reloadCount >= MAX_RELOADS || isFetchingMore
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
          }`}
        >
          {isFetchingMore ? (
            <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8 8 8 0 008 8v-4l-3 3 3 3v-4a8 8 0 01-8-8z"></path>
            </svg>
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
          <span>{reloadCount >= MAX_RELOADS ? 'Limite atingido' : 'Quero ver outras opções'}</span>
        </button>
      </div>

      {/* Email Capture */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-8 text-white text-center mb-8">
        <h3 className="text-2xl font-bold mb-4">Gostou das sugestões?</h3>
        <p className="text-lg mb-6">
          Receba mais dicas personalizadas e lembretes para datas especiais
        </p>
        <button
          onClick={() => setShowEmailCapture(true)}
          className="bg-white text-red-500 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
        >
          Quero receber dicas! 📧
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRestart}
          className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Fazer novo quiz</span>
        </button>
        
        {seoUrl && (
          <button
            onClick={() => navigate(seoUrl.replace(window.location.origin, ''))}
            className="flex items-center justify-center space-x-2 bg-blue-100 text-blue-700 px-6 py-3 rounded-full hover:bg-blue-200 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span>Ver página SEO</span>
          </button>
        )}
      </div>

      {/* Email Capture Modal */}
      {showEmailCapture && (
        <EmailCapture 
          onClose={() => setShowEmailCapture(false)} 
          quizSessionId={sessionId}
        />
      )}
    </div>
  );
};