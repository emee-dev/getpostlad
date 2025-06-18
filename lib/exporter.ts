import JSZip from "jszip";
import { FileNode } from "./utils";

/**
 * Exports a file tree to a ZIP archive
 * @param fileTree - Array of FileNode objects representing the file/folder hierarchy
 * @returns Promise<Blob> - ZIP file as a Blob that can be downloaded or stored
 */
export async function exportToZip(fileTree: FileNode[]): Promise<Blob> {
  const zip = new JSZip();

  /**
   * Recursively processes file nodes and adds them to the ZIP archive
   * @param nodes - Array of FileNode objects to process
   * @param basePath - Current path prefix for nested files/folders
   */
  function processNodes(nodes: FileNode[], basePath: string = ""): void {
    for (const node of nodes) {
      // Construct the full path for this node
      const fullPath = basePath ? `${basePath}/${node.name}` : node.name;

      if (node.type === "file") {
        // Add file to ZIP with its content
        const content = node.content || "";
        zip.file(fullPath, content);
      } else if (node.type === "directory") {
        // Create directory in ZIP (JSZip automatically creates directories when files are added)
        // But we'll explicitly create empty directories to preserve structure
        if (!node.children || node.children.length === 0) {
          // Empty directory - create it explicitly
          zip.folder(fullPath);
        } else {
          // Directory with children - process recursively
          processNodes(node.children, fullPath);
        }
      }
    }
  }

  try {
    // Process all nodes in the file tree
    processNodes(fileTree);

    // Generate the ZIP file as a Blob
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6, // Balanced compression level (0-9)
      },
    });

    return zipBlob;
  } catch (error) {
    console.error("Error creating ZIP file:", error);
    throw new Error(`Failed to create ZIP file: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Helper function to trigger a download of the ZIP file
 * @param zipBlob - The ZIP file as a Blob
 * @param filename - Name for the downloaded file (without .zip extension)
 */
export function downloadZip(zipBlob: Blob, filename: string = "collection"): void {
  try {
    // Create a download URL for the blob
    const url = URL.createObjectURL(zipBlob);
    
    // Create a temporary anchor element to trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.zip`;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading ZIP file:", error);
    throw new Error(`Failed to download ZIP file: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Convenience function that exports file tree to ZIP and triggers download
 * @param fileTree - Array of FileNode objects
 * @param filename - Name for the downloaded file (without .zip extension)
 */
export async function exportAndDownloadZip(
  fileTree: FileNode[], 
  filename: string = "collection"
): Promise<void> {
  try {
    const zipBlob = await exportToZip(fileTree);
    downloadZip(zipBlob, filename);
  } catch (error) {
    console.error("Error exporting and downloading ZIP:", error);
    throw error;
  }
}