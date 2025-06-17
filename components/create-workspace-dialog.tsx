"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useWorkspace } from "@/hooks/use-workspace";
import { useMutation, useQuery } from "convex/react";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { ManageEnvironmentDialog } from "./manage-environment-dialog";

// Helper function to generate path from name (same as backend)
function generatePath(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

export function CreateWorkspaceDialog() {
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [isPathManuallyEdited, setIsPathManuallyEdited] = useState(false);
  const [open, setOpen] = useState(false);
  const [isEnvOpen, setIsEnvOpen] = useState(false);
  const {
    selectedWorkspace,
    setSelectedWorkspace,
    setWorkspaces,
    workspaces,
    environments,
    selectedEnvironment,
    setSelectedEnvironment,
    setEnvironments,
  } = useWorkspace();

  const createWorkspace = useMutation(api.workspaces.create);
  const allWorkspaces = useQuery(api.workspaces.list, { userId: "user123" }); // Replace with actual user ID

  // Auto-generate path when name changes (only if path hasn't been manually edited)
  useEffect(() => {
    if (!isPathManuallyEdited && name) {
      setPath(generatePath(name));
    }
  }, [name, isPathManuallyEdited]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    
    try {
      await createWorkspace({ 
        name: name.trim(), 
        userId: "user123", // Replace with actual user ID
        path: path.trim() || undefined // Send path if provided, otherwise let backend generate
      });
      setName("");
      setPath("");
      setIsPathManuallyEdited(false);
      setOpen(false);
    } catch (error) {
      console.error("Error creating workspace:", error);
      // You might want to show an error toast here
    }
  };

  const handlePathChange = (value: string) => {
    setPath(value);
    setIsPathManuallyEdited(true);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    // Reset manual edit flag when name changes
    if (isPathManuallyEdited && !path) {
      setIsPathManuallyEdited(false);
    }
  };

  const handleDialogClose = () => {
    setName("");
    setPath("");
    setIsPathManuallyEdited(false);
    setOpen(false);
  };

  const allEnvironments = useQuery(
    api.environments.listByWorkspace,
    selectedWorkspace ? { workspaceId: selectedWorkspace._id } : "skip"
  );

  useEffect(() => {
    if (allWorkspaces) {
      setSelectedWorkspace(allWorkspaces[0]);
      setWorkspaces(allWorkspaces);
    }
  }, [allWorkspaces]);

  useEffect(() => {
    if (allEnvironments) {
      setSelectedEnvironment(allEnvironments[0]);
      setEnvironments(allEnvironments);
    }
  }, [allEnvironments]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 hover:bg-muted-foreground/20 hover:dark:bg-muted-foreground/15"
          >
            {selectedWorkspace?.name || "Workspaces"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right">
          {workspaces?.map((workspace) => (
            <DropdownMenuItem
              key={workspace._id}
              onClick={() => setSelectedWorkspace(workspace)}
            >
              {selectedWorkspace?._id === workspace._id && (
                <Check className="w-4 mr-2" />
              )}{" "}
              {selectedWorkspace?._id !== workspace._id && (
                <div className="w-4 mr-2" />
              )}{" "}
              {workspace.name}
            </DropdownMenuItem>
          ))}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7">
                Create Workspace
              </Button>
            </DialogTrigger>
            <DialogContent onInteractOutside={handleDialogClose}>
              <DialogHeader>
                <DialogTitle>Create New Workspace</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workspace Name</Label>
                  <Input
                    id="name"
                    placeholder="My API Project"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="path">
                    Workspace Path
                    <span className="text-xs text-muted-foreground ml-2">
                      (URL-friendly identifier)
                    </span>
                  </Label>
                  <Input
                    id="path"
                    placeholder="my-api-project"
                    value={path}
                    onChange={(e) => handlePathChange(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {!isPathManuallyEdited && name ? (
                      <>Auto-generated from workspace name. You can customize it.</>
                    ) : (
                      <>This will be used in URLs and must be unique.</>
                    )}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleDialogClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreate} 
                    className="flex-1"
                    disabled={!name.trim()}
                  >
                    Create
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu open={isEnvOpen} onOpenChange={setIsEnvOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 hover:bg-muted-foreground/20 hover:dark:bg-muted-foreground/15"
          >
            {selectedEnvironment && <span>{selectedEnvironment.name}</span>}

            {!selectedEnvironment && <span>Environments</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right">
          {environments?.map((env) => (
            <DropdownMenuItem
              key={env._id}
              onClick={() => {
                setSelectedEnvironment(env);
                setIsEnvOpen(false);
              }}
              className=""
            >
              {selectedEnvironment?._id === env._id && (
                <Check className="w-4 mr-2" />
              )}{" "}
              {selectedEnvironment?._id !== env._id && (
                <div className="w-4 mr-2" />
              )}{" "}
              {env.name}
            </DropdownMenuItem>
          ))}

          {!selectedEnvironment && (
            <DropdownMenuItem disabled>No environments found.</DropdownMenuItem>
          )}

          {selectedWorkspace && selectedEnvironment && (
            <ManageEnvironmentDialog
              environments={environments}
              workspaceId={selectedWorkspace._id}
              selectedEnvironment={selectedEnvironment}
              setIsEnvOpen={setIsEnvOpen}
            />
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}