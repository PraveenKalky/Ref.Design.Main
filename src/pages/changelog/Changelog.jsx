import React from 'react';
import './Changelog.css';

const changelogData = [
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
