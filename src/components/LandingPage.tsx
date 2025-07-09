import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Clock, Heart, Star } from 'lucide-react';
import { ProductUpdateButton } from './admin/ProductUpdateButton';
import { ExploreByCategorySection } from './home/ExploreByCategorySection';

interface LandingPageProps {
  onStartQuiz: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartQuiz }) => {
  const [showAdmin, setShowAdmin] = useState(false);
  const navigate = useNavigate();

  // Listen for custom quiz start event from SEO pages
  useEffect(() => {
    const handleStartQuiz = () => {
      onStartQuiz();
    };

    window.addEventListener('startQuiz', handleStartQuiz);
    return () => window.removeEventListener('startQuiz', handleStartQuiz);
  }, [onStartQuiz]);

  // Handle navigation to SEO pages
  const handleSEOLinkClick = (slug: string) => {
    navigate(`/presente-para/${slug}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Panel Toggle (hidden in production) */}
      {import.meta.env.DEV && (
        <div className="mb-4">
          <button
            onClick={() => setShowAdmin(!showAdmin)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {showAdmin ? 'Ocultar' : 'Mostrar'} Admin
          </button>
        </div>
      )}

      {/* Admin Panel */}
      {showAdmin && import.meta.env.DEV && (
        <div className="mb-8">
          <ProductUpdateButton />
        </div>
      )}

      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full mb-6">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Encontre o presente
            <span className="block text-red-500">perfeito em 3 minutos</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Responda nosso quiz emocional personalizado e descubra presentes únicos 
            que vão tocar o coração de quem você ama
          </p>
        </div>
        
        <button
          onClick={onStartQuiz}
          className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Começar Quiz 🎁
        </button>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Rápido & Fácil</h3>
          <p className="text-gray-600">
            Apenas 8 perguntas simples para encontrar o presente ideal
          </p>
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <Heart className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalizado</h3>
          <p className="text-gray-600">
            Sugestões baseadas na personalidade e gostos únicos
          </p>
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
            <Star className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Curado</h3>
          <p className="text-gray-600">
            Presentes selecionados com explicações emocionais detalhadas
          </p>
        </div>
      </div>

      {/* Explore by Category Section */}
      <ExploreByCategorySection />

      {/* Testimonials */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
          O que nossos usuários dizem
        </h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-red-400 rounded-full mx-auto mb-3"></div>
              <p className="text-gray-600 italic">
                "Encontrei o presente perfeito para minha mãe em poucos minutos! 
                A explicação emocional me ajudou a entender por que era ideal."
              </p>
              <p className="text-sm text-gray-500 mt-2">- Ana, São Paulo</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full mx-auto mb-3"></div>
              <p className="text-gray-600 italic">
                "Surpreendi minha namorada com um presente que ela amou! 
                O quiz realmente entende o que a pessoa gosta."
              </p>
              <p className="text-sm text-gray-500 mt-2">- Carlos, Rio de Janeiro</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};