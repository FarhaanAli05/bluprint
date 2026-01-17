/**
 * Utility functions for parsing dimensions from text
 * Handles various formats: inches, cm, feet, mixed units
 */

/**
 * Convert dimensions to consistent format (inches)
 */
export function convertToInches(value, unit) {
  const unitLower = unit.toLowerCase().trim();
  const numValue = parseFloat(value);

  if (isNaN(numValue)) return null;

  switch (unitLower) {
    case 'cm':
    case 'centimeters':
    case 'centimeter':
      return numValue * 0.393701;
    case 'm':
    case 'meters':
    case 'meter':
      return numValue * 39.3701;
    case 'ft':
    case 'feet':
    case 'foot':
    case "'":
      return numValue * 12;
    case 'in':
    case 'inches':
    case 'inch':
    case '"':
      return numValue;
    default:
      return numValue; // Assume inches if unit unknown
  }
}

/**
 * Extract dimensions from text using various patterns
 * Returns { width: number, height: number, depth: number } in inches
 */
export function parseDimensions(text) {
  if (!text) return null;

  const result = {
    width: null,
    height: null,
    depth: null
  };

  // Common patterns:
  // "30" x "20" x "15" or 30" x 20" x 15"
  // "30" W x "20" D x "15" H
  // W 30" x D 20" x H 15"
  // 30 in x 20 in x 15 in
  // 76 cm x 51 cm x 38 cm
  // 30" W x 20" D x 15" H

  const patterns = [
    // Pattern: "W" 30" x "D" 20" x "H" 15" or 30" W x 20" D x 15" H
    /(?:w|width)[:\s]*([\d.]+)\s*["']?\s*(?:x|×)\s*(?:d|depth|length)[:\s]*([\d.]+)\s*["']?\s*(?:x|×)\s*(?:h|height)[:\s]*([\d.]+)\s*["']?/i,
    /([\d.]+)\s*["']?\s*w\s*(?:x|×)\s*([\d.]+)\s*["']?\s*d\s*(?:x|×)\s*([\d.]+)\s*["']?\s*h/i,
    /([\d.]+)\s*["']?\s*(?:x|×)\s*([\d.]+)\s*["']?\s*(?:x|×)\s*([\d.]+)\s*["']?/,
    // Pattern with units: 76 cm x 51 cm x 38 cm
    /([\d.]+)\s*(cm|in|m|ft|"|'|inches?|centimeters?|meters?|feet?)\s*(?:x|×)\s*([\d.]+)\s*(cm|in|m|ft|"|'|inches?|centimeters?|meters?|feet?)\s*(?:x|×)\s*([\d.]+)\s*(cm|in|m|ft|"|'|inches?|centimeters?|meters?|feet?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (match.length === 4) {
        // Three values without explicit units
        const dims = [match[1], match[2], match[3]].map(v => parseFloat(v));
        if (dims.every(d => !isNaN(d))) {
          result.width = dims[0];
          result.height = dims[1];
          result.depth = dims[2];
          break;
        }
      } else if (match.length === 7) {
        // Three values with units
        const dims = [
          convertToInches(match[1], match[2]),
          convertToInches(match[3], match[4]),
          convertToInches(match[5], match[6])
        ];
        if (dims.every(d => d !== null && !isNaN(d))) {
          result.width = dims[0];
          result.height = dims[1];
          result.depth = dims[2];
          break;
        }
      }
    }
  }

  // Try to find individual dimension fields if pattern matching failed
  if (!result.width || !result.height || !result.depth) {
    const widthMatch = text.match(/(?:w|width)[:\s]*([\d.]+)\s*(cm|in|m|ft|"|'|inches?|centimeters?|meters?|feet?)?/i);
    const heightMatch = text.match(/(?:h|height)[:\s]*([\d.]+)\s*(cm|in|m|ft|"|'|inches?|centimeters?|meters?|feet?)?/i);
    const depthMatch = text.match(/(?:d|depth|length)[:\s]*([\d.]+)\s*(cm|in|m|ft|"|'|inches?|centimeters?|meters?|feet?)?/i);

    if (widthMatch) {
      result.width = widthMatch[2] 
        ? convertToInches(widthMatch[1], widthMatch[2])
        : parseFloat(widthMatch[1]);
    }
    if (heightMatch) {
      result.height = heightMatch[2]
        ? convertToInches(heightMatch[1], heightMatch[2])
        : parseFloat(heightMatch[1]);
    }
    if (depthMatch) {
      result.depth = depthMatch[2]
        ? convertToInches(depthMatch[1], depthMatch[2])
        : parseFloat(depthMatch[1]);
    }
  }

  // Return null if no valid dimensions found
  if (!result.width && !result.height && !result.depth) {
    return null;
  }

  return result;
}

/**
 * Extract dimensions from structured data (like schema.org)
 */
export function parseStructuredDimensions(data) {
  if (!data) return null;

  const result = {
    width: null,
    height: null,
    depth: null
  };

  // Check for width, height, depth properties
  if (data.width) {
    if (typeof data.width === 'object' && data.width.value) {
      result.width = parseFloat(data.width.value);
    } else {
      result.width = parseFloat(data.width);
    }
  }

  if (data.height) {
    if (typeof data.height === 'object' && data.height.value) {
      result.height = parseFloat(data.height.value);
    } else {
      result.height = parseFloat(data.height);
    }
  }

  if (data.depth || data.length) {
    const depth = data.depth || data.length;
    if (typeof depth === 'object' && depth.value) {
      result.depth = parseFloat(depth.value);
    } else {
      result.depth = parseFloat(depth);
    }
  }

  return result.width || result.height || result.depth ? result : null;
}
