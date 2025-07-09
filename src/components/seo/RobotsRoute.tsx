import React, { useEffect } from 'react';
import { useRobotsContent } from './RobotsTxt';

export const RobotsRoute: React.FC = () => {
  const robotsContent = useRobotsContent();

  useEffect(() => {
    if (robotsContent) {
      // Set the response content type to plain text
      document.contentType = 'text/plain';
      
      // Replace the entire document with the robots.txt content
      document.open();
      document.write(robotsContent);
      document.close();
    }
  }, [robotsContent]);

  // Return the text content directly
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: robotsContent }} 
      style={{ 
        fontFamily: 'monospace', 
        whiteSpace: 'pre-wrap',
        padding: '20px',
        backgroundColor: '#f5f5f5'
      }}
    />
  );
};