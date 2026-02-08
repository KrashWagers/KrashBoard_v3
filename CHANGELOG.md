# Changelog

All notable changes to KrashBoard V3 will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-10-27

### Changed - MLB Pitch Matrix: team logos moved to left vertical rail
- **TeamLogoRail**: New vertical rail of MLB team logos on the left, flush against the main content (to the right of the app sidebar). Shown only on Matchups tab. Width 56px, full height of content area, border-right + bg-card, inner list overflow-y-auto if needed.
- **Scroll-to-team**: Clicking a logo scrolls the main content scroll container (ref) to the team section via `scrollTo({ top, behavior: "smooth" })` with 16px offset. Selected team state shows persistent ring + slight scale.
- **Hover/active**: Framer Motion hover scale 1.12, keyframe wiggle rotate [0,3,-2,0], soft glow (shadow primary); selected ring + scale 1.06. `useReducedMotion()` disables scale/wiggle; focus-visible ring for keyboard.
- **Layout**: PitchMatrixClient uses a 2-column flex: left = TeamLogoRail (Matchups only), right = existing scroll div (ref). Team logos removed from the top controls bar.

### Changed - MLB Pitch Matrix layout (game cards 2/3 width)
- **Game cards width**: The game cards that contain the pitcher tables (TeamMatchupCard for away/home) are now wrapped in a container with `w-2/3 min-w-0`, so they use two-thirds of the content width and stay left-aligned. The game banner card (e.g. "NYY @ SF" with date/time) and the sticky header remain full width.

### Changed - MLB Pitch Matrix tables (5 columns, labels, scroll, tooltips)
- **5 pitch columns everywhere**: All tables now show exactly 5 pitch-type columns. Qualified pitches (usage ≥ 5%) fill slots in order; pitchers with fewer than 5 qualified pitches have remaining columns blank (even column widths). `getPitchColumnSlots()` returns 5 slots; `getPitchColumns()` filters by `USAGE_MIN_PCT` (0.05).
- **VSLHB / NYY LHB spacing**: Labels use non-breaking space (`\u00A0`) so they read as "VS LHB" and "NYY LHB" (e.g. `standLabel={`VS\u00A0${stand}HB`}`, `batterLabel={\`${team}\u00A0${stand}HB\`}`). H2H Stance column uses same spacing.
- **Batter section max 9 rows + nested scroll**: Pitch Matrix (Matchups) table’s batter list is in a scroll container with max height of 4 header rows + 9 batter rows; only that area scrolls, with sticky thead.
- **Pitch type tooltips**: Pitch type column headers use `<Tooltip>` with full name (e.g. "Changeup", "4-Seam Fastball") via `getPitchFullName()`. Applied in PitchMatrixTable, BatterPitchTable, and H2H table cell tooltips.
- **H2H tab**: Table shows 5 pitch slots per side (batter and pitcher) with tooltips; detail dialog “All pitches” list filters out empty slots.

### Fixed - MLB Pitch Matrix sticky controls bar (flush under header, full width)
- **Header height variable**: `--app-header-h` set to `64px` in `globals.css` (`:root` and `.dark`) to match the real app header; root layout header uses `style={{ height: "var(--app-header-h)" }}`.
- **No gap under header**: Added route-aware `MainContentArea` (client). On `/pitch-matrix` it uses `p-0` and `overflow-hidden` so the page wrapper starts flush under the header with no dead space; other routes keep `p-4` and `overflow-y-auto`.
- **Sticky bar**: Controls bar uses `position: sticky; top: 0` so it sticks to the top of the page wrapper (not the viewport), with `z-40`, `bg-card surface-glass`, full width; only the content area below the bar scrolls (`flex-1 min-h-0 overflow-auto` with `p-4` inside).
- **Files**: `src/app/globals.css`, `src/app/layout.tsx`, `src/components/main-content-area.tsx`, `src/components/mlb/pitch-matrix/PitchMatrixClient.tsx`.

### Added - Custom font (Corra Montserra)
- **App-wide font**: Custom font "Corra Montserra" from `public/Fonts` is now the default for the entire app. All weights (Thin through Black) are loaded via `@font-face` in `globals.css` with `font-display: swap`.
- **Layout**: Removed Google Inter; `body` uses `font-family: "Corra Montserra", ...` and Tailwind `fontFamily.sans` is set to the same stack so `font-sans` and default text use the custom font everywhere.
- **Percent symbol only**: Added "Percent Fallback" `@font-face` with `unicode-range: U+0025` so only the "%" character uses the system UI font (Segoe UI / Helvetica Neue / Arial); all other text remains Corra Montserra. Font stack updated in `globals.css` and `tailwind.config.ts`.
- **Files**: `src/app/globals.css` (font-face + body), `src/app/layout.tsx` (Inter removed), `tailwind.config.ts` (sans family).

### Changed - MLB Pitch Matrix (theme re-skin)
- **Global theme only**: Re-skinned Pitch Matrix to match the app’s dark liquid glass theme. Removed all MLB-only styling.
- **Removed**: `PITCH_MATRIX_CARD_STYLE` (transparent panels, teal glow borders), `BRAND_TEAL` import, hardcoded hex colors (`#1f2937`, `#151515`, `#171717`, etc.), and `border-gray-*` / `bg-[#...]` classes.
- **Replaced with**: Shared `<Card />` with `rounded-md border border-border bg-card surface-glass card-hover-glow`; token-based `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`; `interactive-surface` and `card-hover-glow` for tabs and panels; team logo fallback uses `hsl(var(--muted))`.
- **Tables**: PitchMatrixTable wrapped in flex container (`flex flex-col min-h-0` → `flex-1 min-h-0 overflow-auto`) so the scroll region fills remaining height; table header uses `table-header-sticky`. Batter tab table uses same scroll region and sticky header; row hover uses `table-row-hover`.
- **Tabs / toolbar**: Sticky bar uses `border-border bg-card surface-glass`; AVG/HR and Pitcher filter buttons use `bg-primary text-primary-foreground` when active, `border-border bg-muted/50` container.
- **Dialog**: Detail popup uses `bg-card border border-border surface-glass`; inner tables and footer use `border-border`, `bg-card`, `bg-muted/*`.
- Data fetching, filtering, and routing unchanged; color-coded percentages (green/red/yellow) preserved for data viz.

### Changed - Glass panel utilities (shared primitives only)
- **Unified glass panel**: Added in `globals.css`: `.glass-panel` (bg-card, border-border, surface-glass, subtle shadow, rounded), `.glass-panel--popover` (popovers/dialogs, slightly stronger border and shadow), `.glass-hover` (lift + brand glow using `--brand-glow` / `--brand-border`). No new page-level styles.
- **Primitives use glass panel**: Card root uses `.glass-panel`. DialogContent, SheetContent, PopoverContent, DropdownMenuContent, and DropdownMenuSubContent use `.glass-panel` + `.glass-panel--popover`. Sheet keeps single-edge border via variants; Dialog/Popover/Dropdown keep existing layout and animation classes.

### Changed - App foundation (layout, theme, primitives)
- **Scroll contract**: Document/body no longer scrolls; primary scroll container is the main content pane in the app shell. Header and sidebar stay fixed. Content padding reduced from p-6 to p-4.
- **Dark-only theme**: App is dark-only. `:root` tokens set to dark “liquid glass” palette; glass vars added (`--surface`, `--surface-border`, `--surface-blur`). Radius tokens: `--radius` 6px; button/input 4px; modal 8px.
- **UI primitives**: Card, Dialog, Sheet, DropdownMenu, Popover, Tooltip, and GlobalSearch updated to use theme tokens (bg-card, border-border, bg-popover, etc.) and tighter spacing/radius. Removed hardcoded #171717, border-gray-700. Top bar uses backdrop blur.
- **DataTableViewport**: New reusable wrapper for large tables (100+ rows). Optional max height (default min(60vh, 520px)), optional sticky header slot; scroll body uses overflow-auto. Small tables can remain unwrapped.

### Fixed - NBA The Market
- **One row per player+market**: Table now shows a single main row per (event, player, stat). Primary line is chosen as the line with the most books (distinct sportsbooks); ties broken by preferring FanDuel/DraftKings. Previously: most common “main” line across books (e.g. 22.5 when most books have 22.5). Any other line—including another book’s main line (e.g. Hard Rock 23.5)—appears only in the accordion “Alternate lines” dropdown, so the accordion no longer breaks from multiple top-level rows for the same prop.
- **Wrong player after changing filter**: Reset `currentPage` to 1 and clear `expandedRowKeys` when `selectedPlayer`, `selectedStat`, `anchorBookId`, `sideFilter`, or `sideSplit` change so the table always shows the first page of the current filtered set and accordions don’t retain the previous player’s state.
- **Filter robustness**: Player and stat filters now compare trimmed values so leading/trailing spaces don’t prevent matches.
- **Expand key**: Accordion expand key now includes `event_id` so expanding is per (event, player, stat) when the same player appears in multiple games.

### Changed - NBA The Market (UI)
- Refresh button uses same outline/border style as other header icon buttons.
- **Clear all filters** button (Eraser icon) in top right: resets player (all), stat (Points default), anchor (all), Pinnacle/Circa off, side filter (both), and sort; tooltip “Clear all filters”.
- **Sortable columns**: Player, Market, Side (when split), and Line headers are clickable; click to sort asc/desc with ChevronUp/ChevronDown indicator.
- When Side is split, odds cells use larger font (`text-lg`) for better readability.

### Added - NBA Player Props (The Market + +EV)
- Enabled NBA in the sports selector (`available: true`) and added NBA nav: **The Market** → `/nba/market`, **+EV** → `/nba/ev`.
- Added API route `/api/nba/props`: parameterized BigQuery query (table `nba25-475715.webapp.nba_player_props_long_v1`), in-memory cache keyed by `start_date`/`end_date`, TTL from `PROPS_CACHE_TTL_SECONDS` (default 45s), and `Cache-Control: s-maxage=45, stale-while-revalidate=60` for edge/CDN. Response shape: `{ meta, data: { propGroups, flatSelections } }`.
- Added `src/lib/nba/transform-props.ts` to transform raw rows into grouped prop groups (with sides, best price/EV/edge per book) and flat selections. Route stays thin: parse params, cache get/set, query, transform, return JSON.
- Added `src/lib/nba/types.ts` for PropGroup, BookPrice, FlatSelection, and API types. Added NBA BigQuery client in `src/lib/bigquery.ts` (same pattern as NHL/MLB: `NBA_GCP_PROJECT_ID`, `NBA_GCP_KEY_FILE`).
- **The Market** (`/nba/market`): Odds screen with client-side filters (player, stat, alt lines, Pinnacle/Circa only, min EV), memoized `groups = Object.values(propGroups)`, and virtualized table (TanStack Table + @tanstack/react-virtual).
- **+EV** (`/nba/ev`): Flat list of selections with default filter `ev_per_dollar != null`, debug toggle “Show all props even without fair_prob”, min EV/Edge filters, and virtualized table with deeplinks.
- Single fetch on load for both pages; no refetch on filter changes. Alt lines always returned by API; UI toggle filters client-side on `is_alt_line`.

### Changed - NBA The Market & +EV Overhaul
- **Shared data / fast second page**: Added React Query (`@tanstack/react-query`) and `useNbaProps()` hook so The Market and +EV share one cached payload (5 min stale). Navigating between pages uses cache — no second full load.
- **Full width**: Removed `max-w-7xl`; content uses full width next to the sidebar.
- **Aligned tables**: Replaced table + absolute-positioned virtual rows with a **CSS Grid** layout. Header and each virtualized row use the same `gridTemplateColumns`, so columns stay aligned (Game, Player, Market, books, Best EV on Market; same idea on +EV).
- **Compact filters**: Single-row filter bar (player search, stat, min EV%, then a "Filters" popover for toggles like alt lines / Pinnacle-Circa only / show all). Removed large card and multi-row filter layout.
- **Accent styling**: +EV values and Best EV use `text-emerald-500`; Bet/deeplink buttons use emerald accent. Dark card backgrounds (`#171717`, `#1a1a1a`) with subtle borders.
- **The Market – combo filters**: Player and Stat are now searchable combo controls (Combobox) with “All players” / “All stats” and active-state ring when a filter is set.
- **The Market – column reorder**: “Column reorder” button toggles drag-and-drop mode on book header logos; “Done” confirms. Order persisted in component state; visible books reorder, hidden books stay at end.
- **The Market – books filter**: “Books to show” in the Filters popover is a grid of logo cards (logo + label, checkbox) with emerald border when selected.
- **The Market – over/under odds**: Odds cells show stacked layout: Over (e.g. “O +170”), line in the middle, Under (e.g. “U -210”); best over and best under in each row highlighted in emerald.
- **The Market – header**: GAME, PLAYER, MARKET labels use `items-center` and `py-0.5` so they’re vertically centered; book logos increased (h-12 w-12) with reduced padding so the header doesn’t grow.
- **The Market – horizontal scroll**: Table lives in a single scroll container with `max-w-full overflow-auto` so horizontal scroll is inside the card and the page never exceeds screen width.
- **The Market – filter/UX overhaul (Feb 2025)**:
  - Player and Prop comboboxes: wider triggers (`w-52` / `w-44`), dropdown content `contentMinWidth` (280px / 260px), row borders between options, checkbox-style selection (Square/CheckSquare icons). "Stat" label renamed to "Prop"; placeholders/labels use "props".
  - Page layout: root container `h-[calc(100vh-5rem)] max-w-[95%] overflow-hidden` so the page never scrolls; only the table area scrolls (horizontal and vertical) inside the card.
  - Odds cells: fixed row height (44px), stacked layout (over odds → line → under odds) with no O/U prefix in display; best over/under per row highlighted in emerald.
  - Default book column order: Pinnacle, Circa, FanDuel, DraftKings, BetMGM, Caesars, Fanatics, theScore, Bet365, then remaining books (`DEFAULT_MARKET_BOOK_ORDER` in sportsbook-logos).
  - Filters popover: width 380px, 5-column grid for books; column reorder removed from Filters (reorder only via "Column reorder" button).
  - Minimum EV filter removed.
  - Refresh: icon-only button, moved to far right of header; Filters: icon-only button, left of Column reorder.
  - Default prop filter: "Points" (selectedStat initial `"points"`).
  - Pagination: 50 rows per page, footer with "X–Y of Z" and prev/next; table body shows current page only; vertical scroll only within table container.
  - Prop names: combo stats formatted with space and capitalization after "+" (e.g. "Points + Assists", "Blocks + Steals") via `formatPropLabel`.

### Added - MLB Pitch Matrix
- Added the MLB Pitch Matrix tool with Lineups/Batter/Pitcher tabs and a lineup grid that aligns pitcher pitch types across batter rows.
- Added MLB BVP API routes for team/batter/pitcher payloads with daily cache reset at 4:00 AM America/New_York.
- Added in-memory cache helper for next-4am TTL and wired Pitch Matrix into MLB sidebar/navigation.
- Added a row of all 30 MLB team logos (from `public/Images/MLB_Logos/`) on the Matchups tab as quick links; clicking a logo scrolls to that team’s matchup card. Teams in today’s slate are shown at full opacity, others dimmed.
- Fixed Pitch Matrix logo strip: scroll targets now use `id="team-{abbr}"` so clicks scroll correctly; strip logos use team-colored backgrounds from `mlb-team-colors.json` (matching the game cards below).
- Pitch Matrix (Matchups + placeholder tabs): all cards use 70% transparent background, soft teal glow border (semi-transparent border + layered box-shadow), and border shadows for depth.
- Pitch Matrix Batter tab: all batters vs all pitchers in one list sorted by OVR (desc). Pitcher filter: All / Starters (expected starter) / Relievers (RP) via `starter_position`. Uses same transparent card + glow theme; OVR Mode (AVG/HR) shared with Matchups. Lineups and BVP payloads lifted to parent so both tabs share one fetch.
- Pitch Matrix matchup detail popup: made background opaque (`#171717`) instead of 70% transparent; simplified top section to a single row (batter logo + headshot + name/stance · vs · headshot + name + pitcher logo) with no individual cards so content fits and reads clearly.
- Pitch Matrix Batter tab: cap rendered rows at 500 to prevent browser freeze when the full list is very large (e.g. 1000+ batter×pitcher matchups); show “Showing top 500 of N” when capped and suggest using Starters/Relievers filter.

- Pitch Matrix: Batter tab preloads in the background as soon as games exist so switching to Batter is instant once payloads are in; batter list computed in parent and passed as rows prop.
- MLB BVP team API: server-side cache TTL set to fixed 24h so DB is hit at most once per (team, date) per day across all users; added CACHE_TTL_24H_SECONDS in lib/cache.

### Changed - Sidebar Navigation Structure
- Reorganized the sidebar to keep a global navigation block (Home, Scores, Lineups, Prop Lab, Market, Tracker) and move sport-specific tools below it, with MLB tools aligned to the new batter/pitcher/team stats layout.
- Switched the sidebar to icon-collapsible mode so it collapses to icons instead of fully disappearing.
- Tightened sport selector padding in collapsed mode so the league logo stays visible and centered.
- Persisted the last selected sport so global pages (Tracker, Lineups) no longer reset to NFL.

### Added - Tracker Page
- Added a global Tracker page scaffold for cross-sport tracking workflows.
- Added placeholder pages for NFL and NBA Scores/Lineups/Market (plus NBA Home/Prop Lab) to support the new global navigation links.
- Built out the Tracker hub with MLB glass styling, stats dashboard, filters, bet log table, and calendar summaries.
- Added Add/Edit/Delete bet workflows plus CSV import with header mapping and preview.
- Added Supabase schema + RLS for user_bets, plus unit size storage for unit-based tracking.
- Added tracker API routes for CRUD and bulk CSV imports.
- Added Event Date tracking to the bet schema, forms, imports, and table display.
- Expanded Tracker bet metadata (parlays, boosts, bonus/no-sweat fields) plus new filters.
- Streamlined Add Bet with sport + sportsbook tiles, quick result buttons, and local custom tiles.
- Matched Tracker background/layout to MLB glass mode and moved unit size control to the page header.
- Rebuilt Tracker layout to match the mockup: profile strip, calendar + dashboard split, full-width bet log.
- Scoped the Units/Dollars toggle to the calendar only and styled Add Bet with teal accent.
- Updated Add Bet modal styling to MLB-themed glass with teal glow and league logos.

### Changed - MLB Lineups Layout Density
- Expanded MLB layout max width to 1600px and updated lineups to show up to 3 cards per row on xl screens.

### Changed - MLB Frosted Glass Treatment
- Updated MLB cards, sidebar drawer, and top header to use a thicker frosted-glass effect inspired by the backdrop-filter technique.
- Shifted the MLB gradient emphasis back to the page background, and simplified glass overlays so the gradient shines through; adjusted mobile sidebar sheet z-index/opacity.
- Aligned MLB cards, sidebar, and header glass styling to match MLB Home visuals and restored a full-page gradient glow.
- Matched MLB lineups card glass styling to the same gradients and shadows as MLB Home tiles.
- Standardized MLB card borders and removed extra card overlay so all MLB pages share the same glass treatment.
- Unified all MLB glass surfaces to the same shared variables so every MLB page renders identical background and glass styling.

### Changed - Sidebar Sport Scoping
- Sidebar now only shows the selected sport's pages, while keeping Home, Settings, and Calculators global.
- Removed the sport accordion so active sport pages are listed directly in the sidebar.

### Added - Auth Foundations
- Added Supabase auth flow with login page (Google + email/password), auth callback handler, and sidebar sign-in/sign-out control.
- Added middleware protection so only the main home page is public while all other routes require authentication.
- Added admin-only routing for `/admin` paths plus an auth/admin guide for future gating.

### Changed - Profile & Settings Experience
- Replaced footer settings/sign-in links with a profile button showing avatar/name.
- Rebuilt the settings page into a profile + preferences hub with live Supabase-backed controls.

### Added - MLB Section Scaffolding
- Added MLB route group with placeholder pages for Home, Scores, Lineups, Weather Report, Prop Lab, Market, Tools, Team, and Player sections.
- Added MLB section navbar and sport-scoped sidebar entries for MLB tools, team, and player workflows.
- Enabled MLB in the sport selector and added a calculators landing page for MLB placeholders.

### Changed - MLB Visual Theme (Scoped)
- Added an MLB-only frosted-glass theme with teal accent, hover depth, and textured/gradient background.
- Tightened MLB card padding and spacing while increasing visual separation between major sections.
- Updated MLB navbar and section headers to use the MLB-specific visual hierarchy.
- Extended the MLB theme across the full app shell (background, top bar, sidebar/drawer).
- Increased MLB card transparency for a lighter glass feel.
- Forced MLB card backgrounds to override global card fill for visible transparency.
- Replaced MLB cards with a dedicated MLBCard component to avoid global card styling.
- Pushed MLB card transparency higher for clearer background bleed-through.
- Rebuilt MLB Home with custom glass tiles and layout sections for visible transparency.
- Switched MLB Home tiles to ultra-transparent glass with stronger highlights.
- Matched MLB Home tiles to the sidebar glass treatment for consistent frosting.
- Removed MLB Home card backgrounds for fully transparent tiles.
- Added subtle teal gradient fills to MLB Home tiles and hero cards.
- Softened the MLB tile gradients to keep the frosted glass transparency.
- Reduced MLB tile border brightness for a softer edge.
- Moved the sport selector into the sidebar above navigation, and moved global search to the top-right header slot.

### Changed - Header Controls
- Moved the sport selector into the mobile sidebar drawer and removed the light theme toggle from the top header.

### Changed - Sidebar Visual Hierarchy
- Tuned dark sidebar color tokens and added subtle inset depth to the sidebar shell.
- Emphasized active navigation items with a stronger highlight and left accent rule.
- Strengthened group label typography for clearer section hierarchy.

### Changed - Card Styling Defaults
- Updated the global Card component to use rounded-md corners, gray borders, and a static dark background with no hover/glow effects for consistent layout styling.

### Added - Global Search Modal (Sport Scoped)
- Added header search trigger (Ctrl/Cmd+K) with a centered modal UI.
- Search results are scoped to the currently selected sport (NHL/NFL supported now).
- NHL search pulls from BigQuery player gamelogs and routes to player Prop Lab with a default prop seed.

### Changed - NHL Gamecenter Layout & Boxscore Stats
- Made the Boxscore tab full width and removed Linescore/Game Stats from the boxscore view.
- Added team logos next to goal scorers in the Summary scoring list.
- Fixed skater SOG display by mapping to the `sog` field with fallback to `shots`.

### Changed - NHL Prop Lab Prop Dashboards
- Rebuilt Assists, Points, Shots, and PP Pts dashboards to mirror the Goals layout.
- Standardized the 5 prop-specific cards per prop with new data mappings.
- Unified filter controls across all prop dashboards using the shared player payload.

### Changed - NHL Prop Lab Bottom Section
- Removed Player vs Opponent History and Shot Location Map cards.
- Added "Last 5 Games" table with a link to the full gamelogs tab.

### Changed - NHL Shot Location Map Redesign

#### Ice Rink Orientation
- **Rotated 90° Counter-Clockwise**: Ice rink now displays vertically with the net at the top facing downward
- **Center-Point Rotation**: Rotation applied around the center of the rink (50, 0) for proper positioning
- **Transform Sequence**: `translate(0, 50) rotate(-90) translate(-50, 0)` ensures full rink visibility
- **Updated ViewBox**: Changed from `0 -42.5 100 85` to `-42.5 0 85 100` for vertical orientation
- **Swapped Dimensions**: Width and height swapped (svgHeight, svgWidth) to accommodate vertical layout

#### Hexagonal Heatmap
- **New Visualization**: Replaced circular gradient heatmap with professional hexagonal "beehive" grid design
- **Smaller Hexagons**: Reduced hexagon size from 5 to 3 for higher density visualization (more hexagons)
- **Color Gradient**: Dark Grey (#2d3748) → Solid Blue (#3b82f6) matching NBA shot chart style
- **RGB Interpolation**: Smooth color transition based on shot density intensity
- **Shot Density**: Each hexagon aggregates shot count in that area
- **Dynamic Opacity**: Hex opacity increases with shot count (0.7 + 0.3 * intensity) for better visual hierarchy
- **Subtle Borders**: Added dark stroke (#1a1a1a, 0.2px) to define hexagon edges
- **Inspired By**: NBA shot charts and industry-standard heatmap designs

#### Summary Stats Styling
- **Removed Backgrounds**: Eliminated card backgrounds (`bg-gray-800`) from all 4 stats
- **Enhanced Typography**: Increased stat values from `text-sm` to `text-lg` for better readability
- **Underlined Labels**: Added subtle grey border-bottom underlines to stat labels for visual hierarchy
- **Simplified Labels**: Changed "Total Events" to "Events" for cleaner, more concise display
- **Improved Spacing**: Increased gap from `gap-2` to `gap-4` and added `mb-2` margin between label and value

#### Hover Tooltip Redesign
- **Professional Styling**: Redesigned to match main bar chart tooltip style
  - Background: `bg-[#1a1a1a]` with dynamic colored border based on shot result
  - Rounded corners, padding, and shadow-2xl for depth
- **Static Height**: Footer maintains `min-h-[180px]` to prevent layout shift on hover
- **Dynamic Border Colors**: Border changes based on shot result matching dot colors
  - Goal: Blue (`border-blue-500`)
  - Shot on Goal: Green (`border-green-500`)
  - Missed: Yellow (`border-yellow-500`)
  - Blocked: Orange (`border-orange-500`)
  - No hover: Grey (`border-gray-700`)
- **Shot Result Repositioned**: Moved to top-right corner of tooltip header with color-coded text
  - No label, just the value (Goal, Shot on Goal, Missed, Blocked)
  - Text color matches dot color for visual consistency
  - Goal: `text-blue-500`, Shot: `text-green-500`, Missed: `text-yellow-500`, Blocked: `text-orange-500`
- **Header Layout**: Flex layout with game info on left, result on right
- **Simplified Date Display**: Shows raw date value directly without complex formatting
- **Removed Location**: Eliminated x,y coordinates for cleaner display
- **Capitalized Shot Types**: Shot type values now properly capitalized (e.g., "Backhand" not "backhand")
- **Better Visual Hierarchy**: 
  - Labels: `text-gray-400 text-xs`
  - Primary values: `text-white font-bold text-sm`
  - Secondary values: `text-gray-300 text-sm`
  - Highlight values (Period/Time): `text-blue-400`
- **Separator Line**: Added divider before Goalie section
- **Improved Layout**: Flex justify-between for labels and values with consistent gap-6 spacing
- **Empty State**: Centered placeholder text with fixed height to maintain layout

#### Interactive Dot Highlighting
- **Grey-Out Effect**: When hovering over a shot, all dots of different result types are greyed out
  - Greyed dots: `fill='#4a5568'` with `opacity=0.3`
  - Only dots matching hovered shot result remain in full color
  - Example: Hover on a Goal → all non-Goal shots become grey, only Goals remain blue
- **Smooth Transitions**: Added `transition: 'all 0.2s ease'` for smooth color/opacity changes
- **Enhanced Focus**: Helps users quickly identify patterns for specific shot outcomes
- **Logic**: Compares `Is_Goal`, `Is_SOG`, `Is_Missed`, `Is_Blocked` flags to determine matching shots

#### Ice Rink Viewport Optimization
- **Reduced Neutral Zone**: ViewBox adjusted from `"-42.5 0 85 100"` to `"-42.5 0 85 65"`
- **35% Reduction**: Neutral zone (below blue line) height reduced from 100 to 65 for better focus on offensive zone
- **Height Adjustment**: SVG height reduced to `svgWidth * 0.7` for proportional display
- **Improved Focus**: More screen space dedicated to high-density shot areas near the net while keeping net visible

### Changed - NHL Shot Attempts Chart Split into Two Stacked Charts

#### Horizontal Split Layout
- **Split Single Chart**: Shot Attempts chart split into two separate stacked bar charts
- **Top Chart - "Shot Attempts"**: 
  - Shows total shot attempts breakdown (unchanged)
  - Shots on Goal (blue) + Missed + Blocked (grey)
  - Height: 140px
- **Bottom Chart - "PP vs ES Shots"**: (NEW)
  - Shows power play vs even strength shots on goal
  - ES Shots: `shots_on_goal - pp_shots_on_goal` (blue)
  - PP Shots: `pp_shots_on_goal` (gold/yellow)
  - PP shots use dark text for contrast
  - Height: 140px
- **Combined Height**: 140 + 140 + 12 (gap) = ~292px, matching main chart's 315px height
- **Maintained Width**: Both charts span same width as before
- **Layout**: Wrapped in `space-y-3` container for consistent vertical spacing
- **Font Sizes**: Reduced to 10px legend, 8px labels for compact display

### Fixed - NHL Prop Lab Filter Row & Shot Attempts Chart Spacing

#### Single-Row Filter Layout
- **Prevented Filter Wrapping**: Changed filter container from `flex-wrap` to `flex-nowrap` with `overflow-x-auto`
- **Reduced Button Sizes**: All filter buttons height reduced from h-9 (36px) to h-7 (28px)
- **Tighter Padding**:
  - Filter groups: p-2 → p-1.5
  - Button horizontal padding: px-3/px-4 → px-2/px-2.5
  - Gap between elements: gap-3 → gap-1 or gap-2
  - Divider height: h-6 → h-5
- **Compact Dropdowns**: 
  - Time & Day dropdowns: h-9 → h-7
  - Width reduced: w-[130px] → w-[100px]
- **Reset Button**: Reduced from full "Reset Filters" to "Reset", h-7, smaller icon (h-3 w-3)
- **Result**: All filters now fit on single row, reducing card height by ~50%

#### Shot Attempts Chart Left Margin Fix
- **Issue**: Empty space to left of Y-axis due to `left: 0` margin
- **Fix**: Changed margin from `left: 0` to `left: -15` and set `YAxis width={35}`
- **Applied to Both**:
  - Main "Shot Attempts" chart
  - "Shot Attempts by Danger" chart
- **Result**: Charts now extend properly to left edge, maximizing use of available space

### Changed - NHL Prop Lab Dashboard Layout Density

#### Reduced Spacing & Increased Content Density
- **Max Width Reduced**: 1800px → 1600px for better fit on standard monitors
- **Main Container Padding**: Reduced across all breakpoints
  - Small: p-4 → p-3
  - Medium: p-6 → p-4
  - Large: p-8 → p-5
- **Vertical Spacing (space-y)**: Reduced by 50%
  - Main container: space-y-6 → space-y-3
  - Left column (charts): space-y-6 → space-y-3
  - Right column (sidebar): space-y-6 → space-y-3
- **Grid Gaps**: Reduced by 50%
  - Main content grid: gap-6 → gap-3
  - Player info grid: gap-6 → gap-3
  - Filter section: gap-4 → gap-3
- **Card Padding**: Reduced for tighter layout
  - Filter card: p-5 → p-4
  - Player info section: p-6 → p-4
  - Coming soon card: p-8 → p-6
- **Base Font Size**: 1rem → 0.9rem (10% reduction for slight text scaling)
- **Result**: ~20-25% more vertical space, ability to see more components simultaneously on 24" monitors

### Fixed - NHL Main Bar Chart X-Axis Team Logos

#### Logo Size Reduction & Tampa Bay Mapping
- **Reduced Logo Sizes**: Team logos on X-axis reduced by ~33% across all dashboards
  - Default: 24px → 16px
  - Medium density (>30 games): 20px → 13px
  - High density (>50 games): 16px → 10px
- **Adjusted Y-Offsets**: Reduced spacing to accommodate smaller logos
  - Default: 35px → 28px
  - Medium: 32px → 25px
  - High: 28px → 22px
- **Fixed Tampa Bay Logo**: Added `'TBL': '/Images/NHL_Logos/TB.png'` mapping
  - Previously only had 'TB', now handles both 'TB' and 'TBL' abbreviations
  - Fixes missing logo issue for Tampa Bay Lightning games
- **Applied to All Dashboards**: ShotsDashboard, PointsDashboard, GoalsDashboard, AssistsDashboard
- **Improved Readability**: Smaller logos reduce visual clutter while maintaining clarity

### Added - NHL Shot Location Map Zones View (Hexagonal Heatmap Edition)

#### New "Zones" Visualization Mode - Hybrid Heatmap
- **Three Modes Available**: Dots, Heat Map, and **Zones**
- **Combines Zone Analysis with Hexagonal Heatmap**:
  - Each of the 4 strategic zones has its own independent color scale
  - Hexagonal density mapping within each zone
  - Each zone's intensity is calculated relative to its own min/max (not global)
  
#### Four Strategic Zones with Unique Color Scales:
1. **Point** (Brown → Red gradient) - Along blue line and back, full width
2. **Slot** (Dark Blue → Indigo gradient) - High-danger area between circles, center ice
3. **Left Circle** (Dark Green → Green gradient) - Left faceoff circle area
4. **Right Circle** (Dark Brown → Orange gradient) - Right faceoff circle area

#### Visual Design:
- **Subtle Borders**: Thin grey borders (0.3px strokeWidth, #555) instead of thick white
- **Small Labels**: Tiny zone names (4px font, light grey #ddd, 80% opacity) for minimal intrusion
- **Independent Scaling**: Each zone's color intensity scales from its darkest to brightest based on shot density within that zone
- **Hexagonal Grid**: Same 3px hexagons as Heat Map mode, but color-coded by zone
- **Professional Look**: Clean, minimal, non-intrusive design

#### Interactive Features:
- **Hover Tooltips**: Hover over any hexagon to see detailed stats in footer
- **Zone Context**: Tooltip header shows which zone the hexagon is in (e.g., "Left Circle")
- **Detailed Metrics**:
  - Total shots from that hexagon area
  - % of all shots
  - Goals (blue), Shots on Goal (green), Missed (yellow), Blocked (orange)
  - Shooting % calculation
- **Blue Border**: Footer gets blue border when hovering hexagons
- **Smooth Transitions**: 0.2s ease transitions on hover

#### Zone Boundary Logic:
- **Point**: x ≤ 46 (blue line + 10ft)
- **Slot**: x > 46, |y| ≤ 8 (center 16ft width)
- **Left Circle**: x > 46, y < -8 (left side)
- **Right Circle**: x > 46, y > 8 (right side)

#### Technical Implementation:
- **Separate Hex Maps**: Each zone maintains its own Map of hexagons with shot counts
- **Per-Zone Max Values**: Intensity calculated as `count / zoneMaxCount` not `count / globalMaxCount`
- **Dynamic Color Interpolation**: RGB values interpolated from dark to bright for each zone's color scheme
- **Unified Tooltip**: Reuses existing hexagon tooltip component, adds zone name dynamically

### Added - NHL Shot Location Map Heatmap Tooltips

#### Interactive Hexagon Hover Stats
- **Zone Statistics**: Hover over any hexagon in heatmap mode to see detailed zone analytics
- **Displayed Metrics**:
  - Total shots from that area
  - Percentage of all shots (% of total)
  - Goals scored (color-coded blue)
  - Shots on Goal (green)
  - Missed shots (yellow)
  - Blocked shots (orange)
  - Shooting % (Goals/Shots on Goal)
- **Data Aggregation**: Each hexagon now stores full shot data including counts by result type
- **Visual Feedback**: 
  - Blue border on tooltip when hovering hexagon
  - Cursor changes to pointer on hover
  - Smooth transitions on hover
- **Smart Display**: Metrics only shown if they have values (e.g., Goals only shown if > 0)
- **Context-Aware Empty State**: Message changes based on view mode ("Hover over a zone" vs "Hover over a shot")

### Fixed - NHL Shot Location Map API Date Handling

#### BigQuery DATE Conversion
- **API Fix**: Updated `/api/nhl/players/[id]/play-by-play/route.ts` to properly handle BigQuery DATE objects
- **Issue**: BigQuery DATE types were being stringified as `[object Object]` instead of actual date values
- **Solution**: Changed from `Game_Date.toString()` to `Game_Date?.value` to extract the actual date string
- **Result**: Dates now display correctly in hover tooltip (e.g., "2025-04-05" instead of "[object Object]")

### Fixed - NHL Prop Lab UI Improvements

#### X-Axis Label Spacing
- **Main Bar Charts**: Added 3px vertical spacing between team logos and dates on X-axis
- **Applied to**: All 4 dashboards (Shots, Points, Goals, Assists)
- **Reason**: Logos and dates were overlapping, improved readability

#### Shot Attempts Chart Field Name Fix
- **Fixed Field Names**: Corrected BigQuery field references from `missed_shots` → `shots_missed` and `blocked_shots_by_defense` → `shots_blocked_by_defense`
- **Chart Structure**: Shot Attempts chart now properly displays stacked bars (blue for shots on goal, grey for missed + blocked)
- **Result**: Grey bars for missed + blocked shots now render correctly with inside labels

#### Duplicate Chart Removal
- **Removed**: Duplicate "Shot Attempts" chart from secondary grid on Shots dashboard
- **Kept**: Main "Shot Attempts" chart (1/3 width, next to main bar chart)
- **Reason**: Two identical charts were redundant

### Changed - NHL Prop Lab Chart Height Adjustment

#### Reduced Main Chart Row Height
- **Main Bar Chart**: Height reduced from 420px to 315px (25% reduction)
- **Secondary Chart (Shot Attempts/Team Goals)**: Height reduced from 420px to 315px (25% reduction)
- **Applied to**: All 4 dashboards (Shots, Points, Goals, Assists)
- **Reason**: Charts were too tall, reducing height improves overall page balance and reduces scrolling

### Added - NHL Prop Lab Secondary Charts Optimization

#### Maximized Chart Space & Removed X-Axis Labels
- **All Secondary Charts**: Optimized padding and removed x-axis labels
  - CardHeader: `p-3 pb-2` (was `p-6` or varied)
  - CardContent: `p-0 pb-0 pr-2` (was `p-5 pt-0` or `p-6 pt-0`)
  - Chart heights increased to 260px or 420px depending on context
  - X-axis labels hidden: `tick={false} height={0}` (main chart has labels)
  - Chart margins optimized: `margin={{ top: 10, right: 10, left: 0, bottom: 5 }}`
  - Y-axis font size: 10px (was 8-9px)
  - Vertical grid lines removed on all charts

#### Shot Attempts Charts Redesign
- **Title Changed**: "Corsi" → "Shot Attempts" across all instances
- **Data Visualization**:
  - Blue bars: Shots on Goal (bottom of stack)
  - Grey bars: Missed + Blocked shots (top of stack, rounded corners)
  - Labels positioned `inside` bars for better readability
  - Both values labeled only if > 0
- **Applied to**: Main chart (1/3 width), toggle chart, all dashboards

### Added - NHL Prop Lab Dual-Axis Shifts Overlay

#### Professional Dual-Axis Chart Feature
- **Toggle Button**: Added "Shifts" toggle button in top-right of each main chart
  - **Inactive State**: Grey background with grey border and "Shifts" text
  - **Active State**: Blue background (`bg-blue-500/20`) with blue border and "● Shifts" text with bullet
  - Smooth transition animations on state change
- **ComposedChart Integration**: Switched from `BarChart` to `ComposedChart` for proper Bar+Line mixing
  - Enables true dual-axis functionality with synchronized data rendering
  - Bars and Lines render independently on separate Y-axes without conflicts
- **Secondary Y-Axis**: Right-side Y-axis with dynamic width for optimal space usage
  - Blue color (`#60a5fa`) when active, transparent when inactive
  - Independent scale (`domain={[0, 'auto']}`) from main stat (10-30 shifts range vs 0-8 stat range)
  - **Dynamic width**: 40px when active, 0px when inactive for maximum chart space
- **Blue Dotted Line**: Overlays the bar chart showing shifts per game
  - Color: `#60a5fa` (blue-400)
  - Style: Dashed line (`strokeDasharray="5 5"`)
  - Stroke width: 3px (increased for better visibility)
  - Blue dots at each data point (4px radius, no stroke)
  - Active dot enlarges to 6px on hover
  - Uses `yAxisId="right"` for proper scaling on independent axis
  - No animation (`isAnimationActive={false}`) for instant rendering
- **Maximized Chart Width**:
  - CardContent: Added `pr-2` padding for slight right buffer
  - Chart right margin: 10px (was 50px) - chart extends much wider now
  - Right Y-axis width collapses to 0 when inactive, giving full width to bars
- **Eliminated Excessive Padding**:
  - CardHeader: `p-3 pb-2` (was `p-6`)
  - CardContent: `p-0 pb-0 pr-2` (was `p-6 pt-0`)
  - Chart bottom margin: 5px (was 50px)
  - XAxis height: 50px (was 70px)
  - Chart left margin: 0px (was -20px)
  - Increased chart height from 380px to 420px to fill the space properly

#### Implementation Details
- **Dual Y-Axis Configuration**:
  - Left axis (`yAxisId="left"`): Primary stat (shots, points, goals, assists)
  - Right axis (`yAxisId="right"`): Shifts data (10-30 range)
  - Both bars and reference line explicitly use `yAxisId="left"`
  - Shifts line uses `yAxisId="right"` for independent scaling
- **State Management**: Added `showShifts` useState hook to all dashboards
- **Conditional Rendering**: Secondary axis and line only render when `showShifts === true`
- **Professional Standard**: Follows industry best practice for dual-axis charts
  - Different colors for each axis (grey for primary, blue for secondary)
  - Clear labeling and visual separation
  - Independent scales to prevent data misrepresentation

#### Applied To All Main Charts
- ✅ **Shots Dashboard**: SOG bars + Shifts line overlay
- ✅ **Points Dashboard**: Points bars + Shifts line overlay
- ✅ **Goals Dashboard**: Goals bars + Shifts line overlay
- ✅ **Assists Dashboard**: Assists bars + Shifts line overlay

#### User Experience Benefits
- **Context at a Glance**: See ice time correlation with performance
- **Pattern Recognition**: Identify if performance drops with more/fewer shifts
- **Toggle Control**: Clean chart by default, overlay only when needed
- **No Clutter**: Line doesn't interfere with bars, different scale prevents confusion
- **Professional**: Matches analytics platforms like PropsMadness and NHL.com

### Changed - NHL Prop Lab Chart Visual Enhancements v2

#### 1. Dynamic Logo & Date Scaling (Responsive Design)
- **Smart Sizing Based on Data Density**:
  - **≤30 games**: Full size logos (24x24px), 9px font
  - **31-50 games**: Medium logos (20x20px), 8px font  
  - **>50 games**: Compact logos (16x16px), 7px font
- **Automatic Interval Adjustment**: 
  - Shows every game when <40 data points
  - Skips every other game when >40 points to prevent overlap
- **Perfect Centering**: Logos dynamically calculate half-size for proper positioning
- **No More Overlap**: Logos and dates always fit cleanly regardless of dataset size

#### 2. Enhanced Interactive Tooltips
- **Complete Redesign** from basic black text to professional data card:
  - **Header Section**: Opponent logo (32x32px) + team abbreviation + game date
  - **Dark Theme**: `#1a1a1a` background with 2px grey border and shadow
  - **Primary Stat**: Large white bold text (18px) for main metric
  - **Context Stats**: Secondary info in grey (Team Goals, Shifts, etc.)
  - **Situation Breakdown**: PP vs 5v5 stats in blue with visual separator
- **Prop-Specific Data**:
  - **Shots Dashboard**: SOG, Corsi, Shifts, PP/5v5 SOG breakdown
  - **Points Dashboard**: Points, Team Goals, Shifts, PP/5v5 Points breakdown
  - **Goals Dashboard**: Goals, SOG, Shifts, PP/5v5 Goals breakdown
  - **Assists Dashboard**: Assists, Team Goals, Shifts, PP/5v5 Assists breakdown
- **Visual Hierarchy**: Clear spacing, borders, and color coding for readability

#### 3. Y-Axis Alignment Fix
- **Proper Domain Setting**: Added `domain={[0, 'auto']}` to YAxis component
- **Accurate Line Placement**: Reference line now precisely aligns with Y-axis values
- **Fixed Issue**: Line at 1.5 now correctly positioned between 1 and 2 (not closer to 2)
- **Maintains Scale**: Auto-scaling for max value while enforcing 0 baseline

#### 4. Chart Height Optimization
- **Eliminated Blank Space**: Increased ResponsiveContainer height from 300px to 380px
- **Better Proportions**: 80px additional height fills previously wasted card space
- **Maintained Margins**: Kept proper spacing for labels and reference line badge
- **Consistent Design**: Applied to all main prop charts across all dashboards

#### Reference Line for Prop Value
- **Yellow Dotted Line**: Horizontal line at the prop line value (e.g., 2.5 for Over 2.5 SOG)
  - Color: `#eab308` (yellow-500)
  - Style: Dashed (5px dash, 5px gap)
  - Stroke width: 2px
- **Line Label Badge**: Shows the exact line value on the left Y-axis
  - Yellow text (`#eab308`) on dark brown background (`#854d0e`)
  - Font size: 11px, bold weight
  - Rounded corners with padding for badge appearance
- **Applied to**: Main prop charts in all dashboards (Shots, Points, Goals, Assists)

#### Grid Line Optimization
- **Removed vertical grid lines** from all charts for cleaner, less cluttered appearance
- **Kept horizontal grid lines** for easier value reading
- Applied consistently across all chart types (main charts and secondary stats charts)

#### Technical Implementation
- **Enhanced CustomXAxisTick Component**:
  - Added `dataLength` parameter for dynamic sizing logic
  - Conditional logo size, font size, and Y-offset calculations
  - Centered positioning using calculated `halfSize` value
- **New MainChartTooltip Component**:
  - Complete custom tooltip replacing default Recharts tooltip
  - Uses Next.js Image component for opponent logos
  - Prop-specific data display with conditional rendering
  - Professional card-style UI with borders and shadows
- **YAxis Configuration**: 
  - `domain={[0, 'auto']}` for proper scale alignment
  - Right margin increased to 10px for better spacing
- **Chart Container**: Increased from 300px to 380px height
- **Smart Interval Logic**: `interval={recentData.length > 40 ? 1 : 0}`
- **Files Updated**:
  - `ShotsDashboard.tsx` (Tooltip shows SOG + Corsi + Shifts + PP/5v5 breakdown)
  - `PointsDashboard.tsx` (Tooltip shows Points + Team Goals + Shifts + PP/5v5 breakdown)
  - `GoalsDashboard.tsx` (Tooltip shows Goals + SOG + Shifts + PP/5v5 breakdown)
  - `AssistsDashboard.tsx` (Tooltip shows Assists + Team Goals + Shifts + PP/5v5 breakdown)

#### User Experience Impact
- **Scales Perfectly**: Works beautifully with 10 games or 100 games
- **No Manual Adjustment**: System automatically adapts to dataset size
- **Professional Tooltips**: Rich, contextual information on hover with great design
- **Accurate Data**: Reference line and Y-axis perfectly aligned for precise analysis
- **Space Efficiency**: Taller charts make better use of available card space
- **Better Decision Making**: More data at a glance = faster prop evaluation

### Changed - NHL Prop Lab Statistics Display

#### Enhanced Stats Section
- **Replaced 3 stats with 5 comprehensive metrics**:
  1. **Hit Rate (%)**: Success percentage (e.g., 51%)
  2. **Hit Rate (Fraction)**: Wins/Total games (e.g., 39/77)
  3. **Average**: Mean value of the stat over filtered games
  4. **Implied Win %**: Calculated from best available odds
     - Positive odds: `100 / (odds + 100) × 100`
     - Negative odds: `|odds| / (|odds| + 100) × 100`
  5. **HR vs IW%**: Hit Rate minus Implied Win %
     - Green (+) = Better than market odds suggest
     - Red (−) = Worse than market odds suggest
     - Shows value opportunity at a glance

#### Visual Design
- Reduced gap from 8 to 6 for better fit with 5 stats
- Green highlighting for Hit Rate (%), Average, and positive HR vs IW%
- Red highlighting for negative HR vs IW%
- All stats horizontally aligned and vertically centered
- Dynamic calculations based on selected line and odds

#### Business Value
- Users can quickly identify +EV (positive expected value) bets
- Comparison against market expectations (implied probability)
- Full context: both percentage and fraction for hit rate
- Average provides baseline performance context

### Added - NHL Prop Lab Navigation Improvements

#### Ordered Prop Tabs
- **Fixed Order**: Prop tabs now appear in consistent order across all players
  - SOG, Goals, Ast, Pts, PP Pts, First Goal Scorer, Last Goal Scorer
- **Smart Availability States**:
  - **Available props** (with data + dashboard): White/grey text, clickable, hover effects
  - **Unavailable props** (no data or unimplemented): Dark grey (`text-gray-600`), non-clickable, cursor-not-allowed
  - **Active prop**: Green highlight with border-bottom
- **Unimplemented Props**: PP Pts, First Goal Scorer, Last Goal Scorer shown as disabled until dashboards are built
- **Dynamic Disabling**: Props automatically disabled if player has no data for that prop type
- **Prop Name Normalization**: Maps API prop names to display names
  - "Shots on Goal" / "Shots" → "SOG"
  - "Assists" → "Ast"
  - "Points" → "Pts"

#### UX Benefits
- Consistent navigation experience across all players
- Clear visual indication of available vs unavailable options
- Prevents clicks on unimplemented or unavailable features
- Maintains context with green highlight on current selection

### Fixed - NHL Prop Lab Player Props Display

#### Available Lines Integration
- **Fixed prop matching**: Changed from filtering by `kw_player_id` (which wasn't populated) to matching by `kw_player_name` from gamelogs
- **Corrected API field mapping**: 
  - Updated to use `O_U` field instead of `ou` for Over/Under matching
  - Changed `best_odds` to `price_american` for displaying American odds format
- **Player name matching**: Now correctly matches player names from gamelogs (`player_name`) with props API (`kw_player_name`)
- **Enhanced debugging**: Added console logs to track prop matching and help diagnose data issues
- **Data flow**: 
  1. Fetch player gamelogs to get player name
  2. Fetch all props from betting API
  3. Filter props by exact player name match (case-insensitive)
  4. Display available lines with correct bookmaker logos and odds

#### UI/UX Improvements
- **Integrated Line Selection**: The line display card is now the dropdown trigger itself
  - Click the green card to open dropdown and select different lines
  - ChevronDown icon added inside green border for clear interaction affordance
  - No separate dropdown component - cleaner, more intuitive interface
- **Multi-Book Display**: Shows all sportsbooks offering the same prop line
  - Dropdown displays all books with their individual odds for each line
  - Green card shows the best available odds across all books
  - Books sorted by odds (highest to lowest) within each line
  - Each book displayed with logo, line, and specific odds
- **Bookmaker Logo Mapping**: Added proper mapping function for bookmaker names to logo file paths
  - Fanatics → `Fanatics.jpeg`
  - BetRivers → `betriverslogo.png`
  - DraftKings → `DraftKingsLogo.png`
  - FanDuel → `fanDuel.jpg`
  - Pinnacle → `pinnacle_sports_logo.jpg`
  - BetMGM → `betmgm.png`
- **Visual Polish**: 
  - Bookmaker logos reduced by 50% (32x20px) for better proportions
  - Logos have rounded corners for softer appearance
  - Dropdown styled with dark theme (`bg-[#171717]`, `border-gray-700`)
  - Green hover states (`focus:bg-green-500/10`) for dropdown items
  - Selected line prominently displayed with best bookmaker logo, line value, and odds

#### Technical Details
- Props are now fetched from the `Player_Props_w_HR` BigQuery view via `/api/nhl/props`
- Matching uses trimmed, lowercase comparison for robust name matching
- Lines are grouped by value, with each line containing:
  - Array of all books offering that line
  - Best odds tracking across all books
  - Books sorted by odds (descending) for easy comparison
- Bookmaker logos loaded from `Public/Images/Sportsbook_Logos/` with proper error handling
- Data structure: `{ line, books[], bestOdds, bestBook }` for efficient rendering

### Changed - Global Design System Update

#### Border Radius Reduction (50% Across All Components)
- **Global Tailwind Configuration**: Reduced all border radius values by 50% for a sharper, more modern appearance
  - `card-outer`: 12px → 6px
  - `card-inner`: 8px → 4px
  - `button`: 8px → 4px
  - `input`: 8px → 4px
  - `modal`: 16px → 8px
- **Component Impact**: All cards, buttons, inputs, modals, and UI elements automatically inherit the new radius values
- **Visual Effect**: Creates a more refined, less "bubbly" appearance across the entire application

### Added - NHL Prop Lab Dashboard UI/UX Refinements

#### Visual Theme Consistency
- **Header & Filter Cards**: Updated to match the grey theme (`bg-[#171717]`, `border-gray-700`) used throughout the dashboard
- **Hover States**: Added subtle border-gray-600 hover effects for better interactivity feedback
- **Rounded Corners**: Standardized to `rounded-md` for consistent card styling

#### Filter System Improvements
- **Visual Grouping**: Period, Venue, and Rest filters now have matching rounded background containers (`bg-muted/10 border border-gray-700/50`) for clear visual hierarchy
- **Dropdown Selectors**: Converted Time and Day of Week filters to compact Select dropdowns (130px width) to save horizontal space
  - Removed extra background containers from dropdowns to reduce visual clutter
  - Dropdowns now have clean, minimal styling that doesn't compete with grouped filters
- **Reset Button**: Added a "Reset Filters" button with RotateCcw icon to quickly clear all filter selections
- **Consistent Styling**: All filter groups use `rounded-md` (6px) for uniform corner radius

#### Player Profile Enhancements
- **Position Format**: Wing positions now display as "LW" or "RW" instead of just "L" or "R" to differentiate from handedness
  - Added `formatPosition()` helper function to automatically append "W" for L/R positions
  - Center and Defensemen positions (C, D) remain unchanged
- **Better Clarity**: Users can now easily distinguish between Position (LW, RW, C, D) and Handedness (L, R)

#### Stats Display Improvements
- **Vertical Centering**: Fixed alignment of REG SZN PTS, GRAPH PTS, and HIT RATE stats
  - Changed from `text-center` with `mb-1` to `flex flex-col items-center justify-center` with `mb-2`
  - Stats now perfectly centered both horizontally and vertically for professional appearance

### Added - NHL Prop Lab Dashboard Enhancements
- **Advanced Filter System**: Three new filter layers added for more granular data analysis:
  - **Days Rest Filter**: Filter games by days between games (0D, 1D, 2D, 3D+)
  - **Game Time Filter**: Filter by time of day (Day, Afternoon, Night)
  - **Day of Week Filter**: Filter by specific day of the week (Mon-Sun)
  
- **Player Profile Enhancement**: Added position (Pos) and handedness (Hand) display in the header beside team abbreviation
  - Data sourced from new BigQuery fields added to `player_gamelogs_all_vw`
  - Displayed with bullet separators in clean, readable format

- **New Data Fields from BigQuery**:
  - `next_opponent`: 3-letter opponent abbreviation for upcoming game
  - `next_venue`: Shows "Home" or "Away" for next game
  - `days_rest`: Days between games (used in filtering)
  - `game_time_bucket`: Time bucket ("Day", "Afternoon", "Night")
  - `day_of_week`: Day of week (Monday-Sunday)
  - `Pos`: Player position
  - `Hand`: Player handedness (L/R)

### Technical Changes
- **API Compatibility**: API endpoint already supports all new fields via `SELECT *` from BigQuery view
- **Filter State Management**: Added three new independent filter states that work alongside existing time and venue filters
- **Filter Logic**: 
  - Days rest filter works as an exact match (except 3D+ which filters for >= 3)
  - Game time and day of week filters are case-insensitive with trim handling
  - All filters can be combined for complex queries
- **Performance**: Filter logic uses `useMemo` for efficient re-computation only when dependencies change

### UI/UX Improvements
- **Consistent Filter Design**: All new filters follow the same green accent style for active states
- **Responsive Layout**: Filters wrap properly on smaller screens with flex-wrap
- **Visual Hierarchy**: Clear label prefixes (Rest:, Time:, Day:) for each filter group
- **Compact Labels**: Abbreviated day names (Mon, Tue, etc.) for space efficiency

### Data Integration
- All new fields are automatically fetched from BigQuery's `player_gamelogs_all_vw`
- No changes needed to API endpoint (already using `SELECT *`)
- Fields are immediately available for filtering and display

## [1.0.0] - 2024-09-26

### Added
- **Project Initialization**: Complete Next.js 15 setup with App Router
- **Design System**: Custom Tailwind CSS v4 configuration with brand colors
- **Component Library**: Shadcn/ui components with custom styling
- **Theme Support**: Light/dark mode with next-themes integration
- **Responsive Layout**: Mobile-first design with sidebar navigation
- **Loading States**: Global loading screen with brand gradient animations
- **NFL Section**: Complete NFL dashboard with tools and stats
- **Prop Lab**: Advanced player prop analysis interface
- **Database Integration**: BigQuery and Supabase configuration
- **API Routes**: RESTful API endpoints for data fetching
- **TypeScript**: Full type safety with comprehensive type definitions
- **Documentation**: Complete README and setup instructions

### Technical Details
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 with custom design system
- **Database**: Google BigQuery for analytics data
- **Auth**: Supabase for user management
- **State**: Zustand for global state management
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Design System
- **Brand Colors**: Blue gradient (#5F85DB to #3B5B9A)
- **Typography**: Responsive scale (12px mobile, 16px desktop)
- **Spacing**: Consistent padding and margin system
- **Border Radius**: Outer radius = Inner radius + Padding rule
- **Touch Targets**: Minimum 44px for mobile accessibility

### Responsive Breakpoints
- **Mobile**: < 480px (portrait), < 768px (landscape)
- **Tablet**: < 834px (portrait), < 1024px (landscape)
- **Desktop**: < 1440px
- **Ultrawide**: > 1440px (maintains max-width)

### Performance
- **Loading States**: Skeleton loaders and progressive loading
- **Caching**: 1 hour API cache, 24 hour static data cache
- **Optimization**: Code splitting, lazy loading, image optimization
- **Bundle Size**: < 500KB initial load target

### Accessibility
- **WCAG 2.1 AA**: Color contrast and keyboard navigation
- **Mobile**: Touch targets and scalable text
- **Screen Readers**: Proper ARIA labels and focus management

### Security
- **Environment Variables**: Secure configuration management
- **API Protection**: Input validation and error handling
- **CORS**: Proper cross-origin resource sharing

## [Unreleased]

### Added
- **NHL Prop Lab Dashboard - Right Sidebar Components**: Added two new interactive components to the right of existing charts
  - **Player vs Opponent History**: Table showing historical performance vs opponents with per-game stats (G, A, P, SOG)
  - **Ice Rink Shot Location Map**: Interactive half-ice visualization with shot/goal plotting using NHL coordinates
  - API routes created for `Player_vs_Opp` and play-by-play data from `pbp_20242025` and `pbp_20252026` tables
  - Half-ice rink visualization with proper NHL dimensions (100ft x 85ft), blue lines, red circles, goal crease, faceoff spots
  - Filters for event types (goals, shots, missed, blocked) and view modes (dots, heat map)
  - Dashboard now uses full screen width (removed max-w-7xl constraint) with two-column grid layout
  - Created Table UI component for displaying opponent history data

- **NHL Prop Lab Dashboard - Professional Redesign 2.0** (Complete UI/UX Overhaul)
  
  - **Hero Section Redesign (Latest)** - PropsMadness-Inspired Layout:
    - **Prop Type Tabs**: Horizontal tabs at top instead of dropdown, green underline for active prop
    - **Player Info Section**: 80px headshot with team logo badge overlay, prominent player name
    - **Center Stats Display**: Three key metrics (Reg Season, Graph, Hit Rate) with green accents
    - **Available Lines Panel**: Right-side section showing top 3 betting lines with sportsbook logos
    - **Interactive Line Selection**: Click any line to update the dashboard, green highlight for active
    - **Sportsbook Logo Integration**: Displays logos from Public/Images/Sportsbook_Logos
    - Removed old dropdown selector and circular progress cards for cleaner layout
  
  - **Visual Refinements**:
    - Simplified chart color scheme: Green for hits, Red for misses (removed blue bars)
    - Updated circular progress empty ring to gray for better contrast
    - Compact hero section with reduced height and tighter spacing
    - Removed redundant "Last 10 Games" checkmark section
    - Green accent filter buttons matching Hot Streak banner style (bg-green-500/10 border-green-500/30)
  - **Performance Overview Section**: Complete redesign inspired by PropsMadness and professional betting dashboards
    - Circular progress indicator (120px) with animated stroke showing hit rate percentage
    - Color-coded performance: Green (≥60%), Blue (40-59%), Red (<40%)
    - Integrated "Last 10 Games" tracker with checkmark/X icons for visual hit/miss pattern
    - Average vs Line comparison with trending indicators (up/down arrows)
    - Best Odds display with bookmaker source
    - Single-line performance insight with emoji indicators (🔥 hot, ❄️ cold, 📊 steady)
    - Fully responsive layout that adapts from desktop to mobile
  
  - **Redesigned Header & Filters**: Professional, clean interface
    - Larger player headshot (64px) with team logo badge overlay
    - Clean typography with better spacing and hierarchy
    - Ghost-style filter buttons with smooth transitions
    - Visual separators between filter groups
    - Backdrop blur effects on cards for depth
    - Venue filter labels for better UX
  
  - **Theme-Aware Design**: Full light/dark mode support
    - All components use semantic color tokens (bg-card, text-foreground, border-border)
    - Proper contrast ratios for accessibility
    - Smooth theme transitions with tailwind dark: variants
    - Consistent opacity levels for backgrounds (card/50, green-500/20, etc.)
  
  - **Responsive Layout System**: Mobile-first, scalable design
    - Breakpoint system: sm (640px), md (768px), lg (1024px), xl (1280px)
    - Hero section: Stacks vertically on mobile, horizontal on desktop
    - Filter bar: Wraps gracefully on smaller screens
    - Charts grid: Single column mobile, two-column desktop
    - Sidebar: Below charts on mobile, side-by-side on xl screens
    - Proper spacing scale: p-4 (mobile) → p-6 (md) → p-8 (lg)
  
  - **Original Hero Stats Features** (from previous version):
    - Enlarged stats (5xl/4xl font sizes) with meaningful color coding
    - Hit Rate gets green (≥60%), blue (40-59%), or red (<40%) based on performance
    - Added mini sparkline visualization in Hit Rate card showing last 10 games
    - Recent performance indicators (e.g., "4/10 in last 10 games")
    - Dynamic arrow indicators showing avg vs line comparison
    - Smooth hover effects with shadow and border transitions on all stat cards
  
  - **Data Storytelling Layer**: Intelligent narrative insights above charts
    - Auto-generated performance analysis with "Hot Streak", "Cold Stretch", or "Neutral Form" indicators
    - Animated pulse dots for hot/cold status
    - Context-aware descriptions (e.g., "Hit in 7 of last 10 games — well above 0.5 points")
    - Overall performance rating (Strong/Solid/Weak) with stats breakdown
    - Venue split information and filter guidance
  
  - **Enhanced Color Logic System**: Performance-based chart colors
    - Green (#22c55e): Hot performance (well above average AND hits line)
    - Red (#ef4444): Cold performance (well below average AND misses line)
    - Blue (#5F85DB): Standard hit
    - Gray (#6b7280): Standard miss
    - Applied across all prop types (Goals, Assists, Points, Shots)
  
  - **Improved Spacing & Breathing Room**: Professional card layout
    - Increased padding from p-3 to p-5/p-6 across all cards
    - Larger card titles (text-base font-semibold instead of text-sm)
    - Increased chart heights (220px → 240px, 280px → 300px)
    - Better visual balance and whitespace throughout
  
  - **Enhanced Tooltips & Microinteractions**:
    - Redesigned CustomTooltip with rich context (opponent, date, stats)
    - Premium styling with shadows, borders, and better spacing
    - Smooth transitions (duration-200/300) on all card hover states
    - Subtle border color changes on hover (gray-700 → gray-600)
    - Blue glow shadow on hero stat cards
  
  - **Chart Variety**: Mixed visualization types
    - Maintained toggle between bar charts and line charts for rolling averages
    - Sparklines in hero stats for quick trend visualization
    - Bar charts for categorical comparisons
    - Line charts for trend analysis

### Fixed
- **NHL Prop Lab Dashboard Charts**: Standardized labels across all chart types (Goals, Shots, Assists, Points)
  - Added data labels to ALL bar charts including toggleable charts (Shots on Goal, High Danger Shots, Team Goals, 5v5 Points)
  - Added legends to charts that were missing them
  - Fixed X-axis label truncation/overlapping issues by adding angle={-45} and textAnchor="end" to all charts
  - Fixed "Goals by Situation" stacked chart to show total labels instead of individual segment labels
  - Added total labels to all stacked bar charts (Goals by Situation, SOG by Situation, Points by Situation, Shot Attempts by Danger, etc.)
  - Ensured consistent styling: labels in white (#f3f4f6) with 9px font size, angled X-axis labels for readability
  - Fixed legend styling consistency (11px font, proper padding)

### Planned Features
- Real-time data integration
- User authentication and preferences
- Advanced filtering and search
- Mobile app (React Native)
- Additional sports (MLB, NBA, NHL)
- Enhanced analytics tools
- Social features and sharing
- Push notifications
- Offline support

### Known Issues
- None at this time

### Breaking Changes
- None at this time

---

## Development Notes

### Code Standards
- TypeScript strict mode enabled
- ESLint with Next.js recommended rules
- Prettier for consistent formatting
- JSDoc for complex functions

### File Organization
```
src/
├── app/                    # Next.js App Router
├── components/            # React components
├── lib/                  # Utilities and configurations
├── hooks/                # Custom React hooks
├── stores/               # Zustand stores
└── types/                # TypeScript definitions
```

### Database Schema
- BigQuery tables for analytics data
- Supabase for user data and preferences
- Real-time subscriptions for live updates

### API Structure
- RESTful endpoints for data fetching
- Consistent error handling and responses
- Rate limiting and caching
- Type-safe request/response handling

---

**For more information, see the [README.md](README.md) file.**
