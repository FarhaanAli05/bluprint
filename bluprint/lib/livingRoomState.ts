// Living Room Scene State (based on provided photos)

export interface SceneObject {
  id: string;
  type: 'sofa' | 'coffeeTable' | 'armchair' | 'rug' | 'plant' | 'lamp' | 'tv' | 'bookshelf';
  name: string;
  position: [number, number, number];
  rotation: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// Room dimensions based on photo analysis
// Approximately 18ft x 14ft x 8ft
export const LIVING_ROOM = {
  width: 18,      // X axis (feet)
  depth: 14,      // Z axis (feet)
  height: 8,      // Y axis (feet)
  wallThickness: 0.15,
};

// Color palette from photos
export const COLORS = {
  floorTile: '#C4A98B',       // Tan/beige tile
  wallPaint: '#F5E6D3',       // Cream/beige walls
  ceiling: '#FFFFFF',          // White ceiling
  trim: '#FFFFFF',             // White trim
  doorColor: '#8B1A1A',        // Burgundy/dark red door
  stoneFireplace: '#6B6B6B',   // Gray stone primary
  stoneMixed: '#8B7D6B',       // Brown stone accent
  accentWall: '#95A3A6',       // Gray-blue accent wall
  metalRailing: '#2C2C2C',     // Black metal
  woodHandrail: '#5C4033',     // Medium-dark wood
  carpetStairs: '#8B2323',     // Red carpet on stairs
};

// Initial scene state - empty room (furniture can be added)
export const initialLivingRoomState: SceneObject[] = [];

// Parse command for AI chat
export function parseCommand(content: string, objects: SceneObject[]): { success: boolean; message: string; updatedObjects?: SceneObject[] } {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('add') && lowerContent.includes('sofa')) {
    return {
      success: true,
      message: 'I can help you place a sofa. Use the inventory panel to add furniture to your room.',
    };
  }
  
  if (lowerContent.includes('fireplace')) {
    return {
      success: true,
      message: 'The stone fireplace is the main feature of this living room. It has a beautiful gray accent wall above it.',
    };
  }
  
  if (lowerContent.includes('stair')) {
    return {
      success: true,
      message: 'The staircase on the right side features decorative wrought iron railings with red carpeted steps.',
    };
  }
  
  return {
    success: true,
    message: 'I can help you arrange furniture in this living room. The room features a stone fireplace, decorative staircase, and plenty of natural light from the windows.',
  };
}
