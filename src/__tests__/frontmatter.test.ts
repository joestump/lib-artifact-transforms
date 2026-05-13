import { parseFrontmatter, extractStatus, extractField } from '../frontmatter';

describe('frontmatter', () => {
  describe('parseFrontmatter', () => {
    it('should parse YAML frontmatter', () => {
      const content = `---
status: accepted
date: 2026-05-13
---

# My Document

This is the body.`;

      const { metadata, content: body } = parseFrontmatter(content);

      expect(metadata.status).toBe('accepted');
      expect(metadata.date).toBe('2026-05-13');
      expect(body).toContain('# My Document');
    });

    it('should handle empty frontmatter', () => {
      const content = `---
---

# My Document`;

      const { metadata, content: body } = parseFrontmatter(content);

      expect(Object.keys(metadata).length).toBe(0);
      expect(body).toContain('# My Document');
    });

    it('should handle content without frontmatter', () => {
      const content = `# My Document

This is just content.`;

      const { metadata, content: body } = parseFrontmatter(content);

      expect(Object.keys(metadata).length).toBe(0);
      expect(body).toBe(content);
    });

    it('should parse legacy inline-bullet format', () => {
      const content = `# My Document

- **Status:** accepted

Body content here.`;

      const { metadata } = parseFrontmatter(content);

      expect(metadata.status).toBe('accepted');
    });

    it('should prefer YAML frontmatter over inline format', () => {
      const content = `---
status: yaml-status
---

- **Status:** inline-status

Body`;

      const { metadata } = parseFrontmatter(content);

      expect(metadata.status).toBe('yaml-status');
    });
  });

  describe('extractStatus', () => {
    it('should extract status from metadata', () => {
      const metadata = { status: 'accepted' };
      const status = extractStatus(metadata);

      expect(status).toBe('accepted');
    });

    it('should strip parenthetical refinement notes', () => {
      const metadata = { status: 'accepted (refined by ADR-0010, 2026-05-03)' };
      const status = extractStatus(metadata);

      expect(status).toBe('accepted');
    });

    it('should return undefined for missing status', () => {
      const metadata = { other: 'value' };
      const status = extractStatus(metadata);

      expect(status).toBeUndefined();
    });

    it('should trim whitespace', () => {
      const metadata = { status: '  accepted  ' };
      const status = extractStatus(metadata);

      expect(status).toBe('accepted');
    });
  });

  describe('extractField', () => {
    it('should extract field from metadata', () => {
      const metadata = { title: 'My Title', date: '2026-05-13' };

      const title = extractField<string>(metadata, 'title');
      const date = extractField<string>(metadata, 'date');

      expect(title).toBe('My Title');
      expect(date).toBe('2026-05-13');
    });

    it('should return default value if field missing', () => {
      const metadata = { title: 'My Title' };

      const description = extractField<string>(metadata, 'description', 'No description');

      expect(description).toBe('No description');
    });

    it('should return undefined if field missing and no default', () => {
      const metadata = { title: 'My Title' };

      const description = extractField<string>(metadata, 'description');

      expect(description).toBeUndefined();
    });

    it('should handle array fields', () => {
      const metadata = { tags: ['foo', 'bar'] };

      const tags = extractField<string[]>(metadata, 'tags');

      expect(tags).toEqual(['foo', 'bar']);
    });
  });
});
