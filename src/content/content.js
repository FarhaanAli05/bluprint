/**
 * Main content script for furniture product scraping
 * Detects product pages and extracts furniture information
 */

import { scrapeWayfair } from './scrapers/wayfair.js';
import { scrapeIKEA } from './scrapers/ikea.js';
import { scrapeGeneric } from './scrapers/generic.js';
import { querySelectorFallback, COMMON_SELECTORS } from './utilities/selectors.js';
import { parseDimensions } from './utilities/dimensionParser.js';
import { validateDimensions, validatePrice, isValidProductURL, calculateConfidence } from './utilities/validators.js';

// #region agent log
(function(){const log={location:'content.js:12',message:'Content script loaded',data:{url:window.location.href,readyState:document.readyState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'};console.log('[DEBUG]',log);fetch('http://127.0.0.1:7242/ingest/611b0b03-6cca-4656-a403-31a26cc1dd66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(log)}).catch(e=>console.warn('[DEBUG] Log send failed:',e));})();
// #endregion

/**
 * Detect if current page is a furniture product page
 */
function detectProductPage() {
  const indicators = {
    hasSchemaProduct: false,
    singleProductFocus: false,
    hasAddToCart: false,
    hasDimensions: false,
    validProductURL: false
  };

  // Check for schema.org Product markup
  try {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      const data = JSON.parse(script.textContent);
      if (data['@type'] === 'Product' || 
          (Array.isArray(data['@graph']) && data['@graph'].some(item => item['@type'] === 'Product'))) {
        indicators.hasSchemaProduct = true;
        break;
      }
    }
  } catch (e) {
    // Failed to parse JSON, continue
  }

  // Check for microdata Product
  const productMicrodata = document.querySelector('[itemscope][itemtype*="Product"], [itemtype*="Product"]');
  if (productMicrodata) {
    indicators.hasSchemaProduct = true;
  }

  // Check for add-to-cart button
  const addToCartEl = querySelectorFallback(COMMON_SELECTORS.addToCart);
  indicators.hasAddToCart = !!addToCartEl;

  // Check for dimensions section
  const dimensionsEl = querySelectorFallback(COMMON_SELECTORS.dimensions);
  if (dimensionsEl) {
    const dimensionsText = dimensionsEl.textContent;
    const dimensions = parseDimensions(dimensionsText);
    indicators.hasDimensions = validateDimensions(dimensions);
  }

  // Check URL pattern
  indicators.validProductURL = isValidProductURL(window.location.href);

  // Check for single product focus (not multiple products)
  // Look for product title, should only be one
  const productTitles = document.querySelectorAll('h1[class*="product"], h1[itemprop="name"]');
  indicators.singleProductFocus = productTitles.length === 1;

  return indicators;
}

/**
 * Determine which scraper to use based on domain
 */
function selectScraper() {
  const hostname = window.location.hostname.toLowerCase();

  if (hostname.includes('wayfair') || hostname.includes('wayfair.com')) {
    return scrapeWayfair;
  } else if (hostname.includes('ikea') || hostname.includes('ikea.com')) {
    return scrapeIKEA;
  } else {
    // Use generic scraper for other sites
    return scrapeGeneric;
  }
}

/**
 * Clean and format scraped data
 */
function cleanData(data) {
  const cleaned = { ...data };

  // Clean price
  if (cleaned.price) {
    cleaned.price = String(cleaned.price).replace(/[^0-9.]/g, '');
    cleaned.price = parseFloat(cleaned.price) || null;
  }

  // Clean images - ensure full URLs
  if (cleaned.images && Array.isArray(cleaned.images)) {
    cleaned.images = cleaned.images
      .map(img => {
        if (!img) return null;
        if (img.startsWith('http')) return img;
        if (img.startsWith('//')) return window.location.protocol + img;
        if (img.startsWith('/')) return window.location.origin + img;
        return window.location.origin + '/' + img;
      })
      .filter(img => img !== null);
  }

  // Main image is first image
  cleaned.mainImage = cleaned.images && cleaned.images.length > 0 ? cleaned.images[0] : null;

  // Clean text fields
  ['name', 'color', 'material', 'category'].forEach(field => {
    if (cleaned[field]) {
      cleaned[field] = String(cleaned[field]).trim() || null;
    }
  });

  // Clean colorOptions array if present
  if (cleaned.colorOptions && Array.isArray(cleaned.colorOptions)) {
    cleaned.colorOptions = cleaned.colorOptions
      .map(opt => String(opt).trim())
      .filter(opt => opt.length > 0);
    // Remove duplicates
    cleaned.colorOptions = [...new Set(cleaned.colorOptions)];
    // If no valid color options, remove the field
    if (cleaned.colorOptions.length === 0) {
      delete cleaned.colorOptions;
    }
  }

  // Validate dimensions
  if (cleaned.dimensions && !validateDimensions(cleaned.dimensions)) {
    cleaned.dimensions = null;
  }

  return cleaned;
}

/**
 * Main scraping function
 */
function scrapeFurnitureProduct() {
  try {
    // Detect if this is a product page
    const indicators = detectProductPage();
    const confidence = calculateConfidence(indicators);

    // Low confidence - likely not a product page
    if (confidence < 0.3) {
      console.log('[Furniture Scraper] Low confidence - likely not a furniture product page', { confidence, indicators });
      return {
        success: false,
        confidence,
        error: 'Page does not appear to be a furniture product page',
        data: null
      };
    }

    // Select appropriate scraper
    const scraper = selectScraper();
    const domain = window.location.hostname;

    // Scrape data
    let rawData;
    try {
      rawData = scraper();
    } catch (error) {
      console.error('[Furniture Scraper] Error during scraping:', error);
      return {
        success: false,
        confidence,
        error: `Scraping error: ${error.message}`,
        data: null
      };
    }

    // Clean and validate data
    const cleanedData = cleanData(rawData);

    // Validate that we have at least some product data
    if (!cleanedData.name && !cleanedData.price && cleanedData.images.length === 0) {
      return {
        success: false,
        confidence: confidence * 0.5, // Reduce confidence if no data found
        error: 'No product data could be extracted',
        data: null
      };
    }

    // Validate price if present
    if (cleanedData.price && !validatePrice(cleanedData.price)) {
      console.warn('[Furniture Scraper] Price validation failed:', cleanedData.price);
      // Don't fail, just remove invalid price
      cleanedData.price = null;
    }

    console.log('[Furniture Scraper] Successfully scraped product:', cleanedData);

    return {
      success: true,
      confidence,
      error: null,
      data: cleanedData
    };

  } catch (error) {
    console.error('[Furniture Scraper] Fatal error:', error);
    return {
      success: false,
      confidence: 0,
      error: `Fatal error: ${error.message}`,
      data: null
    };
  }
}

/**
 * Listen for messages from popup or background script
 */
// #region agent log
(function(){const log={location:'content.js:209',message:'Message listener registered',data:{url:window.location.href},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'};console.log('[DEBUG]',log);fetch('http://127.0.0.1:7242/ingest/611b0b03-6cca-4656-a403-31a26cc1dd66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(log)}).catch(e=>console.warn('[DEBUG] Log send failed:',e));})();
// #endregion
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // #region agent log
  (function(){const log={location:'content.js:212',message:'Message received',data:{action:request.action,url:window.location.href},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'};console.log('[DEBUG]',log);fetch('http://127.0.0.1:7242/ingest/611b0b03-6cca-4656-a403-31a26cc1dd66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(log)}).catch(e=>console.warn('[DEBUG] Log send failed:',e));})();
  // #endregion
  
  // Handle ping requests (to check if content script is loaded)
  if (request.action === 'ping') {
    sendResponse({ success: true, loaded: true });
    return true;
  }
  
  if (request.action === 'scrapeFurniture') {
    // #region agent log
    (function(){const log={location:'content.js:214',message:'Starting scrape',data:{url:window.location.href},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'};console.log('[DEBUG]',log);fetch('http://127.0.0.1:7242/ingest/611b0b03-6cca-4656-a403-31a26cc1dd66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(log)}).catch(e=>console.warn('[DEBUG] Log send failed:',e));})();
    // #endregion
    const result = scrapeFurnitureProduct();
    // #region agent log
    (function(){const log={location:'content.js:216',message:'Scrape completed',data:{success:result.success,confidence:result.confidence,hasError:!!result.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'};console.log('[DEBUG]',log);fetch('http://127.0.0.1:7242/ingest/611b0b03-6cca-4656-a403-31a26cc1dd66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(log)}).catch(e=>console.warn('[DEBUG] Log send failed:',e));})();
    // #endregion
    sendResponse(result);
    return true; // Indicates we will send a response asynchronously
  }
  
  return false;
});

// Auto-scrape when page loads (optional - can be disabled)
// Uncomment the following if you want automatic scraping:
// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', () => {
//     const result = scrapeFurnitureProduct();
//     console.log('[Furniture Scraper] Auto-scraped on page load:', result);
//   });
// } else {
//   const result = scrapeFurnitureProduct();
//   console.log('[Furniture Scraper] Auto-scraped on script load:', result);
// }

// Export for testing/debugging
window.furnitureScraper = {
  scrape: scrapeFurnitureProduct,
  detectProductPage,
  selectScraper
};
