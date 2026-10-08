import React from 'react';
import './Changelog.css';

const changelogData = [
  {
    version: '1.9.0',
    date: 'Friday, October 9, 2026',
    description: 'Introduced Standalone UI Sections, Dual-Media uploads, and AI auto-renaming.',
    groups: [
      {
        type: 'New',
        title: 'Features',
        badgeClass: 'new',
        items: [
          'Added a new taxonomy algorithm to automatically classify section categories (Hero, Footer, Navigation, etc.) directly from uploaded filenames.',
          'Implemented a Standalone UI Sections directory and routing, separating them from full website pages.',
          'Added dual-media support (Mobile + Desktop URLs) for responsive layout previews via new database migrations.'
        ]
      },
      {
        type: 'Improvement',
        title: 'Enhancements',
        badgeClass: 'improvement',
        items: [
          'Refined the Admin media uploader with an explicit toggle for Gemini AI auto-renaming of screenshots.',
          'Updated the global Navigation Tabs and Mega Menu to incorporate the new Sections architecture.',
          'Made further UI/UX enhancements to the UI Tastes Filter Bar and Hero layout.'
        ]
      },
      {
        type: 'Fix',
        title: 'Bug Fixes',
        badgeClass: 'fix',
        items: [
          'Cleaned up lingering CSS specificity issues in the Admin Page Builder and media uploader components.'
        ]
      }
    ]
  },
  {
    version: '1.8.0',
    date: 'Thursday, October 8, 2026',
    description: 'Finalized Website Directory, UI Tastes, and Admin Enhancements with powerful new filtering and feedback tools.',
    groups: [
      {
        type: 'New',
        title: 'Features',
        badgeClass: 'new',
        items: [
          'Built a comprehensive Discovery Filter Bar for UI/UX Tastes with multi-tier client-side filtering (platform, category, media type, tags, and search).',
          'Introduced a Global Toaster Notification container to the Sections Grid for immediate user feedback.'
        ]
      },
      {
        type: 'Improvement',
        title: 'Enhancements',
        badgeClass: 'improvement',
        items: [
          'Refined UI/UX Tastes Hero layout and Upload Modal styling.',
          'Extracted section action utilities into a dedicated helper module for better state management.'
        ]
      },
      {
        type: 'Fix',
        title: 'Bug Fixes',
        badgeClass: 'fix',
        items: [
          'Fixed page media upload edge cases and layout spacing in the Website Details page.',
          'Resolved grid item hover states and CSS specificity issues across the card grid.'
        ]
      }
    ]
  },
  {
    version: '1.7.0',
    date: 'Tuesday, October 6, 2026',
    description: 'Major UI/UX improvements to the Admin upload flow, Website Details, and UI Tastes submission pipelines.',
    groups: [
      {
        type: 'New',
        title: 'Features',
        badgeClass: 'new',
        items: [
          'Added a Thumbnail Crop Modal for precise image cropping and alignment during upload.',
          'Introduced a Company Combobox for smarter website/company grouping and selection.',
          'Built new Hero and Upload Modal components to streamline the UI/UX Tastes submission flow.'
        ]
      },
      {
        type: 'Improvement',
        title: 'Enhancements',
        badgeClass: 'improvement',
        items: [
          'Overhauled the Website Details layout with improved preview panels and sidebar/drawer navigation.',
          'Refined the Admin Create New Website Submission process with enhanced file upload flows.',
          'Enhanced logo and company asset handling with a new automated asset pipeline utility.',
          'Upgraded the Capture Extension Helper and toaster notifications for a smoother feedback loop.',
          'Polished full landing-page screenshots and primary thumbnail preview functionality.'
        ]
      },
      {
        type: 'Fix',
        title: 'Bug Fixes',
        badgeClass: 'fix',
        items: [
          'Resolved layout glitches in the upload preview item and detail panel components.',
          'Fixed file upload issues to ensure more reliable preview generation.'
        ]
      }
    ]
  },
  {
    version: '1.6.0',
    date: 'Tuesday, September 29, 2026',
    description: 'Consolidated major feature branches and significantly improved the Admin upload workflow and Website Details view.',
    groups: [
      {
        type: 'New',
        title: 'Features',
        badgeClass: 'new',
        items: [
          'Deployed duplicate file detection in Admin media uploaders using SHA-256 hashing to prevent duplicate uploads to Supabase.',
          'Implemented the advanced WebsitePreviewPanel component for the Website Details page.'
        ]
      },
      {
        type: 'Improvement',
        title: 'Enhancements',
        badgeClass: 'improvement',
        items: [
          'Consolidated and merged multiple feature branches including the Skills System, Website Submissions Admin, and Websites Directory Hero.',
          'Improved layout styles, missing preloader animations, and safe Supabase client initialization.'
        ]
      }
    ]
  },
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
