// ============================================================
// AI Room Analysis Service
// Uses Claude API to analyze room photos and extract 3D data
// ============================================================

import type { AIRoomData, AIAnalysisResponse } from "@/types/ai-room.types";

// ============================================================
// Analysis Prompt
// ============================================================

const ANALYSIS_PROMPT = `Analyze these room photos and extract detailed 3D modeling data.

Return ONLY valid JSON with this exact structure (no markdown, no code fences, no preamble):

{
  "room": {
    "dimensions": {
      "length": <number in feet, estimate using furniture as reference>,
      "width": <number in feet>,
      "height": <number in feet, typically 8-10 feet>
    },
    "shape": "rectangular" | "L-shaped" | "square",
    "walls": {
      "color": "<hex color like #FFFFFF>",
      "texture": "painted" | "wallpaper" | "brick" | "wood"
    },
    "floor": {
      "material": "hardwood" | "carpet" | "tile" | "laminate" | "concrete",
      "color": "<hex color>",
      "pattern": "parquet" | "plank" | "solid" | "checkered" | "herringbone"
    },
    "ceiling": {
      "height": <number in feet>,
      "type": "standard" | "drop" | "vaulted" | "exposed",
      "color": "<hex color>"
    }
  },
  "windows": [
    {
      "wall": "north" | "south" | "east" | "west",
      "width": <number in feet>,
      "height": <number in feet>,
      "position": {
        "x": <distance from left corner in feet>,
        "y": <height from floor in feet>
      },
      "type": "single" | "double" | "sliding" | "bay"
    }
  ],
  "doors": [
    {
      "wall": "north" | "south" | "east" | "west",
      "width": <number in feet, typically 2.5-3>,
      "height": <number in feet, typically 6.5-7>,
      "position": {
        "x": <distance from left corner in feet>
      }
    }
  ],
  "furniture": [
    {
      "type": "bed" | "desk" | "chair" | "wardrobe" | "nightstand" | "dresser" | "bookshelf" | "sofa" | "table" | "cabinet" | "shelf" | "ottoman" | "bench" | "mirror" | "tv-stand",
      "position": {
        "x": <number in feet from room center, negative is left>,
        "z": <number in feet from room center, negative is back>
      },
      "rotation": <number 0-360, 0 is facing positive Z>,
      "dimensions": {
        "width": <number in feet>,
        "depth": <number in feet>,
        "height": <number in feet>
      },
      "color": "<hex color>",
      "material": "wood" | "metal" | "fabric" | "leather" | "plastic" | "glass" | "wicker",
      "subtype": "<specific style like 'twin-bed', 'office-chair', 'l-shaped-desk'>",
      "details": {
        "woodFinish": "light" | "medium" | "dark",
        "fabricPattern": "solid" | "patterned" | "textured",
        "hasDrawers": <boolean>,
        "hasShelves": <boolean>,
        "hasHeadboard": <boolean>,
        "hasArmrests": <boolean>,
        "numberOfDrawers": <number>,
        "numberOfShelves": <number>
      }
    }
  ],
  "lighting": {
    "naturalLight": "bright" | "moderate" | "dim",
    "fixtures": [
      {
        "type": "ceiling" | "desk-lamp" | "floor-lamp" | "wall-sconce" | "pendant",
        "position": {
          "x": <number>,
          "y": <number, height from floor>,
          "z": <number>
        }
      }
    ]
  },
  "decorations": [
    {
      "type": "wall-art" | "plant" | "rug" | "mirror" | "clock" | "curtains" | "cushion" | "vase",
      "position": {
        "x": <number>,
        "y": <number>,
        "z": <number>
      },
      "size": "small" | "medium" | "large"
    }
  ]
}

IMPORTANT GUIDELINES:
1. Estimate room dimensions using furniture as reference:
   - Twin bed: ~6.5ft long × 3.25ft wide
   - Full/Double bed: ~6.5ft × 4.5ft
   - Queen bed: ~6.7ft × 5ft
   - King bed: ~6.7ft × 6.3ft
   - Standard desk: ~4-5ft wide × 2ft deep
   - Interior door: ~3ft wide × 6.8ft tall
   - Window: typically 3-4ft wide × 4-5ft tall

2. Position furniture relative to room center (0, 0)
   - Negative X = left side of room
   - Positive X = right side of room
   - Negative Z = back of room
   - Positive Z = front of room

3. Identify ALL visible furniture in the photos
4. Note exact colors from what you see (use hex codes)
5. Be precise with measurements - they affect 3D accuracy
6. If unsure about a dimension, estimate conservatively

Analyze the room carefully and return ONLY the JSON object.`;

// ============================================================
// Helper Functions
// ============================================================

/**
 * Convert a File to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get the media type for a file
 */
function getMediaType(file: File): string {
  const type = file.type;
  if (type === "image/heic" || type === "image/heif") {
    return "image/jpeg"; // Claude doesn't support HEIC directly
  }
  return type || "image/jpeg";
}

/**
 * Validate the parsed room data structure
 */
function validateRoomData(data: unknown): data is AIRoomData {
  if (!data || typeof data !== "object") return false;
  
  const d = data as Record<string, unknown>;
  
  // Check required top-level properties
  if (!d.room || typeof d.room !== "object") return false;
  if (!Array.isArray(d.furniture)) return false;
  
  // Check room structure
  const room = d.room as Record<string, unknown>;
  if (!room.dimensions || typeof room.dimensions !== "object") return false;
  
  const dims = room.dimensions as Record<string, unknown>;
  if (typeof dims.length !== "number" || typeof dims.width !== "number") {
    return false;
  }
  
  return true;
}

/**
 * Apply default values to incomplete room data
 */
function applyDefaults(data: Partial<AIRoomData>): AIRoomData {
  const defaults: AIRoomData = {
    room: {
      dimensions: { length: 12, width: 10, height: 9 },
      shape: "rectangular",
      walls: { color: "#F5F5F0", texture: "painted" },
      floor: { material: "hardwood", color: "#C4A35A", pattern: "plank" },
      ceiling: { height: 9, type: "standard", color: "#FFFFFF" },
    },
    windows: [],
    doors: [],
    furniture: [],
    lighting: {
      naturalLight: "moderate",
      fixtures: [{ type: "ceiling", position: { x: 0, y: 8, z: 0 } }],
    },
    decorations: [],
  };
  
  return {
    room: {
      dimensions: { ...defaults.room.dimensions, ...data.room?.dimensions },
      shape: data.room?.shape || defaults.room.shape,
      walls: { ...defaults.room.walls, ...data.room?.walls },
      floor: { ...defaults.room.floor, ...data.room?.floor },
      ceiling: { ...defaults.room.ceiling, ...data.room?.ceiling },
    },
    windows: data.windows || defaults.windows,
    doors: data.doors || defaults.doors,
    furniture: data.furniture || defaults.furniture,
    lighting: {
      naturalLight: data.lighting?.naturalLight || defaults.lighting.naturalLight,
      fixtures: data.lighting?.fixtures || defaults.lighting.fixtures,
    },
    decorations: data.decorations || defaults.decorations,
  };
}

// ============================================================
// Main Analysis Function
// ============================================================

/**
 * Analyze room photos using Claude API
 * @param imageFiles Array of image files to analyze
 * @param apiKey Anthropic API key
 * @returns Parsed room data or error
 */
export async function analyzeRoomPhotos(
  imageFiles: File[],
  apiKey: string
): Promise<AIAnalysisResponse> {
  try {
    if (!apiKey) {
      throw new Error("API key is required");
    }
    
    if (imageFiles.length < 1) {
      throw new Error("At least one image is required");
    }
    
    // Convert images to base64
    const imageContents = await Promise.all(
      imageFiles.map(async (file) => {
        const base64 = await fileToBase64(file);
        const mediaType = getMediaType(file);
        return {
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: mediaType,
            data: base64,
          },
        };
      })
    );
    
    // Build message content
    const content = [
      ...imageContents,
      {
        type: "text" as const,
        text: ANALYSIS_PROMPT,
      },
    ];
    
    // Call Claude API
    const response = await fetch("/api/analyze-room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        images: imageContents,
        apiKey: apiKey,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API request failed: ${error}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    // Parse the JSON from Claude's response
    const textContent = result.content;
    
    // Try to extract JSON from the response
    let jsonString = textContent;
    
    // Remove markdown code fences if present
    const jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1].trim();
    } else {
      // Try to find raw JSON object
      const objectMatch = textContent.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonString = objectMatch[0];
      }
    }
    
    // Parse the JSON
    let parsedData: unknown;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw response:", textContent);
      throw new Error("Failed to parse AI response as JSON");
    }
    
    // Validate and apply defaults
    if (!validateRoomData(parsedData)) {
      console.warn("Room data validation failed, applying defaults");
      const dataWithDefaults = applyDefaults(parsedData as Partial<AIRoomData>);
      return {
        success: true,
        data: dataWithDefaults,
        rawResponse: textContent,
      };
    }
    
    return {
      success: true,
      data: applyDefaults(parsedData as Partial<AIRoomData>),
      rawResponse: textContent,
    };
    
  } catch (error) {
    console.error("Room analysis error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// ============================================================
// Mock Analysis (for testing without API)
// ============================================================

/**
 * Generate mock room data for testing
 */
export function generateMockRoomData(): AIRoomData {
  return {
    room: {
      dimensions: { length: 12, width: 10, height: 9 },
      shape: "rectangular",
      walls: { color: "#F5F5F0", texture: "painted" },
      floor: { material: "hardwood", color: "#C4A35A", pattern: "plank" },
      ceiling: { height: 9, type: "standard", color: "#FFFFFF" },
    },
    windows: [
      {
        wall: "north",
        width: 4,
        height: 4,
        position: { x: 4, y: 3 },
        type: "double",
      },
    ],
    doors: [
      {
        wall: "south",
        width: 3,
        height: 7,
        position: { x: 2 },
      },
    ],
    furniture: [
      {
        type: "bed",
        position: { x: -3, z: -2 },
        rotation: 0,
        dimensions: { width: 3.25, depth: 6.5, height: 2 },
        color: "#8B6914",
        material: "wood",
        subtype: "twin-bed",
        details: {
          woodFinish: "medium",
          hasHeadboard: true,
        },
      },
      {
        type: "desk",
        position: { x: 3, z: -3 },
        rotation: 180,
        dimensions: { width: 4, depth: 2, height: 2.5 },
        color: "#9C7C4C",
        material: "wood",
        subtype: "desk-with-hutch",
        details: {
          woodFinish: "medium",
          hasDrawers: true,
          hasShelves: true,
          numberOfDrawers: 3,
        },
      },
      {
        type: "chair",
        position: { x: 3, z: -1 },
        rotation: 0,
        dimensions: { width: 2, depth: 2, height: 3.5 },
        color: "#1A1A1A",
        material: "fabric",
        subtype: "office-chair",
        details: {
          hasArmrests: true,
        },
      },
      {
        type: "wardrobe",
        position: { x: -3, z: 3 },
        rotation: 180,
        dimensions: { width: 4, depth: 2, height: 6 },
        color: "#A0784C",
        material: "wood",
        subtype: "wardrobe-with-shelves",
        details: {
          woodFinish: "medium",
          hasDrawers: true,
          hasShelves: true,
        },
      },
    ],
    lighting: {
      naturalLight: "bright",
      fixtures: [
        { type: "ceiling", position: { x: 0, y: 8.5, z: 0 } },
        { type: "desk-lamp", position: { x: 2, y: 3, z: -3.5 } },
      ],
    },
    decorations: [
      {
        type: "rug",
        position: { x: 0, y: 0.05, z: 0 },
        size: "large",
      },
      {
        type: "wall-art",
        position: { x: 2, y: 5, z: -4.9 },
        size: "medium",
      },
    ],
  };
}
