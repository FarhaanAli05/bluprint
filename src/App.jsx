import React, { useState } from 'react';
import './App.css';
import ModelViewer from './components/ModelViewer';
import SuccessView from './components/SuccessView';

function App() {
  const [scrapedData, setScrapedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleScrapeAndCreate = async () => {
    // #region agent log
    (function(){const log={location:'App.jsx:9',message:'Button clicked',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'};console.log('[DEBUG]',log);fetch('http://127.0.0.1:7242/ingest/611b0b03-6cca-4656-a403-31a26cc1dd66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(log)}).catch(e=>console.warn('[DEBUG] Log send failed:',e));})();
    // #endregion
    setIsLoading(true);
    setError(null);
    setScrapedData(null);

    try {
      // #region agent log
      (function(){const log={location:'App.jsx:15',message:'Calling chrome.tabs.query',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'};console.log('[DEBUG]',log);fetch('http://127.0.0.1:7242/ingest/611b0b03-6cca-4656-a403-31a26cc1dd66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(log)}).catch(e=>console.warn('[DEBUG] Log send failed:',e));})();
      // #endregion
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // #region agent log
      (function(){const log={location:'App.jsx:17',message:'chrome.tabs.query result',data:{tabId:tab?.id,url:tab?.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'};console.log('[DEBUG]',log);fetch('http://127.0.0.1:7242/ingest/611b0b03-6cca-4656-a403-31a26cc1dd66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(log)}).catch(e=>console.warn('[DEBUG] Log send failed:',e));})();
      // #endregion

      if (!tab.id) {
        // #region agent log
        (function(){const log={location:'App.jsx:19',message:'No tab.id error',data:{tab},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'};console.log('[DEBUG]',log);fetch('http://127.0.0.1:7242/ingest/611b0b03-6cca-4656-a403-31a26cc1dd66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(log)}).catch(e=>console.warn('[DEBUG] Log send failed:',e));})();
        // #endregion
        throw new Error('Could not get active tab');
      }

      // Check if URL is valid (not chrome:// or extension pages)
      const url = tab.url || '';
      if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('moz-extension://')) {
        throw new Error('Cannot scrape on Chrome internal pages or extension pages. Please navigate to a regular webpage.');
      }

      // Try to inject content script if not already loaded
      try {
        // First, try to send a message to see if content script is already loaded
        await chrome.tabs.sendMessage(tab.id, { action: 'ping' }).catch(() => {
          // Content script not loaded, ignore this error
        });
      } catch {
        // Content script not loaded, inject it dynamically
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          // Wait a bit for the script to initialize
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (injectError) {
          throw new Error(`Failed to inject content script: ${injectError.message}. Make sure you're on a regular webpage (not chrome:// or extension pages).`);
        }
      }
      
      // #region agent log
      (function(){const log={location:'App.jsx:23',message:'Sending message to content script',data:{tabId:tab.id,action:'scrapeFurniture',url:tab.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'};console.log('[DEBUG]',log);fetch('http://127.0.0.1:7242/ingest/611b0b03-6cca-4656-a403-31a26cc1dd66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(log)}).catch(e=>console.warn('[DEBUG] Log send failed:',e));})();
      // #endregion
      
      // Send message to content script to scrape
      let response;
      try {
        response = await chrome.tabs.sendMessage(tab.id, {
          action: 'scrapeFurniture'
        });
      } catch (sendError) {
        // #region agent log
        (function(){const log={location:'App.jsx:47',message:'sendMessage threw error',data:{error:sendError.message,name:sendError.name,stack:sendError.stack,chromeError:chrome.runtime.lastError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'};console.log('[DEBUG]',log);fetch('http://127.0.0.1:7242/ingest/611b0b03-6cca-4656-a403-31a26cc1dd66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(log)}).catch(e=>console.warn('[DEBUG] Log send failed:',e));})();
        // #endregion
        throw new Error(`Failed to communicate with content script: ${sendError.message}. Make sure you're on a regular webpage (not chrome:// or extension pages).`);
      }
      
      // Check for chrome.runtime errors after sending
      if (chrome.runtime.lastError) {
        // #region agent log
        (function(){const log={location:'App.jsx:54',message:'Chrome runtime error after sendMessage',data:{error:chrome.runtime.lastError.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'};console.log('[DEBUG]',log);fetch('http://127.0.0.1:7242/ingest/611b0b03-6cca-4656-a403-31a26cc1dd66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(log)}).catch(e=>console.warn('[DEBUG] Log send failed:',e));})();
        // #endregion
        throw new Error(`Content script communication failed: ${chrome.runtime.lastError.message}. The content script may not be loaded on this page.`);
      }

      // #region agent log
      (function(){const log={location:'App.jsx:27',message:'Received response from content script',data:{success:response?.success,hasData:!!response?.data,error:response?.error,confidence:response?.confidence},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'};console.log('[DEBUG]',log);fetch('http://127.0.0.1:7242/ingest/611b0b03-6cca-4656-a403-31a26cc1dd66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(log)}).catch(e=>console.warn('[DEBUG] Log send failed:',e));})();
      // #endregion

      if (response && response.success) {
        // Simulate loading/processing time (3-4 seconds)
        const loadingTime = 3000 + Math.random() * 1000; // 3-4 seconds
        await new Promise(resolve => setTimeout(resolve, loadingTime));
        
        setScrapedData(response.data);
        setIsSuccess(false); // Reset success state when new data is scraped
        console.log('Scraped furniture data:', response.data);
      } else {
        // #region agent log
        (function(){const log={location:'App.jsx:33',message:'Response indicates failure',data:{response},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'};console.log('[DEBUG]',log);fetch('http://127.0.0.1:7242/ingest/611b0b03-6cca-4656-a403-31a26cc1dd66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(log)}).catch(e=>console.warn('[DEBUG] Log send failed:',e));})();
        // #endregion
        throw new Error(response?.error || 'Failed to scrape product data');
      }
    } catch (err) {
      // #region agent log
      (function(){const log={location:'App.jsx:36',message:'Error caught',data:{error:err.message,stack:err.stack,name:err.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2,H3'};console.log('[DEBUG]',log);fetch('http://127.0.0.1:7242/ingest/611b0b03-6cca-4656-a403-31a26cc1dd66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(log)}).catch(e=>console.warn('[DEBUG] Log send failed:',e));})();
      // #endregion
      console.error('Error scraping furniture:', err);
      setError(err.message);
      alert(`Error: ${err.message}\n\nMake sure you are on a furniture product page (e.g., Wayfair, IKEA, etc.)`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToStorage = async () => {
    try {
      // TODO: Implement actual storage logic here
      // For now, simulate adding to storage
      console.log('Adding to storage:', scrapedData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsSuccess(true);
    } catch (err) {
      setError('Failed to add item to storage');
      console.error('Storage error:', err);
    }
  };

  const handleCancel = () => {
    setScrapedData(null);
    setIsSuccess(false);
    setError(null);
  };

  const handleKeepShopping = () => {
    // Close popup and reset state
    setScrapedData(null);
    setIsSuccess(false);
    setError(null);
    window.close();
  };

  const handleViewStorage = () => {
    // TODO: Open storage view or deep-link to storage page
    console.log('Opening storage view');
    // For now, just reset and close
    handleKeepShopping();
  };

  // Format dimensions for display (cm only, no conversion)
  const formatDimensions = (dims) => {
    if (!dims || (!dims.width && !dims.depth && !dims.height)) {
      return null;
    }
    const w = dims.width || '?';
    const d = dims.depth || '?';
    const h = dims.height || '?';
    return `${w}×${d}×${h} cm`;
  };
  
  // Clean name if it contains color/dimensions
  const cleanProductName = (name) => {
    if (!name) return null;
    // Remove dimension patterns (e.g., "40x28x202 cm" or "40×28×202 cm")
    let cleaned = name
      .replace(/\s+\d+[x×]\d+[x×]\d+\s*cm.*$/i, '') // Remove "40x28x202 cm" or similar
      .replace(/\s+\d+[x×]\d+[x×]\d+.*$/i, '') // Remove "40x28x202" or similar (without cm)
      .replace(/\s*\([^)]*\d+.*\)/g, '') // Remove parentheses with numbers (inch conversions)
      .replace(/,\s*(white|black|brown|gray|grey|red|blue|green|yellow|orange|pink|purple|beige|tan|ivory|cream),?/gi, '') // Remove colors
      .replace(/\s*,\s*$/, '') // Remove trailing comma
      .trim();
    return cleaned || name; // Return original if cleaning removes everything
  };

  // Format price for display
  const formatPrice = (price) => {
    if (!price) return null;
    return `$${parseFloat(price).toFixed(2)}`;
  };

  return (
    <div className="app-container">
      <div className={`box ${!isSuccess ? 'blueprint-bg' : ''}`}>
        {/* Success State */}
        {isSuccess ? (
          <SuccessView
            onKeepShopping={handleKeepShopping}
            onViewStorage={handleViewStorage}
          />
        ) : scrapedData ? (
          /* Preview State - Compact, scroll-revealed, space-efficient */
          <div className="preview-state">
            {/* Preview Card - Model + Buttons as one unit */}
            <div className="preview-card">
              {/* 3D Model Viewer - Compact, just enough for clear interaction */}
              <div className="model-viewer-wrapper">
                <div className="model-viewer-container">
                  <ModelViewer
                    dimensions={scrapedData.dimensions}
                    className="model-viewer"
                    productName={scrapedData.name}
                  />
                </div>
              </div>

              {/* Action Bar - Tightly anchored to model */}
              <div className="preview-actions">
                <button
                  className="action-button secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  className="action-button primary"
                  onClick={handleAddToStorage}
                >
                  Add to storage
                </button>
              </div>
            </div>

            {/* Scrollable Details Area - Below the fold */}
            <div className="preview-scroll-container">
              <div className="product-info">
                <dl className="product-list">
                  {cleanProductName(scrapedData.name) && (
                    <>
                      <dt className="product-label">name:</dt>
                      <dd className="product-value">{cleanProductName(scrapedData.name)}</dd>
                    </>
                  )}
                  {formatDimensions(scrapedData.dimensions) && (
                    <>
                      <dt className="product-label">dimensions:</dt>
                      <dd className="product-value">{formatDimensions(scrapedData.dimensions)}</dd>
                    </>
                  )}
                  {formatPrice(scrapedData.price) && (
                    <>
                      <dt className="product-label">price:</dt>
                      <dd className="product-value">{formatPrice(scrapedData.price)}</dd>
                    </>
                  )}
                </dl>
              </div>
            </div>
          </div>
        ) : (
          /* Initial/Loading State - Blueprint background, centered content */
          <div className="initial-state">
            <h2>bluprint</h2>
            <div className="action-card">
              <p className="action-description">
                Preview this item at real scale in your room
              </p>
              <button 
                className="create-button" 
                onClick={handleScrapeAndCreate}
                disabled={isLoading}
              >
                {isLoading ? 'Scraping...' : 'Apply'}
              </button>
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

