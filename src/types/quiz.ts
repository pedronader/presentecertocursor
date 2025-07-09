export interface QuizAnswer {
  questionId: string;
  answer: string;
  value: number;
}

export interface QuizData {
  answers: QuizAnswer[];
  recipientProfile: RecipientProfile;
}

export interface RecipientProfile {
  relationship: string;
  age: string;
  interests: string[];
  personality: string;
  occasion: string;
  budget: string;
}

export interface Question {
  id: string;
  text: string;
  options: {
    text: string;
    value: number;
    emoji: string;
  }[];
}

export interface GiftRecommendation {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  emotionalExplanation: string;
  affiliateLink: string;
  category: string;
}