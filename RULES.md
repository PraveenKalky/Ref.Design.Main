# Permanent Rules

## Rule 1 — Colors
Only use colors from the existing `skills.md` / style guide file already in the project. Do not introduce any new colors, do not hardcode random hex values. If unsure, check the style guide first.

## Rule 2 — GitHub
Do NOT push anything to GitHub without explicit permission from the user. Not a single commit, not a single push. Always wait for the instruction "push to GitHub" or "push it."

## Rule 3 — No unauthorized changes
Do NOT touch, modify, or refactor any section, component, or file that is not directly related to the current task. If something is unclear or seems like it might affect other parts of the project, STOP and ask before proceeding.

## Rule 4 — Ask when unsure
If any instruction is unclear or ambiguous, ask immediately before writing any code. Do not guess and do not assume.

## Rule 5 — These rules are permanent
Read this file at the start of every task. These rules override any other default behavior. Never repeat the mistakes listed above.

## Rule 6 — DO NOT REMOVE EXISTING UI WITHOUT APPROVAL

Never remove, delete, hide, replace, simplify, or disable any existing:
- section
- component
- control
- interaction
- animation
- functionality
- data
- route

unless I explicitly ask for that removal.

When implementing a new request, modify only the exact area requested.

If a requested change appears to conflict with an existing component or requires removing something, STOP and ask for approval first.

Existing working UI must be preserved by default.

Never assume that replacing or restructuring a nearby area gives permission to remove existing content.

Before completing any change, compare the page before vs after and verify that unrelated UI/functionality is still present.

## Rule 7 — Git Branch Workflow & No Direct Push to Main
- **Never push directly to `main`**: All work must be conducted on dedicated feature or fix branches (`feature/*` or `fix/*`).
- **Local Verification First**: Run and verify all changes on local development (`npm run dev` / `npm run build`) before pushing.
- **Pull Requests**: Changes must be pushed on their respective feature branch and merged via Pull Request into `main`.
- **Preserve Work**: Stashes and backups must be checked before creating new branches to avoid losing uncommitted progress.

