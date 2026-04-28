import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './pagination.css';

export default function Pagination({ 
  totalPages, 
  totalItems, 
  itemsPerPage = 8, 
  currentPage, 
  onPageChange 
}) {
  const [internalCurrent, setInternalCurrent] = useState(1);
  
  // Use controlled state if provided, otherwise use internal state
  const current = currentPage !== undefined ? currentPage : internalCurrent;
  
  // Calculate total pages if totalItems is provided, fallback to totalPages prop, default to 5
  const finalTotalPages = totalItems 
    ? Math.ceil(totalItems / itemsPerPage) 
    : (totalPages || 5);

  const handlePageChange = (n) => {
    if (onPageChange) {
      onPageChange(n);
    } else {
      setInternalCurrent(n);
    }
  };

  const prev = () => handlePageChange(Math.max(1, current - 1));
  const next = () => handlePageChange(Math.min(finalTotalPages, current + 1));

  return (
    <div className="pagination-wrapper">
      <div className="pagination-label">
        PAGE {current} OF {finalTotalPages}
      </div>
      <div className="pagination">
        <button className={`pg-btn pg-prev ${current === 1 ? 'disabled' : ''}`} onClick={prev}>
          <ChevronLeft size={18} strokeWidth={2.5} /> Previous
        </button>

        <div className="pg-numbers">
          {Array.from({ length: finalTotalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              className={`pg-num ${n === current ? 'active' : ''}`}
              onClick={() => handlePageChange(n)}
            >
              {n}
            </button>
          ))}
        </div>

        <button className={`pg-btn pg-next ${current === finalTotalPages ? 'disabled' : ''}`} onClick={next}>
          Next <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
