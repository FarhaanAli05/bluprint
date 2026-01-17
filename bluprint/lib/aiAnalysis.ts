import type { RoomConfig, PlacedFurniture, Dimensions, FurnitureCategory } from "@/types/room.types";

export interface AIRoomAnalysis {
  room: {
    dimensions: Dimensions;
    shape: "rectangular" | "l-shaped" | "custom";
    walls: {
      color: string;
      texture: "painted" | "wallpaper" | "brick" | "wood";
    };
    floor: {
      material: "hardwood" | "carpet" | "tile" | "laminate";
      color: string;
      pattern: "parquet" | "plank" | "solid" | "checkered";
    };
    ceiling: {
      height: number;
      type: "standard" | "drop" | "vaulted";
      color: string;
    };
  };
  windows: Array<{
    wall: "north" | "south" | "east" | "west";
    width: number;
    height: number;
    position: { x: number; y: number };
    type: "single" | "double" | "sliding";
  }>;
  doors: Array<{
    wall: "north" | "south" | "east" | "west";
    width: number;
    height: number;
    position: { x: number };
  }>;
  furniture: Array<{
    id: string;
    type: string;
    position: { x: number; y: number; z: number };
    rotation: number;
    dimensions: { width: number; depth: number; height: number };
    color: string;
    material: string;
    subtype?: string;
    details?: {
      woodFinish?: "light" | "medium" | "dark";
      hasDrawers?: boolean;
      hasShelves?: boolean;
      numberOfDrawers?: number;
      numberOfShelves?: number;
    };
  }>;
  lighting: {
    naturalLight: "bright" | "moderate" | "dim";
    fixtures: Array<{
      type: "ceiling" | "desk-lamp" | "floor-lamp" | "wall-sconce";
      position: { x: number; y: number; z: number };
    }>;
  };
}

const ANALYSIS_PROMPT = `Analyze these room photos and extract detailed 3D modeling data.

CRITICAL: Return ONLY valid JSON with NO markdown formatting, NO backticks, NO preamble, NO explanation.

Your response must start with { and end with }

Use this EXACT structure:

{
  "room": {
    "dimensions": {
      "length": 12,
      "width": 10,
      "height": 8,
      "unit": "feet"
    },
    "shape": "rectangular",
    "walls": {
      "color": "#FFFFFF",
      "texture": "painted"
    },
    "floor": {
      "material": "hardwood",
      "color": "#D2691E",
      "pattern": "plank"
    },
    "ceiling": {
      "height": 8,
      "type": "standard",
      "color": "#FFFFFF"
    }
  },
  "windows": [
    {
      "wall": "north",
      "width": 4,
      "height": 5,
      "position": {"x": 3, "y": 2},
      "type": "double"
    }
  ],
  "doors": [
    {
      "wall": "south",
      "width": 3,
      "height": 7,
      "position": {"x": 1}
    }
  ],
  "furniture": [
    {
      "id": "bed_1",
      "type": "bed",
      "position": {"x": 2, "y": 0, "z": 5},
      "rotation": 0,
      "dimensions": {"width": 5, "depth": 6.5, "height": 2},
      "color": "#8B4513",
      "material": "wood",
      "subtype": "platform-bed",
      "details": {
        "woodFinish": "medium",
        "hasDrawers": false,
        "hasShelves": false
      }
    }
  ],
  "lighting": {
    "naturalLight": "bright",
    "fixtures": [
      {
        "type": "ceiling",
        "position": {"x": 5, "y": 7.5, "z": 5}
      }
    ]
  }
}

Important estimation guidelines:
- Use standard furniture as size reference: bed ≈ 6.5ft long, desk ≈ 4-5ft wide, door ≈ 3ft wide
- Estimate room dimensions by counting furniture lengths
- Place furniture coordinates relative to room corners (0,0,0 = front-left corner at floor level)
- Rotation in degrees: 0 = facing forward, 90 = rotated right, 180 = facing back, 270 = rotated left
- Identify all visible furniture and estimate sizes carefully
- Note wall colors as hex codes
- Be precise with measurements
- Common furniture types: bed, desk, chair, wardrobe, nightstand, dresser, bookshelf, table, sofa, lamp, plant

Return ONLY the JSON object, nothing else.`;

async function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getMediaType(file: File): "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  const type = file.type.toLowerCase();
  if (type === "image/png") return "image/png";
  if (type === "image/gif") return "image/gif";
  if (type === "image/webp") return "image/webp";
  return "image/jpeg";
}

export async function analyzeRoomFromPhotos(
  imageFiles: File[],
  apiKey: string
): Promise<AIRoomAnalysis> {
  if (!apiKey) {
    throw new Error("API key is required for room analysis");
  }

  if (imageFiles.length === 0) {
    throw new Error("At least one image is required");
  }

  // Convert images to base64
  const imageContents = await Promise.all(
    imageFiles.map(async (file) => {
      const base64 = await convertToBase64(file);
      return {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: getMediaType(file),
          data: base64,
        },
      };
    })
  );

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: [
              ...imageContents,
              {
                type: "text",
                text: ANALYSIS_PROMPT,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Extract text from response
    const textContent = data.content?.find((c: { type: string }) => c.type === "text")?.text || "";

    // Remove markdown code blocks if present
    let jsonText = textContent.trim();
    jsonText = jsonText.replace(/^```json\s*/i, "");
    jsonText = jsonText.replace(/^```\s*/i, "");
    jsonText = jsonText.replace(/\s*```$/i, "");
    jsonText = jsonText.trim();

    // Find JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Raw response:", textContent);
      throw new Error("No valid JSON found in AI response");
    }

    const roomData: AIRoomAnalysis = JSON.parse(jsonMatch[0]);

    // Validate data structure
    if (!roomData.room || !roomData.furniture || !Array.isArray(roomData.furniture)) {
      throw new Error("Invalid room data structure returned by AI");
    }

    return roomData;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
}

// Convert AI analysis to the app's RoomConfig format
export function convertToRoomConfig(analysis: AIRoomAnalysis): RoomConfig {
  return {
    dimensions: {
      length: analysis.room.dimensions.length,
      width: analysis.room.dimensions.width,
      height: analysis.room.dimensions.height,
      unit: "feet",
    },
    shape: analysis.room.shape === "l-shaped" ? "l-shaped" : "rectangular",
    description: `AI-analyzed room with ${analysis.furniture.length} furniture items`,
    materials: {
      wallColor: analysis.room.walls.color,
      floorColor: analysis.room.floor.color,
      ceilingColor: analysis.room.ceiling.color,
      floorTexture: analysis.room.floor.material === "hardwood" ? "wood" : 
                    analysis.room.floor.material === "tile" ? "tile" : "carpet",
    },
    windows: analysis.windows.map((w, i) => ({
      id: `window_${i}`,
      x: w.position.x,
      y: w.position.y,
      width: w.width,
      height: w.height,
    })),
    doors: analysis.doors.map((d, i) => ({
      id: `door_${i}`,
      x: d.position.x,
      y: 0,
      width: d.width,
      height: d.height,
    })),
  };
}

// Map furniture type to category
function typeToCategory(type: string): FurnitureCategory {
  const mapping: Record<string, FurnitureCategory> = {
    bed: "beds",
    desk: "desks",
    chair: "chairs",
    wardrobe: "storage",
    closet: "storage",
    nightstand: "nightstands",
    dresser: "dressers",
    bookshelf: "storage",
    table: "tables",
    sofa: "sofas",
    couch: "sofas",
    lamp: "lighting",
    plant: "decor",
    rug: "decor",
  };
  return mapping[type.toLowerCase()] || "decor";
}

// Convert AI furniture to the app's PlacedFurniture format
export function convertToFurnitureItems(analysis: AIRoomAnalysis): PlacedFurniture[] {
  return analysis.furniture.map((f) => ({
    id: f.id,
    name: formatFurnitureName(f.type, f.subtype),
    category: typeToCategory(f.type),
    dimensions: f.dimensions,
    color: f.color,
    position: { x: f.position.x, y: f.position.y, z: f.position.z },
    rotation: (f.rotation * Math.PI) / 180, // Convert degrees to radians
    // AI-specific properties
    furnitureType: f.type,
    material: f.material as PlacedFurniture["material"],
    details: f.details,
  }));
}

function formatFurnitureName(type: string, subtype?: string): string {
  const typeName = type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, " ");
  if (subtype) {
    const subtypeName = subtype.charAt(0).toUpperCase() + subtype.slice(1).replace(/-/g, " ");
    return `${subtypeName} ${typeName}`;
  }
  return typeName;
}
