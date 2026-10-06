# UI & Component Integrity

- **Preserve Existing UI**: Never remove, hide, or refactor unrelated components, animations, routes, or features.
- **Scope Strictness**: Touch only the exact files and lines required for the requested task.
- **Design Tokens & Colors**: Only use colors and tokens defined in CSS variables (`--dv-*`). Never hardcode arbitrary hex colors.
- **Routing**: The application uses `HashRouter` for client-side routing on static hosting (e.g. `#/skills`, `#/fonts`). Ensure all links and routes maintain compatibility.
