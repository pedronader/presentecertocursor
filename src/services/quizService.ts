import { supabase } from '../lib/supabase';
import { QuizAnswer, RecipientProfile } from '../types/quiz';

export class QuizService {
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

   private generateSessionId(): string {
   return `quiz_${crypto.randomUUID()}`;
   }


  async saveQuizSession(answers: QuizAnswer[], recipientProfile: RecipientProfile) {
    try {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .insert({
          session_id: this.sessionId,
          answers: answers,
          recipient_profile: recipientProfile,
          completed_at: new Date().toISOString(),
          user_agent: navigator.userAgent
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving quiz session:', error);
      throw error;
    }
  }

  async saveRecommendations(quizSessionId: string, recommendations: any[]) {
    try {
      const recommendationData = recommendations.map((rec, index) => ({
        quiz_session_id: this.sessionId,
        product_id: rec.id,
        rank_position: index + 1,
        match_score: rec.score || 0,
        emotional_explanation: rec.emotionalExplanation
      }));

      const { data, error } = await supabase
        .from('recommendations')
        .insert(recommendationData)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving recommendations:', error);
      throw error;
    }
  }

  async trackAffiliateClick(productId: string, quizSessionId?: string) {
    try {
      const { data, error } = await supabase
        .from('affiliate_clicks')
        .insert({
          product_id: productId,
          quiz_session_id: quizSessionId || this.sessionId,
          clicked_at: new Date().toISOString(),
          user_agent: navigator.userAgent,
          referrer: document.referrer
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error tracking affiliate click:', error);
      // Don't throw error for tracking failures
    }
  }

  // Track page views for analytics
  trackPageView(path: string, title?: string) {
    // This could be extended to save page views to Supabase for internal analytics
    console.log(`Page view: ${path} - ${title || 'Unknown'}`);
  }

  getSessionId(): string {
    return this.sessionId;
  }
}