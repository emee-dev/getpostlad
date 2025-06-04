"use client";

import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";

export function Navbar() {
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const workspaces = useQuery(api.workspaces.list, { userId: "user123" }); // Replace with actual user ID
  const environments = useQuery(api.environments.listByWorkspace, 
    selectedWorkspace ? { workspaceId: selectedWorkspace } : "skip"
  );

  return (
    <nav className="flex h-14 items-center border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">CodeEditor</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7">
                {workspaces?.find(w => w._id === selectedWorkspace)?.name || "Select Workspace"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {workspaces?.map((workspace) => (
                <DropdownMenuItem
                  key={workspace._id}
                  onClick={() => setSelectedWorkspace(workspace._id)}
                >
                  {workspace.name}
                </DropdownMenuItem>
              ))}
              {!workspaces?.length && (
                <DropdownMenuItem disabled>
                  No workspaces available
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <CreateWorkspaceDialog />
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7">
                Environments
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {environments?.map((env) => (
                <DropdownMenuItem key={env._id}>
                  {env.name}
                </DropdownMenuItem>
              ))}
              {!environments?.length && (
                <DropdownMenuItem disabled>
                  No environments available
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ModeToggle />
        <Button variant="outline" size="icon" className="h-7 w-7">
          <Github className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}