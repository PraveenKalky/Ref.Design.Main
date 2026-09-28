import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import MegaMenu from './MegaMenu';
import { megaMenuData, MEGA_MENU_LINKS } from './mega-menu-data';

const ShuffleLabel = ({ text }) => (
  <span className="nav-label">
    {[...text].map((char, index) => (
      <span
        key={`${char}-${index}`}
        className="nav-char"
        style={{ "--i": index }}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ))}
  </span>
);

const NavbarTabs = () => {
    const [activeLink, setActiveLink] = useState('Home');
    const [pillStyle, setPillStyle] = useState({});
    const [activeMenu, setActiveMenu] = useState(null);
    const hideTimer = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const navLinks = [
        { name: 'Home',        path: '/'      },
        { name: 'Websites',    path: '/websites' },
        { name: 'Apps',        path: '/'      },
        { name: 'Resources',   path: '/'      },
        { name: 'Fonts',       path: '/fonts' },
        { name: 'UI/UX Tastes',path: '/ui-tastes' },
        { name: 'Skills',      path: '/skills' },
    ];

    const containerRef = useRef(null);
    const linksRef    = useRef({});

    // Sync active pill position whenever activeLink changes, window resizes, or fonts load
    useLayoutEffect(() => {
        const updatePill = () => {
            const node = linksRef.current[activeLink];
            if (node) {
                setPillStyle({
                    left:   `${node.offsetLeft}px`,
                    width:  `${node.offsetWidth}px`,
                    height: `${node.offsetHeight}px`,
                });
            }
        };

        updatePill();

        // Fallback for when web fonts load and change text width
        if (document.fonts) {
            document.fonts.ready.then(updatePill);
        }

        const resizeObserver = new ResizeObserver(() => {
            updatePill();
        });

        const container = containerRef.current;
        if (container) {
            resizeObserver.observe(container);
        }
        
        const node = linksRef.current[activeLink];
        if (node) {
            resizeObserver.observe(node);
        }

        window.addEventListener('resize', updatePill);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updatePill);
        };
    }, [activeLink]);

    // Sync active tab with URL
    useEffect(() => {
        if (location.pathname.startsWith('/fonts')) {
            setActiveLink('Fonts');
        } else if (location.pathname === '/websites') {
            setActiveLink('Websites');
        } else if (location.pathname === '/ui-tastes') {
            setActiveLink('UI/UX Tastes');
        } else if (location.pathname === '/skills') {
            setActiveLink('Skills');
        } else if (location.pathname === '/') {
            const homeLinks = ['Home', 'Apps', 'Resources'];
            if (!homeLinks.includes(activeLink)) {
                setActiveLink('Home');
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    /* ── Mega-menu hover handlers ── */
    const handleMouseEnter = (name) => {
        clearTimeout(hideTimer.current);
        setActiveMenu(MEGA_MENU_LINKS.includes(name) ? name : null);
    };

    const handleMouseLeave = () => {
        hideTimer.current = setTimeout(() => setActiveMenu(null), 120);
    };

    const handleMegaMenuEnter = () => clearTimeout(hideTimer.current);
    const handleMegaMenuLeave = () => {
        hideTimer.current = setTimeout(() => setActiveMenu(null), 120);
    };

    /* ── Click handler — navigate + close mega menu ── */
    const handleClick = (item) => {
        setActiveLink(item.name);
        setActiveMenu(null);
        navigate(item.path);
    };

    const currentMenuData = activeMenu ? megaMenuData[activeMenu] : null;

    return (
        <div className="nav-center-wrapper">
            <div className="nav-center">
                <div className="nav-links-container" ref={containerRef}>
                    <div className="nav-active-pill" style={pillStyle} />

                    {navLinks.map((item) => {
                        // Determine active state using both path and activeLink to disambiguate shared '/' paths
                        const isPathMatch = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
                        const isActive = isPathMatch && activeLink === item.name;
                        const isHome = item.name === 'Home';

                        // Apply hover handlers only if the item is not active and not the Home item
                        const handleEnter = (!isActive && !isHome) ? () => handleMouseEnter(item.name) : undefined;
                        const handleLeave = (!isActive && !isHome) ? handleMouseLeave : undefined;

                        return (
                            <button
                                key={item.name}
                                ref={(el) => (linksRef.current[item.name] = el)}
                                className={`nav-link ${isActive ? 'active' : ''}`}
                                onClick={() => handleClick(item)}
                                onMouseEnter={handleEnter}
                                onMouseLeave={handleLeave}
                                style={{
                                    ...(isActive ? { cursor: 'default' } : {}),
                                    ...((isActive || isHome) ? { opacity: 1 } : {})
                                }}
                            >
                                {item.name === 'Search' && <Search size={16} />}
                                <ShuffleLabel text={item.name} />
                            </button>
                        );
                    })}
                </div>
            </div>

            <MegaMenu
                visible={!!activeMenu}
                leftItems={currentMenuData?.leftItems  || []}
                rightItems={currentMenuData?.rightItems || []}
                onMouseEnter={handleMegaMenuEnter}
                onMouseLeave={handleMegaMenuLeave}
            />
        </div>
    );
};

export default NavbarTabs;
