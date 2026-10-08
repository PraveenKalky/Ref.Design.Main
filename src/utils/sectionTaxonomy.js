/**
 * Ref.Design — Smart Section Taxonomy & Classification
 * Extracts clean display titles 1:1 from filenames while separately deriving
 * structured primary categories and multi-discovery tags.
 */

// Canonical Primary Categories (covers Crypto, Fintech, SaaS, E-commerce, etc.)
export const PRIMARY_CATEGORIES = [
  'Deposit',
  'Withdraw',
  'Trading',
  'Order Book',
  'Wallet',
  'Hero',
  'Navigation',
  'Features',
  'Pricing',
  'Testimonials',
  'CTA',
  'FAQ',
  'Footer',
  'Dashboard',
  'Sign In',
  'Sign Up',
  'Bento Grid',
  'Integrations',
  'Analytics',
  'Settings',
  'Profile',
  'Checkout',
  'Cart',
  'Blog',
  'Contact',
  'About',
  'Stats',
  'Other'
];

// Mapping keywords (lowercase) to primary category
const CATEGORY_RULES = [
  { keywords: ['deposit', 'deposite'], category: 'Deposit' },
  { keywords: ['withdraw', 'withdrawal'], category: 'Withdraw' },
  { keywords: ['order book', 'orderbook', 'order-book'], category: 'Order Book' },
  { keywords: ['trade', 'trading', 'exchange', 'swap'], category: 'Trading' },
  { keywords: ['wallet', 'payout', 'balance'], category: 'Wallet' },
  { keywords: ['hero', 'banner', 'header banner'], category: 'Hero' },
  { keywords: ['nav', 'navbar', 'header', 'menu', 'sidebar'], category: 'Navigation' },
  { keywords: ['feature', 'features', 'capability', 'capabilities'], category: 'Features' },
  { keywords: ['pricing', 'price', 'plan', 'tier', 'subscription'], category: 'Pricing' },
  { keywords: ['testimonial', 'testimonials', 'review', 'reviews', 'quote'], category: 'Testimonials' },
  { keywords: ['cta', 'call to action', 'get started'], category: 'CTA' },
  { keywords: ['faq', 'faqs', 'question', 'help'], category: 'FAQ' },
  { keywords: ['footer', 'bottom bar'], category: 'Footer' },
  { keywords: ['dashboard', 'overview', 'admin'], category: 'Dashboard' },
  { keywords: ['sign in', 'signin', 'login', 'log in'], category: 'Sign In' },
  { keywords: ['sign up', 'signup', 'register', 'onboard'], category: 'Sign Up' },
  { keywords: ['bento', 'bento grid', 'grid layout'], category: 'Bento Grid' },
  { keywords: ['integration', 'integrations', 'api docs'], category: 'Integrations' },
  { keywords: ['analytic', 'analytics', 'chart', 'metrics'], category: 'Analytics' },
  { keywords: ['setting', 'settings', 'preference'], category: 'Settings' },
  { keywords: ['profile', 'account', 'user'], category: 'Profile' },
  { keywords: ['checkout', 'payment', 'pay'], category: 'Checkout' },
  { keywords: ['cart', 'basket'], category: 'Cart' },
  { keywords: ['blog', 'article', 'post', 'news'], category: 'Blog' },
  { keywords: ['contact', 'inquiry', 'reach us'], category: 'Contact' },
  { keywords: ['about', 'story', 'team'], category: 'About' },
  { keywords: ['stat', 'stats', 'numbers'], category: 'Stats' },
];

// Secondary component and variant tags
const TAG_RULES = [
  { keywords: ['asset dropdown', 'asset-dropdown', 'select crypto'], tag: 'Asset Dropdown' },
  { keywords: ['network dropdown', 'network-dropdown', 'select network'], tag: 'Network Dropdown' },
  { keywords: ['dropdown', 'select', 'picker'], tag: 'Dropdown' },
  { keywords: ['modal', 'dialog', 'popup'], tag: 'Modal' },
  { keywords: ['address', 'wallet address'], tag: 'Address' },
  { keywords: ['qr', 'qrcode', 'qr-code'], tag: 'QR Code' },
  { keywords: ['crypto', 'bitcoin', 'eth', 'token'], tag: 'Crypto' },
  { keywords: ['spot', 'futures', 'perpetual'], tag: 'Trading Mode' },
  { keywords: ['table', 'tabular'], tag: 'Table' },
  { keywords: ['form', 'input'], tag: 'Form' },
  { keywords: ['animation', 'animated'], tag: 'Animation' },
  { keywords: ['mobile', 'responsive'], tag: 'Mobile' },
  { keywords: ['dark', 'darkmode'], tag: 'Dark Mode' },
  { keywords: ['light', 'lightmode'], tag: 'Light Mode' },
];

/**
 * Strips only trailing extension (e.g. .png, .jpg) preserving exact casing and spelling
 */
export const extractDisplayTitle = (filename) => {
  if (!filename || typeof filename !== 'string') return 'Uploaded Media';
  const clean = filename.replace(/\.[^/.]+$/, '').trim();
  return clean || filename || 'Uploaded Media';
};

/**
 * Classifies a section filename into a primary category and relevant discovery tags
 */
export const classifySection = (filename, aiCategory = null) => {
  const title = extractDisplayTitle(filename);
  const lowerName = filename.toLowerCase();

  // 1. Detect Primary Category from filename keywords
  let primaryCategory = null;
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => lowerName.includes(kw))) {
      primaryCategory = rule.category;
      break;
    }
  }

  // Fallback to AI category if filename had no matching rule
  if (!primaryCategory) {
    if (aiCategory && typeof aiCategory === 'string' && aiCategory.trim()) {
      primaryCategory = aiCategory.trim();
    } else {
      primaryCategory = 'Other';
    }
  }

  // 2. Detect Secondary Tags
  const detectedTags = new Set();
  for (const tagRule of TAG_RULES) {
    if (tagRule.keywords.some(kw => lowerName.includes(kw))) {
      detectedTags.add(tagRule.tag);
    }
  }

  // If primaryCategory is different from tags, also include primary category as a searchable tag
  if (primaryCategory && primaryCategory !== 'Other') {
    detectedTags.add(primaryCategory);
  }

  return {
    title,
    category: primaryCategory,
    tags: Array.from(detectedTags)
  };
};
