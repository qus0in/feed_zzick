/**
 * Hamster Feeder - User Interface & Expression Controller
 * Manages hamster SVG face morphing, chewing cheek expansions, and status updates.
 */

// DOM Cache for UI elements
const hamsterSvg = document.getElementById('hamster-svg');
const progressBar = document.getElementById('progress-bar');
const moodBadge = document.getElementById('mood-badge');
const feedHint = document.getElementById('feed-hint');

// SVG Elements Cache (for morphing facial expressions)
const eyeLeftNormal = document.getElementById('eye-left-normal');
const eyeLeftHappy = document.getElementById('eye-left-happy');
const eyeLeftSpicy = document.getElementById('eye-left-spicy');
const eyeRightNormal = document.getElementById('eye-right-normal');
const eyeRightHappy = document.getElementById('eye-right-happy');
const eyeRightSpicy = document.getElementById('eye-right-spicy');
const mouthNormal = document.getElementById('hamster-mouth');
const mouthChewing = document.getElementById('hamster-mouth-chewing');
const mouthShocked = document.getElementById('hamster-mouth-shocked');

/**
 * Dynamically updates the cheek size (radius) and blush color
 * based on satiety (state.fullness) and chewing/mood animations.
 */
function updateCheekSize() {
  const cheekLeft = document.getElementById('cheek-left');
  const cheekRight = document.getElementById('cheek-right');
  if (!cheekLeft || !cheekRight) return;

  // 1. Determine Blush Color based on mood & fullness
  let blushColor;
  if (state.mood === 'spicy') {
    blushColor = 'hsl(260, 40%, 65%)'; // Sick hot purple
  } else if (state.mood === 'shocked') {
    blushColor = 'hsl(180, 50%, 78%)'; // Pale slate green
  } else if (state.mood === 'happy') {
    blushColor = 'hsl(356, 100%, 75%)'; // Glowing hot pink
  } else {
    // Blush gets pinker/warmer as fullness increases
    const sat = 50 + (state.fullness * 0.5); // 50% to 100%
    const light = 88 - (state.fullness * 0.13); // 88% to 75%
    blushColor = `hsl(356, ${sat}%, ${light}%)`;
  }
  cheekLeft.setAttribute('fill', blushColor);
  cheekRight.setAttribute('fill', blushColor);

  // 2. Determine Cheek Radius based on fullness & chew state
  // Base 11 → max 28 (from 0 to 100 fullness)
  const baseR = 11;
  let scaledR = baseR + (state.fullness * 0.17); // 11 to 28 based on fullness
  
  if (state.isChewing) {
    scaledR += 4; // Add extra chewing bloating pop
  }

  cheekLeft.setAttribute('r', scaledR);
  cheekRight.setAttribute('r', scaledR);
}

/**
 * Triggers mouth/cheek chewing animations
 */
function triggerChew() {
  state.isChewing = true;
  hamsterSvg.classList.add('chewing');
  
  mouthNormal.style.display = 'none';
  mouthChewing.style.display = 'block';

  updateCheekSize();

  if (state.chewTimeout) clearTimeout(state.chewTimeout);
  
  state.chewTimeout = setTimeout(() => {
    state.isChewing = false;
    hamsterSvg.classList.remove('chewing');
    
    if (state.mood !== 'happy') {
      mouthNormal.style.display = 'block';
      mouthChewing.style.display = 'none';
    }
    updateCheekSize();
  }, 1000);
}

/**
 * State Controller: Face morphing & dynamic labels
 */
function setMood(newMood) {
  if (state.mood === newMood) return;
  
  state.mood = newMood;
  
  // Reset SVGs to basic state
  eyeLeftNormal.style.display = 'block';
  eyeRightNormal.style.display = 'block';
  eyeLeftHappy.style.display = 'none';
  eyeRightHappy.style.display = 'none';
  eyeLeftSpicy.style.display = 'none';
  eyeRightSpicy.style.display = 'none';
  
  mouthNormal.style.display = 'block';
  mouthChewing.style.display = 'none';
  mouthShocked.style.display = 'none';
  
  hamsterSvg.classList.remove('happy');
  hamsterSvg.classList.remove('spicy-shake');
  progressBar.classList.remove('happy-bar');
  moodBadge.className = 'mood-badge';
  moodBadge.style.backgroundColor = ''; // Clear custom inline backgrounds
  
  if (newMood === 'happy') {
    hamsterSvg.classList.add('happy');
    progressBar.classList.add('happy-bar');
    moodBadge.classList.add('happy-badge');
    moodBadge.innerText = '빵빵해졌다쮝 ✨';
    
    // Switch to happy arched eyes SVG
    eyeLeftNormal.style.display = 'none';
    eyeRightNormal.style.display = 'none';
    eyeLeftHappy.style.display = 'block';
    eyeRightHappy.style.display = 'block';
    
    // Mouth open happy curve
    mouthNormal.setAttribute('d', 'M 143,165 Q 150,178 157,165');
  } 
  else if (newMood === 'hungry') {
    moodBadge.classList.add('hungry-badge');
    moodBadge.innerText = '배고파다쮝 😢';
    
    // Draw worried drop shape
    mouthNormal.setAttribute('d', 'M 142,168 Q 150,162 158,168');
  } 
  else if (newMood === 'spicy') {
    moodBadge.classList.add('hungry-badge');
    moodBadge.style.backgroundColor = '#FF4D4D';
    moodBadge.innerText = '매워서 킁킁킁 🔥';
    
    hamsterSvg.classList.add('spicy-shake'); // Adds funny shuddering body shake
    
    // Turn normal eyes off, show X-eyes
    eyeLeftNormal.style.display = 'none';
    eyeRightNormal.style.display = 'none';
    eyeLeftSpicy.style.display = 'block';
    eyeRightSpicy.style.display = 'block';
    
    // Hot gaping mouth shape
    mouthNormal.setAttribute('d', 'M 144,168 Q 150,158 156,168 Z');
  }
  else if (newMood === 'shocked') {
    moodBadge.classList.add('hungry-badge');
    moodBadge.style.backgroundColor = '#58A6FF';
    moodBadge.innerText = '도둑이다찌직 🐦';
    
    // Swap mouth to shocked circular path
    mouthNormal.style.display = 'none';
    mouthShocked.style.display = 'block';
  }
  else {
    // Normal Idle
    moodBadge.innerText = '대기중이다쮝 💤';
    mouthNormal.setAttribute('d', 'M 141,164 Q 145.5,170 150,164 Q 154.5,170 159,164');
  }

  // Update cheeks scale & color dynamically based on mood and fullness
  updateCheekSize();
}

/**
 * Updates progress bar percentage and attributes
 */
function updateUI() {
  const rounded = Math.round(state.fullness);
  progressBar.style.width = `${rounded}%`;
  progressBar.setAttribute('aria-valuenow', rounded);
  
  // Update real-time score display
  const scoreVal = document.getElementById('score-val');
  if (scoreVal) {
    scoreVal.innerText = state.score;
  }
  
  // 1. Reveal/hide stashed seeds based on fullness:
  //    - fullness >= 33.33% → show seeds proportionally (up to 10)
  //    - fullness <  33.33% → hide all seeds, emit dust motes instead
  const seedsVisible = state.fullness >= 33.33;
  for (let i = 0; i < 10; i++) {
    const seedEl = document.getElementById(`stash-seed-${i}`);
    if (seedEl) {
      // Map seed index to fullness range 33→100 (each seed = 6.67%)
      const seedThreshold = 33.33 + (i + 1) * 6.67;
      if (seedsVisible && state.fullness >= seedThreshold) {
        seedEl.style.opacity = '1';
        seedEl.style.transform = 'scale(1)';
      } else {
        seedEl.style.opacity = '0';
        seedEl.style.transform = 'scale(0)';
      }
    }
  }

  // Dust motes: randomly spawn when below 1/3 satiety
  if (!seedsVisible && !state.isRunningAway && state.mood !== 'happy') {
    if (Math.random() < 0.35) { // ~35% chance each updateUI call
      // Spawn near left stash area
      spawnDustMote(70, 248);
    }
    if (Math.random() < 0.25) {
      // Spawn near right stash area
      spawnDustMote(225, 248);
    }
  }

  // 2. Update dynamic cheek sizes and colors
  updateCheekSize();

  // 3. Update mouth shape and mood badge based on fullness (runs before setMood from decay)
  //    Thresholds deliberately lower so face changes AHEAD of the state labels
  if (state.mood !== 'happy' && state.mood !== 'spicy' && state.mood !== 'shocked') {
    if (state.fullness < 20) {
      // Deeply sad frown — reacts even earlier than old 30 threshold
      mouthNormal.setAttribute('d', 'M 142,170 Q 150,163 158,170');
      moodBadge.className = 'mood-badge hungry-badge';
      moodBadge.innerText = '너무 배고파다쮝 😭';
    } else if (state.fullness < 33) {
      // Worried mouth
      mouthNormal.setAttribute('d', 'M 142,168 Q 150,162 158,168');
      moodBadge.className = 'mood-badge hungry-badge';
      moodBadge.innerText = '배고파다쮝 😢';
    } else if (state.fullness >= 60) {
      // Soft satisfied smile — changed from 65 so it feels more responsive
      mouthNormal.setAttribute('d', 'M 143,165 Q 150,174 157,165');
      moodBadge.className = 'mood-badge';
      moodBadge.style.backgroundColor = 'hsl(43, 100%, 65%)';
      moodBadge.innerText = '배부르다찌직 ☀️';
    } else {
      // Normal idle closed mouth
      mouthNormal.setAttribute('d', 'M 141,164 Q 145.5,170 150,164 Q 154.5,170 159,164');
      moodBadge.className = 'mood-badge';
      moodBadge.style.backgroundColor = '';
      moodBadge.innerText = '대기중이다쮝 💤';
    }
  }
  
  // Toggle crisis class on body based on 1/3 satiety threshold
  if (state.fullness < 33.33) {
    document.body.classList.add('crisis-mode');
  } else {
    document.body.classList.remove('crisis-mode');
  }
}

/**
 * Spawns dust particles (motes) using standard DOM class transitions
 */
function spawnDustMote(x, y) {
  if (!gameArena) return;
  
  const mote = document.createElement('div');
  mote.className = 'dust-mote';
  mote.innerHTML = '💨';
  
  // Random horizontal/vertical sway inside arena boundaries
  const offsetRange = 32;
  const jitterX = x + (Math.random() * offsetRange - offsetRange / 2);
  const jitterY = y + (Math.random() * offsetRange - offsetRange / 2);
  
  mote.style.left = `${jitterX}px`;
  mote.style.top = `${jitterY}px`;
  
  // Custom animation properties
  const speed = 0.8 + Math.random() * 0.7;
  mote.style.animation = `dust-float ${speed}s cubic-bezier(0.1, 0.8, 0.3, 1) forwards`;
  
  gameArena.appendChild(mote);
  setTimeout(() => mote.remove(), speed * 1000);
}
