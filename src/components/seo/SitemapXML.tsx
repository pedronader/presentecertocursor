import React, { useEffect, useState } from 'react';
import { SEOService } from '../../services/seoService';

export const SitemapXML: React.FC = () => {
  const [sitemapContent, setSitemapContent] = useState<string>('');
  const seoService = new SEOService();

  useEffect(() => {
    const generateSitemap = () => {
      const baseUrl = window.location.origin;
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Get all SEO URLs
      const seoUrls = seoService.generateSitemapUrls();
      
      // Static pages
      const staticPages = [
        { url: '/', changefreq: 'daily', priority: '1.0' },
      ];
      
      // Generate XML content
      let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      // Add static pages
      staticPages.forEach(page => {
        xmlContent += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
      });

      // Add SEO pages
      seoUrls.forEach(url => {
        xmlContent += `
  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      });

      xmlContent += `
</urlset>`;

      setSitemapContent(xmlContent);
    };

    generateSitemap();
  }, []);

  // Set content type to XML
  useEffect(() => {
    if (sitemapContent) {
      // Create a blob with XML content type
      const blob = new Blob([sitemapContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      
      // Download the sitemap (for development testing)
      if (import.meta.env.DEV) {
        console.log('Sitemap XML generated:', sitemapContent);
      }
    }
  }, [sitemapContent]);

  return (
    <div style={{ display: 'none' }}>
      {/* This component renders the sitemap content but is hidden */}
      <pre>{sitemapContent}</pre>
    </div>
  );
};

// Hook to get sitemap content
export const useSitemapContent = () => {
  const [sitemapContent, setSitemapContent] = useState<string>('');
  const seoService = new SEOService();

  useEffect(() => {
    const generateSitemap = () => {
      const baseUrl = window.location.origin;
      const currentDate = new Date().toISOString().split('T')[0];
      
      const seoUrls = seoService.generateSitemapUrls();
      
      const staticPages = [
        { url: '/', changefreq: 'daily', priority: '1.0' },
      ];
      
      let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      staticPages.forEach(page => {
        xmlContent += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
      });

      seoUrls.forEach(url => {
        xmlContent += `
  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      });

      xmlContent += `
</urlset>`;

      setSitemapContent(xmlContent);
    };

    generateSitemap();
  }, []);

  return sitemapContent;
};