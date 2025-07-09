import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          emoji: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          emoji?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          emoji?: string | null;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          price_brl: number;
          image_url: string | null;
          affiliate_link: string;
          category_id: string | null;
          emotional_tags: string[];
          personality_match: string[];
          age_range: string[];
          relationship_types: string[];
          budget_range: string | null;
          occasion_tags: string[];
          is_active: boolean;
          stock_status: string;
          rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          price_brl: number;
          image_url?: string | null;
          affiliate_link: string;
          category_id?: string | null;
          emotional_tags?: string[];
          personality_match?: string[];
          age_range?: string[];
          relationship_types?: string[];
          budget_range?: string | null;
          occasion_tags?: string[];
          is_active?: boolean;
          stock_status?: string;
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price_brl?: number;
          image_url?: string | null;
          affiliate_link?: string;
          category_id?: string | null;
          emotional_tags?: string[];
          personality_match?: string[];
          age_range?: string[];
          relationship_types?: string[];
          budget_range?: string | null;
          occasion_tags?: string[];
          is_active?: boolean;
          stock_status?: string;
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      quiz_sessions: {
        Row: {
          id: string;
          session_id: string;
          answers: any;
          recipient_profile: any | null;
          completed_at: string | null;
          user_agent: string | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          answers?: any;
          recipient_profile?: any | null;
          completed_at?: string | null;
          user_agent?: string | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          answers?: any;
          recipient_profile?: any | null;
          completed_at?: string | null;
          user_agent?: string | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
      recommendations: {
        Row: {
          id: string;
          quiz_session_id: string | null;
          product_id: string | null;
          rank_position: number;
          match_score: number | null;
          emotional_explanation: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_session_id?: string | null;
          product_id?: string | null;
          rank_position: number;
          match_score?: number | null;
          emotional_explanation?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          quiz_session_id?: string | null;
          product_id?: string | null;
          rank_position?: number;
          match_score?: number | null;
          emotional_explanation?: string | null;
          created_at?: string;
        };
      };
      email_subscribers: {
        Row: {
          id: string;
          email: string;
          quiz_session_id: string | null;
          subscribed_at: string | null;
          is_active: boolean;
          preferences: any;
        };
        Insert: {
          id?: string;
          email: string;
          quiz_session_id?: string | null;
          subscribed_at?: string;
          is_active?: boolean;
          preferences?: any;
        };
        Update: {
          id?: string;
          email?: string;
          quiz_session_id?: string | null;
          subscribed_at?: string;
          is_active?: boolean;
          preferences?: any;
        };
      };
      affiliate_clicks: {
        Row: {
          id: string;
          product_id: string | null;
          quiz_session_id: string | null;
          clicked_at: string;
          user_agent: string | null;
          ip_address: string | null;
          referrer: string | null;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          quiz_session_id?: string | null;
          clicked_at?: string;
          user_agent?: string | null;
          ip_address?: string | null;
          referrer?: string | null;
        };
        Update: {
          id?: string;
          product_id?: string | null;
          quiz_session_id?: string | null;
          clicked_at?: string;
          user_agent?: string | null;
          ip_address?: string | null;
          referrer?: string | null;
        };
      };
    };
  };
}