# Agent Master Playbook: 햄쮝이 밥죠 (Hamster Feeder)

Welcome, Agent. This repository houses **햄쮝이 밥죠 (Hamster Feeder)**, a micro-game built using a minimal vanilla HTML, CSS, and JS (HCJ) stack. This document outlines the constraints, folder structure, coding guidelines, and optimization expectations to ensure visual excellence and code cleanliness.

---

## 1. Project Directory Structure

Ensure that all modifications respect the established directory layout:

```
/Users/morgan/Development/are_you_vibe/
├── docs/                      # Production deployment folder (directly double-clickable!)
│   ├── index.html             # Core layout & SVG Hamster skeletal vector layers
│   ├── css/
│   │   ├── variables.css      # Fonts and HSL design system variables
│   │   ├── layout.css         # Reset rules, glass panels & controls
│   │   ├── arena.css          # Play arena, progress bars & timing track
│   │   ├── particles.css      # Seed projectile, crumbs & confetti particles
│   │   └── animations.css     # Breathing, chewing, blinking & shaking keyframes
│   └── js/
│       ├── state.js           # Single-source-of-truth game state
│       ├── audio.js           # Synthetic retro audio context oscillators
│       ├── particles.js       # Crumbs, chili sparks, and confetti explosions
│       ├── physics.js         # Parabolic throwing physics and Bird AI classes
│       ├── ui.js              # Hamster face expressions, chewing & status bar updates
│       └── app.js             # Timing gauge sweeps, loop intervals, DOM events
├── DESIGN.md                   # Visual design spec sheet
└── .agents/
    └── skills/
        └── hamster-feeder.md   # Math skills (parabolic projectile, bird swoop)
```

---

## 2. Technology Constraints & Guidelines

1. **Strict Vanilla Stack**: Do NOT introduce bundlers (Webpack, Vite), libraries (React, Vue), or styling frameworks (TailwindCSS) unless explicitly instructed by the user. Keep it simple, performant, and runnable instantly via double-clicking `docs/index.html`.
2. **Premium Visual Aesthetics (Vibe Coding)**:
   - Use HSL-based colors defined in `DESIGN.md`.
   - Never use standard primary colors. Everything should look warm, harmonious, and pastel-themed.
   - Maintain Glassmorphism on overlays and scoreboards.
   - Use Micro-animations: Hover transitions on buttons, smooth decay meters, and bounce feedbacks.
3. **Responsive SVG Standard**:
   - The hamster SVG utilizes precise ID nodes (e.g., `#hamster-mouth`, `#cheek-left`, `#eye-left-group`). 
   - Never replace or overwrite the SVG with hardcoded inline paths during updates unless you are expanding specific components. Always modify paths or trigger CSS animations through their dedicated IDs.
   - Keep the SVG viewBox `0 0 300 300` aspect-ratio scalable.

---

## 3. Standard Operating Procedures (SOP) for Agents

### Git Commit Messages
- Use the format `english-category:한글메시지` for future commits.
- Keep the English category concise, such as `docs`, `fix`, `feat`, `chore`, or `style`.
- Write the Korean message as a short, direct summary of the change.

### Modifying State & Logic in `docs/js/`
- Central state is in `state.js`. Main engine ticks run in `app.js`.
- Facial expression morphs and progress bar displays are handled in `ui.js`.
- Entity physical equations reside inside `physics.js`.
- Always throttle seed generation to prevent memory leaks from rapid clicks.

### Modifying Style in `docs/css/`
- Leverage CSS Variables (`--primary`, `--bg-grad-start`, etc.) at `variables.css`.
- Core styling resides in `layout.css`, `arena.css`, and `particles.css`.
- Keep animation keyframes organized inside `animations.css`.
- Do not inject inline styling via JavaScript. Always use CSS classes or CSS Custom Properties (Variables) to trigger dynamic UI updates.

---

## 4. Run & Test Locally
This project is directly runnable by opening `docs/index.html`.

If a local development server is needed for browser testing, use:
```bash
npx live-server
```
Navigate to the URL printed by `live-server` to inspect UI adjustments in real-time.
