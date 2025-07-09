import { QuizAnswer, RecipientProfile } from '../types/quiz';

export const generateRecipientProfile = (answers: QuizAnswer[]): RecipientProfile => {
  const answerMap = new Map<string, QuizAnswer>();
  answers.forEach(answer => {
    answerMap.set(answer.questionId, answer);
  });

  const relationship = answerMap.get('relationship')?.answer || 'Amigo(a)';
  const age = answerMap.get('age')?.answer || '26-35 anos';
  const personality = answerMap.get('personality')?.answer || 'Sociável e extrovertida';
  const occasion = answerMap.get('occasion')?.answer || 'Aniversário';
  const budget = answerMap.get('budget')?.answer || 'R$ 51 - R$ 150';
  
  // Extract interests from multiple answers
  const interests = [
    answerMap.get('interests')?.answer || 'Moda e beleza',
    answerMap.get('surprise')?.answer || 'Algo útil para o dia a dia',
    answerMap.get('emotional')?.answer || 'Amor e carinho'
  ];

  return {
    relationship,
    age,
    interests,
    personality,
    occasion,
    budget
  };
};