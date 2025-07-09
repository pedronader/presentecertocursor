import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, RotateCcw } from 'lucide-react';
import { AppState } from '../../App';

interface HeaderProps {
  currentState: AppState;
  onRestart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentState, onRestart }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isHomePage = location.pathname === '/';
  const isSEOPage = location.pathname.startsWith('/presente-para-');

  const handleLogoClick = () => {
    if (isSEOPage) {
      navigate('/');
    } else {
      onRestart();
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">PresenteCerto</h1>
          </button>
          
          {(currentState !== 'landing' || isSEOPage) && (
            <button
              onClick={onRestart}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="hidden sm:inline">
                {isSEOPage ? 'Fazer Quiz' : 'Recomeçar'}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};