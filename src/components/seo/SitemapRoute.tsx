import React, { useEffect } from 'react';
import { useSitemapContent } from './SitemapXML';

export const SitemapRoute: React.FC = () => {
  const sitemapContent = useSitemapContent();

  useEffect(() => {
    if (sitemapContent) {
      // Set the response content type to XML
      document.contentType = 'application/xml';
      
      // Replace the entire document with the sitemap XML
      document.open();
      document.write(sitemapContent);
      document.close();
    }
  }, [sitemapContent]);

  // Return the XML content directly
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: sitemapContent }} 
      style={{ 
        fontFamily: 'monospace', 
        whiteSpace: 'pre-wrap',
        padding: '20px',
        backgroundColor: '#f5f5f5'
      }}
    />
  );
};