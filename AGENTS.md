# AGENTS.md

## Working Rules

- Use Angular standalone components and follow the existing project structure.
- Prefer BEM-style class names for component styles.
- Respect `FE-technical-test (3).md` over mockups when they conflict.
- Preserve user edits and avoid unrelated refactors.
- Make focused, incremental changes and verify meaningful updates with `npm run build`.
- Update `thought-process.md` only for substantive project decisions, accessibility changes,
  architecture changes, important bug fixes, or meaningful UI behavior changes.
- Do not add small visual nudges or insignificant tweaks to `thought-process.md`; mention in
  the response whether it was updated or intentionally left unchanged.
- Ask for clarification only when the missing detail would make the change risky or ambiguous.

## Implementation Preferences

- Keep the schedule accessible for keyboard and screen reader users.
- Support a minimum screen width of 800px.
- Prefer shared components or directives when UI patterns repeat.
- Use global CSS custom properties for shared tokens such as colors and z-index values.
- Use local Sass variables for component-only sizing when that keeps styles readable.
- Keep styles close to the mockups without sacrificing maintainability.

## Verification

- Run `npm run build` after meaningful code or style changes.
- Run `npm test` when behavior, state management, or form validation changes.
- Note any known warnings, skipped checks, or residual risks in the final response.
