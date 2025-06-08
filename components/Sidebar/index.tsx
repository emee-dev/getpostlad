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
import React, { useEffect, useState } from "react";
import { FileExplorer } from "@/components/file-explorer";

export type FileNode = {
  name: string;
  type: "file" | "directory";
  content?: string;
  children?: FileNode[];
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();

  const { setFiles } = useFileTreeStore();

  useEffect(() => {
    setFiles([]);
  }, []);

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
            <SidebarMenu>
              <FileExplorer />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarContent
        className={cn({
          hidden: open,
          block: !open,
        })}
      />
      <SidebarRail />
    </Sidebar>
  );
}
