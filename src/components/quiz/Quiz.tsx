import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { QuestionCard } from './QuestionCard';
import { ProgressBar } from './ProgressBar';
import { questions } from '../../data/questions';
import { QuizData, QuizAnswer } from '../../types/quiz';
import { generateRecipientProfile } from '../../utils/profileMatcher';
import { QuizService } from '../../services/quizService';
import { useAnalytics } from '../analytics/AnalyticsProvider';

interface QuizProps {
  onComplete: (data: QuizData, sessionId: string) => void;
}

export const Quiz: React.FC<QuizProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [quizService] = useState(() => new QuizService());
  const { analytics, consent } = useAnalytics();

  // Track quiz start
  useEffect(() => {
    if (consent.analytics) {
      analytics.trackQuizStart(quizService.getSessionId());
    }
  }, [analytics, consent.analytics, quizService]);

  const handleAnswer = async (answer: string, value: number) => {
    const newAnswer: QuizAnswer = {
      questionId: questions[currentQuestion].id,
      answer,
      value,
    };

    const newAnswers = [...answers];
    if (newAnswers.length > currentQuestion) {
      // Replace existing answer when revisiting
      newAnswers[currentQuestion] = newAnswer;
    } else {
      newAnswers.push(newAnswer);
    }
    setAnswers(newAnswers);

    setIsTransitioning(true);

    setTimeout(async () => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setIsTransitioning(false);
      } else {
        // Quiz complete - save to database
        try {
          const recipientProfile = generateRecipientProfile(newAnswers);
          const quizData: QuizData = {
            answers: newAnswers,
            recipientProfile,
          };

          // Save quiz session to Supabase
          await quizService.saveQuizSession(newAnswers, recipientProfile);
          
          // Track quiz completion
          if (consent.analytics) {
            analytics.trackQuizComplete(quizService.getSessionId(), recipientProfile);
          }
          
          onComplete(quizData, quizService.getSessionId());
        } catch (error) {
          console.error('Error saving quiz session:', error);
          // Continue with quiz completion even if save fails
          const recipientProfile = generateRecipientProfile(newAnswers);
          const quizData: QuizData = {
            answers: newAnswers,
            recipientProfile,
          };
          onComplete(quizData, quizService.getSessionId());
          
          // Track completion even if save failed
          if (consent.analytics) {
            analytics.trackQuizComplete(quizService.getSessionId(), recipientProfile);
          }
        }
      }
    }, 300);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleBack = () => {
    if (currentQuestion === 0) return;
    setCurrentQuestion(currentQuestion - 1);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProgressBar progress={progress} />
      
      <div className="mb-8 flex items-center justify-between">
        {/* Back Button */}
        <button
          onClick={handleBack}
          disabled={currentQuestion === 0}
          title="Voltar para pergunta anterior"
          className={`flex items-center space-x-2 text-sm font-medium px-4 py-2 rounded-full border transition-colors focus:outline-none ${
            currentQuestion === 0 ? 'cursor-not-allowed text-gray-300 border-gray-200' : 'text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-red-500'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <p className="text-sm text-gray-500 text-center flex-1">
          Pergunta {currentQuestion + 1} de {questions.length}
        </p>
        <div className="w-16" /> {/* spacer to balance layout */}
      </div>

      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-x-8' : 'opacity-100 transform translate-x-0'}`}>
        <QuestionCard
          question={questions[currentQuestion]}
          onAnswer={handleAnswer}
        />
      </div>
    </div>
  );
};