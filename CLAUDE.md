### Testing changes
   - Dev server runs on http://localhost:5173/
   - Use Playwright MCP to screenshot pages after making CSS changes
   - Use the playwright MCP tools (not bash) to open a browser
   - Always verify visual changes by navigating to the affected page
   - If something looks wrong, take a screenshot and self-correct
   - Make sure to verify the interactive components work and that their respective state machines are correct
   - When taking screenshots, save them to /screenshots and after you are done, delete them