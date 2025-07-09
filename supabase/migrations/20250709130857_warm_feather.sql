/*
  # Fix quiz_session_id column type mismatch

  1. Changes
    - Change `quiz_session_id` column type from UUID to TEXT in `email_subscribers` table
    - Change `quiz_session_id` column type from UUID to TEXT in `affiliate_clicks` table  
    - Change `quiz_session_id` column type from UUID to TEXT in `recommendations` table
    - Update foreign key constraints to reference the new TEXT type
    - Change `session_id` column type from TEXT to TEXT (already correct) in `quiz_sessions` table

  2. Security
    - Maintain existing RLS policies
    - Preserve all existing data during migration

  3. Notes
    - This fixes the type mismatch where the application generates string session IDs
    - but the database expects UUID format
*/

-- First, drop the foreign key constraints that reference quiz_sessions(id)
ALTER TABLE IF EXISTS email_subscribers 
DROP CONSTRAINT IF EXISTS email_subscribers_quiz_session_id_fkey;

ALTER TABLE IF EXISTS affiliate_clicks 
DROP CONSTRAINT IF EXISTS affiliate_clicks_quiz_session_id_fkey;

ALTER TABLE IF EXISTS recommendations 
DROP CONSTRAINT IF EXISTS recommendations_quiz_session_id_fkey;

-- Change the quiz_session_id column type to TEXT in email_subscribers
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'email_subscribers' 
    AND column_name = 'quiz_session_id' 
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE email_subscribers 
    ALTER COLUMN quiz_session_id TYPE TEXT;
  END IF;
END $$;

-- Change the quiz_session_id column type to TEXT in affiliate_clicks
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'affiliate_clicks' 
    AND column_name = 'quiz_session_id' 
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE affiliate_clicks 
    ALTER COLUMN quiz_session_id TYPE TEXT;
  END IF;
END $$;

-- Change the quiz_session_id column type to TEXT in recommendations
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recommendations' 
    AND column_name = 'quiz_session_id' 
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE recommendations 
    ALTER COLUMN quiz_session_id TYPE TEXT;
  END IF;
END $$;

-- Now we need to create new foreign key constraints that reference session_id (TEXT) instead of id (UUID)
-- Add foreign key constraint for email_subscribers referencing quiz_sessions.session_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'email_subscribers_quiz_session_id_fkey'
    AND table_name = 'email_subscribers'
  ) THEN
    ALTER TABLE email_subscribers 
    ADD CONSTRAINT email_subscribers_quiz_session_id_fkey 
    FOREIGN KEY (quiz_session_id) REFERENCES quiz_sessions(session_id);
  END IF;
END $$;

-- Add foreign key constraint for affiliate_clicks referencing quiz_sessions.session_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'affiliate_clicks_quiz_session_id_fkey'
    AND table_name = 'affiliate_clicks'
  ) THEN
    ALTER TABLE affiliate_clicks 
    ADD CONSTRAINT affiliate_clicks_quiz_session_id_fkey 
    FOREIGN KEY (quiz_session_id) REFERENCES quiz_sessions(session_id);
  END IF;
END $$;

-- Add foreign key constraint for recommendations referencing quiz_sessions.session_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'recommendations_quiz_session_id_fkey'
    AND table_name = 'recommendations'
  ) THEN
    ALTER TABLE recommendations 
    ADD CONSTRAINT recommendations_quiz_session_id_fkey 
    FOREIGN KEY (quiz_session_id) REFERENCES quiz_sessions(session_id);
  END IF;
END $$;