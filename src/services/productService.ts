import { supabase } from '../lib/supabase';
import { GiftRecommendation } from '../types/quiz';

export class ProductService {
  async getProducts(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name,
            slug,
            emoji
          )
        `)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getProductsByCategory(categorySlug: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories!inner (
            name,
            slug,
            emoji
          )
        `)
        .eq('categories.slug', categorySlug)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  async getCategories(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  convertToGiftRecommendation(product: any): GiftRecommendation {
    // Process image URL to handle different formats and sources
    let imageUrl = this.processImageUrl(product.image_url);
    
    return {
      id: product.id,
      name: product.name,
      price: `R$ ${product.price_brl.toFixed(2).replace('.', ',')}`,
      image: imageUrl,
      description: product.description,
      emotionalExplanation: this.generateEmotionalExplanation(product),
      affiliateLink: product.affiliate_link,
      category: product.categories?.slug || 'geral'
    };
  }

  private processImageUrl(url: string | null): string {
    // If no URL provided, return default
    if (!url) {
      return this.getDefaultImage();
    }

    // Clean and validate URL
    const cleanUrl = url.trim();
    
    // Check if it's a valid URL
    if (!this.isValidImageUrl(cleanUrl)) {
      return this.getDefaultImage();
    }

    // Handle different image sources and formats
    if (cleanUrl.includes('mlstatic.com')) {
      // Mercado Livre images - try to optimize and handle CORS
      return this.optimizeMercadoLivreImage(cleanUrl);
    }

    if (cleanUrl.includes('shopee.') || cleanUrl.includes('amazon.') || cleanUrl.includes('magazineluiza.')) {
      // Other marketplace images - use proxy if needed
      return this.handleMarketplaceImage(cleanUrl);
    }

    // For other sources, return as-is
    return cleanUrl;
  }

  private optimizeMercadoLivreImage(url: string): string {
    try {
      // Try to convert webp to jpg for better compatibility
      if (url.includes('.webp')) {
        const jpgUrl = url.replace('.webp', '.jpg');
        return jpgUrl;
      }
      
      // Return original URL
      return url;
    } catch {
      return this.getDefaultImage();
    }
  }

  private handleMarketplaceImage(url: string): string {
    // For marketplace images that might have CORS issues,
    // we'll let the component handle fallbacks
    return url;
  }

  private isValidImageUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    try {
      const urlObj = new URL(url);
      const validProtocols = ['http:', 'https:'];
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      
      // Check protocol
      if (!validProtocols.includes(urlObj.protocol)) return false;
      
      // Check if it looks like an image URL
      const pathname = urlObj.pathname.toLowerCase();
      const hasImageExtension = validExtensions.some(ext => pathname.includes(ext));
      const isImageDomain = this.isKnownImageDomain(urlObj.hostname);
      
      return hasImageExtension || isImageDomain;
    } catch {
      return false;
    }
  }

  private isKnownImageDomain(hostname: string): boolean {
    const knownImageDomains = [
      'images.pexels.com',
      'mlstatic.com',
      'http2.mlstatic.com',
      'images.unsplash.com',
      'cdn.shopify.com',
      'images-na.ssl-images-amazon.com',
      'a-static.mlcdn.com.br'
    ];
    
    return knownImageDomains.some(domain => hostname.includes(domain));
  }

  private getDefaultImage(): string {
    return 'https://images.pexels.com/photos/264985/pexels-photo-264985.jpeg?auto=compress&cs=tinysrgb&w=400';
  }

  private getDefaultImageByCategory(category: string): string {
    const categoryImages: Record<string, string> = {
      'bem-estar': 'https://images.pexels.com/photos/3188799/pexels-photo-3188799.jpeg?auto=compress&cs=tinysrgb&w=400',
      'tecnologia': 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=400',
      'culinaria': 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
      'joias': 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=400',
      'decoracao': 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=400',
      'livros': 'https://images.pexels.com/photos/1391653/pexels-photo-1391653.jpeg?auto=compress&cs=tinysrgb&w=400',
      'esportes': 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=400',
      'moda': 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
      'suplementos': 'https://images.pexels.com/photos/4047146/pexels-photo-4047146.jpeg?auto=compress&cs=tinysrgb&w=400',
      'fitness': 'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=400',
      'geral': 'https://images.pexels.com/photos/264985/pexels-photo-264985.jpeg?auto=compress&cs=tinysrgb&w=400'
    };

    return categoryImages[category] || categoryImages['geral'];
  }

  private generateEmotionalExplanation(product: any): string {
    const explanations = [
      `Este presente demonstra que você se preocupa com o bem-estar e felicidade dela. ${product.name} é uma escolha que mostra atenção aos detalhes e cuidado genuíno.`,
      `Escolher ${product.name} revela que você conhece os gostos únicos dela e quer proporcionar momentos especiais. É um presente que fala diretamente ao coração.`,
      `${product.name} é perfeito porque combina praticidade com carinho. Mostra que você pensa no dia a dia dela e quer torná-lo mais especial.`,
      `Este presente simboliza o quanto ela é importante para você. ${product.name} é uma forma tangível de expressar seus sentimentos e criar memórias duradouras.`,
      `Ao escolher ${product.name}, você está investindo na felicidade dela. É um presente que demonstra que você valoriza os momentos juntos e quer criar novas experiências.`
    ];
    
    return explanations[Math.floor(Math.random() * explanations.length)];
  }
}