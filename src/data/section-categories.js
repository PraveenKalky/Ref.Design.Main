/**
 * Ref.Design — Section Categories
 * Master taxonomy for the Sections library page.
 * Used by SectionCategoryNav sidebar, SectionUploadDrawer, and Gemini classification.
 */

// Primary sidebar categories (shown by default, matching user's existing design)
export const SECTION_SIDEBAR_CATEGORIES = [
  { id: 'hero',         label: 'Hero',         count: null },
  { id: 'features',     label: 'Features',     count: null },
  { id: 'cta',          label: 'CTA',          count: null },
  { id: 'testimonials', label: 'Testimonials',  count: null },
  { id: 'pricing',      label: 'Pricing',      count: null },
  { id: 'faq',          label: 'FAQs',         count: null },
  { id: 'footer',       label: 'Footer',       count: null },
  { id: 'blog',         label: 'Blog',         count: null },
  { id: 'navbar',       label: 'Navbar',       count: null },
  { id: 'logo',         label: 'Logo',         count: null },
  { id: 'team',         label: 'Team',         count: null },
];

// All categories, organized into groups for the "All Categories" expanded view
export const SECTION_CATEGORY_GROUPS = [
  {
    group: 'Page Structure',
    categories: ['Navigation', 'Hero', 'Footer', 'Sidebar', 'Breadcrumb', 'Banner'],
  },
  {
    group: 'Marketing & Conversion',
    categories: ['Features', 'CTA', 'Pricing', 'Testimonials', 'Social Proof', 'Stats', 'Comparisons', 'Trust Badges'],
  },
  {
    group: 'Content & Media',
    categories: ['Blog', 'Case Studies', 'Portfolio', 'Gallery', 'Video', 'Podcast', 'Press', 'Changelog', 'Timeline', 'Roadmap'],
  },
  {
    group: 'People & Brand',
    categories: ['Team', 'About', 'Founders', 'Culture', 'Reviews', 'Awards'],
  },
  {
    group: 'Community & Engagement',
    categories: ['Community', 'Newsletter', 'Comments', 'Referrals', 'Leaderboard'],
  },
  {
    group: 'Data & Interfaces',
    categories: ['Dashboard', 'Tables', 'Charts', 'Analytics', 'Bento Grid', 'Kanban', 'Calendar'],
  },
  {
    group: 'Auth & Onboarding',
    categories: ['Sign In', 'Sign Up', 'Onboarding', 'Profile', 'Settings'],
  },
  {
    group: 'E-commerce',
    categories: ['Product Showcase', 'Cart', 'Checkout', 'Wishlist', 'Product Cards'],
  },
  {
    group: 'Technical & Interactive',
    categories: ['API Docs', 'Integrations', 'Code Snippets', 'Playground', 'Animations'],
  },
  {
    group: 'Web3 & Financial',
    categories: ['Deposit', 'Withdraw', 'Order Book', 'Wallet', 'Trading', 'Crypto', 'Fintech'],
  },
  {
    group: 'Industry-Specific',
    categories: ['SaaS', 'AI', 'Healthcare', 'Education', 'Real Estate'],
  },
  {
    group: 'Forms & Inputs',
    categories: ['Contact', 'Lead Gen', 'Survey', 'Multi-step Form'],
  },
  {
    group: 'Discovery',
    categories: ['Search', 'Filters', 'Directory', 'Category Listing'],
  },
];

// Flat list of all categories for dropdowns and Gemini prompt
export const ALL_SECTION_CATEGORIES = [
  ...new Set(SECTION_CATEGORY_GROUPS.flatMap(g => g.categories))
].sort();

// Mapping from sidebar IDs to section_type values (for DB queries)
export const SIDEBAR_TO_SECTION_TYPE = {
  hero:         'Hero',
  features:     'Features',
  cta:          'CTA',
  testimonials: 'Testimonials',
  pricing:      'Pricing',
  faq:          'FAQ',
  footer:       'Footer',
  blog:         'Blog',
  navbar:       'Navigation',
  logo:         'Logo Cloud',
  team:         'Team',
};

// Extended Gemini prompt category list (superset of STANDARD_SECTIONS)
export const GEMINI_SECTION_CATEGORIES = [
  'Hero', 'Navigation', 'Features', 'CTA', 'Testimonials', 'Pricing',
  'FAQ', 'Footer', 'Blog', 'Logo Cloud', 'Team', 'About', 'Contact',
  'Dashboard', 'Sign In', 'Sign Up', 'Bento Grid', 'Stats', 'Integrations',
  'Timeline', 'Roadmap', 'Product Showcase', 'Comparisons', 'Newsletter',
  'Community', 'Search', 'Gallery', 'Onboarding', 'Settings', 'Analytics',
  'Trading', 'Checkout', 'Case Studies', 'Changelog', 'API Docs', 'Social Proof',
  'Trust Badges', 'Fintech', 'Crypto', 'SaaS', 'AI', 'Portfolio', 'Profile',
  'Multi-step Form', 'Contact', 'Lead Gen', 'Reviews',
];
