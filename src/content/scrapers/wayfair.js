/**
 * Wayfair-specific scraper
 */

import { querySelectorFallback, querySelectorAllFallback, getTextContent, getAttribute, COMMON_SELECTORS } from '../utilities/selectors.js';
import { parseDimensions, parseStructuredDimensions } from '../utilities/dimensionParser.js';

export function scrapeWayfair() {
  const data = {
    name: null,
    price: null,
    dimensions: null,
    images: [],
    color: null,
    material: null,
    category: null,
    url: window.location.href
  };

  // Product name
  const nameEl = querySelectorFallback([
    'h1[data-testid="title"]',
    'h1.Breadcrumbs-title',
    ...COMMON_SELECTORS.name
  ]);
  data.name = getTextContent(nameEl);

  // Price
  const priceEl = querySelectorFallback([
    '[data-testid="product-price"]',
    '.SFPrice',
    ...COMMON_SELECTORS.price
  ]);
  const priceText = getTextContent(priceEl);
  if (priceText) {
    data.price = priceText.replace(/[^0-9.]/g, '');
  }

  // Images
  const imageEls = querySelectorAllFallback([
    '[data-testid="image"] img',
    '.ProductImage img',
    ...COMMON_SELECTORS.images
  ]);
  data.images = imageEls
    .map(el => getAttribute(el, 'src') || getAttribute(el, 'data-src'))
    .filter(url => url && !url.includes('placeholder'))
    .slice(0, 5); // Limit to 5 images

  // Dimensions from specifications
  const specEl = querySelectorFallback([
    '[data-testid="specifications"]',
    '#product-specifications',
    ...COMMON_SELECTORS.dimensions
  ]);
  if (specEl) {
    const specText = specEl.textContent;
    data.dimensions = parseDimensions(specText);
    
    // Try to extract material from specs
    const materialMatch = specText.match(/material[:\s]+([^\n,]+)/i);
    if (materialMatch) {
      data.material = materialMatch[1].trim();
    }
  }

  // Color options
  const colorEl = querySelectorFallback([
    '[data-testid="color-selector"]',
    ...COMMON_SELECTORS.color
  ]);
  if (colorEl) {
    data.color = getTextContent(colorEl);
  }

  // Category from breadcrumbs
  const categoryEl = querySelectorFallback([
    '[data-testid="breadcrumb"] a:last-child',
    ...COMMON_SELECTORS.category
  ]);
  data.category = getTextContent(categoryEl);

  return data;
}
