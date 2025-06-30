"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useWorkspace } from "@/hooks/use-workspace";
import { useMutation, useQuery } from "convex/react";
import { AlertCircle, Check, Trash2 } from "lucide-react";
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
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  
  // Delete workspace dialog state
  const [deleteWorkspaceOpen, setDeleteWorkspaceOpen] = useState(false);
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);
  
  // Delete environment dialog state
  const [deleteEnvOpen, setDeleteEnvOpen] = useState(false);
  const [isDeletingEnv, setIsDeletingEnv] = useState(false);
  
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
  const deleteWorkspace = useMutation(api.workspaces.deleteWorkspace);
  const deleteEnv = useMutation(api.environments.deleteEnv);
  const getWorkspaceByPath = useQuery(
    api.workspaces.getByPath,
    path ? { path: path.toLowerCase().trim() } : "skip"
  );
  const allWorkspaces = useQuery(api.workspaces.list);

  // Auto-generate path when name changes (only if path hasn't been manually edited)
  useEffect(() => {
    if (!isPathManuallyEdited && name) {
      setPath(generatePath(name));
    }
  }, [name, isPathManuallyEdited]);

  // Check if workspace exists when path changes
  useEffect(() => {
    if (path && getWorkspaceByPath) {
      setMessage({
        type: 'info',
        text: `Workspace "${getWorkspaceByPath.name}" already exists with this path.`
      });
    } else {
      setMessage(null);
    }
  }, [path, getWorkspaceByPath]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    
    setIsCreating(true);
    setMessage(null);
    
    try {
      const workspaceId = await createWorkspace({ 
        name: name.trim(), 
        path: path.trim() || undefined // Send path if provided, otherwise let backend generate
      });

      // Check if this was an existing workspace
      const isExisting = getWorkspaceByPath && getWorkspaceByPath._id === workspaceId;
      
      if (isExisting) {
        setMessage({
          type: 'success',
          text: `Selected existing workspace "${getWorkspaceByPath.name}"`
        });
        // Set the existing workspace as selected
        setSelectedWorkspace(getWorkspaceByPath);
      } else {
        setMessage({
          type: 'success',
          text: `Successfully created workspace "${name.trim()}"`
        });
      }

      // Reset form after a brief delay to show the success message
      setTimeout(() => {
        setName("");
        setPath("");
        setIsPathManuallyEdited(false);
        setMessage(null);
        setOpen(false);
      }, 1500);

    } catch (error) {
      console.error("Error creating workspace:", error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : "Failed to create workspace"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!selectedWorkspace) return;
    
    setIsDeletingWorkspace(true);
    
    try {
      await deleteWorkspace({ id: selectedWorkspace._id });
      
      // Update workspaces list by removing the deleted workspace
      const updatedWorkspaces = workspaces.filter(ws => ws._id !== selectedWorkspace._id);
      setWorkspaces(updatedWorkspaces);
      
      // Set the first available workspace as selected, or null if none
      setSelectedWorkspace(updatedWorkspaces[0] || null);
      
      // Clear environments since workspace was deleted
      setEnvironments([]);
      setSelectedEnvironment(null);
      
      setDeleteWorkspaceOpen(false);
    } catch (error) {
      console.error("Error deleting workspace:", error);
      // You could add error handling here with a toast or alert
    } finally {
      setIsDeletingWorkspace(false);
    }
  };

  const handleDeleteEnvironment = async () => {
    if (!selectedEnvironment) return;
    
    setIsDeletingEnv(true);
    
    try {
      await deleteEnv({ id: selectedEnvironment._id });
      
      // Update environments list by removing the deleted environment
      const updatedEnvironments = environments.filter(env => env._id !== selectedEnvironment._id);
      setEnvironments(updatedEnvironments);
      
      // Set the first available environment as selected, or null if none
      setSelectedEnvironment(updatedEnvironments[0] || null);
      
      setDeleteEnvOpen(false);
    } catch (error) {
      console.error("Error deleting environment:", error);
      // You could add error handling here with a toast or alert
    } finally {
      setIsDeletingEnv(false);
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
    setMessage(null);
    setOpen(false);
  };

  const allEnvironments = useQuery(
    api.environments.listByWorkspace,
    selectedWorkspace ? { workspaceId: selectedWorkspace._id } : "skip"
  );

  // Reset dialog when closed
  useEffect(() => {
    if (open === false) {
      handleDialogClose();
    }
  }, [open]);

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
              <Button variant="outline" size="sm" className="h-7 w-full">
                Create Workspace
              </Button>
            </DialogTrigger>
            <DialogContent onInteractOutside={handleDialogClose}>
              <DialogHeader>
                <DialogTitle>Create New Workspace</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {message && (
                  <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{message.text}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Workspace Name</Label>
                  <Input
                    id="name"
                    placeholder="My API Project"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="path">
                    Workspace Path
                  </Label>
                  <Input
                    id="path"
                    placeholder="my-api-project"
                    value={path}
                    onChange={(e) => handlePathChange(e.target.value)}
                    disabled={isCreating}
                  />
                  <p className="text-xs text-muted-foreground">
                    {!isPathManuallyEdited && name ? (
                      <>Auto-generated. You can customize it.</>
                    ) : (
                      <> Path must be unique.</>
                    )}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreate} 
                    className="flex-1"
                    disabled={!name.trim() || isCreating}
                  >
                    {isCreating ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        {getWorkspaceByPath ? 'Selecting...' : 'Creating...'}
                      </>
                    ) : (
                      getWorkspaceByPath ? 'Select Existing' : 'Create'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Delete Workspace Option */}
          {selectedWorkspace && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setDeleteWorkspaceOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 mr-2" />
                Delete Workspace
              </DropdownMenuItem>
            </>
          )}
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

              {!selectedEnvironment && <span>Set Env</span>}
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

          {selectedWorkspace && (
            <ManageEnvironmentDialog
              environments={environments}
              workspaceId={selectedWorkspace._id}
              selectedEnvironment={selectedEnvironment}
              setIsEnvOpen={setIsEnvOpen}
            />
          )}
          
          {/* Delete Environment Option */}
          {selectedEnvironment && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setDeleteEnvOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 mr-2" />
                Delete Environment
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Workspace Confirmation Dialog */}
      <Dialog open={deleteWorkspaceOpen} onOpenChange={setDeleteWorkspaceOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This action cannot be undone. This will permanently delete the workspace 
                <strong> "{selectedWorkspace?.name}"</strong> and all its environments and request histories.
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setDeleteWorkspaceOpen(false)}
                disabled={isDeletingWorkspace}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteWorkspace}
                disabled={isDeletingWorkspace}
              >
                {isDeletingWorkspace ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  "Delete Workspace"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Environment Confirmation Dialog */}
      <Dialog open={deleteEnvOpen} onOpenChange={setDeleteEnvOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Environment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This action cannot be undone. This will permanently delete the environment 
                <strong> "{selectedEnvironment?.name}"</strong> and all its variables.
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setDeleteEnvOpen(false)}
                disabled={isDeletingEnv}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteEnvironment}
                disabled={isDeletingEnv}
              >
                {isDeletingEnv ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  "Delete Environment"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}