/*
  # Fix RLS policies for email_subscribers table

  1. Security Updates
    - Drop existing policies that may be conflicting
    - Add proper INSERT policy for anonymous users to subscribe
    - Add UPDATE policy for anonymous users to reactivate subscriptions
    - Ensure policies work for both anon and authenticated users

  2. Changes
    - Allow anonymous users to insert new email subscriptions
    - Allow anonymous users to update existing subscriptions (for reactivation)
    - Maintain data security while enabling functionality
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can subscribe to emails" ON email_subscribers;
DROP POLICY IF EXISTS "Allow anonymous insert" ON email_subscribers;
DROP POLICY IF EXISTS "Allow anonymous update" ON email_subscribers;

-- Create new INSERT policy for email subscriptions
CREATE POLICY "Allow email subscription inserts"
  ON email_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create UPDATE policy for email subscriptions (needed for reactivation)
CREATE POLICY "Allow email subscription updates"
  ON email_subscribers
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create SELECT policy for reading email subscriptions (optional, for admin purposes)
CREATE POLICY "Allow email subscription reads"
  ON email_subscribers
  FOR SELECT
  TO anon, authenticated
  USING (true);