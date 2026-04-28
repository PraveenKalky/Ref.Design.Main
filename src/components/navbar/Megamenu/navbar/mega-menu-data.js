// Mega menu data per nav item
// Each section has leftItems and rightItems arrays with { label, count }

export const megaMenuData = {
  Websites: {
    leftItems: [
      { label: 'Colourful',    count: 923 },
      { label: 'Brutalist',    count: 5   },
      { label: 'Dark',         count: 259 },
      { label: 'Fullscreen',   count: 273 },
      { label: 'Grid',         count: 647 },
      { label: 'Illustrative', count: 282 },
      { label: 'Interactive',  count: 263 },
      { label: 'Light',        count: 673 },
      { label: 'Low Carbon',   count: 3   },
      { label: 'Minimal',      count: 847 },
    ],
    rightItems: [
      { label: 'Monotone',            count: 52   },
      { label: 'Unusual Layout',      count: 663  },
      { label: 'Unusual Navigation',  count: 215  },
      { label: 'Photographic',        count: 1412 },
      { label: 'Print',               count: 3    },
      { label: 'Responsive',          count: 1106 },
      { label: 'Retro',               count: 62   },
      { label: 'Scrolling Behaviour', count: 611  },
      { label: 'Typographic',         count: 1193 },
    ],
  },

  Apps: {
    leftItems: [
      { label: 'Productivity',     count: 412 },
      { label: 'AI Tools',         count: 318 },
      { label: 'Design Tools',     count: 276 },
      { label: 'Developer Tools',  count: 194 },
      { label: 'Communication',    count: 167 },
      { label: 'Finance',          count: 98  },
      { label: 'Health',           count: 143 },
      { label: 'Education',        count: 211 },
      { label: 'Entertainment',    count: 305 },
      { label: 'Social',           count: 88  },
    ],
    rightItems: [
      { label: 'No-Code',          count: 124 },
      { label: 'Analytics',        count: 76  },
      { label: 'Marketing',        count: 139 },
      { label: 'Automation',       count: 94  },
      { label: 'Security',         count: 47  },
      { label: 'Project Mgmt',     count: 162 },
      { label: 'Shopping',         count: 201 },
      { label: 'Travel',           count: 83  },
      { label: 'Utilities',        count: 257 },
    ],
  },

  Resources: {
    leftItems: [
      { label: 'UI Kits',          count: 634 },
      { label: 'Icons',            count: 892 },
      { label: 'Illustrations',    count: 473 },
      { label: 'Templates',        count: 1204 },
      { label: 'Mockups',          count: 388 },
      { label: 'Stock Photos',     count: 2310 },
      { label: 'Color Palettes',   count: 541 },
      { label: 'Plugins',          count: 317 },
      { label: 'Code Snippets',    count: 726 },
      { label: 'Design Systems',   count: 198 },
    ],
    rightItems: [
      { label: 'Tutorials',        count: 1480 },
      { label: 'Courses',          count: 342 },
      { label: 'Books',            count: 219 },
      { label: 'Podcasts',         count: 97  },
      { label: 'Videos',           count: 863 },
      { label: 'Blogs',            count: 504 },
      { label: 'Newsletters',      count: 138 },
      { label: 'Communities',      count: 72  },
      { label: 'Checklists',       count: 156 },
    ],
  },

  Fonts: {
    leftItems: [
      { label: 'Sans-Serif',       count: 1842 },
      { label: 'Serif',            count: 1203 },
      { label: 'Display',          count: 874  },
      { label: 'Monospace',        count: 312  },
      { label: 'Handwritten',      count: 547  },
      { label: 'Script',           count: 693  },
      { label: 'Geometric',        count: 428  },
      { label: 'Humanist',         count: 376  },
      { label: 'Slab Serif',       count: 284  },
      { label: 'Condensed',        count: 196  },
    ],
    rightItems: [
      { label: 'Variable',         count: 318  },
      { label: 'Rounded',          count: 241  },
      { label: 'Wide',             count: 167  },
      { label: 'Retro',            count: 432  },
      { label: 'Futuristic',       count: 289  },
      { label: 'Decorative',       count: 514  },
      { label: 'Transitional',     count: 193  },
      { label: 'Bold & Heavy',     count: 621  },
      { label: 'Thin & Light',     count: 398  },
    ],
  },

  'UI/UX Tastes': {
    leftItems: [
      { label: 'Glassmorphism',    count: 412 },
      { label: 'Neumorphism',      count: 187 },
      { label: 'Brutalism',        count: 263 },
      { label: 'Minimalism',       count: 891 },
      { label: 'Material Design',  count: 374 },
      { label: 'Dark Mode',        count: 623 },
      { label: 'Gradients',        count: 537 },
      { label: 'Flat Design',      count: 442 },
      { label: 'Motion Design',    count: 318 },
      { label: 'Skeuomorphism',    count: 94  },
    ],
    rightItems: [
      { label: 'Micro-interactions', count: 276 },
      { label: 'Typography Focus',   count: 489 },
      { label: 'Grid Systems',       count: 213 },
      { label: 'Color Theory',       count: 347 },
      { label: 'Accessibility',      count: 184 },
      { label: 'Mobile First',       count: 562 },
      { label: 'Data Visualization', count: 298 },
      { label: 'Component Design',   count: 431 },
      { label: 'Design Systems',     count: 187 },
    ],
  },
};

// Nav items that trigger the mega menu
export const MEGA_MENU_LINKS = ['Websites', 'Apps', 'Resources', 'Fonts', 'UI/UX Tastes'];
