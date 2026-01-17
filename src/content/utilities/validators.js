/**
 * Validation utilities for scraped furniture data
 */

/**
 * Validate if dimensions are realistic for furniture
 */
export function validateDimensions(dimensions) {
  if (!dimensions) return false;

  const { width, height, depth } = dimensions;
  
  // Basic sanity checks for furniture dimensions (in inches)
  // Furniture typically ranges from:
  // - Width: 12" to 120" (1ft to 10ft)
  // - Height: 12" to 96" (1ft to 8ft)
  // - Depth: 12" to 48" (1ft to 4ft)

  const MIN_WIDTH = 6;
  const MAX_WIDTH = 144;
  const MIN_HEIGHT = 6;
  const MAX_HEIGHT = 120;
  const MIN_DEPTH = 6;
  const MAX_DEPTH = 72;

  let validCount = 0;

  if (width && width >= MIN_WIDTH && width <= MAX_WIDTH) validCount++;
  if (height && height >= MIN_HEIGHT && height <= MAX_HEIGHT) validCount++;
  if (depth && depth >= MIN_DEPTH && depth <= MAX_DEPTH) validCount++;

  // At least 2 dimensions should be valid for furniture
  return validCount >= 2;
}

/**
 * Validate price format
 */
export function validatePrice(price) {
  if (!price) return false;
  
  // Remove currency symbols and parse
  const priceStr = String(price).replace(/[^0-9.]/g, '');
  const priceNum = parseFloat(priceStr);
  
  // Furniture prices typically range from $10 to $50,000
  return !isNaN(priceNum) && priceNum >= 10 && priceNum <= 50000;
}

/**
 * Check if URL looks like a product page (not category/listing)
 */
export function isValidProductURL(url) {
  if (!url) return false;

  const urlLower = url.toLowerCase();
  
  // Common patterns that indicate product pages
  const productPatterns = [
    /\/product\//,
    /\/item\//,
    /\/p\//,
    /\/dp\//,
    /\/products\/[^\/]+$/,
    /\/(chair|table|sofa|bed|desk|couch|ottoman|bench|stool)[^\/]*\/[^\/]+$/i
  ];

  // Patterns that indicate category/listing pages
  const categoryPatterns = [
    /\/category\//,
    /\/collection\//,
    /\/shop\//,
    /\/search\//,
    /\/catalog\//,
    /\/(products|items)(\/|$)/, // Ends with /products or /products/
    /\?.*(page|offset|limit)=/ // Has pagination
  ];

  // Check for category patterns first
  for (const pattern of categoryPatterns) {
    if (pattern.test(urlLower)) {
      return false;
    }
  }

  // Check for product patterns
  for (const pattern of productPatterns) {
    if (pattern.test(urlLower)) {
      return true;
    }
  }

  // Default: might be a product page if URL is specific enough
  // (has multiple path segments but doesn't match category patterns)
  const pathSegments = url.split('/').filter(s => s.length > 0);
  return pathSegments.length >= 3; // e.g., /category/furniture/product-name
}

/**
 * Calculate confidence score for product page detection
 */
export function calculateConfidence(indicators) {
  let score = 0;
  const maxScore = 10;

  // Schema.org Product markup (+3)
  if (indicators.hasSchemaProduct) score += 3;

  // Single product focus (+2)
  if (indicators.singleProductFocus) score += 2;

  // Add to cart button (+2)
  if (indicators.hasAddToCart) score += 2;

  // Dimensions section (+1.5)
  if (indicators.hasDimensions) score += 1.5;

  // Valid product URL (+1.5)
  if (indicators.validProductURL) score += 1.5;

  return Math.min(score / maxScore, 1.0);
}
