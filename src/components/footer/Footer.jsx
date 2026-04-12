import React from 'react';
import FooterBrand from './FooterBrand';
import FooterLinks from './FooterLinks';
import { Twitter, Github, Linkedin } from 'lucide-react';
import './footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <FooterBrand />
        <FooterLinks />
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 Ref.Design. All rights reserved.</p>
        <div className="footer-socials">
          <a href="#" className="footer-link"><Twitter size={20} /></a>
          <a href="#" className="footer-link"><Github size={20} /></a>
          <a href="#" className="footer-link"><Linkedin size={20} /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
