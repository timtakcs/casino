### Graph interactivity
   The chart has an "Interactive graph" toggle. It controls Chart.js `events`:
   - **OFF** (default): `events=['click']` — only click events fire, so legend toggling
     works (show/hide players), but there are no hover effects or tooltips.
   - **ON**: all events restored (`mousemove`, `mouseout`, `click`, `touchstart`,
     `touchmove`), tooltip enabled, interaction mode set to `'index'` for crosshair
     behavior (hovering shows all visible players' values at that x-position).

### Testing changes
   - Dev server runs on http://localhost:5173/
   - Use Playwright MCP to screenshot pages after making CSS changes
   - Use the playwright MCP tools (not bash) to open a browser
   - Always verify visual changes by navigating to the affected page
   - If something looks wrong, take a screenshot and self-correct
   - Make sure to verify the interactive components work and that their respective state machines are correct
   - When taking screenshots, save them to /screenshots and after you are done, delete them