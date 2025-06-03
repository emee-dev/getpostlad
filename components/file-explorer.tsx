"use client";

import { File } from "@/app/page";
import { cn } from "@/lib/utils";
import { FileIcon, FolderIcon } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface FileExplorerProps {
  files: File[];
  selectedFile: File;
  onFileSelect: (file: File) => void;
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
          {files.map((file) => (
            <button
              key={file.name}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                file.name === selectedFile.name && "bg-muted"
              )}
              onClick={() => onFileSelect(file)}
            >
              <FileIcon className="h-4 w-4" />
              {file.name}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}