const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: true
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:5173/fonts', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.click('span[title="List view"]');
  await page.waitForSelector('.fonts-cards-container:not(.grid-view) .font-card', { timeout: 5000 });
  await page.hover('.fonts-cards-container:not(.grid-view) .font-card');
  await new Promise(r => setTimeout(r, 600));

  // Add styles via evaluate
  await page.evaluate(() => {
    const card = document.querySelector('.fonts-cards-container:not(.grid-view) .font-card');
    const downloadIcon = card.querySelector('button[title="Download"] svg');
    const saveIcon = card.querySelector('button.font-card-save-btn svg');
    
    if (downloadIcon) {
      downloadIcon.style.stroke = 'currentColor';
      downloadIcon.style.strokeWidth = '1.5px';
    }
    
    if (saveIcon) {
      saveIcon.style.stroke = 'currentColor'; // ensure stroke
      saveIcon.style.strokeWidth = '2.5px'; // override Phosphor's default
    }
  });

  await new Promise(r => setTimeout(r, 200));

  // Screenshot just the buttons
  const buttonsRect = await page.evaluate(() => {
    const card = document.querySelector('.fonts-cards-container:not(.grid-view) .font-card');
    const rightSide = card.querySelector('.card-top-right');
    const rect = rightSide.getBoundingClientRect();
    return { x: rect.x - 10, y: rect.y - 10, width: rect.width + 20, height: rect.height + 20 };
  });

  await page.screenshot({ path: '/tmp/buttons_stroke.png', clip: buttonsRect });
  console.log('Saved screenshot of buttons');

  await browser.close();
})();
