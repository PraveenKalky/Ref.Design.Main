import React from 'react';

const FooterLinks = () => {
  const sections = [
    {
      title: 'Explore',
      links: ['Design Flows', 'UI Components', 'Design Systems', 'Atomic Styles']
    },
    {
      title: 'Platform',
      links: ['Pricing', 'API Access', 'Integrations', 'Changelog']
    },
    {
      title: 'Legal',
      links: ['Terms', 'Privacy', 'Copyright', 'Licensing']
    }
  ];

  return (
    <>
      {sections.map((section) => (
        <div key={section.title} className="footer-column">
          <h4 className="footer-column-title">{section.title}</h4>
          <nav className="footer-links">
            {section.links.map((link) => (
              <a key={link} href="#" className="footer-link">{link}</a>
            ))}
          </nav>
        </div>
      ))}
    </>
  );
};

export default FooterLinks;
