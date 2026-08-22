# Gemini Flash — Benchmark Implementation & Product Decisions

## Architectural Overview
This document records the design system choices, UX architecture, and engineering decisions implemented on the `benchmark/gemini-flash` branch for the Parallel Frontend Benchmark across 5 models.

## Scenario 1 — AI Workstation Benchmark
- **Data Fidelity:** Faithfully represented all 5 models (GPT-5.6 Luna, Grok 4.5, Grok 4.6, Gemini Flash, Ternary-Bonsai-27B) across Coding, Reasoning, UX, and Speed metrics.
- **Multiple Views:**
  1. **Ranked Metric Matrix View:** Interactive ranked horizontal performance bars with real-time sorting by metric and dynamic strongest-model highlight badges.
  2. **Multi-Dimensional Radar Chart:** Native Canvas/SVG multi-polygon radar comparing all 4 dimensions simultaneously with hoverable signal trajectories.
  3. **Head-to-Head Comparative Grid:** Detailed card matrix breaking down strengths, deployment tier, and composite index.
- **Interaction:** Dynamic metric filtering (Coding, Reasoning, UX, Speed, Composite), instant model highlight, keyboard accessible filters with ARIA live announcements.
- **Visual Design:** Strictly adheres to the Data Warsaw aesthetic: dark graphite background (`#0b1514`), acid-lime accents (`#c6ff3e`), monospace annotations, and high-precision analytical layout.

## Scenario 2 — Mobile Navigation & Responsive UX
- **Hamburger Toggle:** Crisp 2-line minimal button with hardware-accelerated transform into a close icon.
- **Navigation Overlay:** Fullscreen dark graphite drawer with high-contrast typography, large touch targets (min 48px), and smooth cubic-bezier transitions.
- **Accessibility & Focus Management:**
  - Traps focus inside open drawer.
  - `Escape` key dismisses drawer and returns focus to toggle button.
  - Clicking any navigation link immediately closes the drawer and smoothly scrolls to the target anchor.
  - Body scroll lock (`body.menu-open`) prevents background content scrolling and momentum bounce.
  - Validated across 375px, 390px, 430px, and 1440px desktop viewports with zero horizontal overflow.

## Scenario 3 — Model Comparison Explorer
- **Decision Engine:** Helps visitors select the optimal model based on specific workflow categories:
  - *Coding* -> GPT-5.6 Luna (Primary) & Grok 4.6 (Runner-up)
  - *Data Analysis* -> GPT-5.6 Luna (Primary) & Gemini Flash (Runner-up)
  - *Research* -> Grok 4.6 (Primary) & GPT-5.6 Luna (Runner-up)
  - *Fast Everyday Tasks* -> Gemini Flash (Primary) & Grok 4.5 (Runner-up)
  - *Private / Local Workloads* -> Ternary-Bonsai-27B (Primary, 100% on-device air-gapped)
- **Trade-off Analysis:** Surfaces concrete trade-offs (inference speed, reasoning depth, cost/token efficiency, cloud vs local air-gapped security).
- **Interactive States:** Category selector pills, Priority slider (Speed vs Reasoning vs Privacy), and comprehensive comparative cards showing fit percentages.

## Scenario 4 — Accessibility, Performance & Code Quality Pass
Three prioritized areas:
1. **Keyboard Accessibility & ARIA Announcements:** Added full keyboard navigation support across all interactive widgets (matrix tabs, radar views, simulation triggers) with `aria-live="polite"` announcements and visible `:focus-visible` outlines.
2. **Mobile Navigation Overlay & Touch Target Ergonomics:** Overhauled mobile header and nav drawer with focus trapping, ESC listener, scroll locking, and 48px minimum touch targets.
3. **Layout Stability, Passive Listeners & Containment:** Enforced CSS `contain: content`, throttled `requestAnimationFrame` listeners, explicit SVG/Canvas aspect ratios to guarantee 0 CLS, and full `prefers-reduced-motion` support.

## Scenario 5 — My AI Lab
- **Interactive Workstation Execution Sandbox:** Real-time client-side deterministic simulation of multi-agent and local inference workflows.
- **Task Selection:** Financial Variance Decomposition, Predictive Weather Heuristics, Real-time SQL Optimization, and Confidential Customer Cohort Clustering.
- **Engine Comparison:**
  - Cloud Hybrid Orchestration (Gemini Flash + GPT-5.6 Luna)
  - Local Air-Gapped Engine (Ternary-Bonsai-27B on local workstation VRAM)
  - Ultra-Fast Standalone (Gemini Flash)
- **Telemetry Visualizer:** Real-time animated pipeline execution trace displaying Latency (TTFT), Throughput (tok/sec), Cloud Egress (KB), and VRAM footprint.
- **Educational Annotations:** Clear, accessible explanations of local models, hybrid routing, and ternary quantization for non-experts.
