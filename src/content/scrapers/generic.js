/**
 * Generic scraper that works across multiple furniture websites
 * Uses common selectors and schema.org markup
 */

import { querySelectorFallback, querySelectorAllFallback, getTextContent, getAttribute, COMMON_SELECTORS } from '../utilities/selectors.js';
import { parseDimensions, parseStructuredDimensions } from '../utilities/dimensionParser.js';

/**
 * Extract JSON-LD structured data
 */
function extractStructuredData() {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent);
      if (data['@type'] === 'Product' || (Array.isArray(data['@graph']) && data['@graph'].some(item => item['@type'] === 'Product'))) {
        return data['@type'] === 'Product' ? data : data['@graph'].find(item => item['@type'] === 'Product');
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

/**
 * Extract microdata (itemscope/itemprop)
 */
function extractMicrodata() {
  const productEl = document.querySelector('[itemscope][itemtype*="Product"], [itemtype*="Product"]');
  if (!productEl) return null;

  const data = {};
  
  // Name
  const nameEl = productEl.querySelector('[itemprop="name"]');
  if (nameEl) data.name = getTextContent(nameEl);

  // Price
  const priceEl = productEl.querySelector('[itemprop="price"]');
  if (priceEl) {
    const price = getAttribute(priceEl, 'content') || getTextContent(priceEl);
    data.price = price?.replace(/[^0-9.]/g, '');
  }

  // Images
  const imageEls = productEl.querySelectorAll('[itemprop="image"]');
  if (imageEls.length > 0) {
    data.images = Array.from(imageEls)
      .map(el => getAttribute(el, 'content') || getAttribute(el, 'src') || getAttribute(el, 'data-src'))
      .filter(url => url)
      .slice(0, 5);
  }

  // Dimensions
  const dimensions = {
    width: null,
    height: null,
    depth: null
  };
  const widthEl = productEl.querySelector('[itemprop="width"]');
  const heightEl = productEl.querySelector('[itemprop="height"]');
  const depthEl = productEl.querySelector('[itemprop="depth"]');
  
  if (widthEl) {
    const width = getAttribute(widthEl, 'content') || getTextContent(widthEl);
    dimensions.width = parseFloat(width);
  }
  if (heightEl) {
    const height = getAttribute(heightEl, 'content') || getTextContent(heightEl);
    dimensions.height = parseFloat(height);
  }
  if (depthEl) {
    const depth = getAttribute(depthEl, 'content') || getTextContent(depthEl);
    dimensions.depth = parseFloat(depth);
  }
  
  if (dimensions.width || dimensions.height || dimensions.depth) {
    data.dimensions = dimensions;
  }

  return data;
}

export function scrapeGeneric() {
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

  // Try structured data first (most reliable)
  const structuredData = extractStructuredData();
  if (structuredData) {
    if (structuredData.name) data.name = structuredData.name;
    if (structuredData.offers?.price) {
      data.price = String(structuredData.offers.price).replace(/[^0-9.]/g, '');
    }
    if (structuredData.image) {
      const images = Array.isArray(structuredData.image) ? structuredData.image : [structuredData.image];
      data.images = images.slice(0, 5);
    }
    if (structuredData.dimensions) {
      data.dimensions = parseStructuredDimensions(structuredData.dimensions);
    }
  }

  // Try microdata
  const microdata = extractMicrodata();
  if (microdata) {
    if (microdata.name) data.name = data.name || microdata.name;
    if (microdata.price) data.price = data.price || microdata.price;
    if (microdata.images) data.images = data.images.length > 0 ? data.images : microdata.images;
    if (microdata.dimensions) data.dimensions = data.dimensions || microdata.dimensions;
  }

  // Fallback to CSS selectors
  if (!data.name) {
    const nameEl = querySelectorFallback(COMMON_SELECTORS.name);
    data.name = getTextContent(nameEl);
  }

  if (!data.price) {
    const priceEl = querySelectorFallback(COMMON_SELECTORS.price);
    const priceText = getTextContent(priceEl);
    if (priceText) {
      data.price = priceText.replace(/[^0-9.]/g, '');
    }
  }

  if (data.images.length === 0) {
    const imageEls = querySelectorAllFallback(COMMON_SELECTORS.images);
    data.images = imageEls
      .map(el => getAttribute(el, 'src') || getAttribute(el, 'data-src'))
      .filter(url => url && !url.includes('placeholder'))
      .slice(0, 5);
  }

  // Dimensions from text content
  if (!data.dimensions) {
    const dimensionsEl = querySelectorFallback(COMMON_SELECTORS.dimensions);
    if (dimensionsEl) {
      const dimensionsText = dimensionsEl.textContent;
      data.dimensions = parseDimensions(dimensionsText);
    }
  }

  // Color
  const colorEl = querySelectorFallback(COMMON_SELECTORS.color);
  if (colorEl) {
    data.color = getTextContent(colorEl);
  }

  // Material
  const materialEl = querySelectorFallback(COMMON_SELECTORS.material);
  if (materialEl) {
    data.material = getTextContent(materialEl);
  } else {
    // Try to extract from specifications text
    const specsEl = querySelectorFallback(COMMON_SELECTORS.dimensions);
    if (specsEl) {
      const specsText = specsEl.textContent;
      const materialMatch = specsText.match(/material[:\s]+([^\n,]+)/i);
      if (materialMatch) {
        data.material = materialMatch[1].trim();
      }
    }
  }

  // Category
  const categoryEl = querySelectorFallback(COMMON_SELECTORS.category);
  if (categoryEl) {
    data.category = getTextContent(categoryEl);
  }

  return data;
}
