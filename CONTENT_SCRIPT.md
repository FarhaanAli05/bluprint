# Furniture Product Scraper - Content Script Documentation

## Overview

The content script intelligently scrapes furniture product information from e-commerce websites. It detects product pages and extracts detailed information including name, price, dimensions, images, and more.

## Architecture

### Main Components

1. **`src/content/content.js`** - Main entry point
   - Detects product pages vs category pages
   - Coordinates scraping across different scrapers
   - Handles messages from popup/background
   - Returns JSON with confidence scores

2. **`src/content/utilities/`** - Utility modules
   - **`selectors.js`** - Common CSS selectors with fallback strategies
   - **`dimensionParser.js`** - Parses dimensions from various formats (inches, cm, feet)
   - **`validators.js`** - Validates dimensions, prices, URLs, and calculates confidence

3. **`src/content/scrapers/`** - Website-specific scrapers
   - **`wayfair.js`** - Wayfair-specific selectors
   - **`ikea.js`** - IKEA-specific selectors
   - **`generic.js`** - Generic scraper using schema.org, microdata, and common selectors

## Features

### Detection Logic

The scraper uses multiple indicators to detect furniture product pages:

- ✅ Schema.org Product markup
- ✅ Single product focus (not multiple products)
- ✅ Add-to-cart buttons
- ✅ Dimensions/specification sections
- ✅ Valid product URL patterns

Confidence score (0-1) based on these indicators.

### Data Extraction

Extracts the following when available:

- **Product name/title**
- **Price** (validated for realistic furniture prices)
- **Dimensions** (width, height, depth/length)
  - Handles multiple formats: inches, cm, feet, mixed units
  - Validates realistic furniture dimensions (6" - 144")
- **Product images** (main image URL + all images)
- **Color/finish options**
- **Material**
- **Product category**
- **Product URL**

### Supported Websites

- **Wayfair** - Custom scraper with Wayfair-specific selectors
- **IKEA** - Custom scraper with IKEA-specific selectors
- **Generic** - Works on most furniture sites using:
  - Schema.org JSON-LD markup
  - Microdata (itemscope/itemprop)
  - Common CSS selector patterns

## Usage

### From Popup

The popup (App.jsx) sends a message to the content script:

```javascript
chrome.tabs.sendMessage(tabId, { action: 'scrapeFurniture' }, (response) => {
  // Handle response
});
```

### Response Format

```json
{
  "success": true,
  "confidence": 0.85,
  "error": null,
  "data": {
    "name": "Modern Dining Chair",
    "price": "299.99",
    "dimensions": {
      "width": 24,
      "height": 36,
      "depth": 22
    },
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "mainImage": "https://example.com/image1.jpg",
    "color": "Walnut",
    "material": "Oak wood",
    "category": "Chairs",
    "url": "https://example.com/product"
  }
}
```

### Error Response

```json
{
  "success": false,
  "confidence": 0.2,
  "error": "Page does not appear to be a furniture product page",
  "data": null
}
```

## Adding New Website Scrapers

To add support for a new website (e.g., West Elm):

1. Create `src/content/scrapers/westelm.js`:

```javascript
import { querySelectorFallback, getTextContent, COMMON_SELECTORS } from '../utilities/selectors.js';
import { parseDimensions } from '../utilities/dimensionParser.js';

export function scrapeWestElm() {
  const data = {
    name: null,
    price: null,
    // ... other fields
  };

  // Website-specific selectors
  const nameEl = querySelectorFallback([
    '.product-title',  // West Elm specific
    ...COMMON_SELECTORS.name  // Fallback to common selectors
  ]);
  data.name = getTextContent(nameEl);

  // ... extract other fields

  return data;
}
```

2. Update `src/content/content.js`:

```javascript
import { scrapeWestElm } from './scrapers/westelm.js';

function selectScraper() {
  const hostname = window.location.hostname.toLowerCase();
  
  if (hostname.includes('westelm') || hostname.includes('westelm.com')) {
    return scrapeWestElm;
  }
  // ... other scrapers
}
```

## Testing

The scraper exposes a global `window.furnitureScraper` object for debugging:

```javascript
// In browser console:
window.furnitureScraper.scrape();  // Run scraper
window.furnitureScraper.detectProductPage();  // Check detection
```

## Error Handling

- ✅ Try/catch blocks around all scraping operations
- ✅ Fallback selectors if primary selectors fail
- ✅ Validation of extracted data
- ✅ Detailed error messages with logging
- ✅ Returns null/empty data gracefully instead of throwing

## Validation

- **Dimensions**: Validates realistic furniture sizes (6" - 144" width, etc.)
- **Price**: Validates furniture price range ($10 - $50,000)
- **URL**: Checks for product page patterns vs category pages
- **Confidence**: Returns confidence score (0-1) for detection reliability
