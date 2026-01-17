// ============================================================
// API Route: Analyze Room Photos with Claude
// ============================================================

import { NextRequest, NextResponse } from "next/server";

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

interface ImageContent {
  type: "image";
  source: {
    type: "base64";
    media_type: string;
    data: string;
  };
}

interface RequestBody {
  images: ImageContent[];
  apiKey?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { images, apiKey } = body;
    
    // Get API key from request or environment
    const anthropicKey = apiKey || process.env.ANTHROPIC_API_KEY;
    
    if (!anthropicKey) {
      return NextResponse.json(
        { error: "API key is required. Set ANTHROPIC_API_KEY environment variable or provide apiKey in request." },
        { status: 400 }
      );
    }
    
    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }
    
    // Build message content for Claude
    const content = [
      ...images,
      {
        type: "text" as const,
        text: ANALYSIS_PROMPT,
      },
    ];
    
    // Call Anthropic API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: content,
          },
        ],
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return NextResponse.json(
        { error: `Anthropic API error: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Extract text content from response
    const textContent = data.content?.find(
      (c: { type: string }) => c.type === "text"
    )?.text;
    
    if (!textContent) {
      return NextResponse.json(
        { error: "No text content in AI response" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ content: textContent });
    
  } catch (error) {
    console.error("Room analysis API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
