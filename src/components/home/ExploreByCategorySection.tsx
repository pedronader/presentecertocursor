import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  Calendar, 
  Palette, 
  Sparkles, 
  Gift,
  Crown,
  Coffee,
  Gamepad2,
  Music,
  Book,
  Dumbbell,
  Home,
  Shirt,
  Zap,
  Star,
  Smile,
  Target
} from 'lucide-react';
import { CategoryCarousel } from './CategoryCarousel';
import { CategoryCard } from './CategoryCard';

export const ExploreByCategorySection: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (slug: string) => {
    navigate(`/presente-para/${slug}`);
  };

  // Relationship Categories
  const relationshipCategories = [
  {
    title: 'Presente para Mãe',
    description: 'Ideias especiais para as mães',
    icon: Heart,
    slug: 'mae'
  },
  {
    title: 'Presente para Pai',
    description: 'Presentes únicos para os pais',
    icon: Gift,
    slug: 'pai'
  },
  {
    title: 'Presente para Namorada',
    description: 'Demonstre seu amor e carinho',
    icon: Heart,
    slug: 'namorada'
  },
  {
    title: 'Presente para Namorado',
    description: 'Surpreenda quem você ama',
    icon: Star,
    slug: 'namorado'
  },
  {
    title: 'Presente para Amigo',
    description: 'Celebre a amizade verdadeira',
    icon: Users,
    slug: 'amigo'
  },
  {
    title: 'Presente para Irmã',
    description: 'Para quem sempre esteve ao seu lado',
    icon: Heart,
    slug: 'irma'
  }
  ];

  // Occasion Categories
  const occasionCategories = [
    {
      title: 'Presente de Natal Especial',
      description: 'Ideias mágicas para a época mais especial do ano',
      icon: Star,
      slug: 'natal'
    },
    {
      title: 'Presente de Aniversário Único',
      description: 'Celebre mais um ano de vida com estilo',
      icon: Gift,
      slug: 'aniversario'
    },
    {
      title: 'Presente Dia dos Namorados',
      description: 'Demonstre seu amor de forma especial',
      icon: Heart,
      slug: 'dia-dos-namorados'
    },
    {
      title: 'Presente Dia das Mães',
      description: 'Homenageie a pessoa mais importante',
      icon: Crown,
      slug: 'dia-das-maes'
    },
    {
      title: 'Presente de Formatura',
      description: 'Celebre essa conquista importante',
      icon: Book,
      slug: 'formatura'
    }
  ];

  // Style/Theme Categories
  const styleCategories = [
    {
      title: 'Presente Criativo Econômico',
      description: 'Ideias criativas que cabem no orçamento',
      icon: Palette,
      slug: 'criativo-economico'
    },
    {
      title: 'Presente Luxo e Sofisticação',
      description: 'Para momentos especiais e únicos',
      icon: Crown,
      slug: 'luxo-sofisticacao'
    },
    {
      title: 'Presente Tecnológico Moderno',
      description: 'Para quem ama inovação e gadgets',
      icon: Zap,
      slug: 'tecnologico-moderno'
    },
    {
      title: 'Presente Esportivo Ativo',
      description: 'Para quem vive um estilo de vida ativo',
      icon: Dumbbell,
      slug: 'esportivo-ativo'
    },
    {
      title: 'Presente Musical Artístico',
      description: 'Para os amantes da música e arte',
      icon: Music,
      slug: 'musical-artistico'
    },
    {
      title: 'Presente Casa e Decoração',
      description: 'Para deixar o lar ainda mais especial',
      icon: Home,
      slug: 'casa-decoracao'
    }
  ];

  return (
    <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Explore por Categoria
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Encontre o presente perfeito navegando por relacionamentos, ocasiões especiais ou estilos únicos
        </p>
      </div>

      {/* Relationship Categories */}
      <CategoryCarousel
        title="Por Relacionamento"
        items={relationshipCategories}
        onCardClick={handleCategoryClick}
      />

      {/* Occasion Categories */}
      <CategoryCarousel
        title="Por Ocasião"
        items={occasionCategories}
        onCardClick={handleCategoryClick}
      />

      {/* Style Categories */}
      <CategoryCarousel
        title="Por Estilo"
        items={styleCategories}
        onCardClick={handleCategoryClick}
      />

      {/* Desktop Grid View (Hidden on Mobile) */}
      <div className="hidden lg:block mt-12">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
          Todas as Categorias
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[...relationshipCategories, ...occasionCategories, ...styleCategories]
            .slice(0, 18)
            .map((item, index) => (
              <div key={index} className="w-full">
                <CategoryCard
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  slug={item.slug}
                  onClick={handleCategoryClick}
                />
              </div>
            ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-8 pt-8 border-t border-gray-200">
        <p className="text-gray-600 mb-4">
          Não encontrou o que procura? Nosso quiz personalizado encontra o presente ideal!
        </p>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('startQuiz'))}
          className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105"
        >
          Fazer Quiz Personalizado
        </button>
      </div>
    </section>
  );
};