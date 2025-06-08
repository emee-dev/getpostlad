"use client";

import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { ImportCollectionDialog } from "@/components/import-collection-dialog";
import { ModeToggle } from "@/components/theme-toggle";

export const Navbar = (props: { className?: string }) => {
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
          <ImportCollectionDialog />
          <CreateWorkspaceDialog />
        </div>
      </div>

      <div className="fixed right-0 flex items-center h-10 gap-x-4 text-muted-foreground dark:text-muted-foreground/90">
        <div className="flex items-center px-2">
          <ModeToggle />
          <AuthDialog />
        </div>
      </div>
    </header>
  );
};
