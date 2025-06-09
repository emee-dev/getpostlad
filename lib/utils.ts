import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FileNode = {
  name: string;
  type: "file" | "directory";
  content?: string;
  children?: FileNode[];
  path: string;
};

export type FileSystemTree = {
  [name: string]: {
    file?: { contents: string };
    directory?: FileSystemTree;
  };
};

/**
 * Converts an array of FileNode objects to a FileSystemTree structure
 * @param tree - Array of FileNode objects representing the file tree
 * @returns FileSystemTree object with nested structure
 */
export function fromSidebarTree(tree: FileNode[]): FileSystemTree {
  const result: FileSystemTree = {};

  for (const node of tree) {
    if (node.type === "file") {
      result[node.name] = {
        file: {
          contents: node.content || ""
        }
      };
    } else if (node.type === "directory") {
      result[node.name] = {
        directory: node.children ? fromSidebarTree(node.children) : {}
      };
    }
  }

  return result;
}