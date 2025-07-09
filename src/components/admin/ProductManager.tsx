import React, { useState, useRef } from 'react';
import { Upload, Download, Database, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { CSVImporter, ImportResult } from '../../utils/csvImporter';
import { ProductService } from '../../services/productService';

export const ProductManager: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [productStats, setProductStats] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const csvImporter = new CSVImporter();
  const productService = new ProductService();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Por favor, selecione um arquivo CSV válido.');
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const csvData = csvImporter.parseCSVText(text);
      
      if (csvData.length === 0) {
        throw new Error('Arquivo CSV está vazio ou inválido');
      }

      const result = await csvImporter.importProductsFromCSV(csvData);
      setImportResult(result);
      
      // Refresh stats after import
      await loadProductStats();

    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        successCount: 0,
        errorCount: 1,
        errors: [{ row: 0, error: error.message }]
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    const template = csvImporter.generateCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'produtos_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadProductStats = async () => {
    try {
      const products = await productService.getProducts();
      const stats = {
        total: products.length,
        bySource: products.reduce((acc: any, product: any) => {
          acc[product.source] = (acc[product.source] || 0) + 1;
          return acc;
        }, {}),
        byStatus: products.reduce((acc: any, product: any) => {
          acc[product.status || 'active'] = (acc[product.status || 'active'] || 0) + 1;
          return acc;
        }, {}),
        avgPrice: products.reduce((sum: number, product: any) => sum + (product.price_brl || 0), 0) / products.length
      };
      setProductStats(stats);
    } catch (error) {
      console.error('Error loading product stats:', error);
    }
  };

  React.useEffect(() => {
    loadProductStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Product Statistics */}
      {productStats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Estatísticas dos Produtos
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{productStats.total}</div>
              <div className="text-sm text-gray-600">Total de Produtos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                R$ {productStats.avgPrice?.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-gray-600">Preço Médio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(productStats.bySource).length}
              </div>
              <div className="text-sm text-gray-600">Fontes Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {productStats.byStatus.active || 0}
              </div>
              <div className="text-sm text-gray-600">Produtos Ativos</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Por Fonte</h4>
              <div className="space-y-1">
                {Object.entries(productStats.bySource).map(([source, count]: [string, any]) => (
                  <div key={source} className="flex justify-between text-sm">
                    <span className="capitalize">{source}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Por Status</h4>
              <div className="space-y-1">
                {Object.entries(productStats.byStatus).map(([status, count]: [string, any]) => (
                  <div key={status} className="flex justify-between text-sm">
                    <span className="capitalize">{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Upload className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Importar Produtos via CSV
            </h3>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          Faça upload de um arquivo CSV para adicionar ou atualizar produtos em massa. 
          Use o template para garantir o formato correto.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={downloadTemplate}
            className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Template CSV</span>
          </button>

          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isImporting}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <button
              disabled={isImporting}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isImporting ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>
                {isImporting ? 'Importando...' : 'Selecionar Arquivo CSV'}
              </span>
            </button>
          </div>
        </div>

        {/* Import Result */}
        {importResult && (
          <div className={`p-4 rounded-lg border ${
            importResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-2">
              {importResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className={`font-medium ${
                  importResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {importResult.success ? 'Importação Concluída!' : 'Importação com Erros'}
                </h4>
                
                <div className="mt-2 text-sm">
                  <p className={importResult.success ? 'text-green-700' : 'text-red-700'}>
                    ✅ {importResult.successCount} produtos importados com sucesso
                  </p>
                  {importResult.errorCount > 0 && (
                    <p className="text-red-700">
                      ❌ {importResult.errorCount} erros encontrados
                    </p>
                  )}
                </div>

                {importResult.errors.length > 0 && (
                  <div className="mt-3">
                    <details className="cursor-pointer">
                      <summary className="text-sm font-medium text-red-800">
                        Ver Detalhes dos Erros ({importResult.errors.length})
                      </summary>
                      <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                        {importResult.errors.slice(0, 10).map((error, index) => (
                          <div key={index} className="text-xs text-red-600 bg-red-100 p-2 rounded">
                            {error.row > 0 && `Linha ${error.row}: `}{error.error}
                          </div>
                        ))}
                        {importResult.errors.length > 10 && (
                          <div className="text-xs text-red-600 italic">
                            ... e mais {importResult.errors.length - 10} erros
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CSV Format Guide */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Formato do CSV
          </h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Campos obrigatórios:</strong> name, price_brl, affiliate_link</p>
            <p><strong>Campos de array:</strong> Use vírgulas para separar valores (ex: "tag1,tag2,tag3")</p>
            <p><strong>Fontes suportadas:</strong> amazon, shopee, magalu, mercadolivre, americanas, manual</p>
            <p><strong>Status válidos:</strong> active, inactive, out_of_stock, discontinued</p>
            <p><strong>Orçamentos:</strong> "Até R$ 50", "R$ 51 - R$ 150", "R$ 151 - R$ 300", "R$ 301 - R$ 500", "Acima de R$ 500"</p>
          </div>
        </div>
      </div>

      {/* Manual Entry Guide */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Database className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Entrada Manual via Supabase
          </h3>
        </div>

        <p className="text-gray-600 mb-4">
          Para adicionar produtos individualmente, acesse o painel do Supabase:
        </p>

        <div className="bg-purple-50 rounded-lg p-4">
          <ol className="list-decimal list-inside space-y-2 text-sm text-purple-800">
            <li>Acesse o dashboard do Supabase</li>
            <li>Vá para "Table Editor" → "products"</li>
            <li>Clique em "Insert" → "Insert row"</li>
            <li>Preencha os campos obrigatórios (name, price_brl, affiliate_link)</li>
            <li>Configure as tags emocionais e de personalidade</li>
            <li>Defina a fonte (amazon, shopee, etc.)</li>
            <li>Salve o produto</li>
          </ol>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Dica:</strong> Use o campo "priority" para destacar produtos principais (valores maiores aparecem primeiro).</p>
        </div>
      </div>
    </div>
  );
};