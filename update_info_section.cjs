const fs = require('fs');
const path = './src/pages/font-details/information-section.css';

let content = fs.readFileSync(path, 'utf8');

// Section Background & Text
content = content.replace('background-color: #000000;', 'background-color: #ffffff;');
content = content.replace(/color: #ffffff;/g, 'color: #0d0d0d;'); // Title, Text, Header, Icon, Table Value
content = content.replace('color: #0d0d0d; /* info-description-text */', 'color: #444444;'); // We'll fix description specifically
content = content.replace('.info-description-text {\n  font-size: 20px;\n  font-weight: 400;\n  line-height: 1.5;\n  color: #0d0d0d;', '.info-description-text {\n  font-size: 20px;\n  font-weight: 400;\n  line-height: 1.5;\n  color: #444444;');

// Borders
content = content.replace(/rgba\(255, 255, 255, 0\.15\)/g, 'rgba(0, 0, 0, 0.15)');
content = content.replace(/rgba\(255, 255, 255, 0\.08\)/g, 'rgba(0, 0, 0, 0.08)');

// Panel Wrapper
content = content.replace('background-color: #121212;', 'background-color: #f5f5f5;');

// Button border radius
content = content.replace('border-radius: 24px;', 'border-radius: 9999px;');
// Also remove corner-shape squircle from the button if it's there (we didn't add it in previous step because we skipped the info button, but just in case)
content = content.replace('corner-shape: squircle;\n  -webkit-corner-shape: squircle;\n', '');

fs.writeFileSync(path, content);
console.log('Updated information-section.css');
