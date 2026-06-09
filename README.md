# RaceTrace

RaceTrace is a premium Formula 1 dashboard that combines current championship data, personalized driver statistics, race schedules, upcoming Grand Prix details, news, and a simulated timing experience in one responsive application.

The application uses an Express API layer to normalize and validate data from external services before presenting it through a React dashboard. It is designed to remain usable when an upstream API is unavailable by using caching, archived data, and curated fallbacks.

## Features

### Personalized Onboarding

- Collects the user's name and favorite driver through a two-step welcome flow.
- Loads the current driver roster, team information, driver numbers, and championship positions from the API.
- Applies each driver's team color to the selection card.
- Persists the selected driver and user session in local storage.
- Allows the user to change their favorite driver from the dashboard header.

### Favorite Driver Dashboard

The favorite driver dashboard combines current-season and career statistics in a full-width, team-themed panel.

- Current championship position
- Current championship points
- Current-season race wins
- Current-season podiums
- Career race wins
- Career podiums
- World Drivers' Championships won
- Previous-season championship position
- Driver number, initials, full name, and team

Career data is retrieved through a dedicated server endpoint that consolidates multiple upstream API responses, validates the results, retries failed requests, and caches verified profiles.

### Championship Standings

- Driver standings with position, driver name, team, points, and relative progress.
- Constructor standings with position, team name, and points.
- Team-specific accent colors across driver and constructor rows.
- Horizontally aligned, responsive table layouts.
- Incremental loading for longer driver standings.
- A top standings ticker with driver names displayed in their team colors.

### Next Grand Prix

The upcoming-race panel provides a detailed race-weekend overview and a live countdown.

- Grand Prix name, round, circuit, country, and locality
- Race date and weekend date range
- Scheduled lap count
- Previous-season race winner
- Previous-season pole sitter
- Fastest lap or lap-record information
- Days, hours, minutes, and seconds countdown

Race metadata is enriched using the matching round from the previous season when the current-season schedule does not yet contain historical results.

### Race Calendar

- Full-width horizontal calendar for the complete season.
- Opens near the most recently completed race and the next scheduled race.
- Supports scrolling backward to past races and forward to future races.
- Distinguishes completed, upcoming, and next-race states.
- Includes round, circuit, location, date, and scheduled time.
- Uses a custom scrollbar styled for the RaceTrace interface.

### Timing Visualizer

- Selectable session view.
- Dynamic timing tower with driver positions, lap information, sector status, and time gaps.
- Highlights the selected favorite driver.
- Periodically updates to create a live timing-style experience.

The timing endpoint currently provides simulated dynamic data. It is not an official live Formula 1 telemetry feed.

### News

- Article-focused news section without image dependencies.
- Uses Gemini search grounding when a valid `GEMINI_API_KEY` is available.
- Falls back to locally curated articles when Gemini is unavailable or reaches its quota.
- Keeps the news area functional without requiring an AI API key.

### Theme and Visual Design

- Dark and light themes with a header toggle.
- Theme selection persisted in local storage.
- Neutral Electric White visual system with team-specific colors reserved for team and driver identity.
- Neon-yellow emphasis for personalized hero text and author attribution.
- Responsive layouts for desktop and mobile screens.
- Subtle transitions, hover states, progress accents, and status indicators.
- Uses Orbitron, Exo 2, JetBrains Mono, and Playfair Display typography.

### Progressive Web App

- Installable application manifest.
- Custom RaceTrace application icons and favicon.
- Standalone installed-app display mode.
- Service worker for production asset caching and an offline application shell.
- API requests are excluded from static caching to avoid displaying stale live data.

During local development, previously installed service workers are unregistered to prevent stale development assets.

## Data Sources and Reliability

RaceTrace uses a server-side API proxy to provide a consistent data model to the frontend.

### Primary Sources

- [Jolpica F1 API](https://api.jolpi.ca/ergast/f1) for schedules, standings, results, and historical driver data.
- Google Gemini with search grounding for optional news enrichment.

### Reliability Strategy

- Normalizes differing upstream response formats before returning data to the browser.
- Validates driver identifiers, driver numbers, standings, and career statistics.
- Uses verified active-driver championship history to avoid expensive upstream season-by-season queries and rate-limit failures.
- Retries selected failed requests.
- Uses a 10-minute in-memory API cache to reduce unnecessary upstream requests.
- Uses a temporary circuit breaker after Gemini quota or rate-limit failures.
- Loads dashboard modules independently so one failed request does not block the entire application.
- Uses archived or curated data when a live source is empty, unsupported, or unavailable.
- Includes current driver-number corrections when upstream roster data is outdated.

Fallback data keeps the interface available, but it may not represent the latest live championship state.

## API Endpoints

| Endpoint | Description |
| --- | --- |
| `GET /api/health` | Returns deployment health and integration configuration status. |
| `GET /api/f1/standings` | Returns normalized current driver and constructor standings. |
| `GET /api/f1/drivers/:driverId/career` | Returns verified current-season, career, championship, and previous-season statistics for a driver. |
| `GET /api/f1/calendar` | Returns the season calendar and enriched next-race metadata. |
| `GET /api/f1/news` | Returns grounded Gemini news or curated fallback articles. |
| `GET /api/f1/live-timing?session=Race` | Returns simulated dynamic timing data for the selected session. |

## Architecture

```text
Browser
  |
  |-- React dashboard
  |-- Local session and theme preferences
  |
Express server
  |
  |-- API normalization, validation, retries, and caching
  |-- Jolpica F1 API
  |-- Optional Gemini enrichment
  |-- Curated fallback data
  |
Vite middleware in development
Production static assets after build
```

The Express layer prevents external API schema differences and availability issues from leaking directly into frontend components. Dashboard requests use partial-failure handling so successful sections can render even if another API request fails.

## Technology Stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, TypeScript |
| Build tooling | Vite 6 |
| Server | Express 4, TSX |
| Styling | Tailwind CSS 4, custom CSS |
| Animation | Motion |
| Icons | Lucide React |
| AI enrichment | Google GenAI |
| Primary motorsport data | Jolpica F1 API |
| PWA | Web App Manifest, Service Worker |

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file from the example:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Optionally add a Gemini API key to `.env`:

   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

The application remains functional without `GEMINI_API_KEY`; news will use its curated fallback path.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | No | Enables Gemini-grounded news. |
| `GEMINI_MODEL` | No | Gemini model used for grounded news. Defaults to `gemini-2.5-flash`. |
| `APP_URL` | No | Public application URL used for hosted environments. |
| `PORT` | No | Express server port. Defaults to `3000`. |

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Express server with Vite middleware for development. |
| `npm run build` | Builds the frontend for Vercel and other static-host deployments. |
| `npm run build:standalone` | Builds the frontend and bundles the standalone Express server. |
| `npm run start` | Starts the bundled production server. |
| `npm run lint` | Runs TypeScript type checking without emitting files. |
| `npm run clean` | Removes generated build output. |

## Production Build

```bash
npm run build:standalone
npm run start
```

The production server serves the built frontend and the RaceTrace API routes from the same application.

## Deploying to Vercel

The repository includes `vercel.json` and a native Vercel catch-all Express function at `api/[...path].ts`.

1. Import the repository into Vercel.
2. Keep the detected framework preset as Vite.
3. Add `GEMINI_API_KEY` only if grounded news is required.
4. Optionally set `GEMINI_MODEL`; it defaults to `gemini-2.5-flash`.
5. Deploy the project.

Vercel runs `npm run vercel-build`, serves the Vite output from `dist`, routes `/api/*` requests to the Express function, and rewrites other application routes to `index.html`.

After deployment, verify:

```text
https://your-domain.vercel.app/api/health
https://your-domain.vercel.app/api/f1/standings
https://your-domain.vercel.app/api/f1/calendar
```

The health endpoint reports API availability and whether optional Gemini news enrichment is configured.

## Project Structure

```text
.
|-- components/          Dashboard sections and onboarding views
|-- public/              PWA manifest, service worker, and application icons
|-- App.tsx              Main application state and dashboard composition
|-- server.ts            Express API integrations, caching, and fallbacks
|-- local-server.ts      Local development and standalone production server
|-- index.css            Global theme, layout, and responsive styling
|-- index.html           Application entry document
|-- package.json         Scripts and dependencies
|-- vite.config.ts       Vite and Tailwind configuration
`-- .env.example         Environment variable template
```

## Local Data

RaceTrace stores only interface preferences and personalization data in the browser:

| Storage Key | Purpose |
| --- | --- |
| `racetrace_session_state` | Stores the user's name and selected favorite driver. |
| `racetrace_theme` | Stores the selected dark or light theme. |

Users can reset their selected driver through the dashboard controls.

## Branding

RaceTrace uses a custom application icon, a neutral high-contrast visual theme, and team colors for driver-specific and constructor-specific accents. The application includes the highlighted attribution line `Made By Anjan`.
