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
  removeFile: (path: string) => void;
  updateFile: (path: string, content: string) => void;
  toggleFolder: (path: string) => void;
  setFiles: (files: FileNode[]) => void;
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

// Helper function to add a node by path
const addNodeByPath = (
  nodes: FileNode[],
  path: string,
  filename: string,
  content: string
): FileNode[] => {
  const pathParts = path.split("/").filter(Boolean);

  if (pathParts.length === 0) {
    // Add to root
    return [
      ...nodes,
      { name: filename, type: "file", content, path: filename },
    ];
  }

  return nodes.map((node) => {
    if (node.name === pathParts[0]) {
      if (pathParts.length === 1) {
        // Add to this directory
        const newFile: FileNode = {
          name: filename,
          type: "file",
          content,
          path: `${path}/${filename}`,
        };
        return {
          ...node,
          children: [...(node.children || []), newFile],
        };
      } else if (node.children) {
        // Continue down the path
        return {
          ...node,
          children: addNodeByPath(
            node.children,
            pathParts.slice(1).join("/"),
            filename,
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

export const useFileTreeStore = create<FileTreeState>((set, get) => ({
  files: [],
  selectedFile: null,
  expandedFolders: new Set(),

  setSelectedFile: (file) => set({ selectedFile: file }),

  addFile: (path, filename, content) =>
    set((state) => ({
      files: addNodeByPath(state.files, path, filename, content),
    })),

  removeFile: (path) =>
    set((state) => ({
      files: removeNodeByPath(state.files, path),
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
}));
