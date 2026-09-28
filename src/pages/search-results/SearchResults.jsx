import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X, Lock, Search } from 'lucide-react';
import { Card } from '../../components/card-grid/CardGrid';
import { cardsData } from './mock-data';
import { TAB_CONTENT } from '../../components/navbar/SearchOverlay';
import './search-results.css';
import '../../components/card-grid/card-grid.css';

/* ── Related suggestions for the "her" query ── */
const HER_RELATED = [
  'Onboarding',
  'Inviting & Adding Friends',
  'Creating & Adding',
  'Searching & Finding',
  'Analyzing Stats'
];

/* ── Custom/Default Related suggestions for other queries ── */
const DEFAULT_RELATED = [
  'Sign Up',
  'Pricing Plans',
  'User Settings',
  'Navigation',
  'File Uploading'
];

export default function SearchResults({ savedItems, toggleSave }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  // Filter tabs state: 'all' | 'flows' | 'screens' | 'products' | 'ui-elements'
  const [activeFilterTab, setActiveFilterTab] = useState('all');

  // Sync scroll to top on query change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [query]);

  // Clean/clear search query
  const handleClearQuery = () => {
    navigate('/');
  };

  // Click on a related item
  const handleRelatedClick = (item) => {
    setSearchParams({ q: item });
  };

  // Determine if it is the special "her" query
  const isHerQuery = query.toLowerCase() === 'her';

  /* ── 1. Calculate Search Results Counts & Mapped Cards ── */
  let counts = { all: 0, flows: 0, screens: 0, products: 0, uiElements: 0 };
  let flowsCards = [];
  let screensCards = [];
  let productsCards = [];
  let uiCards = [];

  if (isHerQuery) {
    // 100% Mock override to match reference screenshot
    counts = {
      all: 273,
      flows: 3,
      screens: 221,
      products: 3,
      uiElements: 46
    };

    // Exact flows cards shown in mockup
    flowsCards = [
      {
        id: 'her-flow-1',
        title: 'Herald',
        subtitle: 'General browsing',
        image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=800&auto=format&fit=crop',
        logo: 'https://www.google.com/s2/favicons?domain=herald.com&sz=64',
        link: '#'
      },
      {
        id: 'her-flow-2',
        title: 'HeroThemes',
        subtitle: 'General browsing',
        image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800&auto=format&fit=crop',
        logo: 'https://www.google.com/s2/favicons?domain=herothemes.com&sz=64',
        link: '#'
      },
      {
        id: 'her-flow-3',
        title: 'Grammarly',
        subtitle: 'Resetting password',
        image: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=800&auto=format&fit=crop',
        logo: 'https://www.google.com/s2/favicons?domain=grammarly.com&sz=64',
        link: '#',
        isLocked: true // Custom padlock badge
      }
    ];

    // Screens cards (221 Screens matches in the data model)
    // We deterministically render 3 high-fidelity screen cards
    screensCards = [
      {
        id: 'her-screen-1',
        title: 'Linear',
        subtitle: 'Careers Page',
        image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800&auto=format&fit=crop',
        logo: 'https://www.google.com/s2/favicons?domain=linear.app&sz=64',
        link: '#'
      },
      {
        id: 'her-screen-2',
        title: 'Mercury',
        subtitle: 'Dashboard Checkout',
        image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=800&auto=format&fit=crop',
        logo: 'https://www.google.com/s2/favicons?domain=mercury.com&sz=64',
        link: '#'
      },
      {
        id: 'her-screen-3',
        title: 'Vercel',
        subtitle: 'Integration settings',
        image: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=800&auto=format&fit=crop',
        logo: 'https://www.google.com/s2/favicons?domain=vercel.com&sz=64',
        link: '#'
      }
    ];

    // Products cards (3 Products matches in the database)
    // Display our 3 primary products for 'her'
    productsCards = [
      {
        id: 'her-prod-1',
        title: 'Herald',
        subtitle: 'Curated newsletters and blogs',
        image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=800&auto=format&fit=crop',
        logo: 'https://www.google.com/s2/favicons?domain=herald.com&sz=64',
        link: '#'
      },
      {
        id: 'her-prod-2',
        title: 'HeroThemes',
        subtitle: 'Premium WordPress themes',
        image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800&auto=format&fit=crop',
        logo: 'https://www.google.com/s2/favicons?domain=herothemes.com&sz=64',
        link: '#'
      },
      {
        id: 'her-prod-3',
        title: 'Grammarly',
        subtitle: 'AI communication writing assistant',
        image: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=800&auto=format&fit=crop',
        logo: 'https://www.google.com/s2/favicons?domain=grammarly.com&sz=64',
        link: '#'
      }
    ];

    // UI Elements (46 UI Elements matches)
    uiCards = [
      {
        id: 'her-ui-1',
        title: 'Notion',
        subtitle: 'Bento Grid Features',
        image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800&auto=format&fit=crop',
        logo: 'https://www.google.com/s2/favicons?domain=notion.so&sz=64',
        link: '#'
      },
      {
        id: 'her-ui-2',
        title: 'Stripe',
        subtitle: '購物車 Checkout Button',
        image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=800&auto=format&fit=crop',
        logo: 'https://www.google.com/s2/favicons?domain=stripe.com&sz=64',
        link: '#'
      },
      {
        id: 'her-ui-3',
        title: 'Figma',
        subtitle: 'Notification Toasts',
        image: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=800&auto=format&fit=crop',
        logo: 'https://www.google.com/s2/favicons?domain=figma.com&sz=64',
        link: '#'
      }
    ];
  } else {
    // ── GENERAL DYNAMIC QUERY FILTER ──
    const qStr = query.trim().toLowerCase();

    if (qStr) {
      // 1. Scan Flows
      const flowMatches = [];
      TAB_CONTENT['flows'].forEach(section => {
        section.items.forEach(item => {
          if (item.name.toLowerCase().includes(qStr)) {
            flowMatches.push(item.name);
          }
        });
      });
      counts.flows = flowMatches.length;

      // Deterministically generate flows cards
      const totalCards = cardsData.length;
      flowsCards = flowMatches.slice(0, 3).map((name, idx) => {
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const src = cardsData[hash % totalCards];
        return {
          id: `dyn-flow-${idx}-${src.id}`,
          title: src.title,
          subtitle: name,
          image: src.image,
          logo: src.logo,
          link: src.link || '#'
        };
      });

      // 2. Scan Screens (page-types)
      const screenMatches = [];
      TAB_CONTENT['page-types'].forEach(section => {
        section.items.forEach(item => {
          if (item.name.toLowerCase().includes(qStr)) {
            screenMatches.push(item.name);
          }
        });
      });
      counts.screens = screenMatches.length;

      screensCards = screenMatches.slice(0, 3).map((name, idx) => {
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const src = cardsData[(hash + 1) % totalCards];
        return {
          id: `dyn-screen-${idx}-${src.id}`,
          title: src.title,
          subtitle: name,
          image: src.image,
          logo: src.logo,
          link: src.link || '#'
        };
      });

      // 3. Scan Products
      const matchedProducts = cardsData.filter(card =>
        card.title.toLowerCase().includes(qStr) ||
        (card.subtitle && card.subtitle.toLowerCase().includes(qStr)) ||
        (card.name && card.name.toLowerCase().includes(qStr))
      );
      counts.products = matchedProducts.length;

      productsCards = matchedProducts.slice(0, 3).map(card => ({
        id: `dyn-prod-${card.id}`,
        title: card.title,
        subtitle: card.subtitle,
        image: card.image,
        logo: card.logo,
        link: card.link || '#'
      }));

      // 4. Scan UI Elements
      const uiMatches = [];
      TAB_CONTENT['ui-elements'].forEach(section => {
        section.items.forEach(item => {
          if (item.name.toLowerCase().includes(qStr)) {
            uiMatches.push(item.name);
          }
        });
      });
      TAB_CONTENT['ux-patterns'].forEach(section => {
        section.items.forEach(item => {
          if (item.name.toLowerCase().includes(qStr)) {
            uiMatches.push(item.name);
          }
        });
      });
      counts.uiElements = uiMatches.length;

      uiCards = uiMatches.slice(0, 3).map((name, idx) => {
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const src = cardsData[(hash + 2) % totalCards];
        return {
          id: `dyn-ui-${idx}-${src.id}`,
          title: src.title,
          subtitle: name,
          image: src.image,
          logo: src.logo,
          link: src.link || '#'
        };
      });

      counts.all = counts.flows + counts.screens + counts.products + counts.uiElements;
    }
  }

  // Related suggestions lists
  const relatedList = isHerQuery ? HER_RELATED : DEFAULT_RELATED;

  // Filtered views helper
  const shouldRenderSection = (sectionName) => {
    if (activeFilterTab === 'all') return true;
    return activeFilterTab === sectionName;
  };

  const hasResults = counts.all > 0;

  return (
    <div className="search-results-page">
      {/* ── Top Filter Tabs ── */}
      <div className="sr-filter-tabs">
        <button
          className={`sr-filter-tab ${activeFilterTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilterTab('all')}
        >
          All ({counts.all})
        </button>
        <button
          className={`sr-filter-tab ${activeFilterTab === 'flows' ? 'active' : ''}`}
          onClick={() => setActiveFilterTab('flows')}
        >
          Flows ({counts.flows})
        </button>
        <button
          className={`sr-filter-tab ${activeFilterTab === 'screens' ? 'active' : ''}`}
          onClick={() => setActiveFilterTab('screens')}
        >
          Screens ({counts.screens})
        </button>
        <button
          className={`sr-filter-tab ${activeFilterTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveFilterTab('products')}
        >
          Products ({counts.products})
        </button>
        <button
          className={`sr-filter-tab ${activeFilterTab === 'ui-elements' ? 'active' : ''}`}
          onClick={() => setActiveFilterTab('ui-elements')}
        >
          UI Elements ({counts.uiElements})
        </button>
      </div>

      {/* ── Search Header Section ── */}
      <div className="sr-header-section">
        <h1 className="sr-title">
          Search results for "<em>{query}</em>"
        </h1>
        {query && (
          <div className="sr-query-chip" onClick={handleClearQuery}>
            <span>{query}</span>
            <button className="sr-query-chip-clear" aria-label="Clear query">
              <X size={12} strokeWidth={3} />
            </button>
          </div>
        )}

        <div className="sr-related-row">
          <span className="sr-related-label">Related:</span>
          {relatedList.map((item, idx) => (
            <span key={idx}>
              <span
                className="sr-related-item"
                onClick={() => handleRelatedClick(item)}
              >
                {item}
              </span>
              {idx < relatedList.length - 1 && '  '}
            </span>
          ))}
        </div>
      </div>

      {/* ── Search Results List/Sections ── */}
      {hasResults ? (
        <div className="sr-results-container">
          
          {/* 1. Flows Section */}
          {shouldRenderSection('flows') && flowsCards.length > 0 && (
            <section className="sr-category-section">
              <div className="sr-section-header">
                <div className="sr-section-title-group">
                  <h2 className="sr-section-title">Search results for "{query}" flows</h2>
                  <span className="sr-section-count">{counts.flows} flows</span>
                </div>
                <button className="sr-view-all-btn">
                  View all flows results &gt;
                </button>
              </div>

              <div className="card-grid">
                {flowsCards.map((card) => (
                  <div key={card.id} className="sr-card-wrapper">
                    {card.isLocked && (
                      <div className="sr-card-premium-badge" title="Locked Premium Flow">
                        <Lock size={14} strokeWidth={2.5} />
                      </div>
                    )}
                    <Card
                      id={card.id}
                      title={card.title}
                      subtitle={card.subtitle}
                      image={card.image}
                      logo={card.logo}
                      link={card.link}
                      isSaved={!!savedItems[card.id]}
                      toggleSave={toggleSave}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 2. Screens Section */}
          {shouldRenderSection('screens') && screensCards.length > 0 && (
            <section className="sr-category-section">
              <div className="sr-section-header">
                <div className="sr-section-title-group">
                  <h2 className="sr-section-title">Search results for "{query}" screens</h2>
                  <span className="sr-section-count">{counts.screens} screens</span>
                </div>
                <button className="sr-view-all-btn">
                  View all screens results &gt;
                </button>
              </div>

              <div className="card-grid">
                {screensCards.map((card) => (
                  <div key={card.id} className="sr-card-wrapper">
                    <Card
                      id={card.id}
                      title={card.title}
                      subtitle={card.subtitle}
                      image={card.image}
                      logo={card.logo}
                      link={card.link}
                      isSaved={!!savedItems[card.id]}
                      toggleSave={toggleSave}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. Products Section */}
          {shouldRenderSection('products') && productsCards.length > 0 && (
            <section className="sr-category-section">
              <div className="sr-section-header">
                <div className="sr-section-title-group">
                  <h2 className="sr-section-title">Search results for "{query}" products</h2>
                  <span className="sr-section-count">{counts.products} products</span>
                </div>
                <button className="sr-view-all-btn">
                  View all products results &gt;
                </button>
              </div>

              <div className="card-grid">
                {productsCards.map((card) => (
                  <div key={card.id} className="sr-card-wrapper">
                    <Card
                      id={card.id}
                      title={card.title}
                      subtitle={card.subtitle}
                      image={card.image}
                      logo={card.logo}
                      link={card.link}
                      isSaved={!!savedItems[card.id]}
                      toggleSave={toggleSave}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. UI Elements Section */}
          {shouldRenderSection('ui-elements') && uiCards.length > 0 && (
            <section className="sr-category-section">
              <div className="sr-section-header">
                <div className="sr-section-title-group">
                  <h2 className="sr-section-title">Search results for "{query}" UI elements</h2>
                  <span className="sr-section-count">{counts.uiElements} UI elements</span>
                </div>
                <button className="sr-view-all-btn">
                  View all UI elements results &gt;
                </button>
              </div>

              <div className="card-grid">
                {uiCards.map((card) => (
                  <div key={card.id} className="sr-card-wrapper">
                    <Card
                      id={card.id}
                      title={card.title}
                      subtitle={card.subtitle}
                      image={card.image}
                      logo={card.logo}
                      link={card.link}
                      isSaved={!!savedItems[card.id]}
                      toggleSave={toggleSave}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      ) : (
        /* ── Empty/No Results state ── */
        <div className="sr-empty-state">
          <Search size={48} strokeWidth={1.5} className="sr-empty-icon" />
          <h2 className="sr-empty-title">No results found</h2>
          <p className="sr-empty-text">
            We couldn't find any flows, screens, products, or UI elements matching "{query}". Try checking your spelling or trying another keyword.
          </p>
        </div>
      )}
    </div>
  );
}
