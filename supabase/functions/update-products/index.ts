import { createClient } from 'npm:@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ProductData {
  name: string;
  description?: string;
  price_brl: number;
  image_url?: string;
  affiliate_link: string;
  category_id?: string;
  emotional_tags?: string[];
  personality_match?: string[];
  age_range?: string[];
  relationship_types?: string[];
  budget_range?: string;
  occasion_tags?: string[];
}

// Mock product data for initial testing
const getMockProducts = (): ProductData[] => [
  {
    name: 'Kit de Café Premium Gourmet',
    description: 'Kit completo com café especial, xícara artesanal e biscoitos gourmet para momentos especiais.',
    price_brl: 129.90,
    image_url: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
    affiliate_link: 'https://amazon.com.br/kit-cafe-premium',
    emotional_tags: ['conforto', 'sofisticação', 'prazer'],
    personality_match: ['Calma e reflexiva', 'Prática e organizada'],
    age_range: ['26-35 anos', '36-50 anos', '51-65 anos'],
    relationship_types: ['Namorado(a)', 'Marido/Esposa', 'Mãe/Pai'],
    budget_range: 'R$ 51 - R$ 150',
    occasion_tags: ['Aniversário', 'Dia dos Namorados', 'Sem ocasião especial']
  },
  {
    name: 'Smartwatch Fitness Tracker',
    description: 'Relógio inteligente com monitoramento de saúde, GPS e resistência à água.',
    price_brl: 299.00,
    image_url: 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=400',
    affiliate_link: 'https://amazon.com.br/smartwatch-fitness',
    emotional_tags: ['saúde', 'tecnologia', 'motivação'],
    personality_match: ['Aventureira e espontânea', 'Prática e organizada'],
    age_range: ['18-25 anos', '26-35 anos', '36-50 anos'],
    relationship_types: ['Namorado(a)', 'Amigo(a)', 'Irmão/Irmã'],
    budget_range: 'R$ 151 - R$ 300',
    occasion_tags: ['Aniversário', 'Conquista pessoal', 'Sem ocasião especial']
  },
  {
    name: 'Kit Spa Relaxante Casa',
    description: 'Kit completo com óleos essenciais, velas aromáticas e produtos para um spa em casa.',
    price_brl: 89.90,
    image_url: 'https://images.pexels.com/photos/3188799/pexels-photo-3188799.jpeg?auto=compress&cs=tinysrgb&w=400',
    affiliate_link: 'https://amazon.com.br/kit-spa-casa',
    emotional_tags: ['relaxamento', 'autocuidado', 'bem-estar'],
    personality_match: ['Calma e reflexiva', 'Criativa e artística'],
    age_range: ['18-25 anos', '26-35 anos', '36-50 anos'],
    relationship_types: ['Namorado(a)', 'Marido/Esposa', 'Mãe/Pai', 'Amigo(a)'],
    budget_range: 'R$ 51 - R$ 150',
    occasion_tags: ['Aniversário', 'Dia das Mães/Pais', 'Sem ocasião especial']
  },
  {
    name: 'Livro de Receitas Gourmet',
    description: 'Livro com receitas sofisticadas e fáceis de fazer, perfeito para quem ama cozinhar.',
    price_brl: 45.90,
    image_url: 'https://images.pexels.com/photos/1391653/pexels-photo-1391653.jpeg?auto=compress&cs=tinysrgb&w=400',
    affiliate_link: 'https://amazon.com.br/livro-receitas-gourmet',
    emotional_tags: ['criatividade', 'culinária', 'aprendizado'],
    personality_match: ['Criativa e artística', 'Prática e organizada'],
    age_range: ['26-35 anos', '36-50 anos', '51-65 anos'],
    relationship_types: ['Marido/Esposa', 'Mãe/Pai', 'Amigo(a)'],
    budget_range: 'Até R$ 50',
    occasion_tags: ['Aniversário', 'Natal', 'Sem ocasião especial']
  },
  {
    name: 'Fone de Ouvido Bluetooth Premium',
    description: 'Fone wireless com cancelamento de ruído e qualidade de som excepcional.',
    price_brl: 199.90,
    image_url: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
    affiliate_link: 'https://amazon.com.br/fone-bluetooth-premium',
    emotional_tags: ['música', 'tecnologia', 'qualidade'],
    personality_match: ['Aventureira e espontânea', 'Sociável e extrovertida'],
    age_range: ['18-25 anos', '26-35 anos', '36-50 anos'],
    relationship_types: ['Namorado(a)', 'Irmão/Irmã', 'Amigo(a)'],
    budget_range: 'R$ 151 - R$ 300',
    occasion_tags: ['Aniversário', 'Natal', 'Conquista pessoal']
  },
  {
    name: 'Planta Suculenta Decorativa',
    description: 'Conjunto de suculentas em vasos decorativos, perfeito para decorar qualquer ambiente.',
    price_brl: 35.90,
    image_url: 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=400',
    affiliate_link: 'https://amazon.com.br/plantas-suculentas',
    emotional_tags: ['natureza', 'decoração', 'tranquilidade'],
    personality_match: ['Calma e reflexiva', 'Criativa e artística'],
    age_range: ['18-25 anos', '26-35 anos', '36-50 anos'],
    relationship_types: ['Amigo(a)', 'Irmão/Irmã', 'Outro familiar'],
    budget_range: 'Até R$ 50',
    occasion_tags: ['Sem ocasião especial', 'Conquista pessoal']
  },
  {
    name: 'Kit de Maquiagem Profissional',
    description: 'Kit completo com pincéis, paleta de cores e produtos de alta qualidade.',
    price_brl: 159.90,
    image_url: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
    affiliate_link: 'https://amazon.com.br/kit-maquiagem-profissional',
    emotional_tags: ['beleza', 'autoestima', 'criatividade'],
    personality_match: ['Criativa e artística', 'Sociável e extrovertida'],
    age_range: ['18-25 anos', '26-35 anos', '36-50 anos'],
    relationship_types: ['Namorado(a)', 'Irmã/Irmão', 'Amigo(a)'],
    budget_range: 'R$ 151 - R$ 300',
    occasion_tags: ['Aniversário', 'Dia dos Namorados', 'Sem ocasião especial']
  },
  {
    name: 'Jogo de Tabuleiro Estratégico',
    description: 'Jogo de estratégia para 2-4 jogadores, perfeito para noites divertidas em família.',
    price_brl: 79.90,
    image_url: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=400',
    affiliate_link: 'https://amazon.com.br/jogo-tabuleiro-estrategia',
    emotional_tags: ['diversão', 'estratégia', 'socialização'],
    personality_match: ['Sociável e extrovertida', 'Prática e organizada'],
    age_range: ['18-25 anos', '26-35 anos', '36-50 anos'],
    relationship_types: ['Irmão/Irmã', 'Amigo(a)', 'Outro familiar'],
    budget_range: 'R$ 51 - R$ 150',
    occasion_tags: ['Aniversário', 'Natal', 'Sem ocasião especial']
  }
];

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let productsToUpdate: ProductData[] = [];

    // Check if request has a body with custom products
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (Array.isArray(body) && body.length > 0) {
          productsToUpdate = body;
        } else {
          productsToUpdate = getMockProducts();
        }
      } catch {
        productsToUpdate = getMockProducts();
      }
    } else {
      productsToUpdate = getMockProducts();
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each product
    for (const product of productsToUpdate) {
      try {
        // Upsert product using affiliate_link as conflict resolution
        const { data, error } = await supabase
          .from('products')
          .upsert({
            ...product,
            updated_at: new Date().toISOString(),
            is_active: true,
            stock_status: 'available',
            rating: 5.0
          }, {
            onConflict: 'affiliate_link',
            ignoreDuplicates: false
          })
          .select();

        if (error) {
          errorCount++;
          errors.push(`Error updating ${product.name}: ${error.message}`);
          console.error('Product upsert error:', error);
        } else {
          successCount++;
          console.log(`Successfully updated: ${product.name}`);
        }
      } catch (err) {
        errorCount++;
        errors.push(`Exception updating ${product.name}: ${err.message}`);
        console.error('Product update exception:', err);
      }
    }

    // Return response
    const response = {
      status: errorCount === 0 ? 'success' : 'partial_success',
      message: `Updated ${successCount} products successfully`,
      count: successCount,
      errors: errorCount > 0 ? errors : undefined,
      total_processed: productsToUpdate.length
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: errorCount === 0 ? 200 : 207 // 207 for partial success
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message,
        count: 0
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500
      }
    );
  }
});