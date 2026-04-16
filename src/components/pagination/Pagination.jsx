import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './pagination.css';

export default function Pagination({ totalPages = 5 }) {
  const [current, setCurrent] = useState(1);

  const prev = () => setCurrent(p => Math.max(1, p - 1));
  const next = () => setCurrent(p => Math.min(totalPages, p + 1));

  return (
    <div className="pagination-wrapper">
      <div className="pagination-label">
        PAGE {current} OF {totalPages}
      </div>
      <div className="pagination">
        <button className={`pg-btn pg-prev ${current === 1 ? 'disabled' : ''}`} onClick={prev}>
          <ChevronLeft size={18} strokeWidth={2.5} /> Previous
        </button>

        <div className="pg-numbers">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              className={`pg-num ${n === current ? 'active' : ''}`}
              onClick={() => setCurrent(n)}
            >
              {n}
            </button>
          ))}
        </div>

        <button className={`pg-btn pg-next ${current === totalPages ? 'disabled' : ''}`} onClick={next}>
          Next <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
