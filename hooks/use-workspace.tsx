import { Id } from "@/convex/_generated/dataModel";
import { create } from "zustand";

export type Workspace = {
  _id: Id<"workspaces">;
  _creationTime: number;
  name: string;
  path: string; // Added path field
  userId: string;
};

export type Variable = {
  id: string;
  key: string;
  value: string;
};

export type Environment = {
  _id: Id<"environments">;
  _creationTime: number;
  name: string;
  workspaceId: Id<"workspaces">;
  variables: Variable[];
};

interface WorkspaceState {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  setSelectedWorkspace: (ws: Workspace) => void;
  setWorkspaces: (ws: Workspace[]) => void;

  // Environments
  environments: Environment[];
  selectedEnvironment: Environment | null;
  setSelectedEnvironment: (ws: Environment) => void;
  setEnvironments: (ws: Environment[]) => void;
}

export const useWorkspace = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  environments: [],
  selectedWorkspace: null,
  selectedEnvironment: null,
  expandedFolders: new Set(),

  setSelectedWorkspace: (ws) => set({ selectedWorkspace: ws }),
  setWorkspaces: (ws) => set({ workspaces: ws }),
  setSelectedEnvironment: (env) => set({ selectedEnvironment: env }),
  setEnvironments: (env) => set({ environments: env }),
}));