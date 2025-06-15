"use client";

import { FileNode, useFileTreeStore } from "@/hooks/use-file-store";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  FolderOpen,
} from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useMemo, useCallback, memo } from "react";
import { flattenVisibleTree, FlattenedNode, TreeFlattener } from "@/lib/file-tree-utils";

// Create a singleton tree flattener for caching
const treeFlattener = new TreeFlattener();

interface VirtualizedFileTreeItemProps {
  node: FlattenedNode;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (node: FileNode) => void;
  onToggle: (path: string) => void;
}

const VirtualizedFileTreeItem = memo(({
  node,
  isSelected,
  isExpanded,
  onSelect,
  onToggle,
}: VirtualizedFileTreeItemProps) => {
  const handleClick = useCallback(() => {
    if (node.type === "file") {
      onSelect(node);
    } else {
      onToggle(node.path || "");
    }
  }, [node, onSelect, onToggle]);

  const paddingLeft = node.level * 16;

  return (
    <div
      className={cn(
        "flex items-center py-1 px-2 hover:bg-accent cursor-pointer text-sm transition-colors rounded-md mx-1",
        isSelected && "bg-accent text-accent-foreground"
      )}
      style={{ paddingLeft: `${paddingLeft + 8}px` }}
      onClick={handleClick}
    >
      {node.type === "directory" && (
        <div className="mr-1 flex-shrink-0 text-muted-foreground">
          {isExpanded ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </div>
      )}

      <div className="mr-2 flex-shrink-0 text-muted-foreground">
        {node.type === "directory" ? (
          isExpanded ? (
            <FolderOpen size={16} />
          ) : (
            <Folder size={16} />
          )
        ) : (
          <File
            size={16}
            style={{ marginLeft: node.type === "file" ? "20px" : "0px" }}
          />
        )}
      </div>

      <span className="truncate">{node.name}</span>
    </div>
  );
});

VirtualizedFileTreeItem.displayName = "VirtualizedFileTreeItem";

export const FileExplorer = () => {
  const { files, selectedFile, expandedFolders, setSelectedFile, toggleFolder } =
    useFileTreeStore();

  const parentRef = useRef<HTMLDivElement>(null);

  // Flatten the tree structure for virtualization
  const flattenedNodes = useMemo(() => {
    if (!files || files.length === 0) {
      return [];
    }
    
    // Use direct flattening instead of the cached version for debugging
    const result = flattenVisibleTree(files, expandedFolders);
    console.log("Flattened nodes:", result.length, result);
    return result;
  }, [files, expandedFolders]);

  // Create virtualizer
  const virtualizer = useVirtualizer({
    count: flattenedNodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 32, []), // Estimated height per item
    overscan: 10, // Render 10 extra items outside viewport for smooth scrolling
  });

  // Memoized handlers
  const handleSelect = useCallback(
    (node: FileNode) => {
      setSelectedFile(node);
    },
    [setSelectedFile]
  );

  const handleToggle = useCallback(
    (path: string) => {
      toggleFolder(path);
    },
    [toggleFolder]
  );

  console.log("FileExplorer render:", { 
    filesLength: files.length, 
    flattenedLength: flattenedNodes.length,
    expandedFolders: Array.from(expandedFolders)
  });

  if (files.length === 0) {
    return (
      <div className="h-[calc(100%-3rem)] font-geist">
        <div className="text-center text-muted-foreground text-sm py-8">
          No files in workspace
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100%-3rem)] font-geist">
      <div
        ref={parentRef}
        className="h-full overflow-auto"
        style={{
          contain: "strict",
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const node = flattenedNodes[virtualItem.index];
            if (!node) {
              console.warn("Missing node at index:", virtualItem.index);
              return null;
            }

            const isSelected = selectedFile?.path === node.path;
            const isExpanded = expandedFolders.has(node.path || "");

            return (
              <div
                key={node.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <VirtualizedFileTreeItem
                  node={node}
                  isSelected={isSelected}
                  isExpanded={isExpanded}
                  onSelect={handleSelect}
                  onToggle={handleToggle}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};