/*
  # Enhanced Product Management System

  1. New Columns for Products Table
    - `source` - Track affiliate platform (amazon, shopee, etc.)
    - `external_id` - Store platform-specific product IDs  
    - `last_updated` - Track data freshness for automation
    - `status` - Manage inventory states
    - `priority` - Feature important products

  2. New Tables
    - `product_sources` - Manage affiliate platform configurations
    - `product_import_logs` - Track bulk import operations

  3. Functions and Triggers
    - Bulk upsert function for CSV imports
    - Automatic timestamp updates
    - Performance indexes

  4. Sample Multi-Platform Data
    - Products from Amazon, Shopee, Magazine Luiza, etc.
*/

-- Add new columns to products table
DO $$
BEGIN
  -- Add source column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'source'
  ) THEN
    ALTER TABLE products ADD COLUMN source text DEFAULT 'manual';
  END IF;

  -- Add external_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'external_id'
  ) THEN
    ALTER TABLE products ADD COLUMN external_id text;
  END IF;

  -- Add last_updated column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'last_updated'
  ) THEN
    ALTER TABLE products ADD COLUMN last_updated timestamptz DEFAULT now();
  END IF;

  -- Add status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'status'
  ) THEN
    ALTER TABLE products ADD COLUMN status text DEFAULT 'active';
    ALTER TABLE products ADD CONSTRAINT products_status_check 
      CHECK (status IN ('active', 'inactive', 'out_of_stock', 'discontinued'));
  END IF;

  -- Add priority column for featured products
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'priority'
  ) THEN
    ALTER TABLE products ADD COLUMN priority integer DEFAULT 0;
  END IF;
END $$;

-- Add unique constraint on affiliate_link if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'products' AND constraint_name = 'products_affiliate_link_key'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_affiliate_link_key UNIQUE (affiliate_link);
  END IF;
END $$;

-- Create product_sources table for affiliate platform management
CREATE TABLE IF NOT EXISTS product_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  base_url text NOT NULL,
  api_endpoint text,
  api_key_required boolean DEFAULT false,
  commission_rate decimal(5,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_import_logs table for tracking bulk operations
CREATE TABLE IF NOT EXISTS product_import_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  operation_type text NOT NULL, -- 'csv_import', 'api_sync', 'manual_bulk'
  total_records integer DEFAULT 0,
  successful_records integer DEFAULT 0,
  failed_records integer DEFAULT 0,
  error_details jsonb DEFAULT '{}',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  status text DEFAULT 'running'
);

-- Add constraint for import logs status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'product_import_logs' AND constraint_name = 'product_import_logs_status_check'
  ) THEN
    ALTER TABLE product_import_logs ADD CONSTRAINT product_import_logs_status_check 
      CHECK (status IN ('running', 'completed', 'failed', 'cancelled'));
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE product_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_import_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'product_sources' AND policyname = 'Product sources are publicly readable'
  ) THEN
    CREATE POLICY "Product sources are publicly readable"
      ON product_sources FOR SELECT
      TO anon, authenticated
      USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'product_import_logs' AND policyname = 'Import logs are publicly readable'
  ) THEN
    CREATE POLICY "Import logs are publicly readable"
      ON product_import_logs FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- Insert default affiliate sources
INSERT INTO product_sources (name, slug, base_url, commission_rate, is_active) VALUES
  ('Amazon Brasil', 'amazon', 'https://amazon.com.br', 8.00, true),
  ('Shopee Brasil', 'shopee', 'https://shopee.com.br', 6.00, true),
  ('Magazine Luiza', 'magalu', 'https://magazineluiza.com.br', 5.00, true),
  ('Mercado Livre', 'mercadolivre', 'https://mercadolivre.com.br', 7.00, true),
  ('Americanas', 'americanas', 'https://americanas.com.br', 6.50, true),
  ('Manual Entry', 'manual', '', 0.00, true)
ON CONFLICT (slug) DO NOTHING;

-- Update existing products to have source
UPDATE products 
SET source = 'amazon', last_updated = now() 
WHERE source IS NULL OR source = '';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_source ON products(source);
CREATE INDEX IF NOT EXISTS idx_products_external_id ON products(external_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_priority ON products(priority DESC);
CREATE INDEX IF NOT EXISTS idx_products_last_updated ON products(last_updated);
CREATE INDEX IF NOT EXISTS idx_products_source_status ON products(source, status);

-- Create composite index for recommendation queries
CREATE INDEX IF NOT EXISTS idx_products_recommendation_query 
ON products(is_active, status, source, priority DESC, rating DESC);

-- Function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_product_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic last_updated
DROP TRIGGER IF EXISTS trigger_update_product_last_updated ON products;
CREATE TRIGGER trigger_update_product_last_updated
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_last_updated();

-- Function for bulk product upsert (for CSV imports)
CREATE OR REPLACE FUNCTION bulk_upsert_products(products_data jsonb)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  success_count integer := 0;
  error_count integer := 0;
  errors jsonb := '[]'::jsonb;
  product_record jsonb;
BEGIN
  -- Loop through each product in the input data
  FOR product_record IN SELECT * FROM jsonb_array_elements(products_data)
  LOOP
    BEGIN
      -- Upsert individual product
      INSERT INTO products (
        name, description, price_brl, image_url, affiliate_link,
        source, external_id, category_id, emotional_tags,
        personality_match, age_range, relationship_types,
        budget_range, occasion_tags, priority, status
      ) VALUES (
        product_record->>'name',
        product_record->>'description',
        (product_record->>'price_brl')::decimal,
        product_record->>'image_url',
        product_record->>'affiliate_link',
        COALESCE(product_record->>'source', 'manual'),
        product_record->>'external_id',
        product_record->>'category_id',
        CASE 
          WHEN product_record->'emotional_tags' IS NOT NULL 
          THEN ARRAY(SELECT jsonb_array_elements_text(product_record->'emotional_tags'))
          ELSE '{}'::text[]
        END,
        CASE 
          WHEN product_record->'personality_match' IS NOT NULL 
          THEN ARRAY(SELECT jsonb_array_elements_text(product_record->'personality_match'))
          ELSE '{}'::text[]
        END,
        CASE 
          WHEN product_record->'age_range' IS NOT NULL 
          THEN ARRAY(SELECT jsonb_array_elements_text(product_record->'age_range'))
          ELSE '{}'::text[]
        END,
        CASE 
          WHEN product_record->'relationship_types' IS NOT NULL 
          THEN ARRAY(SELECT jsonb_array_elements_text(product_record->'relationship_types'))
          ELSE '{}'::text[]
        END,
        product_record->>'budget_range',
        CASE 
          WHEN product_record->'occasion_tags' IS NOT NULL 
          THEN ARRAY(SELECT jsonb_array_elements_text(product_record->'occasion_tags'))
          ELSE '{}'::text[]
        END,
        COALESCE((product_record->>'priority')::integer, 0),
        COALESCE(product_record->>'status', 'active')
      )
      ON CONFLICT (affiliate_link) 
      DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        price_brl = EXCLUDED.price_brl,
        image_url = EXCLUDED.image_url,
        source = EXCLUDED.source,
        external_id = EXCLUDED.external_id,
        category_id = EXCLUDED.category_id,
        emotional_tags = EXCLUDED.emotional_tags,
        personality_match = EXCLUDED.personality_match,
        age_range = EXCLUDED.age_range,
        relationship_types = EXCLUDED.relationship_types,
        budget_range = EXCLUDED.budget_range,
        occasion_tags = EXCLUDED.occasion_tags,
        priority = EXCLUDED.priority,
        status = EXCLUDED.status,
        updated_at = now();

      success_count := success_count + 1;

    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      errors := errors || jsonb_build_object(
        'product', product_record->>'name',
        'error', SQLERRM
      );
    END;
  END LOOP;

  result := jsonb_build_object(
    'success_count', success_count,
    'error_count', error_count,
    'errors', errors
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Sample data with multiple sources (using unique affiliate links)
INSERT INTO products (
  name, description, price_brl, image_url, affiliate_link, source, external_id,
  emotional_tags, personality_match, age_range, relationship_types, 
  budget_range, occasion_tags, priority, status
) VALUES 
(
  'Echo Dot (5ª Geração) - Amazon',
  'Smart speaker com Alexa, som premium e hub de casa inteligente integrado.',
  299.00,
  'https://images.pexels.com/photos/4790268/pexels-photo-4790268.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://amazon.com.br/echo-dot-5-geracao-alexa-2024',
  'amazon',
  'B09B8V1LZ3',
  ARRAY['tecnologia', 'praticidade', 'inovação'],
  ARRAY['Prática e organizada', 'Aventureira e espontânea'],
  ARRAY['26-35 anos', '36-50 anos'],
  ARRAY['Marido/Esposa', 'Amigo(a)', 'Irmão/Irmã'],
  'R$ 151 - R$ 300',
  ARRAY['Aniversário', 'Natal', 'Sem ocasião especial'],
  10,
  'active'
),
(
  'Kit Skincare Completo - Shopee',
  'Kit com limpador facial, tônico, sérum e hidratante para cuidados diários.',
  89.90,
  'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://shopee.com.br/kit-skincare-completo-facial-2024',
  'shopee',
  'SK123456',
  ARRAY['autocuidado', 'beleza', 'rotina'],
  ARRAY['Calma e reflexiva', 'Sociável e extrovertida'],
  ARRAY['18-25 anos', '26-35 anos', '36-50 anos'],
  ARRAY['Namorado(a)', 'Irmão/Irmã', 'Amigo(a)'],
  'R$ 51 - R$ 150',
  ARRAY['Aniversário', 'Dia dos Namorados', 'Sem ocasião especial'],
  8,
  'active'
),
(
  'Cafeteira Expresso Automática - Magazine Luiza',
  'Cafeteira com moedor integrado, 15 bar de pressão e sistema de aquecimento rápido.',
  899.00,
  'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://magazineluiza.com.br/cafeteira-expresso-automatica-premium',
  'magalu',
  'CF789012',
  ARRAY['café', 'sofisticação', 'prazer'],
  ARRAY['Prática e organizada', 'Calma e reflexiva'],
  ARRAY['36-50 anos', '51-65 anos'],
  ARRAY['Marido/Esposa', 'Mãe/Pai'],
  'Acima de R$ 500',
  ARRAY['Aniversário', 'Natal', 'Dia das Mães/Pais'],
  9,
  'active'
),
(
  'Fone JBL Tune 760NC - Mercado Livre',
  'Fone de ouvido wireless com cancelamento de ruído ativo e 35h de bateria.',
  399.00,
  'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://mercadolivre.com.br/fone-jbl-tune-760nc-wireless',
  'mercadolivre',
  'JBL760NC',
  ARRAY['música', 'tecnologia', 'qualidade'],
  ARRAY['Aventureira e espontânea', 'Sociável e extrovertida'],
  ARRAY['18-25 anos', '26-35 anos'],
  ARRAY['Namorado(a)', 'Irmão/Irmã', 'Amigo(a)'],
  'R$ 301 - R$ 500',
  ARRAY['Aniversário', 'Natal', 'Conquista pessoal'],
  7,
  'active'
),
(
  'Kit Churrasco Premium - Americanas',
  'Kit com 12 peças: facas, garfos, pegadores e tábua de bambu.',
  159.90,
  'https://images.pexels.com/photos/1260968/pexels-photo-1260968.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://americanas.com.br/kit-churrasco-premium-12-pecas',
  'americanas',
  'CH345678',
  ARRAY['churrasco', 'família', 'tradição'],
  ARRAY['Sociável e extrovertida', 'Prática e organizada'],
  ARRAY['26-35 anos', '36-50 anos', '51-65 anos'],
  ARRAY['Marido/Esposa', 'Mãe/Pai', 'Amigo(a)'],
  'R$ 151 - R$ 300',
  ARRAY['Aniversário', 'Dia dos Pais', 'Sem ocasião especial'],
  6,
  'active'
)
ON CONFLICT (affiliate_link) DO NOTHING;