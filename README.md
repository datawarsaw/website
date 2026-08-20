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
├── site/                    # Public website only; future /public_html/ deploy source
│   ├── index.html           # Main single-page application markup
│   ├── styles.css           # Design system, layout, and responsive styles
│   ├── script.js            # Core application logic and visualization engines
│   └── assets/              # Static assets and vendor libraries
│       ├── favicon.svg      # Site icon
│       └── vendor/
│           └── gsap/        # Bundled GSAP and ScrollTrigger libraries
├── agents/                  # AI harness agent contracts
├── skills/                  # Task-specific AI skills
├── state/                   # Harness task/progress templates
├── docs/                    # In-depth project documentation
├── evals/                   # Quality assurance checklists
├── AGENTS.md                # Project-specific AI agent guidelines and constraints
└── README.md                # Project overview and developer guide
```

`site/` is the only public deployment source. Everything inside it may be copied to the server's `/public_html/`. Development and AI-harness files outside `site/` must not be deployed.

---

## Running Locally

The site requires no compilation, bundling, or package installation. Serve the `site/` directory, not the repository root:

### Using Python (Recommended)
```powershell
cd C:\AI\datawarsaw\site
python -m http.server 8081
```
Then open [http://localhost:8081/#top](http://localhost:8081/#top) in your browser.

### Using Node.js (Alternative)
```bash
npx serve -l 8081 site
```

---

## Agent Guidelines & Memory

- **Project-Specific Agent Instructions:** Consult [`AGENTS.md`](./AGENTS.md) for strict styling rules, responsive constraints, anti-patterns, and subagent response contracts.
- **Durable Documentation:** All persistent architectural principles, design guidelines, and failure logs are maintained inside the [`docs/`](./docs/) directory.
