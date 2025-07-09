import { Question } from '../types/quiz';

export const questions: Question[] = [
  {
    id: 'relationship',
    text: 'Qual o seu relacionamento com a pessoa?',
    options: [
      { text: 'Namorado(a)', value: 1, emoji: '💕' },
      { text: 'Marido/Esposa', value: 2, emoji: '💑' },
      { text: 'Mãe/Pai', value: 3, emoji: '👨‍👩‍👧‍👦' },
      { text: 'Irmão/Irmã', value: 4, emoji: '👫' },
      { text: 'Amigo(a)', value: 5, emoji: '🤝' },
      { text: 'Outro familiar', value: 6, emoji: '👪' }
    ]
  },
  {
    id: 'age',
    text: 'Qual a faixa etária da pessoa?',
    options: [
      { text: '18-25 anos', value: 1, emoji: '🎓' },
      { text: '26-35 anos', value: 2, emoji: '💼' },
      { text: '36-50 anos', value: 3, emoji: '🏡' },
      { text: '51-65 anos', value: 4, emoji: '👨‍💼' },
      { text: '65+ anos', value: 5, emoji: '👴' }
    ]
  },
  {
    id: 'personality',
    text: 'Como você descreveria a personalidade dela?',
    options: [
      { text: 'Aventureira e espontânea', value: 1, emoji: '🌟' },
      { text: 'Calma e reflexiva', value: 2, emoji: '🧘‍♀️' },
      { text: 'Criativa e artística', value: 3, emoji: '🎨' },
      { text: 'Prática e organizada', value: 4, emoji: '📋' },
      { text: 'Sociável e extrovertida', value: 5, emoji: '🎉' }
    ]
  },
  {
    id: 'interests',
    text: 'Quais são os principais interesses dela?',
    options: [
      { text: 'Esportes e fitness', value: 1, emoji: '🏃‍♀️' },
      { text: 'Leitura e cultura', value: 2, emoji: '📚' },
      { text: 'Tecnologia e gadgets', value: 3, emoji: '📱' },
      { text: 'Culinária e gastronomia', value: 4, emoji: '👨‍🍳' },
      { text: 'Moda e beleza', value: 5, emoji: '💄' },
      { text: 'Viagens e aventuras', value: 6, emoji: '✈️' }
    ]
  },
  {
    id: 'occasion',
    text: 'Qual é a ocasião do presente?',
    options: [
      { text: 'Aniversário', value: 1, emoji: '🎂' },
      { text: 'Dia dos Namorados', value: 2, emoji: '💝' },
      { text: 'Natal', value: 3, emoji: '🎄' },
      { text: 'Dia das Mães/Pais', value: 4, emoji: '🌹' },
      { text: 'Sem ocasião especial', value: 5, emoji: '💐' },
      { text: 'Conquista pessoal', value: 6, emoji: '🏆' }
    ]
  },
  {
    id: 'budget',
    text: 'Qual o seu orçamento?',
    options: [
      { text: 'Até R$ 50', value: 1, emoji: '💰' },
      { text: 'R$ 51 - R$ 150', value: 2, emoji: '💸' },
      { text: 'R$ 151 - R$ 300', value: 3, emoji: '💳' },
      { text: 'R$ 301 - R$ 500', value: 4, emoji: '🏦' },
      { text: 'Acima de R$ 500', value: 5, emoji: '💎' }
    ]
  },
  {
    id: 'surprise',
    text: 'Que tipo de surpresa ela mais aprecia?',
    options: [
      { text: 'Algo útil para o dia a dia', value: 1, emoji: '🏠' },
      { text: 'Experiências memoráveis', value: 2, emoji: '🎪' },
      { text: 'Algo feito à mão/personalizado', value: 3, emoji: '💝' },
      { text: 'Luxo e sofisticação', value: 4, emoji: '👑' },
      { text: 'Algo engraçado e divertido', value: 5, emoji: '😄' }
    ]
  },
  {
    id: 'emotional',
    text: 'O que você mais quer transmitir com este presente?',
    options: [
      { text: 'Amor e carinho', value: 1, emoji: '❤️' },
      { text: 'Gratidão e reconhecimento', value: 2, emoji: '🙏' },
      { text: 'Apoio e encorajamento', value: 3, emoji: '💪' },
      { text: 'Diversão e alegria', value: 4, emoji: '😊' },
      { text: 'Cuidado e proteção', value: 5, emoji: '🛡️' }
    ]
  }
];