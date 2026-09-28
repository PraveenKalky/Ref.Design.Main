# Agent Instructions & Project Guidelines

This file serves as the primary instructions and checklist for AI agents working in this repository.

## 📋 Core Checklists & Permanent Rules

### 1. Git & Branching Workflow (STRICT)
- [ ] **NEVER push directly to `main`**: All modifications must happen inside dedicated branches (`feature/*`, `fix/*`, `chore/*`).
- [ ] **Branch Verification**: Always verify active branch before committing (`git branch`).
- [ ] **Local Testing First**: Always test and build locally (`npm run dev`, `npm run build`) before pushing.
- [ ] **PR Workflow**: Push to the feature branch, open a Pull Request to `main`, and wait for user approval to merge.
- [ ] **No Destructive Operations**: Never drop stashes or reset branches without explicit user confirmation.

### 2. UI & Component Integrity
- [ ] **Preserve Existing UI**: Never remove, hide, or refactor unrelated components, animations, routes, or features.
- [ ] **Scope Strictness**: Touch only the exact files and lines required for the requested task.
- [ ] **Design Tokens & Colors**: Only use colors and tokens defined in CSS variables (`--dv-*`). Never hardcode arbitrary hex colors.
- [ ] **Routing**: The application uses `HashRouter` for client-side routing on static hosting (e.g. `#/skills`, `#/fonts`). Ensure all links and routes maintain compatibility.

### 3. ASCII Layouts & Visual Specs
- [ ] **Preserve 1:1 Exactly**: Treat provided ASCII diagrams as strict visual specifications without auto-reformatting or indentation changes.
- [ ] **Show Layout First**: If requested, show the ASCII layout plan and obtain user sign-off before modifying code.

### 4. Code Quality & Safety
- [ ] **Safe Initializations**: External clients (e.g. Supabase) must have fallback values and console warnings rather than top-level `throw new Error` to prevent blank screen crashes on deployment.
- [ ] **Build Integrity**: Run `npm run build` after changes to ensure zero bundling errors or broken imports.
