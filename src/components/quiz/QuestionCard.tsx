import React from 'react';
import { Question } from '../../types/quiz';

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string, value: number) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
        {question.text}
      </h3>
      
      <div className="space-y-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswer(option.text, option.value)}
            className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200 hover:scale-102 group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{option.emoji}</span>
              <span className="text-lg text-gray-800 group-hover:text-red-600">
                {option.text}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};