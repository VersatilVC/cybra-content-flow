
export interface ParsedSocialContent {
  linkedin?: string;
  x?: string;
}

export function parseSocialContent(content: string): ParsedSocialContent {
  if (!content) return {};

  // Try to parse as JSON first (if N8N sends structured data)
  try {
    const parsed = JSON.parse(content);
    if (parsed.linkedin || parsed.x || parsed.twitter) {
      return {
        linkedin: parsed.linkedin,
        x: parsed.x || parsed.twitter
      };
    }
  } catch {
    // Not JSON, continue with text parsing
  }

  // Parse text-based content with headers/separators
  const linkedinMatch = content.match(/(?:LinkedIn:?\s*\n|### LinkedIn.*?\n)([\s\S]*?)(?=\n(?:X|Twitter|###)|$)/i);
  const xMatch = content.match(/(?:(?:X|Twitter):?\s*\n|### (?:X|Twitter).*?\n)([\s\S]*?)(?=\n(?:LinkedIn|###)|$)/i);

  const result: ParsedSocialContent = {};

  if (linkedinMatch && linkedinMatch[1]) {
    result.linkedin = linkedinMatch[1].trim();
  }

  if (xMatch && xMatch[1]) {
    result.x = xMatch[1].trim();
  }

  // If no specific platform content found, treat as generic social content for both platforms
  if (!result.linkedin && !result.x && content.trim()) {
    result.linkedin = content.trim();
    result.x = content.trim();
  }

  return result;
}

export function isSocialDerivative(derivativeType: string): boolean {
  return derivativeType.startsWith('social_');
}
