# Work Order Schedule Timeline

An Angular 21 standalone application for displaying and managing manufacturing work orders
across multiple work centers.

This repository is a functional foundation for the supplied frontend technical test. It
implements the core scheduling workflows while keeping the code approachable for further
design refinement, accessibility work, persistence, and testing.

## Features

- Day, week, and month timeline views
- Horizontally scrollable schedule with a fixed work-center column
- Current-date indicator
- Five sample work centers and eight sample work orders
- Create and edit slide-out panel
- Reactive Forms with required-field and date-range validation
- Same-work-center overlap detection
- Edit and delete action menu
- `ng-select` work-center and status controls
- `ngb-datepicker` date controls
- Standalone header, schedule, panel, and footer components
- BEM-style component SCSS
- Minimum supported viewport width of 800px
- Keyboard controls, semantic labels, focus states, and reduced-motion support
- Vitest unit tests

## Technology

- Angular 21.2
- TypeScript with strict mode
- Angular Signals
- Angular Reactive Forms
- SCSS
- `@ng-select/ng-select`
- `@ng-bootstrap/ng-bootstrap`
- Bootstrap 5
- Vitest

Angular 21 is used because it is supported by the stable versions of the mandatory UI
libraries.

## Requirements

- Node.js 20.19 or newer
- npm 11 or newer

## Local Development

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

## Continuous Integration

The repository includes a GitHub Actions workflow at `.github/workflows/ci.yml`. On pushes and
pull requests targeting `main` or `develop`, it installs dependencies with `npm ci`, runs the
unit tests, and creates a production build using the GitHub Pages base path.

## GitHub Pages

This project can be hosted as a static Angular build on GitHub Pages.

For a repository named `work-order-schedule-timeline`, build with the matching base path:

```bash
npm run build -- --base-href /work-order-schedule-timeline/
```

Publish the generated `dist/work-order-schedule-timeline/browser` folder to GitHub Pages. If
the repository name changes, update the `--base-href` value to match the published path.

## Project Structure

```text
src/app/
  data/                          Hardcoded sample documents
  features/
    work-order-panel/            Shared create/edit form
    work-order-schedule/         Timeline rendering and interactions
  layout/
    app-header/                  Application header and logo
    app-footer/                  Reserved application footer
  models/                        Work center, order, and timeline types
  services/
    schedule.store.ts            In-memory CRUD and overlap validation
```

Timeline geometry is calculated from a timescale-specific start date and column width. Day and
week views use calendar-day offsets. Month view uses a fractional position within each calendar
month. The work-center column is rendered separately from the scrollable timeline canvas.

## Accessibility

The current baseline includes:

- Semantic header, main content, sections, forms, and footer
- Labeled form and timeline controls
- Visible keyboard focus styles
- Keyboard-accessible create and order action controls
- Escape handling for menus and the slide-out panel
- Dialog and alert semantics
- Text labels in addition to status colors
- Reduced-motion support
- A skip link to the timeline

Recommended next steps include modal focus trapping, focus restoration, complete action-menu
keyboard navigation, automated axe checks, and manual screen-reader testing.

## Current Limits

- Data is mocked through a local service and persisted in `localStorage`.
- The layout targets viewports of 800px and wider.
- The styling still needs a final pixel-by-pixel pass against the Sketch file.
- Drag selection, infinite scrolling, and end-to-end tests are not included.
- The empty footer is intentionally reserved for future application content.

See [documentation.md](documentation.md) for the complete requirement mapping, implementation
details, known limitations, and improvement roadmap.

See [thought-process.md](thought-process.md) for the chronological list of project questions,
requests, and corrections used during AI-assisted development.

## Private GitHub Repository

After creating an empty private repository on GitHub, initialize and publish this project with:

```bash
git init -b main
git add .
git commit -m "Initial work order schedule timeline"
git remote add origin <private-repository-url>
git push -u origin main
```

Do not commit credentials, access tokens, or local `.env` files. The included `.gitignore`
excludes dependencies, build output, Angular caches, test reports, editor files, environment
files, and common operating-system files.
