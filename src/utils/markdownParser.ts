
export interface ContentSection {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'blockquote';
  level?: number; // for headings (1-6)
  content: string;
  items?: string[]; // for lists
}

export function parseMarkdownToSections(markdown: string): ContentSection[] {
  if (!markdown) return [];
  
  const lines = markdown.split('\n');
  const sections: ContentSection[] = [];
  let currentSection: ContentSection | null = null;
  let listItems: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      // Empty line - finalize current section if it exists
      if (currentSection) {
        if (currentSection.type === 'list' && listItems.length > 0) {
          currentSection.items = [...listItems];
          listItems = [];
        }
        sections.push(currentSection);
        currentSection = null;
      }
      continue;
    }
    
    // Check for heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (currentSection) {
        if (currentSection.type === 'list' && listItems.length > 0) {
          currentSection.items = [...listItems];
          listItems = [];
        }
        sections.push(currentSection);
      }
      currentSection = {
        id: `section-${sections.length}`,
        type: 'heading',
        level: headingMatch[1].length,
        content: headingMatch[2]
      };
      continue;
    }
    
    // Check for list item
    const listMatch = line.match(/^[-*+]\s+(.+)$/) || line.match(/^\d+\.\s+(.+)$/);
    if (listMatch) {
      if (currentSection?.type === 'list') {
        listItems.push(listMatch[1]);
      } else {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          id: `section-${sections.length}`,
          type: 'list',
          content: ''
        };
        listItems = [listMatch[1]];
      }
      continue;
    }
    
    // Check for blockquote
    const blockquoteMatch = line.match(/^>\s+(.+)$/);
    if (blockquoteMatch) {
      if (currentSection?.type === 'blockquote') {
        currentSection.content += '\n' + blockquoteMatch[1];
      } else {
        if (currentSection) {
          if (currentSection.type === 'list' && listItems.length > 0) {
            currentSection.items = [...listItems];
            listItems = [];
          }
          sections.push(currentSection);
        }
        currentSection = {
          id: `section-${sections.length}`,
          type: 'blockquote',
          content: blockquoteMatch[1]
        };
      }
      continue;
    }
    
    // Regular paragraph
    if (currentSection?.type === 'paragraph') {
      currentSection.content += '\n' + line;
    } else {
      if (currentSection) {
        if (currentSection.type === 'list' && listItems.length > 0) {
          currentSection.items = [...listItems];
          listItems = [];
        }
        sections.push(currentSection);
      }
      currentSection = {
        id: `section-${sections.length}`,
        type: 'paragraph',
        content: line
      };
    }
  }
  
  // Add final section
  if (currentSection) {
    if (currentSection.type === 'list' && listItems.length > 0) {
      currentSection.items = [...listItems];
    }
    sections.push(currentSection);
  }
  
  return sections;
}

export function sectionsToMarkdown(sections: ContentSection[]): string {
  return sections.map(section => {
    switch (section.type) {
      case 'heading':
        return '#'.repeat(section.level || 1) + ' ' + section.content;
      case 'paragraph':
        return section.content;
      case 'list':
        return (section.items || []).map(item => `- ${item}`).join('\n');
      case 'blockquote':
        return section.content.split('\n').map(line => `> ${line}`).join('\n');
      default:
        return section.content;
    }
  }).join('\n\n');
}
