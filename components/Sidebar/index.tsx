import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useFileTreeStore } from "@/hooks/use-file-store";
import { cn } from "@/lib/utils";
import React, { useEffect, useState, useCallback } from "react";
import { FileExplorer } from "@/components/file-explorer";
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
import { FilePlus, FolderPlus } from "lucide-react";

export type FileNode = {
  name: string;
  type: "file" | "directory";
  content?: string;
  children?: FileNode[];
};

interface RootFileOperationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  placeholder: string;
  onConfirm: (value: string) => void;
}

const RootFileOperationDialog = ({
  open,
  onOpenChange,
  title,
  placeholder,
  onConfirm,
}: RootFileOperationDialogProps) => {
  const [value, setValue] = useState("");

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
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const EmptyStateMessage = () => (
  <div className="h-[600px] flex pt-24 justify-center text-center text-muted-foreground text-sm">
    <div>
      <div className="mb-2">No files in workspace</div>
      <div className="text-xs opacity-70">
        Right-click to add a file or folder
      </div>
    </div>
  </div>
);

const SidebarWithRootContextMenu = ({ children }: { children: React.ReactNode }) => {
  const { addFile, addDirectory } = useFileTreeStore();
  
  // Dialog state for root-level operations
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    type: "newFile" | "newFolder";
    title: string;
    placeholder: string;
  }>({
    open: false,
    type: "newFile",
    title: "",
    placeholder: "",
  });

  const handleContextMenu = useCallback((action: "newFile" | "newFolder") => {
    switch (action) {
      case "newFile":
        setDialogState({
          open: true,
          type: "newFile",
          title: "Create New File",
          placeholder: "Enter file name (e.g., script.js)",
        });
        break;
      case "newFolder":
        setDialogState({
          open: true,
          type: "newFolder",
          title: "Create New Folder",
          placeholder: "Enter folder name",
        });
        break;
    }
  }, []);

  const handleDialogConfirm = useCallback((value: string) => {
    switch (dialogState.type) {
      case "newFile":
        // Add file to root level (empty path)
        addFile("", value, "");
        break;
      case "newFolder":
        // Add directory to root level (empty path)
        addDirectory("", value);
        break;
    }
  }, [dialogState.type, addFile, addDirectory]);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="h-full w-full">
            {children}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => handleContextMenu("newFile")}>
            <FilePlus className="mr-2 h-4 w-4" />
            New File
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleContextMenu("newFolder")}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <RootFileOperationDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}
        title={dialogState.title}
        placeholder={dialogState.placeholder}
        onConfirm={handleDialogConfirm}
      />
    </>
  );
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();
  const { files } = useFileTreeStore();

  const isEmptyFileTree = files.length === 0;

  return (
    <Sidebar {...props}>
      <SidebarContent
        className={cn({
          block: open,
          hidden: !open,
        })}
      >
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center">
            <span className="font-geist">Collection</span>
            <div className="ml-auto"></div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarWithRootContextMenu>
              <SidebarMenu className="h-[600px] scrollbar-hide">
                {isEmptyFileTree ? (
                  <EmptyStateMessage />
                ) : (
                  <FileExplorer />
                )}
              </SidebarMenu>
            </SidebarWithRootContextMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarContent
        className={cn({
          hidden: open,
          block: !open,
        })}>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center">
            <span className="font-geist">Collection</span>
            <div className="ml-auto"></div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarWithRootContextMenu>
              <SidebarMenu className="h-[600px] scrollbar-hide">
                {isEmptyFileTree ? (
                  <EmptyStateMessage />
                ) : (
                  <FileExplorer />
                )}
              </SidebarMenu>
            </SidebarWithRootContextMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}