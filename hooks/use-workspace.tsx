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

export type ScriptingMode = "run-once" | "auto-run";

interface WorkspaceState {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  setSelectedWorkspace: (ws: Workspace) => void;
  setWorkspaces: (ws: Workspace[]) => void;
  isResultPanelVisible: boolean;
  setIsResultPanelVisible: (state: boolean) => void;

  // Environments
  environments: Environment[];
  selectedEnvironment: Environment | null;
  setSelectedEnvironment: (ws: Environment | null) => void;
  setEnvironments: (ws: Environment[]) => void;

  // Scripting mode
  scripting: ScriptingMode;
  setScripting: (mode: ScriptingMode) => void;
}

export const useWorkspace = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  environments: [],
  selectedWorkspace: null,
  selectedEnvironment: null,
  expandedFolders: new Set(),
  isResultPanelVisible: true,
  scripting: "run-once", // Default value

  setSelectedWorkspace: (ws) => set({ selectedWorkspace: ws }),
  setWorkspaces: (ws) => set({ workspaces: ws }),
  setSelectedEnvironment: (env) => set({ selectedEnvironment: env }),
  setEnvironments: (env) => set({ environments: env }),

  // Toggle between the two scripting modes
  setScripting: (mode) => set({ scripting: mode }),
  setIsResultPanelVisible: (state) => set({ isResultPanelVisible: state }),
}));
