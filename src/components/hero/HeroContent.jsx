import React, { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
// import StatsBar from '../archive/StatsBar'; // ARCHIVED

const HeroContent = () => {
    useEffect(() => {
        let ctx = gsap.context(() => {
            const tl = gsap.timeline();
            tl.to("#revealEyebrow", { translateY: "0%", duration: 0.5, ease: "power2.out" })
              .to("#revealHeadline", { translateY: "0%", duration: 0.8, ease: "power4.out" }, "-=0.3")
              .to("#revealDesc", { opacity: 1, duration: 0.6 }, "-=0.2");
        });
        return () => ctx.revert(); // Cleanup for React 18 strict mode
    }, []);

    return (
        <div className="hero-content">
            <span className="hero-mask">
                <div className="hero-pill" id="revealEyebrow">
                    <span>Flows. Screens. Inspiration. All in one place.</span>
                </div>
            </span>

            <span className="hero-mask">
                <h1 id="revealHeadline">A Curated Museum of Digital Product Design.</h1>
            </span>

            <p className="hero-description" id="revealDesc">
                Design Vault is Praveen G's personal inspiration platform for designers and developers.
                Browse UI flows, websites, dashboards, apps, Figma references and font resources
                without pricing walls or gated access.
            </p>

            <div className="hero-actions">
                <a href="#vault" className="hero-primary-btn">
                    Browse curated references
                    <ArrowRight size={20} className="arrow-icon" />
                </a>
                <a href="#creator" className="hero-secondary-btn">
                    Built by a designer, for designers
                </a>
            </div>

            {/* ARCHIVED - StatsBar hidden for now, restore when needed
      <div className="hero-stats">
        <span>240+ Flows</span>
        <span className="separator">·</span>
        <span>180+ Websites</span>
        <span className="separator">·</span>
        <span>90+ Apps</span>
        <span className="separator">·</span>
        <span>60+ Font Links</span>
        <span className="separator">·</span>
        <span>60+ Components</span>
      </div>
      */}

            {/* ARCHIVED - StatsBar hidden for now, restore when needed
  <StatsBar />
*/}
        </div>
    );
};

export default HeroContent;
