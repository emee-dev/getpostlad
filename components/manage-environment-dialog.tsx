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
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, X } from "lucide-react";

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
  const [name, setName] = useState(environment?.name ?? "");
  const [variables, setVariables] = useState<Variable[]>(
    environment?.variables ?? []
  );

  const createEnvironment = useMutation(api.environments.create);
  const updateEnvironment = useMutation(api.environments.update);

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
    if (!name.trim()) return;

    if (environment?._id) {
      await updateEnvironment({
        id: environment._id,
        variables: variables.filter(v => v.key.trim() && v.value.trim()),
      });
    } else {
      await createEnvironment({
        workspaceId,
        name,
        variables: variables.filter(v => v.key.trim() && v.value.trim()),
      });
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 w-full">
          {environment ? "Manage Variables" : "Create Environment"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {environment ? "Manage Environment Variables" : "Create New Environment"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!environment && (
            <div className="space-y-2">
              <Label htmlFor="name">Environment Name</Label>
              <Input
                id="name"
                placeholder="e.g., Development, Production"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}