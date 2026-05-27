/**
 * Interactive Particle Exploder: Crumbs
 */
function spawnCrumbs(x, y) {
  const count = 10;
  for (let i = 0; i < count; i++) {
    const crumb = document.createElement('div');
    crumb.className = 'crumb-particle';
    
    // Setup randomize initial geometry
    crumb.style.left = `${x}px`;
    crumb.style.top = `${y}px`;
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 3.5 + 1.5;
    
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity - 1.5; // Upward launch bias
    
    gameArena.appendChild(crumb);
    
    let curX = x;
    let curY = y;
    let opacity = 1;
    let scale = 1;
    
    const animateCrumb = () => {
      curX += vx;
      curY += vy + 0.15; // Small gravity logic inside particle
      opacity -= 0.04;
      scale -= 0.03;
      
      if (opacity <= 0 || scale <= 0) {
        crumb.remove();
      } else {
        crumb.style.transform = `translate3d(${curX - x}px, ${curY - y}px, 0) scale(${scale})`;
        crumb.style.opacity = opacity;
        requestAnimationFrame(animateCrumb);
      }
    };
    
    requestAnimationFrame(animateCrumb);
  }
}

/**
 * Interactive Particle Exploder: Chili Spark Explosion
 */
function spawnChiliParticles(x, y) {
  const colors = ['#FF4D4D', '#FF9F43', '#FFC23C'];
  const count = 12;
  for (let i = 0; i < count; i++) {
    const fire = document.createElement('div');
    fire.className = 'crumb-particle';
    fire.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    fire.style.border = 'none';
    fire.style.left = `${x}px`;
    fire.style.top = `${y}px`;
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 4.5 + 2.5;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity - 2.0; // High launch bias
    
    gameArena.appendChild(fire);
    
    let curX = x;
    let curY = y;
    let opacity = 1;
    let scale = 1.3;
    
    const animateFire = () => {
      curX += vx;
      curY += vy + 0.12;
      opacity -= 0.04;
      scale -= 0.05;
      
      if (opacity <= 0 || scale <= 0) {
        fire.remove();
      } else {
        fire.style.transform = `translate3d(${curX - x}px, ${curY - y}px, 0) scale(${scale})`;
        fire.style.opacity = opacity;
        requestAnimationFrame(animateFire);
      }
    };
    
    requestAnimationFrame(animateFire);
  }
}

/**
 * Interactive Particle Exploder: Celebration Confetti (Happy 100% state)
 */
function spawnConfetti() {
  const colors = ['#FF9E9E', '#FFD166', '#FFCCD5', '#E9F5DB', '#C7F9CC'];
  const count = 40;
  
  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-particle';
    
    // Span randomly along the top of arena
    const x = Math.random() * gameArena.clientWidth;
    const y = -10;
    
    confetti.style.left = `${x}px`;
    confetti.style.top = `${y}px`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    gameArena.appendChild(confetti);
    
    let curX = x;
    let curY = y;
    const vx = Math.random() * 4 - 2;
    const vy = Math.random() * 3 + 2.5;
    let angle = Math.random() * 360;
    let opacity = 1;
    
    const animateConfetti = () => {
      curX += vx;
      curY += vy;
      angle += 5;
      opacity -= 0.015;
      
      if (opacity <= 0 || curY > 340) {
        confetti.remove();
      } else {
        confetti.style.transform = `translate3d(${curX - x}px, ${curY - y}px, 0) rotate(${angle}deg)`;
        confetti.style.opacity = opacity;
        requestAnimationFrame(animateConfetti);
      }
    };
    
    requestAnimationFrame(animateConfetti);
  }

  // Also spawn cute rising heart symbols from the hamster's chest
  for (let i = 0; i < 6; i++) {
    const heart = document.createElement('div');
    heart.className = 'heart-particle';
    heart.innerText = ['💖', '✨', '🌸', '🥰'][Math.floor(Math.random() * 4)];
    
    // Position at hamster chest center
    heart.style.left = '140px';
    heart.style.top = '190px';
    
    // Set random trajectory in CSS custom properties
    heart.style.setProperty('--dx', `${Math.random() * 120 - 60}px`);
    heart.style.setProperty('--dy', `-${Math.random() * 100 + 80}px`);
    heart.style.setProperty('--rot', `${Math.random() * 60 - 30}deg`);
    
    gameArena.appendChild(heart);
    setTimeout(() => heart.remove(), 1200);
  }
}

/**
 * Dust Motes: Floating dust that appears when stash area is empty (fullness < 33%)
 * Spawned periodically by ui.js updateUI when in low-satiety state.
 */
function spawnDustMote(baseX, baseY) {
  const arena = document.getElementById('game-arena');
  if (!arena) return;

  const mote = document.createElement('div');
  mote.className = 'dust-mote';

  // Random tiny size and warm grey color
  const size = Math.random() * 5 + 3; // 3–8 px
  const greyL = Math.floor(Math.random() * 20 + 55); // 55–75% lightness
  mote.style.width  = `${size}px`;
  mote.style.height = `${size}px`;
  mote.style.background = `hsl(30, 10%, ${greyL}%)`;

  // Spread around the given base coordinate
  const spawnX = baseX + (Math.random() * 40 - 20);
  const spawnY = baseY + (Math.random() * 20 - 10);
  mote.style.left = `${spawnX}px`;
  mote.style.top  = `${spawnY}px`;

  // Randomise animation duration & delay via CSS custom properties
  const dur   = (Math.random() * 0.8 + 1.4).toFixed(2); // 1.4 – 2.2 s
  const delay = (Math.random() * 0.5).toFixed(2);
  mote.style.setProperty('--dust-dur',   `${dur}s`);
  mote.style.setProperty('--dust-delay', `${delay}s`);

  arena.appendChild(mote);
  // Remove after animation finishes
  setTimeout(() => mote.remove(), (parseFloat(dur) + parseFloat(delay) + 0.1) * 1000);
}
