/**
 * Extract text content from AI SDK v5 message content
 * Handles different content formats: string, parts array, or complex objects
 */
export function extractTextContent(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .filter(
        (part): part is { type: 'text'; text: string } =>
          part && typeof part === 'object' && part.type === 'text'
      )
      .map((part) => part.text)
      .join(' ');
  }

  if (content && typeof content === 'object' && 'text' in content) {
    return (content as { text: string }).text;
  }

  return '';
}
