/**
 * IKEA-specific scraper
 */

import { querySelectorFallback, querySelectorAllFallback, getTextContent, getAttribute, COMMON_SELECTORS } from '../utilities/selectors.js';
import { parseDimensions, parseStructuredDimensions } from '../utilities/dimensionParser.js';

export function scrapeIKEA() {
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
    '.pip-header-section h1',
    'h1.pip-header-section__title',
    ...COMMON_SELECTORS.name
  ]);
  data.name = getTextContent(nameEl);

  // Price
  const priceEl = querySelectorFallback([
    '.pip-price__integer',
    '.pip-temp-price__integer',
    ...COMMON_SELECTORS.price
  ]);
  const priceText = getTextContent(priceEl);
  if (priceText) {
    data.price = priceText.replace(/[^0-9.]/g, '');
  }

  // Images
  const imageEls = querySelectorAllFallback([
    '.pip-media__image img',
    '.pip-media img',
    ...COMMON_SELECTORS.images
  ]);
  data.images = imageEls
    .map(el => getAttribute(el, 'src') || getAttribute(el, 'data-src'))
    .filter(url => url && url.includes('ikea.com'))
    .slice(0, 5);

  // Dimensions from product details
  const detailEl = querySelectorFallback([
    '.pip-product-details__measurements',
    '.pip-product-details__container',
    ...COMMON_SELECTORS.dimensions
  ]);
  if (detailEl) {
    const detailText = detailEl.textContent;
    data.dimensions = parseDimensions(detailText);
  }

  // Material from specifications
  const specsEl = querySelectorFallback([
    '.pip-product-details__specifications',
    '[class*="product-details"]'
  ]);
  if (specsEl) {
    const specsText = specsEl.textContent;
    const materialMatch = specsText.match(/material[:\s]+([^\n,]+)/i);
    if (materialMatch) {
      data.material = materialMatch[1].trim();
    }
  }

  // Category from breadcrumbs
  const breadcrumbEl = querySelectorFallback([
    '.pip-breadcrumb__list a:last-child',
    ...COMMON_SELECTORS.category
  ]);
  data.category = getTextContent(breadcrumbEl);

  // Color/texture options
  const colorOptions = [];
  
  // Try to find color variant buttons/swatches
  const colorButtons = querySelectorAllFallback([
    '.pip-product-compact__media img[alt*="color"]',
    '.pip-product-compact__media img[alt*="variant"]',
    '[data-testid*="color"] button',
    '[data-testid*="variant"] button',
    '.pip-variant-selector__button',
    '.pip-color-selector button'
  ]);
  
  if (colorButtons.length > 0) {
    colorButtons.forEach(btn => {
      const alt = getAttribute(btn, 'alt') || getAttribute(btn.querySelector('img'), 'alt');
      const ariaLabel = getAttribute(btn, 'aria-label');
      const text = getTextContent(btn);
      const colorName = alt || ariaLabel || text;
      if (colorName && !colorOptions.includes(colorName)) {
        colorOptions.push(colorName);
      }
    });
  }
  
  // Fallback: Extract from product name or description if no variants found
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
  }

  return data;
}
