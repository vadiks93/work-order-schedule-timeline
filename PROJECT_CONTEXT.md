# Project Context

## Snapshot

This is an Angular standalone implementation of the Work Order Schedule Timeline. The project follows the requirements in `FE-technical-test (3).md` and uses the supplied mockups as visual guidance.

The current work is focused on polishing the timeline UI, modal interactions, accessibility, and mocked persistence while keeping the implementation approachable for further iteration.

## Current Structure

- `work-order-schedule` owns the timeline grid, time-scale controls, work-order positioning, hover previews, current-period marker, and row/menu interactions.
- `work-order-panel` owns the create/edit side panel and form validation.
- `schedule.store.ts` manages schedule state.
- `schedule-api.service.ts` provides a mocked async persistence layer backed by localStorage.
- `chip` provides reusable badge styling for statuses and the current-period label.
- `floating-label` is shared by hover labels/tooltips such as "Click to add dates" and compact work-order tooltips.

## Current UI Direction

- Compact schedule grid with sticky Work Center column.
- Chip-style statuses with color variants.
- Current day/week/month marker centered by the selected time scale.
- Side panel modal for creating and editing work orders.
- Keyboard-accessible work-order menus.
- Short work orders keep their inner content visible, clip it to the bar width, and expose a
  tooltip when the content is likely clipped.
- Timeline overlap priority should keep the current period label visible above all timeline
  content, keep create previews and their "Click to add dates" label above work orders, and keep
  modal backdrop/panel above every timeline layer.

## Known Follow-Ups

- Continue pixel-perfect comparison against the mockups.
- Revisit week and month view overlap behavior.
- Check tooltip clipping near sticky columns and scroll boundaries.
- Reduce the `work-order-schedule.component.scss` size if the style budget warning becomes noisy.
- Add stronger visual regression coverage if time allows.

## Useful Checks

```bash
npm run build
npm test
```

The build has recently passed, with a warning that `work-order-schedule.component.scss` is over the configured style budget.
