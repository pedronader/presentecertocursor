export interface ProfileData {
  relationship: string;
  personality?: string;
  occasion?: string;
  age?: string;
  budget?: string;
}

export interface SEOPageData {
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage: string;
  profile: ProfileData;
}

export class SEOService {
  private baseUrl = 'https://presentecerto.com.br';
  private defaultOgImage = 'https://images.pexels.com/photos/264985/pexels-photo-264985.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630';

  // Mapping for URL-friendly slugs to readable names
  private relationshipMap: Record<string, string> = {
    'mae': 'Mãe',
    'pai': 'Pai',
    'namorado': 'Namorado',
    'namorada': 'Namorada',
    'marido': 'Marido',
    'esposa': 'Esposa',
    'amigo': 'Amigo',
    'amiga': 'Amiga',
    'irmao': 'Irmão',
    'irma': 'Irmã',
    'filho': 'Filho',
    'filha': 'Filha',
    'sogra': 'Sogra',
    'sogro': 'Sogro',
    'cunhada': 'Cunhada',
    'cunhado': 'Cunhado',
    'prima': 'Prima',
    'primo': 'Primo',
    'tia': 'Tia',
    'tio': 'Tio',
    'avo': 'Avô',
    'avó': 'Avó'
  };

  private personalityMap: Record<string, string> = {
    'criativa': 'Criativa e artística',
    'aventureira': 'Aventureira e espontânea',
    'aventureiro': 'Aventureiro e espontâneo',
    'calma': 'Calma e reflexiva',
    'zen': 'Calma e reflexiva',
    'pratica': 'Prática e organizada',
    'pratico': 'Prática e organizada',
    'sociavel': 'Sociável e extrovertida',
    'extrovertida': 'Sociável e extrovertida',
    'extrovertido': 'Sociável e extrovertida',
    'romantica': 'Romântica e sensível',
    'romantico': 'Romântica e sensível',
    'esportiva': 'Ativa e esportiva',
    'esportivo': 'Ativa e esportiva',
    'intelectual': 'Intelectual e curiosa'
  };

  private occasionMap: Record<string, string> = {
    'aniversario': 'Aniversário',
    'natal': 'Natal',
    'dia-dos-namorados': 'Dia dos Namorados',
    'dia-das-maes': 'Dia das Mães',
    'dia-dos-pais': 'Dia dos Pais',
    'casamento': 'Casamento',
    'formatura': 'Formatura',
    'promocao': 'Promoção',
    'aposentadoria': 'Aposentadoria',
    'mudanca': 'Mudança',
    'novo-emprego': 'Novo Emprego'
  };

  parseSlugToProfile(slug: string): ProfileData {
    console.log('Parsing slug:', slug);


    // SLUGS MAIS GENÉRICOS ADICIONADOS TESTES
  const knownSlugs: Record<string, ProfileData> = {
    // ✅ NOVOS SLUGS GENÉRICOS DE RELACIONAMENTO
    'mae': {
      relationship: 'Mãe',
      occasion: 'Sem ocasião especial'
    },
    'pai': {
      relationship: 'Pai',
      occasion: 'Sem ocasião especial'
    },
    'namorada': {
      relationship: 'Namorada',
      occasion: 'Sem ocasião especial'
    },
    'namorado': {
      relationship: 'Namorado',
      occasion: 'Sem ocasião especial'
    },
    'amigo': {
      relationship: 'Amigo',
      occasion: 'Sem ocasião especial'
    },
    'irma': {
      relationship: 'Irmã',
      occasion: 'Sem ocasião especial'
    },
    
    
       // ✅ NOVO: Ocasiões genéricas TESTE
    'natal': {
      relationship: 'Pessoa Especial',  // Genérico
      occasion: 'Natal'
    },
    'aniversario': {
      relationship: 'Pessoa Especial',  // Genérico
      occasion: 'Aniversário'
    },
    'dia-das-maes': {
      relationship: 'Pessoa Especial',  // Genérico
      occasion: 'Dia das mães'
    },
    'dia-dos-namorados': {
      relationship: 'Pessoa Especial',  // Genérico
      occasion: 'Dia dos namorados'
    },
    'formatura': {
      relationship: 'Pessoa Especial',  // Genérico
      occasion: 'Formatura'
    },
  
    
    // ✅ NOVO: Estilos genéricos TESTE
    'criativo-economico': {
      relationship: 'Pessoa Especial',  // Genérico
      personality: 'criativos e econômicos'
    },
    'luxo-sofisticacao': {
      relationship: 'Pessoa Especial',  // Genérico
      personality: 'sofisticados e luxuosos'
    },
    'tecnologico-moderno': {
      relationship: 'Pessoa Especial',  // Genérico
      personality: 'tecnológicos e modernos'
    },
    'esportivo-ativo': {
      relationship: 'Pessoa Especial',  // Genérico
      personality: 'esportivos e ativos'
    },
    'musical-artistico': {
      relationship: 'Pessoa Especial',  // Genérico
      personality: 'musicais e artisticos'
    },
    'casa-decoracao': {
      relationship: 'Pessoa Especial',  // Genérico
      personality: 'de casa e decoração'
    }

      
    };

    if (knownSlugs[slug]) {
      console.log('Found known slug:', knownSlugs[slug]);
      return knownSlugs[slug];
    }

    // Parse dynamic slugs
    const parts = slug.split('-');
    console.log('Slug parts:', parts);
    
    if (parts.length < 1) {
      throw new Error('Invalid slug format');
    }

    // First part should be the relationship
    const relationshipSlug = parts[0];
    const relationship = this.relationshipMap[relationshipSlug];
    
    if (!relationship) {
      console.error('Unknown relationship:', relationshipSlug);
      throw new Error('Unknown relationship type');
    }

    const profile: ProfileData = { relationship };

    // Look for personality and occasion in remaining parts
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      
      if (this.personalityMap[part]) {
        profile.personality = this.personalityMap[part];
        continue;
      }
      
      if (this.occasionMap[part]) {
        profile.occasion = this.occasionMap[part];
        continue;
      }

      // Check for compound occasions (e.g., "dia-dos-namorados")
      if (i < parts.length - 2) {
        const compound = `${part}-${parts[i + 1]}-${parts[i + 2]}`;
        if (this.occasionMap[compound]) {
          profile.occasion = this.occasionMap[compound];
          i += 2; // Skip next two parts
          continue;
        }
      }

      if (i < parts.length - 1) {
        const compound = `${part}-${parts[i + 1]}`;
        if (this.occasionMap[compound]) {
          profile.occasion = this.occasionMap[compound];
          i += 1; // Skip next part
          continue;
        }
      }
    }

    console.log('Parsed profile:', profile);
    return profile;
  }

 generateSEOPageData(profile: ProfileData, slug: string): SEOPageData {
  const { relationship, personality, occasion } = profile;
  
  // ✅ MELHORAR: Lógica mais robusta para títulos
  let h1 = '';
  let metaTitle = '';
  let description = '';
  let metaDescription = '';
  
  if (relationship === 'Pessoa Especial') {
    // Para perfis genéricos de ocasião
    if (occasion && occasion !== 'Sem ocasião especial') {
      h1 = `Presentes de ${occasion}`;
      metaTitle = `Presentes de ${occasion} | PresenteCerto`;
      description = `Encontre presentes especiais para ${occasion.toLowerCase()}. Sugestões personalizadas para diferentes perfis, explicações emocionais e links diretos para compra.`;
      metaDescription = `Descubra presentes únicos para ${occasion.toLowerCase()}. Recomendações personalizadas com explicações emocionais. Encontre o presente ideal em minutos!`;
    }
    // Para perfis genéricos de estilo/personalidade
    else if (personality) {
      h1 = `Presentes ${personality}`;
      metaTitle = `Presentes ${personality} | PresenteCerto`;
      description = `Encontre presentes ${personality.toLowerCase()} para pessoas especiais. Sugestões personalizadas com explicações emocionais e links diretos para compra.`;
      metaDescription = `Descubra presentes ${personality.toLowerCase()} únicos. Recomendações personalizadas com explicações emocionais. Encontre o presente ideal!`;
    }
    else {
      h1 = 'Presentes Especiais';
      metaTitle = 'Presentes Especiais | PresenteCerto';
      description = 'Encontre presentes especiais para pessoas queridas. Sugestões personalizadas com explicações emocionais.';
      metaDescription = 'Descubra presentes únicos e especiais. Recomendações personalizadas com explicações emocionais.';
    }
  } 
  else {
    // Para relacionamentos específicos
    h1 = `Presentes para ${relationship}`;
    if (personality) h1 += ` ${personality}`;
    if (occasion && occasion !== 'Sem ocasião especial') h1 += ` - ${occasion}`;
    
    metaTitle = h1 + ' | PresenteCerto';
    
    description = `Encontre o presente perfeito para ${relationship.toLowerCase()}`;
    if (personality) description += ` ${personality.toLowerCase()}`;
    if (occasion && occasion !== 'Sem ocasião especial') description += ` para ${occasion.toLowerCase()}`;
    description += '. Veja as nossas sugestões personalizadas com base no perfil único da pessoa com explicações emocionais e os links diretos para compra.';
    
    metaDescription = `Descubra presentes únicos para ${relationship.toLowerCase()}`;
    if (personality) metaDescription += ` ${personality.toLowerCase()}`;
    if (occasion && occasion !== 'Sem ocasião especial') metaDescription += ` em ${occasion.toLowerCase()}`;
    metaDescription += '. Recomendações personalizadas com explicações emocionais. Encontre o presente ideal em minutos!';
  }
  
  // Generate keywords baseado no tipo de perfil
  const keywords = ['presente personalizado', 'gift recommendation', 'presente ideal', 'sugestão de presente'];
  
  if (relationship !== 'Pessoa Especial') {
    keywords.push(`presente para ${relationship.toLowerCase()}`);
  }
  
  if (personality) {
    keywords.push(`presente ${personality.toLowerCase()}`);
  }
  
  if (occasion && occasion !== 'Sem ocasião especial') {
    keywords.push(`presente ${occasion.toLowerCase()}`);
  }
  
  return {
    title: h1,
    metaTitle,
    metaDescription,
    h1,
    description,
    keywords,
    canonicalUrl: `${this.baseUrl}/presente-para/${slug}`,
    ogImage: this.defaultOgImage,
    profile
  };
}


  generateSlugFromProfile(profile: ProfileData): string {
    const relationshipSlug = this.getKeyByValue(this.relationshipMap, profile.relationship);
    if (!relationshipSlug) return '';

    let slug = relationshipSlug;

    if (profile.personality) {
      const personalitySlug = this.getKeyByValue(this.personalityMap, profile.personality);
      if (personalitySlug) slug += `-${personalitySlug}`;
    }

    if (profile.occasion) {
      const occasionSlug = this.getKeyByValue(this.occasionMap, profile.occasion);
      if (occasionSlug) slug += `-${occasionSlug}`;
    }

    return slug;
  }

  private getKeyByValue(object: Record<string, string>, value: string): string | undefined {
    return Object.keys(object).find(key => object[key] === value);
  }

  getFallbackRecommendations(profile: ProfileData): any[] {
    // Return mock recommendations based on profile
    const baseRecommendations = [
      {
        id: 'fallback-1',
        name: `Kit Especial para ${profile.relationship}`,
        price: 'R$ 89,90',
        image: 'https://images.pexels.com/photos/264985/pexels-photo-264985.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: `Um presente cuidadosamente selecionado para ${profile.relationship.toLowerCase()}.`,
        emotionalExplanation: `Este presente foi escolhido especialmente para demonstrar o carinho que você sente por ${profile.relationship.toLowerCase()}. É uma forma única de expressar seus sentimentos.`,
        affiliateLink: 'https://amazon.com.br/kit-especial',
        category: 'geral'
      },
      {
        id: 'fallback-2',
        name: 'Presente Personalizado Premium',
        price: 'R$ 159,90',
        image: 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Um presente premium que combina qualidade e personalização.',
        emotionalExplanation: 'Este presente premium mostra o quanto você valoriza essa pessoa especial. É um símbolo do seu apreço e cuidado.',
        affiliateLink: 'https://amazon.com.br/presente-premium',
        category: 'premium'
      },
      {
        id: 'fallback-3',
        name: 'Experiência Memorável',
        price: 'R$ 199,90',
        image: 'https://images.pexels.com/photos/3188799/pexels-photo-3188799.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Uma experiência única que criará memórias duradouras.',
        emotionalExplanation: 'Mais que um objeto, este presente oferece momentos especiais que ficarão para sempre na memória. É um investimento em felicidade compartilhada.',
        affiliateLink: 'https://amazon.com.br/experiencia-memoravel',
        category: 'experiencia'
      }
    ];

    return baseRecommendations;
  }

  // Generate sitemap data for all possible combinations
  generateSitemapUrls(): string[] {
    const urls: string[] = [];
    
    // Add main page
    urls.push('/');
    
    Object.keys(this.relationshipMap).forEach(relationship => {
      // Basic relationship URLs
      urls.push(`/presente-para-${relationship}`);
      
      // Relationship + personality combinations
      Object.keys(this.personalityMap).forEach(personality => {
        urls.push(`/presente-para-${relationship}-${personality}`);
        
        // Relationship + personality + occasion combinations (top occasions only)
        ['aniversario', 'natal', 'dia-dos-namorados'].forEach(occasion => {
          urls.push(`/presente-para-${relationship}-${personality}-${occasion}`);
        });
      });
      
      // Relationship + occasion combinations
      Object.keys(this.occasionMap).forEach(occasion => {
        urls.push(`/presente-para-${relationship}-${occasion}`);
      });
    });

    return urls;
  }

  // Generate sitemap XML content
  generateSitemapXML(): string {
    const baseUrl = 'https://presentecerto.com.br';
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const urls = this.generateSitemapUrls();
    
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add homepage with highest priority
    xmlContent += `
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    // Add all SEO pages
    urls.slice(1).forEach(url => { // Skip the first one (/) as we already added it
      const priority = url.includes('-') ? '0.8' : '0.9'; // Higher priority for simpler URLs
      xmlContent += `
  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    });

    xmlContent += `
</urlset>`;

    return xmlContent;
  }

  // Generate robots.txt content
  generateRobotsTxt(): string {
    const baseUrl = 'https://presentecerto.com.br';
    
    return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay (optional - 1 second between requests)
Crawl-delay: 1

# Allow all search engines to index the site
Allow: /presente-para-*
Allow: /sitemap.xml
Allow: /robots.txt

# Disallow admin paths (if any in the future)
# Disallow: /admin/
# Disallow: /api/`;
  }
}