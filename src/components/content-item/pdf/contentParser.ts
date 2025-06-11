
export interface ParsedElement {
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'blockquote' | 'list' | 'tldr';
  text?: string;
  items?: string[];
}

export const parseContent = (content: string): ParsedElement[] => {
  const lines = content.split('\n');
  const elements: ParsedElement[] = [];
  let currentList: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      if (currentList.length > 0) {
        elements.push({ type: 'list', items: [...currentList] });
        currentList = [];
      }
      continue;
    }

    // Check for TL;DR section
    if (line.toLowerCase().includes('tl;dr')) {
      if (currentList.length > 0) {
        elements.push({ type: 'list', items: [...currentList] });
        currentList = [];
      }
      
      const tldrItems: string[] = [];
      i++; // Move to next line
      while (i < lines.length && lines[i].trim()) {
        const tldrLine = lines[i].trim();
        if (tldrLine.match(/^[-*+]\s+/)) {
          tldrItems.push(tldrLine.replace(/^[-*+]\s+/, ''));
        }
        i++;
      }
      elements.push({ type: 'tldr', items: tldrItems });
      continue;
    }

    // Check for headings
    if (line.startsWith('### ')) {
      if (currentList.length > 0) {
        elements.push({ type: 'list', items: [...currentList] });
        currentList = [];
      }
      elements.push({ type: 'heading3', text: line.replace('### ', '') });
    } else if (line.startsWith('## ')) {
      if (currentList.length > 0) {
        elements.push({ type: 'list', items: [...currentList] });
        currentList = [];
      }
      elements.push({ type: 'heading2', text: line.replace('## ', '') });
    } else if (line.startsWith('# ')) {
      if (currentList.length > 0) {
        elements.push({ type: 'list', items: [...currentList] });
        currentList = [];
      }
      elements.push({ type: 'heading1', text: line.replace('# ', '') });
    } else if (line.startsWith('> ')) {
      if (currentList.length > 0) {
        elements.push({ type: 'list', items: [...currentList] });
        currentList = [];
      }
      elements.push({ type: 'blockquote', text: line.replace('> ', '') });
    } else if (line.match(/^[-*+]\s+/)) {
      currentList.push(line.replace(/^[-*+]\s+/, ''));
    } else {
      if (currentList.length > 0) {
        elements.push({ type: 'list', items: [...currentList] });
        currentList = [];
      }
      
      // Clean up markdown formatting and handle links
      let cleanText = line
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1');
      
      elements.push({ type: 'paragraph', text: cleanText });
    }
  }

  if (currentList.length > 0) {
    elements.push({ type: 'list', items: currentList });
  }

  return elements;
};
