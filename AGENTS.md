<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# STRICT CORE SYSTEM RULES (DO NOT VIOLATE)

1. **ABSOLUTELY ZERO HARDCODED DATA**:
   - Never add hardcoded content, links, text, or fallback values in frontend code, admin pages, or UI components.
   - Everything must be dynamically fetched from the PostgreSQL database.
   - If data does not exist in the database, seed it into PostgreSQL directly, then delete/remove any seed script and ensure no hardcoded data remains in the component or page code.
   - Do NOT provide hardcoded fallback URLs (e.g., social links, emails, etc.) — the admin configures all actual URLs in the database.

2. **INSTANTANEOUS DATA LOADING (0ms Delay)**:
   - All public pages (`/`, `/about`, `/links`, `/projects`, etc.) and admin control room pages must render and display their data instantly.
   - Never introduce fetch waterfalls, slow blocking client-side calls in initial renders, or artificial loading timers.
   - Use Server Components to pre-fetch database data server-side and pass down to client components immediately.

3. **NEVER ALTER OR REDESIGN PUBLIC UI**:
   - The public layout, styling, structure, and visual designs crafted by the user must NEVER be arbitrarily altered or redesigned.
   - Only bind database data to existing UI elements and apply specific requested surgical edits (e.g. removing a specific element). Never change the layout structure.

4. **ADMIN ARCHITECTURE SEPARATION (Surface Canvas vs Studio Engine)**:
   - **Surface Canvas (Live Preview)**: 100% read-only live preview of the public site. Zero inline clicking to edit, zero inline input triggers on the canvas.
   - **Studio Engine**: All edits, calendar month pickers, image uploads/cropping, and data forms must live exclusively inside the Studio Engine dashboard. Saving writes directly to PostgreSQL and instantly updates both the live preview and the public website.

