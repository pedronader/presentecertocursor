import React, { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { EmailService } from '../../services/emailService';
import { useAnalytics } from '../analytics/AnalyticsProvider';

interface EmailCaptureProps {
  onClose: () => void;
  quizSessionId?: string;
}

export const EmailCapture: React.FC<EmailCaptureProps> = ({ onClose, quizSessionId }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailService] = useState(() => new EmailService());
  const { analytics, consent } = useAnalytics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.trim()) {
      alert('Por favor, insira um email válido.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      console.log('Submitting email subscription:', { email, quizSessionId });
      
      const success = await emailService.subscribeEmail(email, quizSessionId);
      
      if (success) {
        console.log('Email subscription successful');
        setIsSuccess(true);
        
        // Track email subscription
        if (consent.analytics) {
          analytics.trackEmailSubscription(quizSessionId);
        }
        
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        console.error('Email subscription failed');
        alert('Erro ao cadastrar email. Verifique sua conexão e tente novamente.');
      }
    } catch (error) {
      console.error('Error subscribing email:', error);
      alert('Erro ao cadastrar email. Verifique sua conexão e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Receba dicas exclusivas!
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Cadastre seu email para receber:
              </p>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>• Dicas personalizadas de presentes</li>
                <li>• Lembretes para datas especiais</li>
                <li>• Promoções exclusivas</li>
              </ul>
              
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Cadastrando...' : 'Quero receber dicas!'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              Cadastro realizado!
            </h4>
            <p className="text-gray-600">
              Você receberá nossas dicas exclusivas em breve!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};