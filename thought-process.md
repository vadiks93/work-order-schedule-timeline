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

64. Can the expanded Edit/Delete menu and its text be smaller to better match the mockup?

    **Change:** Reduced the menu width, height, padding, action row height, and text size, and
    synchronized its viewport-edge direction calculation with the new compact width.

65. Can the timeline header use less vertical space and remove the vertical separators from the
    date headings and the Work Center heading?

    **Change:** Reduced the responsive timeline header height, removed date-header right borders,
    and removed the Work Center column edge shadow that appeared as a vertical divider.

66. Can the Edit/Delete actions use a slightly bolder weight and become dark only when hovered or
    keyboard-focused?

    **Change:** Applied the medium font weight to menu actions, changed their default color to
    muted text, and added dark text on hover and focus alongside the existing highlight.

67. Can the right border of the fixed Work Center column be restored?

    **Change:** Restored a one-pixel right divider on the Work Center column while keeping the
    individual date-header vertical separators removed.

68. Can the Edit/Delete actions remain blue by default and turn black only on hover or focus?

    **Change:** Restored the menu actions' blue default text while retaining dark text for their
    hover and keyboard-focus states.

69. Can all dropdown and action-menu items use dark text initially and switch to blue when
    hovered or keyboard-focused?

    **Change:** Standardized timescale options, panel select options, and Edit/Delete actions to
    use neutral dark text at rest and blue text for marked, hovered, or focused states.

70. Can the status options in the create/edit panel use slightly smaller text and less vertical
    spacing to match the mockup?

    **Change:** Reduced status option text to 12px and tightened each option's height, padding,
    and line height while leaving the selected status chip unchanged.

71. Can letter spacing be removed from panel dropdown items and can the Work Center dropdown use
    the same compact option styling as Status?

    **Change:** Explicitly reset panel option letter spacing to zero and applied the same 12px
    text, 30px row height, padding, and line height to Work Center and Status options.

72. Can the Status dropdown options appear slightly bolder like the mockup?

    **Change:** Increased panel dropdown option text to the medium font weight for both Status and
    Work Center, preserving the selected status chip styling.

73. Can the timeline component's pixel-based font sizes use variables, and does it make sense to
    keep those variables local to the component?

    **Change:** Added a component-local semantic type scale using `rem`-based Sass variables and
    replaced timeline font-size literals with those variables. Sass variables keep the generated
    CSS within Angular's component budget; pixels remain for precise borders, icons, and geometry.

74. Can narrow work-order bars show a tooltip with the work-order name and status, and hide their
    inline name/status text when the rendered width is under 150px?

    **Change:** Added a rendered-width compact check for work orders. Compact bars now hide their
    inline name and status, keep the action control, and show a hover/focus tooltip with the name
    and status across Day, Week, and Month views.

75. Can all schedule data operations go through a service that could later call an API
    asynchronously, while remaining mocked for now and persisting to localStorage?

    **Change:** Added a mocked async schedule API service with load/create/update/delete methods
    backed by localStorage. The schedule store now loads through that service and persists
    optimistic work-order mutations through the same API boundary.

76. Can the timescale dropdown options use nearly the same font size as the selected value shown
    in the control?

    **Change:** Matched the timescale option font size and weight to the selected control value
    while preserving the existing hover and marked-state colors.

77. Can the "Click to add dates" label and compact work-order tooltip share one reusable visual
    implementation?

    **Change:** Added a standalone floating-label component with always-visible and tooltip modes.
    The creation preview and compact work-order tooltip now reuse that component instead of
    keeping separate label markup and styles.

78. Can the Work Center header and timeline date header labels be slightly smaller with a little
    less vertical spacing?

    **Change:** Added a smaller header font-size token for timeline headings and reduced the
    responsive timeline header height slightly so the header matches the mockups more closely.

79. Should scheduled work orders use list semantics instead of `article` elements?

    **Change:** Changed each timeline row to an ordered list and each work order to a list item,
    preserving the existing classes, positioning, and interactions while improving schedule
    semantics.

80. Can compact work-order tooltips appear above the fixed Work Center column instead of being
    visually cut off on the left side?

    **Change:** Raised rows that contain floating labels above the fixed Work Center column and
    increased the floating label z-index so compact tooltips render over neighboring timeline
    layers.

81. The compact work-order tooltip is still clipped near the left edge. Can it avoid extending
    into the Work Center column?

    **Change:** Added a start-aligned mode to the floating-label component and used it for compact
    work-order tooltips. These tooltips now open from the work-order bar toward the right instead
    of centering across the clipped left side.

82. When the create/edit modal opens, existing timeline events can still appear above the modal.
    Can the modal layer sit above all timeline content?

    **Change:** Added modal z-index tokens and raised the backdrop and panel above the highest
    timeline layers, including menus, active rows, and floating labels.

83. When opening the create/edit modal, can the selected work-center row remain visually hovered
    or focused underneath the modal backdrop?

    **Change:** Added selected work-center row state for create and edit flows, applied the hover
    row background to the matching timeline row and Work Center label while the panel is open, and
    cleared the selection when the panel closes.

84. Can the modal-open selection keep the timeline row highlight only, without highlighting the
    left Work Center label?

    **Change:** Removed the persistent selected styling from the Work Center label and kept it only
    on the matching timeline row.

85. Can the project keep durable context for future Codex sessions without repeating the same
    guidance in multiple places?

    **Change:** Added `AGENTS.md` for repo-level Codex working rules and `PROJECT_CONTEXT.md` as a
    concise handoff snapshot of the current architecture, UI direction, known follow-ups, and
    verification commands.

86. Can short work-order bars stop hiding their name and status while the final compact design is
    still undecided?

    **Change:** Removed the compact empty-bar state so short work orders continue to render their
    name, status chip, and actions instead of showing only the menu button and tooltip.

87. When creating or editing a work order, can submitting an invalid form move focus to the first
    invalid input from the top?

    **Change:** Added ordered invalid-control focus in the work-order panel submit flow so failed
    validation scrolls and focuses the first invalid field, using the end date for date-range
    errors.

88. Can short work-order bars keep rendering their inner content but clip it to the actual bar
    width instead of hiding the text?

    **Change:** Wrapped the work-order name, status chip, and menu trigger in a full-width clipped
    content layer while keeping the menu popover outside that clipping boundary.

89. Can the start and end date fields stop showing browser-saved option popups when clicked?

    **Change:** Disabled autocomplete on the start and end date inputs so browser suggestions do
    not appear over the date controls while keeping the datepicker buttons available.

90. Can the timescale control text look a little bolder like the mockups?

    **Change:** Increased the timescale label, selected value, and dropdown option weights while
    keeping the control dimensions unchanged.

91. Can the timescale dropdown arrow look more like the mockup's simple "v" chevron?

    **Change:** Replaced the default ng-select triangle arrow for the timescale control with a
    small bordered chevron that flips when the dropdown opens.

92. Can the timescale chevron stay neutral by default and become blue only when opened?

    **Change:** Set the timescale chevron to the normal control text color by default and switched
    it to the primary color only for the opened dropdown state.

93. Can the timeline focus border avoid overlapping work orders near the viewport edges?

    **Change:** Changed the timeline viewport focus ring from an inset shadow to an outer shadow so
    the keyboard focus indication remains visible without painting over work-order bars.

94. The outer viewport focus shadow was clipped and disappeared. Can the focus border be visible
    again without overlapping work orders?

    **Change:** Moved the visible focus ring to the outer timeline container whenever the scrollable
    viewport has keyboard focus, keeping the focus cue visible outside the work-order canvas.

95. Can tiny consecutive work orders in week and month views avoid visually overlapping?

    **Change:** Removed the artificial minimum width from saved work-order bars so they render at
    their true scaled date width, allowing very small bars instead of overlapping nearby orders.

96. Can work orders show a tooltip again when their name or status is clipped by a short bar?

    **Change:** Reused the floating-label tooltip for narrow work-order bars while keeping the
    clipped inner content visible inside the actual bar width.

97. Can the timeline typography, spacing, and available layout area scale better on very large
    screens such as TVs?

    **Change:** Increased the large-screen caps for the global timeline sizing tokens and added a
    large-viewport root font-size scale so rem-based timeline text grows modestly beyond desktop
    widths.

98. Can the edit/delete menu stop triggering row hover states underneath, and can the add-date
    hover preview appear more reliably across the empty row area?

    **Change:** Moved create hover/click handling to the timeline row, kept the invisible create
    button for keyboard activation, and suppresses add-date previews while a work-order action menu
    is open.

99. Can open work-order menus stop causing lower rows to flicker as hovered, and can clipped-order
    tooltips render above neighboring bars?

    **Change:** Added a menu-open timeline state and global layering rules so non-menu rows do not
    show hover styling underneath an open menu, while active work-order rows and menu rows rise
    above neighboring bars.

100. Can the create-preview tooltip avoid causing neighboring rows to flicker when it overlaps
     them?

     **Change:** Added an active preview timeline state, raised the previewing row above neighboring
     rows, suppressed hover styling on non-preview rows while previewing, and allowed the preview
     itself to catch pointer events instead of letting the browser hover through it.

101. Is the default new work-order selection using eight displayed days instead of seven?

     **Change:** Corrected the default creation range to seven inclusive calendar days. A start
     date of January 1 now defaults to an end date of January 7, while overlap-shortening behavior
     still stops the range on the day before the next existing order.

102. Can keyboard navigation be enhanced so arrow keys move an add-date selection across days and
     work-center rows while preserving Tab and Shift+Tab navigation?

     **Change:** Added arrow-key navigation for focused timeline create targets. ArrowRight and
     ArrowLeft move the proposed creation range by one day, starting from the visible timeline
     area with a seven-day edge offset. ArrowUp and ArrowDown move the same proposed start date
     between work centers. Each move reuses the existing available-range logic, skipping occupied
     starts and shortening the range before the next conflicting work order.

103. Can the create hover effect keep a fixed mockup-like width, focus the new work order's
     action button after keyboard creation, and move the timeline instructions into a help
     tooltip?

     **Change:** Separated the visual create-preview width from the real date range so the hover
     block stays a fixed design-sized width while the form still receives the actual seven-day or
     conflict-shortened range. Keyboard-created work orders now return focus to their three-dot
     action button after save. The visible instruction text was replaced by a question-mark help
     control using the shared floating-label tooltip, while full keyboard and mouse instructions
     remain available through screen-reader text.

104. Can keyboard focus move spatially between arrow-selected create previews and existing work
     orders?

     **Change:** Added keyboard handoff rules between create previews and work-order action
     buttons. When a keyboard preview is active, Tab moves to the nearest following work order or
     next row, and Shift+Tab moves to the nearest previous work order or previous row. From an
     existing work-order action, arrow keys return focus to the row create target and open a
     preview before, after, or on the adjacent work-center row.

105. Can a Clear Work Orders button be added next to the timescale control for testing?

     **Change:** Added a compact toolbar button matching the timescale control height. It clears
     all current work orders, resets transient timeline interaction state, and persists the empty
     schedule through the mocked localStorage-backed API.

106. Can the Work Center dropdown be removed from the create/edit modal because it is not shown
     in the mockup?

     **Change:** Removed the visible Work Center selector from the modal while keeping the
     selected work center in form state from the clicked or keyboard-selected timeline row. Invalid
     form focus now skips the hidden work-center control.

107. Can the timeline extend when scrolling or arrow-navigating so it is possible to explore a
     wider time range?

     **Change:** Added delayed timeline expansion near the horizontal scroll edges and when
     keyboard preview navigation moves beyond the current canvas. The timeline now appends extra
     day, week, or month columns after roughly half a second, preserving scroll position when
     expanding to the left.

108. Can a button scroll back to the current date, and can dynamic timeline expansion wait longer?

     **Change:** Added a compact Today toolbar button that recenters the viewport on the current
     day, week, or month while preserving any dynamically expanded timeline range. Tuned the
     dynamic horizontal expansion delay so the timeline expands less eagerly while scrolling.

109. Can short work-order text overflow only when it will not collide with a nearby work order?

     **Change:** Added an estimated inline-content collision check for each work order. Short or
     clipped work orders may let their name, status, and action content extend beyond the bar only
     when there is enough empty space before the next work order in the same row. If that content
     would collide, the bar keeps clipped content and shows the tooltip instead.

110. Can the selected timeline scale be stored in localStorage?

     **Change:** Persisted the selected Day, Week, or Month timescale in localStorage and restored
     it on reload with a validated Day fallback for missing or invalid stored values.

111. Can overlap errors focus the start date, and can work orders longer than two months show a
     validation error?

     **Change:** When the schedule detects an overlap, the create/edit panel now focuses the
     Start date field. The panel also allows users to enter long ranges but blocks submission when
     the selected end date is more than two calendar months after the start date, marking both date
     inputs invalid and focusing Start date so the range can be adjusted.

112. Can changing the timeline scale preserve the date currently in view instead of jumping back
     to today?

     **Change:** Tried preserving the current viewport center date across Day, Week, and Month
     switches, but rolled it back because it made the navigation feel less predictable. Timescale
     changes now use the previous behavior and recenter on the current date.

113. Can changing the timeline scale keep the same centered period instead of returning to the
     current date?

     **Change:** Scale changes now preserve a navigation anchor date separately from the visual
     period center. Day centers the same anchor date, Week visually centers the containing week,
     and Month visually centers the containing month without losing the original anchor when
     switching back. The timeline adds enough temporary range before or after the target period so
     it can remain centered even when it would otherwise sit at the edge of the default range.

114. Can the visible header/work-order jump be reduced when changing scale?

     **Change:** Scale changes preserve the viewport midpoint consistently across Day, Week, and
     Month. The scale-change render now suppresses temporary scroll expansion and disables browser
     scroll anchoring so headers and work orders avoid the brief old-scroll-position blip.

115. Can the timeline remember where I was after refreshing the page?

     **Change:** The schedule now persists the current viewport center date in localStorage while
     the user scrolls or changes timescale. On reload, it restores the saved timescale and recenters
     the viewport on the saved date or matching week/month period, extending the temporary timeline
     range if needed.
