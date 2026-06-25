# Project Thought Process

This file records the important product questions, implementation decisions, and UX direction for
the Work Order Schedule Timeline. Small visual nudges, quick rollbacks, typo corrections, and
one-off debugging notes are intentionally omitted so the file remains useful as project context.

## Foundation

1. The project started from the requirement to reproduce a Work Order Schedule Timeline from the
   provided mockups and the technical-test Markdown documentation.

   **Change:** Created a standalone Angular application named `work-order-schedule-timeline`,
   using Angular 21, BEM-style SCSS, and an 800px minimum supported viewport.

2. The first implementation needed to be a practical boilerplate rather than a fully polished
   production build.

   **Change:** Added the initial timeline, work-order panel, sample data, form validation,
   accessible labels/focus states, and a basic testing/documentation structure.

3. The project needed durable documentation and AI handoff context.

   **Change:** Added `README.md`, `documentation.md`, `AGENTS.md`, `PROJECT_CONTEXT.md`, and this
   thought-process file to capture requirements, architecture, and future development guidance.

## Application Shell and Repository

4. The project needed to be ready for a private GitHub repository and ongoing development.

   **Change:** Added a project README, `.gitignore`, semantic application shell, footer, and a
   `develop` branch workflow.

## Timeline Layout and Visual System

5. The timeline needed to match the mockups more closely while scaling from the 800px minimum to
   wider screens.

   **Change:** Introduced fluid CSS tokens for gutters, row height, header height, work-center
   width, timeline height, and large-screen typography. The layout keeps roughly 50px rows near a
   1536px viewport and grows modestly on large screens.

6. Repeated colors needed to be centralized.

   **Change:** Added semantic global CSS custom properties for surfaces, borders, text colors,
   status colors, error colors, focus rings, shadows, timeline previews, and current-period
   markers.

7. The timeline needed to center around today's date with scale-aware context.

   **Change:** Added current day/week/month marker support, scale-dependent timeline ranges, and
   a current-period chip with a vertical line aligned through the timeline canvas.

8. The timeline grid needed to look closer to the mockups.

   **Change:** Removed horizontal timeline row lines, kept Work Center row separators, restored the
   fixed Work Center column divider, and used continuous vertical grid lines through the schedule
   canvas.

## Timescale and View Navigation

9. The initial timescale state was inconsistent between the dropdown and the rendered timeline.

    **Change:** Made the selected timescale the single source of truth and fixed the first-load
    Day view mismatch.

10. The timescale selector needed to match the mockup and use `ng-select`.

    **Change:** Replaced the native select with a compact joined Timescale control, styled the
    dropdown/options, aligned the menu to the timeline, and tuned typography, spacing, and chevron
    behavior.

11. Changing timescale should preserve the user's current context instead of unexpectedly jumping.

    **Change:** Implemented viewport-anchor preservation across Day, Week, and Month. The schedule
    keeps the same centered date/period when switching scale and restores the saved viewport
    center after refresh.

12. The timeline needed wider exploration without rebuilding the whole date range up front.

    **Change:** Added delayed dynamic range expansion near horizontal scroll edges and during
    keyboard navigation, plus a Today button that recenters without discarding the expanded range.

13. The selected timescale needed persistence.

    **Change:** Stored the selected Day, Week, or Month timescale in localStorage with a validated
    fallback.

## Work Order Creation

14. Empty timeline space needed to show a creation affordance like the mockups.

    **Change:** Added the pointing-hand cursor and a fixed-width create preview with the floating
    "Click to add dates" label.

15. Creation should default to a seven-day inclusive range but avoid overlapping existing work
    orders.

    **Change:** Added shared available-range calculation. New previews and created orders use up
    to seven inclusive days, shorten before the next conflicting order, and avoid occupied starts.

16. Keyboard users needed a way to create work orders from the timeline.

    **Change:** Added arrow-key navigation for create targets across dates and work-center rows,
    plus focus handoff between create previews and existing work-order action buttons.

17. The create preview needed stable mockup-like sizing.

    **Change:** Separated the visual preview width from the actual date range so the preview keeps
    a consistent design size unless constrained by nearby work orders.

## Work Order Bars and Menus

18. Work-order bars needed to remain usable in Day, Week, and Month views, including very short
    durations.

    **Change:** Removed artificial minimum bar widths, added clipping/overflow behavior for short
    bars, and introduced tooltip fallback when inline content would be clipped or collide with a
    nearby order.

19. Work-order status badges and the current-period label needed a reusable visual treatment.

    **Change:** Added a shared standalone chip component for current-period and status badges,
    including Open, In Progress, Complete, and Blocked variants.

20. The Edit/Delete action menu needed to be accessible and not clipped by timeline layers.

    **Change:** Added menu direction logic, z-index layering rules, arrow-key navigation,
    Escape/Tab dismissal, focus return to the trigger, and keyboard deletion focus recovery.

21. Work-order interactions needed direct editing support.

    **Change:** Added double-click editing for work orders while keeping menu interactions
    isolated from accidental edit activation.

22. Timeline layering became a key UX rule.

    **Change:** Established stacking priorities for modal, open menu, creation preview,
    floating-label tooltip, current-period label, current-period line, and existing work-order
    bars to avoid visual conflicts.

## Create/Edit Panel

23. The create/edit panel needed to match the mockups while remaining accessible.

    **Change:** Tightened spacing, reduced panel shadow, reserved stable error-message space,
    trapped focus in the dialog, and added required-field messaging without adding asterisks to
    every label.

24. Date inputs needed to use the mockup format.

    **Change:** Added a custom ng-bootstrap parser/formatter for `dd.mm.yyyy` display/input while
    continuing to store ISO dates internally.

25. The Work Center dropdown was not part of the modal mockup.

    **Change:** Removed the visible Work Center selector from the panel while preserving the
    selected work-center id in form state from the clicked or keyboard-selected timeline row.

26. The panel needed stronger validation and accessible error relationships.

    **Change:** Added a 100-character maximum for work-order names, blocked date ranges longer
    than two months, blocked reversed date ranges, marked both date fields invalid for shared
    range errors, and connected both date inputs to the shared error with `aria-describedby`.

27. Overlap and range errors should guide the user to the relevant field.

    **Change:** Failed submit focuses the first invalid control from the top. Overlap and shared
    date-range errors focus the Start date so the range can be adjusted.

## Data and Persistence

28. Schedule changes needed to flow through a service boundary instead of being purely local
    component state.

    **Change:** Added a mocked async schedule API service and updated the store so load, create,
    update, delete, clear, timescale, and viewport state persist through localStorage.

29. Clearing work orders needed to be easy during manual testing.

    **Change:** Added a Clear Work Orders toolbar button that clears stored work orders and resets
    transient timeline interaction state.

## Semantics and Accessibility

30. Scheduled work orders are ordered timeline events rather than standalone articles.

    **Change:** Changed timeline rows to ordered lists and work orders to list items while
    preserving layout and interactions.

31. Shared floating labels were needed for create hints and compact tooltips.

    **Change:** Added a reusable floating-label component with always-visible and tooltip modes,
    including start-aligned behavior for labels near the fixed Work Center column.

32. The datepicker needed better contrast and safer keyboard behavior.

    **Change:** Darkened ng-bootstrap datepicker accent colors and made Escape close an open
    datepicker first, returning focus to the matching input without closing the modal.

## Testing, CI, and Deployment

33. The project needed automated verification.

    **Change:** Added unit tests for the store, mocked API persistence, work-order panel
    validation, and the app shell.

34. The project needed a quick GitHub Actions pipeline and GitHub Pages support.

    **Change:** Added CI for pushes and pull requests to `main` and `develop`, running dependency
    install, tests, and a production build with the GitHub Pages base path. The README documents
    how the app can be built for GitHub Pages.

35. GitHub Actions needed deterministic dependency installation.

    **Change:** Kept `package-lock.json`, synced the lockfile with package metadata, and configured
    CI to use the project's npm version through Corepack before running `npm ci`.

## Future Ideas

36. Multi-user scheduling would make the timeline more realistic.

    **Future:** Add collaborative conflict checking, user attribution, change history, and
    conflict resolution when multiple users edit the same timeline.

37. Direct timeline manipulation would improve power-user workflows.

    **Future:** Add drag handles on work-order bar edges so users can resize start and end dates
    directly from the timeline.
