"use client";

import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { ImportCollectionDialog } from "@/components/import-collection-dialog";
import { SearchDialog } from "@/components/search-dialog";
import { ModeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Upload, Plus, Loader2, Download, Search } from "lucide-react";
import { useState } from "react";
import { useFileTreeStore } from "@/hooks/use-file-store";
import { useWorkspace } from "@/hooks/use-workspace";
import { exportAndDownloadZip } from "@/lib/exporter";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

export const Navbar = (props: { className?: string }) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const { files } = useFileTreeStore();
  const { selectedWorkspace } = useWorkspace();

  const handleExportCollection = async () => {
    try {
      // Get workspace name and normalize it
      const workspaceName = selectedWorkspace?.name || "collection";
      const normalizedName = workspaceName.toLowerCase().replace(/\s+/g, "");
      
      // Export and download the collection
      await exportAndDownloadZip(files, normalizedName);
    } catch (error) {
      console.error("Failed to export collection:", error);
      // You could add a toast notification here for better UX
    }
  };

  return (
    <header
      className={cn(
        "z-10 flex items-center pb-1 border-b  shrink-0",
        props.className
      )}
    >
      <div className="fixed flex items-center w-full pt-[2px] pl-1 text-muted-foreground dark:text-muted-foreground/90 ">
        <div className="flex items-center">
          <SidebarTrigger className=" hover:bg-muted-foreground/20 hover:dark:bg-muted-foreground/15" />
          <Separator
            orientation="vertical"
            className="h-4 bg-muted-foreground"
          />
        </div>
        <div className="flex items-center pl-2 ml-1 gap-x-1"> 
          <AuthLoading>
             <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Authenticating...
            </div>
          </AuthLoading>
          <Authenticated>
            <CreateWorkspaceDialog />
          </Authenticated>
          <Unauthenticated>
            <div className="text-sm text-muted-foreground">
              Sign in to create workspaces
            </div>
          </Unauthenticated>
        </div>
      </div>

      <div className="fixed right-0 flex items-center h-10 gap-x-4 text-muted-foreground dark:text-muted-foreground/90">
        <div className="flex items-center px-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 hover:bg-muted-foreground/20 hover:dark:bg-muted-foreground/15 mr-1"
            onClick={() => setIsSearchDialogOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Search files</span>
          </Button>
          
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 hover:bg-muted-foreground/20 hover:dark:bg-muted-foreground/15"
              >
                <Plus className="mr-2 h-4 w-4" />
                New
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="left">
              <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import Collection
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleExportCollection}
                disabled={files.length === 0}
                aria-label="Export collection as ZIP file"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Collection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ModeToggle />
          <AuthDialog />
        </div>
      </div>

      {/* Search Dialog */}
      <SearchDialog 
        open={isSearchDialogOpen} 
        onOpenChange={setIsSearchDialogOpen} 
      />

      {/* Import Collection Dialog */}
      <ImportCollectionDialog 
        open={isImportDialogOpen} 
        onOpenChange={setIsImportDialogOpen} 
      />
    </header>
  );
};