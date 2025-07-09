import React, { useState } from 'react';
import { Brain, Zap, CheckCircle, AlertCircle, Loader, Settings } from 'lucide-react';
import { EnhancedRecommendationService } from '../../services/enhancedRecommendationService';
import { PerplexityRecommender } from '../../services/perplexityRecommender';

export const AIRecommendationTester: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [serviceStatus, setServiceStatus] = useState<any>(null);
  const [enhancedService] = useState(() => new EnhancedRecommendationService());
  const [perplexityService] = useState(() => new PerplexityRecommender());

  const testScenarios = [
    {
      name: 'Mãe Criativa - Aniversário',
      input: {
        answers: [
          { questionId: 'relationship', answer: 'Mãe/Pai', value: 3 },
          { questionId: 'age', answer: '45-55 anos', value: 4 },
          { questionId: 'personality', answer: 'Criativa e artística', value: 3 },
          { questionId: 'interests', answer: 'Arte e decoração', value: 2 },
          { questionId: 'occasion', answer: 'Aniversário', value: 1 },
          { questionId: 'budget', answer: 'R$ 51 - R$ 150', value: 2 },
          { questionId: 'emotional', answer: 'Amor e carinho', value: 1 },
          { questionId: 'surprise', answer: 'Algo feito à mão/personalizado', value: 3 }
        ],
        recipientProfile: {
          relationship: 'Mãe/Pai',
          age: '45-55 anos',
          personality: 'Criativa e artística',
          interests: ['Arte e decoração'],
          occasion: 'Aniversário',
          budget: 'R$ 51 - R$ 150'
        }
      }
    },
    {
      name: 'Namorada Romântica - Dia dos Namorados',
      input: {
        answers: [
          { questionId: 'relationship', answer: 'Namorado(a)', value: 1 },
          { questionId: 'age', answer: '22-28 anos', value: 1 },
          { questionId: 'personality', answer: 'Sociável e extrovertida', value: 5 },
          { questionId: 'interests', answer: 'Moda e beleza', value: 5 },
          { questionId: 'occasion', answer: 'Dia dos Namorados', value: 2 },
          { questionId: 'budget', answer: 'R$ 151 - R$ 300', value: 3 },
          { questionId: 'emotional', answer: 'Amor e carinho', value: 1 },
          { questionId: 'surprise', answer: 'Luxo e sofisticação', value: 4 }
        ],
        recipientProfile: {
          relationship: 'Namorado(a)',
          age: '22-28 anos',
          personality: 'Sociável e extrovertida',
          interests: ['Moda e beleza'],
          occasion: 'Dia dos Namorados',
          budget: 'R$ 151 - R$ 300'
        }
      }
    },
    {
      name: 'Amigo Aventureiro - Sem Ocasião',
      input: {
        answers: [
          { questionId: 'relationship', answer: 'Amigo(a)', value: 5 },
          { questionId: 'age', answer: '28-35 anos', value: 2 },
          { questionId: 'personality', answer: 'Aventureira e espontânea', value: 1 },
          { questionId: 'interests', answer: 'Esportes e fitness', value: 1 },
          { questionId: 'occasion', answer: 'Sem ocasião especial', value: 5 },
          { questionId: 'budget', answer: 'R$ 301 - R$ 500', value: 4 },
          { questionId: 'emotional', answer: 'Apoio e encorajamento', value: 3 },
          { questionId: 'surprise', answer: 'Experiências memoráveis', value: 2 }
        ],
        recipientProfile: {
          relationship: 'Amigo(a)',
          age: '28-35 anos',
          personality: 'Aventureira e espontânea',
          interests: ['Esportes e fitness'],
          occasion: 'Sem ocasião especial',
          budget: 'R$ 301 - R$ 500'
        }
      }
    }
  ];

  const loadServiceStatus = async () => {
    try {
      const status = enhancedService.getServiceStatus();
      const productCount = await status.productCount;
      
      setServiceStatus({
        ...status,
        productCount
      });
    } catch (error) {
      console.error('Error loading service status:', error);
    }
  };

  React.useEffect(() => {
    loadServiceStatus();
  }, []);

  const runAITest = async (scenario: any) => {
    setIsRunning(true);
    setTestResult(null);

    try {
      const result = await enhancedService.getAIEnhancedRecommendations(scenario.input);
      
      setTestResult({
        scenario: scenario.name,
        success: true,
        type: 'full_ai',
        data: {
          count: result.length,
          recommendations: result
        }
      });
    } catch (error) {
      setTestResult({
        scenario: scenario.name,
        success: false,
        type: 'full_ai',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runPerplexityTest = async () => {
    setIsRunning(true);
    setTestResult(null);

    try {
      const result = await perplexityService.testRecommendation();
      
      setTestResult({
        scenario: 'Teste Direto Perplexity API',
        success: result.success,
        type: 'perplexity_only',
        data: result.recommendations ? {
          count: result.recommendations.length,
          recommendations: result.recommendations
        } : null,
        error: result.error
      });
    } catch (error) {
      setTestResult({
        scenario: 'Teste Direto Perplexity API',
        success: false,
        type: 'perplexity_only',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Status do Serviço AI
            </h3>
          </div>
          <button
            onClick={loadServiceStatus}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Atualizar
          </button>
        </div>

        {serviceStatus && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${serviceStatus.aiAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {serviceStatus.aiAvailable ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-600">Perplexity API</div>
              <div className="text-xs text-gray-500 mt-1">
                {serviceStatus.usageInfo.hasApiKey ? 'Configurada' : 'Não configurada'}
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {serviceStatus.productCount || 0}
              </div>
              <div className="text-sm text-gray-600">Produtos Ativos</div>
              <div className="text-xs text-gray-500 mt-1">
                Máx. {serviceStatus.usageInfo.maxProducts} para AI
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {serviceStatus.usageInfo.model}
              </div>
              <div className="text-sm text-gray-600">Modelo AI</div>
              <div className="text-xs text-gray-500 mt-1">
                Perplexity Pro
              </div>
            </div>
          </div>
        )}

        {!serviceStatus?.aiAvailable && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>⚠️ API Perplexity não configurada:</strong> Adicione VITE_PERPLEXITY_API_KEY no arquivo .env para habilitar recomendações AI.
            </p>
          </div>
        )}
      </div>

      {/* AI Recommendation Tests */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Testar Recomendações AI
            </h3>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          Teste o sistema completo de recomendações AI com diferentes perfis de usuário.
        </p>

        {/* Direct Perplexity Test */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-yellow-500" />
              Teste Direto Perplexity API
            </h4>
            <button
              onClick={runPerplexityTest}
              disabled={isRunning || !serviceStatus?.aiAvailable}
              className="flex items-center space-x-1 bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
            >
              <Zap className="w-3 h-3" />
              <span>Testar API</span>
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Testa diretamente a API Perplexity com dados de exemplo.
          </p>
        </div>

        {/* Scenario Tests */}
        <div className="space-y-4">
          {testScenarios.map((scenario, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                <button
                  onClick={() => runAITest(scenario)}
                  disabled={isRunning}
                  className="flex items-center space-x-1 bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                >
                  <Brain className="w-3 h-3" />
                  <span>Testar AI</span>
                </button>
              </div>
              <div className="text-sm text-gray-600">
                <p><strong>Relacionamento:</strong> {scenario.input.recipientProfile.relationship}</p>
                <p><strong>Personalidade:</strong> {scenario.input.recipientProfile.personality}</p>
                <p><strong>Orçamento:</strong> {scenario.input.recipientProfile.budget}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isRunning && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Executando teste AI...</p>
          <p className="text-sm text-gray-500 mt-1">Isso pode levar alguns segundos</p>
        </div>
      )}

      {/* Test Results */}
      {testResult && (
        <div className={`p-6 rounded-lg border ${
          testResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-2">
            {testResult.success ? (
              <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`font-medium text-lg ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.scenario} - {testResult.success ? 'Sucesso' : 'Erro'}
              </h4>
              
              {testResult.success && testResult.data ? (
                <div className="mt-3">
                  <p className="text-green-700 text-sm mb-3">
                    {testResult.data.count} recomendações geradas
                    {testResult.type === 'full_ai' && ' (Sistema Completo AI)'}
                    {testResult.type === 'perplexity_only' && ' (Perplexity API Direta)'}
                  </p>
                  <div className="space-y-3">
                    {testResult.data.recommendations?.slice(0, 3).map((rec: any, i: number) => (
                      <div key={i} className="bg-white p-4 rounded-lg border border-green-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">
                              {rec.name || rec.product}
                            </h5>
                            {rec.price && (
                              <p className="text-sm text-gray-600 mt-1">
                                <strong>Preço:</strong> {rec.price}
                              </p>
                            )}
                            <p className="text-sm text-green-700 mt-2">
                              <strong>Explicação AI:</strong> {rec.emotionalExplanation || rec.reason}
                            </p>
                            {rec.emotional_score && (
                              <p className="text-xs text-gray-500 mt-1">
                                Score Emocional: {rec.emotional_score}/100
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              #{i + 1}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : testResult.error && (
                <div className="mt-2">
                  <p className="text-red-700 text-sm">
                    <strong>Erro:</strong> {testResult.error}
                  </p>
                  {testResult.error.includes('API key') && (
                    <p className="text-red-600 text-xs mt-1">
                      💡 Configure VITE_PERPLEXITY_API_KEY no arquivo .env
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Usage Tips */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 mb-3">💡 Dicas de Uso</h4>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• <strong>API Key:</strong> Obtenha sua chave em <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="underline">perplexity.ai/settings/api</a></li>
          <li>• <strong>Modelo:</strong> Usando sonar-pro para melhor qualidade de recomendações</li>
          <li>• <strong>Limite:</strong> Máximo 15 produtos enviados para análise AI por vez</li>
          <li>• <strong>Fallback:</strong> Sistema usa recomendações padrão se AI falhar</li>
          <li>• <strong>Cache:</strong> Considere implementar cache para reduzir custos de API</li>
        </ul>
      </div>
    </div>
  );
};