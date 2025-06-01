
import React from 'react';

interface BriefSectionProps {
  section: any;
  index: number;
}

export default function BriefSection({ section, index }: BriefSectionProps) {
  const getSectionBulletPoints = (section: any): string[] => {
    console.log('Processing section:', section);
    
    // Check for sectionPoints first (the actual property being used)
    if (section.sectionPoints && Array.isArray(section.sectionPoints)) {
      return section.sectionPoints;
    }
    
    // Check other possible property names for bullet points
    if (section.bulletPoints) {
      if (Array.isArray(section.bulletPoints)) {
        return section.bulletPoints;
      }
      if (typeof section.bulletPoints === 'string') {
        // Try to split by newlines or other delimiters
        return section.bulletPoints.split('\n').filter(point => point.trim().length > 0);
      }
    }
    
    if (section.points && Array.isArray(section.points)) {
      return section.points;
    }
    
    if (section.items && Array.isArray(section.items)) {
      return section.items;
    }
    
    if (section.content && typeof section.content === 'string') {
      // Try to extract bullet points from content
      const lines = section.content.split('\n').filter(line => line.trim().length > 0);
      return lines;
    }
    
    return [];
  };

  const bulletPoints = getSectionBulletPoints(section);
  console.log(`Section ${index + 1} bullet points:`, bulletPoints);

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <h4 className="font-semibold text-green-900 mb-2">
        {index + 1}. {section.sectionTitle || section.title || `Section ${index + 1}`}
      </h4>
      {bulletPoints.length > 0 ? (
        <ul className="list-disc list-inside space-y-1 text-green-800">
          {bulletPoints.map((point, pointIndex) => (
            <li key={pointIndex}>{point}</li>
          ))}
        </ul>
      ) : (
        <div className="text-green-700 italic">
          <p>No bullet points available for this section</p>
          <details className="mt-2 text-xs">
            <summary className="cursor-pointer">Debug info</summary>
            <pre className="mt-1 bg-white p-2 rounded text-xs overflow-x-auto">
              {JSON.stringify(section, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
