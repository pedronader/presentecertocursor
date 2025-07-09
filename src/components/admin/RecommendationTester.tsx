import React, { useState } from 'react';
import { Brain, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { RecommendationService } from '../../services/recommendationService';

export const RecommendationTester: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [recommendationService] = useState(() => new RecommendationService());

  const testScenarios = [
    {
      name: 'Namorada Jovem - Orçamento Baixo',
      input: {
        relationship: 'Namorado(a)',
        age: '18-25 anos',
        personality: 'Sociável e extrovertida',
        interests: ['Moda e beleza'],
        occasion: 'Dia dos Namorados',
        budget: 'Até R$ 50',
        emotional: 'Amor e carinho',
        surprise: 'Algo engraçado e divertido'
      }
    },
    {
      name: 'Mãe - Orçamento Médio',
      input: {
        relationship: 'Mãe/Pai',
        age: '51-65 anos',
        personality: 'Calma e reflexiva',
        interests: ['Culinária e gastronomia'],
        occasion: 'Dia das Mães/Pais',
        budget: 'R$ 51 - R$ 150',
        emotional: 'Gratidão e reconhecimento',
        surprise: 'Algo útil para o dia a dia'
      }
    },
    {
      name: 'Amigo Aventureiro - Orçamento Alto',
      input: {
        relationship: 'Amigo(a)',
        age: '26-35 anos',
        personality: 'Aventureira e espontânea',
        interests: ['Esportes e fitness'],
        occasion: 'Aniversário',
        budget: 'R$ 151 - R$ 300',
        emotional: 'Apoio e encorajamento',
        surprise: 'Experiências memoráveis'
      }
    }
  ];

  const runTest = async (scenario: any) => {
    setIsRunning(true);
    setTestResult(null);

    try {
      const result = await recommendationService.testRecommendations(scenario.input);
      setTestResult({
        scenario: scenario.name,
        success: true,
        data: result
      });
    } catch (error) {
      setTestResult({
        scenario: scenario.name,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Testar Recomendações
          </h3>
        </div>
      </div>

      <p className="text-gray-600 mb-6">
        Teste o sistema de recomendações com diferentes cenários de usuário.
      </p>

      <div className="space-y-4 mb-6">
        {testScenarios.map((scenario, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{scenario.name}</h4>
              <button
                onClick={() => runTest(scenario)}
                disabled={isRunning}
                className="flex items-center space-x-1 bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
              >
                <Play className="w-3 h-3" />
                <span>Testar</span>
              </button>
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>Relacionamento:</strong> {scenario.input.relationship}</p>
              <p><strong>Orçamento:</strong> {scenario.input.budget}</p>
              <p><strong>Personalidade:</strong> {scenario.input.personality}</p>
            </div>
          </div>
        ))}
      </div>

      {isRunning && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Executando teste...</p>
        </div>
      )}

      {testResult && (
        <div className={`p-4 rounded-lg border ${
          testResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-2">
            {testResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`font-medium ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.scenario} - {testResult.success ? 'Sucesso' : 'Erro'}
              </h4>
              
              {testResult.success ? (
                <div className="mt-2">
                  <p className="text-green-700 text-sm mb-2">
                    {testResult.data.count} recomendações encontradas
                  </p>
                  <div className="space-y-1">
                    {testResult.data.recommendations?.slice(0, 3).map((rec: any, i: number) => (
                      <div key={i} className="text-xs text-green-600 bg-green-100 p-2 rounded">
                        <strong>{rec.name}</strong> - {rec.price} (Score: {rec.match_score})
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-red-700 text-sm mt-1">
                  {testResult.error}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};