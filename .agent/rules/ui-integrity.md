# UI & Component Integrity

- **Preserve Existing UI**: Never remove, hide, or refactor unrelated components, animations, routes, or features.
- **Figma-Style Corner Smoothing (STRICT PERMANENT RULE)**: All cards, previews, thumbnails, image wrappers, upload drawers/cards, modals, dropdowns, inputs, pills, buttons, and interactive surfaces across Ref.Design must use smooth Figma-style squircle corners by default (`corner-shape: squircle; -webkit-corner-shape: squircle;`). Never remove, replace, or downgrade squircle corner smoothing to basic or harsh browser `border-radius`.
- **Scope Strictness**: Touch only the exact files and lines required for the requested task.
- **Design Tokens & Colors**: Only use colors and tokens defined in CSS variables (`--dv-*`). Never hardcode arbitrary hex colors.
- **Routing**: The application uses `HashRouter` for client-side routing on static hosting (e.g. `#/skills`, `#/fonts`). Ensure all links and routes maintain compatibility.
