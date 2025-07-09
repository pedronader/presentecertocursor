import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LandingPage } from './components/LandingPage';
import { Quiz } from './components/quiz/Quiz';
import { Results } from './components/results/Results';
import { SEOLandingPage } from './components/seo/SEOLandingPage';
import { Header } from './components/ui/Header';
import { QuizData } from './types/quiz';
import { SitemapRoute } from './components/seo/SitemapRoute';
import { RobotsRoute } from './components/seo/RobotsRoute';
import { AnalyticsProvider } from './components/analytics/AnalyticsProvider';

export type AppState = 'landing' | 'quiz' | 'results';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('landing');
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  const handleStartQuiz = () => {
    setCurrentState('quiz');
  };

  const handleQuizComplete = (data: QuizData, sessionId: string) => {
    setQuizData(data);
    setSessionId(sessionId);
    setCurrentState('results');
  };

  const handleRestart = () => {
    setCurrentState('landing');
    setQuizData(null);
    setSessionId('');
  };

  return (
    <HelmetProvider>
      <AnalyticsProvider
        ga4MeasurementId="G-XXXXXXXXXX" // Replace with your actual GA4 ID
        gscVerificationToken="your-gsc-verification-token-here" // Replace with your actual GSC token
      >
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
            <Routes>

              {/* SEO Routes */}
              <Route path="/sitemap.xml" element={<SitemapRoute />} />
              <Route path="/robots.txt" element={<RobotsRoute />} />
              
              {/* SEO Landing Pages */}
              <Route path="/presente-para/:slug" element={<SEOLandingPage />} />
              
              {/* Main App Route */}
              <Route path="/" element={
                <>
                  <Header currentState={currentState} onRestart={handleRestart} />
                  
                  {currentState === 'landing' && (
                    <LandingPage onStartQuiz={handleStartQuiz} />
                  )}
                  
                  {currentState === 'quiz' && (
                    <Quiz onComplete={handleQuizComplete} />
                  )}
                  
                  {currentState === 'results' && quizData && (
                    <Results 
                      quizData={quizData} 
                      sessionId={sessionId}
                      onRestart={handleRestart} 
                    />
                  )}
                </>
              } />
              
              {/* Catch all route for 404 */}
              <Route path="*" element={
                <>
                  <Header currentState="landing" onRestart={() => window.location.href = '/'} />
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Página não encontrada</h1>
                    <p className="text-lg text-gray-600 mb-8">
                      A página que você está procurando não existe.
                    </p>
                    <button
                      onClick={() => window.location.href = '/'}
                      className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all"
                    >
                      Voltar ao início
                    </button>
                  </div>
                </>
              } />
            </Routes>
          </div>
        </Router>
      </AnalyticsProvider>
    </HelmetProvider>
  );
}

export default App;