# Code Quality & Safety

- **Safe Initializations**: External clients (e.g. Supabase) must have fallback values and console warnings rather than top-level `throw new Error` to prevent blank screen crashes on deployment.
- **Build Integrity**: Run `npm run build` after changes to ensure zero bundling errors or broken imports.
