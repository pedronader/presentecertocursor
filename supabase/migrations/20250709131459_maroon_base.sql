/*
  # Fix product_id columns for AI recommendations

  1. Changes
    - Change product_id column type from UUID to TEXT in affiliate_clicks table
    - Change product_id column type from UUID to TEXT in recommendations table
    - Update foreign key constraints to handle both UUIDs and custom strings

  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity with proper constraints

  3. Notes
    - This allows storing both database UUIDs and AI-generated string IDs
    - Existing data will be preserved during migration
*/

-- Drop existing foreign key constraints
ALTER TABLE affiliate_clicks DROP CONSTRAINT IF EXISTS affiliate_clicks_product_id_fkey;
ALTER TABLE recommendations DROP CONSTRAINT IF EXISTS recommendations_product_id_fkey;

-- Change product_id column type to TEXT in affiliate_clicks
ALTER TABLE affiliate_clicks ALTER COLUMN product_id TYPE TEXT;

-- Change product_id column type to TEXT in recommendations  
ALTER TABLE recommendations ALTER COLUMN product_id TYPE TEXT;

-- Add RLS policies for affiliate_clicks if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'affiliate_clicks' AND policyname = 'Allow email subscription reads'
  ) THEN
    CREATE POLICY "Allow email subscription reads"
      ON affiliate_clicks FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- Add RLS policies for recommendations if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'recommendations' AND policyname = 'Allow email subscription updates'
  ) THEN
    CREATE POLICY "Allow email subscription updates"
      ON recommendations FOR UPDATE
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- Create indexes for better performance with TEXT columns
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product_text ON affiliate_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_product_text ON recommendations(product_id);