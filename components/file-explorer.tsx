"use client";

import { FileNode } from "@/app/page";
import { cn } from "@/lib/utils";
import { ChevronRight, FileIcon, FolderIcon } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";

interface FileExplorerProps {
  files: FileNode[];
  selectedFile: FileNode | null;
  onFileSelect: (file: FileNode) => void;
}

function FileTreeNode({ 
  node, 
  level = 0,
  selectedFile,
  onFileSelect 
}: { 
  node: FileNode;
  level?: number;
  selectedFile: FileNode | null;
  onFileSelect: (file: FileNode) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleClick = () => {
    if (node.type === "directory") {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(node);
    }
  };

  return (
    <div>
      <button
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted",
          node.type === "file" && node.name === selectedFile?.name && "bg-muted"
        )}
        style={{ paddingLeft: `${(level + 1) * 12}px` }}
        onClick={handleClick}
      >
        {node.type === "directory" && (
          <ChevronRight 
            className={cn(
              "h-4 w-4 transition-transform", 
              isExpanded && "rotate-90"
            )} 
          />
        )}
        {node.type === "directory" ? (
          <FolderIcon className="h-4 w-4 text-blue-500" />
        ) : (
          <FileIcon className="h-4 w-4 text-gray-500" />
        )}
        {node.name}
      </button>
      {node.type === "directory" && isExpanded && node.children && (
        <div>
          {node.children.map((child, index) => (
            <FileTreeNode
              key={`${child.name}-${index}`}
              node={child}
              level={level + 1}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({
  files,
  selectedFile,
  onFileSelect,
}: FileExplorerProps) {
  return (
    <div className="h-full border-r bg-muted/50">
      <div className="flex h-10 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <FolderIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Project Files</span>
        </div>
      </div>
      <ScrollArea className="h-[calc(100%-2.5rem)]">
        <div className="p-2">
          {files.map((file, index) => (
            <FileTreeNode
              key={`${file.name}-${index}`}
              node={file}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}