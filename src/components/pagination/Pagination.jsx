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

  const getPaginationGroup = () => {
    const range = [];
    const showDots = finalTotalPages > 6;

    if (!showDots) {
      for (let i = 1; i <= finalTotalPages; i++) range.push(i);
      return range;
    }

    // Logic to show a specific pattern: [1, 2, 3, 4, ..., total-1, total]
    // when current page is early.
    if (current <= 4) {
      for (let i = 1; i <= 4; i++) range.push(i);
      range.push('...');
      range.push(finalTotalPages - 1);
      range.push(finalTotalPages);
    } else if (current >= finalTotalPages - 3) {
      range.push(1);
      range.push(2);
      range.push('...');
      for (let i = finalTotalPages - 3; i <= finalTotalPages; i++) range.push(i);
    } else {
      range.push(1);
      range.push('...');
      range.push(current - 1);
      range.push(current);
      range.push(current + 1);
      range.push('...');
      range.push(finalTotalPages);
    }

    return range;
  };

  const paginationGroup = getPaginationGroup();
  const startItem = totalItems > 0 ? (current - 1) * itemsPerPage + 1 : 0;
  const endItem = totalItems > 0 ? Math.min(totalItems, current * itemsPerPage) : 0;

  return (
    <div className="pagination-wrapper">
      <div className="pagination-label">
        {totalItems > 0 
          ? `Showing ${startItem}–${endItem} of ${totalItems} sections` 
          : `PAGE ${current} OF ${finalTotalPages}`}
      </div>
      <div className="pagination">
        <button 
          className={`pg-btn pg-prev ${current === 1 ? 'disabled' : ''}`} 
          onClick={prev}
          disabled={current === 1}
        >
          <ChevronLeft size={18} strokeWidth={2.5} /> Previous
        </button>

        <div className="pg-numbers">
          {paginationGroup.map((n, idx) => (
            n === '...' ? (
              <span key={`dots-${idx}`} className="pg-dots">...</span>
            ) : (
              <button
                key={n}
                className={`pg-num ${n === current ? 'active' : ''}`}
                onClick={() => handlePageChange(n)}
              >
                {n}
              </button>
            )
          ))}
        </div>

        <button 
          className={`pg-btn pg-next ${current === finalTotalPages ? 'disabled' : ''}`} 
          onClick={next}
          disabled={current === finalTotalPages}
        >
          Next <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
