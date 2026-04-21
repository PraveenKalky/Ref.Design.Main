import React, { useState, useRef, useLayoutEffect } from 'react';
import { Search } from 'lucide-react';
import MegaMenu from './MegaMenu';
import { megaMenuData, MEGA_MENU_LINKS } from './mega-menu-data';

const NavbarTabs = () => {
    const [activeLink, setActiveLink] = useState('Home');
    const [pillStyle, setPillStyle] = useState({});
    const [activeMenu, setActiveMenu] = useState(null); // which nav link's menu is open
    const hideTimer = useRef(null);

    const navLinks = ['Home', 'Websites', 'Apps', 'Resources', 'Fonts', 'UI/UX Tastes'];
    const containerRef = useRef(null);
    const linksRef = useRef({});

    useLayoutEffect(() => {
        const activeNode = linksRef.current[activeLink];
        if (activeNode) {
            const { offsetLeft, offsetWidth } = activeNode;
            setPillStyle({
                left: `${offsetLeft}px`,
                width: `${offsetWidth}px`,
                height: `${activeNode.offsetHeight}px`
            });
        }
    }, [activeLink]);

    const handleMouseEnter = (link) => {
        clearTimeout(hideTimer.current);
        if (MEGA_MENU_LINKS.includes(link)) {
            setActiveMenu(link);
        } else {
            setActiveMenu(null);
        }
    };

    const handleMouseLeave = () => {
        hideTimer.current = setTimeout(() => setActiveMenu(null), 120);
    };

    const handleMegaMenuEnter = () => {
        clearTimeout(hideTimer.current);
    };

    const handleMegaMenuLeave = () => {
        hideTimer.current = setTimeout(() => setActiveMenu(null), 120);
    };

    const currentMenuData = activeMenu ? megaMenuData[activeMenu] : null;

    return (
        <>
            <div className="nav-center">
                <div className="nav-links-container" ref={containerRef}>
                    <div className="nav-active-pill" style={pillStyle} />
                    {navLinks.map((link) => (
                        <button
                            key={link}
                            ref={(el) => (linksRef.current[link] = el)}
                            className={`nav-link ${activeLink === link ? 'active' : ''}`}
                            onClick={() => setActiveLink(link)}
                            onMouseEnter={() => handleMouseEnter(link)}
                            onMouseLeave={handleMouseLeave}
                        >
                            {link === 'Search' && <Search size={16} />}
                            {link}
                        </button>
                    ))}
                </div>
            </div>

            {/* Single MegaMenu instance — swaps data based on hovered link */}
            <MegaMenu
                visible={!!activeMenu}
                leftItems={currentMenuData?.leftItems || []}
                rightItems={currentMenuData?.rightItems || []}
                onMouseEnter={handleMegaMenuEnter}
                onMouseLeave={handleMegaMenuLeave}
            />
        </>
    );
};

export default NavbarTabs;
