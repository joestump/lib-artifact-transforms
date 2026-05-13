import matter from 'gray-matter';
import type { ParsedFrontmatter } from './types';

export function parseFrontmatter(content: string): ParsedFrontmatter {
  // Try YAML frontmatter first
  const { data, content: body } = matter(content);

  if (Object.keys(data).length > 0) {
    return {
      metadata: data,
      content: body,
    };
  }

  // Fallback: check for legacy inline-bullet format in first 30 lines
  const lines = content.split('\n').slice(0, 30);
  const metadata: Record<string, any> = {};
  const bodyStart = content.indexOf('\n\n');
  const actualBody = bodyStart > -1 ? content.substring(bodyStart + 2) : content;

  for (const line of lines) {
    // Match: - **Status:** value or - Status: value (with optional parenthetical)
    const statusMatch = line.match(/^[-+*]\s+\*?\*?Status:?\*?\*?\s+([^()\n]+)/i);
    if (statusMatch) {
      metadata.status = statusMatch[1].trim();
    }
  }

  return {
    metadata,
    content: actualBody,
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
