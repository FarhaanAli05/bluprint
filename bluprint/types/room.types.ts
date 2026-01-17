// Room dimension types
export type Unit = "feet" | "meters";

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: Unit;
}

// Room shapes
export type RoomShape = "rectangular" | "l-shaped" | "custom";

// Architectural features
export interface Window {
  id: string;
  wall: "north" | "south" | "east" | "west";
  position: { x: number; y: number };
  width: number;
  height: number;
}

export interface Door {
  id: string;
  wall: "north" | "south" | "east" | "west";
  position: { x: number };
  width: number;
  height: number;
}

// Materials
export interface Materials {
  wallColor: string;
  floorColor: string;
  ceilingColor: string;
  floorTexture?: "wood" | "carpet" | "tile" | "concrete";
}

// Furniture types
export type FurnitureCategory =
  | "beds"
  | "dressers"
  | "nightstands"
  | "desks"
  | "chairs"
  | "sofas"
  | "tables"
  | "storage"
  | "lighting"
  | "decor";

export interface FurnitureItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  modelUrl?: string;
  thumbnail?: string;
  dimensions: {
    width: number;
    depth: number;
    height: number;
  };
  color?: string;
}

export interface PlacedFurniture extends FurnitureItem {
  position: { x: number; y: number; z: number };
  rotation: number; // Y-axis rotation in radians
  // AI-generated furniture properties
  furnitureType?: string;
  material?: "wood" | "metal" | "fabric" | "leather" | "plastic";
  details?: {
    woodFinish?: "light" | "medium" | "dark";
    hasDrawers?: boolean;
    hasShelves?: boolean;
    numberOfDrawers?: number;
    numberOfShelves?: number;
  };
}

// Room configuration
export interface RoomConfig {
  dimensions: Dimensions;
  shape: RoomShape;
  description?: string;
  windows: Window[];
  doors: Door[];
  materials: Materials;
}

// Project status
export type ProjectStatus =
  | "draft"
  | "uploading"
  | "processing"
  | "ready"
  | "error";

// Project creation method
export type CreationMethod = "upload" | "manual";

// File attachment
export interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string;
  uploadedAt: number;
}

// Complete project type
export interface Project {
  id: string;
  name: string;
  roomType: "bedroom" | "kitchen" | "living-room" | "bathroom" | "office";
  creationMethod: CreationMethod;
  status: ProjectStatus;
  config: RoomConfig;
  furniture: PlacedFurniture[];
  files: ProjectFile[];
  aiAnalysis?: {
    detectedDimensions?: Dimensions;
    detectedFurniture?: string[];
    colorScheme?: string[];
    suggestions?: string[];
  };
  createdAt: number;
  updatedAt: number;
}

// Room presets
export interface RoomPreset {
  id: string;
  name: string;
  roomType: Project["roomType"];
  config: RoomConfig;
  thumbnail?: string;
}

// Camera modes for 3D viewer
export type CameraMode = "orbit" | "firstPerson" | "topDown";

// 3D Viewer state
export interface ViewerState {
  cameraMode: CameraMode;
  showGrid: boolean;
  showMeasurements: boolean;
  selectedFurnitureId: string | null;
}
