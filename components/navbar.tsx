"use client";

import { AuthDialog } from "@/components/auth/auth-dialog";
import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog";
import { ImportCollectionDialog } from "@/components/import-collection-dialog";
import { SearchDialog } from "@/components/search-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFileTreeStore } from "@/hooks/use-file-store";
import { useWorkspace } from "@/hooks/use-workspace";
import { exportAndDownloadZip } from "@/lib/exporter";
import { cn } from "@/lib/utils";
import {
  basicTemplate,
  fullDocsTemplate,
  requestBodyTemplate,
  scriptingTemplate,
  variablesTemplate,
} from "@/templates";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import {
  Book,
  BookOpen,
  ChevronDown,
  Code,
  CreditCard,
  Download,
  FileText,
  Loader2,
  Maximize,
  Minimize2,
  Plus,
  Search,
  Upload,
  Variable,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const Navbar = (props: { className?: string }) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const { files, addFile, setSelectedFile } = useFileTreeStore();
  const { selectedWorkspace, isResultPanelVisible, setIsResultPanelVisible } =
    useWorkspace();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

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

  const handleUpgradeClick = () => {
    router.push("/pricing");
  };

  const handleTemplateSelect = (
    templateName: string,
    content: string,
    fileName: string
  ) => {
    // Create the file node
    const fileNode = {
      name: fileName,
      type: "file" as const,
      content: content,
      path: fileName,
    };

    // Add to file tree
    addFile("", fileName, content);

    // Set as selected file
    setSelectedFile(fileNode);
  };

  const handleFullscreenToggle = () => {
    setIsResultPanelVisible(!isResultPanelVisible);
  };

  return (
    <TooltipProvider>
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
              <div className="flex items-center font-geist gap-2 text-muted-foreground text-sm">
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

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 hover:bg-muted-foreground/20 hover:dark:bg-muted-foreground/15 mr-1"
                  onClick={handleFullscreenToggle}
                >
                  {isResultPanelVisible ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {isResultPanelVisible
                      ? "Hide Result Panel"
                      : "Show Result Panel"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isResultPanelVisible
                    ? "Hide Result Panel"
                    : "Show Result Panel"}
                </p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 hover:bg-muted-foreground/20 hover:dark:bg-muted-foreground/15 font-geist"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="left"
                className="font-geist"
              >
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

                <div className="flex items-center px-2 gap-x-1 font-geist text-xs py-2">
                  <span className="text-muted-foreground/80">
                    Documentation
                  </span>
                  <Separator
                    orientation="horizontal"
                    className="ml-1 w-[65%]"
                  />
                </div>

                <DropdownMenuItem
                  onClick={() =>
                    handleTemplateSelect("Basic", basicTemplate, "basic.js")
                  }
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Basic
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handleTemplateSelect(
                      "Request Body",
                      requestBodyTemplate,
                      "request-body.js"
                    )
                  }
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Request Body
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handleTemplateSelect(
                      "Variables",
                      variablesTemplate,
                      "variables.js"
                    )
                  }
                >
                  <Variable className="mr-2 h-4 w-4" />
                  Variables
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handleTemplateSelect(
                      "Scripting",
                      scriptingTemplate,
                      "scripting.js"
                    )
                  }
                >
                  <Code className="mr-2 h-4 w-4" />
                  Scripting
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handleTemplateSelect(
                      "Full Docs",
                      fullDocsTemplate,
                      "full-docs.js"
                    )
                  }
                >
                  <Book className="mr-2 h-4 w-4" />
                  Full Docs
                </DropdownMenuItem>

                <div className="flex items-center px-2 gap-x-1 font-geist text-xs py-2">
                  <span className="text-muted-foreground/80">Billing</span>
                  <Separator
                    orientation="horizontal"
                    className="ml-1 w-[65%]"
                  />
                </div>

                <DropdownMenuItem onClick={handleUpgradeClick}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Upgrade
                </DropdownMenuItem>

                <div className="flex items-center px-2 gap-x-1 font-geist text-xs py-2">
                  <span className="text-muted-foreground/80">Mode</span>
                  <Separator
                    orientation="horizontal"
                    className="ml-1 w-[65%]"
                  />
                </div>

                <DropdownMenuCheckboxItem
                  checked={theme === "light"}
                  onCheckedChange={() => setTheme("light")}
                >
                  Light
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={theme === "dark"}
                  onCheckedChange={() => setTheme("dark")}
                >
                  Dark
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
    </TooltipProvider>
  );
};
