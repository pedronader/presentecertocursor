import React, { useEffect, useState } from 'react';

export const RobotsTxt: React.FC = () => {
  const [robotsContent, setRobotsContent] = useState<string>('');

  useEffect(() => {
    const generateRobots = () => {
      const baseUrl = window.location.origin;
      
      const robotsContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay (optional - 1 second between requests)
Crawl-delay: 1

# Disallow admin or sensitive paths (if any)
# Disallow: /admin/
# Disallow: /api/

# Allow all search engines to index the site
# This is the default behavior, but explicit is better
Allow: /presente-para-*
Allow: /sitemap.xml
Allow: /robots.txt`;

      setRobotsContent(robotsContent);
    };

    generateRobots();
  }, []);

  return (
    <div style={{ display: 'none' }}>
      <pre>{robotsContent}</pre>
    </div>
  );
};

// Hook to get robots.txt content
export const useRobotsContent = () => {
  const [robotsContent, setRobotsContent] = useState<string>('');

  useEffect(() => {
    const generateRobots = () => {
      const baseUrl = window.location.origin;
      
      const robotsContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay (optional - 1 second between requests)
Crawl-delay: 1

# Disallow admin or sensitive paths (if any)
# Disallow: /admin/
# Disallow: /api/

# Allow all search engines to index the site
Allow: /presente-para-*
Allow: /sitemap.xml
Allow: /robots.txt`;

      setRobotsContent(robotsContent);
    };

    generateRobots();
  }, []);

  return robotsContent;
};