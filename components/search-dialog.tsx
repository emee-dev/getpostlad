"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CodeEditor } from "@/components/editor";
import { useFileTreeStore, FileNode } from "@/hooks/use-file-store";
import { useTheme } from "next-themes";
import Fuse, { FuseResultMatch } from "fuse.js";
import { File, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FlatFile {
  name: string;
  content: string;
  path: string;
  node: FileNode;
}

interface SearchResult {
  item: FlatFile;
  score?: number;
  matches?: FuseResultMatch[];
}

// Custom debounce hook
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debounced;
}

// Flatten file tree into searchable array
function flattenFileTree(tree: FileNode[], parentPath: string = ""): FlatFile[] {
  const flatFiles: FlatFile[] = [];
  
  for (const node of tree) {
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    
    if (node.type === "file") {
      flatFiles.push({
        name: node.name,
        content: node.content || "",
        path: currentPath,
        node: { ...node, path: currentPath },
      });
    } else if (node.type === "directory" && node.children) {
      flatFiles.push(...flattenFileTree(node.children, currentPath));
    }
  }
  
  return flatFiles;
}

// Get first N lines of content
function getPreviewLines(content: string, maxLines: number = 4): string[] {
  return content.split('\n').slice(0, maxLines);
}

// Highlight matching text
function highlightMatches(text: string, matches: FuseResultMatch[] = []): React.ReactNode {
  if (!matches.length) return text;
  
  // Find matches for this specific text
  const textMatches = matches.filter(match => 
    match.value === text || text.includes(match.value || "")
  );
  
  if (!textMatches.length) return text;
  
  // Create highlighted version
  let highlightedText = text;
  const highlights: Array<{ start: number; end: number }> = [];
  
  textMatches.forEach(match => {
    if (match.indices) {
      match.indices.forEach(([start, end]) => {
        highlights.push({ start, end: end + 1 });
      });
    }
  });
  
  // Sort highlights by start position
  highlights.sort((a, b) => a.start - b.start);
  
  // Build highlighted JSX
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  highlights.forEach(({ start, end }, index) => {
    // Add text before highlight
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }
    
    // Add highlighted text
    parts.push(
      <span key={index} className="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 px-0.5 rounded">
        {text.slice(start, end)}
      </span>
    );
    
    lastIndex = end;
  });
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return <>{parts}</>;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const { files, setSelectedFile } = useFileTreeStore();
  const { theme } = useTheme();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debouncedQuery = useDebouncedValue(query, 200);

  // Flatten file tree for searching
  const flatFiles = useMemo(() => flattenFileTree(files), [files]);

  // Setup Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(flatFiles, {
      keys: [
        { name: "name", weight: 0.4 },
        { name: "path", weight: 0.3 },
        { name: "content", weight: 0.3 }
      ],
      includeScore: true,
      includeMatches: true,
      threshold: 0.3,
      minMatchCharLength: 1,
      ignoreLocation: true,
    });
  }, [flatFiles]);

  // Search results
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return flatFiles.slice(0, 10).map(item => ({ item, score: 0 }));
    }
    
    return fuse.search(debouncedQuery).slice(0, 10);
  }, [debouncedQuery, fuse, flatFiles]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case "Enter":
          e.preventDefault();
          if (searchResults[selectedIndex]) {
            handleSelectFile(searchResults[selectedIndex].item);
          }
          break;
        case "Escape":
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, searchResults, selectedIndex, onOpenChange]);

  // Handle file selection
  const handleSelectFile = (flatFile: FlatFile) => {
    setSelectedFile(flatFile.node);
    onOpenChange(false);
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  const selectedFile = searchResults[selectedIndex]?.item;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            Search Files
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
          {/* Search Input */}
          <div className="px-6 py-4 border-b">
            <Input
              placeholder="Search files by name, path, or content..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Results Panel */}
            <div className="w-1/2 border-r flex flex-col">
              <div className="px-4 py-2 border-b bg-muted/30 text-sm font-medium">
                Results ({searchResults.length})
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {searchResults.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      {debouncedQuery ? "No files found" : "Start typing to search..."}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {searchResults.map((result, index) => {
                        const { item, matches } = result;
                        const isSelected = index === selectedIndex;
                        const previewLines = getPreviewLines(item.content);
                        
                        return (
                          <div
                            key={item.path}
                            className={cn(
                              "p-3 rounded-md cursor-pointer transition-colors border",
                              isSelected 
                                ? "bg-primary/10 border-primary/20" 
                                : "hover:bg-muted/50 border-transparent"
                            )}
                            onClick={() => handleSelectFile(item)}
                          >
                            {/* File Header */}
                            <div className="flex items-center gap-2 mb-2">
                              <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                  {highlightMatches(item.name, matches)}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {highlightMatches(item.path, matches)}
                                </div>
                              </div>
                            </div>
                            
                            {/* Content Preview */}
                            {previewLines.length > 0 && (
                              <div className="text-xs font-mono bg-muted/30 rounded p-2 mt-2">
                                {previewLines.map((line, lineIndex) => (
                                  <div 
                                    key={lineIndex} 
                                    className="truncate text-muted-foreground"
                                  >
                                    <span className="text-muted-foreground/60 mr-2">
                                      {lineIndex + 1}
                                    </span>
                                    {highlightMatches(line, matches)}
                                  </div>
                                ))}
                                {item.content.split('\n').length > 4 && (
                                  <div className="text-muted-foreground/60 mt-1">
                                    ... {item.content.split('\n').length - 4} more lines
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Preview Panel */}
            <div className="w-1/2 flex flex-col">
              <div className="px-4 py-2 border-b bg-muted/30 text-sm font-medium flex items-center gap-2">
                {selectedFile ? (
                  <>
                    <File className="h-4 w-4" />
                    <span className="truncate">{selectedFile.name}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground text-xs truncate">
                      {selectedFile.path}
                    </span>
                  </>
                ) : (
                  "Preview"
                )}
              </div>
              
              <div className="flex-1 min-h-0">
                {selectedFile ? (
                  <div className="h-full">
                    <CodeEditor
                      value={selectedFile.content}
                      language="javascript"
                      readOnly
                      lineWrap
                      theme={(theme as any) || "system"}
                      className="h-full"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Select a file to preview
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}