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

      // #region agent log
      (function(){const log={location:'App.jsx:23',message:'Sending message to content script',data:{tabId:tab.id,action:'scrapeFurniture',url:tab.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'};console.log('[DEBUG]',log);fetch('http://127.0.0.1:7242/ingest/611b0b03-6cca-4656-a403-31a26cc1dd66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(log)}).catch(e=>console.warn('[DEBUG] Log send failed:',e));})();
      // #endregion
      
      // Check for chrome.runtime errors before sending
      if (chrome.runtime.lastError) {
        // #region agent log
        (function(){const log={location:'App.jsx:39',message:'Chrome runtime error before sendMessage',data:{error:chrome.runtime.lastError.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'};console.log('[DEBUG]',log);fetch('http://127.0.0.1:7242/ingest/611b0b03-6cca-4656-a403-31a26cc1dd66',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(log)}).catch(e=>console.warn('[DEBUG] Log send failed:',e));})();
        // #endregion
      }
      
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

  // Format dimensions for display
  const formatDimensions = (dims) => {
    if (!dims || (!dims.width && !dims.depth && !dims.height)) {
      return null;
    }
    const w = dims.width || '?';
    const d = dims.depth || '?';
    const h = dims.height || '?';
    return `${w} × ${d} × ${h} cm`;
  };

  // Format price for display
  const formatPrice = (price) => {
    if (!price) return null;
    return `$${parseFloat(price).toFixed(2)}`;
  };

  return (
    <div className="app-container">
      <div className="box">
        {/* Success State */}
        {isSuccess ? (
          <SuccessView
            onKeepShopping={handleKeepShopping}
            onViewStorage={handleViewStorage}
          />
        ) : scrapedData ? (
          /* Preview State */
          <div className="preview-state">
            {/* 3D Model Viewer */}
            <div className="model-viewer-container">
              <ModelViewer
                dimensions={scrapedData.dimensions}
                className="model-viewer"
              />
            </div>

            {/* Product Info - Subtle and Minimal */}
            <div className="product-info">
              {scrapedData.name && (
                <h3 className="product-name">{scrapedData.name}</h3>
              )}
              
              <div className="product-meta">
                {formatPrice(scrapedData.price) && (
                  <span className="product-price">{formatPrice(scrapedData.price)}</span>
                )}
                {formatDimensions(scrapedData.dimensions) && (
                  <span className="product-dimensions">
                    {formatDimensions(scrapedData.dimensions)}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
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
        ) : (
          /* Initial/Loading State */
          <>
            <h2>3D Model Importer</h2>
            <button 
              className="create-button" 
              onClick={handleScrapeAndCreate}
              disabled={isLoading}
            >
              {isLoading ? 'Scraping...' : 'Scrape & Import to Room'}
            </button>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;

