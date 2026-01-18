/**
 * Common CSS selectors that work across multiple furniture websites
 * Organized by data type with fallback options
 */

export const COMMON_SELECTORS = {
  // Product name/title selectors (ordered by priority)
  name: [
    'h1[class*="product"]',
    'h1[class*="title"]',
    'h1[itemprop="name"]',
    '[data-testid*="product-title"]',
    '[data-testid*="product-name"]',
    '.product-title',
    '.product-name',
    '.product__title',
    'h1',
    '[itemprop="name"]'
  ],

  // Price selectors
  price: [
    '[itemprop="price"]',
    '[class*="price"]:not([class*="old"]):not([class*="compare"])',
    '[data-testid*="price"]',
    '.price',
    '.product-price',
    '.price-current',
    '[class*="product-price"]',
    '.amount',
    '[class*="cost"]'
  ],

  // Main product image selectors
  mainImage: [
    '[class*="product-image"] img',
    '[class*="main-image"] img',
    '[class*="hero-image"] img',
    '.product-gallery img:first-of-type',
    '[itemprop="image"]',
    '[data-testid*="product-image"] img',
    '[data-testid*="hero-image"] img',
    '.product-photo img',
    'img[alt*="product"]'
  ],

  // All product images
  images: [
    '[class*="product-image"] img',
    '[class*="product-gallery"] img',
    '[class*="product-photo"] img',
    '[itemprop="image"]',
    '[data-testid*="product-image"] img',
    '.gallery img',
    '.product-images img'
  ],

  // Dimensions/specifications sections
  dimensions: [
    '[class*="dimension"]',
    '[class*="specification"]',
    '[class*="specs"]',
    '[class*="product-details"]',
    '[class*="product-specs"]',
    '[data-testid*="specification"]',
    '[data-testid*="dimension"]',
    '.product-specifications',
    '.specs-table',
    'table[class*="spec"]'
  ],

  // Color/finish options
  color: [
    '[class*="color"]',
    '[class*="finish"]',
    '[class*="variant"]',
    '[data-testid*="color"]',
    '[data-testid*="finish"]',
    '.color-swatch',
    '.color-options',
    '.product-options'
  ],

  // Material
  material: [
    '[class*="material"]',
    '[itemprop="material"]',
    '[data-testid*="material"]',
    '.product-material',
    '.spec-material'
  ],

  // Add to cart button (for detection)
  addToCart: [
    '[class*="add-to-cart"]',
    '[class*="add-to-bag"]',
    '[data-testid*="add-to-cart"]',
    '[data-testid*="add-to-bag"]',
    'button[aria-label*="cart"]',
    'button[aria-label*="bag"]',
    'button:contains("Add")',
    '[class*="buy-button"]'
  ],

  // Category indicators
  category: [
    '[itemprop="category"]',
    '[class*="breadcrumb"] a:last-child',
    '[class*="category"]',
    '[data-testid*="category"]',
    '.product-category',
    'nav[aria-label*="breadcrumb"] a:last-child'
  ]
};

/**
 * Try multiple selectors and return first match
 */
export function querySelectorFallback(selectors, root = document) {
  if (typeof selectors === 'string') {
    return root.querySelector(selectors);
  }

  for (const selector of selectors) {
    try {
      const element = root.querySelector(selector);
      if (element) {
        return element;
      }
    } catch (e) {
      // Invalid selector, continue to next
      continue;
    }
  }
  return null;
}

/**
 * Try multiple selectors and return all matches
 */
export function querySelectorAllFallback(selectors, root = document) {
  if (typeof selectors === 'string') {
    return Array.from(root.querySelectorAll(selectors));
  }

  const results = new Set();
  
  for (const selector of selectors) {
    try {
      const elements = root.querySelectorAll(selector);
      elements.forEach(el => results.add(el));
    } catch (e) {
      // Invalid selector, continue to next
      continue;
    }
  }
  
  return Array.from(results);
}

/**
 * Extract text content, handling whitespace
 */
export function getTextContent(element) {
  if (!element) return null;
  return element.textContent?.trim() || null;
}

/**
 * Extract attribute value
 */
export function getAttribute(element, attr) {
  if (!element) return null;
  return element.getAttribute(attr) || null;
}
