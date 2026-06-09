# Project Thought Process

This file records the user's questions, requests, corrections, and implementation decisions in
chronological order. Each entry includes a short summary of the resulting change, without
reproducing full assistant answers.

## Initial Exploration

1. I have a new project planned for a Work Order Schedule Timeline. Are you able to reproduce
   Angular components based on the images in this folder?

   **Change:** Reviewed the supplied design images and identified the main Angular component
   structure.

2. I also have documentation in the Markdown file.

   **Change:** Reviewed the technical-test Markdown file alongside the design references.

3. Can you implement a boilerplate? It does not need to be very deep, but I would like it to
   respect the requirements so I can test, code, and improve it through further prompting.
   Please use the latest stable Angular version, standalone components, and call the project
   `work-order-schedule-timeline`.

   **Change:** Scaffolded the standalone Angular application and implemented the first functional
   timeline, form panel, sample data, validation, tests, and documentation.

4. It is fine if Angular 22 is not available; Angular 21 works too.

   **Change:** Used Angular 21 because the required stable UI libraries support it.

## Styling and Accessibility Direction

5. Can you use the BEM approach for styling?

   **Change:** Used BEM-style class naming in the component SCSS.

6. It does not have to be fully responsive to start with. A minimum screen width of 800px is
   acceptable, and I would like it to be accessible.

   **Change:** Added an 800px minimum layout and an accessibility baseline with semantic controls,
   labels, focus states, keyboard interactions, and reduced-motion support.

7. By 800px, I mean the minimum supported screen width.

   **Change:** Confirmed the 800px minimum in the layout CSS and project documentation.

## Documentation and Shared Context

8. Can you define a `documentation.md` file containing everything stated and required?

   **Change:** Added comprehensive implementation and requirement documentation.

9. The documentation should also serve as context for future work.

   **Change:** Structured the documentation around architecture, behavior, limitations, status,
   and an improvement roadmap.

## Timeline Refinement

10. Can you use more space for the timeline?

    **Change:** Initially widened the schedule container and reduced surrounding layout space.

11. In some cases, when the scheduled time is short, the status overlaps other content. Can we
    trim the status, use two letters, or use an icon?

    **Change:** Initially added adaptive full, abbreviated, and dot status treatments based on bar
    width.

12. Please undo all of those latest timeline-width and compact-status changes.

    **Change:** Reverted the wider timeline and adaptive status experiment.

## Branding

13. Can you use the `Group 3` image instead of the NAOLOGIC text and add `alt="NAOLOGIC"`?

    **Change:** Added the supplied logo image to public assets and replaced the text branding.

## Alignment Review

14. I fixed a one-pixel issue in the timeline row CSS. Did you set the row to `49px` on purpose?

    **Change:** Reviewed the row-height calculation and recommended an explicit border-box
    `50px` row.

15. The rows were unaligned.

    **Change:** Preserved the corrected `50px` timeline row alignment.

## Repository and Application Shell

16. I want to move this project into a private GitHub repository.

    **Change:** Prepared and initialized the local Git repository on the `main` branch.

17. Even if it does not initially contain much, can you add a header containing only the
    NAOLOGIC logo and add an empty footer?

    **Change:** Added standalone semantic header and footer components and moved the logo into the
    header.

18. Can you add a README and `.gitignore`, or check whether the existing ones are good?

    **Change:** Expanded the README and strengthened the Angular `.gitignore` for secrets, caches,
    builds, and test artifacts.

19. I pushed the project and want to switch to a `develop` branch. Since I am working alone, is
    it okay to commit only to the `develop` branch?

    **Change:** Adopted `develop` for ongoing work while keeping `main` stable.

20. Create and switch to the `develop` branch:

    ```bash
    git switch -c develop
    ```

    **Change:** Created and switched the local repository to `develop`.

## Initial Timescale Defect

21. On the first load, the timeline appears to use the month view while the dropdown displays
    day. Can you fix the initial default timeline view and dropdown mismatch?

    **Change:** Made Day the source-of-truth default, synchronized the native select through
    Angular forms, and added a regression test.

## AI-Assisted Process Log

22. Can you keep track of all my questions in another Markdown file to show my thought process?

    **Change:** Created this chronological thought-process log.

23. Can you include all my previous questions as well, without adding the answers?

    **Change:** Added the earlier project requests and corrections without full assistant answers.

24. Can each entry also include a short summary of which change was added?

    **Change:** Added concise change summaries to every entry and established this format for
    future updates.

## Fluid Timeline Scaling

25. Can the component scale up on wider screens and when zooming out, while also improving its
    layout down to the 800px minimum? Keep the row height at 50px around a 1536px viewport, but
    allow it to become shorter or taller as the available width changes.

    **Change:** Removed the fixed 1280px content ceiling and introduced shared fluid CSS
    dimensions for shell gutters, work-center width, timeline height, header height, row height,
    and work-order bar height. Rows remain approximately 50px at 1536px, compact toward 44px at
    the minimum width, and expand up to 58px on wide screens.

26. Can you add a little right margin to the main section and, if it is not already present, add
    a semantic main section that wraps the timeline component?

    **Change:** Moved the semantic `<main>` element into the application shell so it wraps the
    complete timeline component, changed the component root to a regular container, and added a
    small fluid right margin to the main area.

27. The left margin still looks too small. Can you make it closer to the spacing shown in
    `Work Order Schedule - Default.png`?

    **Change:** Increased the shared fluid application gutter to approximately 100px at a 1536px
    viewport, matching the reference more closely. It reduces to about 52px at the 800px minimum
    and is capped at 120px on wider screens.

28. When hovering over an available timeline area, can you use the supplied `Pointing.svg`
    cursor and show the mockup's temporary selection block with the text "Click to add dates"
    above it?

    **Change:** Added the supplied pointing-hand cursor and a seven-day hover preview matching the
    create form's default range. The preview is shown only when the proposed range does not
    overlap another order in the same work center.

29. Can the timescale control use `ng-select`, with more space between its arrow and right edge?
    Also, the Edit/Delete action menu is horizontally clipped and the Delete option is difficult
    to see.

    **Change:** Replaced the native timescale select with `ng-select`, added extra right padding
    around its arrow, and realigned the work-order action menu inside the order bar so both Edit
    and Delete remain visible near timeline viewport edges.

30. Can the Timescale label and dropdown more closely match
    `Work Order Schedule - View Selection.png`? The control and options appear smaller, and the
    label should be vertically aligned with the selected value.

    **Change:** Reduced the joined Timescale control to 28px, aligned both sides vertically,
    tightened its typography and arrow spacing, and styled the dropdown as a compact 200px menu
    with 28px options positioned beneath the full joined control.

## Progress Review

31. Can you summarize everything changed since the last commit? There are still several noticed
    bugs, but they can be handled later.

    **Change:** Reviewed the complete working-tree diff against commit `342aa2a` and summarized
    the responsive layout, semantic shell, timeline interactions, timescale control, menu fix,
    tests, assets, and documentation changes.

32. Can you remove the Angular icon from the browser tab and use a NAOLOGIC icon instead?

    **Change:** Replaced the default Angular favicon reference with a compact NAOLOGIC-blue
    monogram SVG designed to remain recognizable at browser-tab size.

33. Can the Edit and Delete controls match the dimensions in
    `Work Order Schedule - Edit and Delete Controls Expanded.png`? The sticky timeline header
    appears above the menu, and the first-row "Click to add dates" label is also hidden below the
    date columns.

    **Change:** Matched the action menu to an approximately 200px by 80px mockup footprint with
    full-width 31px action rows. Added active-row stacking so open menus and hover-preview labels
    render above the sticky timeline header.

34. The requirement says the timeline should be centered on today with scale-dependent ranges.
    Can the initial viewport and every timescale change show the current date, and can the marker
    say "Current day," "Current week," or "Current month" depending on the selected scale?

    **Change:** Added automatic horizontal centering on today's actual date after initial render
    and timescale changes. Normalized the ranges to plus/minus two weeks, eight weeks, and six
    months, and replaced the fixed current-date label with a scale-aware current-period marker
    styled inside the timeline header.

35. Can the current-period label sit below the timeline header like the Default mockup, be a
    little smaller, and have its vertical line continue down to just above the horizontal
    scrollbar?

    **Change:** Moved the current-period pill two pixels below the header, reduced its typography
    and padding, delayed the visible line until beneath the pill, and extended the line to 16px
    above the viewport bottom so it ends at the horizontal scrollbar.

36. After adjusting the current day, week, and month label, can the vertical line extend fully to
    the end of the timeline?

    **Change:** Preserved the custom label styling and removed the remaining 16px bottom offset so
    the current-period line reaches the full timeline canvas bottom.

37. Can repeated color values be grouped into variables declared globally in `styles.scss`?

    **Change:** Added semantic global CSS custom properties for the complete application palette
    and replaced color literals across the schedule, panel, header, footer, focus, shadow, status,
    error, and overlay styles.

38. The current day, week, or month marker disappears when hovering the first row. Can it remain
    visible even if it overlaps slightly?

    **Change:** Raised the current-period marker above active timeline rows so its label and line
    remain visible during first-row hover.

39. The mockups do not show horizontal separator lines across the timeline canvas. Can those be
    removed while keeping the separators in the Work Center column?

    **Change:** Removed horizontal borders from timeline rows while preserving the fixed
    Work Center row separators and vertical date-grid lines.

40. Can the vertical date-grid lines continue to the end of the timeline, stopping where the
    horizontal scrollbar begins?

    **Change:** Replaced row-level grid fragments with one continuous background grid spanning
    from beneath the date header to the bottom of the timeline canvas.

41. Can the small gap between the current-period label and its vertical line be filled, and can
    the line remain above all created work-order bars in every row?

    **Change:** Removed the transparent section at the top of the current-period line and raised
    the marker layer above all timeline rows, previews, menus, and work-order bars.

42. When selecting a timeline slot, can the default seven-day range remain selectable if a later
    work order overlaps part of it by filling only the available days before that order?

    **Change:** Added a shared available-range calculation. Creation and hover previews still use
    the seven-day maximum, but automatically shorten their end date to the day before the next
    order. Selecting a date already occupied by an order remains unavailable.

43. Can the current day, week, or month label become a reusable chip component, can timeline
    statuses be larger and easier to read, can Open use the mockup's light-blue color, and can
    the create/edit status select use the same badges?

    **Change:** Added a reusable standalone chip component with compact and timeline sizes,
    improved font sizing, and distinct Open, In Progress, Complete, and Blocked
    colors. Timeline statuses now use the larger size, while the create/edit status select uses
    the same chips for its selected value and dropdown options.

44. The added text spacing appears to affect more than the status badges, including work-order
    names. Can it be removed?

    **Change:** Removed chip letter spacing and retained the improved readability through the
    larger font sizes and status-specific styling.

45. Can the create/edit dialog keep keyboard focus contained after the end-date control, reserve
    space for validation errors, and connect invalid fields to their messages with
    `aria-describedby`?

    **Change:** Added keyboard focus wrapping within the dialog, stable error-message slots, and
    conditional `aria-invalid` and `aria-describedby` relationships for the name and date fields.

46. Can the Open status color match the cyan styling shown in the Options CTA Controls mockup?

    **Change:** Updated the Open chip to cyan text on a pale-cyan background and gave Open
    work-order bars the matching pale-cyan background and border from the reference.

47. Can the work-order action menu appear above every timeline element, use slightly smaller
    text, and can double-clicking a work order open it for editing?

    **Change:** Raised a row above the timeline layers only while its action menu is open, raised
    the menu within that row, reduced work-order, status, and menu text slightly, and added
    double-click editing without allowing menu interactions to trigger it.

48. Can the current-period vertical line appear underneath existing work orders?

    **Change:** Separated the current-period label from its line so the line renders below
    work-order bars while the label remains visible above timeline content.

49. Can the current-period line also begin beneath the current day, week, or month label?

    **Change:** Moved the start of the vertical line to the bottom edge of the current-period
    chip so it no longer runs behind the label.

50. Before committing, can the spacing between fields in the create/edit dialog be reduced?

    **Change:** Tightened the form padding, spacing between fields, and label/control gaps while
    retaining fixed validation-message space to prevent layout shifts.

51. The fields below an error still move when a validation message appears. Can their positions
    remain completely stable?

    **Change:** Changed every field's validation area to an equal fixed-height row sized for
    wrapped messages, preventing errors from changing the position of later modal fields.

52. Can the shadow on the left side of the create/edit panel be reduced to better match the
    Create New Event mockup?

    **Change:** Reduced the panel shadow's offset, blur, and opacity for a subtler separation from
    the timeline.

53. Since every modal field is required, should each label use an asterisk or should the form use
    one simple required-fields message while remaining close to the mockup?

    **Change:** Added one subtle "All fields are required" note beneath the panel description and
    applied native or ARIA required semantics to every form control without adding label clutter.

54. The Edit/Delete menu is clipped behind the fixed Work Center column when opened from a short
    work order near the left edge. Can it remain fully visible?

    **Change:** Made the action menu choose its opening direction from the available timeline
    viewport space, opening to the right near the left edge and to the left near the right edge.

55. Can the Edit/Delete menu support arrow-key selection, close when tabbing away, and return
    focus to the current work order's three-dot button when Escape is pressed?

    **Change:** Added managed menu focus with Up/Down and Home/End navigation, Tab dismissal with
    continued timeline focus movement, and Escape dismissal that restores focus to the trigger.

56. When deleting with the keyboard, can focus move to the next work order, or to the timeline if
    there is no next work order?

    **Change:** Keyboard deletion now captures the next work-order action before removal and
    focuses it afterward, falling back to the timeline viewport. Mouse deletion remains unchanged.

57. In Week and Month views, why does a new-order hover preview overlap a nearby existing order
    when the available gap is small?

    **Change:** Removed the 42px minimum visual width from creation previews. Narrow valid ranges
    now use their true timeline width and stop precisely before the next existing order.

58. Can the overall interface use slightly smaller typography and tighter spacing, while leaving
    chip sizes unchanged and giving Work Center names a modestly stronger weight?

    **Change:** Applied a restrained density pass across the page, timeline controls, work orders,
    menus, and panel. Chips remain unchanged, row heights stay responsive, and Work Center names
    now use the medium font weight.

59. Can work-order names displayed inside timeline bars also be slightly bolder?

    **Change:** Applied the medium font weight to timeline work-order names without changing
    status chips or other timeline labels.

60. In the create/edit status dropdown, can options display as plain text while the selected
    status remains a badge?

    **Change:** Kept the selected status rendered with the shared chip component and changed the
    dropdown option list to plain text for closer mockup alignment.

61. Can the plain status options be slightly larger, prevent the selected Open option from
    appearing blue, and ensure text does not inherit extra letter spacing?

    **Change:** Increased status option text to 13px, normalized selected and hovered option
    colors, and explicitly reset letter spacing on page controls and dropdown options.

62. Can the create/edit form display and accept dates using the mockup's `dd.mm.yyyy` format?

    **Change:** Added an ng-bootstrap date parser/formatter for `dd.mm.yyyy` display and input,
    while preserving ISO `yyyy-mm-dd` values for storage and timeline calculations.

63. Can the space between a status and its three-dot action be reduced, and can the action control
    use less padding to better match the mockups and fit Week/Month bars?

    **Change:** Reduced the work-order content gap and made the three-dot control smaller, while
    updating the right-opening menu anchor to remain aligned with the compact control.
