import type { ArtifactDAG, ArtifactMetadata, GraphVisualizationOptions } from './types';

export function buildArtifactDAG(
  artifacts: ArtifactMetadata[],
  relationshipKey: 'supersedes' | 'depends-on' | 'relates-to' = 'supersedes',
): ArtifactDAG {
  const nodes = new Map<string, ArtifactMetadata>();
  const edges: ArtifactDAG['edges'] = [];

  // Add all artifacts as nodes
  for (const artifact of artifacts) {
    nodes.set(artifact.id, artifact);
  }

  // Extract relationships from metadata
  for (const artifact of artifacts) {
    // Handle superseded-by relationships
    if (artifact.supersededBy) {
      edges.push({
        from: artifact.id,
        to: artifact.supersededBy,
        type: 'supersedes',
      });
    }

    // Handle dependencies
    if (artifact.dependsOn) {
      for (const dep of artifact.dependsOn) {
        edges.push({
          from: artifact.id,
          to: dep,
          type: 'depends-on',
        });
      }
    }

    // Handle related artifacts
    if (artifact.relatedTo) {
      for (const related of artifact.relatedTo) {
        edges.push({
          from: artifact.id,
          to: related,
          type: 'relates-to',
        });
      }
    }
  }

  return { nodes, edges };
}

export function renderMermaidGraph(
  dag: ArtifactDAG,
  options: GraphVisualizationOptions = {},
): string {
  const direction = options.direction ?? 'TB';
  const lines: string[] = [`graph ${direction}`];

  // Add nodes
  for (const [id, metadata] of dag.nodes) {
    const title = metadata.title.replace(/"/g, '\\"');
    lines.push(`  ${id}["${id}: ${title}"]`);
  }

  // Add edges with labels
  for (const edge of dag.edges) {
    const label = edge.type.replace(/-/g, ' ');
    lines.push(`  ${edge.from} -->|${label}| ${edge.to}`);
  }

  return lines.join('\n');
}

export function renderASCIIDAG(
  dag: ArtifactDAG,
  options: GraphVisualizationOptions = {},
): string {
  if (dag.nodes.size === 0) {
    return '(no artifacts)';
  }

  // Simple ASCII rendering: topological sort + indentation
  const visited = new Set<string>();
  const lines: string[] = [];
  const nodeWidth = Math.max(...Array.from(dag.nodes.keys()).map(id => id.length));

  function renderNode(id: string, depth: number = 0): void {
    if (visited.has(id)) {
      return;
    }
    visited.add(id);

    const indent = '  '.repeat(depth);
    const node = dag.nodes.get(id);
    if (node) {
      lines.push(`${indent}├─ ${id.padEnd(nodeWidth)} ${node.title}`);
    }

    // Render outgoing edges
    const outgoing = dag.edges.filter(e => e.from === id);
    for (const edge of outgoing) {
      renderNode(edge.to, depth + 1);
    }
  }

  // Start with nodes that have no incoming edges (roots)
  const incomingIds = new Set(dag.edges.map(e => e.to));
  const roots = Array.from(dag.nodes.keys()).filter(id => !incomingIds.has(id));

  if (roots.length > 0) {
    for (const root of roots) {
      renderNode(root);
    }
  } else {
    // If all nodes have incoming edges (cycle), just render all
    for (const id of dag.nodes.keys()) {
      renderNode(id);
    }
  }

  return lines.join('\n');
}

export function visualizeArtifacts(
  dag: ArtifactDAG,
  options: GraphVisualizationOptions = {},
): string {
  const format = options.format ?? 'mermaid';

  if (format === 'ascii') {
    return renderASCIIDAG(dag, options);
  }

  return renderMermaidGraph(dag, options);
}
