# Visual Design & System Architecture: 햄쮝이 밥죠 (Hamster Feeder)

This document defines the user interface guidelines, typography, color palette, responsive layout, and SVG asset specifications for the Hamster Feeding Game (햄쮝이 밥죠).

---

## 1. Color System (HSL-based)

We use curated, warm, and comforting HSL variables to establish a cute, premium, and cozy aesthetic. Avoid harsh primaries (pure reds, blues, or greens).

| CSS Variable | Color Spec | Hex Equivalent | Description |
| :--- | :--- | :--- | :--- |
| `--bg-grad-start` | `hsl(38, 60%, 98%)` | `#FDFBF7` | Ultra soft creamy backdrop |
| `--bg-grad-end` | `hsl(30, 40%, 93%)` | `#F5EBE0` | Warm sandy-beige bottom gradient |
| `--card-bg` | `hsla(0, 0%, 100%, 0.75)` | `rgba(255,255,255,0.75)`| Glassmorphism background blur card |
| `--card-border` | `hsla(28, 30%, 75%, 0.25)`| `rgba(202,189,176,0.25)`| Soft translucent card border |
| `--text-main` | `hsl(28, 45%, 25%)` | `#5C4033` | Deep warm chocolate-brown text |
| `--text-sub` | `hsl(28, 20%, 50%)` | `#9C8E82` | Muted slate brown for minor text |
| `--primary` | `hsl(356, 100%, 81%)` | `#FF9E9E` | Soft pastel coral pink (blush / buttons) |
| `--primary-hover`| `hsl(356, 95%, 75%)` | `#FF8F8F` | Active hover accent state |
| `--gold` | `hsl(43, 100%, 70%)` | `#FFD166` | Golden yellow for UI accents & full mood |
| `--seed-body` | `hsl(28, 30%, 35%)` | `#705335` | Rich chocolate seed base |
| `--seed-stripe` | `hsl(38, 40%, 88%)` | `#EFE6DD` | Striped detail lines for seeds |

---

## 2. Typography & Cards

- **Primary Font**: `OngleipParkDahyeon` (a beautiful handwritten-style Korean web font, loaded via projectnoonnu CDN). Falls back to `Comfortaa`, `Quicksand`, and general rounded system sans-serif families.
- **Card Styling**: Double-layered glass container:
  - `backdrop-filter: blur(20px) saturate(180%)`
  - `box-shadow: 0 8px 32px 0 rgba(142, 126, 110, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.8)`
  - Rounded corners: `32px` (`border-radius`) for an extremely friendly and welcoming appearance.

---

## 3. SVG Hamster Specification

The Hamster is rendered natively in a single `<svg>` inside the arena with a `viewBox="0 0 300 300"`. It is structured with semantic ID-based paths to allow direct morphing via CSS and JS:

```xml
<svg id="hamster-svg" viewBox="0 0 300 300" width="240" height="240">
  <!-- 1. Shadow -->
  <ellipse id="hamster-shadow" cx="150" cy="275" rx="80" ry="12" fill="hsla(28, 40%, 20%, 0.08)" />

  <!-- 2. Ears (Left & Right) -->
  <g id="hamster-ears">
    <!-- Outer Ears (Brown/Cream) -->
    <circle cx="90" cy="70" r="30" fill="hsl(28, 55%, 78%)" />
    <circle cx="210" cy="70" r="30" fill="hsl(28, 55%, 78%)" />
    <!-- Inner Ears (Pink) -->
    <circle cx="90" cy="70" r="18" fill="hsl(356, 100%, 88%)" />
    <circle cx="210" cy="70" r="18" fill="hsl(356, 100%, 88%)" />
  </g>

  <!-- 3. Body (Soft pear shape) -->
  <!-- Cute chubby cream body with brown patterns -->
  <path id="hamster-body" d="M 90,110 C 60,160 50,260 150,260 C 250,260 240,160 210,110 C 190,80 110,80 90,110 Z" fill="hsl(28, 65%, 88%)" />
  <!-- Cream Belly Patch -->
  <path id="hamster-belly" d="M 100,170 C 80,200 80,250 150,250 C 220,250 220,200 200,170 C 180,150 120,150 100,170 Z" fill="hsl(38, 60%, 98%)" />

  <!-- 4. Blush Cheeks (Responsive sizing on eat) -->
  <g id="hamster-cheeks">
    <circle id="cheek-left" cx="105" cy="180" r="18" fill="hsl(356, 100%, 84%)" opacity="0.85" />
    <circle id="cheek-right" cx="195" cy="180" r="18" fill="hsl(356, 100%, 84%)" opacity="0.85" />
  </g>

  <!-- 5. Eyes (With cute reflections, dynamic eyebrow morphing) -->
  <g id="hamster-eyes">
    <g id="eye-left-group">
      <circle id="eye-left" cx="115" cy="150" r="11" fill="hsl(28, 45%, 15%)" />
      <circle id="eye-left-highlight" cx="112" cy="147" r="3.5" fill="#FFFFFF" />
    </g>
    <g id="eye-right-group">
      <circle id="eye-right" cx="185" cy="150" r="11" fill="hsl(28, 45%, 15%)" />
      <circle id="eye-right-highlight" cx="182" cy="147" r="3.5" fill="#FFFFFF" />
    </g>
  </g>

  <!-- 6. Nose & Mouth -->
  <!-- Cute tiny nose -->
  <polygon id="hamster-nose" points="146,158 154,158 150,163" fill="hsl(356, 70%, 65%)" />
  <!-- Cute '3' cat-lips (Closed) -->
  <path id="hamster-mouth" d="M 140,166 Q 145,172 150,166 Q 155,172 160,166" fill="none" stroke="hsl(28, 45%, 25%)" stroke-width="2.5" stroke-linecap="round" />
  <!-- Invisible eating mouth target (Open mouth path defined in JS/CSS for morphing) -->

  <!-- 7. Hands & Paws -->
  <g id="hamster-paws">
    <circle cx="110" cy="225" r="9" fill="hsl(38, 60%, 98%)" stroke="hsl(28, 55%, 78%)" stroke-width="1.5" />
    <circle cx="190" cy="225" r="9" fill="hsl(38, 60%, 98%)" stroke="hsl(28, 55%, 78%)" stroke-width="1.5" />
  </g>
</svg>
```

---

## 4. State-Driven Animations & Moods

To make the hamster feel alive, the application uses CSS animations and JS transformations tied directly to state variables.

```
       [ Idle State ]  ---( Fullness decayed to < 30 )---> [ Hungry State ]
             |                                                    |
     (Click to spawn seed)                                (Click to spawn seed)
             |                                                    |
             v                                                    v
      [ Chewing State ] <-----------------------------------------+
             |
    (Increment fullness)
             |
             +---------( Fullness reaches 100% )---------> [ Happy State ]
                                                                  |
                                                           (Plays bounce & confetti)
```

### Mood Manifestations:
1. **Idle State**:
   - Eyes: Normal.
   - Blinking: Every 3 seconds (`scaleY` to `0.1` and back via keyframe).
   - Cheeks: Static scale 1.0.
   - Body: Slight breathing motion (`scaleY` from `1.0` to `1.02` at base).
2. **Hungry State** (`fullness < 30`):
   - Eyes: Slightly wider / drooping (using minor SVG offsets or eyebrow angles).
   - Mouth: Slightly open or flat line (`M 140,168 Q 150,172 160,168`).
3. **Chewing State** (Triggered for ~1.5s after eating seed):
   - Active cheeks: Scale pulsating (`1.0` -> `1.15` -> `1.0` dynamically).
   - Mouth: Swaps between small circle open and closed line to simulate chewing.
   - Sound / Particle: Small crumbs burst from the cheeks (JS particle effect).
4. **Happy State** (`fullness >= 100%`):
   - Eyes: Happy arches (drawn using `<path d="M 105,152 Q 115,140 125,152" />` for left/right eyes).
   - Blush cheeks: Bright pink, glowing slightly.
   - Body: Triggers `happy-bounce` keyframe (playful jumping up and down).

---

## 5. Seed Throwing Parabolic Arena

- Clicking anywhere within the **Feeding Arena** (dimensions: `320px` x `340px`) spawns a sunflower seed at the clicked coordinates.
- The seed is thrown in a beautiful parabolic arc towards the target point: the Hamster's mouth center.
- **Physics Variables**:
  - `Parabolic Trajectory`: Utilizes progressive parametric interpolation $p \in [0, 1]$ to smoothly guide the coordinates along a quadratic arc path.
  - `Throwing Arc Peak`: Dynamically scales with the throwing distance, causing longer throws to fly higher and closer throws to go in a shorter, swift curve.
  - `3D Perspective Depth`: Seeds start in the close foreground with a `scale(2.0)` transformation and shrink down to `scale(0.65)` as they fly away into the deep background towards the hamster's mouth.
  - `Depth-of-Field Camera Blur`: Incorporates a dynamic out-of-focus filter, beginning at `blur(3.5px)` close to the screen and sharpening fully to `blur(0px)` during flight to create a convincing illusion of depth.
  - `Angular Momentum`: Organic visual spinning representing aerodynamic drag.
- **Mouth Collision**:
  - Exactly at $p = 1$, the seed enters the mouth coordinates, triggering a cute crunch sound synthesis, spawning colorful crumb particles, and transitioning the hamster's cheeks into chewing states.

---

## 6. Failure States & Hazard Asset Specs

To maximize engagement and tactile comedy, we introduce two distinct, randomized visual fail states.

### A. The Thief Sparrow (`ThiefBird`)
*   **Design & Palette**: A cute, chubby sky blue sparrow Sparrow (`fill="hsl(200, 95%, 70%)"`) featuring a cream chest and a small orange beak (`polygon`).
*   **Micro-interactions**: Uses wing-flap keyframes scaling the wing vertically (`scaleY(1.0)` to `scaleY(0.1)`) at `0.15s` loops, conveying active flying drag.
*   **Hamster State Reaction**: Wide-open shocked circle mouth (`mouthShocked`) and pale cheeks (`fill="hsl(180, 50%, 78%)"`), visually communicating complete, comical distress.

### B. The Chili Pepper Bomb
*   **Design & Palette**: Curvy, hot red body (`fill="#FF4D4D"`) with a curved green stalk (`stroke="#4CAF50"`), matching the cute HCJ pastel styling.
*   **Hamster State Reaction**: Triggers X-shaped dizzy eyes (`eyeLeftSpicy`/`eyeRightSpicy`), gaping hot mouth, purple cheeks (`fill="hsl(260, 40%, 65%)"`), and triggers rapid shuddering shivers (`spicy-shake` CSS animation shaking the body at `0.12s` cycles).
*   **Particles**: Launches hot fire spark particles in deep gold, orange, and red.

---

## 7. Timing Slider Interface Specifications

To transition random luck into skill-based performance, the game introduces a cozy timing gauge bar.

### A. Color Spectrum Mapping (The Zones)
The slider bar (`timing-track`) is segmented into three colorful gradient bands representing possible projectiles:
1.  **Bird Zone (0% - 20%)**: Light blue gradient (`#74B9FF` to `#58A6FF`) representing the sparrow hazard.
2.  **Buffer Seed Zone (20% - 80%)**: Warm golden gradient (`#FFE082` to `#FFD166`) representing yummy sunflower seeds. This offers a generous $60\%$ safety padding.
3.  **Chili Zone (80% - 100%)**: Spicy hot red gradient (`#FF7675` to `#FF4D4D`) representing the chili pepper bomb.

### B. Dynamic Indicator & Preview Badge
*   **Indicator Pin**: A high-contrast circular white pin with a deep chocolate outline (`2.5px solid var(--text-main)`), adding visual depth via overlapping shadow rings.
*   **Preview Badge (`#item-preview`)**: Toggles color borders and dynamic texts in real-time, flashing blue warnings (`🐦 참새 조심!`), sweet gold prompts (`🌻 맛있는 씨앗`), or red alarm states (`🔥 고추 주의!`) so the player's eyes can track the launcher status effortlessly.
