import { supabase } from '../lib/supabase';

// Map of common token tickers/symbols & domain aliases
export const CRYPTO_ALIASES = {
  'bitcoin': 'btc',
  'ethereum': 'eth',
  'solana': 'sol',
  'binance': 'bnb',
  'uniswap': 'uni',
  'aave': 'aave',
  'hyperliquid': 'hype',
  'sui': 'sui',
  'aptos': 'apt',
  'arbitrum': 'arb',
  'optimism': 'op',
  'polygon': 'matic',
  'avalanche': 'avax',
  'base': 'base',
  'trustwallet': 'twt',
};

// Known domain-to-token ticker mappings
export const DOMAIN_TO_CRYPTO_SYMBOL = {
  'solana.com': 'sol',
  'ethereum.org': 'eth',
  'bitcoin.org': 'btc',
  'uniswap.org': 'uni',
  'aave.com': 'aave',
  'hyperliquid.xyz': 'hype',
  'binance.com': 'bnb',
  'sui.io': 'sui',
  'aptoslabs.com': 'apt',
  'arbitrum.io': 'arb',
  'optimism.io': 'op',
  'polygon.technology': 'matic',
  'avax.network': 'avax',
  'trustwallet.com': 'twt',
};

// Known SimpleIcons slug mappings for SaaS, AI, Dev Tools & Web3
export const SIMPLE_ICONS_SLUGS = {
  'figma': 'figma',
  'figma.com': 'figma',
  'notion': 'notion',
  'notion.so': 'notion',
  'stripe': 'stripe',
  'stripe.com': 'stripe',
  'linear': 'linear',
  'linear.app': 'linear',
  'framer': 'framer',
  'framer.com': 'framer',
  'webflow': 'webflow',
  'webflow.com': 'webflow',
  'vercel': 'vercel',
  'vercel.com': 'vercel',
  'github': 'github',
  'github.com': 'github',
  'slack': 'slack',
  'slack.com': 'slack',
  'discord': 'discord',
  'discord.com': 'discord',
  'metamask': 'metamask',
  'metamask.io': 'metamask',
  'ethereum': 'ethereum',
  'polygon': 'polygon',
  'uniswap': 'uniswap',
  'openai': 'openai',
  'openai.com': 'openai',
};

// Curated vector / SVG brand marks for major exchanges & crypto platforms
export const PLATFORM_BRAND_LOGOS = {
  'binance': 'https://cdn.jsdelivr.net/gh/Cryptofonts/cryptoicons@master/SVG/bnb.svg',
  'binance.com': 'https://cdn.jsdelivr.net/gh/Cryptofonts/cryptoicons@master/SVG/bnb.svg',
  'coinbase': 'https://images.ctfassets.net/q5ulk4bp65r7/3TBS4oVkD1ghowbloOPpZp/b46f7de37de65043a65a6beb54a246b8/Coinbase-Icon-Circle.svg',
  'coinbase.com': 'https://images.ctfassets.net/q5ulk4bp65r7/3TBS4oVkD1ghowbloOPpZp/b46f7de37de65043a65a6beb54a246b8/Coinbase-Icon-Circle.svg',
  'bybit': 'https://www.bybit.com/favicon.ico',
  'bybit.com': 'https://www.bybit.com/favicon.ico',
  'okx': 'https://static.okx.com/cdn/assets/imgs/247/E7C205E68C227E95.png',
  'okx.com': 'https://static.okx.com/cdn/assets/imgs/247/E7C205E68C227E95.png',
  'gate.io': 'https://www.gate.io/favicon.ico',
  'gate': 'https://www.gate.io/favicon.ico',
  'hyperliquid': 'https://cdn.jsdelivr.net/gh/Cryptofonts/cryptoicons@master/SVG/hype.svg',
  'hyperliquid.xyz': 'https://cdn.jsdelivr.net/gh/Cryptofonts/cryptoicons@master/SVG/hype.svg',
  'kraken': 'https://assets.kraken.com/marketing/favicon/favicon.ico',
  'kraken.com': 'https://assets.kraken.com/marketing/favicon/favicon.ico',
  'kucoin': 'https://assets.staticimg.com/cms/media/1lGPLHvnptAlgdtxD8ftmE4unfEwwUmzfpDlsyF74.png',
  'kucoin.com': 'https://assets.staticimg.com/cms/media/1lGPLHvnptAlgdtxD8ftmE4unfEwwUmzfpDlsyF74.png',
  'bitget': 'https://img.bitgetimg.com/image/default/1683713076162.png',
  'bitget.com': 'https://img.bitgetimg.com/image/default/1683713076162.png',
  'mexc': 'https://www.mexc.com/favicon.ico',
  'mexc.com': 'https://www.mexc.com/favicon.ico',
  'phantom': 'https://phantom.app/img/favicon.png',
  'phantom.app': 'https://phantom.app/img/favicon.png',
  'pancakeswap': 'https://pancakeswap.finance/favicon.ico',
  'jupiter': 'https://jup.ag/favicon.ico',
  'jup.ag': 'https://jup.ag/favicon.ico',
};

// Rich Preset Directory of Popular Companies & Platforms for instant combobox discovery
export const PRESET_COMPANIES = [
  // Crypto Exchanges & Trading
  { title: 'Binance', domain: 'binance.com', url: 'https://binance.com', category: 'Trading', logoUrl: 'https://cdn.jsdelivr.net/gh/Cryptofonts/cryptoicons@master/SVG/bnb.svg' },
  { title: 'Bybit', domain: 'bybit.com', url: 'https://bybit.com', category: 'Trading', logoUrl: 'https://www.bybit.com/favicon.ico' },
  { title: 'OKX', domain: 'okx.com', url: 'https://okx.com', category: 'Trading', logoUrl: 'https://static.okx.com/cdn/assets/imgs/247/E7C205E68C227E95.png' },
  { title: 'Coinbase', domain: 'coinbase.com', url: 'https://coinbase.com', category: 'Trading', logoUrl: 'https://images.ctfassets.net/q5ulk4bp65r7/3TBS4oVkD1ghowbloOPpZp/b46f7de37de65043a65a6beb54a246b8/Coinbase-Icon-Circle.svg' },
  { title: 'Kraken', domain: 'kraken.com', url: 'https://kraken.com', category: 'Trading', logoUrl: 'https://assets.kraken.com/marketing/favicon/favicon.ico' },
  { title: 'KuCoin', domain: 'kucoin.com', url: 'https://kucoin.com', category: 'Trading', logoUrl: 'https://assets.staticimg.com/cms/media/1lGPLHvnptAlgdtxD8ftmE4unfEwwUmzfpDlsyF74.png' },
  { title: 'Gate.io', domain: 'gate.io', url: 'https://gate.io', category: 'Trading', logoUrl: 'https://www.gate.io/favicon.ico' },
  { title: 'Hyperliquid', domain: 'hyperliquid.xyz', url: 'https://hyperliquid.xyz', category: 'Trading', logoUrl: 'https://cdn.jsdelivr.net/gh/Cryptofonts/cryptoicons@master/SVG/hype.svg' },
  { title: 'Bitget', domain: 'bitget.com', url: 'https://bitget.com', category: 'Trading', logoUrl: 'https://img.bitgetimg.com/image/default/1683713076162.png' },
  { title: 'MEXC', domain: 'mexc.com', url: 'https://mexc.com', category: 'Trading', logoUrl: 'https://www.mexc.com/favicon.ico' },
  { title: 'dYdX', domain: 'dydx.exchange', url: 'https://dydx.exchange', category: 'Trading', logoUrl: 'https://cdn.jsdelivr.net/gh/Cryptofonts/cryptoicons@master/SVG/dydx.svg' },

  // DeFi & Protocols
  { title: 'Uniswap', domain: 'uniswap.org', url: 'https://uniswap.org', category: 'DeFi', logoUrl: 'https://cdn.jsdelivr.net/gh/Cryptofonts/cryptoicons@master/SVG/uni.svg' },
  { title: 'Aave', domain: 'aave.com', url: 'https://aave.com', category: 'DeFi', logoUrl: 'https://cdn.jsdelivr.net/gh/Cryptofonts/cryptoicons@master/SVG/aave.svg' },
  { title: 'PancakeSwap', domain: 'pancakeswap.finance', url: 'https://pancakeswap.finance', category: 'DeFi', logoUrl: 'https://pancakeswap.finance/favicon.ico' },
  { title: 'Jupiter', domain: 'jup.ag', url: 'https://jup.ag', category: 'DeFi', logoUrl: 'https://jup.ag/favicon.ico' },

  // Blockchains & Web3
  { title: 'Solana', domain: 'solana.com', url: 'https://solana.com', category: 'Web3', logoUrl: 'https://cdn.jsdelivr.net/gh/Cryptofonts/cryptoicons@master/SVG/sol.svg' },
  { title: 'Ethereum', domain: 'ethereum.org', url: 'https://ethereum.org', category: 'Web3', logoUrl: 'https://cdn.jsdelivr.net/gh/Cryptofonts/cryptoicons@master/SVG/eth.svg' },
  { title: 'Polygon', domain: 'polygon.technology', url: 'https://polygon.technology', category: 'Web3', logoUrl: 'https://cdn.jsdelivr.net/gh/Cryptofonts/cryptoicons@master/SVG/matic.svg' },
  { title: 'Arbitrum', domain: 'arbitrum.io', url: 'https://arbitrum.io', category: 'Web3', logoUrl: 'https://cdn.jsdelivr.net/gh/Cryptofonts/cryptoicons@master/SVG/arb.svg' },
  { title: 'Optimism', domain: 'optimism.io', url: 'https://optimism.io', category: 'Web3', logoUrl: 'https://cdn.jsdelivr.net/gh/Cryptofonts/cryptoicons@master/SVG/op.svg' },
  { title: 'Base', domain: 'base.org', url: 'https://base.org', category: 'Web3', logoUrl: 'https://cdn.jsdelivr.net/gh/Cryptofonts/cryptoicons@master/SVG/base.svg' },
  { title: 'Avalanche', domain: 'avax.network', url: 'https://avax.network', category: 'Web3', logoUrl: 'https://cdn.jsdelivr.net/gh/Cryptofonts/cryptoicons@master/SVG/avax.svg' },
  { title: 'Sui', domain: 'sui.io', url: 'https://sui.io', category: 'Web3', logoUrl: 'https://cdn.jsdelivr.net/gh/Cryptofonts/cryptoicons@master/SVG/sui.svg' },
  { title: 'Aptos', domain: 'aptoslabs.com', url: 'https://aptoslabs.com', category: 'Web3', logoUrl: 'https://cdn.jsdelivr.net/gh/Cryptofonts/cryptoicons@master/SVG/apt.svg' },

  // Wallets
  { title: 'MetaMask', domain: 'metamask.io', url: 'https://metamask.io', category: 'Wallet', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/metamask.svg' },
  { title: 'Phantom', domain: 'phantom.app', url: 'https://phantom.app', category: 'Wallet', logoUrl: 'https://phantom.app/img/favicon.png' },
  { title: 'Trust Wallet', domain: 'trustwallet.com', url: 'https://trustwallet.com', category: 'Wallet', logoUrl: 'https://cdn.jsdelivr.net/gh/Cryptofonts/cryptoicons@master/SVG/twt.svg' },

  // Fintech, SaaS, AI & Design Tools
  { title: 'Stripe', domain: 'stripe.com', url: 'https://stripe.com', category: 'Fintech', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/stripe.svg' },
  { title: 'Linear', domain: 'linear.app', url: 'https://linear.app', category: 'SaaS', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/linear.svg' },
  { title: 'Notion', domain: 'notion.so', url: 'https://notion.so', category: 'SaaS', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/notion.svg' },
  { title: 'Figma', domain: 'figma.com', url: 'https://figma.com', category: 'Design Tools', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/figma.svg' },
  { title: 'Framer', domain: 'framer.com', url: 'https://framer.com', category: 'Design Tools', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/framer.svg' },
  { title: 'Webflow', domain: 'webflow.com', url: 'https://webflow.com', category: 'Design Tools', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/webflow.svg' },
  { title: 'Vercel', domain: 'vercel.com', url: 'https://vercel.com', category: 'Developer Tools', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/vercel.svg' },
  { title: 'GitHub', domain: 'github.com', url: 'https://github.com', category: 'Developer Tools', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/github.svg' },
  { title: 'Slack', domain: 'slack.com', url: 'https://slack.com', category: 'SaaS', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/slack.svg' },
  { title: 'Discord', domain: 'discord.com', url: 'https://discord.com', category: 'Community', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/discord.svg' },
  { title: 'OpenAI', domain: 'openai.com', url: 'https://openai.com', category: 'AI', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/openai.svg' },
];

/**
 * Returns the SimpleIcons CDN SVG URL for a SaaS/Tech brand.
 */
export const getSimpleIconUrl = (nameOrDomain) => {
  if (!nameOrDomain) return null;
  const clean = nameOrDomain.trim().toLowerCase().replace(/^www\./, '');
  const slug = SIMPLE_ICONS_SLUGS[clean] || SIMPLE_ICONS_SLUGS[clean.replace(/[^a-z0-9]/g, '')];
  if (slug) {
    return `https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${slug}.svg`;
  }
  return null;
};

/**
 * Returns the Cryptoicons CDN SVG URL for a cryptocurrency token/symbol.
 */
export const getCryptoIconUrl = (symbol) => {
  if (!symbol) return null;
  const clean = symbol.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!clean) return null;
  const target = CRYPTO_ALIASES[clean] || clean;
  return `https://cdn.jsdelivr.net/gh/Cryptofonts/cryptoicons@master/SVG/${target}.svg`;
};

/**
 * Derives a clean canonical parent company name from domain and/or raw page title.
 */
export const getCleanCompanyName = (domain = '', rawTitle = '') => {
  const cleanDomain = domain.replace(/^www\./, '').split('/')[0].trim().toLowerCase();
  
  const KNOWN_DOMAINS = {
    'coinbase.com': 'Coinbase',
    'solana.com': 'Solana',
    'taiko.xyz': 'Taiko',
    'kaleido.io': 'Kaleido',
    'okx.com': 'OKX',
    'binance.com': 'Binance',
    'bybit.com': 'Bybit',
    'gate.io': 'Gate.io',
    'hyperliquid.xyz': 'Hyperliquid',
    'stripe.com': 'Stripe',
    'neoconda.com': 'Neoconda',
    'figma.com': 'Figma',
    'notion.so': 'Notion',
    'linear.app': 'Linear',
    'framer.com': 'Framer',
    'webflow.com': 'Webflow',
    'vercel.com': 'Vercel',
    'github.com': 'GitHub',
    'slack.com': 'Slack',
    'discord.com': 'Discord',
    'uniswap.org': 'Uniswap',
    'aave.com': 'Aave',
    'metamask.io': 'MetaMask',
    'phantom.app': 'Phantom',
  };

  if (cleanDomain && KNOWN_DOMAINS[cleanDomain]) {
    return KNOWN_DOMAINS[cleanDomain];
  }

  if (rawTitle && rawTitle.trim()) {
    const parts = rawTitle.split(/\s+[—|·•-]\s+/).map(p => p.trim());
    if (parts.length > 1) {
      const candidate = parts[parts.length - 1];
      if (candidate.length < 25 && !/home|dashboard|spot|trading|docs/i.test(candidate)) {
        return candidate.replace(/\s+Platform$/i, '').trim();
      }
    }
  }

  if (cleanDomain) {
    const baseName = cleanDomain.split('.')[0];
    if (baseName) {
      return baseName.charAt(0).toUpperCase() + baseName.slice(1);
    }
  }

  return rawTitle || 'Company';
};

/**
 * Checks if a URL looks like an unverified page screenshot or social banner
 * rather than a square/vector brand logo.
 */
export const isDisallowedLogoUrl = (url) => {
  if (!url || typeof url !== 'string') return true;
  const lower = url.toLowerCase();
  return (
    lower.includes('opengraph') ||
    lower.includes('social/') ||
    lower.includes('/social.') ||
    lower.includes('twitter-card') ||
    lower.includes('og-image') ||
    lower.includes('screenshot') ||
    lower.includes('extension-captures')
  );
};

/**
 * Returns an array of candidate logo URLs in priority order for an asset or brand.
 */
export const getLogoCandidateUrls = ({ logoUrl, symbol, domain, name }) => {
  const candidates = [];

  // 1. Existing stored logo URL (MUST NOT be a screenshot or social banner)
  if (logoUrl && typeof logoUrl === 'string' && logoUrl.trim() && !isDisallowedLogoUrl(logoUrl)) {
    candidates.push(logoUrl.trim());
  }

  const normalizedDomain = (domain || '')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .toLowerCase();

  const normalizedName = (name || normalizedDomain || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  // 2. Curated Platform / Exchange brand mapping
  if (normalizedName && PLATFORM_BRAND_LOGOS[normalizedName]) {
    candidates.push(PLATFORM_BRAND_LOGOS[normalizedName]);
  } else if (normalizedDomain && PLATFORM_BRAND_LOGOS[normalizedDomain]) {
    candidates.push(PLATFORM_BRAND_LOGOS[normalizedDomain]);
  }

  // 3. SimpleIcons SVG lookup
  const simpleUrl = getSimpleIconUrl(normalizedDomain || normalizedName);
  if (simpleUrl) {
    candidates.push(simpleUrl);
  }

  // 4. Crypto token symbol (explicit symbol OR mapped from domain/name)
  const resolvedSymbol = symbol || DOMAIN_TO_CRYPTO_SYMBOL[normalizedDomain] || CRYPTO_ALIASES[normalizedName];
  if (resolvedSymbol && typeof resolvedSymbol === 'string') {
    const cryptoUrl = getCryptoIconUrl(resolvedSymbol);
    if (cryptoUrl) candidates.push(cryptoUrl);
  }

  // 5. Domain favicons
  if (normalizedDomain) {
    candidates.push(`https://icon.horse/icon/${normalizedDomain}`);
    candidates.push(`https://www.google.com/s2/favicons?domain=${normalizedDomain}&sz=128`);
  }

  return candidates;
};

/**
 * Helper to generate a controlled 1-2 letter monogram for fallbacks
 */
export const getMonogram = (name, symbol) => {
  if (symbol && symbol.trim()) {
    return symbol.trim().slice(0, 3).toUpperCase();
  }
  if (!name) return 'RD';
  const clean = name.trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
};

/**
 * Storage pipeline: Fetches and stores canonical logo into Supabase
 */
export const fetchAndStoreCanonicalLogo = async (domain) => {
  if (!domain) return null;

  try {
    let blob = null;

    try {
      const url = `https://icon.horse/icon/${domain}`;
      const res = await fetch(url);
      if (res.ok) {
        blob = await res.blob();
      }
    } catch (e) {
      console.warn('Primary logo fetch failed (icon.horse):', e);
    }

    if (!blob || blob.size < 100) {
      console.error("Could not fetch a valid logo for domain:", domain);
      return null;
    }

    const fileName = `logos/${domain}-${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('submissions')
      .upload(fileName, blob, { 
        upsert: true, 
        contentType: blob.type || 'image/png' 
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('submissions')
      .getPublicUrl(fileName);

    const { error: dbError } = await supabase
      .from('submissions')
      .update({ logo_url: publicUrl })
      .or(`url.ilike.%${domain}%,normalised_url.ilike.%${domain}%`);

    if (dbError) throw dbError;

    return publicUrl;
  } catch (err) {
    console.error('Error in logo pipeline:', err);
    return null;
  }
};
