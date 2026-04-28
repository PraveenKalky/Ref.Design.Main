import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import MegaMenu from './MegaMenu';
import { megaMenuData, MEGA_MENU_LINKS } from './mega-menu-data';

const NavbarTabs = () => {
    const [activeLink, setActiveLink] = useState('Home');
    const [pillStyle, setPillStyle] = useState({});
    const [activeMenu, setActiveMenu] = useState(null);
    const hideTimer = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const navLinks = [
        { name: 'Home',        path: '/'      },
        { name: 'Websites',    path: '/'      },
        { name: 'Apps',        path: '/'      },
        { name: 'Resources',   path: '/'      },
        { name: 'Fonts',       path: '/fonts' },
        { name: 'UI/UX Tastes',path: '/'      },
    ];

    const containerRef = useRef(null);
    const linksRef    = useRef({});

    // Sync active pill position whenever activeLink changes
    useLayoutEffect(() => {
        const node = linksRef.current[activeLink];
        if (node) {
            setPillStyle({
                left:   `${node.offsetLeft}px`,
                width:  `${node.offsetWidth}px`,
                height: `${node.offsetHeight}px`,
            });
        }
    }, [activeLink]);

    // Sync active tab with URL
    useEffect(() => {
        if (location.pathname === '/fonts') {
            setActiveLink('Fonts');
        } else if (location.pathname === '/') {
            const homeLinks = ['Home', 'Websites', 'Apps', 'Resources', 'UI/UX Tastes'];
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
        <>
            <div className="nav-center">
                <div className="nav-links-container" ref={containerRef}>
                    <div className="nav-active-pill" style={pillStyle} />

                    {navLinks.map((item) => {
                        // Determine active state using both path and activeLink to disambiguate shared '/' paths
                        const isActive = (location.pathname === item.path && activeLink === item.name);
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
                                {item.name}
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
        </>
    );
};

export default NavbarTabs;
