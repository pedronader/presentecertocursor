import { supabase } from '../lib/supabase';

export class EmailService {
  async subscribeEmail(email: string, quizSessionId?: string): Promise<boolean> {
    try {
      console.log('Attempting to subscribe email:', { email, quizSessionId });
      
      const { data, error } = await supabase
        .from('email_subscribers')
        .insert({
          email: email,
          quiz_session_id: quizSessionId,
          is_active: true,
          preferences: {}
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        
        // If email already exists, update the subscription
        if (error.code === '23505') {
          console.log('Email already exists, updating subscription');
          const { error: updateError } = await supabase
            .from('email_subscribers')
            .update({
              is_active: true,
              quiz_session_id: quizSessionId,
              preferences: {}
            })
            .eq('email', email);

          if (updateError) {
            console.error('Update error:', updateError);
            throw updateError;
          }
          
          console.log('Email subscription updated successfully');
          return true;
        }
        throw error;
      }

      console.log('Email subscription created successfully:', data);
      return true;
    } catch (error) {
      console.error('Error subscribing email:', error);
      return false;
    }
  }

  async unsubscribeEmail(email: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_subscribers')
        .update({ is_active: false })
        .eq('email', email);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unsubscribing email:', error);
      return false;
    }
  }

  async getSubscriberCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('email_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting subscriber count:', error);
      return 0;
    }
  }
}