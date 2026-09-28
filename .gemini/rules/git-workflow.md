# Git & Branching Workflow (STRICT)

- **NEVER push directly to `main`**: All modifications must happen inside dedicated feature or fix branches (`feature/*`, `fix/*`, `chore/*`).
- **Branch Verification**: Always verify active branch before committing (`git branch`).
- **Local Testing First**: Always test and build locally (`npm run dev`, `npm run build`) before pushing.
- **PR Workflow**: Push to the feature branch, open a Pull Request to `main`, and wait for user approval to merge.
- **No Destructive Operations**: Never drop stashes or reset branches without explicit user confirmation.
