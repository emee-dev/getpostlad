"use client";

import { FileNode } from "@/app/page";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  File,
  Folder,
  FolderOpen,
  MoreVertical,
  Plus
} from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "./ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

interface FileExplorerProps {
  files: FileNode[];
  selectedFile: FileNode | null;
  onFileSelect: (file: FileNode) => void;
  onCreateFile: (parentId: string | null, name: string) => void;
  onCreateFolder: (parentId: string | null, name: string) => void;
  onDeleteFile: (fileId: string) => void;
}

export function FileExplorer({
  files,
  selectedFile,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["src"]));
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createDialogData, setCreateDialogData] = useState<{
    parentId: string | null;
    type: "file" | "folder";
  } | null>(null);
  const [newItemName, setNewItemName] = useState("");

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreate = () => {
    if (!createDialogData || !newItemName) return;

    if (createDialogData.type === "file") {
      if (!newItemName.endsWith(".js")) {
        onCreateFile(createDialogData.parentId, `${newItemName}.js`);
      } else {
        onCreateFile(createDialogData.parentId, newItemName);
      }
    } else {
      onCreateFolder(createDialogData.parentId, newItemName);
    }

    setIsCreateDialogOpen(false);
    setNewItemName("");
    setCreateDialogData(null);
  };

  const renderTree = (parentId: string | null = null, level = 0) => {
    const nodes = files.filter((file) => file.parent === parentId);
    
    return nodes.map((node) => (
      <div key={node.id} style={{ paddingLeft: `${level * 12}px` }}>
        <ContextMenu>
          <ContextMenuTrigger>
            <button
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                node.id === selectedFile?.id && "bg-muted"
              )}
              onClick={() => {
                if (node.type === "folder") {
                  toggleFolder(node.id);
                } else {
                  onFileSelect(node);
                }
              }}
            >
              {node.type === "folder" && (
                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    expandedFolders.has(node.id) && "rotate-90"
                  )}
                />
              )}
              {node.type === "folder" ? (
                expandedFolders.has(node.id) ? (
                  <FolderOpen className="h-4 w-4 text-blue-500" />
                ) : (
                  <Folder className="h-4 w-4 text-blue-500" />
                )
              ) : (
                <File className="h-4 w-4 text-yellow-500" />
              )}
              {node.name}
            </button>
          </ContextMenuTrigger>
          <ContextMenuContent>
            {node.type === "folder" && (
              <>
                <ContextMenuItem
                  onClick={() => {
                    setCreateDialogData({ parentId: node.id, type: "file" });
                    setIsCreateDialogOpen(true);
                  }}
                >
                  New File
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    setCreateDialogData({ parentId: node.id, type: "folder" });
                    setIsCreateDialogOpen(true);
                  }}
                >
                  New Folder
                </ContextMenuItem>
                <ContextMenuSeparator />
              </>
            )}
            <ContextMenuItem
              className="text-red-600"
              onClick={() => onDeleteFile(node.id)}
            >
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        {node.type === "folder" && expandedFolders.has(node.id) && (
          <div>{renderTree(node.id, level + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full border-r bg-muted/50">
      <div className="flex h-10 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4" />
          <span className="text-sm font-medium">Explorer</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => {
            setCreateDialogData({ parentId: null, type: "folder" });
            setIsCreateDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100%-2.5rem)]">
        <div className="p-2">{renderTree()}</div>
      </ScrollArea>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create New {createDialogData?.type === "file" ? "File" : "Folder"}
            </DialogTitle>
          </DialogHeader>
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={
              createDialogData?.type === "file"
                ? "Enter file name (e.g., api.js)"
                : "Enter folder name"
            }
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setNewItemName("");
                setCreateDialogData(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}