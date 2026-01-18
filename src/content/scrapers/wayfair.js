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

  // Color/texture options
  const colorOptions = [];
  
  // Try to find color variant buttons/swatches
  const colorButtons = querySelectorAllFallback([
    '[data-testid*="color"] button',
    '[data-testid*="variant"] button',
    '.ColorSelector button',
    '.VariantSelector button',
    '[aria-label*="color"]',
    '[aria-label*="Color"]',
    '.swatch button',
    '.color-swatch'
  ]);
  
  if (colorButtons.length > 0) {
    colorButtons.forEach(btn => {
      const ariaLabel = getAttribute(btn, 'aria-label');
      const title = getAttribute(btn, 'title');
      const text = getTextContent(btn);
      const alt = getAttribute(btn.querySelector('img'), 'alt');
      const colorName = ariaLabel || title || alt || text;
      if (colorName && colorName.trim() && !colorOptions.includes(colorName.trim())) {
        colorOptions.push(colorName.trim());
      }
    });
  }
  
  // Fallback: Extract from product name or description
  if (colorOptions.length === 0 && data.name) {
    const colorMatch = data.name.match(/\b(white|black|brown|gray|grey|red|blue|green|yellow|orange|pink|purple|beige|tan|ivory|cream|oak|pine|birch|walnut|cherry|mahogany|ebony)\b/gi);
    if (colorMatch) {
      colorOptions.push(...colorMatch.map(c => c.toLowerCase()));
    }
  }
  
  // Set current color if available
  if (colorOptions.length > 0) {
    data.color = colorOptions[0]; // Current selected color
    data.colorOptions = colorOptions; // All available options
  } else {
    // Fallback to single color selector
    const colorEl = querySelectorFallback([
      '[data-testid="color-selector"]',
      ...COMMON_SELECTORS.color
    ]);
    if (colorEl) {
      const colorText = getTextContent(colorEl);
      if (colorText) {
        data.color = colorText;
        data.colorOptions = [colorText];
      }
    }
  }

  // Category from breadcrumbs
  const categoryEl = querySelectorFallback([
    '[data-testid="breadcrumb"] a:last-child',
    ...COMMON_SELECTORS.category
  ]);
  data.category = getTextContent(categoryEl);

  return data;
}
