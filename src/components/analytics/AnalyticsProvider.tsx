import React, { useState, useEffect, createContext, useContext } from 'react';
import { GoogleAnalytics, useGoogleAnalytics } from './GoogleAnalytics';
import { GoogleSearchConsole } from './GoogleSearchConsole';
import { CookieConsent } from './CookieConsent';

interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface AnalyticsContextType {
  consent: CookieConsent;
  updateConsent: (consent: CookieConsent) => void;
  analytics: ReturnType<typeof useGoogleAnalytics>;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: React.ReactNode;
  ga4MeasurementId?: string;
  gscVerificationToken?: string;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  ga4MeasurementId = 'G-XXXXXXXXXX', // Replace with your actual GA4 ID
  gscVerificationToken = 'your-gsc-verification-token-here' // Replace with your actual GSC token
}) => {
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true,
    analytics: false,
    marketing: false
  });

  const [consentLoaded, setConsentLoaded] = useState(false);
  const analytics = useGoogleAnalytics();

  useEffect(() => {
    // Load saved consent on mount
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent) {
      try {
        const parsedConsent = JSON.parse(savedConsent);
        setConsent(parsedConsent);
      } catch (error) {
        console.error('Error parsing saved consent:', error);
      }
    }
    setConsentLoaded(true);
  }, []);

  const updateConsent = (newConsent: CookieConsent) => {
    setConsent(newConsent);
    
    // Track consent change in GA4 if analytics is enabled
    if (newConsent.analytics && window.gtag) {
      analytics.trackEvent('consent_update', {
        event_category: 'privacy',
        analytics_consent: newConsent.analytics,
        marketing_consent: newConsent.marketing
      });
    }
  };

  const contextValue: AnalyticsContextType = {
    consent,
    updateConsent,
    analytics
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {/* Only render analytics components after consent is loaded */}
      {consentLoaded && (
        <>
          {/* Google Search Console - Always load for verification */}
          <GoogleSearchConsole verificationToken={gscVerificationToken} />
          
          {/* Google Analytics - Only load if analytics consent is given */}
          {consent.analytics && (
            <GoogleAnalytics 
              measurementId={ga4MeasurementId}
              enableAnonymizeIP={true}
              enableEnhancedMeasurement={true}
            />
          )}
        </>
      )}
      
      {/* Cookie Consent Banner */}
      <CookieConsent onConsentChange={updateConsent} />
      
      {children}
    </AnalyticsContext.Provider>
  );
};

// Hook to use analytics context
export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

// Higher-order component for tracking page views
export const withPageTracking = <P extends object>(
  Component: React.ComponentType<P>,
  pageName?: string
) => {
  return (props: P) => {
    const { analytics, consent } = useAnalytics();

    useEffect(() => {
      if (consent.analytics) {
        analytics.trackPageView(window.location.pathname, pageName || document.title);
      }
    }, [analytics, consent.analytics]);

    return <Component {...props} />;
  };
};