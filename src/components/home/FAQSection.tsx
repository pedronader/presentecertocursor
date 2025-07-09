import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'O quiz do PresenteCerto é realmente gratuito?',
    answer: 'Sim! O PresenteCerto é 100% gratuito — você pode usar nosso quiz de presente quantas vezes quiser, sem taxas e sem precisar pagar para encontrar o presente ideal.',
  },
  {
    question: 'Preciso me cadastrar para usar o site?',
    answer: 'Não. Para escolher presente criativo de forma rápida você não precisa fazer cadastro. É só responder o quiz e receber sugestões personalizadas na hora.',
  },
  {
    question: 'Como a IA escolhe os presentes ideais?',
    answer: 'Nossa inteligência artificial analisa suas respostas sobre a personalidade, ocasião e orçamento para gerar a melhor sugestão de presente sob medida, combinando dados de tendências e feedbacks reais.',
  },
  {
    question: 'Onde posso comprar os presentes recomendados?',
    answer: 'Cada presente contém um link direto para lojas confiáveis. Basta clicar e você será redirecionado para comprar o presente perfeito com segurança.',
  },
  {
    question: 'É confiável comprar pelos links indicados?',
    answer: 'Sim. Trabalhamos com parceiros reconhecidos e avaliamos a reputação de cada loja para garantir uma compra segura e sem surpresas.',
  },
  {
    question: 'Qual o nível de personalização das sugestões?',
    answer: 'Usamos IA e seu perfil respondido no quiz para entregar sugestões altamente personalizadas — desde presentes criativos até opções clássicas, tudo feito para o seu caso específico.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="my-12">
      <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
        Perguntas Frequentes
      </h3>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="w-full flex justify-between items-center p-4 focus:outline-none"
              onClick={() => toggle(index)}
            >
              <span className="text-left font-medium text-gray-800">
                {faq.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transform transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
              />
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed bg-gray-50">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 