import React from 'react';
import { Helmet } from 'react-helmet-async';

interface GoogleSearchConsoleProps {
  verificationToken?: string;
}

export const GoogleSearchConsole: React.FC<GoogleSearchConsoleProps> = ({
  verificationToken = 'your-gsc-verification-token-here' // Placeholder - replace with actual token
}) => {
  // Don't render if no valid verification token
  if (!verificationToken || verificationToken === 'your-gsc-verification-token-here') {
    console.warn('Google Search Console: No valid verification token provided');
    return null;
  }

  return (
    <Helmet>
      {/* Google Search Console Verification */}
      <meta 
        name="google-site-verification" 
        content={verificationToken} 
      />
      
      {/* Additional meta tags for better indexing */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
      
      {/* Canonical URL enforcement */}
      <link rel="canonical" href={window.location.href} />
      
      {/* Hreflang for Portuguese (Brazil) */}
      <link rel="alternate" hrefLang="pt-BR" href={window.location.href} />
      <link rel="alternate" hrefLang="x-default" href={window.location.href} />
    </Helmet>
  );
};

// Hook for Search Console monitoring
export const useSearchConsoleMonitoring = () => {
  const reportIndexingStatus = (url: string, status: 'indexed' | 'not_indexed' | 'error') => {
    // This would typically send data to your backend for monitoring
    console.log(`Indexing Status - URL: ${url}, Status: ${status}`);
    
    // Track in GA4 if available
    if (window.gtag) {
      window.gtag('event', 'indexing_status', {
        event_category: 'seo',
        event_label: url,
        custom_parameter_1: status
      });
    }
  };

  const reportStructuredDataError = (url: string, error: string) => {
    console.error(`Structured Data Error - URL: ${url}, Error: ${error}`);
    
    if (window.gtag) {
      window.gtag('event', 'structured_data_error', {
        event_category: 'seo_error',
        event_label: url,
        custom_parameter_1: error
      });
    }
  };

  const reportSitemapSubmission = (sitemapUrl: string, status: 'submitted' | 'error') => {
    console.log(`Sitemap Submission - URL: ${sitemapUrl}, Status: ${status}`);
    
    if (window.gtag) {
      window.gtag('event', 'sitemap_submission', {
        event_category: 'seo',
        event_label: sitemapUrl,
        custom_parameter_1: status
      });
    }
  };

  return {
    reportIndexingStatus,
    reportStructuredDataError,
    reportSitemapSubmission
  };
};