# lib-artifact-transforms

Shared library for artifact processing, frontmatter parsing, and graph visualization. Used by all Docusaurus plugins (`plugin-content-adrs`, `plugin-content-openspec`, `plugin-content-skills`) to transform ADRs, OpenSpec specs, and skills into MDX pages with relationship graphs.

[![Test](https://github.com/joestump/lib-artifact-transforms/actions/workflows/test.yml/badge.svg)](https://github.com/joestump/lib-artifact-transforms/actions/workflows/test.yml)

## Installation

```bash
npm install lib-artifact-transforms
```

## Usage

### Frontmatter Parsing

Parse both YAML frontmatter and legacy inline-bullet formats:

```typescript
import { parseFrontmatter, extractStatus, extractField } from 'lib-artifact-transforms';

const content = `---
status: accepted
date: 2026-05-13
superseded-by: ADR-0005
---

# ADR-0001: Use TypeScript

## Decision Outcome
We will use TypeScript for all new projects.
`;

const { metadata, content: body } = parseFrontmatter(content);
const status = extractStatus(metadata); // 'accepted' (strips parenthetical notes)
const date = extractField<string>(metadata, 'date'); // '2026-05-13'
const supersededBy = extractField<string>(metadata, 'superseded-by'); // 'ADR-0005'
```

### Building Artifact Dependency Graphs

Construct directed acyclic graphs (DAGs) from artifact relationships:

```typescript
import { buildArtifactDAG } from 'lib-artifact-transforms';
import type { ArtifactMetadata } from 'lib-artifact-transforms';

const artifacts: ArtifactMetadata[] = [
  {
    id: 'ADR-0001',
    title: 'Use TypeScript',
    status: 'accepted',
  },
  {
    id: 'ADR-0002',
    title: 'Use Node.js',
    status: 'accepted',
    dependsOn: ['ADR-0001'],
  },
  {
    id: 'ADR-0003',
    title: 'Old Approach',
    status: 'superseded',
    supersededBy: 'ADR-0001',
  },
];

const dag = buildArtifactDAG(artifacts);

console.log(dag.nodes.size); // 3
console.log(dag.edges.length); // 2 (one depends-on, one supersedes)
```

### Generating Visualizations

Render graphs as Mermaid diagrams (for web) or ASCII DAGs (for terminal):

```typescript
import { visualizeArtifacts } from 'lib-artifact-transforms';

// Default: Mermaid (best for web documentation)
const mermaid = visualizeArtifacts(dag);
// Output:
// graph TB
//   ADR-0001["ADR-0001: Use TypeScript"]
//   ADR-0002["ADR-0002: Use Node.js"]
//   ADR-0001 -->|depends-on| ADR-0002

// ASCII DAG (best for terminal/text)
const ascii = visualizeArtifacts(dag, { format: 'ascii' });
// Output:
// ├─ ADR-0001 Use TypeScript
//   ├─ ADR-0002 Use Node.js

// Custom direction (LR = left-to-right)
const mermaidLR = visualizeArtifacts(dag, { 
  format: 'mermaid',
  direction: 'LR'
});
```

## API Reference

### Frontmatter Functions

#### `parseFrontmatter(content: string): ParsedFrontmatter`

Extracts YAML frontmatter and body content from markdown.

**Supports two formats:**
1. YAML frontmatter: `--- metadata: value ---`
2. Legacy inline bullets: `- **Status:** value`

**Returns:**
```typescript
{
  metadata: Record<string, any>,
  content: string
}
```

#### `extractStatus(metadata: Record<string, any>): string | undefined`

Extracts and normalizes status field, removing parenthetical refinement notes.

**Example:**
```typescript
extractStatus({ status: 'accepted (refined by ADR-0010)' })
// Returns: 'accepted'
```

#### `extractField<T>(metadata, fieldName, defaultValue?): T | undefined`

Type-safe field extraction with optional default value.

**Example:**
```typescript
const title = extractField<string>(metadata, 'title', 'Untitled');
const tags = extractField<string[]>(metadata, 'tags', []);
```

### Graph Functions

#### `buildArtifactDAG(artifacts, relationshipKey?): ArtifactDAG`

Constructs a directed acyclic graph from artifact metadata.

**Relationships extracted:**
- `superseded-by` → creates "supersedes" edges
- `dependsOn` → creates "depends-on" edges
- `relatedTo` → creates "relates-to" edges

**Returns:**
```typescript
{
  nodes: Map<string, ArtifactMetadata>,
  edges: Array<{
    from: string,
    to: string,
    type: 'supersedes' | 'depends-on' | 'relates-to'
  }>
}
```

#### `renderMermaidGraph(dag, options?): string`

Generates Mermaid diagram syntax for web rendering.

**Options:**
```typescript
{
  format?: 'mermaid' (default)
  direction?: 'TB' | 'LR' | 'BT' | 'RL' (default: 'TB')
  title?: string
}
```

#### `renderASCIIDAG(dag, options?): string`

Generates ASCII DAG for terminal/text output.

**Performs topological sort** and uses tree formatting (`├─`).

#### `visualizeArtifacts(dag, options?): string`

Unified visualization function (format-agnostic).

**Default format:** Mermaid (best for documentation)

**To use ASCII:** `visualizeArtifacts(dag, { format: 'ascii' })`

## Type Definitions

### `ArtifactMetadata`
```typescript
{
  id: string;                    // Unique identifier (ADR-0001, SPEC-0005, etc.)
  title: string;                 // Human-readable title
  status?: string;               // proposed | review | accepted | implemented | superseded | deprecated | rejected
  date?: string;                 // ISO 8601 or RFC 3339 date
  supersededBy?: string;         // ID of superseding artifact
  dependsOn?: string[];          // Array of artifact IDs this depends on
  relatedTo?: string[];          // Array of related artifact IDs
}
```

### `ArtifactDAG`
```typescript
{
  nodes: Map<string, ArtifactMetadata>;
  edges: Array<{
    from: string;
    to: string;
    type: 'supersedes' | 'depends-on' | 'relates-to';
  }>;
}
```

### `ParsedFrontmatter`
```typescript
{
  metadata: Record<string, any>;
  content: string;
}
```

### `GraphVisualizationOptions`
```typescript
{
  format?: 'mermaid' | 'ascii';
  title?: string;
  direction?: 'TB' | 'LR' | 'BT' | 'RL';
}
```

## Development

### Running tests

```bash
npm test
```

### Building

```bash
npm run build
```

### Watch mode (during development)

```bash
npm run watch
```

## Testing

This library includes comprehensive test coverage:

```bash
npm test -- --coverage
```

Coverage thresholds:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

**Test suites:**
- `frontmatter.test.ts` — YAML/inline parsing, status extraction, field access
- `graph.test.ts` — DAG construction, relationship extraction, visualization rendering

## Common Patterns

### Pattern: Process artifacts with relationships

```typescript
import { 
  parseFrontmatter, 
  buildArtifactDAG, 
  visualizeArtifacts 
} from 'lib-artifact-transforms';
import fs from 'fs';

// Read ADR files
const adrFiles = fs.readdirSync('./docs/adrs').filter(f => f.startsWith('ADR-'));

// Parse each ADR
const adrs = adrFiles.map(filename => {
  const content = fs.readFileSync(`./docs/adrs/${filename}`, 'utf-8');
  const { metadata } = parseFrontmatter(content);
  
  return {
    id: filename.replace('.md', ''),
    title: metadata.title,
    status: metadata.status,
    supersededBy: metadata['superseded-by'],
    dependsOn: metadata['depends-on'],
  };
});

// Build and visualize
const dag = buildArtifactDAG(adrs);
const graph = visualizeArtifacts(dag, { format: 'mermaid' });

console.log(graph);
```

### Pattern: Extract specific metadata

```typescript
import { parseFrontmatter, extractStatus, extractField } from 'lib-artifact-transforms';

const { metadata } = parseFrontmatter(markdown);

const status = extractStatus(metadata);
const category = extractField<string>(metadata, 'category');
const tags = extractField<string[]>(metadata, 'tags', []);
const author = extractField<string>(metadata, 'author', 'Unknown');
```

## Integration with plugins

All three Docusaurus plugins use this library:

- [`plugin-content-adrs`](https://github.com/joestump/plugin-content-adrs) — ADR transformation
- [`plugin-content-openspec`](https://github.com/joestump/plugin-content-openspec) — OpenSpec transformation
- [`plugin-content-skills`](https://github.com/joestump/plugin-content-skills) — Skills transformation

## License

MIT
