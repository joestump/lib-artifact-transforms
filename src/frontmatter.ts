import matter from 'gray-matter';
import type { ParsedFrontmatter } from './types';

export function parseFrontmatter(content: string): ParsedFrontmatter {
  // Try YAML frontmatter first
  const { data, content: body } = matter(content);

  if (Object.keys(data).length > 0) {
    // Normalize dates back to strings (gray-matter parses them as Date objects)
    const normalizedData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof Date) {
        normalizedData[key] = value.toISOString().split('T')[0];
      } else {
        normalizedData[key] = value;
      }
    }
    return {
      metadata: normalizedData,
      content: body.trim(),
    };
  }

  // Fallback: check for legacy inline-bullet format in first 30 lines
  const lines = content.split('\n').slice(0, 30);
  const metadata: Record<string, any> = {};

  for (const line of lines) {
    // Match: - **Status:** value or - Status: value (with optional parenthetical)
    const statusMatch = line.match(/^[-+*]\s+\*?\*?Status:?\*?\*?\s+([^()\n]+)/i);
    if (statusMatch) {
      metadata.status = statusMatch[1].trim();
    }
  }

  return {
    metadata,
    content,
  };
}

export function extractStatus(metadata: Record<string, any>): string | undefined {
  let status = metadata.status as string | undefined;

  if (!status) {
    return undefined;
  }

  // Strip parenthetical refinement notes
  const stripped = status.split('(')[0].trim();
  return stripped;
}

export function extractField<T>(
  metadata: Record<string, any>,
  fieldName: string,
  defaultValue?: T,
): T | undefined {
  const value = metadata[fieldName];
  return value !== undefined ? (value as T) : defaultValue;
}
