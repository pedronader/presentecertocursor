import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Gift, Star, Clock, Heart, ArrowRight, Sparkles } from 'lucide-react';
import { SEOService } from '../../services/seoService';
import { RecommendationService } from '../../services/recommendationService';
import { GiftRecommendation } from '../../types/quiz';
import { RecommendationCard } from '../results/RecommendationCard';
import { Header } from '../ui/Header';
import { useAnalytics } from '../analytics/AnalyticsProvider';

interface SEOPageData {
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage: string;
  profile: {
    relationship: string;
    personality?: string;
    occasion?: string;
    age?: string;
    budget?: string;
  };
}

export const SEOLandingPage: React.FC = () => {  
  console.log('🚀 SEOLandingPage INICIOU - componente foi chamado!');
  const { slug } = useParams<{ slug: string }>();

 // ✅ ADICIONE ESTES LOGS TEMPORÁRIOS
  console.log('🔍 DEBUG SEOLandingPage:');
  console.log('📍 URL atual:', window.location.pathname);
  console.log('📄 Slug extraído:', slug);
  console.log('🔧 Tipo do slug:', typeof slug);
  console.log('📊 useParams completo:', useParams());
  
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<SEOPageData | null>(null);
  const [recommendations, setRecommendations] = useState<GiftRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { analytics, consent } = useAnalytics();

  const seoService = new SEOService();
  const recommendationService = new RecommendationService();

  useEffect(() => {
    const loadPageData = async () => {
      if (!slug) {
        setError('Slug não encontrado');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('Loading page data for slug:', slug);

        // Parse slug and generate page data
        const parsedData = seoService.parseSlugToProfile(slug);
        console.log('Parsed data:', parsedData);
        
        const pageData = seoService.generateSEOPageData(parsedData, slug);
        console.log('Generated page data:', pageData);
        
        setPageData(pageData);

        // Track SEO page view
        if (consent.analytics) {
          analytics.trackSEOPageView(slug, parsedData);
        }

        // Get recommendations for this profile
        try {
          const recs = await recommendationService.getRecommendationsByProfile({
            answers: [],
            recipientProfile: {
              relationship: parsedData.relationship,
              age: parsedData.age || '26-35 anos',
              personality: parsedData.personality || 'Sociável e extrovertida',
              interests: [parsedData.occasion || 'Sem ocasião especial'],
              occasion: parsedData.occasion || 'Sem ocasião especial',
              budget: parsedData.budget || 'R$ 51 - R$ 150'
            }
          });
          console.log('Loaded recommendations:', recs);
          setRecommendations(recs.slice(0, 6)); // Show up to 6 recommendations
        } catch (recError) {
          console.error('Error loading recommendations:', recError);
          // Use fallback recommendations
          const fallbackRecs = seoService.getFallbackRecommendations(parsedData);
          console.log('Using fallback recommendations:', fallbackRecs);
          setRecommendations(fallbackRecs);
        }

      } catch (err) {
        console.error('Error loading SEO page:', err);
        setError(`Erro ao carregar página: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadPageData();
  }, [slug]);

  // Generate JSON-LD structured data
  const generateJSONLD = () => {
    if (!pageData) return null;

    const baseUrl = window.location.origin;
    const currentUrl = window.location.href;

    // Base WebPage schema
    const webPageSchema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": pageData.title,
      "description": pageData.metaDescription,
      "url": currentUrl,
      "mainEntity": {
        "@type": "Article",
        "headline": pageData.h1,
        "description": pageData.description,
        "author": {
          "@type": "Organization",
          "name": "PresenteCerto",
          "url": baseUrl
        },
        "publisher": {
          "@type": "Organization",
          "name": "PresenteCerto",
          "url": baseUrl,
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/vite.svg`
          }
        },
        "datePublished": new Date().toISOString(),
        "dateModified": new Date().toISOString(),
        "keywords": pageData.keywords.join(', '),
        "about": {
          "@type": "Thing",
          "name": `Presente para ${pageData.profile.relationship}`,
          "description": `Recomendações personalizadas de presentes para ${pageData.profile.relationship.toLowerCase()}`
        }
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Início",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": pageData.title,
            "item": currentUrl
          }
        ]
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    };

    // If we have recommendations, add Product schemas
    if (recommendations.length > 0) {
      const productSchemas = recommendations.slice(0, 3).map((product, index) => ({
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": product.image,
        "offers": {
          "@type": "Offer",
          "price": product.price.replace('R$ ', '').replace(',', '.'),
          "priceCurrency": "BRL",
          "availability": "https://schema.org/InStock",
          "url": product.affiliateLink,
          "seller": {
            "@type": "Organization",
            "name": "Amazon Brasil"
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "5",
          "bestRating": "5",
          "worstRating": "1",
          "ratingCount": "1"
        },
        "category": product.category || "Presentes",
        "brand": {
          "@type": "Brand",
          "name": "Genérico"
        }
      }));

      // Add products to the main entity
      webPageSchema.mainEntity.mentions = productSchemas;

      // Create a separate ItemList schema for the recommendations
      const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `Recomendações de ${pageData.title}`,
        "description": `Lista curada de presentes para ${pageData.profile.relationship.toLowerCase()}`,
        "numberOfItems": recommendations.length,
        "itemListElement": recommendations.slice(0, 3).map((product, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "image": product.image,
            "url": product.affiliateLink
          }
        }))
      };

      return [webPageSchema, itemListSchema];
    }

    return [webPageSchema];
  };

  // Generate FAQ schema if we have profile data
  const generateFAQSchema = () => {
    if (!pageData) return null;

    const { relationship, personality, occasion } = pageData.profile;

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": `Qual o melhor presente para ${relationship.toLowerCase()}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `O melhor presente para ${relationship.toLowerCase()} depende da personalidade e gostos únicos da pessoa. ${personality ? `Para alguém ${personality.toLowerCase()}, ` : ''}recomendamos presentes que demonstrem cuidado e atenção aos detalhes pessoais.`
          }
        },
        {
          "@type": "Question",
          "name": `Como escolher um presente personalizado?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Para escolher um presente personalizado, considere a personalidade, interesses, idade e ocasião. Nosso quiz analisa esses fatores para sugerir presentes que realmente tocam o coração da pessoa."
          }
        },
        {
          "@type": "Question",
          "name": `Por que usar o PresenteCerto?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "O PresenteCerto usa inteligência artificial e análise emocional para recomendar presentes únicos. Cada sugestão vem com explicação de por que é ideal para a pessoa, facilitando sua escolha."
          }
        }
      ]
    };

    if (occasion) {
      faqSchema.mainEntity.push({
        "@type": "Question",
        "name": `Qual presente dar em ${occasion.toLowerCase()}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Para ${occasion.toLowerCase()}, recomendamos presentes que marquem a data especial e demonstrem o carinho pela pessoa. ${relationship ? `Especialmente para ${relationship.toLowerCase()}, ` : ''}considere algo que tenha significado emocional e seja útil no dia a dia.`
        }
      });
    }

    return faqSchema;
  };

  const handleStartQuiz = () => {
    navigate('/');
    // Trigger quiz start after navigation
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('startQuiz'));
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
        <Header currentState="landing" onRestart={() => navigate('/')} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Carregando recomendações...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
        <Header currentState="landing" onRestart={() => navigate('/')} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Página não encontrada</h1>
            <p className="text-lg text-gray-600 mb-4">
              {error || 'Não conseguimos encontrar recomendações para este perfil.'}
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Slug: {slug}
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageData.metaTitle}</title>
        <meta name="description" content={pageData.metaDescription} />
        <meta name="keywords" content={pageData.keywords.join(', ')} />
        <link rel="canonical" href={pageData.canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={pageData.metaTitle} />
        <meta property="og:description" content={pageData.metaDescription} />
        <meta property="og:image" content={pageData.ogImage} />
        <meta property="og:url" content={pageData.canonicalUrl} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageData.metaTitle} />
        <meta name="twitter:description" content={pageData.metaDescription} />
        <meta name="twitter:image" content={pageData.ogImage} />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="PresenteCerto" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* JSON-LD Structured Data */}
        {generateJSONLD()?.map((schema, index) => (
          <script key={`jsonld-${index}`} type="application/ld+json">
            {JSON.stringify(schema, null, 2)}
          </script>
        ))}
        
        {/* FAQ Schema */}
        {generateFAQSchema() && (
          <script type="application/ld+json">
            {JSON.stringify(generateFAQSchema(), null, 2)}
          </script>
        )}
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
        <Header currentState="landing" onRestart={() => navigate('/')} />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full mb-6">
              <Gift className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {pageData.h1}
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              {pageData.description}
            </p>

            {/* Profile Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Perfil do Presente</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Para:</span>
                  <span className="ml-2 font-medium text-gray-900">{pageData.profile.relationship}</span>
                </div>
                {pageData.profile.personality && (
                  <div>
                    <span className="text-gray-500">Personalidade:</span>
                    <span className="ml-2 font-medium text-gray-900">{pageData.profile.personality}</span>
                  </div>
                )}
                {pageData.profile.occasion && (
                  <div>
                    <span className="text-gray-500">Ocasião:</span>
                    <span className="ml-2 font-medium text-gray-900">{pageData.profile.occasion}</span>
                  </div>
                )}
                {pageData.profile.age && (
                  <div>
                    <span className="text-gray-500">Idade:</span>
                    <span className="ml-2 font-medium text-gray-900">{pageData.profile.age}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleStartQuiz}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
            >
              <span>Fazer Quiz Personalizado</span>
              <ArrowRight className="w-5 h-5" />
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
                Encontre o presente ideal em menos de 3 minutos
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalizado</h3>
              <p className="text-gray-600">
                Sugestões baseadas na personalidade única
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Curado</h3>
              <p className="text-gray-600">
                Presentes selecionados com explicações emocionais
              </p>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
                Nossas Recomendações Especiais
              </h2>
              <div className="space-y-6">
                {recommendations.map((recommendation, index) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    rank={index + 1}
                  />
                ))}
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Quer recomendações ainda mais precisas?</h3>
            <p className="text-lg mb-6">
              Responda nosso quiz personalizado e descubra presentes únicos que vão tocar o coração
            </p>
            <button
              onClick={handleStartQuiz}
              className="bg-white text-red-500 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
            >
              <span>Começar Quiz Agora</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* SEO Content */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Por que escolher o PresenteCerto?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Recomendações Inteligentes
                </h3>
                <p className="text-gray-600 mb-4">
                  Nosso algoritmo analisa personalidade, ocasião e orçamento para encontrar 
                  o presente perfeito que realmente vai emocionar.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Explicações Emocionais
                </h3>
                <p className="text-gray-600">
                  Cada sugestão vem com uma explicação de por que é ideal, 
                  ajudando você a entender o impacto emocional do presente.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Compra Facilitada
                </h3>
                <p className="text-gray-600 mb-4">
                  Links diretos para compra com os melhores preços, 
                  tornando todo o processo rápido e conveniente.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Sempre Atualizado
                </h3>
                <p className="text-gray-600">
                  Nosso catálogo é constantemente atualizado com novos produtos 
                  e tendências para garantir as melhores opções.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};