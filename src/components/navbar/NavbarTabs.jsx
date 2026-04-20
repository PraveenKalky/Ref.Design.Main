import React, { useState, useRef, useLayoutEffect } from 'react';
import { Search } from 'lucide-react';

const NavbarTabs = () => {
    const [activeLink, setActiveLink] = useState('Home');
    const [pillStyle, setPillStyle] = useState({});
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

    return (
        <div className="nav-center">
            <div className="nav-links-container" ref={containerRef}>
                <div className="nav-active-pill" style={pillStyle} />
                {navLinks.map((link) => (
                    <button 
                        key={link}
                        ref={(el) => (linksRef.current[link] = el)}
                        className={`nav-link ${activeLink === link ? 'active' : ''}`}
                        onClick={() => setActiveLink(link)}
                    >
                        {link === 'Search' && <Search size={16} />}
                        {link}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default NavbarTabs;
