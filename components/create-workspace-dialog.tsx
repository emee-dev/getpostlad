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

export function CreateWorkspaceDialog() {
  const [name, setName] = useState("");
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

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createWorkspace({ name, userId: "user123" }); // Replace with actual user ID
    setName("");
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
            disabled={!workspaces || workspaces.length === 0}
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
            <DialogContent>
              <DialogHeader className="sr-only">
                <DialogTitle>Create New Workspace</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workspace Name</Label>
                  <Input
                    id="name"
                    placeholder="Workspace name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreate} className="w-full">
                  Create
                </Button>
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
            disabled={!workspaces || workspaces.length === 0}
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

          {!environments && (
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
