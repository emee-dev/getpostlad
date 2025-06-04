"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Variable {
  id: string;
  key: string;
  value: string;
}

interface ManageEnvironmentDialogProps {
  workspaceId: string;
  environment?: {
    _id: string;
    name: string;
    variables: Variable[];
  };
}

export function ManageEnvironmentDialog({ workspaceId, environment }: ManageEnvironmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string>(environment?._id ?? "");
  const [variables, setVariables] = useState<Variable[]>(
    environment?.variables ?? []
  );

  const environments = useQuery(api.environments.listByWorkspace, { workspaceId });
  const updateEnvironment = useMutation(api.environments.update);

  const handleEnvironmentChange = (envId: string) => {
    setSelectedEnvironmentId(envId);
    const selectedEnv = environments?.find(env => env._id === envId);
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

  const removeVariable = (id: string) => {
    setVariables(variables.filter((v) => v.id !== id));
  };

  const updateVariable = (id: string, field: "key" | "value", value: string) => {
    setVariables(
      variables.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      )
    );
  };

  const handleSave = async () => {
    if (!selectedEnvironmentId) return;

    await updateEnvironment({
      id: selectedEnvironmentId,
      variables: variables.filter(v => v.key.trim() && v.value.trim()),
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7">
          Manage Variables
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Manage Environment Variables</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Environment</Label>
            <Select
              value={selectedEnvironmentId}
              onValueChange={handleEnvironmentChange}
            >
              <SelectTrigger>
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
                Save
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}