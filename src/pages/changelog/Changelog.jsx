import React from 'react';
import './Changelog.css';

const changelogData = [
  {
    version: '1.5.2',
    date: 'Saturday, September 12, 2026',
    description: 'Updated project rules and added new preview assets.',
    groups: [
      {
        type: 'Improvement',
        title: 'Enhancements',
        badgeClass: 'improvement',
        items: [
          'Updated project RULES.md to introduce strict UI preservation protocols to prevent accidental feature regressions.',
          'Added dummy preview image assets for mock data rendering.'
        ]
      }
    ]
  },
  {
    version: '1.5.1',
    date: 'Thursday, September 10, 2026',
    description: 'Refactored the Skills section into a modular, feature-based architecture.',
    groups: [
      {
        type: 'Improvement',
        title: 'Enhancements',
        badgeClass: 'improvement',
        items: [
          'Refactored the new Skills feature into a highly scalable, modular directory structure (src/skills).',
          'Separated components, hooks, styles, and utilities for better maintainability and code organization.'
        ]
      }
    ]
  },
  {
    version: '1.5.0',
    date: 'Wednesday, September 9, 2026',
    description: 'Launched a dedicated Skills page to track and showcase technical capabilities.',
    groups: [
      {
        type: 'New',
        title: 'Features',
        badgeClass: 'new',
        items: [
          'Added a comprehensive new Skills page to display technical expertise and capabilities.',
          'Implemented the underlying data structure and bespoke styling for the new Skills section.'
        ]
      }
    ]
  },
  {
    version: '1.4.1',
    date: 'Tuesday, September 8, 2026',
    description: 'Polished Search Overlay interactions and UI animations.',
    groups: [
      {
        type: 'Improvement',
        title: 'Enhancements',
        badgeClass: 'improvement',
        items: [
          'Added an interactive staggered letter hover animation to the Search Overlay grid items.'
        ]
      }
    ]
  },
  {
    version: '1.4.0',
    date: 'Monday, September 7, 2026',
    description: 'Introduced Admin dashboard, advanced authentication, and an animated Mega Menu navigation.',
    groups: [
      {
        type: 'New',
        title: 'Features',
        badgeClass: 'new',
        items: [
          'Integrated an Admin dashboard for platform management.',
          'Added robust Authentication components and linked them to the Supabase backend.',
          'Implemented comprehensive database schema migrations for website sections and pages.'
        ]
      },
      {
        type: 'Improvement',
        title: 'Enhancements',
        badgeClass: 'improvement',
        items: [
          'Redesigned the Navbar to feature a highly interactive animated Mega Menu with shuffle animations.',
          'Added a flexible Sections Grid component to dynamically display content categories.'
        ]
      }
    ]
  },
  {
    version: '1.3.0',
    date: 'Saturday, August 15, 2026',
    description: 'Massive backend integration, new Websites submission pipeline, and global UI enhancements.',
    groups: [
      {
        type: 'New',
        title: 'Features',
        badgeClass: 'new',
        items: [
          'Built Supabase backend integration featuring a Telegram bot, browser capture extension, and SQL seeding migrations.',
          'Added dedicated Website Detail page and a robust Submissions Grid component.',
          'Introduced a global System Banner component for site-wide announcements.'
        ]
      },
      {
        type: 'Improvement',
        title: 'Enhancements',
        badgeClass: 'improvement',
        items: [
          'Enhanced UI/UX Tastes page layout and expanded hero section configurations with new assets.',
          'Upgraded Search Overlay and Results page with refined mock data and layout adjustments.',
          'Updated Category Filters and Filter Bar logic to support dynamic categories.'
        ]
      }
    ]
  },
  {
    version: '1.2.0',
    date: 'Thursday, August 6, 2026',
    description: 'Transitioned to robust client-side routing and introduced new submission page features.',
    groups: [
      {
        type: 'New',
        title: 'Features',
        badgeClass: 'new',
        items: ['Added new features for the Websites submission page.']
      },
      {
        type: 'Improvement',
        title: 'Enhancements',
        badgeClass: 'improvement',
        items: [
          'Transitioned from BrowserRouter to HashRouter for improved routing stability on static Vercel hosts.',
          'Configured comprehensive vercel.json rewrite rules to ensure seamless SPA navigation and asset delivery.'
        ]
      }
    ]
  },
  {
    version: '1.1.2',
    date: 'Thursday, July 30, 2026',
    description: 'Removed sandbox environments and prepared for production release.',
    groups: [
      {
        type: 'Fix',
        title: 'Bug Fixes',
        badgeClass: 'fix',
        items: [
          'Removed all prototype, sandbox, and demo files to prepare for production.',
          'Restored the missing History icon in the Navbar.'
        ]
      }
    ]
  },
  {
    version: '1.1.1',
    date: 'Wednesday, July 29, 2026',
    description: 'Polished Changelog typography and layout spacing.',
    groups: [
      {
        type: 'Improvement',
        title: 'Enhancements',
        badgeClass: 'improvement',
        items: [
          'Polished Changelog typography with normalized letter spacing.',
          'Reduced vertical header spacing for better viewport balance.'
        ]
      }
    ]
  },
  {
    version: '1.1.0',
    date: 'Tuesday, July 28, 2026',
    description: 'Introduced the official Change-Log to track project history and refined the layout.',
    groups: [
      {
        type: 'New',
        title: 'Features',
        badgeClass: 'new',
        items: ['Added the official Change-Log page to track project history.']
      },
      {
        type: 'Improvement',
        title: 'Enhancements',
        badgeClass: 'improvement',
        items: [
          'Refined typography using PolySans across the Change-Log.',
          'Adjusted vertical spacing and layout constraints for better readability.'
        ]
      }
    ]
  },
  {
    version: '1.0.0',
    date: 'Monday, July 27, 2026',
    description: 'Integrated the Websites gallery and implemented automated scraping for UI/UX Tastes.',
    groups: [
      {
        type: 'New',
        title: 'Features',
        badgeClass: 'new',
        items: [
          'Integrated Websites Hero Section.',
          'Implemented real thumbnail scraping and automated migration for UI/UX Tastes.'
        ]
      },
      {
        type: 'Improvement',
        title: 'Enhancements',
        badgeClass: 'improvement',
        items: ['Refined font details layout and spacing.']
      },
      {
        type: 'Fix',
        title: 'Bug Fixes',
        badgeClass: 'fix',
        items: ['Fixed Tailwind dark mode variants in Websites hero wrapper.']
      }
    ]
  },
  {
    version: '0.9.0',
    date: 'Friday, July 24, 2026',
    description: 'Launched dedicated Font Details pages with interactive showcases and glyph previews.',
    groups: [
      {
        type: 'New',
        title: 'Features',
        badgeClass: 'new',
        items: [
          'Added dedicated Font Details page with premium hero section and routing.',
          'Integrated Specimen and Showcase sections with interactive hover-reveal sliders.',
          'Added dynamic specifications section and interactive font styles preview with hover states.'
        ]
      },
      {
        type: 'Improvement',
        title: 'Enhancements',
        badgeClass: 'improvement',
        items: ['Redesigned Glyphs UI layout, adding dynamic sizing and dotted guides.']
      },
      {
        type: 'Fix',
        title: 'Bug Fixes',
        badgeClass: 'fix',
        items: ['Resolved font card preview overflow and alignment issues.']
      }
    ]
  },
  {
    version: '0.8.0',
    date: 'Wednesday, July 22, 2026',
    description: 'Major search engine enhancements and full-screen result overlays.',
    groups: [
      {
        type: 'New',
        title: 'Features',
        badgeClass: 'new',
        items: [
          'Built dedicated Search Results page with filter tabs and semantic search.',
          'Added live suggestion dropdown with font/flow/ui matches and keyboard navigation.'
        ]
      },
      {
        type: 'Improvement',
        title: 'Enhancements',
        badgeClass: 'improvement',
        items: ['Transitioned search overlay to full-screen flat results for better visibility.']
      },
      {
        type: 'Fix',
        title: 'Bug Fixes',
        badgeClass: 'fix',
        items: ['Resolved search layout flickering and implemented smooth open/close animations.']
      }
    ]
  },
  {
    version: '0.7.0',
    date: 'Monday, July 20, 2026',
    description: 'Introduced the Font Gallery and pagination systems.',
    groups: [
      {
        type: 'New',
        title: 'Features',
        badgeClass: 'new',
        items: [
          'Implemented Font gallery with 64 font cards and global preview bar.',
          'Added pagination to Home and Fonts pages with smart dots logic.'
        ]
      },
      {
        type: 'Improvement',
        title: 'Enhancements',
        badgeClass: 'improvement',
        items: ['Redesigned Fonts page layout to use list-style preview and sidebar filters.']
      },
      {
        type: 'Fix',
        title: 'Bug Fixes',
        badgeClass: 'fix',
        items: ['Refined grid view card layout, alignment, and hover button proportions.']
      }
    ]
  },
  {
    version: '0.6.0',
    date: 'Thursday, July 16, 2026',
    description: 'Initial platform foundation and core UI component implementation.',
    groups: [
      {
        type: 'New',
        title: 'Features',
        badgeClass: 'new',
        items: [
          'Implemented full landing page foundation with Hero, Navbar, Filter Bar, and Card Grid.',
          'Added Login and Register modals with toast notifications and View Transitions animations.'
        ]
      },
      {
        type: 'Improvement',
        title: 'Enhancements',
        badgeClass: 'improvement',
        items: ['Redesigned navbar tabs to pill shape and added premium hover badges.']
      },
      {
        type: 'Fix',
        title: 'Bug Fixes',
        badgeClass: 'fix',
        items: ['Addressed dark mode active text colors and navigation pill backgrounds.']
      }
    ]
  }
];

const Changelog = () => {
  return (
    <div className="changelog-page">
      <div className="changelog-container">
        <div className="changelog-header">
          <h1>Release Notes</h1>
          <p className="changelog-subtitle">Detailed history of updates, improvements, and new features added to the design system over time.</p>
        </div>

        <div className="changelog-list">
          {changelogData.map((entry, index) => (
            <div className="changelog-entry" key={index}>
              <div className="entry-left">
                <div className="version-title">{entry.version}</div>
                <div className="date">{entry.date}</div>
              </div>
              
              <div className="entry-right">
                <div className="entry-description">{entry.description}</div>
                
                {entry.groups.map((group, gIndex) => (
                  <div className="change-group" key={gIndex}>
                    <div className="group-title">
                      {group.title}
                      <span className={`badge ${group.badgeClass}`}>{group.type}</span> 
                    </div>
                    <ul className="change-list">
                      {group.items.map((item, iIndex) => (
                        <li key={iIndex}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Changelog;
