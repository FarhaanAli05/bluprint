// ============================================================
// AI Room Analysis Types
// Types for the photo-to-3D room generation system
// ============================================================

export type WallDirection = "north" | "south" | "east" | "west";
export type RoomShape = "rectangular" | "L-shaped" | "square";
export type WallTexture = "painted" | "wallpaper" | "brick" | "wood";
export type FloorMaterial = "hardwood" | "carpet" | "tile" | "laminate" | "concrete";
export type FloorPattern = "parquet" | "plank" | "solid" | "checkered" | "herringbone";
export type CeilingType = "standard" | "drop" | "vaulted" | "exposed";
export type WindowType = "single" | "double" | "sliding" | "bay";
export type LightingLevel = "bright" | "moderate" | "dim";
export type WoodFinish = "light" | "medium" | "dark";
export type FabricPattern = "solid" | "patterned" | "textured";
export type SizeCategory = "small" | "medium" | "large";

export type FurnitureType =
  | "bed"
  | "desk"
  | "chair"
  | "wardrobe"
  | "nightstand"
  | "dresser"
  | "bookshelf"
  | "sofa"
  | "table"
  | "cabinet"
  | "shelf"
  | "ottoman"
  | "bench"
  | "mirror"
  | "tv-stand";

export type FurnitureMaterial =
  | "wood"
  | "metal"
  | "fabric"
  | "leather"
  | "plastic"
  | "glass"
  | "wicker";

export type LightingType =
  | "ceiling"
  | "desk-lamp"
  | "floor-lamp"
  | "wall-sconce"
  | "pendant"
  | "track";

export type DecorationType =
  | "wall-art"
  | "plant"
  | "rug"
  | "mirror"
  | "clock"
  | "curtains"
  | "cushion"
  | "vase";

// ============================================================
// Position & Dimension Types
// ============================================================

export interface Position2D {
  x: number; // Distance from room origin (feet)
  z: number; // Distance from room origin (feet)
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Dimensions3D {
  width: number;  // X axis (feet)
  depth: number;  // Z axis (feet)
  height: number; // Y axis (feet)
}

export interface WindowPosition {
  x: number; // Distance from left corner (feet)
  y: number; // Height from floor (feet)
}

// ============================================================
// Room Structure Types
// ============================================================

export interface RoomDimensions {
  length: number; // feet
  width: number;  // feet
  height: number; // feet
}

export interface WallConfig {
  color: string;    // Hex color
  texture: WallTexture;
}

export interface FloorConfig {
  material: FloorMaterial;
  color: string;    // Hex color
  pattern: FloorPattern;
}

export interface CeilingConfig {
  height: number;   // feet
  type: CeilingType;
  color: string;    // Hex color
}

export interface RoomConfig {
  dimensions: RoomDimensions;
  shape: RoomShape;
  walls: WallConfig;
  floor: FloorConfig;
  ceiling: CeilingConfig;
}

// ============================================================
// Window & Door Types
// ============================================================

export interface WindowSpec {
  id?: string;
  wall: WallDirection;
  width: number;    // feet
  height: number;   // feet
  position: WindowPosition;
  type: WindowType;
}

export interface DoorSpec {
  id?: string;
  wall: WallDirection;
  width: number;    // feet
  height: number;   // feet
  position: {
    x: number;      // Distance from left corner (feet)
  };
}

// ============================================================
// Furniture Types
// ============================================================

export interface FurnitureDetails {
  woodFinish?: WoodFinish;
  fabricPattern?: FabricPattern;
  hasDrawers?: boolean;
  hasShelves?: boolean;
  hasHeadboard?: boolean;
  hasArmrests?: boolean;
  numberOfDrawers?: number;
  numberOfShelves?: number;
  cushionColor?: string;
}

export interface FurnitureItem {
  id?: string;
  type: FurnitureType;
  position: Position2D;
  rotation: number; // Degrees (0-360)
  dimensions: Dimensions3D;
  color: string;    // Hex color
  material: FurnitureMaterial;
  subtype?: string; // e.g., 'office-chair', 'platform-bed'
  details?: FurnitureDetails;
}

// ============================================================
// Lighting & Decoration Types
// ============================================================

export interface LightingFixture {
  id?: string;
  type: LightingType;
  position: Position3D;
  color?: string;
  intensity?: number;
}

export interface LightingConfig {
  naturalLight: LightingLevel;
  fixtures: LightingFixture[];
}

export interface DecorationItem {
  id?: string;
  type: DecorationType;
  position: Position3D;
  size: SizeCategory;
  color?: string;
}

// ============================================================
// Complete AI Room Data
// ============================================================

export interface AIRoomData {
  room: RoomConfig;
  windows: WindowSpec[];
  doors: DoorSpec[];
  furniture: FurnitureItem[];
  lighting: LightingConfig;
  decorations: DecorationItem[];
}

// ============================================================
// Upload & Processing Types
// ============================================================

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
}

export type ProcessingStep =
  | "idle"
  | "uploading"
  | "analyzing"
  | "detecting-furniture"
  | "generating-model"
  | "complete"
  | "error";

export interface ProcessingState {
  step: ProcessingStep;
  progress: number; // 0-100
  message: string;
  error?: string;
}

// ============================================================
// Project Types
// ============================================================

export interface PhotoTo3DProject {
  id: string;
  name: string;
  images: UploadedImage[];
  roomData: AIRoomData | null;
  createdAt: number;
  updatedAt: number;
  status: "draft" | "processing" | "ready" | "error";
}

// ============================================================
// API Response Types
// ============================================================

export interface AIAnalysisResponse {
  success: boolean;
  data?: AIRoomData;
  error?: string;
  rawResponse?: string;
}
