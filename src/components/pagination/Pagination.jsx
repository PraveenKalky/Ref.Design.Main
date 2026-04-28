import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './pagination.css';

export default function Pagination({ currentPage = 1, totalPages = 5, onPageChange }) {
  const prev = () => onPageChange(Math.max(1, currentPage - 1));
  const next = () => onPageChange(Math.min(totalPages, currentPage + 1));

  if (totalPages <= 1) return null;

  return (
    <div className="pagination-wrapper">
      <div className="pagination-label">
        PAGE {currentPage} OF {totalPages}
      </div>
      <div className="pagination">
        <button 
          className={`pg-btn pg-prev ${currentPage === 1 ? 'disabled' : ''}`} 
          onClick={prev}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={18} strokeWidth={2.5} /> Previous
        </button>

        <div className="pg-numbers">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              className={`pg-num ${n === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(n)}
            >
              {n}
            </button>
          ))}
        </div>

        <button 
          className={`pg-btn pg-next ${currentPage === totalPages ? 'disabled' : ''}`} 
          onClick={next}
          disabled={currentPage === totalPages}
        >
          Next <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

