import { create } from "zustand";

export type FileNode = {
  name: string;
  type: "file" | "directory";
  content?: string;
  children?: FileNode[];
  path?: string;
};

interface FileTreeState {
  files: FileNode[];
  selectedFile: FileNode | null;
  expandedFolders: Set<string>;
  setSelectedFile: (file: FileNode | null) => void;
  addFile: (path: string, filename: string, content: string) => void;
  addDirectory: (path: string, directoryName: string) => void;
  removeFile: (path: string) => void;
  updateFile: (path: string, content: string) => void;
  renameNode: (oldPath: string, newName: string) => void;
  toggleFolder: (path: string) => void;
  setFiles: (files: FileNode[]) => void;
  mergeFiles: (newFiles: FileNode[]) => void;
}

// Helper function to find a node by path
const findNodeByPath = (nodes: FileNode[], path: string): FileNode | null => {
  const pathParts = path.split("/").filter(Boolean);

  let current = nodes;
  let node: FileNode | null = null;

  for (const part of pathParts) {
    node = current.find((n) => n.name === part) || null;
    if (!node) return null;
    if (node.children) {
      current = node.children;
    }
  }

  return node;
};

// Helper function to remove a node by path
const removeNodeByPath = (nodes: FileNode[], path: string): FileNode[] => {
  const pathParts = path.split("/").filter(Boolean);

  if (pathParts.length === 1) {
    return nodes.filter((n) => n.name !== pathParts[0]);
  }

  return nodes.map((node) => {
    if (node.name === pathParts[0] && node.children) {
      return {
        ...node,
        children: removeNodeByPath(node.children, pathParts.slice(1).join("/")),
      };
    }
    return node;
  });
};

// Helper function to update a node's content by path
const updateNodeByPath = (
  nodes: FileNode[],
  path: string,
  content: string
): FileNode[] => {
  const pathParts = path.split("/").filter(Boolean);

  if (pathParts.length === 1) {
    return nodes.map((node) =>
      node.name === pathParts[0] && node.type === "file"
        ? { ...node, content }
        : node
    );
  }

  return nodes.map((node) => {
    if (node.name === pathParts[0] && node.children) {
      return {
        ...node,
        children: updateNodeByPath(
          node.children,
          pathParts.slice(1).join("/"),
          content
        ),
      };
    }
    return node;
  });
};

// Helper function to rename a node by path
const renameNodeByPath = (
  nodes: FileNode[],
  oldPath: string,
  newName: string
): FileNode[] => {
  const pathParts = oldPath.split("/").filter(Boolean);

  if (pathParts.length === 1) {
    return nodes.map((node) => {
      if (node.name === pathParts[0]) {
        const newPath = oldPath.replace(node.name, newName);
        return {
          ...node,
          name: newName,
          path: newPath,
          children: node.children ? updateChildrenPaths(node.children, newPath) : undefined,
        };
      }
      return node;
    });
  }

  return nodes.map((node) => {
    if (node.name === pathParts[0] && node.children) {
      return {
        ...node,
        children: renameNodeByPath(
          node.children,
          pathParts.slice(1).join("/"),
          newName
        ),
      };
    }
    return node;
  });
};

// Helper function to update children paths after rename
const updateChildrenPaths = (children: FileNode[], parentPath: string): FileNode[] => {
  return children.map((child) => {
    const newPath = `${parentPath}/${child.name}`;
    return {
      ...child,
      path: newPath,
      children: child.children ? updateChildrenPaths(child.children, newPath) : undefined,
    };
  });
};

// Helper function to add a file by path with duplicate checking
const addNodeByPath = (
  nodes: FileNode[],
  path: string,
  name: string,
  type: "file" | "directory",
  content?: string
): FileNode[] => {
  const pathParts = path.split("/").filter(Boolean);

  if (pathParts.length === 0) {
    // Add to root - check for existing file with same name
    const fullPath = name;
    const existingIndex = nodes.findIndex((node) => node.name === name);
    
    if (existingIndex !== -1) {
      // File exists - overwrite if it's a file, or skip if it's a directory
      const existingNode = nodes[existingIndex];
      if (existingNode.type === "file" && type === "file") {
        // Overwrite existing file
        const updatedNode: FileNode = {
          ...existingNode,
          content: content || "",
        };
        return nodes.map((node, index) => 
          index === existingIndex ? updatedNode : node
        );
      }
      // If trying to add directory over file or vice versa, skip
      return nodes;
    }

    // Create new node
    const newNode: FileNode = {
      name,
      type,
      path: fullPath,
      ...(type === "file" && { content: content || "" }),
      ...(type === "directory" && { children: [] }),
    };
    return [...nodes, newNode];
  }

  return nodes.map((node) => {
    if (node.name === pathParts[0]) {
      if (pathParts.length === 1) {
        // Add to this directory - check for existing file
        const fullPath = `${path}/${name}`;
        const existingIndex = (node.children || []).findIndex((child) => child.name === name);
        
        if (existingIndex !== -1) {
          // File exists in this directory
          const existingChild = node.children![existingIndex];
          if (existingChild.type === "file" && type === "file") {
            // Overwrite existing file
            const updatedChild: FileNode = {
              ...existingChild,
              content: content || "",
            };
            return {
              ...node,
              children: node.children!.map((child, index) => 
                index === existingIndex ? updatedChild : child
              ),
            };
          }
          // If trying to add directory over file or vice versa, skip
          return node;
        }

        // Create new node in this directory
        const newNode: FileNode = {
          name,
          type,
          path: fullPath,
          ...(type === "file" && { content: content || "" }),
          ...(type === "directory" && { children: [] }),
        };
        return {
          ...node,
          children: [...(node.children || []), newNode],
        };
      } else if (node.children) {
        // Continue down the path
        return {
          ...node,
          children: addNodeByPath(
            node.children,
            pathParts.slice(1).join("/"),
            name,
            type,
            content
          ),
        };
      }
    }
    return node;
  });
};

// Helper function to add paths to all nodes
const addPathsToNodes = (nodes: FileNode[], parentPath = ""): FileNode[] => {
  return nodes.map((node) => {
    const nodePath = parentPath ? `${parentPath}/${node.name}` : node.name;
    return {
      ...node,
      path: nodePath,
      children: node.children
        ? addPathsToNodes(node.children, nodePath)
        : undefined,
    };
  });
};

// Helper function to merge file trees
const mergeFileTrees = (existing: FileNode[], incoming: FileNode[]): FileNode[] => {
  const merged = [...existing];
  
  for (const incomingNode of incoming) {
    const existingIndex = merged.findIndex(node => node.name === incomingNode.name);
    
    if (existingIndex >= 0) {
      const existingNode = merged[existingIndex];
      
      if (existingNode.type === "directory" && incomingNode.type === "directory") {
        // Merge directories recursively
        merged[existingIndex] = {
          ...existingNode,
          children: mergeFileTrees(
            existingNode.children || [],
            incomingNode.children || []
          ),
        };
      } else {
        // Replace with incoming node (file or type mismatch)
        merged[existingIndex] = incomingNode;
      }
    } else {
      // Add new node
      merged.push(incomingNode);
    }
  }
  
  return merged;
};

export const useFileTreeStore = create<FileTreeState>((set, get) => ({
  files: [],
  selectedFile: null,
  expandedFolders: new Set(),

  setSelectedFile: (file) => set({ selectedFile: file }),

  addFile: (path, filename, content) =>
    set((state) => ({
      files: addNodeByPath(state.files, path, filename, "file", content),
    })),

  addDirectory: (path, directoryName) =>
    set((state) => ({
      files: addNodeByPath(state.files, path, directoryName, "directory"),
    })),

  removeFile: (path) =>
    set((state) => ({
      files: removeNodeByPath(state.files, path),
      // Clear selectedFile if it matches the deleted file
      selectedFile:
        state.selectedFile?.path === path ? null : state.selectedFile,
    })),

  updateFile: (path, content) =>
    set((state) => {
      const updatedFiles = updateNodeByPath(state.files, path, content);
      const updatedSelectedFile =
        state.selectedFile?.path === path
          ? { ...state.selectedFile, content }
          : state.selectedFile;

      return {
        files: updatedFiles,
        selectedFile: updatedSelectedFile,
      };
    }),

  renameNode: (oldPath, newName) =>
    set((state) => {
      const updatedFiles = renameNodeByPath(state.files, oldPath, newName);
      const pathParts = oldPath.split("/");
      const newPath = [...pathParts.slice(0, -1), newName].join("/");
      
      const updatedSelectedFile =
        state.selectedFile?.path === oldPath
          ? { ...state.selectedFile, name: newName, path: newPath }
          : state.selectedFile;

      return {
        files: updatedFiles,
        selectedFile: updatedSelectedFile,
      };
    }),

  toggleFolder: (path) =>
    set((state) => {
      const newExpanded = new Set(state.expandedFolders);
      if (newExpanded.has(path)) {
        newExpanded.delete(path);
      } else {
        newExpanded.add(path);
      }
      return { expandedFolders: newExpanded };
    }),

  setFiles: (files) => set({ files: addPathsToNodes(files) }),

  mergeFiles: (newFiles) =>
    set((state) => ({
      files: addPathsToNodes(mergeFileTrees(state.files, newFiles)),
    })),
}));