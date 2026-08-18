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
- **Base URL:** `https://api.open-meteo.com/v1/forecast`
- **Geographic Coordinates (Warsaw):**
  - Latitude: `52.2297`
  - Longitude: `21.0122`
  - Timezone: `Europe/Warsaw`
- **Requested Hourly Metrics:**
  - `temperature_2m` (Air temperature at 2 meters above ground, in °C)
  - `precipitation` (Hourly rainfall / snowfall liquid equivalent, in mm)

### Data Extraction & Ingestion Pipeline
1. **Fetch:** An asynchronous HTTP GET request is triggered during initialization (`fetchPulseData`).
2. **Parsing:** The engine extracts 24 sequential hourly intervals spanning the current time window.
3. **Timestamp Normalization:** Timestamps are formatted into human-readable hour markers (e.g. `14:00`, `17:00`) based on the client's local Warsaw offset.
4. **Rendering:** Data arrays are bound to the SVG/Canvas time-series chart, updating live indicators and scrub tooltip bounds.

### Resiliency & Fallback Strategy
- **Failure Conditions:** Network disconnection, CORS errors, HTTP rate limits, or API outages.
- **Fallback Dataset:** If the fetch fails or returns invalid schema data, the application immediately activates a deterministic baseline dataset of typical Warsaw seasonal weather patterns.
- **UI State Indication:**
  - Live data: `.is-ready` status indicator with pulse beacon.
  - Fallback data: `.is-fallback` status indicator gracefully informing the user without breaking layout or interactivity.
  - Zero fatal JavaScript exceptions or broken UI elements under any failure condition.

---

## 3. Data Assumptions

- **Timezone Assumption:** Meteorological observations and forecasts are aligned to `Europe/Warsaw` (CET/CEST).
- **Update Frequency:** Data is fetched once per page session or on manual refresh; no background polling spam is initiated.
- **Privacy:** Weather requests are entirely anonymous and do not transmit user geolocation or tracking telemetry.
