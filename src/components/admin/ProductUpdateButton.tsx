import React, { useState } from 'react';
import { RefreshCw, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { ProductUpdateService } from '../../services/productUpdateService';
import { RecommendationTester } from './RecommendationTester';
import { ProductManager } from './ProductManager';
import { AIRecommendationTester } from './AIRecommendationTester';

export const ProductUpdateButton: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<{
    status: 'success' | 'error' | 'partial';
    message: string;
    count: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'manage' | 'update' | 'test' | 'ai'>('manage');
  const [productUpdateService] = useState(() => new ProductUpdateService());

  const handleUpdateProducts = async () => {
    setIsUpdating(true);
    setLastUpdate(null);

    try {
      const result = await productUpdateService.updateProducts();
      
      setLastUpdate({
        status: result.status === 'success' ? 'success' : 'partial',
        message: result.message,
        count: result.count
      });
    } catch (error) {
      setLastUpdate({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        count: 0
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Gerenciar Produtos
            </button>
            <button
              onClick={() => setActiveTab('update')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'update'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Atualizar Catálogo
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'test'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Testar Recomendações
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ai'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🤖 Testar AI
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Product Management Tab */}
          {activeTab === 'manage' && <ProductManager />}

          {/* Product Update Tab */}
          {activeTab === 'update' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Database className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Atualizar Produtos via Edge Function
                  </h3>
                </div>
              </div>

              <p className="text-gray-600 mb-4">
                Clique para atualizar o catálogo de produtos com novos itens e preços usando a edge function.
              </p>

              <button
                onClick={handleUpdateProducts}
                disabled={isUpdating}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
                <span>
                  {isUpdating ? 'Atualizando...' : 'Atualizar Produtos'}
                </span>
              </button>

              {lastUpdate && (
                <div className={`mt-4 p-3 rounded-lg flex items-start space-x-2 ${
                  lastUpdate.status === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : lastUpdate.status === 'partial'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {lastUpdate.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      lastUpdate.status === 'success' 
                        ? 'text-green-800' 
                        : lastUpdate.status === 'partial'
                        ? 'text-yellow-800'
                        : 'text-red-800'
                    }`}>
                      {lastUpdate.status === 'success' 
                        ? 'Atualização concluída!' 
                        : lastUpdate.status === 'partial'
                        ? 'Atualização parcial'
                        : 'Erro na atualização'}
                    </p>
                    <p className={`text-sm ${
                      lastUpdate.status === 'success' 
                        ? 'text-green-700' 
                        : lastUpdate.status === 'partial'
                        ? 'text-yellow-700'
                        : 'text-red-700'
                    }`}>
                      {lastUpdate.message}
                      {lastUpdate.count > 0 && ` (${lastUpdate.count} produtos)`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Standard Recommendation Testing Tab */}
          {activeTab === 'test' && <RecommendationTester />}

          {/* AI Recommendation Testing Tab */}
          {activeTab === 'ai' && <AIRecommendationTester />}
        </div>
      </div>
    </div>
  );
};