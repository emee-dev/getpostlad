import { ScrollArea } from "@/components/ui/scroll-area";
import { FileNode, useFileTreeStore } from "@/hooks/use-file-store";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  FolderOpen,
} from "lucide-react";

interface FileTreeItemProps {
  node: FileNode;
  level: number;
  className?: string;
}

const FileTreeItem = ({ node, level, className }: FileTreeItemProps) => {
  const { selectedFile, expandedFolders, setSelectedFile, toggleFolder } =
    useFileTreeStore();
  const isExpanded = expandedFolders.has(node.path || "");
  const isSelected = selectedFile?.path === node.path;

  const handleClick = () => {
    if (node.type === "file") {
      setSelectedFile(node);
    } else {
      toggleFolder(node.path || "");
    }
  };

  const paddingLeft = level * 16;

  return (
    <div>
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
              <ChevronDown size={16} className="" />
            ) : (
              <ChevronRight size={16} className="" />
            )}
          </div>
        )}

        <div className="mr-2 flex-shrink-0 text-muted-foreground">
          {node.type === "directory" ? (
            isExpanded ? (
              <FolderOpen size={16} className="" />
            ) : (
              <Folder size={16} className="" />
            )
          ) : (
            <File
              size={16}
              style={{ marginLeft: `${Math.ceil(paddingLeft / 2) - 12}px` }}
            />
          )}
        </div>

        <span className="truncate">{node.name}</span>
      </div>

      {node.type === "directory" && isExpanded && node.children && (
        <div>
          {node.children.map((child, index) => (
            <FileTreeItem
              key={`${child.path || child.name}-${index}`}
              node={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileExplorer = () => {
  const { files } = useFileTreeStore();

  return (
    <ScrollArea className="h-[calc(100%-3rem)] font-geist">
      <div className="">
        {files.map((node, index) => (
          <FileTreeItem
            key={`${node.path || node.name}-${index}`}
            node={node}
            level={0}
            className=""
          />
        ))}
        {files.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            No files in workspace
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
