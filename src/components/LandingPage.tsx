import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Clock, Heart, Star as StarIcon, CheckCircle, UserCircle } from 'lucide-react';
import { ProductUpdateButton } from './admin/ProductUpdateButton';
import { ExploreByCategorySection } from './home/ExploreByCategorySection';
import { FAQSection } from './home/FAQSection';

interface LandingPageProps {
  onStartQuiz: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartQuiz }) => {
  const [showAdmin, setShowAdmin] = useState(false);
  const navigate = useNavigate();

  const testimonials = [
    {
      quote: 'Fiquei surpresa com a precisão! O quiz entendeu direitinho minha mãe.',
      name: 'Luana',
      city: 'Belo Horizonte'
    },
    {
      quote: 'Achei um presente criativo e ainda ganhei pontos com minha namorada!',
      name: 'Thiago',
      city: 'São Paulo'
    },
    {
      quote: 'A explicação emocional me fez ver o presente com outros olhos.',
      name: 'Camila',
      city: 'Recife'
    }
  ];

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

          {/* Highlight bullets */}
          <ul className="text-left max-w-md mx-auto mt-8 space-y-3">
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
              <span className="text-lg text-gray-700">
                <strong>100% gratuito</strong> – sem taxas, sem cadastro obrigatório
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
              <span className="text-lg text-gray-700">
                <strong>Baseado em inteligência artificial</strong> – recomendações feitas por IA
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
              <span className="text-lg text-gray-700">
                <strong>Sugestões personalizadas</strong> – presentes sob medida para cada perfil
              </span>
            </li>
          </ul>
        </div>
        <button
          onClick={onStartQuiz}
          className="mt-8 bg-gradient-to-r from-red-500 to-pink-500 text-white px-10 py-4 rounded-full text-lg font-semibold hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Encontrar presente agora 🎁
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
            <StarIcon className="w-6 h-6 text-purple-600" />
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
      <div className="bg-white rounded-2xl shadow-lg p-8 mt-12">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
          O que nossos usuários dizem
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-gray-50">
              {/* Avatar */}
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 mb-4">
                <UserCircle className="w-10 h-10 text-white" />
              </div>

              {/* Quote */}
              <p className="text-gray-700 italic mb-4 leading-relaxed">“{t.quote}”</p>

              {/* Rating */}
              <div className="flex mb-2" aria-label="5 de 5 estrelas">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <StarIcon key={idx} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>

              {/* Name & city */}
              <p className="text-sm text-gray-600 font-semibold">{t.name}, {t.city}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <FAQSection />
    </div>
  );
};