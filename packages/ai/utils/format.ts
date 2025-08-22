import type { UIMessage } from 'ai';

/**
 * Format messages for display
 */
export function formatMessages(messages: UIMessage[]): string {
  return messages
    .map((m) => {
      // Extract text content from parts
      const textParts = m.parts?.filter((p) => p.type === 'text') || [];
      const content = textParts.map((p) => p.text).join('');
      return `${m.role}: ${content}`;
    })
    .join('\n');
}

/**
 * Extract text content from a message
 * Re-export from existing file
 */
export { extractTextContent } from './extract-text-content';

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string | Date): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}
