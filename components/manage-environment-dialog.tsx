"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Environment, Variable, Workspace } from "@/hooks/use-workspace";
import { useMutation } from "convex/react";
import { Plus, X } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

interface ManageEnvironmentDialogProps {
  workspaceId: Workspace["_id"];
  environments: Environment[];
  selectedEnvironment: Environment | null;
  setIsEnvOpen?: Dispatch<SetStateAction<boolean>>;
}

export function ManageEnvironmentDialog({
  workspaceId,
  selectedEnvironment,
  environments,
  setIsEnvOpen,
}: ManageEnvironmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string>(
    selectedEnvironment?._id ?? ""
  );
  const [variables, setVariables] = useState<Variable[]>(
    selectedEnvironment?.variables ?? []
  );

  // New environment state
  const [newEnvironmentName, setNewEnvironmentName] = useState("");
  const [newEnvironmentVariables, setNewEnvironmentVariables] = useState<
    Variable[]
  >([]);

  const updateEnvironment = useMutation(api.environments.update);
  const createEnvironment = useMutation(api.environments.create);

  const handleEnvironmentChange = (envId: string) => {
    setSelectedEnvironmentId(envId);
    const selectedEnv = environments?.find((env) => env._id === envId);
    if (selectedEnv) {
      setVariables(selectedEnv.variables);
    }
  };

  const addVariable = () => {
    setVariables([
      ...variables,
      { id: crypto.randomUUID(), key: "", value: "" },
    ]);
  };

  const addNewVariable = () => {
    setNewEnvironmentVariables([
      ...newEnvironmentVariables,
      { id: crypto.randomUUID(), key: "", value: "" },
    ]);
  };

  const removeVariable = (id: string) => {
    setVariables(variables.filter((v) => v.id !== id));
  };

  const removeNewVariable = (id: string) => {
    setNewEnvironmentVariables(
      newEnvironmentVariables.filter((v) => v.id !== id)
    );
  };

  const updateVariable = (
    id: string,
    field: "key" | "value",
    value: string
  ) => {
    setVariables(
      variables.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const updateNewVariable = (
    id: string,
    field: "key" | "value",
    value: string
  ) => {
    setNewEnvironmentVariables(
      newEnvironmentVariables.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      )
    );
  };

  const handleSave = async () => {
    if (!selectedEnvironmentId) return;

    await updateEnvironment({
      id: selectedEnvironmentId as Id<"environments">,
      variables: variables.filter((v) => v.key.trim() && v.value.trim()),
    });

    setOpen(false);
    setIsEnvOpen?.(false);
  };

  const handleCreateEnvironment = async () => {
    if (!newEnvironmentName.trim()) return;

    await createEnvironment({
      workspaceId,
      name: newEnvironmentName,
      variables: newEnvironmentVariables.filter(
        (v) => v.key.trim() && v.value.trim()
      ),
    });

    setNewEnvironmentName("");
    setNewEnvironmentVariables([]);
    setOpen(false);
    setIsEnvOpen?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-full hover:bg-muted-foreground/20 hover:dark:bg-muted-foreground/15"
        >
          Manage Environment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="sr-only">
          <DialogTitle>Environment Manager</DialogTitle>
          <DialogDescription>
            Manage your environments and their variables.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manage" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage">Manage</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
          </TabsList>
          <TabsContent value="manage" className="space-y-4 py-4">
            <div className="space-y-2">
              {environments && environments?.length > 0 && (
                <Label>Select Environment</Label>
              )}

              {!environments ||
                (environments?.length === 0 && (
                  <Label>No Environment found</Label>
                ))}
              <Select
                value={selectedEnvironmentId}
                onValueChange={handleEnvironmentChange}
              >
                <SelectTrigger
                  disabled={!environments || environments?.length === 0}
                >
                  <SelectValue placeholder="Select an environment" />
                </SelectTrigger>
                <SelectContent>
                  {environments?.map((env) => (
                    <SelectItem key={env._id} value={env._id}>
                      {env.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedEnvironmentId && (
              <>
                <div className="space-y-2">
                  <Label>Variables</Label>
                  <div className="space-y-2">
                    {variables.map((variable) => (
                      <div key={variable.id} className="flex gap-2">
                        <Input
                          placeholder="KEY"
                          value={variable.key}
                          onChange={(e) =>
                            updateVariable(variable.id, "key", e.target.value)
                          }
                        />
                        <Input
                          placeholder="VALUE"
                          value={variable.value}
                          onChange={(e) =>
                            updateVariable(variable.id, "value", e.target.value)
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className=""
                          onClick={() => removeVariable(variable.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={addVariable}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Variable
                  </Button>
                </div>
                <Button onClick={handleSave} className="w-full">
                  Save Changes
                </Button>
              </>
            )}
          </TabsContent>
          <TabsContent value="create" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Environment Name</Label>
              <Input
                placeholder="Enter environment name"
                value={newEnvironmentName}
                onChange={(e) => setNewEnvironmentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Variables</Label>
              <div className="space-y-2">
                {newEnvironmentVariables.map((variable) => (
                  <div key={variable.id} className="flex gap-2 items-center">
                    <Input
                      placeholder="NAME"
                      className="h-9"
                      value={variable.key}
                      onChange={(e) =>
                        updateNewVariable(variable.id, "key", e.target.value)
                      }
                    />
                    <Input
                      placeholder="VALUE"
                      className="h-9"
                      value={variable.value}
                      onChange={(e) =>
                        updateNewVariable(variable.id, "value", e.target.value)
                      }
                    />

                    <div className="w-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeNewVariable(variable.id)}
                        className="size-7 hover:bg-muted-foreground/50"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={addNewVariable}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Variable
              </Button>
            </div>
            <Button onClick={handleCreateEnvironment} className="w-full">
              Create Environment
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
