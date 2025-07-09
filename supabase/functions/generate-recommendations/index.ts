import { createClient } from 'npm:@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface QuizInput {
  quiz_session_id?: string;
  relationship?: string;
  age?: string;
  personality?: string;
  interests?: string[];
  occasion?: string;
  budget?: string;
  emotional?: string;
  surprise?: string;
}

interface ProductMatch {
  id: string;
  name: string;
  description: string;
  price_brl: number;
  image_url: string | null;
  affiliate_link: string;
  emotional_tags: string[];
  personality_match: string[];
  age_range: string[];
  relationship_types: string[];
  budget_range: string;
  occasion_tags: string[];
  rating: number;
  score: number;
}

interface RecommendationResponse {
  id: string;
  name: string;
  price: string;
  image_url: string;
  affiliate_link: string;
  description: string;
  emotional_explanation: string;
  match_score: number;
}

// Budget range mapping for scoring
const budgetRanges = {
  'Até R$ 50': { min: 0, max: 50 },
  'R$ 51 - R$ 150': { min: 51, max: 150 },
  'R$ 151 - R$ 300': { min: 151, max: 300 },
  'R$ 301 - R$ 500': { min: 301, max: 500 },
  'Acima de R$ 500': { min: 501, max: 10000 }
};

// Emotional explanation templates
const emotionalTemplates = {
  'Amor e carinho': [
    'Este presente é uma expressão pura do seu amor e carinho. {name} foi escolhido especialmente para demonstrar o quanto ela significa para você.',
    'Cada detalhe de {name} reflete o cuidado e amor que você sente. É um presente que fala diretamente ao coração.',
    'Com {name}, você está dizendo "eu te amo" de uma forma única e especial que ela nunca esquecerá.'
  ],
  'Gratidão e reconhecimento': [
    '{name} é a forma perfeita de expressar sua gratidão por tudo que ela representa em sua vida.',
    'Este presente reconhece e celebra a pessoa incrível que ela é. {name} é um símbolo da sua admiração.',
    'Escolher {name} mostra que você valoriza profundamente sua presença e contribuição em sua vida.'
  ],
  'Apoio e encorajamento': [
    '{name} é mais que um presente - é um voto de confiança nos sonhos e objetivos dela.',
    'Com {name}, você está dizendo "eu acredito em você" de uma forma tangível e motivadora.',
    'Este presente simboliza seu apoio incondicional e encorajamento para todos os desafios que ela enfrentar.'
  ],
  'Diversão e alegria': [
    '{name} foi escolhido para trazer sorrisos e momentos de pura alegria ao dia a dia dela.',
    'Este presente promete diversão e risadas, criando memórias felizes que durarão para sempre.',
    'Com {name}, você está investindo na felicidade dela e criando oportunidades para momentos especiais juntos.'
  ],
  'Cuidado e proteção': [
    '{name} demonstra seu instinto protetor e o cuidado genuíno que você tem por ela.',
    'Este presente é um abraço em forma de objeto, mostrando que você sempre quer o melhor para ela.',
    'Escolher {name} revela sua preocupação amorosa com o bem-estar e conforto dela.'
  ]
};

function calculateProductScore(product: any, input: QuizInput): number {
  let score = 0;
  
  // Relationship match (high weight)
  if (input.relationship && product.relationship_types.includes(input.relationship)) {
    score += 25;
  }
  
  // Age range match (medium weight)
  if (input.age && product.age_range.includes(input.age)) {
    score += 15;
  }
  
  // Personality match (high weight)
  if (input.personality && product.personality_match.includes(input.personality)) {
    score += 20;
  }
  
  // Budget match (critical weight)
  if (input.budget && product.budget_range === input.budget) {
    score += 30;
  } else if (input.budget && budgetRanges[input.budget as keyof typeof budgetRanges]) {
    const userBudget = budgetRanges[input.budget as keyof typeof budgetRanges];
    if (product.price_brl >= userBudget.min && product.price_brl <= userBudget.max) {
      score += 20; // Partial match if price fits but range doesn't exactly match
    }
  }
  
  // Occasion match (medium weight)
  if (input.occasion && product.occasion_tags.includes(input.occasion)) {
    score += 15;
  }
  
  // Emotional/interest tags fuzzy matching (medium weight)
  const allInputTags = [
    ...(input.interests || []),
    input.emotional,
    input.surprise
  ].filter(Boolean).map(tag => tag?.toLowerCase());
  
  const productTags = product.emotional_tags.map((tag: string) => tag.toLowerCase());
  
  let tagMatches = 0;
  allInputTags.forEach(inputTag => {
    productTags.forEach(productTag => {
      if (inputTag?.includes(productTag) || productTag.includes(inputTag || '')) {
        tagMatches++;
      }
    });
  });
  
  score += Math.min(tagMatches * 5, 20); // Max 20 points from tag matching
  
  // Product rating bonus (small weight)
  score += (product.rating || 5) * 2;
  
  // Add small random factor to avoid identical scores
  score += Math.random() * 3;
  
  return Math.round(score * 100) / 100;
}

function generateEmotionalExplanation(product: any, input: QuizInput): string {
  const emotional = input.emotional || 'Amor e carinho';
  const templates = emotionalTemplates[emotional as keyof typeof emotionalTemplates] || emotionalTemplates['Amor e carinho'];
  
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template.replace(/{name}/g, product.name);
}

function formatPrice(price: number): string {
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Parse request body
    const body = await req.json();
    let input: QuizInput = {};

    // Handle quiz_session_id input
    if (body.quiz_session_id) {
      const { data: session, error: sessionError } = await supabase
        .from('quiz_sessions')
        .select('answers, recipient_profile')
        .eq('session_id', body.quiz_session_id)
        .single();

      if (sessionError || !session) {
        return new Response(
          JSON.stringify({ error: 'Quiz session not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Extract data from session
      input = {
        quiz_session_id: body.quiz_session_id,
        relationship: session.recipient_profile?.relationship,
        age: session.recipient_profile?.age,
        personality: session.recipient_profile?.personality,
        interests: session.recipient_profile?.interests || [],
        occasion: session.recipient_profile?.occasion,
        budget: session.recipient_profile?.budget,
        emotional: session.answers?.find((a: any) => a.questionId === 'emotional')?.answer,
        surprise: session.answers?.find((a: any) => a.questionId === 'surprise')?.answer
      };
    } else {
      // Use direct input
      input = body;
    }

    // Validate required fields
    if (!input.relationship || !input.budget) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: relationship and budget are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch active products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('stock_status', 'available');

    if (productsError) {
      throw new Error(`Database error: ${productsError.message}`);
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No products available',
          recommendations: []
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Calculate scores for all products
    const scoredProducts: ProductMatch[] = products.map(product => ({
      ...product,
      score: calculateProductScore(product, input)
    }));

    // Sort by score and get top 5
    const topProducts = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Format recommendations
    const recommendations: RecommendationResponse[] = topProducts.map(product => ({
      id: product.id,
      name: product.name,
      price: formatPrice(product.price_brl),
      image_url: product.image_url || 'https://images.pexels.com/photos/264985/pexels-photo-264985.jpeg?auto=compress&cs=tinysrgb&w=400',
      affiliate_link: product.affiliate_link,
      description: product.description,
      emotional_explanation: generateEmotionalExplanation(product, input),
      match_score: product.score
    }));

    // Save recommendations to database if we have a session ID
    if (input.quiz_session_id) {
      try {
        const recommendationData = recommendations.map((rec, index) => ({
          quiz_session_id: input.quiz_session_id,
          product_id: rec.id,
          rank_position: index + 1,
          match_score: rec.match_score,
          emotional_explanation: rec.emotional_explanation
        }));

        await supabase
          .from('recommendations')
          .insert(recommendationData);
      } catch (saveError) {
        console.error('Error saving recommendations:', saveError);
        // Continue without failing the request
      }
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        count: recommendations.length,
        recommendations,
        debug: {
          input_processed: input,
          total_products_evaluated: products.length,
          top_scores: topProducts.map(p => ({ name: p.name, score: p.score }))
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message,
        recommendations: []
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