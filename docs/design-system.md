# Design System & Visual Identity

This document defines the core visual language, design tokens, typography, component styling, and aesthetic principles of Data Warsaw.

---

## 1. Design Philosophy

Data Warsaw embodies a **technical, analytical, and editorial aesthetic**. The visual direction communicates intellectual rigor, clarity, and bespoke craftsmanship rather than generic SaaS or corporate dashboard tropes.

---

## 2. Color Palette & Design Tokens

### Core Colors

| Token Name | Hex / CSS Value | Semantic Role | Usage Description |
| :--- | :--- | :--- | :--- |
| `--bg-base` / Dark Graphite | `#0b0c0e` | Primary canvas | Dark background for hero, experience map, and weather pulse sections. |
| `--ink` / Deep Carbon | `#111215` | Primary text / contrast | Base dark background and button label text on high-contrast accents. |
| `--paper` / Technical White | `#f7f6f1` | Primary light background & body text | Warm, non-glare off-white used for light section backgrounds and dark-section typography. |
| `--lime` / Acid Lime | `#c8ff3d` | Signature Accent | High-visibility signal accent for decision nodes, active states, key metrics, and brand marks. |
| `--lime-hover` | `#d5ff70` | Interactive Hover | Slightly lightened lime for interactive hover and focus rings. |
| `--line-dark` | `rgba(255, 255, 255, 0.12)` | Subtle Divider (Dark) | Grid lines, stage borders, and telemetry axes on dark surfaces. |
| `--line-light` | `rgba(0, 0, 0, 0.08)` | Subtle Divider (Light) | Subtle separators and table borders on light surfaces. |

---

## 3. Typography Hierarchy

The typographic system pairs high-contrast editorial serifs with crisp, precision monospaced annotations.

- **Headline Serif / Display:** Refined serif typography (`clamp(3.7rem, 7.3vw, 8rem)`) for heroic impact and editorial gravity.
- **Body & Copy:** Clean sans-serif with comfortable line height (`1.6`–`1.7`) and measured line lengths (`max-width: 650px`).
- **Technical & Monospace (`--mono`):** Monospace font for telemetry readings, axis labels, timeline steps (e.g. `01 Understand`), and data badges.

---

## 4. Spacing, Rhythm & Layout

- **Strong Whitespace:** Generous vertical section padding (`min-height: 800px`–`920px` on desktop) ensuring each analytical narrative has distinct breathing room.
- **Fine Grid System:** Background coordinate grid (`72px 72px` pattern at low alpha) reinforcing mathematical structure.
- **Border & Line Discipline:** Fine 1px borders with controlled alpha (`0.12`–`0.18`) rather than drop shadows or heavy box outlines.

---

## 5. Signature Acid-Lime Usage

Acid-lime (`#c8ff3d`) is used with strict economy:
- **Decision Node & Focal Point:** Signifies the convergence of complex signals into clear decisions.
- **Active Navigation & Metrics:** Highlights active tabs, current pulse status dot, and key analytical takeaways.
- **Call-to-Action Elements:** Primary button background (`.button-primary`) and identity marks.
- **Restraint Rule:** Never apply lime to large background blocks or broad text bodies; it exists as a high-precision focal signal.

---

## 6. Motion & Interaction Principles

- **Analytical & Restrained:** Motion exists solely to explain data relationships, provide tactile feedback, or guide attention.
- **Subtle Parallax:** Hero graph pointer parallax is damped ($k = 0.055$) with low amplitude, returning smoothly to neutral on pointer exit.
- **Scroll-Linked Continuity:** GSAP ScrollTrigger reveals elements on entry with delicate translateY translations and opacity fades.
- **Prefers-Reduced-Motion:** Fully disabled loops, zero-duration transitions, and immediate static rendering when reduced motion is requested.

---

## 7. Explicit Visual Anti-Patterns (Banned Styles)

- **No Generic SaaS Templates:** Avoid pill badges, generic purple/blue gradients, and startup card grids.
- **No Glassmorphism:** Never use blurred frosted-glass panels, thick white border highlights, or semi-transparent milky cards.
- **No Heavy Glow / Neon Blobs:** Avoid neon diffuse filters, bloom shaders, or decorative floating particles.
- **No Unnecessary Cards:** Content should breathe on canvas surfaces without nested rounded boxes.
- **No Bouncy / Flashy Animations:** Avoid springy elastic easing or unsolicited rotating 3D models.
