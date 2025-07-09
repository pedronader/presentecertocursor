export class ProductUpdateService {
  private supabaseUrl: string;

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!this.supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL is required');
    }
  }

  async updateProducts(customProducts?: any[]): Promise<{
    status: string;
    message: string;
    count: number;
    errors?: string[];
  }> {
    try {
      const functionUrl = `${this.supabaseUrl}/functions/v1/update-products`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: customProducts ? JSON.stringify(customProducts) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error calling update-products function:', error);
      throw error;
    }
  }

  async triggerProductUpdate(): Promise<boolean> {
    try {
      const result = await this.updateProducts();
      console.log('Product update result:', result);
      return result.status === 'success' || result.status === 'partial_success';
    } catch (error) {
      console.error('Failed to trigger product update:', error);
      return false;
    }
  }
}