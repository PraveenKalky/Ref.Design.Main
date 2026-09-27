import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { Search, Copy, Check } from 'lucide-react';
import { skillsData, SKILLS_CATEGORIES, formatStars } from '../data/skillsData';
import '../styles/skills.css';

/* ── GitHub Icon (Phosphor / exact custom SVG) ──────────────────── */
const GithubIcon = ({ size = 18 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 256 256"
  >
    <path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z" />
  </svg>
);


/* ─────────────────────────────────────────────────────────────────
   ShufflePill — stagger-letters for pill labels and Copy text.
   Same pattern as ShuffleName, triggered on hover.
   ───────────────────────────────────────────────────────────────── */
const ShufflePill = ({ text }) => (
  <span className="skills-pill-label">
    {[...text].map((char, i) => (
      <span key={i} className="skills-pill-char" style={{ '--i': i }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))}
  </span>
);

/* ─────────────────────────────────────────────────────────────────
   Avatar — GitHub image with initials colour fallback
   ───────────────────────────────────────────────────────────────── */
const SkillAvatar = ({ skill }) => {
  const [failed, setFailed] = useState(false);
  const initials = skill.owner.slice(0, 2).toUpperCase();

  if (!skill.avatarUrl || failed) {
    return (
      <div
        className="skills-avatar-initials"
        style={{ backgroundColor: skill.avatarColor }}
        aria-hidden="true"
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      className="skills-avatar"
      src={skill.avatarUrl}
      alt={skill.owner}
      width={40}
      height={40}
      onError={() => setFailed(true)}
    />
  );
};

/* ─────────────────────────────────────────────────────────────────
   CopyButton — 36px CTA: [ Copy ] → click → [ ✓ Copied ] → [ Copy ]
   ───────────────────────────────────────────────────────────────── */
const CopyButton = ({ skill }) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const handleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (copied) return;

    try {
      navigator.clipboard.writeText(skill.installCommand);
    } catch {
      // Fallback
    }

    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCopied(false);
    }, 1800);
  }, [copied, skill.installCommand]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <button
      className={`skills-copy-btn ${copied ? 'is-copied' : ''}`}
      onClick={handleClick}
      aria-label={copied ? 'Copied to clipboard' : `Copy install command for ${skill.owner}/${skill.name}`}
      title={skill.installCommand}
    >
      <span className={`copy-state-content ${copied ? 'copied' : 'idle'}`}>
        {copied ? (
          <>
            <Check size={15} strokeWidth={2.2} className="copy-icon-check" />
            <span className="copy-btn-text">Copied</span>
          </>
        ) : (
          <>
            <Copy size={15} strokeWidth={2.2} className="copy-icon-copy" />
            <ShufflePill text="Copy" />
          </>
        )}
      </span>
    </button>
  );
};

/* ─────────────────────────────────────────────────────────────────
   SkillRow — one row per skill entry (static, immediately visible)
   Layout: [Avatar] Skill name + description    [ GitHub ] 161.4K [ Copy ]
   ───────────────────────────────────────────────────────────────── */
const SkillRow = ({ skill, isMobile }) => {
  const handleRowClick = () => {
    if (skill.githubUrl) {
      window.open(skill.githubUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (isMobile) {
    return (
      <div
        className="skills-row"
        onClick={handleRowClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleRowClick()}
      >
        <div className="skills-avatar-wrap">
          <SkillAvatar skill={skill} />
        </div>
        <div className="skills-info">
          <span className="skills-name">
            {skill.owner}/{skill.name}
          </span>
        </div>
        <span
          className="skills-description"
          style={{ gridColumn: '2', marginTop: 2 }}
        >
          {skill.description}
        </span>
        <div className="skills-row-actions">
          <a
            href={skill.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="skills-github-btn"
            onClick={(e) => e.stopPropagation()}
            aria-label={`View ${skill.owner}/${skill.name} on GitHub`}
            title={`View ${skill.owner}/${skill.name} on GitHub`}
          >
            <GithubIcon size={18} />
          </a>
          <span className="skills-count">
            {formatStars(skill.githubStars)}
          </span>
          <CopyButton skill={skill} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="skills-row"
      onClick={handleRowClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleRowClick()}
    >
      <div className="skills-avatar-wrap">
        <SkillAvatar skill={skill} />
      </div>

      <div className="skills-info">
        <span className="skills-name">
          {skill.owner}/{skill.name}
        </span>
        <span className="skills-description">{skill.description}</span>
      </div>

      {/* Right-side Actions: [ GitHub ]  161.4K  [ Copy ] */}
      <div className="skills-row-actions">
        <a
          href={skill.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="skills-github-btn"
          onClick={(e) => e.stopPropagation()}
          aria-label={`View ${skill.owner}/${skill.name} on GitHub`}
          title={`View ${skill.owner}/${skill.name} on GitHub`}
        >
          <GithubIcon size={18} />
        </a>
        <span className="skills-count">
          {formatStars(skill.githubStars)}
        </span>
        <CopyButton skill={skill} />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   SkillsPage — main page
   ───────────────────────────────────────────────────────────────── */
const SkillsPage = () => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isStuck, setIsStuck] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const stickyRef = useRef(null);
  const groupRefs = useRef({});

  // Detect mobile breakpoint
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Sticky sentinel: detect when controls bar is "stuck"
  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 1, rootMargin: '-81px 0px 0px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Filter skills by search query
  const filteredBySearch = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return skillsData;
    return skillsData.filter(
      (s) =>
        s.owner.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [query]);

  // Group filtered skills by category (preserving SKILLS_CATEGORIES order).
  // activeCategory filters CONTENT only — all filter options always remain visible!
  const groupedSkills = useMemo(() => {
    const filtered =
      activeCategory === 'All'
        ? filteredBySearch
        : filteredBySearch.filter((s) => s.category === activeCategory);

    return SKILLS_CATEGORIES.reduce((acc, cat) => {
      const items = filtered.filter((s) => s.category === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    }, {});
  }, [filteredBySearch, activeCategory]);

  // Category pill click: update pill + smooth-scroll to group
  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    if (cat === 'All') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = groupRefs.current[cat];
    if (target) {
      const offset = 80 + 76 + 16; // navbar + controls + gap
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const totalVisible = Object.values(groupedSkills).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  return (
    <div className="skills-page">

      {/* ── Header Section (40px from navbar) ────────────────────── */}
      <header className="skills-header">
        <h1 className="skills-title">
          Skills
        </h1>
        <p className="skills-subtitle">
          Discover useful design, development and AI-agent skills.
        </p>
      </header>

      {/* ── Sticky Category Controls & Search (Same Horizontal Row) ─ */}
      <div
        className={`skills-controls-sticky${isStuck ? ' is-stuck' : ''}`}
        ref={stickyRef}
      >
        <div className="skills-controls-inner">
          {/* Left: Filter Pills */}
          <div className="skills-controls-left">
            {['All', ...SKILLS_CATEGORIES].map((cat) => (
              <button
                key={cat}
                className={`skills-cat-pill${activeCategory === cat ? ' active' : ''}`}
                onClick={() => handleCategoryClick(cat)}
              >
                <ShufflePill text={cat} />
              </button>
            ))}
          </div>

          {/* Right: Search */}
          <div className="skills-search-wrapper">
            <Search size={14} strokeWidth={2} className="skills-search-icon" />
            <input
              className="skills-search-input"
              type="text"
              placeholder="Search skills…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search skills"
            />
          </div>
        </div>
      </div>

      {/* ── Skill Groups ─────────────────────────────────────────── */}
      <main className="skills-content">
        {totalVisible === 0 && (
          <div className="skills-empty">
            No skills match <strong>"{query}"</strong>
          </div>
        )}

        {SKILLS_CATEGORIES.map((cat) => {
          const items = groupedSkills[cat];
          if (!items) return null;

          return (
            <section
              key={cat}
              className="skills-group"
              ref={(el) => (groupRefs.current[cat] = el)}
              id={`skills-cat-${cat.toLowerCase()}`}
            >
              <div className="skills-group-heading">
                <span className="skills-group-name">{cat}</span>
                <span className="skills-group-count">
                  {items.length} {items.length === 1 ? 'skill' : 'skills'}
                </span>
              </div>

              {items.map((skill) => (
                <SkillRow
                  key={skill.id}
                  skill={skill}
                  isMobile={isMobile}
                />
              ))}
            </section>
          );
        })}
      </main>
    </div>
  );
};

export default SkillsPage;
