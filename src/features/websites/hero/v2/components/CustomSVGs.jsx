import React from 'react';

// Common SVG props to keep outlines thick and consistent
const SVG_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "#29256E", // Dark stroke matching our outline color
  strokeWidth: "2.5",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const SparkleIcon = ({ className }) => (
  <svg {...SVG_PROPS} className={className}>
    <path fill="#29256E" d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
  </svg>
);

export const PlayIcon = ({ className }) => (
  <svg {...SVG_PROPS} className={className}>
    <polygon fill="#29256E" points="5 3 19 12 5 21 5 3" />
  </svg>
);

export const CodeIcon = ({ className }) => (
  <svg {...SVG_PROPS} className={className}>
    <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
  </svg>
);

export const CursorIcon = ({ className }) => (
  <svg {...SVG_PROPS} className={className}>
    <path fill="#29256E" d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
  </svg>
);

export const ChartIcon = ({ className }) => (
  <svg {...SVG_PROPS} className={className}>
    <rect fill="#29256E" x="3" y="16" width="4" height="6" />
    <rect fill="#29256E" x="10" y="10" width="4" height="12" />
    <rect fill="#29256E" x="17" y="4" width="4" height="18" />
  </svg>
);

export const GridIcon = ({ className }) => (
  <svg {...SVG_PROPS} className={className}>
    <rect fill="#29256E" x="3" y="3" width="7" height="7" />
    <rect fill="#29256E" x="14" y="3" width="7" height="7" />
    <rect fill="#29256E" x="14" y="14" width="7" height="7" />
    <rect fill="#29256E" x="3" y="14" width="7" height="7" />
  </svg>
);

export const PaletteIcon = ({ className }) => (
  <svg {...SVG_PROPS} className={className}>
    <circle cx="13.5" cy="6.5" r="1.5" fill="#29256E" stroke="none" />
    <circle cx="17.5" cy="10.5" r="1.5" fill="#29256E" stroke="none" />
    <circle cx="8.5" cy="7.5" r="1.5" fill="#29256E" stroke="none" />
    <circle cx="6.5" cy="12.5" r="1.5" fill="#29256E" stroke="none" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

export const EyeIcon = ({ className }) => (
  <svg {...SVG_PROPS} className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" fill="#29256E" />
  </svg>
);

export const LayersIcon = ({ className }) => (
  <svg {...SVG_PROPS} className={className}>
    <polygon fill="#29256E" points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 12 12 17 22 12" />
    <polyline points="2 17 12 22 22 17" />
  </svg>
);

export const PenIcon = ({ className }) => (
  <svg {...SVG_PROPS} className={className}>
    <path fill="#29256E" d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
    <circle cx="11" cy="11" r="2" fill="#29256E" />
  </svg>
);
