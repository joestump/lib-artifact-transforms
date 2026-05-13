import {
  buildArtifactDAG,
  renderMermaidGraph,
  renderASCIIDAG,
  visualizeArtifacts,
} from '../graph';
import type { ArtifactMetadata } from '../types';

describe('graph', () => {
  const mockArtifacts: ArtifactMetadata[] = [
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
      title: 'Old Decision',
      status: 'deprecated',
      supersededBy: 'ADR-0001',
    },
  ];

  describe('buildArtifactDAG', () => {
    it('should create nodes for all artifacts', () => {
      const dag = buildArtifactDAG(mockArtifacts);

      expect(dag.nodes.size).toBe(3);
      expect(dag.nodes.has('ADR-0001')).toBe(true);
      expect(dag.nodes.has('ADR-0002')).toBe(true);
      expect(dag.nodes.has('ADR-0003')).toBe(true);
    });

    it('should extract supersedes relationships', () => {
      const dag = buildArtifactDAG(mockArtifacts);

      const supersedesEdges = dag.edges.filter(e => e.type === 'supersedes');
      expect(supersedesEdges.length).toBe(1);
      expect(supersedesEdges[0].from).toBe('ADR-0003');
      expect(supersedesEdges[0].to).toBe('ADR-0001');
    });

    it('should extract dependency relationships', () => {
      const dag = buildArtifactDAG(mockArtifacts);

      const dependsEdges = dag.edges.filter(e => e.type === 'depends-on');
      expect(dependsEdges.length).toBe(1);
      expect(dependsEdges[0].from).toBe('ADR-0002');
      expect(dependsEdges[0].to).toBe('ADR-0001');
    });
  });

  describe('renderMermaidGraph', () => {
    it('should generate valid Mermaid syntax', () => {
      const dag = buildArtifactDAG(mockArtifacts);
      const mermaid = renderMermaidGraph(dag);

      expect(mermaid).toContain('graph TB');
      expect(mermaid).toContain('ADR-0001');
      expect(mermaid).toContain('Use TypeScript');
      expect(mermaid).toContain('-->');
    });

    it('should respect direction option', () => {
      const dag = buildArtifactDAG(mockArtifacts);
      const mermaidLR = renderMermaidGraph(dag, { direction: 'LR' });

      expect(mermaidLR).toContain('graph LR');
    });

    it('should handle empty DAG', () => {
      const dag = { nodes: new Map(), edges: [] };
      const mermaid = renderMermaidGraph(dag);

      expect(mermaid).toContain('graph TB');
    });
  });

  describe('renderASCIIDAG', () => {
    it('should generate ASCII output', () => {
      const dag = buildArtifactDAG(mockArtifacts);
      const ascii = renderASCIIDAG(dag);

      expect(ascii).toContain('ADR-0001');
      expect(ascii).toContain('├─');
    });

    it('should handle empty DAG', () => {
      const dag = { nodes: new Map(), edges: [] };
      const ascii = renderASCIIDAG(dag);

      expect(ascii).toBe('(no artifacts)');
    });

    it('should show parent-child relationships', () => {
      const dag = buildArtifactDAG(mockArtifacts);
      const ascii = renderASCIIDAG(dag);

      // Should show hierarchy
      expect(ascii.split('\n').length).toBeGreaterThan(1);
    });
  });

  describe('visualizeArtifacts', () => {
    it('should default to Mermaid format', () => {
      const dag = buildArtifactDAG(mockArtifacts);
      const visualization = visualizeArtifacts(dag);

      expect(visualization).toContain('graph');
    });

    it('should render ASCII when format specified', () => {
      const dag = buildArtifactDAG(mockArtifacts);
      const visualization = visualizeArtifacts(dag, { format: 'ascii' });

      expect(visualization).toContain('├─');
    });

    it('should render Mermaid when format specified', () => {
      const dag = buildArtifactDAG(mockArtifacts);
      const visualization = visualizeArtifacts(dag, { format: 'mermaid' });

      expect(visualization).toContain('graph');
    });
  });
});
