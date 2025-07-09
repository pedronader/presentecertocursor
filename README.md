# PresenteCerto - Gift Recommendation Platform

## Analytics Configuration

### Google Analytics 4 Setup
1. Replace `G-XXXXXXXXXX` in `src/App.tsx` with your actual GA4 Measurement ID
2. The GA4 tracking will only load after user consent for analytics cookies
3. Enhanced measurement includes: page views, scroll tracking, outbound clicks

### Google Search Console Setup
1. Replace `your-gsc-verification-token-here` in `src/App.tsx` with your actual GSC verification token
2. Submit sitemap at: `https://yourdomain.com/sitemap.xml`
3. Monitor indexing status in GSC dashboard

### GDPR Compliance
- Cookie consent banner appears on first visit
- Analytics only loads after explicit consent
- IP anonymization enabled by default
- No ad personalization signals sent

### Custom Events Tracked
- `quiz_start` - When user begins quiz
- `quiz_complete` - When user completes quiz
- `affiliate_click` - When user clicks product links
- `email_subscription` - When user subscribes to emails
- `seo_page_view` - When user visits SEO landing pages

### Configuration Files to Update
- `src/App.tsx` - Lines 31-32: Replace GA4 ID and GSC token
- `src/components/analytics/GoogleAnalytics.tsx` - Line 8: Replace placeholder GA4 ID
- `src/components/analytics/GoogleSearchConsole.tsx` - Line 8: Replace placeholder GSC token
