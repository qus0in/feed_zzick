# Agent Skill: Hamster Feeding Mechanics

This skill outlines the computational geometry, physics, and rendering techniques required to manage the Hamster Feeding Game's core loops.

---

## 1. SVG Morphing Algorithms

To change the hamster's facial expressions dynamically without swapping raw assets, agents must perform node-based morphing via JavaScript or CSS variables.

### A. Chewing / Mouth Morphing Patterns
The hamster's mouth is an SVG `<path>` with ID `#hamster-mouth`.
- **Closed state**: Cute cat-like lips (`d="M 140,166 Q 145,172 150,166 Q 155,172 160,166"`)
- **Open eating state**: Circular shape (`d="M 145,170 Q 150,178 155,170 Q 150,166 145,170"`) or elliptical SVG element swapping.

#### Implementation Pattern:
```javascript
const mouthPath = document.getElementById('hamster-mouth');
const closedMouth = "M 140,166 Q 145,172 150,166 Q 155,172 160,166";
const openMouth = "M 145,166 A 5,5 0 1,1 155,166 A 5,5 0 1,1 145,166"; // Perfect circle

function setMouthState(isOpen) {
  mouthPath.setAttribute('d', isOpen ? openMouth : closedMouth);
}
```

### B. Happy Eye Morphing Patterns
- **Normal Eyes**: Circles (`#eye-left`, `#eye-right`) with highlight offsets.
- **Happy Arched Eyes**: Replace normal eyes with dynamic arches:
  - Left Eye Arch: `M 104,152 Q 115,140 126,152`
  - Right Eye Arch: `M 174,152 Q 185,140 196,152`
- **Toggling Visibility**: Toggle between `<circle>` elements and `<path>` elements using display classes (`d-none` / `svg-hidden`).

---

## 2. Parabolic Trajectory Interpolation

Each sunflower seed is spawned as an absolute-positioned DOM element inside the arena. Instead of dropping vertically, seeds are thrown in a dynamic parabolic arc from the clicked location towards the hamster's mouth relative coordinates.

### Trajectory Mathematics
We calculate the trajectory using a normalized progress ratio $p \in [0, 1]$ over a duration $T$ frames:

$$X(p) = X_{start} + (X_{target} - X_{start}) \cdot p$$
$$Y(p) = Y_{start} + (Y_{target} - Y_{start}) \cdot p - H \cdot \sin(\pi \cdot p)$$

Where $H$ represents the dynamic peak height computed relative to the horizontal throwing distance:

$$H = \max(50, |X_{target} - X_{start}| \cdot 0.4)$$

This guarantees that the seed flies up and drops perfectly into the hamster's mouth.

### Code Pattern:
```javascript
class SunflowerSeed {
  constructor(startX, startY) {
    this.startX = startX;
    this.startY = startY;
    this.progress = 0;
    
    // Duration and dynamic arc height calculation
    const distanceX = Math.abs(this.targetX - this.startX);
    this.duration = Math.max(30, Math.min(55, distanceX * 0.15 + 25));
    this.speed = 1 / this.duration;
    this.peakHeight = Math.max(50, distanceX * 0.4);
  }

  update() {
    this.progress += this.speed;
    if (this.progress >= 1) {
      this.triggerChomp();
      return;
    }
    
    const currentX = this.startX + (this.targetX - this.startX) * this.progress;
    const currentY = this.startY + (this.targetY - this.startY) * this.progress - this.peakHeight * Math.sin(Math.PI * this.progress);
    
    // Calculate 3D scale and out-of-focus blur over throwing path
    const currentScale = 2.0 + (0.65 - 2.0) * this.progress;
    const currentBlur = Math.max(0, 3.5 * (1 - this.progress * 1.3));
    
    this.element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(${currentScale}) rotate(${this.angle}deg)`;
    this.element.style.filter = `drop-shadow(0 ${4 * currentScale}px ${6 * currentScale}px rgba(0,0,0,0.15)) blur(${currentBlur}px)`;
  }
}
```

---

## 3. Dynamic Crumb Particle Systems

When a collision is registered, instantiating colorful, short-lived crumbs elevates the design premium.

### Instantiation Standard:
Create 8–12 tiny circular elements at the mouth center `(150, 170)` with randomized angle velocities ($\theta$) and launch them outwards:

```javascript
function spawnCrumbs(x, y) {
  const container = document.getElementById('game-arena');
  for (let i = 0; i < 8; i++) {
    const crumb = document.createElement('div');
    crumb.className = 'crumb-particle';
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 4 + 2;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity - 2; // Upward bias
    
    // Animate via JS or CSS transitions
    // ...
  }
}
```
Ensure that crumbs are fully removed from the DOM (`child.remove()`) within `800ms` to keep the heap size minimal.

---

## 4. Game Failure Mechanics & Interception Loops

To provide gameplay variety, we implement randomized hazards and swooping theft AI.

### A. Dynamic Bird Interception (10% Chance)
The bird (`ThiefBird`) spawns off-screen and tracks the coordinates of the target seed to trigger a collision mid-air:

1.  **Phase 1 (Progress < 0.5)**: Swoop towards seed. The bird position linearly interpolates between start $(X_{start}, Y_{start})$ and seed's instantaneous position $(X_{seed}, Y_{seed})$.
2.  **Phase 2 (Progress >= 0.5)**: Catch and flee. Triggers seed destruction, synthesizes high-pitch chirps, sets hamster mood to `'shocked'`, and interpolates the bird towards opposite escape boundaries.

### B. Chili Pepper Bomb Hazard (12% Chance)
*   Instead of sunflower seeds, a curved red chili pepper is fired.
*   **Chomp Action**: Decrements satiety by **`-10`**, launches hot fiery crumb particles (`spawnChiliParticles`), plays a dual-sawtooth alert alarm, and sets hamster mood to `'spicy'` (triggering cross-eyes and shuddering CSS shivers).

---

## 5. Physical Timing Gauge & Active Trajectory Mapping

Instead of pure RNG, the projectile type is determined by a moving indicator pin $P \in [0, 100]$.

### Indicator Kinematics
Every frame, the indicator sweeps back-and-forth using linear step calculation:

$$P_{new} = P + v \cdot d$$

Where $v$ is the slider velocity (`timingSpeed = 2.2`) and $d$ is the direction flag ($\pm 1$). When $P \ge 100$ or $P \le 0$, $d$ flips:

$$d_{new} = -d$$

### Boundary Mapping & Input Buffering
Upon mouse tap or click, the value $P$ is snapped instantly to select the launched projectile type:

*   **Left Bird Thief Zone**: $0 \le P < 20$ (20% width). Spawns seed type `'intercepted'`.
*   **Buffer Safe Seed Zone**: $20 \le P \le 80$ (60% width - generous buffer!). Spawns seed type `'seed'`.
*   **Right Chili Bomb Zone**: $80 < P \le 100$ (20% width). Spawns seed type `'chili'`.
