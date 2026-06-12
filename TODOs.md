# TODOs

This file tracks follow-up ideas that are intentionally outside the current prototype scope.

## Multi-User Scheduling

- Add real backend persistence so multiple users can access the same work-order timeline.
- Add authenticated users and store who created, edited, or deleted each work order.
- Track change history for each work order, including previous values, new values, user, and timestamp.
- Add real-time updates so one user's changes appear for other users without refreshing.
- Recheck overlap conflicts on the server when a user creates or edits a work order.
- Handle conflicts when two users create or edit overlapping work orders at the same time.
- Show a clear conflict message when another user has already taken the selected date range.
- Consider optimistic UI updates with rollback if the server rejects a conflicting change.
- Add a "last updated by" or activity indicator for recently changed work orders.
- Consider row or range-level soft locking while a user is actively editing a work order.

## Timeline Interaction Improvements

- Allow users to change a work order's start or end date directly from the timeline.
- Add drag handles on the left and right edges of a work-order bar for resizing its date range.
- Reuse overlap validation while dragging so users cannot resize into an occupied range.
- Provide keyboard-accessible alternatives for resizing dates without a mouse.
- After creating or editing an order with dates far outside the current viewport, automatically
  scroll or recenter the timeline near that saved work order and focus its action control.

## Possible Technical Direction

- Replace the mocked localStorage API with HTTP endpoints.
- Use WebSockets, Server-Sent Events, or a real-time database for live timeline updates.
- Add server-side validation as the source of truth for overlap checks.
- Add version numbers or updated-at timestamps to work orders for optimistic concurrency control.
- Add audit-log endpoints for history and troubleshooting.

## Testing Ideas

- Unit test conflict-detection edge cases around adjacent and overlapping date ranges.
- Add integration tests for rejected conflicting saves.
- Add end-to-end tests for two simulated users editing the same work center.
- Add accessibility checks for conflict messages and live-update announcements.
