// State management for interactive dorm room demo

export interface SceneObject {
  id: string;
  type: 'bed' | 'desk' | 'chair' | 'shelf' | 'wardrobe' | 'window' | 'corkboard' | 'bag';
  name: string;
  position: [number, number, number];
  rotation: number; // Y-axis rotation in radians
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface FurnitureItem {
  id: string;
  type: SceneObject['type'];
  name: string;
  dimensions: string;
  color: string;
}

// Initial furniture catalog for inventory
export const furnitureInventory: FurnitureItem[] = [
  { id: 'bed-item', type: 'bed', name: 'Twin Bed', dimensions: '6.25\' × 3.25\'', color: 'Oak wood frame' },
  { id: 'desk-item', type: 'desk', name: 'Desk with Hutch', dimensions: '4\' × 2\'', color: 'Medium oak' },
  { id: 'chair-item', type: 'chair', name: 'Office Chair', dimensions: '1.2\' × 1.2\'', color: 'Black mesh' },
  { id: 'shelf-item', type: 'shelf', name: 'Wardrobe', dimensions: '4\' × 2\'', color: 'Oak with shelving' },
];

// Room dimensions (matching photos - standard dorm room)
export const ROOM = {
  width: 12,
  depth: 14,
  height: 9,
  wallThickness: 0.15,
  baseboardHeight: 0.4,
};

// Initial scene state - positioned to match reference photos
export const initialSceneState: SceneObject[] = [
  {
    id: 'bed-1',
    type: 'bed',
    name: 'Twin Bed',
    // Left wall, near back corner (as in photo 2)
    position: [-ROOM.width / 2 + 2, 0, -ROOM.depth / 2 + 3.5],
    rotation: 0, // Headboard toward back wall
  },
  {
    id: 'desk-1',
    type: 'desk',
    name: 'Desk with Hutch',
    // Right side, near window (as in photos 1 & 3)
    position: [ROOM.width / 2 - 2.3, 0, -ROOM.depth / 2 + 1.5],
    rotation: 0,
  },
  {
    id: 'chair-1',
    type: 'chair',
    name: 'Office Chair',
    // At desk, facing inward (photo 1)
    position: [ROOM.width / 2 - 2.3, 0, -ROOM.depth / 2 + 3.5],
    rotation: Math.PI, // Facing desk
  },
  {
    id: 'shelf-1',
    type: 'shelf',
    name: 'Wardrobe',
    // Left side near front (photo 2)
    position: [-ROOM.width / 2 + 2, 0, ROOM.depth / 2 - 1.2],
    rotation: 0,
  },
];

// Command parser for chatbot
export function parseCommand(input: string, sceneObjects: SceneObject[]): { success: boolean; message: string; updatedObjects?: SceneObject[] } {
  const lowerInput = input.toLowerCase().trim();

  // Place chair at desk
  if (lowerInput.includes('chair') && lowerInput.includes('desk')) {
    const chairIndex = sceneObjects.findIndex(obj => obj.type === 'chair');
    const deskIndex = sceneObjects.findIndex(obj => obj.type === 'desk');

    if (chairIndex !== -1 && deskIndex !== -1) {
      const updated = [...sceneObjects];
      const desk = sceneObjects[deskIndex];
      updated[chairIndex] = {
        ...updated[chairIndex],
        position: [desk.position[0] - 1, 0, desk.position[2] + 1.5],
        rotation: Math.PI,
      };
      return {
        success: true,
        message: 'I\'ve positioned the chair at the desk for you.',
        updatedObjects: updated,
      };
    }
  }

  // Put shelf opposite bed
  if (lowerInput.includes('shelf') && lowerInput.includes('bed') && lowerInput.includes('opposite')) {
    const shelfIndex = sceneObjects.findIndex(obj => obj.type === 'shelf');
    const bedIndex = sceneObjects.findIndex(obj => obj.type === 'bed');

    if (shelfIndex !== -1 && bedIndex !== -1) {
      const updated = [...sceneObjects];
      const bed = sceneObjects[bedIndex];
      updated[shelfIndex] = {
        ...updated[shelfIndex],
        position: [bed.position[0], 0, ROOM.depth / 2 - 1.2],
        rotation: Math.PI,
      };
      return {
        success: true,
        message: 'I\'ve moved the shelf opposite the bed.',
        updatedObjects: updated,
      };
    }
  }

  // Center bed on back wall
  if (lowerInput.includes('bed') && (lowerInput.includes('center') || lowerInput.includes('wall'))) {
    const bedIndex = sceneObjects.findIndex(obj => obj.type === 'bed');

    if (bedIndex !== -1) {
      const updated = [...sceneObjects];
      updated[bedIndex] = {
        ...updated[bedIndex],
        position: [0, 0, -ROOM.depth / 2 + 3.5],
        rotation: 0,
      };
      return {
        success: true,
        message: 'I\'ve centered the bed on the back wall.',
        updatedObjects: updated,
      };
    }
  }

  // Move desk to corner
  if (lowerInput.includes('desk') && lowerInput.includes('corner')) {
    const deskIndex = sceneObjects.findIndex(obj => obj.type === 'desk');

    if (deskIndex !== -1) {
      const updated = [...sceneObjects];
      updated[deskIndex] = {
        ...updated[deskIndex],
        position: [ROOM.width / 2 - 2.5, 0, -ROOM.depth / 2 + 1.5],
        rotation: 0,
      };
      return {
        success: true,
        message: 'I\'ve moved the desk to the corner.',
        updatedObjects: updated,
      };
    }
  }

  return {
    success: false,
    message: 'I\'m not sure how to help with that. Try commands like:\n• "place chair at desk"\n• "put shelf opposite bed"\n• "center bed on back wall"\n• "move desk to corner"',
  };
}
