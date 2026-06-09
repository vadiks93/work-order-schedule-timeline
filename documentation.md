# Work Order Schedule Timeline Documentation

## 1. Project Overview

The Work Order Schedule Timeline is an Angular application for displaying and managing
manufacturing work orders across multiple work centers.

Users can:

- View work orders on a horizontally scrollable timeline.
- Switch between day, week, and month timescales.
- Create a work order from an empty timeline row.
- Edit or delete an existing work order.
- Assign a status and date range to each order.
- Receive validation feedback when work orders overlap.

This implementation is a functional boilerplate intended to provide a maintainable foundation
for further visual refinement and feature development.

## 2. Technology Stack

- Angular 21.2 with standalone components
- TypeScript in strict mode
- Angular Reactive Forms
- SCSS using BEM naming conventions
- Angular Signals for local and shared state
- `@ng-select/ng-select` for select controls
- `@ng-bootstrap/ng-bootstrap` for datepickers
- Bootstrap 5 for ng-bootstrap base styling
- Vitest for unit tests

Angular 21 was selected because it is supported by the stable releases of both mandatory UI
libraries.

## 3. Running the Application

Requirements:

- Node.js 20.19 or newer
- npm 11 or newer

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

Open `http://localhost:57933`.

Create a production build:

```bash
npm run build
```

Run the unit tests:

```bash
npm test -- --watch=false
```

## 4. Project Structure

```text
src/
  app/
    data/
      sample-data.ts
    features/
      work-order-panel/
        work-order-panel.component.html
        work-order-panel.component.scss
        work-order-panel.component.ts
      work-order-schedule/
        work-order-schedule.component.html
        work-order-schedule.component.scss
        work-order-schedule.component.ts
    layout/
      app-header/
        app-header.component.html
        app-header.component.scss
        app-header.component.ts
      app-footer/
        app-footer.component.html
        app-footer.component.scss
        app-footer.component.ts
    models/
      schedule.models.ts
    services/
      schedule.store.ts
      schedule.store.spec.ts
    app.config.ts
    app.html
    app.spec.ts
    app.ts
  styles.scss
```

### Component responsibilities

`WorkOrderScheduleComponent`

- Renders the work-center list and timeline.
- Generates day, week, and month columns.
- Calculates work-order positions and widths.
- Handles create, edit, delete, menu, and timescale interactions.
- Displays the current-date indicator.
- Opens and closes the details panel.

`WorkOrderPanelComponent`

- Provides the shared create and edit form.
- Uses Angular Reactive Forms.
- Uses ng-select for work center and status.
- Uses ngb-datepicker for date selection.
- Emits validated work-order drafts to the parent component.

`ScheduleStore`

- Stores work centers and work orders using Angular Signals.
- Provides in-memory create, update, and delete operations.
- Filters orders by work center.
- Detects date overlaps.

`AppHeaderComponent`

- Provides the semantic application header.
- Displays the supplied NAOLOGIC logo with alternative text.
- Reserves a stable location for future navigation or account controls.

`AppFooterComponent`

- Provides an intentionally empty semantic footer.
- Reserves a stable application-shell area for future links or metadata.

## 5. Data Model

All business documents follow the required document structure.

### Work center

```typescript
interface WorkCenterDocument {
  docId: string;
  docType: 'workCenter';
  data: {
    name: string;
  };
}
```

### Work order

```typescript
interface WorkOrderDocument {
  docId: string;
  docType: 'workOrder';
  data: {
    name: string;
    workCenterId: string;
    status: WorkOrderStatus;
    startDate: string;
    endDate: string;
  };
}
```

### Status values

```typescript
type WorkOrderStatus = 'open' | 'in-progress' | 'complete' | 'blocked';
```

Dates are stored as ISO calendar dates in `YYYY-MM-DD` format.

## 6. Sample Data

The project contains:

- Five work centers.
- Eight work orders.
- All four required statuses.
- Multiple non-overlapping orders in one work center.
- Orders before and after the current date.

Dates are generated relative to the current date so the sample orders remain visible when the
application is opened in the future.

## 7. Timeline Behavior

### Work-center column

The left column displays work-center names and remains visually separate from the scrolling
timeline canvas.

### Horizontal scrolling

The timeline viewport scrolls horizontally when its canvas is wider than the available area.
It can receive keyboard focus so keyboard users can operate the scrollable region.

### Timescales

The mandatory timescales are:

- Day
- Week
- Month

Changing the timescale regenerates the timeline columns and recalculates work-order geometry.
All timescales display the same underlying work orders.

The Hour option visible in one design reference is not implemented because it is not part of
the written mandatory requirements.

### Visible ranges

- Day: two weeks before and after today.
- Week: approximately eight weeks before and after the current week.
- Month: six months before and after the current month.

### Position calculations

Day and week views calculate pixel positions from the number of elapsed calendar days relative
to the visible start date.

Month view calculates:

1. The number of whole months from the visible start month.
2. The order date's fractional position within its month.
3. The resulting position multiplied by the month column width.

End dates are inclusive. A work-order bar extends to the day following its end date when its
visual width is calculated.

### Current-period indicator

A vertical line marks the start of the current day, week, or month. Its label changes with the
selected timescale. On initial load and after a timescale change, the scroll viewport centers on
today's actual date.

## 8. Work Order Bars

Each visible work order displays:

- Work-order name
- Human-readable status label
- Status styling
- Three-dot action button
- Edit and Delete menu

Status styling:

| Status      | Visual treatment |
| ----------- | ---------------- |
| Open        | Blue/purple      |
| In progress | Blue/purple      |
| Complete    | Green            |
| Blocked     | Yellow/orange    |

The textual status remains visible so status is not communicated through color alone.

## 9. Create Workflow

1. Select an empty position in a work-center row.
2. The application converts the selected pixel position into a date.
3. The details panel opens.
4. Work center and start date are pre-filled.
5. End date defaults to seven days after the start date when the range is free.
6. If another order begins inside that range, the end date is shortened to the last available
   day before that order.
7. Status defaults to Open.
8. Submit the form using Create.

The same flow is keyboard-accessible by focusing and activating a row's create control. Keyboard
creation defaults to the current date because a keyboard event has no horizontal pointer
position.

## 10. Edit and Delete Workflows

### Edit

1. Focus or hover a work-order bar.
2. Activate its action button.
3. Select Edit.
4. The details panel opens with the existing values.
5. Submit using Save.

When overlap validation runs during editing, the order being edited is excluded from the
comparison.

### Delete

1. Open the work-order action menu.
2. Select Delete.
3. The order is removed from the in-memory store.

A delete confirmation dialog is not included in the current boilerplate.

## 11. Form Validation

The following fields are required:

- Work Order Name
- Work Center
- Status
- Start Date
- End Date

Additional validation:

- End date must be on or after the start date.
- A work order cannot overlap another order in the same work center.
- An order may use the same date range as an order in a different work center.

### Overlap rule

Two date ranges overlap when:

```text
newStart <= existingEnd AND newEnd >= existingStart
```

This treats both start and end dates as inclusive. Adjacent orders therefore need the next order
to start after the previous order's end date.

## 12. Panel Behavior

The details panel:

- Slides in from the right.
- Is used for both creation and editing.
- Has dialog semantics.
- Can be closed with Cancel.
- Can be closed by selecting the backdrop.
- Can be closed with the Escape key.
- Changes the primary action label between Create and Save.

The panel width is constrained so it remains usable at the project's minimum supported screen
width.

## 13. Styling Conventions

Component styles use BEM naming:

```scss
.work-order {
  &__name {
  }
  &__status {
  }
  &--complete {
  }
}
```

Global styles are limited to:

- Font definitions
- Page defaults
- Shared focus treatment
- Vendor styles

Component-specific styling remains within each standalone component.

The supplied Circular Std font URL is used with system-font fallbacks.

## 14. Responsive Scope

The minimum supported viewport width is 800px.

At 800px and above:

- The complete schedule remains usable.
- The work-center column remains visible.
- The timeline can scroll horizontally.
- The details panel retains a practical form width.

Below 800px, the application preserves the desktop canvas and relies on page-level horizontal
scrolling. A dedicated mobile layout is outside the scope of this first implementation.

## 15. Accessibility

The current accessibility baseline includes:

- Semantic headings and form labels.
- Native buttons and select controls.
- Dialog naming and description.
- Accessible names for timeline and action controls.
- Human-readable order date ranges.
- Visible keyboard focus styles.
- Keyboard access to creation and action menus.
- Escape handling for the menu and panel.
- Status text in addition to status color.
- Alert semantics for overlap errors.
- A skip link to the timeline.
- A focusable horizontally scrollable viewport.
- Reduced-motion support.
- Form fields marked with `aria-invalid` where applicable.

### Accessibility improvements still recommended

- Move focus into the panel when it opens.
- Trap focus inside the modal panel.
- Restore focus to the triggering control when the panel closes.
- Add arrow-key navigation to the custom action menu.
- Announce successful create, update, and delete operations.
- Run automated axe checks and a manual screen-reader review.
- Confirm color contrast against the final design tokens.

## 16. Testing

The current Vitest suite verifies:

- The root application renders.
- The Work Orders title renders.
- Five work centers render.
- Same-work-center overlap is detected.
- Matching dates in a different work center are accepted.
- Create, update, and delete store operations work.

The Vitest configuration uses one thread because process-fork workers timed out in the Windows
development environment.

Recommended future coverage:

- Timeline position calculations for every timescale.
- Pixel-position to date conversion.
- Form validation states.
- Create and edit integration tests.
- Action-menu keyboard behavior.
- Panel focus management.
- End-to-end tests with Playwright or Cypress.

## 17. Requirement Status

| Requirement                   | Status                        |
| ----------------------------- | ----------------------------- |
| Angular 17+                   | Implemented with Angular 21.2 |
| Standalone components         | Implemented                   |
| Semantic application header   | Implemented                   |
| Semantic application footer   | Implemented                   |
| Strict TypeScript             | Implemented                   |
| SCSS                          | Implemented                   |
| BEM styling                   | Implemented                   |
| Reactive Forms                | Implemented                   |
| ng-select                     | Implemented                   |
| ngb-datepicker                | Implemented                   |
| Day view                      | Implemented                   |
| Week view                     | Implemented                   |
| Month view                    | Implemented                   |
| Fixed work-center panel       | Implemented                   |
| Horizontal timeline scrolling | Implemented                   |
| Current-date indicator        | Implemented                   |
| Row hover state               | Implemented                   |
| Status badges                 | Implemented                   |
| Click timeline to create      | Implemented                   |
| Pre-filled start date         | Implemented                   |
| Default end date              | Implemented                   |
| Edit workflow                 | Implemented                   |
| Delete workflow               | Implemented                   |
| Click outside panel to close  | Implemented                   |
| Cancel panel action           | Implemented                   |
| Required-field validation     | Implemented                   |
| End-date validation           | Implemented                   |
| Overlap validation            | Implemented                   |
| Five or more work centers     | Implemented                   |
| Eight or more work orders     | Implemented                   |
| All statuses represented      | Implemented                   |
| Minimum 800px support         | Implemented                   |
| Unit tests                    | Partially implemented         |
| Pixel-perfect matching        | Requires further refinement   |
| Local storage                 | Not implemented               |
| Infinite scrolling            | Not implemented               |
| Today navigation button       | Not implemented               |
| Work-order tooltip            | Not implemented               |
| Drag date selection           | Not implemented               |
| Loom demonstration            | External deliverable          |
| Public repository             | External deliverable          |

## 18. Known Limitations

- Data is held in memory and is reset after page refresh.
- The design has not received a final pixel-by-pixel comparison against Sketch measurements.
- The create interaction selects one point rather than a dragged date range.
- Timeline ranges are finite.
- Orders cannot be dragged or resized.
- Delete has no confirmation step.
- There is no undo behavior.
- Datepicker and ng-select styling needs further visual alignment with the supplied references.
- The panel lacks a complete modal focus trap.
- The action menu does not yet implement full WAI-ARIA menu keyboard navigation.
- Month geometry is suitable for a planning view but may require additional precision rules for
  very long orders or timezone-sensitive business logic.

## 19. Recommended Improvement Roadmap

### Phase 1: visual refinement

- Measure exact spacing, colors, borders, shadows, and typography from Sketch.
- Match the panel width and field spacing.
- Refine status badges and order bars.
- Style ng-select and ngb-datepicker to match the references.
- Add the exact logo asset if supplied.

### Phase 2: interaction quality

- Add drag selection for start and end dates.
- Add a Today button.
- Center the initial viewport on the current date.
- Add delete confirmation and success announcements.
- Improve menu positioning near viewport edges.

### Phase 3: accessibility

- Implement modal focus trapping and focus restoration.
- Add complete keyboard navigation for the action menu.
- Test with NVDA and VoiceOver.
- Add automated axe accessibility tests.

### Phase 4: persistence and scale

- Persist work orders in localStorage or a backend API.
- Add infinite or virtualized horizontal scrolling.
- Add optimistic update and error handling.
- Add timezone and locale policies.

### Phase 5: test coverage

- Add component interaction tests.
- Add date-geometry unit tests.
- Add Playwright end-to-end scenarios.
- Add visual-regression screenshots.

## 20. External Deliverables

The original requirements also request:

- A public GitHub or GitLab repository.
- A five-to-ten-minute Loom demonstration.
- A clean commit history.

The demonstration should cover:

1. Switching between all timescales.
2. Creating a work order.
3. Editing a work order.
4. Deleting a work order.
5. Triggering an overlap validation error.
6. Explaining the component and store structure.

## 21. AI-Assisted Thought Process

The chronological user question and iteration log is maintained in
[`thought-process.md`](thought-process.md). It contains requests and corrections only, without
assistant answers, so it can be included as evidence of the project's AI-assisted development
process.
