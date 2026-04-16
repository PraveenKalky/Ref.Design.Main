import React, { useEffect, useRef } from 'react';
import './footer.css';

export default function Footer() {
  const containerRef = useRef(null);
  const wordmarkRef = useRef(null);

  useEffect(() => {
    const el = wordmarkRef.current;
    if (!el) return;
    const parent = el.parentElement;

    const fit = () => {
      const available = parent.clientWidth - 48; // 24px padding each side
      el.style.fontSize = '10px';
      let low = 10, high = 800, mid;
      while (low <= high) {
        mid = Math.floor((low + high) / 2);
        el.style.fontSize = mid + 'px';
        if (el.scrollWidth <= available) {
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      el.style.fontSize = high + 'px';
    };

    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(parent);

    // Also handle font loading
    if (document.fonts) {
      document.fonts.ready.then(fit);
    }

    fit();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <nav className="footer-links-left">
          <a href="#">Twitter / X</a>
          <a href="#">Instagram</a>
          <a href="#">Figma</a>
        </nav>
        <nav className="footer-links-right">
          <a href="#">About</a>
          <a href="#">Submit</a>
          <a href="#">Privacy</a>
        </nav>
      </div>
      <div className="footer-big-text-wrap" ref={containerRef}>
        <span className="footer-big-text" aria-hidden="true" ref={wordmarkRef}>
          Ref.Design
        </span>
      </div>
    </footer>
  );
}
