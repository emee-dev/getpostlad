import { FileNode } from "@/hooks/use-file-store";

export type FlattenedNode = FileNode & {
  level: number;
  id: string;
};

/**
 * Flattens a nested file tree into a flat array of visible nodes
 * @param nodes - Array of FileNode objects
 * @param expandedFolders - Set of expanded folder paths
 * @param level - Current nesting level (for indentation)
 * @param parentPath - Path of the parent directory
 * @returns Array of flattened nodes that should be visible
 */
export function flattenVisibleTree(
  nodes: FileNode[],
  expandedFolders: Set<string>,
  level: number = 0,
  parentPath: string = ""
): FlattenedNode[] {
  const result: FlattenedNode[] = [];

  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    const currentPath = node.path || `${parentPath}/${node.name}`.replace(/^\//, "");
    
    // Create a unique ID for each node
    const nodeId = `${currentPath}-${level}-${index}`;

    // Add the current node to the result
    const flattenedNode: FlattenedNode = {
      ...node,
      level,
      id: nodeId,
      path: currentPath,
    };

    result.push(flattenedNode);

    // If this is a directory and it's expanded, recursively add its children
    if (
      node.type === "directory" &&
      node.children &&
      expandedFolders.has(currentPath)
    ) {
      const childNodes = flattenVisibleTree(
        node.children,
        expandedFolders,
        level + 1,
        currentPath
      );
      result.push(...childNodes);
    }
  }

  return result;
}

/**
 * Memoization helper for flattened tree to avoid unnecessary recalculations
 */
export class TreeFlattener {
  private cache = new Map<string, FlattenedNode[]>();
  private lastExpandedState = "";

  flatten(
    nodes: FileNode[],
    expandedFolders: Set<string>
  ): FlattenedNode[] {
    // Create a cache key based on the expanded state
    const expandedState = Array.from(expandedFolders).sort().join(",");
    const cacheKey = `${JSON.stringify(nodes)}-${expandedState}`;

    // Check if we have a cached result
    if (this.cache.has(cacheKey) && this.lastExpandedState === expandedState) {
      return this.cache.get(cacheKey)!;
    }

    // Calculate the flattened tree
    const result = flattenVisibleTree(nodes, expandedFolders);

    // Cache the result
    this.cache.set(cacheKey, result);
    this.lastExpandedState = expandedState;

    // Limit cache size to prevent memory leaks
    if (this.cache.size > 10) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey || "");
    }

    return result;
  }

  clearCache(): void {
    this.cache.clear();
    this.lastExpandedState = "";
  }
}