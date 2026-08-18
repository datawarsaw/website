# External Data Sources & API Integrations

This document outlines all external data sources, API integrations, payload structures, assumptions, and fallback mechanisms utilized by Data Warsaw.

---

## 1. Overview & Security Stance

Data Warsaw operates entirely on open-access, public APIs. **No private API keys, authentication tokens, credentials, or private customer data are stored, transmitted, or required.**

---

## 2. Open-Meteo Weather API

### Purpose
The Warsaw Data Pulse component displays live meteorological conditions and a 24-hour forecast for Warsaw, Poland, demonstrating real-time data ingestion, transformation, and responsive time-series visualization.

### Endpoint Details
- **Provider:** [Open-Meteo](https://open-meteo.com/) (Open-Source Weather API)
- **Weather URL:** `https://api.open-meteo.com/v1/forecast?latitude=52.2297&longitude=21.0122&hourly=temperature_2m,precipitation_probability,wind_speed_10m&timezone=Europe%2FWarsaw&forecast_hours=24`
- **Air Quality URL:** `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=52.2297&longitude=21.0122&hourly=european_aqi&timezone=Europe%2FWarsaw&forecast_hours=24`
- **Geographic Coordinates (Warsaw):**
  - Latitude: `52.2297`
  - Longitude: `21.0122`
  - Timezone: `Europe/Warsaw`
- **Requested Hourly Metrics:**
  - `temperature_2m` (Air temperature at 2 meters above ground, in °C)
  - `precipitation_probability` (Precipitation chance, in %)
  - `wind_speed_10m` (Wind speed at 10 meters, in km/h)
  - `european_aqi` (European Air Quality Index from CAMS ENSEMBLE)

### Data Extraction & Ingestion Pipeline
1. **Fetch:** Concurrent asynchronous HTTP GET requests for forecast and air quality triggered on entry.
2. **Parsing:** The engine extracts 24 sequential hourly intervals spanning the current time window.
3. **Derived Suitability:** Calculates `suitability = clamp(1 - (rainPenalty + aqiPenalty + windPenalty), 0, 1)` per hour.
4. **Decision Extraction:** Evaluates 22 candidate 3-hour sliding windows to identify optimal outdoor window.
5. **Rendering:** Binds data arrays to the 24-hour composite Decision Timeline SVG, combining the continuous suitability area, temperature trend, bounding 3-hour decision window, and an hourly 24-column raw-signal strip (Rain, Wind, AQI) with threshold friction indicators.

### Resiliency & Fallback Strategy
- **Failure Conditions:** Network disconnection, CORS errors, HTTP rate limits, or API outages.
- **Fallback Dataset:** If the fetch fails or returns invalid schema data, the application immediately activates a deterministic baseline dataset of typical Warsaw seasonal weather patterns.
- **UI State Indication:**
  - Live data: `.is-ready` status indicator with pulse beacon.
  - Fallback data: `.is-fallback` status indicator gracefully informing the user without breaking layout or interactivity.
  - Zero fatal JavaScript exceptions or broken UI elements under any failure condition.

---

## 3. GitHub REST API (Public & Unauthenticated)

### Purpose
Powers the **Work in Practice** section by loading live commit activity and project metadata directly from the public GitHub repository (`datawarsaw/website`).

### Endpoint Details
- **Repository Metadata:** `https://api.github.com/repos/datawarsaw/website`
- **Commit History:** `https://api.github.com/repos/datawarsaw/website/commits?per_page=100`
- **Authentication:** None (client-side unauthenticated). No API keys or tokens are stored or sent.

### Ingestion & Matrix Generation
1. **Session Caching:** Responses cached in browser `sessionStorage` (`dw_github_repo_v1`, `dw_github_commits_v1`) with 10-minute TTL to respect GitHub's 60 req/hr unauthenticated IP limit.
2. **Aggregation:** Group commit timestamps into daily counts and index the latest message per date.
3. **Activity Matrix:** Rendered into a responsive SVG grid (8 weeks on mobile <=480px, 12 weeks on tablet <=900px, 16 weeks on desktop) with discrete intensity levels (0, 1, 2, 3+ commits/day) in dark graphite and acid-lime, grouped accurately in the `Europe/Warsaw` timezone.
4. **Commit Ledger:** Displays the 5 most recent public commits with SHA badge, message, and date.

### Resiliency & Fallback Strategy
- **Fallback Mode:** If throttled (HTTP 403), disconnected, or malformed, the component:
  - Sets status to "Live GitHub activity unavailable" (`.is-fallback`).
  - Displays known static facts: repo `datawarsaw/website`, default branch `main`, language `JavaScript`, stack `HTML · CSS · JS · Canvas · GSAP`.
  - Renders an honest offline status placeholder without drawing a false grid of zero-activity cells (which misleadingly implies zero historical commits).
  - Hides the recent commit ledger.
  - Displays transparent fallback notice with direct link to GitHub.

---

## 4. Data Assumptions

- **Timezone Assumption:** Meteorological observations and forecasts are aligned to `Europe/Warsaw` (CET/CEST).
- **Update Frequency:** Data is fetched once per page session or on manual refresh; no background polling spam is initiated.
- **Privacy:** Weather requests are entirely anonymous and do not transmit user geolocation or tracking telemetry.
