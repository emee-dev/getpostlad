// @ts-expect-error
import { Collection, Item, ItemGroup } from "postman-collection";
import { DeserializedHTTP, serializeHttpFn } from "./utils";
import { FileNode } from "@/hooks/use-file-store";
import JSZip from "jszip";

export type FormatOptions = {
  useTabs?: boolean;
  tabWidth?: number;
  lineEnding?: "\n" | "\r\n";
};

/**
 * Imports a ZIP file and converts it to a FileNode tree structure
 * @param arg - ZIP file input (File, Blob, or ArrayBuffer)
 * @returns Promise<FileNode[]> - Array of FileNode representing the extracted file structure
 */
export async function importFromZip(arg: unknown): Promise<FileNode[]> {
  try {
    // Validate input type
    if (!arg || (typeof arg !== 'object')) {
      throw new Error("Invalid input: expected File, Blob, or ArrayBuffer");
    }

    // Load the ZIP file using JSZip
    const zip = new JSZip();
    let loadedZip: JSZip;

    try {
      loadedZip = await zip.loadAsync(arg as any);
    } catch (error) {
      throw new Error(`Failed to load ZIP file: ${error instanceof Error ? error.message : "Invalid ZIP format"}`);
    }

    // Build the file tree structure
    const fileTree: FileNode[] = [];
    const directoryMap = new Map<string, FileNode>();

    // Process all files in the ZIP
    const filePromises: Promise<void>[] = [];

    loadedZip.forEach((relativePath, zipEntry) => {
      const promise = processZipEntry(relativePath, zipEntry, fileTree, directoryMap);
      filePromises.push(promise);
    });

    // Wait for all files to be processed
    await Promise.all(filePromises);

    // Sort the file tree for consistent output
    sortFileTree(fileTree);

    return fileTree;
  } catch (error) {
    console.error("Error importing ZIP file:", error);
    throw new Error(`Failed to import ZIP file: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Processes a single ZIP entry and adds it to the file tree
 */
async function processZipEntry(
  relativePath: string,
  zipEntry: JSZip.JSZipObject,
  fileTree: FileNode[],
  directoryMap: Map<string, FileNode>
): Promise<void> {
  // Normalize path separators and remove leading/trailing slashes
  const normalizedPath = relativePath.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  
  if (!normalizedPath) {
    return; // Skip empty paths
  }

  const pathParts = normalizedPath.split("/");
  const fileName = pathParts[pathParts.length - 1];
  const isDirectory = zipEntry.dir || normalizedPath.endsWith("/");

  if (isDirectory) {
    // Handle directory
    ensureDirectoryPath(pathParts, fileTree, directoryMap);
  } else {
    // Handle file
    try {
      // Read file content as text
      const content = await zipEntry.async("text");
      
      // Ensure parent directories exist
      if (pathParts.length > 1) {
        const parentPath = pathParts.slice(0, -1);
        ensureDirectoryPath(parentPath, fileTree, directoryMap);
      }

      // Create file node
      const fileNode: FileNode = {
        name: fileName,
        type: "file",
        content: content,
        path: normalizedPath,
      };

      // Add file to appropriate parent directory or root
      if (pathParts.length === 1) {
        // Root level file
        fileTree.push(fileNode);
      } else {
        // File in subdirectory
        const parentPath = pathParts.slice(0, -1).join("/");
        const parentDir = directoryMap.get(parentPath);
        if (parentDir && parentDir.children) {
          parentDir.children.push(fileNode);
        }
      }
    } catch (error) {
      console.warn(`Failed to read file content for ${relativePath}:`, error);
      // Create file node with empty content if reading fails
      const fileNode: FileNode = {
        name: fileName,
        type: "file",
        content: "",
        path: normalizedPath,
      };

      if (pathParts.length === 1) {
        fileTree.push(fileNode);
      } else {
        const parentPath = pathParts.slice(0, -1).join("/");
        const parentDir = directoryMap.get(parentPath);
        if (parentDir && parentDir.children) {
          parentDir.children.push(fileNode);
        }
      }
    }
  }
}

/**
 * Ensures that all directories in a path exist in the file tree
 */
function ensureDirectoryPath(
  pathParts: string[],
  fileTree: FileNode[],
  directoryMap: Map<string, FileNode>
): void {
  let currentPath = "";
  let currentLevel = fileTree;

  for (let i = 0; i < pathParts.length; i++) {
    const dirName = pathParts[i];
    currentPath = currentPath ? `${currentPath}/${dirName}` : dirName;

    // Check if directory already exists
    if (directoryMap.has(currentPath)) {
      const existingDir = directoryMap.get(currentPath)!;
      currentLevel = existingDir.children!;
      continue;
    }

    // Create new directory
    const dirNode: FileNode = {
      name: dirName,
      type: "directory",
      children: [],
      path: currentPath,
    };

    // Add to current level
    currentLevel.push(dirNode);
    
    // Update maps and current level
    directoryMap.set(currentPath, dirNode);
    currentLevel = dirNode.children!;
  }
}

/**
 * Recursively sorts the file tree (directories first, then files, both alphabetically)
 */
function sortFileTree(nodes: FileNode[]): void {
  nodes.sort((a, b) => {
    // Directories come before files
    if (a.type !== b.type) {
      return a.type === "directory" ? -1 : 1;
    }
    // Alphabetical sorting within same type
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });

  // Recursively sort children
  for (const node of nodes) {
    if (node.type === "directory" && node.children) {
      sortFileTree(node.children);
    }
  }
}

/**
 * Converts a Postman collection JSON to a FileNode tree structure
 * @param col - Postman collection JSON object (v2.1 format)
 * @returns Array of FileNode representing the collection structure
 */
export function postmanJSONImporter(col: any): FileNode[] {
  try {
    // Create a Collection instance from the JSON
    const collection = new Collection(col);

    // Process the collection items
    const fileNodes: FileNode[] = [];

    // Process each item in the collection
    collection.items.all()?.forEach((item: Item | ItemGroup) => {
      const node = processItem(item, "");
      if (node) {
        fileNodes.push(node);
      }
    });

    return fileNodes;
  } catch (error) {
    console.error("Error parsing Postman collection:", error);
    return [];
  }
}

/**
 * Processes a single item (request or folder) from the collection
 * @param item - Postman Item or ItemGroup
 * @param parentPath - Path of the parent directory
 * @returns FileNode or null
 */
function processItem(
  item: Item | ItemGroup,
  parentPath: string
): FileNode | null {
  const itemName = item.name || "Untitled";
  const currentPath = parentPath ? `/${parentPath}/${itemName}` : itemName;

  // Check if this is a folder (ItemGroup)
  if ("items" in item && item.items) {
    // This is a folder
    const children: FileNode[] = [];

    item.items.each((childItem: Item | ItemGroup) => {
      const childNode = processItem(childItem, currentPath);
      if (childNode) {
        children.push(childNode);
      }
    });

    return {
      name: itemName,
      type: "directory",
      children,
      path: currentPath,
    };
  } else {
    const request = (item as Item).request;

    if (!request) {
      return null;
    }

    // Convert Postman request to DeserializedHTTP format
    const deserializedHTTP = convertPostmanRequest(request, itemName);

    // Generate the file content using serializeHttpFn
    const content = serializeHttpFn(deserializedHTTP, {
      useTabs: false,
      tabWidth: 2,
      lineEnding: "\n",
    });

    return {
      name: `${itemName}.js`,
      type: "file",
      content,
      path: `/${currentPath}.js`,
    };
  }
}

/**
 * Converts a Postman request to DeserializedHTTP format
 * @param request - Postman request object
 * @param name - Name of the request
 * @returns DeserializedHTTP object
 */
function convertPostmanRequest(request: any, name: string): DeserializedHTTP {
  // Extract URL
  const url = request?.url?.toString() || "";

  // Extract method
  const method = request?.method.toLowerCase() || "UNKNOWN";

  // Extract headers
  const headers: Array<{ key: string; value: string; enabled: boolean }> = [];

  request?.headers?.each((h: any) => {
    headers.push({
      key: h.key || "",
      value: h.value || "",
      enabled: h.disabled !== true,
    });
  });

  // Build the base DeserializedHTTP object
  const deserializedHTTP: DeserializedHTTP = {
    url,
    name,
    method,
    headers,
  };

  // Extract body if present
  if (request?.body && request.body.mode) {
    let body = request?.body;
    let mode = request.body.mode;

    const raw = body.raw || "";
    const lang = body.options?.raw?.language ?? "text";

    if (mode === "raw") {
      try {
        if (lang === "json") {
          deserializedHTTP.json = JSON.parse(raw);
          deserializedHTTP.body = "json";
        }
        if (lang === "xml") {
          deserializedHTTP.xml = raw;
          deserializedHTTP.body = "xml";
        }
        if (lang === "text") {
          deserializedHTTP.text = raw;
          deserializedHTTP.body = "text";
        }
      } catch {
        // fallback - ignore as it is not currently supported
      }
    }

    // Not currently supported
    if (mode === "urlencoded") {
      // deserializedHTTP.urlencoded = body.urlencoded?.toObject() ?? {};
      // deserializedHTTP.body = "urlencoded";
    } else if (mode === "formdata") {
      // deserializedHTTP.formdata = body.formdata?.toObject() ?? {};
      // deserializedHTTP.body = "formdata";
    }
  }

  return deserializedHTTP;
}