# lib-artifact-transforms

Shared library for artifact processing, frontmatter parsing, and graph visualization. Used by Docusaurus plugins to transform ADRs, OpenSpec specs, and skills.

## Installation

```bash
npm install lib-artifact-transforms
```

## Usage

### Frontmatter Parsing

```typescript
import { parseFrontmatter, extractStatus } from 'lib-artifact-transforms';

const content = `---
status: accepted
date: 2026-05-13
---

# ADR-0001: Use TypeScript

## Decision Outcome
We will use TypeScript for all new projects.
`;

const { metadata, content: body } = parseFrontmatter(content);
const status = extractStatus(metadata); // 'accepted'
```

### Graph Building and Visualization

```typescript
import { buildArtifactDAG, visualizeArtifacts } from 'lib-artifact-transforms';

const artifacts = [
  {
    id: 'ADR-0001',
    title: 'Use TypeScript',
    status: 'accepted',
    supersededBy: undefined,
  },
  {
    id: 'ADR-0002',
    title: 'Use Node.js',
    status: 'accepted',
    dependsOn: ['ADR-0001'],
  },
];

const dag = buildArtifactDAG(artifacts);
const mermaidSvg = visualizeArtifacts(dag, { format: 'mermaid' });
const asciiDag = visualizeArtifacts(dag, { format: 'ascii' });
```

## Exports

- `parseFrontmatter()` — Parse YAML and legacy inline-bullet frontmatter
- `extractStatus()` — Extract status with parenthetical refinement stripping
- `extractField()` — Type-safe field extraction with defaults
- `buildArtifactDAG()` — Construct a DAG from artifacts with relationships
- `renderMermaidGraph()` — Generate Mermaid diagram syntax
- `renderASCIIDAG()` — Generate ASCII DAG for terminal output
- `visualizeArtifacts()` — Unified visualization (format-agnostic)
- Types: `ArtifactMetadata`, `ArtifactDAG`, `ParsedFrontmatter`, `GraphVisualizationOptions`

## License

MIT
