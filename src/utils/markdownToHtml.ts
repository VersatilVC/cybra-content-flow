
export function convertMarkdownToHtml(markdown: string): string {
  let html = markdown;
  
  // 1. Remove H1 titles completely (they are sent separately as title field)
  html = html.replace(/^# .*$/gm, '').trim();
  
  // 2. Process TL;DR sections with purple background
  html = html.replace(/(^|\n)(tl;?dr\??:?)\s*\n?((?:(?:\* .*|\- .*|\d+\. .*)\n?)*)/gim, (match, prefix, tldrHeader, bulletContent) => {
    // Extract bullet points from the content
    const bullets = bulletContent
      .split('\n')
      .filter(line => line.trim().match(/^(\*|\-|\d+\.)\s+/))
      .map(line => {
        const content = line.replace(/^(\*|\-|\d+\.)\s+/, '').trim();
        return `<li>${content}</li>`;
      })
      .join('\n        ');
    
    if (bullets) {
      return `${prefix}<div style="background-color: #6B46C1; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: white; margin-top: 0; margin-bottom: 15px;">TL;DR?</h3>
      <ul style="margin: 0; padding-left: 20px; color: white;">
        ${bullets}
      </ul>
    </div>`;
    }
    
    return match;
  });
  
  // 3. Convert headers (H2, H3 only - H1 already removed)
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  
  // 4. Bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  
  // 5. Italic text
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');
  
  // 6. Links
  html = html.replace(/\[([^\]]*)\]\(([^\)]*)\)/g, '<a href="$2">$1</a>');
  
  // 7. Process remaining lists (not in TL;DR sections)
  html = html.replace(/^(\* .*$)/gm, '<li>$1</li>');
  html = html.replace(/^(- .*$)/gm, '<li>$1</li>');
  html = html.replace(/^(\d+\. .*$)/gm, '<li>$1</li>');
  
  // Clean up list item content (remove bullet markers)
  html = html.replace(/<li>\* (.*)<\/li>/g, '<li>$1</li>');
  html = html.replace(/<li>- (.*)<\/li>/g, '<li>$1</li>');
  html = html.replace(/<li>\d+\. (.*)<\/li>/g, '<li>$1</li>');
  
  // 8. Wrap consecutive list items in ul/ol tags
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    // Skip if this is inside a TL;DR div
    if (match.includes('background-color: #6B46C1')) {
      return match;
    }
    // Check if these are numbered lists
    if (match.includes('<li>\\d+\\.')) {
      return `<ol>${match}</ol>`;
    }
    return `<ul>${match}</ul>`;
  });
  
  // 9. Blockquotes
  html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
  
  // 10. Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]*)`/g, '<code>$1</code>');
  
  // 11. Convert paragraphs (split by double newlines)
  const paragraphs = html.split(/\n\s*\n/);
  html = paragraphs
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => {
      // Don't wrap if already wrapped in HTML tags
      if (p.match(/^<(h[1-6]|ul|ol|blockquote|div|pre)/i)) {
        return p;
      }
      return `<p>${p}</p>`;
    })
    .join('\n\n');
  
  return html.trim();
}
