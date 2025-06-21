"use client";

import { CodeEditor } from "@/components/editor";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FileNode, useFileTreeStore } from "@/hooks/use-file-store";
import { cn } from "@/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import Fuse, { FuseResultMatch } from "fuse.js";
import { File } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";


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
function flattenFileTree(
  tree: FileNode[],
  parentPath: string = ""
): FlatFile[] {
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

// Highlight matching text
function highlightMatches(
  text: string,
  matches: FuseResultMatch[] = []
): React.ReactNode {
  if (!matches.length) return text;

  // Find matches for this specific text
  const textMatches = matches.filter(
    (match) => match.value === text || text.includes(match.value || "")
  );

  if (!textMatches.length) return text;

  // Create highlighted version
  const highlights: Array<{ start: number; end: number }> = [];

  textMatches.forEach((match) => {
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

    // Add highlighted text with softer styling
    parts.push(
      <span
        key={index}
        className="bg-yellow-400/40 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-200 rounded-sm px-0.5"
      >
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
  const parentRef = useRef<HTMLDivElement>(null);

  // Flatten file tree for searching
  const flatFiles = useMemo(() => flattenFileTree(files), [files]);

  // Setup Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(flatFiles, {
      keys: [
        { name: "name", weight: 0.4 },
        { name: "path", weight: 0.3 },
        { name: "content", weight: 0.3 },
      ],
      includeScore: true,
      includeMatches: true,
      threshold: 0.3,
      minMatchCharLength: 1,
      ignoreLocation: true,
    });
  }, [flatFiles]);

  // Search results - only show when there's a query
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return [];
    }

    return fuse.search(debouncedQuery).slice(0, 100); // Increased for virtualization
  }, [debouncedQuery, fuse]);

  // Virtualization
  const virtualizer = useVirtualizer({
    count: searchResults.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // Fixed height for each item
    overscan: 5,
  });

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
          setSelectedIndex((prev) =>
            prev < searchResults.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
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

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
      virtualizer.scrollToIndex(selectedIndex, { align: "center" });
    }
  }, [selectedIndex, virtualizer]);

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
      <DialogContent className="max-w-[88%] h-[85%] flex-col flex p-0 gap-y-2 bg-background border-border">
        <DialogHeader className="sr-only">
          <DialogTitle>File Search </DialogTitle>
          <DialogDescription>
            Find requests as fast as possible
          </DialogDescription>
        </DialogHeader>
        {/* Fixed Search Input */}
        <div className="px-4 py-4 border-border mt-7 h-16">
          <Input
            placeholder="Search files..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-background border-border font-mono text-sm focus:ring-1 focus:ring-primary"
            autoFocus
          />
        </div>

        <div className="flex flex-1 min-h-0 gap-x-1 p-2">
          {/* Results Panel */}
          <div className="w-1/2  flex flex-col bg-background">
            <div className="flex-shrink-0 px-4 py-2 bg-muted/20 rounded-sm ">
              <span className="text-sm font-mono text-muted-foreground">
                Results ({searchResults.length})
              </span>
            </div>

            {/* Virtualized Results */}
            <div className="flex-1 min-h-0">
              {searchResults.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground font-mono text-sm">
                    {debouncedQuery
                      ? "No files found"
                      : "Start typing to search..."}
                  </div>
                </div>
              ) : (
                <div
                  ref={parentRef}
                  className="h-full overflow-auto scrollbar-hide"
                  style={{ contain: "strict" }}
                >
                  <div
                    style={{
                      height: `${virtualizer.getTotalSize()}px`,
                      width: "100%",
                      position: "relative",
                    }}
                  >
                    {virtualizer.getVirtualItems().map((virtualItem) => {
                      const result = searchResults[virtualItem.index];
                      const { item, matches } = result;
                      const isSelected = virtualItem.index === selectedIndex;

                      return (
                        <div
                          key={virtualItem.key}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: `${virtualItem.size}px`,
                            transform: `translateY(${virtualItem.start}px)`,
                          }}
                        >
                          <div
                            className={cn(
                              "h-full rounded-sm px-4 py-2 cursor-pointer transition-colors flex items-center gap-3 font-mono text-sm",
                              isSelected
                                ? "bg-primary/20 text-primary-foreground"
                                : "hover:bg-muted/30 text-foreground"
                            )}
                            onClick={() => handleSelectFile(item)}
                          >
                            <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="truncate">
                                {highlightMatches(
                                  item.name,
                                  matches as FuseResultMatch[]
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {highlightMatches(
                                  item.path,
                                  matches as FuseResultMatch[]
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="w-1/2 flex flex-col bg-background border rounded-sm">
            <div className="flex-shrink-0 px-4 py-2 bg-muted/20">
              <div className="flex items-center gap-2 font-mono text-sm">
                {selectedFile ? (
                  <>
                    <File className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate text-foreground">
                      {selectedFile.name}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground text-xs truncate">
                      {selectedFile.path}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Preview</span>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0">
              {selectedFile ? (
                <div className="overflow-auto scrollbar-hide">
                  <CodeEditor
                    value={selectedFile.content}
                    language="javascript"
                    readOnly
                    lineWrap
                    theme={(theme as any) || "system"}
                    disableHttpDecorators={true}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-muted-foreground font-mono text-sm">
                    Select a file to preview
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}