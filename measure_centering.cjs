const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: true
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:5173/fonts', { waitUntil: 'networkidle2' });
  // Wait for fonts to load
  await new Promise(r => setTimeout(r, 3000));
  
  // Switch to list view
  await page.click('span[title="List view"]');
  await page.waitForSelector('.fonts-cards-container:not(.grid-view) .font-card', { timeout: 5000 });
  
  // Hover over the first card to reveal the controls
  await page.hover('.fonts-cards-container:not(.grid-view) .font-card');
  await new Promise(r => setTimeout(r, 600));

  const metrics = await page.evaluate(() => {
    const card = document.querySelector('.fonts-cards-container:not(.grid-view) .font-card');
    if (!card) return { error: 'Card not found' };

    const fchcBar = card.querySelector('.fchc-bar');
    if (!fchcBar) return { error: '.fchc-bar not found' };

    const firstPill = card.querySelector('.fchc-select'); // "Thin" dropdown
    const otherPills = card.querySelectorAll('.fchc-control'); // Size, Leading, Spacing

    if (!firstPill || otherPills.length < 3) return { error: 'Controls not found' };

    const barRect = fchcBar.getBoundingClientRect();
    const firstPillRect = firstPill.getBoundingClientRect();
    const lastPillRect = otherPills[otherPills.length - 1].getBoundingClientRect();

    const leftPadding = firstPillRect.left - barRect.left;
    const rightPadding = barRect.right - lastPillRect.right;
    const groupWidth = lastPillRect.right - firstPillRect.left;
    const groupCenter = firstPillRect.left + (groupWidth / 2);
    const barCenter = barRect.left + (barRect.width / 2);
    const centerOffset = groupCenter - barCenter;

    const barStyle = window.getComputedStyle(fchcBar);
    const firstPillStyle = window.getComputedStyle(firstPill);
    const lastPillStyle = window.getComputedStyle(otherPills[otherPills.length - 1]);

    return {
      bar: {
        width: barRect.width,
        left: barRect.left,
        right: barRect.right,
        center: barCenter,
        display: barStyle.display,
        justifyContent: barStyle.justifyContent,
        gap: barStyle.gap,
        paddingLeft: barStyle.paddingLeft,
        paddingRight: barStyle.paddingRight
      },
      group: {
        width: groupWidth,
        center: groupCenter,
        offsetFromCenter: centerOffset
      },
      padding: {
        left: leftPadding,
        right: rightPadding,
        difference: Math.abs(leftPadding - rightPadding)
      },
      firstPillMarginLeft: firstPillStyle.marginLeft,
      lastPillMarginRight: lastPillStyle.marginRight
    };
  });

  console.log(JSON.stringify(metrics, null, 2));

  await browser.close();
})();
