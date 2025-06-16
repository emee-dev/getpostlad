"use client";

import { FileNode, useFileTreeStore } from "@/hooks/use-file-store";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  FolderOpen,
  FilePlus,
  FolderPlus,
  Edit,
  Trash2,
} from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useMemo, useCallback, memo, useState, useEffect } from "react";
import { flattenVisibleTree, FlattenedNode, TreeFlattener } from "@/lib/file-tree-utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Create a singleton tree flattener for caching
const treeFlattener = new TreeFlattener();

interface VirtualizedFileTreeItemProps {
  node: FlattenedNode;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (node: FileNode) => void;
  onToggle: (path: string) => void;
  onContextMenu: (node: FlattenedNode, action: string) => void;
}

const VirtualizedFileTreeItem = memo(({
  node,
  isSelected,
  isExpanded,
  onSelect,
  onToggle,
  onContextMenu,
}: VirtualizedFileTreeItemProps) => {
  const handleClick = useCallback(() => {
    if (node.type === "file") {
      onSelect(node);
    } else {
      onToggle(node.path || "");
    }
  }, [node, onSelect, onToggle]);

  const paddingLeft = node.level * 16;

  // Determine if we should show folder creation options
  const canCreateInside = node.type === "directory";

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
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
              />
            )}
          </div>

          <span className="truncate">{node.name}</span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem 
          onClick={() => onContextMenu(node, "newFile")}
          disabled={!canCreateInside}
        >
          <FilePlus className="mr-2 h-4 w-4" />
          New File
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onContextMenu(node, "newFolder")}
          disabled={!canCreateInside}
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          New Folder
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onContextMenu(node, "rename")}>
          <Edit className="mr-2 h-4 w-4" />
          Rename
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onContextMenu(node, "delete")}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
});

VirtualizedFileTreeItem.displayName = "VirtualizedFileTreeItem";

interface FileOperationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  placeholder: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
}

const FileOperationDialog = ({
  open,
  onOpenChange,
  title,
  placeholder,
  defaultValue = "",
  onConfirm,
}: FileOperationDialogProps) => {
  const [value, setValue] = useState(defaultValue);

  // Update value when defaultValue changes (for rename dialog)
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value.trim());
      setValue("");
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm();
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setValue(""); // Reset value when closing
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!value.trim()}>
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const FileExplorer = () => {
  const { 
    files, 
    selectedFile, 
    expandedFolders, 
    setSelectedFile, 
    toggleFolder,
    addFile,
    addDirectory,
    removeFile,
    renameNode,
  } = useFileTreeStore();

  const parentRef = useRef<HTMLDivElement>(null);
  
  // Dialog state
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    type: "newFile" | "newFolder" | "rename";
    title: string;
    placeholder: string;
    defaultValue: string;
    targetNode: FlattenedNode | null;
  }>({
    open: false,
    type: "newFile",
    title: "",
    placeholder: "",
    defaultValue: "",
    targetNode: null,
  });

  // Flatten the tree structure for virtualization
  const flattenedNodes = useMemo(() => {
    if (!files || files.length === 0) {
      return [];
    }
    return treeFlattener.flatten(files, expandedFolders);
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

  const handleContextMenu = useCallback((node: FlattenedNode, action: string) => {
    switch (action) {
      case "newFile":
        // Only allow if target is a directory
        if (node.type === "directory") {
          setDialogState({
            open: true,
            type: "newFile",
            title: "Create New File",
            placeholder: "Enter file name (e.g., script.js)",
            defaultValue: "",
            targetNode: node,
          });
        }
        break;
      case "newFolder":
        // Only allow if target is a directory
        if (node.type === "directory") {
          setDialogState({
            open: true,
            type: "newFolder",
            title: "Create New Folder",
            placeholder: "Enter folder name",
            defaultValue: "",
            targetNode: node,
          });
        }
        break;
      case "rename":
        setDialogState({
          open: true,
          type: "rename",
          title: `Rename ${node.type === "file" ? "File" : "Folder"}`,
          placeholder: `Enter new ${node.type} name`,
          defaultValue: node.name, // Prefill with current name
          targetNode: node,
        });
        break;
      case "delete":
        if (node.path) {
          removeFile(node.path);
          // The store will handle clearing selectedFile if it matches the deleted file
        }
        break;
    }
  }, [removeFile]);

  const handleDialogConfirm = useCallback((value: string) => {
    if (!dialogState.targetNode) return;

    const targetPath = dialogState.targetNode.path || "";
    
    switch (dialogState.type) {
      case "newFile":
        // Target is guaranteed to be a directory due to validation in handleContextMenu
        addFile(targetPath, value, "");
        break;
      case "newFolder":
        // Target is guaranteed to be a directory due to validation in handleContextMenu
        addDirectory(targetPath, value);
        break;
      case "rename":
        renameNode(targetPath, value);
        break;
    }
  }, [dialogState, addFile, addDirectory, renameNode]);

  // Clear cache when files change significantly
  useMemo(() => {
    if (files.length === 0) {
      treeFlattener.clearCache();
    }
  }, [files.length]);

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
    <>
      <div className="h-[calc(100%-3rem)] font-geist scrollbar-hide">
        <div
          ref={parentRef}
          className="h-full overflow-auto scrollbar-hide"
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
              if (!node) return null;

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
                    onContextMenu={handleContextMenu}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <FileOperationDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}
        title={dialogState.title}
        placeholder={dialogState.placeholder}
        defaultValue={dialogState.defaultValue}
        onConfirm={handleDialogConfirm}
      />
    </>
  );
};