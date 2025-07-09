import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface GoogleAnalyticsProps {
  measurementId?: string;
  enableAnonymizeIP?: boolean;
  enableEnhancedMeasurement?: boolean;
}

export const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({
  measurementId = 'G-XXXXXXXXXX', // Placeholder - replace with actual ID
  enableAnonymizeIP = true,
  enableEnhancedMeasurement = true
}) => {
  useEffect(() => {
    // Only load GA4 if measurement ID is provided and not placeholder
    if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
      console.warn('Google Analytics: No valid measurement ID provided');
      return;
    }

    // Initialize GA4 with configuration
    if (window.gtag) {
      window.gtag('config', measurementId, {
        anonymize_ip: enableAnonymizeIP,
        allow_google_signals: false, // GDPR compliance
        allow_ad_personalization_signals: false, // GDPR compliance
        cookie_flags: 'SameSite=None;Secure', // Cookie security
        send_page_view: true
      });

      // Enhanced measurement events
      if (enableEnhancedMeasurement) {
        // Track outbound clicks
        document.addEventListener('click', (event) => {
          const target = event.target as HTMLAnchorElement;
          if (target.tagName === 'A' && target.href && target.hostname !== window.location.hostname) {
            window.gtag('event', 'click', {
              event_category: 'outbound',
              event_label: target.href,
              transport_type: 'beacon'
            });
          }
        });

        // Track scroll depth
        let maxScroll = 0;
        const trackScroll = () => {
          const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
          );
          
          if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
            maxScroll = scrollPercent;
            window.gtag('event', 'scroll', {
              event_category: 'engagement',
              event_label: `${scrollPercent}%`,
              value: scrollPercent
            });
          }
        };

        window.addEventListener('scroll', trackScroll, { passive: true });
      }
    }
  }, [measurementId, enableAnonymizeIP, enableEnhancedMeasurement]);

  // Don't render script tags if no valid measurement ID
  if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
    return null;
  }

  return (
    <Helmet>
      {/* Google Analytics 4 Global Site Tag */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          // Configure GA4 with GDPR compliance
          gtag('config', '${measurementId}', {
            anonymize_ip: ${enableAnonymizeIP},
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            cookie_flags: 'SameSite=None;Secure',
            send_page_view: true,
            custom_map: {
              'custom_parameter_1': 'quiz_session_id',
              'custom_parameter_2': 'recommendation_type'
            }
          });

          // Enhanced measurement configuration
          gtag('config', '${measurementId}', {
            enhanced_measurement_settings: {
              scrolls: ${enableEnhancedMeasurement},
              outbound_clicks: ${enableEnhancedMeasurement},
              site_search: ${enableEnhancedMeasurement},
              video_engagement: false,
              file_downloads: ${enableEnhancedMeasurement}
            }
          });
        `}
      </script>
    </Helmet>
  );
};

// Custom hook for tracking events
export const useGoogleAnalytics = () => {
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'user_interaction',
        event_label: parameters?.label || '',
        value: parameters?.value || 0,
        ...parameters
      });
    }
  };

  const trackPageView = (pagePath: string, pageTitle?: string) => {
    if (window.gtag) {
      window.gtag('config', 'G-XXXXXXXXXX', {
        page_path: pagePath,
        page_title: pageTitle || document.title
      });
    }
  };

  const trackQuizStart = (sessionId: string) => {
    trackEvent('quiz_start', {
      event_category: 'quiz',
      quiz_session_id: sessionId,
      engagement_time_msec: Date.now()
    });
  };

  const trackQuizComplete = (sessionId: string, profile: any) => {
    trackEvent('quiz_complete', {
      event_category: 'quiz',
      quiz_session_id: sessionId,
      relationship: profile.relationship,
      budget: profile.budget,
      personality: profile.personality
    });
  };

  const trackAffiliateClick = (productId: string, productName: string, sessionId?: string) => {
    trackEvent('affiliate_click', {
      event_category: 'ecommerce',
      event_label: productName,
      product_id: productId,
      quiz_session_id: sessionId,
      currency: 'BRL'
    });
  };

  const trackEmailSubscription = (sessionId?: string) => {
    trackEvent('email_subscription', {
      event_category: 'lead_generation',
      quiz_session_id: sessionId
    });
  };

  const trackSEOPageView = (slug: string, profile: any) => {
    trackEvent('seo_page_view', {
      event_category: 'seo',
      event_label: slug,
      relationship: profile.relationship,
      personality: profile.personality,
      occasion: profile.occasion
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackQuizStart,
    trackQuizComplete,
    trackAffiliateClick,
    trackEmailSubscription,
    trackSEOPageView
  };
};

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}