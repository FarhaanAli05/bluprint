import { create } from "zustand";
import type {
  Project,
  PlacedFurniture,
  RoomConfig,
  ViewerState,
  CameraMode,
  Dimensions,
  Materials,
} from "@/types/room.types";

// Default room configuration
const defaultConfig: RoomConfig = {
  dimensions: {
    length: 12,
    width: 10,
    height: 9,
    unit: "feet",
  },
  shape: "rectangular",
  windows: [],
  doors: [],
  materials: {
    wallColor: "#e8e4df",
    floorColor: "#8b7355",
    ceilingColor: "#ffffff",
    floorTexture: "wood",
  },
};

// Default viewer state
const defaultViewerState: ViewerState = {
  cameraMode: "orbit",
  showGrid: true,
  showMeasurements: false,
  selectedFurnitureId: null,
};

interface ProjectStore {
  // Current project
  currentProject: Project | null;
  
  // Viewer state
  viewerState: ViewerState;
  
  // Actions - Project
  setCurrentProject: (project: Project | null) => void;
  updateProjectConfig: (config: Partial<RoomConfig>) => void;
  updateDimensions: (dimensions: Partial<Dimensions>) => void;
  updateMaterials: (materials: Partial<Materials>) => void;
  setProjectStatus: (status: Project["status"]) => void;
  
  // Actions - Furniture
  addFurniture: (furniture: PlacedFurniture) => void;
  updateFurniture: (id: string, updates: Partial<PlacedFurniture>) => void;
  removeFurniture: (id: string) => void;
  selectFurniture: (id: string | null) => void;
  
  // Actions - Viewer
  setCameraMode: (mode: CameraMode) => void;
  toggleGrid: () => void;
  toggleMeasurements: () => void;
  
  // Create new project
  createProject: (params: {
    name: string;
    roomType: Project["roomType"];
    creationMethod: Project["creationMethod"];
    config?: Partial<RoomConfig>;
  }) => Project;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  currentProject: null,
  viewerState: defaultViewerState,
  
  setCurrentProject: (project) => set({ currentProject: project }),
  
  updateProjectConfig: (configUpdates) => set((state) => {
    if (!state.currentProject) return state;
    return {
      currentProject: {
        ...state.currentProject,
        config: { ...state.currentProject.config, ...configUpdates },
        updatedAt: Date.now(),
      },
    };
  }),
  
  updateDimensions: (dimensionUpdates) => set((state) => {
    if (!state.currentProject) return state;
    return {
      currentProject: {
        ...state.currentProject,
        config: {
          ...state.currentProject.config,
          dimensions: {
            ...state.currentProject.config.dimensions,
            ...dimensionUpdates,
          },
        },
        updatedAt: Date.now(),
      },
    };
  }),
  
  updateMaterials: (materialUpdates) => set((state) => {
    if (!state.currentProject) return state;
    return {
      currentProject: {
        ...state.currentProject,
        config: {
          ...state.currentProject.config,
          materials: {
            ...state.currentProject.config.materials,
            ...materialUpdates,
          },
        },
        updatedAt: Date.now(),
      },
    };
  }),
  
  setProjectStatus: (status) => set((state) => {
    if (!state.currentProject) return state;
    return {
      currentProject: {
        ...state.currentProject,
        status,
        updatedAt: Date.now(),
      },
    };
  }),
  
  addFurniture: (furniture) => set((state) => {
    if (!state.currentProject) return state;
    return {
      currentProject: {
        ...state.currentProject,
        furniture: [...state.currentProject.furniture, furniture],
        updatedAt: Date.now(),
      },
    };
  }),
  
  updateFurniture: (id, updates) => set((state) => {
    if (!state.currentProject) return state;
    return {
      currentProject: {
        ...state.currentProject,
        furniture: state.currentProject.furniture.map((f) =>
          f.id === id ? { ...f, ...updates } : f
        ),
        updatedAt: Date.now(),
      },
    };
  }),
  
  removeFurniture: (id) => set((state) => {
    if (!state.currentProject) return state;
    return {
      currentProject: {
        ...state.currentProject,
        furniture: state.currentProject.furniture.filter((f) => f.id !== id),
        updatedAt: Date.now(),
      },
      viewerState: {
        ...state.viewerState,
        selectedFurnitureId:
          state.viewerState.selectedFurnitureId === id
            ? null
            : state.viewerState.selectedFurnitureId,
      },
    };
  }),
  
  selectFurniture: (id) => set((state) => ({
    viewerState: { ...state.viewerState, selectedFurnitureId: id },
  })),
  
  setCameraMode: (mode) => set((state) => ({
    viewerState: { ...state.viewerState, cameraMode: mode },
  })),
  
  toggleGrid: () => set((state) => ({
    viewerState: { ...state.viewerState, showGrid: !state.viewerState.showGrid },
  })),
  
  toggleMeasurements: () => set((state) => ({
    viewerState: {
      ...state.viewerState,
      showMeasurements: !state.viewerState.showMeasurements,
    },
  })),
  
  createProject: ({ name, roomType, creationMethod, config }) => {
    const newProject: Project = {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      roomType,
      creationMethod,
      status: "draft",
      config: { ...defaultConfig, ...config },
      furniture: [],
      files: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set({ currentProject: newProject });
    return newProject;
  },
}));

// Storage helpers using localStorage (can be swapped for persistent storage API)
const PROJECTS_STORAGE_KEY = "bluprint_projects_v2";

export const projectStorage = {
  getAll(): Project[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(PROJECTS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  
  getById(id: string): Project | null {
    const projects = this.getAll();
    return projects.find((p) => p.id === id) || null;
  },
  
  save(project: Project): void {
    if (typeof window === "undefined") return;
    try {
      const projects = this.getAll();
      const existingIndex = projects.findIndex((p) => p.id === project.id);
      if (existingIndex >= 0) {
        projects[existingIndex] = project;
      } else {
        projects.push(project);
      }
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error("Error saving project:", error);
    }
  },
  
  delete(id: string): void {
    if (typeof window === "undefined") return;
    try {
      const projects = this.getAll();
      const filtered = projects.filter((p) => p.id !== id);
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  },
};
