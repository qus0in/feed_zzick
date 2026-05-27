/**
 * Hamster Feeder - Main Game Coordinator
 * Handles event registrations, decay loop ticks, difficulty selections, and score rules.
 */

// DOM Cache (Exclusive to core coordination, other UI elements cached in ui.js)
const gameArena = document.getElementById('game-arena');
const btnReset = document.getElementById('btn-reset');
const timingIndicator = document.getElementById('timing-indicator');
const itemPreview = document.getElementById('item-preview');

// Difficulty selectors & track zone elements
const diffEasy = document.getElementById('diff-easy');
const diffHard = document.getElementById('diff-hard');

// localStorage key for hi-score
const HISCORE_KEY = 'hamster_feeder_hiscore';
const HISCORE_NAME_KEY = 'hamster_feeder_hiscore_name';
const PLAYER_NAME_KEY = 'hamster_feeder_player_name';

// Feed cooldown state (blocks rapid-fire tap spam)
let feedCooldown = false;
const FEED_COOLDOWN_MS = 2000; // Longer lockout for hazard/intercept animations
const SUCCESS_FEED_COOLDOWN_MS = 1200;

// Tip Ticker Data — 쥐 말투 반영
const TIPS = [
  { icon: '🌻', text: '씨앗일 때 터치!' },
  { icon: '🎯', text: '경계 터치 보너스!' },
  { icon: '🐦', text: '참새 조심!' },
  { icon: '🔥', text: '고추는 피하기!' },
  { icon: '💫', text: '100%면 클리어!' },
  { icon: '⚠️', text: '0%면 가출!' },
  { icon: '🐹', text: '볼을 빵빵하게!' },
  { icon: '🌟', text: '어려움은 고득점!' },
  { icon: '🖱️', text: '화면을 터치!' }
];

/**
 * Handles Game Input: Seed Firing Launcher
 */
function handleArenaClick(e) {
  // Prevent launch if clicking card controllers or buttons
  if (e.target.closest('button')) return;

  // Block if game not active (modal open), happy, running away, or on cooldown
  if (!state.gameActive || state.mood === 'happy' || state.isRunningAway || feedCooldown) return;

  initAudio();
  
  // Calculate relative X/Y coordinate inside the gameArena
  const rect = gameArena.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  
  const seedY = Math.max(10, clickY - 20);
  
  // Block launching directly inside the hamster bounding space to prevent immediate clicks
  if (seedY > 230) return;
  
  const seed = new SunflowerSeed(clickX - 12, seedY); // Offset seed width/2
  state.activeSeeds.push(seed);
  startFeedCooldown(seed.type === 'seed' ? SUCCESS_FEED_COOLDOWN_MS : FEED_COOLDOWN_MS);
  
  if (feedHint.style.opacity !== '0') {
    feedHint.style.opacity = '0';
  }
}

/**
 * Activates the feed cooldown timer
 */
function startFeedCooldown(durationMs = FEED_COOLDOWN_MS) {
  feedCooldown = true;
  setTimeout(() => {
    feedCooldown = false;
  }, durationMs);
}

/**
 * Increments/Decrements fullness & updates mood checks
 * Requirement 2: 1/3 and 2/3 level balancing for fullness gain
 */
function feedHamster(amount) {
  if (state.mood === 'happy' && amount > 0) return; // Keep perfect satisfaction
  
  let modifiedAmount = amount;
  if (amount > 0) {
    // 1. Increment consecutive hits combo
    state.consecutiveHits += 1;
    
    if (state.fullness < 33.33) {
      // 1/3 Starvation Buff (Gain increases: e.g. 12 * 1.5 = 18)
      modifiedAmount = Math.round(amount * 1.5);
    } else if (state.fullness >= 66.67) {
      // 2/3 Fullness Resistance Penalty (Gain decreases: e.g. 12 * 0.65 = 8)
      modifiedAmount = Math.round(amount * 0.65);
    }
    
    // 2. Add combo satiety bonus (0 on first, up to +6 max)
    const comboBonus = Math.min(6, state.consecutiveHits - 1);
    if (comboBonus > 0) {
      modifiedAmount += comboBonus;
    }
    
    // 3. Visual feedback in timing track header
    const preview = document.getElementById('item-preview');
    if (preview && state.consecutiveHits > 1) {
      preview.innerText = `🔥 밥주기 ${state.consecutiveHits}연속 성공! (+${comboBonus} 가점)`;
      preview.style.color = '#FF9E9E';
      preview.style.borderColor = 'hsla(356, 100%, 81%, 0.6)';
    }
  } else if (amount < 0) {
    // Chili or damage: reset combo!
    state.consecutiveHits = 0;
  }
  
  state.fullness = Math.max(0, Math.min(100, state.fullness + modifiedAmount));
  updateUI();
  
  if (amount > 0) {
    triggerChew();
  }
  
  if (state.fullness >= 100) {
    setMood('happy');
    playHappySound();
    spawnConfetti();
    
    // Clear bonus score rewards
    state.score += (state.difficulty === 'easy' ? 1000 : 2500);
    updateUI(); // Redraw updated score
    
    // Show good ending screen
    triggerGoodEnding();
  }
}

/**
 * Satiety decay tick (Runs every 1.5 seconds)
 */
function runDecayTick() {
  // Skip entirely if game is not active (intro modal open) or in special states
  if (!state.gameActive) return;
  if (state.mood === 'happy' || state.mood === 'spicy' || state.mood === 'shocked') return;
  if (state.isRunningAway) return;
  
  // Hard mode decays noticeably faster overall
  const hardMult = state.difficulty === 'hard' ? 1.6 : 1.0;
  
  let decayAmount = 2.5 * hardMult; // Default average decay
  if (state.fullness < 33.33) {
    decayAmount = 1.0 * hardMult; // 1/3 level: decay slows (but still faster on hard)
  } else if (state.fullness >= 66.67) {
    decayAmount = 4.0 * hardMult; // 2/3 level: decay accelerates
  }
  
  state.fullness = Math.max(0, state.fullness - decayAmount);
  updateUI();
  
  if (state.fullness <= 0) {
    // Bad Ending: Hamster runs away!
    triggerBadEnding();
    return;
  }
  
  if (state.fullness < 30) {
    setMood('hungry');
  } else {
    setMood('idle');
  }
}

/**
 * Bad Ending: Hamster runs away when fullness hits 0
 */
function triggerBadEnding() {
  if (state.isRunningAway) return;
  state.isRunningAway = true;
  state.gameActive = false;
  
  // Stop crisis mode visuals
  document.body.classList.remove('crisis-mode');
  
  // Trigger turn-around + trot animation on the wrapper
  const wrapper = document.querySelector('.hamster-wrapper');
  if (wrapper) wrapper.classList.add('running-away');
  
  // Show bad ending overlay after hamster has trotted off screen (turn 0.4s + trot 1.1s = 1.55s)
  setTimeout(() => {
    const gameCard = document.getElementById('game-card');
    if (!gameCard) return;
    
    // Remove any existing overlay first
    const existingOverlay = document.getElementById('bad-ending-overlay');
    if (existingOverlay) existingOverlay.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'bad-ending-overlay';
    overlay.id = 'bad-ending-overlay';
    overlay.innerHTML = `
      <div class="be-emoji">🐹💨</div>
      <div class="be-title">햄쮝이가 가출해버렸다찌직...</div>
      <div class="be-subtitle">너무 배고파서 집을 나가버린다쮝 😢<br>다음에는 콩콩콩 더 자주 챙겨줘야 해다찌직!</div>
      <div class="be-score">🏆 최종 점수: ${state.score}점</div>
      <button class="be-btn" id="be-restart-btn">🔄 다시 한다찍</button>
    `;
    gameCard.appendChild(overlay);
    
    // Wire restart button → show intro modal
    const restartBtn = document.getElementById('be-restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        overlay.remove();
        showIntroModal();
      });
    }
  }, 1600);
}

/**
 * Good Ending: Show celebration overlay and save hi-score
 */
function triggerGoodEnding() {
  state.gameActive = false;
  // Save hi-score to localStorage
  const prevBest = parseInt(localStorage.getItem(HISCORE_KEY) || '0', 10);
  const isNewRecord = state.score > prevBest;
  if (isNewRecord) {
    localStorage.setItem(HISCORE_KEY, String(state.score));
    localStorage.setItem(HISCORE_NAME_KEY, state.playerName || '쮝집사');
  }
  updateHiscoreBadge();

  // Delay overlay slightly so confetti plays first
  setTimeout(() => {
    const gameCard = document.getElementById('game-card');
    if (!gameCard) return;

    const existingOverlay = document.getElementById('good-ending-overlay');
    if (existingOverlay) existingOverlay.remove();

    const diffLabel = state.difficulty === 'easy' ? '쉬움 🟢' : '어려움 🔴';
    const newRecordHtml = isNewRecord
      ? `<div class="ge-hiscore">🎉 NEW RECORD! 최고 기록 갱신!</div>`
      : `<div class="ge-hiscore">🌟 최고 기록: ${Math.max(prevBest, state.score)}점</div>`;

    const overlay = document.createElement('div');
    overlay.className = 'good-ending-overlay';
    overlay.id = 'good-ending-overlay';
    overlay.innerHTML = `
      <div class="ge-emoji">🐹✨</div>
      <div class="ge-title">볼이 빵빵해졌다찍!</div>
      <div class="ge-subtitle">[${diffLabel}] 모드 클리어찍!<br>햄쮝이가 빵빵해진 볼을 자랑하고 있다찌직 🥰</div>
      <div class="ge-score">🏆 최종 점수: ${state.score}점</div>
      ${newRecordHtml}
      <button class="ge-btn" id="ge-restart-btn">🔄 다시 한다찍</button>
    `;
    gameCard.appendChild(overlay);

    const restartBtn = document.getElementById('ge-restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        overlay.remove();
        showIntroModal();
      });
    }
  }, 800);
}

/**
 * Updates the hi-score badge in the stats panel from localStorage
 */
function updateHiscoreBadge() {
  const best = parseInt(localStorage.getItem(HISCORE_KEY) || '0', 10);
  const bestName = localStorage.getItem(HISCORE_NAME_KEY) || '쮝집사';
  const badge = document.getElementById('hiscore-badge');
  const val   = document.getElementById('hiscore-val');
  if (!badge || !val) return;
  if (best > 0) {
    val.innerText = `${bestName} ${best.toLocaleString()}점`;
    badge.style.display = 'inline-flex';
  }
}

/**
 * Sets game difficulty (updates state, speeds, visual gauges)
 */
function setDifficulty(diff) {
  state.difficulty = diff;
  
  if (diff === 'easy') {
    state.timingSpeed = 1.5;
  } else {
    state.timingSpeed = 1.9; // Adjusted from 2.3 to make Hard mode slightly more playable
  }
  
  // Update in-game difficulty badge
  const badge = document.getElementById('current-diff-badge');
  if (badge) {
    badge.style.display = 'inline-flex';
    badge.className = `current-diff-badge badge-${diff}`;
    badge.innerText = diff === 'easy' ? '쉬움 🟢' : '어려움 🔴';
  }
  
  state.lastTickTime = 1;
  handleReset();
}

/**
 * Rebuilds the timing track DOM elements and shuffles segments if Hard mode is active
 */
function rebuildTimingTrack() {
  const timingTrack = document.getElementById('timing-track');
  const timingIndicator = document.getElementById('timing-indicator');
  if (!timingTrack || !timingIndicator) return;
  
  // 1. Remove all old zone divs (keep only indicator)
  const oldZones = timingTrack.querySelectorAll('.zone');
  oldZones.forEach(z => z.remove());
  
  // 2. Generate layout based on difficulty
  if (state.difficulty === 'easy') {
    // Easy mode: Static Left-Bird (20%), Center-Seed (60%), Right-Bird (20%)
    state.trackLayout = ['bird', 'bird', 'seed', 'seed', 'seed', 'seed', 'seed', 'seed', 'bird', 'bird'];
    
    // Create static DOM elements
    const z1 = document.createElement('div');
    z1.className = 'zone zone-bird';
    z1.style.width = '20%';
    z1.innerText = '🐦';
    z1.title = '참새 영역 (20%)';
    
    const z2 = document.createElement('div');
    z2.className = 'zone zone-seed';
    z2.style.width = '60%';
    z2.innerText = '🌻';
    z2.title = '씨앗 안전 영역 (60%)';
    
    const z3 = document.createElement('div');
    z3.className = 'zone zone-bird';
    z3.style.width = '20%';
    z3.innerText = '🐦';
    z3.title = '참새 영역 (20%)';
    
    // Insert before indicator
    timingTrack.insertBefore(z1, timingIndicator);
    timingTrack.insertBefore(z2, timingIndicator);
    timingTrack.insertBefore(z3, timingIndicator);
  } else {
    // Hard mode: 10 segments. Template-based: [H, S, S, H, S, S, H, S, S, H]
    // Guarantees only Seed can be contiguous (length 2), other hazards are isolated (length 1), and ends are never seed!
    const hazards = ['bird', 'bird', 'bird', 'chili'];
    
    // Fisher-Yates Shuffle the 4 hazards
    for (let i = hazards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [hazards[i], hazards[j]] = [hazards[j], hazards[i]];
    }
    
    // Assemble the final array mapping exactly to the template
    const segments = [
      hazards[0], 'seed', 'seed',
      hazards[1], 'seed', 'seed',
      hazards[2], 'seed', 'seed',
      hazards[3]
    ];
    
    state.trackLayout = segments;
    
    // Render the 10 segments dynamically
    segments.forEach((type, index) => {
      const z = document.createElement('div');
      z.className = `zone zone-${type}`;
      z.style.width = '10%';
      
      if (type === 'seed') {
        z.innerText = '🌻';
        z.title = '씨앗 안전 영역 (10%)';
      } else if (type === 'bird') {
        z.innerText = '🐦';
        z.title = '참새 위험 영역 (10%)';
      } else if (type === 'chili') {
        z.innerText = '🔥';
        z.title = '고추 위험 영역 (10%)';
      }
      
      timingTrack.insertBefore(z, timingIndicator);
    });
  }
}

/**
 * Resets satiety score and moods (does NOT show intro modal — called internally)
 */
function handleReset() {
  initAudio();
  state.fullness = 50;
  state.isRunningAway = false;
  feedCooldown = false;
  
  // Reset score and combos
  state.score = 0;
  state.consecutiveHits = 0;
  
  // Remove any ending overlays if present
  ['bad-ending-overlay', 'good-ending-overlay'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
  
  // Remove runaway class from wrapper
  const wrapper = document.querySelector('.hamster-wrapper');
  if (wrapper) wrapper.classList.remove('running-away');
  
  // Rebuild/reshuffle timing track zones
  rebuildTimingTrack();
  
  // Clear any active seeds in air
  state.activeSeeds.forEach(seed => seed.destroy());
  state.activeSeeds = [];
  
  // Clear any active thief birds in sky
  state.activeBirds.forEach(bird => bird.destroy());
  state.activeBirds = [];
  
  setMood('idle');
  updateUI();
  
  if (state.chewTimeout) clearTimeout(state.chewTimeout);
  state.isChewing = false;
  if (hamsterSvg) hamsterSvg.classList.remove('chewing');
  
  if (feedHint) feedHint.style.opacity = '1';
  
  // Refresh hi-score badge display
  updateHiscoreBadge();
  
  // Freeze the game — will be unfrozen when difficulty is chosen in modal
  state.gameActive = false;
}

/**
 * Shows the intro modal and pauses the game
 */
function showIntroModal() {
  state.gameActive = false; // Freeze decay, gauge, and input
  const backdrop = document.getElementById('intro-modal-backdrop');
  if (backdrop) backdrop.classList.remove('hidden');
  
  // Load player name from localStorage
  const nameInput = document.getElementById('intro-name-input');
  if (nameInput) {
    nameInput.value = localStorage.getItem(PLAYER_NAME_KEY) || '쮝집사';
  }
}

/**
 * Physics Animation Frame Loop
 */
function gameLoop(timestamp) {
  // Update all seeds frame-by-frame
  state.activeSeeds.forEach((seed, index) => {
    seed.update();
    if (seed.isDead) {
      state.activeSeeds.splice(index, 1);
    }
  });

  // Update all bird interceptors frame-by-frame
  state.activeBirds.forEach((bird, index) => {
    bird.update();
    if (bird.isDead) {
      state.activeBirds.splice(index, 1);
    }
  });

  // Update timing gauge progress slider — only when game is active
  if (state.gameActive && state.mood !== 'happy' && !state.isRunningAway) {
    state.timingProgress += state.timingSpeed * state.timingDirection;
    if (state.timingProgress >= 100) {
      state.timingProgress = 100;
      state.timingDirection = -1;
    } else if (state.timingProgress <= 0) {
      state.timingProgress = 0;
      state.timingDirection = 1;
    }

    // Update DOM indicator position
    if (timingIndicator) {
      timingIndicator.style.left = `${state.timingProgress}%`;
    }

    // Update dynamic emoji item preview badge based on timing progress
    if (itemPreview && state.trackLayout && state.trackLayout.length > 0) {
      const idx = Math.min(9, Math.floor(state.timingProgress / 10));
      const type = state.trackLayout[idx];
      
      if (type === 'seed') {
        itemPreview.innerText = '🌻 맛있는 씨앗';
        itemPreview.style.color = '#705335';
        itemPreview.style.borderColor = 'rgba(255, 209, 102, 0.4)';
      } else if (type === 'bird') {
        itemPreview.innerText = '🐦 참새 조심!';
        itemPreview.style.color = '#58A6FF';
        itemPreview.style.borderColor = 'rgba(88, 166, 255, 0.4)';
      } else if (type === 'chili') {
        itemPreview.innerText = '🔥 고추 주의!';
        itemPreview.style.color = '#FF4D4D';
        itemPreview.style.borderColor = 'rgba(255, 77, 77, 0.4)';
      }
    }
  }

  requestAnimationFrame(gameLoop);
}

// Event Listeners Registration
if (gameArena) {
  gameArena.addEventListener('mousedown', handleArenaClick);
  gameArena.addEventListener('touchstart', (e) => {
    // Convert touch event to click geometry
    if (e.touches && e.touches[0]) {
      const fakeEvent = {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
        target: e.target
      };
      handleArenaClick(fakeEvent);
    }
  }, { passive: true });
}

// Reset button always shows intro modal first
if (btnReset) btnReset.addEventListener('click', () => {
  // If ending overlays are visible, clear them first then show modal
  ['bad-ending-overlay', 'good-ending-overlay'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
  showIntroModal();
});

// Initialize loops on startup
requestAnimationFrame(gameLoop);
setInterval(runDecayTick, 1500);

// Wire up intro modal difficulty buttons
const introBtnEasy = document.getElementById('intro-easy-btn');
const introBtnHard = document.getElementById('intro-hard-btn');

function startGameWithDifficulty(diff) {
  const backdrop = document.getElementById('intro-modal-backdrop');
  if (backdrop) backdrop.classList.add('hidden');
  
  // Set player name from text input
  const nameInput = document.getElementById('intro-name-input');
  if (nameInput) {
    const val = nameInput.value.trim() || '쮝집사';
    state.playerName = val;
    localStorage.setItem(PLAYER_NAME_KEY, val);
  }
  
  setDifficulty(diff);       // rebuilds track & resets state
  state.gameActive = true;   // Unfreeze — game is now live
}

if (introBtnEasy) introBtnEasy.addEventListener('click', () => startGameWithDifficulty('easy'));
if (introBtnHard) introBtnHard.addEventListener('click', () => startGameWithDifficulty('hard'));

// Show intro modal on first load (game starts paused until difficulty chosen)
showIntroModal();

// --- Tip Ticker Rotation ---
let tipIndex = 0;
function rotateTip() {
  const tipIconEl = document.getElementById('tip-icon');
  const tipTextEl = document.getElementById('tip-text');
  if (!tipIconEl || !tipTextEl) return;
  
  tipIndex = (tipIndex + 1) % TIPS.length;
  const tip = TIPS[tipIndex];
  
  // Force re-animation by replacing element clone
  const newTipText = document.createElement('span');
  newTipText.className = 'tip-text';
  newTipText.id = 'tip-text';
  newTipText.textContent = tip.text;
  tipTextEl.replaceWith(newTipText);
  tipIconEl.textContent = tip.icon;
}
setInterval(rotateTip, 4500);

// Load hi-score on startup
updateHiscoreBadge();
