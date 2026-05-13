export interface ArtifactMetadata {
  id: string;
  title: string;
  status?: string;
  date?: string;
  supersededBy?: string;
  dependsOn?: string[];
  relatedTo?: string[];
}

export interface ParsedFrontmatter {
  metadata: Record<string, any>;
  content: string;
}

export interface ArtifactDAG {
  nodes: Map<string, ArtifactMetadata>;
  edges: Array<{
    from: string;
    to: string;
    type: 'supersedes' | 'depends-on' | 'relates-to';
  }>;
}

export interface GraphVisualizationOptions {
  format?: 'mermaid' | 'ascii';
  title?: string;
  direction?: 'TB' | 'LR' | 'BT' | 'RL';
}
