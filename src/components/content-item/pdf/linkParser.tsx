
import React from 'react';
import { Text, Link } from '@react-pdf/renderer';

export const renderTextWithLinks = (text: string, textStyle: any) => {
  if (!text || !text.includes('[') || !text.includes('](')) {
    return <Text style={textStyle}>{text}</Text>;
  }

  const linkRegex = /\[([^\]]*)\]\(([^\)]*)\)/g;
  const parts = text.split(linkRegex);
  
  return (
    <Text style={textStyle}>
      {parts.map((part: string, i: number) => {
        if (i % 3 === 1) {
          const url = parts[i + 1];
          return <Link key={i} src={url} style={{ color: '#8B5CF6' }}>{part}</Link>;
        } else if (i % 3 === 2) {
          return null;
        }
        return part;
      })}
    </Text>
  );
};
