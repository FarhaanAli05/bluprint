import React from 'react';

/**
 * Success confirmation view after adding item to storage
 */
export default function SuccessView({ onKeepShopping, onViewStorage }) {
  return (
    <div className="success-view">
      <h2 className="success-title">Success!</h2>

      <div className="success-icon">
        <svg
          width="40"
          height="40"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="32" cy="32" r="32" fill="#10b981" />
          <path
            d="M20 32l8 8 16-16"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      
      <p className="success-subtext">
        This item has been saved to your storage.
      </p>

      <div className="success-actions">
        <button
          className="success-button secondary"
          onClick={onKeepShopping}
        >
          Keep shopping
        </button>
        <button
          className="success-button primary"
          onClick={onViewStorage}
        >
          View storage
        </button>
      </div>
    </div>
  );
}
