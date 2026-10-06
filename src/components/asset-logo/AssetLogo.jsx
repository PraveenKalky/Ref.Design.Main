import React, { useState, useEffect } from 'react';
import { getLogoCandidateUrls, getMonogram } from '../../utils/logoPipeline';
import './AssetLogo.css';

/**
 * Robust logo component for Ref.Design.
 * Handles:
 *  - Crypto token SVGs from Cryptoicons (BTC, ETH, SOL, HYPE, etc.)
 *  - Company & exchange brand logos (Binance, Coinbase, Bybit, OKX, etc.)
 *  - Favicons via icon.horse / Google
 *  - Controlled typography monogram fallback if no image resolves
 */
export default function AssetLogo({
  symbol,
  domain,
  name,
  logoUrl,
  size = 36,
  rounded = 'full', // 'full' or 'md'
  className = '',
  alt = '',
  style = {}
}) {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const list = getLogoCandidateUrls({ logoUrl, symbol, domain, name });
    setCandidates(list);
    setCandidateIndex(0);
    setHasError(list.length === 0);
  }, [logoUrl, symbol, domain, name]);

  const handleImgError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };

  const borderRadius = rounded === 'full' ? '50%' : '8px';
  const currentSrc = candidates[candidateIndex];
  const monogram = getMonogram(name, symbol);
  const fontSize = Math.max(10, Math.floor(size * 0.36));

  return (
    <div
      className={`asset-logo-container ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        borderRadius,
        ...style
      }}
      title={alt || name || symbol || 'Asset Logo'}
    >
      {!hasError && currentSrc ? (
        <img
          src={currentSrc}
          alt={alt || `${name || symbol || 'Brand'} logo`}
          className="asset-logo-img"
          style={{ borderRadius }}
          onError={handleImgError}
          loading="lazy"
        />
      ) : (
        <div
          className="asset-logo-badge"
          style={{
            borderRadius,
            fontSize: `${fontSize}px`
          }}
        >
          {monogram}
        </div>
      )}
    </div>
  );
}
