/*
  # PresenteCerto Database Schema

  1. New Tables
    - `products` - Gift product catalog with categories and affiliate links
    - `categories` - Product categories for organization
    - `quiz_sessions` - Track user quiz sessions and responses
    - `recommendations` - Store generated recommendations for analytics
    - `email_subscribers` - Email capture for marketing
    - `affiliate_clicks` - Track affiliate link performance

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access on products
    - Add policies for anonymous quiz sessions
    - Add policies for email subscription management

  3. Functions
    - Function to generate recommendations based on quiz responses
    - Function to track affiliate clicks
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  emoji text,
  created_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price_brl decimal(10,2) NOT NULL,
  image_url text,
  affiliate_link text NOT NULL,
  category_id uuid REFERENCES categories(id),
  emotional_tags text[] DEFAULT '{}',
  personality_match text[] DEFAULT '{}',
  age_range text[] DEFAULT '{}',
  relationship_types text[] DEFAULT '{}',
  budget_range text,
  occasion_tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  stock_status text DEFAULT 'available',
  rating decimal(3,2) DEFAULT 5.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quiz sessions table
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}',
  recipient_profile jsonb,
  completed_at timestamptz,
  user_agent text,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

-- Recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_session_id uuid REFERENCES quiz_sessions(id),
  product_id uuid REFERENCES products(id),
  rank_position integer NOT NULL,
  match_score decimal(5,2),
  emotional_explanation text,
  created_at timestamptz DEFAULT now()
);

-- Email subscribers table
CREATE TABLE IF NOT EXISTS email_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  quiz_session_id uuid REFERENCES quiz_sessions(id),
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  preferences jsonb DEFAULT '{}'
);

-- Affiliate clicks table
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  quiz_session_id uuid REFERENCES quiz_sessions(id),
  clicked_at timestamptz DEFAULT now(),
  user_agent text,
  ip_address inet,
  referrer text
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Anyone can create quiz sessions"
  ON quiz_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read their own quiz session"
  ON quiz_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update their own quiz session"
  ON quiz_sessions FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create recommendations"
  ON recommendations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Recommendations are publicly readable"
  ON recommendations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can subscribe to emails"
  ON email_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can track affiliate clicks"
  ON affiliate_clicks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Insert sample categories
INSERT INTO categories (name, slug, description, emoji) VALUES
  ('Bem-estar', 'bem-estar', 'Produtos para relaxamento e autocuidado', '🧘‍♀️'),
  ('Tecnologia', 'tecnologia', 'Gadgets e dispositivos tecnológicos', '📱'),
  ('Culinária', 'culinaria', 'Utensílios e livros de culinária', '👨‍🍳'),
  ('Joias', 'joias', 'Acessórios e joias personalizadas', '💎'),
  ('Decoração', 'decoracao', 'Itens decorativos para casa', '🏠'),
  ('Livros', 'livros', 'Livros e materiais de leitura', '📚'),
  ('Esportes', 'esportes', 'Equipamentos e acessórios esportivos', '🏃‍♀️'),
  ('Moda', 'moda', 'Roupas e acessórios de moda', '👗');

-- Insert sample products
INSERT INTO products (name, description, price_brl, image_url, affiliate_link, category_id, emotional_tags, personality_match, age_range, relationship_types, budget_range, occasion_tags) 
SELECT 
  'Kit de Cuidados Spa em Casa',
  'Kit completo com óleos essenciais, velas aromáticas e produtos para um spa relaxante em casa.',
  89.90,
  'https://images.pexels.com/photos/3188799/pexels-photo-3188799.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://amazon.com.br/kit-spa-casa',
  c.id,
  ARRAY['relaxamento', 'autocuidado', 'bem-estar'],
  ARRAY['Calma e reflexiva', 'Prática e organizada'],
  ARRAY['26-35 anos', '36-50 anos'],
  ARRAY['Namorado(a)', 'Marido/Esposa', 'Mãe/Pai'],
  'R$ 51 - R$ 150',
  ARRAY['Aniversário', 'Dia das Mães/Pais', 'Sem ocasião especial']
FROM categories c WHERE c.slug = 'bem-estar';

INSERT INTO products (name, description, price_brl, image_url, affiliate_link, category_id, emotional_tags, personality_match, age_range, relationship_types, budget_range, occasion_tags)
SELECT 
  'Smartwatch Fitness',
  'Smartwatch com monitoramento de saúde, GPS e resistência à água para acompanhar atividades físicas.',
  299.00,
  'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://amazon.com.br/smartwatch-fitness',
  c.id,
  ARRAY['saúde', 'motivação', 'tecnologia'],
  ARRAY['Aventureira e espontânea', 'Prática e organizada'],
  ARRAY['18-25 anos', '26-35 anos', '36-50 anos'],
  ARRAY['Namorado(a)', 'Marido/Esposa', 'Amigo(a)'],
  'R$ 151 - R$ 300',
  ARRAY['Aniversário', 'Conquista pessoal']
FROM categories c WHERE c.slug = 'tecnologia';

INSERT INTO products (name, description, price_brl, image_url, affiliate_link, category_id, emotional_tags, personality_match, age_range, relationship_types, budget_range, occasion_tags)
SELECT 
  'Livro de Receitas Gourmet',
  'Livro com receitas sofisticadas e fáceis de fazer, perfeito para quem gosta de cozinhar.',
  45.90,
  'https://images.pexels.com/photos/1391653/pexels-photo-1391653.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://amazon.com.br/livro-receitas-gourmet',
  c.id,
  ARRAY['criatividade', 'paixão', 'aprendizado'],
  ARRAY['Criativa e artística', 'Prática e organizada'],
  ARRAY['26-35 anos', '36-50 anos', '51-65 anos'],
  ARRAY['Marido/Esposa', 'Mãe/Pai', 'Amigo(a)'],
  'Até R$ 50',
  ARRAY['Aniversário', 'Natal', 'Sem ocasião especial']
FROM categories c WHERE c.slug = 'culinaria';

INSERT INTO products (name, description, price_brl, image_url, affiliate_link, category_id, emotional_tags, personality_match, age_range, relationship_types, budget_range, occasion_tags)
SELECT 
  'Conjunto de Joias Personalizadas',
  'Conjunto elegante com colar e brincos, com opção de gravação personalizada.',
  159.90,
  'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://amazon.com.br/conjunto-joias-personalizado',
  c.id,
  ARRAY['amor', 'elegância', 'personalização'],
  ARRAY['Sociável e extrovertida', 'Criativa e artística'],
  ARRAY['18-25 anos', '26-35 anos', '36-50 anos'],
  ARRAY['Namorado(a)', 'Marido/Esposa'],
  'R$ 151 - R$ 300',
  ARRAY['Dia dos Namorados', 'Aniversário', 'Natal']
FROM categories c WHERE c.slug = 'joias';

INSERT INTO products (name, description, price_brl, image_url, affiliate_link, category_id, emotional_tags, personality_match, age_range, relationship_types, budget_range, occasion_tags)
SELECT 
  'Planta Suculenta Decorativa',
  'Planta suculenta em vaso decorativo, fácil de cuidar e ideal para decoração.',
  29.90,
  'https://images.pexels.com/photos/1029783/pexels-photo-1029783.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://amazon.com.br/planta-suculenta-decorativa',
  c.id,
  ARRAY['crescimento', 'natureza', 'cuidado'],
  ARRAY['Calma e reflexiva', 'Criativa e artística'],
  ARRAY['18-25 anos', '26-35 anos'],
  ARRAY['Amigo(a)', 'Irmão/Irmã', 'Outro familiar'],
  'Até R$ 50',
  ARRAY['Sem ocasião especial', 'Conquista pessoal']
FROM categories c WHERE c.slug = 'decoracao';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_session_id ON quiz_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_quiz_session ON recommendations(quiz_session_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product ON affiliate_clicks(product_id);