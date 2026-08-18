# Data Warsaw

> Turning complex data into clear insights, compelling visual stories, and actionable business decisions.

**Data Warsaw** is the personal portfolio and interactive data consultancy showcase of **Michał Domaradzki**, Senior Data Analyst and Storyteller based in Warsaw, Poland.

The website demonstrates analytical rigor and bespoke data visualization principles through bespoke interactive modules: a mathematical Canvas 2D hero graph with subtle spatial depth, an interactive commercial radar/experience map, an analytical methodology walk-through, and a live weather data pulse powered by Open-Meteo.

---

## Technology Stack

- **Markup & Styling:** Vanilla semantic HTML5 and modern CSS3 (Custom Properties, CSS Grid, Flexbox, 3D transform perspectives).
- **Core Scripting:** Modern vanilla JavaScript (ES6+) with zero build-step overhead.
- **Animation & Motion:** [GSAP (GreenSock Animation Platform)](https://greensock.com/) & [ScrollTrigger](https://greensock.com/scrolltrigger/) for smooth timeline sequencing and scroll-linked state orchestration.
- **Interactive Visualizations:**
  - **Hero Graph:** Custom projective Canvas 2D renderer with 3-layer depth planes, damped pointer-driven parallax, and animated decision node.
  - **Experience Map:** Interactive CSS/SVG multi-axis orbit radar exploring key analytical disciplines.
  - **Work in Practice:** Custom SVG commit activity matrix and public repository showcase backed by unauthenticated GitHub REST API.
  - **Warsaw Data Pulse (Decision Timeline):** Composite 24-hour analytical Decision Timeline plotting forecast metrics, derived outdoor suitability, and optimal window.
- **External APIs:**
  - [Open-Meteo API](https://open-meteo.com/) for live Warsaw forecast and atmospheric air quality (with deterministic local fallback).
  - [GitHub REST API](https://api.github.com/) for public repository activity and commit history (with session caching).

---

## Project Structure

```text
datawarsaw/
├── assets/                  # Static assets and vendor libraries
│   ├── favicon.svg          # Site icon
│   └── vendor/
│       └── gsap/            # Bundled GSAP and ScrollTrigger libraries
├── docs/                    # In-depth project documentation
│   ├── architecture.md      # Technical architecture and component lifecycles
│   ├── design-system.md     # Visual identity, typography, and palette specifications
│   ├── responsive-guidelines.md # Viewport standards and mobile design rules
│   ├── data-sources.md      # Open-Meteo API integration and fallback strategy
│   ├── decisions.md         # Architecture and design decision log (ADR)
│   ├── failures-and-lessons.md  # Historical lessons and confirmed edge cases
│   └── roadmap.md           # Current state and candidate enhancements
├── evals/                   # Quality assurance checklists
│   ├── responsive-checklist.md  # Breakpoint validation rubric
│   └── visual-regression-checklist.md # Visual fidelity and motion QA
├── AGENTS.md                # Project-specific AI agent guidelines and constraints
├── index.html               # Main single-page application markup
├── script.js                # Core application logic and visualization engines
├── styles.css               # Design system, layout, and responsive styles
└── README.md                # Project overview and developer guide
```

---

## Running Locally

The site requires no compilation, bundling, or package installation. Any static HTTP server can serve the directory:

### Using Python (Recommended)
```bash
# From the project root (C:\AI\datawarsaw)
python -m http.server 8081
```
Then open [http://localhost:8081/#top](http://localhost:8081/#top) in your browser.

### Using Node.js (Alternative)
```bash
npx serve -l 8081 .
```

---

## Agent Guidelines & Memory

- **Project-Specific Agent Instructions:** Consult [`AGENTS.md`](./AGENTS.md) for strict styling rules, responsive constraints, anti-patterns, and subagent response contracts.
- **Durable Documentation:** All persistent architectural principles, design guidelines, and failure logs are maintained inside the [`docs/`](./docs/) directory.
