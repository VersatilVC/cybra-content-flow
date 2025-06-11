
export function generateUTMParameters(guideTitle: string): string {
  const campaignName = guideTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim();
  
  return `?utm_source=guide&utm_medium=pdf&utm_campaign=${campaignName}`;
}

export function addUTMToLinks(content: string, guideTitle: string): string {
  const utmParams = generateUTMParameters(guideTitle);
  
  // Regex to find markdown links [text](url)
  return content.replace(/\[([^\]]*)\]\(([^\)]*)\)/g, (match, text, url) => {
    // Skip if URL already has query parameters
    if (url.includes('?')) {
      return `[${text}](${url}&${utmParams.substring(1)})`;
    }
    return `[${text}](${url}${utmParams})`;
  });
}
